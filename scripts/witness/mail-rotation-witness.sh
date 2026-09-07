#!/usr/bin/env bash
#
# Resend credential rotation witness.
#
#   scripts/witness/mail-rotation-witness.sh <MEMBER_ID> <MEMBER_EMAIL> <EXPECTED_SHA>
#
# Run from the Mac Studio, inside the repo, AFTER rotating the key in production
# and restarting maia-sovereign.
#
# WHY ROTATION NEEDS ITS OWN WITNESS
# ==================================
# MAIL-03 closed an endpoint. Rotation addresses a DIFFERENT possible cause: a
# leaked credential — a CI log, an image layer, a copy somewhere. Closing the
# endpoint does nothing about that, and causation for the 2026-08 overage was
# never established, so "the relay is closed" licenses no inference about
# whether the key is clean.
#
# THREE FACTS, AND WHAT THEY PROVE TOGETHER
# =========================================
#   1. the OLD key is dead
#   2. production still sends
#   3. (1) AND (2) ⟹ production is using a different, working credential
#
# Fact 3 is an inference from the first two, and it is the only way to get
# there: `provider` in the ledger records 'resend', never WHICH key, so no
# query can attribute a send to a specific credential. Proving 2 alone would be
# consistent with never having rotated at all.
#
# HOW THE OLD KEY IS TESTED
# =========================
# By AUTHENTICATING, never by sending. `GET /domains` exercises exactly the
# credential check and delivers nothing. A send-based probe would mail someone
# if the key were still live — turning the test for a leak into a use of it.
#
# The key is read from a prompt, never an argument: a CLI argument lands in
# shell history and is visible in `ps` to every user on the box. It is never
# echoed, never written to disk, and never committed.

set -uo pipefail

HOST='soullab@minisforum'
BASE='https://soullab.life'

red() { printf '\033[31m%s\033[0m\n' "$*"; }
grn() { printf '\033[32m%s\033[0m\n' "$*"; }
ylw() { printf '\033[33m%s\033[0m\n' "$*"; }
hdr() { printf '\n\033[1m== %s ==\033[0m\n' "$*"; }
die() { red "STOP: $*"; exit 1; }

psql_q() {
  ssh "$HOST" "docker exec maia-postgres psql -U soullab maia_consciousness -tAc \"$1\""
}

MEMBER_ID="${1:-}"; MEMBER_EMAIL="${2:-}"; EXPECTED_SHA="${3:-}"

hdr '0 · Arguments'
[ -n "$MEMBER_ID" ] && [ -n "$MEMBER_EMAIL" ] && [ -n "$EXPECTED_SHA" ] \
  || die "usage: $0 <MEMBER_ID> <MEMBER_EMAIL> <EXPECTED_SHA>"
case "$MEMBER_ID$MEMBER_EMAIL$EXPECTED_SHA" in
  *'<'*|*'paste'*) die 'placeholder values — substitute real ones';;
esac
[[ "$MEMBER_ID" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]] \
  || die "MEMBER_ID is not a uuid"
case "$MEMBER_EMAIL" in *@*.*) ;; *) die 'MEMBER_EMAIL is not an address';; esac
grn "member $MEMBER_ID <$MEMBER_EMAIL>"

# ---------------------------------------------------------------------------
hdr '1 · Rotation changed no code'
# ---------------------------------------------------------------------------
# Rotation is a credential act. If the running SHA moved, something else shipped
# alongside it and this witness can no longer attribute its results to rotation.
RUNNING=$(ssh "$HOST" 'docker exec maia-sovereign printenv GIT_COMMIT' | tr -d '[:space:]')
echo "running: ${RUNNING:-<empty>}  expected: $EXPECTED_SHA"
[ -n "$RUNNING" ] || die 'could not read GIT_COMMIT'
[ "$RUNNING" = "$EXPECTED_SHA" ] \
  || die "running SHA changed during rotation ($EXPECTED_SHA -> $RUNNING) — not an isolated act"
grn 'PASS · same artifact, credential-only change'

# ---------------------------------------------------------------------------
hdr '2 · The OLD key is DEAD'
# ---------------------------------------------------------------------------
ylw 'Paste the OLD (rotated-out) Resend key. Input is hidden and never stored.'
printf 'old key: '
read -rs OLD_KEY; echo
[ -n "$OLD_KEY" ] || die 'no key entered'
case "$OLD_KEY" in re_*) ;; *) ylw 'warning: does not look like a Resend key (re_...)';; esac

# Authenticate only. Never send.
PROBE=$(curl -s -o /dev/null -w '%{http_code}' \
  -H "Authorization: Bearer $OLD_KEY" https://api.resend.com/domains)
OLD_KEY=''; unset OLD_KEY
echo "GET /domains with old key -> HTTP $PROBE"

case "$PROBE" in
  401|403) grn 'PASS · old key is rejected — revoked';;
  200)     die 'OLD KEY IS STILL LIVE. Revoke it in the Resend dashboard, then re-run.';;
  000)     die 'no response — network/proxy problem, NO VERDICT';;
  *)       die "unexpected HTTP $PROBE from Resend — NO VERDICT";;
esac

# ---------------------------------------------------------------------------
hdr '3 · Production still sends'
# ---------------------------------------------------------------------------
BLOCKED=$(psql_q "SELECT count(*) FROM auth_rate_limits WHERE endpoint = 'members/recover' AND blocked_until > NOW();" | tr -d '[:space:]')
[ "${BLOCKED:-0}" -eq 0 ] 2>/dev/null \
  || die "a members/recover block is active — wait for it to expire (leftover limiter state, not a rotation failure)"

WITNESS_START=$(date -u +%Y-%m-%dT%H:%M:%SZ); echo "witness start: $WITNESS_START"
CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/members/recover" \
  -H 'Content-Type: application/json' -d "{\"email\":\"$MEMBER_EMAIL\"}")
echo "POST /api/members/recover -> $CODE"
[ "$CODE" = '200' ] || die "recovery returned $CODE — expected 200"

sleep 3
ssh "$HOST" "docker exec maia-postgres psql -U soullab maia_consciousness -c \
  \"SELECT created_at, purpose, provider, state, failure_code
      FROM email_delivery_attempts WHERE created_at >= '$WITNESS_START' ORDER BY created_at;\""

ACCEPTED=$(psql_q "SELECT count(*) FROM email_delivery_attempts WHERE created_at >= '$WITNESS_START' AND state = 'accepted';" | tr -d '[:space:]')
FAILED=$(psql_q "SELECT count(*) FROM email_delivery_attempts WHERE created_at >= '$WITNESS_START' AND state <> 'accepted';" | tr -d '[:space:]')
echo "accepted=$ACCEPTED  non-accepted=$FAILED"

[ "${ACCEPTED:-0}" -ge 1 ] 2>/dev/null \
  || die 'no accepted send after rotation — the new key may not be in the container. Check RESEND_API_KEY and restart.'
[ "${FAILED:-0}" -eq 0 ] 2>/dev/null \
  || die "$FAILED non-accepted attempt(s) — inspect failure_code above (provider_auth = wrong key)"
grn 'PASS · provider accepted a send and issued an id after rotation'

# ---------------------------------------------------------------------------
hdr 'MACHINE CHECKS COMPLETE — one operator confirmation remains'
# ---------------------------------------------------------------------------
cat <<EOM

  1. old key rejected by Resend            PASS
  2. production accepted a send            PASS
  3. therefore: production holds a DIFFERENT, WORKING credential

  The ledger records provider='resend', never which KEY, so fact 3 is an
  inference from 1 and 2 — it is not separately observable.

  [ ] A recovery message actually ARRIVED at $MEMBER_EMAIL.
      Acceptance by the provider is not delivery.

Rotation is complete once that is confirmed. MAIL-04 opens only after.

  ROTATION
  ARTIFACT      $RUNNING (unchanged)
  OLD KEY       REVOKED
  NEW KEY       SENDING
  DELIVERY      pending operator confirmation
  MAIL-04       HOLD until confirmed
EOM
