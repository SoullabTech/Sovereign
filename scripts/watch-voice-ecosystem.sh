#!/usr/bin/env bash
# Cron-friendly wrapper for scripts/watch-voice-ecosystem.ts.
#
# - cd's to repo root so relative paths resolve
# - sources .env.local (Mac Studio dev) or .env.production (server) for
#   TELEGRAM_BOT_TOKEN + PRACTITIONER_TELEGRAM_CHAT_ID, if present
# - invokes the TypeScript watcher via npx tsx
#
# Cron example (Mac Studio, weekly Monday 09:00 local):
#   0 9 * * 1 /Users/soullab/MAIA-SOVEREIGN/scripts/watch-voice-ecosystem.sh >> /tmp/voice-ecosystem-watch.log 2>&1
#
# Run modes:
#   ./scripts/watch-voice-ecosystem.sh             # poll + send
#   ./scripts/watch-voice-ecosystem.sh --dry-run   # print, no send
#   ./scripts/watch-voice-ecosystem.sh --init      # init state baseline

set -euo pipefail

# Resolve repo root (parent of scripts/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# Resolve env file. Prefer .env.local (dev/Mac Studio), fall back to .env.production.
# Use Node's --env-file flag (Node 20.6+) instead of bash sourcing — bash chokes
# on dotenv files with comments, multi-line values, or bare lines, whereas
# Node's parser tolerates them.
ENV_FILE=""
if [ -f ".env.local" ]; then
  ENV_FILE=".env.local"
elif [ -f ".env.production" ]; then
  ENV_FILE=".env.production"
fi

# Resolve npx — prefer Homebrew (Mac Studio) then PATH (server).
if [ -x "/opt/homebrew/bin/npx" ]; then
  NPX_BIN="/opt/homebrew/bin/npx"
elif command -v npx >/dev/null 2>&1; then
  NPX_BIN="$(command -v npx)"
else
  echo "[watch-voice-ecosystem] npx not found in PATH" >&2
  exit 127
fi

echo "[watch-voice-ecosystem] starting at $(date -u +%Y-%m-%dT%H:%M:%SZ)"

if [ -n "$ENV_FILE" ]; then
  exec "$NPX_BIN" tsx --env-file="$ENV_FILE" scripts/watch-voice-ecosystem.ts "$@"
else
  exec "$NPX_BIN" tsx scripts/watch-voice-ecosystem.ts "$@"
fi
