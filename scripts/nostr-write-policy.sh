#!/bin/sh
##
## nostr-write-policy.sh
##
## strfry write policy plugin for the Soullab relay.
## Called once per incoming event. Reads JSON from stdin, writes JSON to stdout.
##
## Input:  { "event": {...}, "receivedAt": N, "sourceType": "IP4", "sourceInfo": "..." }
## Output: { "id": "<event-id>", "action": "accept"|"reject", "msg": "..." }
##
## Validates that the event's author pubkey is a registered Soullab member
## by calling the MAIA app's internal validate-pubkey endpoint.
##
## Requires: jq, curl (installed in Dockerfile.strfry)
##

set -e

# Read one line of JSON from stdin
read -r LINE

EVENT_ID=$(printf '%s' "$LINE" | jq -r '.event.id // empty')
PUBKEY=$(printf '%s' "$LINE" | jq -r '.event.pubkey // empty')
KIND=$(printf '%s' "$LINE" | jq -r '.event.kind // 1')

# Reject malformed events
if [ -z "$EVENT_ID" ] || [ -z "$PUBKEY" ]; then
  printf '{"id":"","action":"reject","msg":"Malformed event"}\n'
  exit 0
fi

# Allow ephemeral and auth events through without membership check
# Kind 22242 = NIP-42 AUTH, Kind 20000-29999 = ephemeral
if [ "$KIND" -eq 22242 ] 2>/dev/null || ([ "$KIND" -ge 20000 ] && [ "$KIND" -lt 30000 ]) 2>/dev/null; then
  printf '{"id":"%s","action":"accept"}\n' "$EVENT_ID"
  exit 0
fi

# Call MAIA's validate-pubkey endpoint (internal Docker network)
MAIA_URL="${MAIA_INTERNAL_URL:-http://maia-sovereign:3000}"
RESULT=$(curl -sf --max-time 2 "${MAIA_URL}/api/nostr/validate-pubkey?pubkey=${PUBKEY}" 2>/dev/null || echo '{"allowed":false}')
ALLOWED=$(printf '%s' "$RESULT" | jq -r '.allowed // false')

if [ "$ALLOWED" = "true" ]; then
  printf '{"id":"%s","action":"accept"}\n' "$EVENT_ID"
else
  printf '{"id":"%s","action":"reject","msg":"Soullab member registration required to publish to this relay"}\n' "$EVENT_ID"
fi
