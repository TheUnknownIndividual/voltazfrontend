#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

export REMOTE_DIR="/testvoltaz"
export VITE_API_BASE_URL="https://test.api.volt.az/api/"
export SITEMAP_API_BASE_URL="https://test.api.volt.az/api/"
export VITE_GOOGLE_CLIENT_ID="${VITE_GOOGLE_CLIENT_ID:-315961150370-d8j6iq8gbqt72sp1l7o9tt2q8o21fj0r.apps.googleusercontent.com}"
export VITE_APPLE_CLIENT_ID="${VITE_APPLE_CLIENT_ID:-az.volt.log}"
export VITE_APPLE_REDIRECT_URI="${VITE_APPLE_REDIRECT_URI:-https://test.volt.az/api/auth/callback/apple}"

exec "$SCRIPT_DIR/deploy-frontend-ftp.sh"
