#!/usr/bin/env bash
# Deploy Vite build assets to remote server
# Usage: ./deploy-build.sh [remote_user@host]
# Example: ./deploy-build.sh vbosadmin@10.252.0.158
#
# Prerequisites on remote server (run once as root):
#   sudo chown -R vbosadmin:www-data /var/www/labour-mobility-registry/public/build
#   sudo chmod -R g+rw /var/www/labour-mobility-registry/public/build
#   sudo chmod g+s /var/www/labour-mobility-registry/public/build  # setgid so new files inherit group
#
# Or use sudo deploy: rsync to temp, then ssh "sudo rsync -a --delete ~/lmr-build-tmp/ $APP_PATH/public/build/"

set -e
REMOTE="${1:-vbosadmin@10.252.0.158}"
APP_PATH="/var/www/labour-mobility-registry"
BUILD_DIR="./public/build"
TMP_NAME="lmr-build-tmp-$$"

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "Build directory not found. Run 'npm run build' first."
  exit 1
fi

echo "Deploying build to $REMOTE:$APP_PATH/public/build/"
echo "Rsyncing to remote ~/$TMP_NAME/ (user home, writable)..."

rsync -avz --delete ./public/build/ "$REMOTE:~/$TMP_NAME/"

echo "Copying to app directory (requires sudo on remote)..."
ssh "$REMOTE" "sudo rsync -a --delete ~/$TMP_NAME/ $APP_PATH/public/build/ && rm -rf ~/$TMP_NAME"

echo "Deploy complete."
