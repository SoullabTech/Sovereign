#!/usr/bin/env bash
#
# MAIL-04c production witness — Google connector authority containment.
#
#   scripts/witness/mail-04c-witness.sh <VICTIM_MEMBER_ID> [SESSION_TOKEN]
#
# Run from the Mac Studio, inside the repo, AFTER the full deploy.
#
# VICTIM_MEMBER_ID is a member with an EXISTING Google connection. The script
# attacks it anonymously and proves the attack fails. Nothing is sent and
# nothing is deleted on any pass.
#
# SESSION_TOKEN is optional and adds read-only authenticated checks. Get it
# from a signed-in browser: localStorage.getItem('maia_session_token').
#
# WHAT IS DELIBERATELY NOT AUTOMATED
# ==================================
# Disconnect-as-self and send-as-self are DESTRUCTIVE and SENDING acts. A
# witness must not perform them against a real member's live connection on the
# operator's behalf. They are printed as operator confirmations instead. A
# script that quietly deletes a credential to prove it can is worse than the
# defect it is testing.

set -uo pipefail

HOST='soullab@minisforum'
BASE='https://soullab.life'
CONTAINMENT_SHA='bf2cb8bc'

red() { printf '\033[31m%s\033[0m\n' "$*"; }
grn() { printf '\033[32m%s\033[0m\n' "$*"; }
hdr() { printf '\n\033[1m== %s ==\033[0m\n' "$*"; }
die() { red "STOP: $*"; exit 1; }

psql_q() {
  ssh "$HOST" "docker exec maia-postgres psql -U soullab maia_consciousness -tAc \"$1\""
}

VICTIM="${1:-}"
TOKEN="${2:-}"

hdr '0 · Arguments'
[ -n "$VICTIM" ] || die "usage: $0 <VICTIM_MEMBER_ID> [SESSION_TOKEN]"
case "$VICTIM" in *'<'*|*paste*) die 'placeholder value — substitute a real member id';; esac
[[ "$VICTIM" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]] \
  || die "not a uuid: $VICTIM"
grn "target member $VICTIM"

hdr '1 · Provenance'
git rev-parse --git-dir >/dev/null 2>&1 || die 'not inside the repo'
RUNNING=$(ssh "$HOST" 'docker exec maia-sovereign printenv GIT_COMMIT' | tr -d '[:space:]')
echo "running: ${RUNNING:-<empty>}"
[ -n "$RUNNING" ] || die 'could not read GIT_COMMIT'
[ "$RUNNING" != unknown ] || die "container reports 'unknown' — deploy bypassed provenance"
git cat-file -e "${CONTAINMENT_SHA}^{commit}" 2>/dev/null || die "$CONTAINMENT_SHA not known locally — fetch"
git cat-file -e "${RUNNING}^{commit}" 2>/dev/null || die "running commit $RUNNING not known locally — fetch"
if git merge-base --is-ancestor "$CONTAINMENT_SHA" "$RUNNING"; then
  grn "PASS · running production contains $CONTAINMENT_SHA"
else
  rc=$?; [ "$rc" -eq 1 ] && die "$CONTAINMENT_SHA NOT in running history"; die "ancestry errored (exit $rc) — NO VERDICT"
fi

hdr '2 · Migration landed'
HAS_TABLE=$(psql_q "SELECT to_regclass('public.google_oauth_state') IS NOT NULL;" | tr -d '[:space:]')
[ "$HAS_TABLE" = 't' ] || die 'google_oauth_state does not exist — the migration did not run. A quick maia-only deploy skips migrations; use the full path.'
grn 'PASS · google_oauth_state exists'

hdr '3 · Baseline — existing connections'
BEFORE=$(psql_q "SELECT count(*) FROM google_calendar_credentials;" | tr -d '[:space:]')
VICTIM_ROW=$(psql_q "SELECT count(*) FROM google_calendar_credentials WHERE user_id = '$VICTIM';" | tr -d '[:space:]')
echo "credential rows: $BEFORE   target has a row: $VICTIM_ROW"
[ "${VICTIM_ROW:-0}" -eq 1 ] 2>/dev/null || die "target member has no Google connection — pick one that does, or the deletion test proves nothing"
grn "PASS · baseline captured"

hdr '4 · CONTAINMENT — anonymous attacks must fail'

st=$(curl -s -o /tmp/m04c-send.json -w '%{http_code}' -X POST "$BASE/api/gmail/send" \
  -H 'Content-Type: application/json' \
  -d "{\"userId\":\"$VICTIM\",\"to\":\"attacker@notyourdomain.example\",\"subject\":\"s\",\"body\":\"b\"}")
echo "POST /api/gmail/send  (anonymous, victim's identity) -> $st"
[ "$st" = '401' ] || die "expected 401, got $st — a caller can still choose the sending identity"
grn 'PASS · send refused'

st=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/gmail/send?userId=$VICTIM")
echo "GET  /api/gmail/send?userId=  (anonymous) -> $st"
[ "$st" = '401' ] || die "expected 401, got $st — connection state is still enumerable"
grn 'PASS · gmail status refused'

st=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/auth/google/status?userId=$VICTIM")
echo "GET  /api/auth/google/status?userId=  (anonymous) -> $st"
[ "$st" = '401' ] || die "expected 401, got $st — connection state is still enumerable"
grn 'PASS · google status refused'

st=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/auth/google/connect" \
  -H 'Content-Type: application/json' -d "{\"userId\":\"$VICTIM\"}")
echo "POST /api/auth/google/connect  (anonymous) -> $st"
[ "$st" = '401' ] || die "expected 401, got $st"
grn 'PASS · connect refused'

# THE DESTRUCTIVE ONE. This previously deleted the named member's credentials.
st=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/auth/google/disconnect" \
  -H 'Content-Type: application/json' -d "{\"userId\":\"$VICTIM\"}")
echo "POST /api/auth/google/disconnect  (anonymous, victim named) -> $st"
[ "$st" = '401' ] || die "expected 401, got $st"

AFTER=$(psql_q "SELECT count(*) FROM google_calendar_credentials WHERE user_id = '$VICTIM';" | tr -d '[:space:]')
echo "target still has a row: $AFTER"
[ "${AFTER:-0}" -eq 1 ] 2>/dev/null || die 'CREDENTIAL DESTROYED BY AN ANONYMOUS CALLER. Roll back.'
grn 'PASS · disconnect refused AND the row survives'

hdr '5 · Non-regression — no connection stranded'
TOTAL=$(psql_q "SELECT count(*) FROM google_calendar_credentials;" | tr -d '[:space:]')
[ "$TOTAL" = "$BEFORE" ] || die "credential count moved during the witness ($BEFORE -> $TOTAL)"
grn "PASS · all $TOTAL connections intact"

if [ -n "$TOKEN" ]; then
  hdr '6 · Authenticated reads (read-only)'
  body=$(curl -s -H "x-session-token: $TOKEN" "$BASE/api/auth/google/status")
  echo "status as session member: $body"
  case "$body" in
    *'"connected":true'*) grn 'PASS · the signed-in member sees their own connection';;
    *'"connected":false'*) red 'NOTE · session member reports NOT connected — expected if that member has no Google link';;
    *) die "unexpected status body: $body";;
  esac

  body=$(curl -s -H "x-session-token: $TOKEN" "$BASE/api/auth/google/status?userId=$VICTIM")
  echo "status with a foreign ?userId=: $body"
  grn 'PASS (inspect) · the answer must describe the SESSION member, not the query parameter'
else
  hdr '6 · Authenticated reads — SKIPPED'
  echo 'Pass a session token as the second argument to include them.'
fi

hdr 'MACHINE CHECKS COMPLETE — operator confirmations remain'
cat <<EOM

  Containment is proven. Function is not — and a script must not prove it by
  sending mail from a real account or deleting a live credential.

  As a signed-in member, on WEB and on iOS:

    [ ] Google status shows the true connection state
    [ ] An existing connection is still recognised after deploy
    [ ] Connect completes end to end, and the new row is keyed by that
        member's own id
    [ ] Send reaches a recipient the member chose
    [ ] Disconnect removes THAT member's row and no other

  The iOS run is not optional. These routes now require a verified session,
  and the components calling them moved from raw fetch to apiFetch for that
  reason. Without it they pass on web and fail silently in the WebView.

  MAIL-04c
  CODE        $CONTAINMENT_SHA
  DEPLOY      $RUNNING
  MIGRATION   applied
  AUTHORITY   CONTAINED IN PRODUCTION
  FUNCTION    pending operator confirmation
EOM
