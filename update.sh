#!/usr/bin/env bash
# =====================================================================
#  Mise à jour de PIXEL PANIC sur le serveur.
#  Usage (dans le conteneur, en root) :  bash /opt/pixel-panic/update.sh
# =====================================================================
set -e
cd "$(dirname "$0")"

echo "⬇️   Récupération du code depuis GitHub..."
git fetch origin
# On force l'alignement sur le remote : seuls les fichiers SUIVIS sont touchés.
# save.json (état de partie) est gitignoré et les photos uploads/ sont non suivies
# → tout cela reste intact, même en pleine soirée.
git reset --hard origin/main

echo "📦  Vérification des dépendances..."
cd server
npm install --omit=dev --no-audit --no-fund

echo "🔄  Redémarrage du service..."
systemctl restart pixel-panic
sleep 2

if systemctl is-active --quiet pixel-panic; then
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/borne || echo "???")
  echo "✅  À jour et en ligne (borne -> HTTP $code)."
else
  echo "❌  Le service n'est pas actif. Logs :"
  journalctl -u pixel-panic -n 20 --no-pager
  exit 1
fi
