#!/usr/bin/env bash
# Solare — deploy from this git checkout to the web folder.
#
# Usage (on the server, inside the cloned repo):
#   ./deploy.sh ~/public_html                                   # cPanel
#   ./deploy.sh ~/web/solarejapan.com.lk/public_html            # Hestia
#
# Copies public/  -> <web folder>
#        private/ -> <web folder>/../private   (config.php and storage/ are never overwritten)
set -euo pipefail

WEB_DIR="${1:?Usage: ./deploy.sh /path/to/public_html}"
WEB_DIR="$(cd "$WEB_DIR" && pwd)"
PRIVATE_DIR="$(dirname "$WEB_DIR")/private"
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "→ Pulling latest code"
git -C "$REPO_DIR" pull --ff-only

echo "→ Public files  → $WEB_DIR"
rsync -a --exclude '.DS_Store' "$REPO_DIR/public/" "$WEB_DIR/"

echo "→ Private files → $PRIVATE_DIR"
mkdir -p "$PRIVATE_DIR/storage"
rsync -a --exclude 'config.php' --exclude 'storage/*' "$REPO_DIR/private/" "$PRIVATE_DIR/"
chmod 750 "$PRIVATE_DIR" "$PRIVATE_DIR/storage"

if [ ! -f "$PRIVATE_DIR/config.php" ]; then
  cp "$PRIVATE_DIR/config.example.php" "$PRIVATE_DIR/config.php"
  chmod 600 "$PRIVATE_DIR/config.php"
  echo
  echo "!! First deploy: edit $PRIVATE_DIR/config.php (SMTP host, password, secret) before using the form."
fi

echo "✓ Deployed $(git -C "$REPO_DIR" log -1 --format='%h %s')"
