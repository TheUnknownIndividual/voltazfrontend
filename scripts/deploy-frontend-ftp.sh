#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"

REMOTE_DIR="${REMOTE_DIR:-/voltaz}"
SKIP_PRERENDER="${SKIP_PRERENDER:-0}"
SKIP_SITEMAP="${SKIP_SITEMAP:-0}"

: "${FTP_USER:?Set FTP_USER before running this script.}"
: "${FTP_PASS:?Set FTP_PASS before running this script.}"
: "${FTP_HOST:?Set FTP_HOST before running this script.}"

case "$SKIP_PRERENDER" in
  0|1) ;;
  *)
    echo "SKIP_PRERENDER must be 0 or 1." >&2
    exit 1
    ;;
esac

case "$SKIP_SITEMAP" in
  0|1) ;;
  *)
    echo "SKIP_SITEMAP must be 0 or 1." >&2
    exit 1
    ;;
esac

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
echo "Frontend prerender: $([ "$SKIP_PRERENDER" = "1" ] && echo disabled || echo enabled)"
echo "Frontend sitemap refresh: $([ "$SKIP_SITEMAP" = "1" ] && echo disabled || echo enabled)"

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

DEPLOY_TEMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/volt-frontend-deploy.XXXXXX")"
BUILD_DIR="$DEPLOY_TEMP_DIR/dist"

cleanup() {
  rm -rf -- "$DEPLOY_TEMP_DIR"
}
trap cleanup EXIT

if [ "$SKIP_SITEMAP" = "1" ]; then
  echo "Skipping sitemap refresh for this deployment..."
else
  echo "Generating sitemap..."
  npm run sitemap
fi

echo "Building isolated frontend output..."
npx vite build --outDir "$BUILD_DIR"

if [ "$SKIP_PRERENDER" = "1" ]; then
  echo "Preparing SPA-only routing..."
  BUILD_DIR="$BUILD_DIR" node scripts/prepare-spa-web-config.mjs
else
  echo "Prerendering frontend..."
  BUILD_DIR="$BUILD_DIR" node scripts/prerender-seo.mjs
fi

if [ ! -d "$BUILD_DIR" ]; then
  echo "Build directory does not exist after the frontend build: $BUILD_DIR" >&2
  exit 1
fi

if [ ! -f "$BUILD_DIR/index.html" ] || [ ! -f "$BUILD_DIR/web.config" ] || [ ! -d "$BUILD_DIR/assets" ]; then
  echo "Build output is incomplete; refusing to upload." >&2
  exit 1
fi

if grep -q '__PRERENDER_DIR__' "$BUILD_DIR/web.config"; then
  echo "Build output contains an unresolved prerender placeholder; refusing to upload." >&2
  exit 1
fi

echo "Upload preview:"
find "$BUILD_DIR" -maxdepth 2 -type f | sed "s#^$BUILD_DIR/##" | sort

echo "Mirroring build output to $FTP_HOST:$REMOTE_DIR..."
lftp -u "$FTP_USER","$FTP_PASS" "$FTP_HOST" <<LFTP_COMMANDS
set ftp:ssl-allow no
lcd "$BUILD_DIR"
mirror -R --transfer-all --no-perms --verbose \
  --exclude-glob .git \
  --exclude-glob .git/** \
  --exclude-glob .github \
  --exclude-glob .github/** \
  --exclude-glob node_modules \
  --exclude-glob node_modules/** \
  --exclude-glob src \
  --exclude-glob src/** \
  --exclude-glob index.html \
  --exclude-glob '*.ts' \
  --exclude-glob '*.tsx' \
  --exclude-glob '*.map' \
  --exclude-glob package.json \
  --exclude-glob package-lock.json \
  --exclude-glob vite.config.ts \
  --exclude-glob tsconfig.json \
  --exclude-glob README.md \
  . "$REMOTE_DIR"
put "$BUILD_DIR/index.html" -o "$REMOTE_DIR/index.html"
bye
LFTP_COMMANDS

echo "Done."
