#!/usr/bin/env bash
# A1-LS0 · E1 canonical dev-server launcher.
# Starts the UNMODIFIED canonical app under a fully cleared environment (env -i):
# no proxy variables (so the app has no outbound network at all), no real
# provider key, the Anthropic SDK pointed at the loopback stub, DATABASE_URL at
# the disposable E1 cluster, and the synthetic flag configuration given.
# Usage: ls0-e1-server.sh <canonical_root> <port> <stub_port> <log_file> <flag-config>
#   flag-config: comma list of NAME=VALUE for the four governed flags, or "none".
set -euo pipefail
ROOT="$1"; PORT="$2"; STUB="$3"; LOG="$4"; FLAGS="$5"
ENVV=(
  "PATH=$PATH"
  "HOME=$HOME"
  "NEXT_TELEMETRY_DISABLED=1"
  "DATABASE_URL=postgresql://soullab@127.0.0.1:55432/maia_consciousness"
  "ANTHROPIC_BASE_URL=http://127.0.0.1:$STUB"
  "ANTHROPIC_API_KEY=ls0-e1-synthetic-not-a-key"
)
if [ "$FLAGS" != "none" ]; then
  IFS=',' read -ra KV <<< "$FLAGS"
  for kv in "${KV[@]}"; do ENVV+=("$kv"); done
fi
cd "$ROOT"
exec env -i "${ENVV[@]}" ./node_modules/.bin/next dev -p "$PORT" > "$LOG" 2>&1
