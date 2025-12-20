#!/usr/bin/env bash
# scripts/manual-memory-proof.sh - Prove memory metadata becomes non-zero
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
SESSION="${1:-memory_manual_$(date +%s)}"

post () {
  local payload_file="$1"
  local out_file="$2"
  curl -sS -X POST "$BASE_URL/api/sovereign/app/maia" \
    -H "Content-Type: application/json" \
    --data-binary "@$payload_file" > "$out_file"
}

show () {
  local label="$1"
  local file="$2"
  echo ""
  echo "=== $label ==="
  python3 - <<PY
import json
p=json.load(open("$file"))
print("Response:", (p.get("message") or "")[:220])
m=(p.get("metadata") or {}).get("memory") or {}
print("Memory:", m)
PY
}

echo "SESSION=$SESSION"

cat > /tmp/p1.json <<JSON
{"message":"My name is Alice and I love gardening","userName":"Alice","userId":"$SESSION","mode":"dialogue","sessionId":"$SESSION"}
JSON
post /tmp/p1.json /tmp/r1.json
show "Turn 1" /tmp/r1.json

cat > /tmp/p2.json <<JSON
{"message":"My favorite plant is orchid-f1b1664f","userName":"Alice","userId":"$SESSION","mode":"dialogue","sessionId":"$SESSION"}
JSON
post /tmp/p2.json /tmp/r2.json
show "Turn 2" /tmp/r2.json

cat > /tmp/p3.json <<JSON
{"message":"Answer in ONE sentence using ONLY MEMORY. Include: my name, the hobby I love, and my favorite plant EXACTLY as written.","userName":"Alice","userId":"$SESSION","mode":"dialogue","sessionId":"$SESSION"}
JSON
post /tmp/p3.json /tmp/r3.json
show "Turn 3 (recall)" /tmp/r3.json
