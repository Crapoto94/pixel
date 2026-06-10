# 🚀 Déploiement de PIXEL PANIC sur Proxmox

> Objectif : faire tourner l'appli dans un **conteneur LXC** (léger, idéal ici) et l'exposer en HTTPS sur `https://pixel.fbc.fr`.
> Temps estimé : ~30 min. On reste sur du simple et robuste.

---

## Pourquoi LXC plutôt que VM ?
L'appli est un petit serveur Node mono-process, sans dépendance système exotique. Un **LXC Debian 12** consomme ~80 Mo de RAM au repos vs ~1 Go pour une VM. Plus rapide à démarrer, plus facile à sauvegarder. (Si tu préfères une VM, la procédure « Node + systemd » est identique à partir de l'étape 3.)

---

## 1. Créer le conteneur LXC

Dans l'interface Proxmox → **Create CT** :
- **Template** : `debian-12-standard`
- **Cores** : 1 · **RAM** : 512 Mo · **Disk** : 4 Go (large)
- **Network** : IP statique (ex. `192.168.1.50/24`, passerelle `192.168.1.1`) — note l'IP, on en aura besoin.
- **Unprivileged container** : ✅ oui
- Démarre le CT, puis ouvre sa console (ou `pct enter <vmid>` depuis l'hôte Proxmox).

---

## 2. Préparer le système (dans le LXC)

```bash
apt update && apt upgrade -y
apt install -y curl git
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v   # doit afficher v20.x
```

---

## 3. Déployer l'application

```bash
mkdir -p /opt/pixel-panic
# --- Option A : copier le dossier server/ depuis ton PC (scp / WinSCP) ---
#   scp -r server/* root@192.168.1.50:/opt/pixel-panic/
# --- Option B : git clone si tu l'as poussé sur un repo ---

cd /opt/pixel-panic
npm install --omit=dev
```

Édite la config avant le grand soir :
```bash
nano /opt/pixel-panic/config.js
#   - publicUrl : 'https://pixel.fbc.fr'
#   - gmPassword : METS UN VRAI MOT DE PASSE
#   - vérifie les tokens des joueurs (ou régénère : npm run qr -- --rotate)
```

Test rapide :
```bash
node server.js
#   → "PIXEL PANIC en ligne" ; Ctrl-C pour arrêter
```

---

## 4. Service systemd (démarrage auto + redémarrage si crash)

```bash
cat > /etc/systemd/system/pixel-panic.service <<'EOF'
[Unit]
Description=PIXEL PANIC
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/pixel-panic
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=2
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now pixel-panic
systemctl status pixel-panic   # doit être "active (running)"
```

L'appli écoute maintenant sur `http://192.168.1.50:8080`. Teste depuis ton PC : `http://192.168.1.50:8080/borne`.

---

## 5. Exposer en HTTPS sur `pixel.fbc.fr`

L'appli sert du **SSE** (flux temps réel) : il faut un reverse-proxy qui **ne bufferise pas**. Deux options simples.

### Option recommandée — Caddy (HTTPS auto, config minimale)
Dans un LXC (le même ou un dédié « proxy ») :
```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy.list
apt update && apt install -y caddy
```
`/etc/caddy/Caddyfile` :
```
pixel.fbc.fr {
    reverse_proxy 192.168.1.50:8080 {
        flush_interval -1   # indispensable pour le SSE (pas de buffering)
    }
}
```
```bash
systemctl reload caddy
```
Caddy obtient le certificat Let's Encrypt tout seul. ✅

### Si tu utilises déjà Nginx Proxy Manager
Ajoute un **Proxy Host** : domaine `pixel.fbc.fr` → `192.168.1.50:8080`, onglet SSL → *Request a new certificate*. Puis onglet **Advanced**, colle :
```
proxy_buffering off;
proxy_cache off;
proxy_set_header Connection '';
proxy_http_version 1.1;
```

---

## 6. DNS

Chez le registrar de `fbc.fr`, crée un enregistrement :
```
pixel   A   <IP publique de ta box>     (ou CNAME si tunnel/dynamique)
```
+ ouvre/redirige les ports **80 et 443** vers ton reverse-proxy (NAT box). Si IP dynamique, un DNS dynamique (DuckDNS/Cloudflare) fait l'affaire.

> 💡 **Sans exposition Internet** : tu peux tout faire en **réseau local** ! Mets `publicUrl: 'http://192.168.1.50:8080'` dans `config.js`, régénère les QR (`npm run qr`), et assure-toi que tous les téléphones sont sur ton WiFi. Plus simple et zéro DNS — parfait si la fête est chez toi.

---

## 7. Le jour J — check-list

1. `systemctl status pixel-panic` → running.
2. Ouvre la **BORNE** sur la tablette : `https://pixel.fbc.fr/borne` (plein écran, garde l'écran allumé).
3. Ouvre la **page GM** sur TON téléphone : `https://pixel.fbc.fr/gm` (mot de passe).
4. Imprime / affiche les **QR joueurs** (`server/qr/joueur-*.png`).
5. Bouton **RESET** sur la page GM pour repartir d'une partie propre.
6. Les invités scannent → se mettent **PRÊT** → tu cliques **DÉMARRER**. 🎬

---

## Dépannage
- **La borne ne se met pas à jour** → c'est le buffering du proxy : vérifie `flush_interval -1` (Caddy) / `proxy_buffering off` (Nginx).
- **« Token invalide »** → le token du QR ne correspond plus à `config.js` (régénéré ?). Refais `npm run qr` après toute modif.
- **Repartir de zéro** → page GM → RESET, ou `rm /opt/pixel-panic/save.json && systemctl restart pixel-panic`.
- **Logs** → `journalctl -u pixel-panic -f`.
