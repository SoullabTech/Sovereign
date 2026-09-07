#!/usr/bin/env bash
#
# MAIL-03 production witness.
#
# Run from the Mac Studio, inside the repo checkout:
#   scripts/witness/mail-03-witness.sh <MEMBER_ID> <MEMBER_EMAIL>
#
# WHY THIS IS A SCRIPT AND NOT A PASTE BLOCK
# ==========================================
# Two witness attempts on 2026-09-07 failed identically: placeholder values
# reached production as literal strings, so send-verification 500'd on an
# invalid uuid instead of exercising the 409 refusal, and the recovery loop ran
# against an address no member owns. The second attempt had a guard, the guard
# printed REFUSE — and the subsequent blocks were pasted and ran anyway.
#
# A guard the operator can walk past is not a guard. This aborts.
#
# Machine-checkable results are decided here. Two facts a script cannot see —
# whether a message actually ARRIVED — are printed as explicit operator
# questions and are required for acceptance.
#
# Does NOT break anything to test the emergency ceiling. That failure mode is
# evidenced by lib/auth/__tests__/emergency-ceiling.test.ts.

set -uo pipefail

CONTAINMENT_SHA='ee612602'
HOST='soullab@minisforum'
BASE='https://soullab.life'
ATTACKER='attacker@notyourdomain.example'
UNKNOWN='definitely-not-a-member@example.com'

red()  { printf '\033[31m%s\033[0m\n' "$*"; }
grn()  { printf '\033[32m%s\033[0m\n' "$*"; }
ylw()  { printf '\033[33m%s\033[0m\n' "$*"; }
hdr()  { printf '\n\033[1m== %s ==\033[0m\n' "$*"; }
die()  { red "STOP: $*"; exit 1; }

psql_q() {
  ssh "$HOST" "docker exec maia-postgres psql -U soullab maia_consciousness -tAc \"$1\""
}

MEMBER_ID="${1:-}"
MEMBER_EMAIL="${2:-}"

# ---------------------------------------------------------------------------
hdr '0 · Arguments'
# ---------------------------------------------------------------------------
[ -n "$MEMBER_ID" ] && [ -n "$MEMBER_EMAIL" ] \
  || die "usage: $0 <MEMBER_ID> <MEMBER_EMAIL>"
case "$MEMBER_ID$MEMBER_EMAIL" in
  *'<'*|*'paste'*) die 'placeholder values — substitute real ones';;
esac
[[ "$MEMBER_ID" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]] \
  || die "MEMBER_ID is not a uuid: $MEMBER_ID"
case "$MEMBER_EMAIL" in *@*.*) ;; *) die "MEMBER_EMAIL is not an address: $MEMBER_EMAIL";; esac
grn "member $MEMBER_ID <$MEMBER_EMAIL>"

# ---------------------------------------------------------------------------
hdr '1 · Provenance — the running artifact contains the containment commit'
# ---------------------------------------------------------------------------
git rev-parse --git-dir >/dev/null 2>&1 || die 'not inside the repo — cd to the checkout'
RUNNING=$(ssh "$HOST" 'docker exec maia-sovereign printenv GIT_COMMIT' | tr -d '[:space:]')
echo "running: ${RUNNING:-<empty>}"
[ -n "$RUNNING" ]        || die 'could not read GIT_COMMIT — no verdict'
[ "$RUNNING" != unknown ] || die "container reports 'unknown' — deploy bypassed provenance"
git cat-file -e "${CONTAINMENT_SHA}^{commit}" 2>/dev/null || die "$CONTAINMENT_SHA not known locally — fetch"
git cat-file -e "${RUNNING}^{commit}" 2>/dev/null        || die "running commit $RUNNING not known locally — fetch"
if git merge-base --is-ancestor "$CONTAINMENT_SHA" "$RUNNING"; then
  grn "PASS · running production contains $CONTAINMENT_SHA"
else
  rc=$?
  [ "$rc" -eq 1 ] && die "$CONTAINMENT_SHA genuinely NOT in running history"
  die "ancestry check errored (exit $rc) — NO VERDICT"
fi

MARK=$(ssh "$HOST" "docker exec maia-sovereign sh -c 'grep -c destination_mismatch .next/server/app/api/members/send-verification/route.js'" | tr -d '[:space:]')
[ "${MARK:-0}" -gt 0 ] 2>/dev/null || die 'destination_mismatch absent from the running artifact'
grn 'PASS · containment present in the running artifact'

# ---------------------------------------------------------------------------
hdr '2 · Ledger is recording (control)'
# ---------------------------------------------------------------------------
LEDGER_N=$(psql_q "SELECT count(*) FROM email_delivery_attempts WHERE created_at > NOW() - INTERVAL '7 days';" | tr -d '[:space:]')
echo "attempts in last 7 days: ${LEDGER_N:-?}"
[ "${LEDGER_N:-0}" -gt 0 ] 2>/dev/null \
  || die 'ledger has no recent rows — an empty witness window would prove nothing'
grn 'PASS · ledger is alive, so an empty witness window is meaningful'

# ---------------------------------------------------------------------------
hdr '3 · Member baseline'
# ---------------------------------------------------------------------------
BEFORE=$(psql_q "SELECT email FROM members WHERE id = '$MEMBER_ID';" | tr -d '[:space:]')
[ -n "$BEFORE" ] || die "no member row for $MEMBER_ID"
echo "members.email before: $BEFORE"
[ "$(printf '%s' "$BEFORE" | tr 'A-Z' 'a-z')" = "$(printf '%s' "$MEMBER_EMAIL" | tr 'A-Z' 'a-z')" ] \
  || die "MEMBER_EMAIL does not match the record ($BEFORE) — W3 would test the wrong address"

WITNESS_START=$(date -u +%Y-%m-%dT%H:%M:%SZ)
grn "witness start: $WITNESS_START"

# ---------------------------------------------------------------------------
hdr '4 · W2 — the relay test'
# ---------------------------------------------------------------------------
W2_BODY=$(curl -s -o /tmp/mail03-w2.json -w '%{http_code}' -X POST "$BASE/api/members/send-verification" \
  -H 'Content-Type: application/json' \
  -d "{\"memberId\":\"$MEMBER_ID\",\"email\":\"$ATTACKER\"}")
echo "status: $W2_BODY"; cat /tmp/mail03-w2.json; echo
case "$W2_BODY" in
  409) grep -q destination_mismatch /tmp/mail03-w2.json \
         && grn 'PASS · 409 destination_mismatch' \
         || die '409 but not destination_mismatch — unexpected refusal path';;
  500) die '500 — request died BEFORE the refusal. Not a pass.';;
  200) die 'RELAY OPEN — 200 on a caller-supplied destination. Roll back.';;
  *)   die "unexpected status $W2_BODY";;
esac

AFTER=$(psql_q "SELECT email FROM members WHERE id = '$MEMBER_ID';" | tr -d '[:space:]')
echo "members.email after: $AFTER"
[ "$AFTER" = "$BEFORE" ] || die 'ACCOUNT TAKEOVER — members.email was mutated. Roll back.'
grn 'PASS · members.email unchanged'

# ---------------------------------------------------------------------------
hdr '5 · W3/W4 — recovery delivers, then throttles'
# ---------------------------------------------------------------------------
ylw "sending up to 9 recovery requests to $MEMBER_EMAIL"
CODES=()
for i in $(seq 1 9); do
  c=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/members/recover" \
        -H 'Content-Type: application/json' -d "{\"email\":\"$MEMBER_EMAIL\"}")
  CODES+=("$c"); printf 'attempt %s -> %s\n' "$i" "$c"
done
ALLOWED=$(printf '%s\n' "${CODES[@]}" | grep -c '^200$')
BLOCKED=$(printf '%s\n' "${CODES[@]}" | grep -c '^429$')
echo "200s=$ALLOWED  429s=$BLOCKED"
[ "$ALLOWED" -gt 0 ] || die 'no request was allowed — stale limiter state? see runbook 3.0b'
[ "$BLOCKED" -gt 0 ] || die 'never throttled — recovery is UNMETERED. Roll back.'
[ "$ALLOWED" -le 6 ] || die "throttle too loose: $ALLOWED allowed"
grn "PASS · finite allowance ($ALLOWED) then refusal ($BLOCKED)"

# ---------------------------------------------------------------------------
hdr '6 · W5 — enumeration parity'
# ---------------------------------------------------------------------------
THROTTLED_BODY=$(curl -s -X POST "$BASE/api/members/recover" \
  -H 'Content-Type: application/json' -d "{\"email\":\"$MEMBER_EMAIL\"}")
UNKNOWN_BODY=$(curl -s -X POST "$BASE/api/members/recover" \
  -H 'Content-Type: application/json' -d "{\"email\":\"$UNKNOWN\"}")
echo "throttled: $THROTTLED_BODY"
echo "unknown  : $UNKNOWN_BODY"
[ "$THROTTLED_BODY" = "$UNKNOWN_BODY" ] \
  && grn 'PASS · bodies identical — no enumeration oracle' \
  || die 'bodies differ — a throttled response distinguishes real from unknown addresses'

# ---------------------------------------------------------------------------
hdr '7 · Ledger — only the expected sends'
# ---------------------------------------------------------------------------
echo "rows since $WITNESS_START:"
ssh "$HOST" "docker exec maia-postgres psql -U soullab maia_consciousness -c \
  \"SELECT created_at, purpose, lane, state, failure_code, recipient_domain
      FROM email_delivery_attempts WHERE created_at >= '$WITNESS_START' ORDER BY created_at;\""
ATTACKER_DOMAIN="${ATTACKER#*@}"
BAD=$(psql_q "SELECT count(*) FROM email_delivery_attempts WHERE created_at >= '$WITNESS_START' AND recipient_domain = '$ATTACKER_DOMAIN';" | tr -d '[:space:]')
[ "${BAD:-0}" -eq 0 ] 2>/dev/null \
  && grn "PASS · no attempt row for $ATTACKER_DOMAIN" \
  || die "$BAD attempt row(s) for the attacker domain — the route reached the provider before refusing"

# ---------------------------------------------------------------------------
hdr 'MACHINE CHECKS COMPLETE — two operator confirmations remain'
# ---------------------------------------------------------------------------
cat <<EOM

All machine-verifiable checks PASSED. A script cannot see a mailbox, so
acceptance additionally requires:

  [ ] W1  A NEW member registered through the normal flow receives their
          verification email. (Proves containment did not break sign-up.)

  [ ] W3  A recovery message actually ARRIVED at $MEMBER_EMAIL during step 5.
          Recovery returns 200 for unknown addresses by design, so the status
          code alone is not delivery. Expect ~$ALLOWED message(s).

  [ ] W2  NOTHING arrived at $ATTACKER.

Only with those confirmed is MAIL-03 ACCEPTED. Closure remains a founder act.

  MAIL-03
  CODE          $CONTAINMENT_SHA
  DEPLOY        $RUNNING
  RELAY         CLOSED IN PRODUCTION
  RECOVERY      METERED IN PRODUCTION
  CAUSATION     UNPROVEN
  MAIL-04       HOLD
EOM
