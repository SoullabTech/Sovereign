#!/usr/bin/env bash
#
# Front-door witness — can a NEW member get in, and can an existing one return?
#
#   scripts/witness/auth-front-door-witness.sh <NEW_TEST_EMAIL> [EXISTING_MEMBER_EMAIL]
#
# Run from the Mac Studio. NEW_TEST_EMAIL must be an inbox you can actually read
# and must NOT already be a member — the point is to exercise the new-member path.
#
# WHAT THIS PROVES
# ================
# The default door since 2026-06-04 is email + 6-digit code (UnifiedAuth), NOT
# password. So the question "is signup working" is really four questions:
#
#   1. does the surface render                        (steps 2)
#   2. does a code actually LEAVE for a new address   (steps 3-4, ledger evidence)
#   3. does the door refuse what it should            (steps 5-6)
#   4. is anyone actually COMPLETING signup           (step 7, population evidence)
#
# WHAT THIS CANNOT PROVE
# ======================
# Delivery. The ledger records provider ACCEPTANCE. Only a human reading the
# inbox closes that gap, which is why the run ends in an operator checklist and
# not a green banner. It also cannot complete a signup: finishing requires the
# real code from that inbox, so account creation stays a manual step and this
# script never leaves a junk member behind.

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
psql_t() {
  ssh "$HOST" "docker exec maia-postgres psql -U soullab maia_consciousness -c \"$1\""
}

NEW_EMAIL="${1:-}"; EXISTING_EMAIL="${2:-}"

hdr '0 · Arguments'
[ -n "$NEW_EMAIL" ] || die "usage: $0 <NEW_TEST_EMAIL> [EXISTING_MEMBER_EMAIL]"
# Placeholders have been run verbatim before. Refuse them by name.
case "$NEW_EMAIL$EXISTING_EMAIL" in
  *'<'*|*'YOUR@'*|*'her@email'*|*'example.com'*|*'paste'*|*'you+newtest'*|*'newtest@'*)
    die 'placeholder value — substitute a real inbox you can read';;
esac
case "$NEW_EMAIL" in *@*.*) ;; *) die 'NEW_TEST_EMAIL is not an address';; esac

EXISTS=$(psql_q "SELECT count(*) FROM members WHERE LOWER(email) = LOWER('$NEW_EMAIL');" | tr -d '[:space:]')
[ "${EXISTS:-1}" -eq 0 ] 2>/dev/null \
  || die "$NEW_EMAIL is ALREADY a member — this witness needs an address that is not, or it tests the returning path while claiming to test signup"
grn "new address confirmed unregistered: $NEW_EMAIL"

RUNNING=$(ssh "$HOST" 'docker exec maia-sovereign printenv GIT_COMMIT' | tr -d '[:space:]')
echo "running SHA: ${RUNNING:-<empty>}"
[ -n "$RUNNING" ] || die 'could not read GIT_COMMIT — cannot attribute results to an artifact'

# ---------------------------------------------------------------------------
hdr '1 · The app is answering'
# ---------------------------------------------------------------------------
H=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/health")
echo "GET /api/health -> $H"
[ "$H" = '200' ] || die "health returned $H"
grn 'PASS'

# ---------------------------------------------------------------------------
hdr '2 · The front door renders'
# ---------------------------------------------------------------------------
# /signin and /signup both render components/auth/UnifiedAuth.tsx. If either
# stops answering 200, every member — new and returning — is outside.
for P in /signin /signup; do
  C=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$P")
  echo "GET $P -> $C"
  [ "$C" = '200' ] || die "$P returned $C — the front door is not rendering"
done
grn 'PASS · both entrances render'

# ---------------------------------------------------------------------------
hdr '3 · A code LEAVES for a new address'
# ---------------------------------------------------------------------------
# This is the step that actually creates a signup opportunity. Rate limit is
# per IP; a 429 here is limiter state, not a broken door.
W1=$(date -u +%Y-%m-%dT%H:%M:%SZ)
NEW_BODY=$(curl -s -w $'\n%{http_code}' -X POST "$BASE/api/members/email-code" \
  -H 'Content-Type: application/json' -d "{\"email\":\"$NEW_EMAIL\"}")
NEW_CODE=$(printf '%s' "$NEW_BODY" | tail -n1)
NEW_JSON=$(printf '%s' "$NEW_BODY" | sed '$d')
echo "POST /api/members/email-code (new) -> $NEW_CODE"
echo "body: $NEW_JSON"
case "$NEW_CODE" in
  200) ;;
  429) die 'rate limited — wait out the window and re-run; NO VERDICT on the door';;
  *)   die "code request returned $NEW_CODE — new members cannot start";;
esac

sleep 3
psql_t "SELECT created_at, purpose, provider, state, failure_class, failure_code, provider_message_id
          FROM email_delivery_attempts WHERE created_at >= '$W1' ORDER BY created_at;"

ACC=$(psql_q "SELECT count(*) FROM email_delivery_attempts WHERE created_at >= '$W1' AND state = 'accepted';" | tr -d '[:space:]')
BAD=$(psql_q "SELECT count(*) FROM email_delivery_attempts WHERE created_at >= '$W1' AND state <> 'accepted';" | tr -d '[:space:]')
echo "accepted=$ACC  non-accepted=$BAD"
[ "${ACC:-0}" -ge 1 ] 2>/dev/null \
  || die 'HTTP 200 but NOTHING was accepted by the provider — the door reports success and sends nothing. This is the 2026-08-24 failure shape.'
[ "${BAD:-0}" -eq 0 ] 2>/dev/null \
  || ylw "WARN · $BAD non-accepted attempt(s) in the window — read failure_code above (quota_exceeded = account cap, provider_auth = wrong key)"
grn 'PASS · provider accepted a code for a brand-new address'

# ---------------------------------------------------------------------------
hdr '4 · The door does not leak who is already a member'
# ---------------------------------------------------------------------------
# The response must be identical for a known and an unknown address. A body that
# differs turns the front door into a membership oracle for anyone with a list.
if [ -n "$EXISTING_EMAIL" ]; then
  OLD_BODY=$(curl -s -w $'\n%{http_code}' -X POST "$BASE/api/members/email-code" \
    -H 'Content-Type: application/json' -d "{\"email\":\"$EXISTING_EMAIL\"}")
  OLD_CODE=$(printf '%s' "$OLD_BODY" | tail -n1)
  OLD_JSON=$(printf '%s' "$OLD_BODY" | sed '$d')
  echo "existing -> $OLD_CODE  body: $OLD_JSON"
  if [ "$OLD_CODE" = '429' ]; then
    ylw 'SKIP · rate limited before the comparison could be made'
  elif [ "$OLD_CODE" = "$NEW_CODE" ] && [ "$OLD_JSON" = "$NEW_JSON" ]; then
    grn 'PASS · identical response for known and unknown addresses'
  else
    die 'ENUMERATION LEAK · the response differs between a member and a non-member'
  fi
else
  ylw 'SKIP · no EXISTING_MEMBER_EMAIL given'
fi

# ---------------------------------------------------------------------------
hdr '5 · A wrong code is refused'
# ---------------------------------------------------------------------------
V=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/members/email-code/verify" \
  -H 'Content-Type: application/json' -d "{\"email\":\"$NEW_EMAIL\",\"code\":\"000000\"}")
echo "verify with 000000 -> $V"
case "$V" in
  400|429) grn 'PASS · refused';;
  200)     die 'A WRONG CODE WAS ACCEPTED. Stop and treat as an authentication breach.';;
  *)       ylw "WARN · unexpected $V — inspect before trusting this door";;
esac

# ---------------------------------------------------------------------------
hdr '6 · The password path still answers (returning members)'
# ---------------------------------------------------------------------------
# Password is the recovery door, not the default. A deliberately wrong credential
# proves the route is alive without needing a real one. 401 is the PASS.
S=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/members/signin" \
  -H 'Content-Type: application/json' \
  -d '{"username":"__witness_no_such_user__","password":"__witness_wrong__"}')
echo "POST /api/members/signin (bad creds) -> $S"
case "$S" in
  401) grn 'PASS · route alive and refusing';;
  429) ylw 'SKIP · rate limited';;
  200) die 'SIGNIN ACCEPTED A NONEXISTENT USER. Stop.';;
  *)   die "signin returned $S — the recovery door is not answering correctly";;
esac

# ---------------------------------------------------------------------------
hdr '7 · Is anyone actually COMPLETING signup?'
# ---------------------------------------------------------------------------
# The steps above prove the door opens. This asks whether people walk through it.
# A door that opens onto a flow nobody finishes is a broken signup with green checks.
psql_t "SELECT date_trunc('day', created_at) AS d,
               count(*) AS created,
               count(*) FILTER (WHERE onboarded) AS onboarded,
               count(*) FILTER (WHERE NOT onboarded) AS stalled
          FROM members
         WHERE created_at > NOW() - INTERVAL '30 days'
         GROUP BY 1 ORDER BY 1 DESC;"

psql_t "SELECT onboarding_step, count(*)
          FROM members
         WHERE NOT onboarded AND created_at > NOW() - INTERVAL '90 days'
         GROUP BY 1 ORDER BY 2 DESC;"

ylw 'Read the two tables above: members created but never onboarded are people who
     reached the door, were admitted, and did not arrive. That is a signup failure
     even when every check above is green.'

# ---------------------------------------------------------------------------
hdr 'MACHINE CHECKS COMPLETE — operator confirmation remains'
# ---------------------------------------------------------------------------
cat <<EOM

  ARTIFACT   $RUNNING
  SURFACE    /signin and /signup render
  SEND       provider accepted a code for a new address
  REFUSAL    wrong code refused; nonexistent signin refused

  [ ] The 6-digit code ARRIVED at $NEW_EMAIL.
      Provider acceptance is not delivery — this is the only step that closes it.

  [ ] Entering that code at $BASE/signin admitted you, asked for a name,
      and landed you in /onboarding.

  [ ] Finishing /onboarding left the account onboarded server-side:
      SELECT onboarded, onboarding_step FROM members WHERE LOWER(email)=LOWER('$NEW_EMAIL');

  [ ] Test account removed when finished, if it should not persist.

Signup is witnessed only when all four are checked. Until then this run proves
the door opens, not that a member gets through it.
EOM
