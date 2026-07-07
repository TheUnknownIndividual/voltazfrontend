#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"

REMOTE_DIR="${REMOTE_DIR:-/voltaz}"
BUILD_DIR="$ROOT_DIR/dist"

: "${FTP_USER:?Set FTP_USER before running this script.}"
: "${FTP_PASS:?Set FTP_PASS before running this script.}"
: "${FTP_HOST:?Set FTP_HOST before running this script.}"

command -v npm >/dev/null || {
  echo "npm is required but was not found in PATH." >&2
  exit 1
}

command -v lftp >/dev/null || {
  echo "lftp is required but was not found in PATH." >&2
  exit 1
}

echo "Frontend remote directory: $REMOTE_DIR"
echo "Frontend API base URL: ${VITE_API_BASE_URL:-https://test.api.volt.az/api/}"

cd "$ROOT_DIR"

if [ -d node_modules ]; then
  echo "Installing dependencies with npm install..."
  npm install
else
  echo "Installing dependencies with npm ci..."
  npm ci
fi

echo "Checking TypeScript..."
npm run lint

echo "Building frontend..."
npm run build

if [ ! -d "$BUILD_DIR" ]; then
  echo "Build directory does not exist after npm run build: $BUILD_DIR" >&2
  exit 1
fi

echo "Upload preview:"
find "$BUILD_DIR" -maxdepth 2 -type f | sed "s#^$BUILD_DIR/##" | sort

echo "Mirroring build output to $FTP_HOST:$REMOTE_DIR..."
lftp -u "$FTP_USER","$FTP_PASS" "$FTP_HOST" <<LFTP_COMMANDS
set ftp:ssl-allow no
lcd "$BUILD_DIR"
mirror -R --only-newer --no-perms --verbose \
  --exclude-glob .git \
  --exclude-glob .git/** \
  --exclude-glob .github \
  --exclude-glob .github/** \
  --exclude-glob node_modules \
  --exclude-glob node_modules/** \
  --exclude-glob src \
  --exclude-glob src/** \
  --exclude-glob '*.ts' \
  --exclude-glob '*.tsx' \
  --exclude-glob '*.map' \
  --exclude-glob package.json \
  --exclude-glob package-lock.json \
  --exclude-glob vite.config.ts \
  --exclude-glob tsconfig.json \
  --exclude-glob README.md \
  . "$REMOTE_DIR"
bye
LFTP_COMMANDS

echo "Done."
