#!/bin/bash
# ios
# ios/App/scripts/run-beta.sh — one-command TestFlight upload
#
# Usage (from anywhere in the repo):
#   ios/App/scripts/run-beta.sh
# Or from ios/App/:
#   ./scripts/run-beta.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IOS_APP="$(dirname "$SCRIPT_DIR")"          # ios/App/
ENV_FILE="$IOS_APP/.env.local"

# ── Load credentials ─────────────────────────────────────────────────────────
if [ -f "$ENV_FILE" ]; then
  # Load without printing any values
  set -a
  # shellcheck source=/dev/null
  source "$ENV_FILE"
  set +a
  echo "✓ Loaded credentials from .env.local"
else
  echo ""
  echo "  Missing: $ENV_FILE"
  echo ""
  echo "  To create it:"
  echo "    cp ios/App/.env.example ios/App/.env.local"
  echo "    # then fill in ASC_KEY_ID, ASC_ISSUER_ID, and ASC_KEY_CONTENT"
  echo ""
  echo "  See docs/ios_testflight.md for the full setup guide."
  echo ""
  exit 1
fi

# ── Run the beta lane ────────────────────────────────────────────────────────
cd "$IOS_APP"
exec bundle exec fastlane ios beta "$@"
