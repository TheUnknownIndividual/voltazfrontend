#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"

SSH_HOST="${SSH_HOST:-136.243.98.218}"
SSH_USER="${SSH_USER:-voltdeploy}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/volt_az_deploy}"
REMOTE_TARGET="C:/inetpub/wwwroot/voltaz"

if [ "${CONFIRM_PRODUCTION_DEPLOY:-}" != "YES" ]; then
  echo "Production deployment requires CONFIRM_PRODUCTION_DEPLOY=YES." >&2
  exit 1
fi

for command_name in npm npx node zip scp ssh curl; do
  command -v "$command_name" >/dev/null || {
    echo "$command_name is required but was not found." >&2
    exit 1
  }
done

if [ ! -f "$SSH_KEY" ]; then
  echo "SSH key was not found: $SSH_KEY" >&2
  exit 1
fi

cd "$ROOT_DIR"

if [ ! -d node_modules ]; then
  echo "Installing frontend dependencies..."
  npm ci
fi

echo "Checking TypeScript and analytics rules..."
npm run lint
npm run analytics:verify

echo "Refreshing the production sitemap..."
SITEMAP_API_BASE_URL="https://api.volt.az/api/" npm run sitemap

DEPLOY_TEMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/volt-frontend-prod-ssh.XXXXXX")"
BUILD_DIR="$DEPLOY_TEMP_DIR/dist"
PACKAGE_NAME="voltaz-frontend-$(date +%Y%m%d-%H%M%S).zip"
PACKAGE_PATH="$DEPLOY_TEMP_DIR/$PACKAGE_NAME"

cleanup() {
  rm -rf -- "$DEPLOY_TEMP_DIR"
}
trap cleanup EXIT

echo "Building production frontend..."
VITE_API_BASE_URL="https://api.volt.az/api/" \
VITE_GOOGLE_CLIENT_ID="${VITE_GOOGLE_CLIENT_ID:-315961150370-d8j6iq8gbqt72sp1l7o9tt2q8o21fj0r.apps.googleusercontent.com}" \
VITE_APPLE_CLIENT_ID="${VITE_APPLE_CLIENT_ID:-az.volt.log}" \
VITE_APPLE_REDIRECT_URI="${VITE_APPLE_REDIRECT_URI:-https://volt.az}" \
VITE_ANALYTICS_EXCLUDED_USERS="${VITE_ANALYTICS_EXCLUDED_USERS:-meta-reviewer}" \
npx vite build --outDir "$BUILD_DIR" --emptyOutDir

echo "Prerendering production SEO pages..."
BUILD_DIR="$BUILD_DIR" node scripts/prerender-seo.mjs

if [ ! -f "$BUILD_DIR/index.html" ] || [ ! -f "$BUILD_DIR/web.config" ] || [ ! -d "$BUILD_DIR/assets" ] || [ ! -d "$BUILD_DIR/_prerender" ]; then
  echo "Production build output is incomplete; deployment stopped." >&2
  exit 1
fi

if grep -q '__PRERENDER_DIR__' "$BUILD_DIR/web.config"; then
  echo "Build output contains an unresolved prerender placeholder; deployment stopped." >&2
  exit 1
fi

PDF_WORKER_PATH="$(find "$BUILD_DIR/assets" -type f -name 'pdf.worker.min-*.mjs' -print | sed -n '1p')"
if [ -z "$PDF_WORKER_PATH" ]; then
  echo "PDF.js worker asset is missing from the build; deployment stopped." >&2
  exit 1
fi
PDF_WORKER_FILE="$(basename "$PDF_WORKER_PATH")"

echo "Compressing production frontend..."
(
  cd "$BUILD_DIR"
  zip -qr "$PACKAGE_PATH" . -x '*.map' '__MACOSX/*' '.DS_Store'
)

SSH_OPTIONS=(
  -i "$SSH_KEY"
  -o IdentitiesOnly=yes
)

echo "Uploading $PACKAGE_NAME over SSH..."
scp "${SSH_OPTIONS[@]}" \
  "$PACKAGE_PATH" \
  "$SCRIPT_DIR/install-frontend-ssh.ps1" \
  "$SSH_USER@$SSH_HOST:"

echo "Installing on the production frontend..."
ssh "${SSH_OPTIONS[@]}" "$SSH_USER@$SSH_HOST" \
  "powershell.exe -NoProfile -ExecutionPolicy Bypass -File \"%USERPROFILE%/install-frontend-ssh.ps1\" -PackagePath \"%USERPROFILE%/$PACKAGE_NAME\" -TargetPath \"$REMOTE_TARGET\""

ssh "${SSH_OPTIONS[@]}" "$SSH_USER@$SSH_HOST" \
  "powershell.exe -NoProfile -Command \"if (Test-Path -LiteralPath '%USERPROFILE%/$PACKAGE_NAME') { Write-Error 'Frontend installer did not consume the uploaded package.'; exit 1 }\""

echo "Checking volt.az..."
curl --fail --silent --show-error --location --max-time 30 \
  --output /dev/null \
  "https://volt.az/"
curl --fail --silent --show-error --location --max-time 30 \
  --output /dev/null \
  "https://volt.az/assets/$PDF_WORKER_FILE"

echo "SSH production frontend deployment finished successfully."
