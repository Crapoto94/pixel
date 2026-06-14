# 🕹️ PIXEL PANIC

Jeu d'anniversaire **rétro-arcade** pour **Vincent** — 7 joueurs, ~4 h 30, énigmes + grande enquête + gages légers + écran partagé interactif.

## Documentation
- 📖 [Scénario complet (la bible)](docs/SCENARIO.md) — histoire, rôles, déroulé minute par minute, rebondissements.
- 🎒 [Matériel & préparation](docs/MATERIEL.md) — liste de courses (fournitures de bureau).
- 🚀 [Déploiement Proxmox](docs/DEPLOIEMENT-PROXMOX.md) — LXC + Node + HTTPS sur `pixel.fbc.fr`.

## L'appli (dossier `server/`)
Serveur Node.js + temps réel (SSE). Trois interfaces :
- **`/borne`** — l'écran partagé (tablette) : intros, activités, scores, classement.
- **`/j/<token>`** — la page perso de chaque joueur (manette / buzzer / énigmes / gages).
- **`/gm`** — ton cockpit caché (Marc) pour piloter et dépanner.

### Lancer en local (test)
```bash
cd server
npm install
npm start
#   Borne  : http://localhost:8080/borne
#   GM     : http://localhost:8080/gm  (mot de passe dans config.js)
#   Joueur : http://localhost:8080/j/PXL-WLLY-2310
```

### Générer les QR codes (à imprimer)
```bash
cd server
npm run qr            # utilise les tokens de config.js
npm run qr -- --rotate   # régénère des tokens aléatoires (à reporter dans config.js)
#   → images dans server/qr/
```

### Configurer
Tout est dans **`server/config.js`** : joueurs, avatars, tokens, URL publique, mot de passe GM.
Contenu du jeu : `server/data/` (avatars, gages, mondes).

## Statut
✅ Moteur de jeu, 3 interfaces, SSE temps réel, 6 mondes, **grande enquête (Monde 5)** dont la résolution ouvre le boss, twist Game Master de Vincent (pouvoirs gardés jusqu'à la fin), activités BORNE (réaction / blind-test / quiz / spotlight / roue / piano réparti / boss), gages, défis photo, QR codes, sauvegarde auto. Testé : démarre et répond.

🔜 À affiner ensemble : énigmes définitives selon ton lieu, cartes-avatars à imprimer, sons/musiques de la borne, contenu blind-test metal.
