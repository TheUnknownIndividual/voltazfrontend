#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

export REMOTE_DIR="/voltaz"
export VITE_API_BASE_URL="https://api.volt.az/api/"

exec "$SCRIPT_DIR/deploy-frontend-ftp.sh"
