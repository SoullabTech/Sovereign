#!/usr/bin/env bash
# Verify a raw ownership-census capture against the acceptance criteria.
#
# The census run and its interpretation are separate acts. This script does the first one
# mechanically: it reads an UNMODIFIED capture and either passes every criterion or names the
# one that failed. It never edits, filters, or reconciles the capture — a disagreement is
# reported, not resolved.
#
# Usage:  scripts/witness/verify-census-capture.sh <raw-capture> [instrument.sql]
# Env:    EXPECT_RELATIONS (default 557)   EXPECT_COLLISIONS (default 9)
#         EXPECT_INSTRUMENT_SHA256         if set, the instrument file must match it
#
# Exit 0 = every criterion held. Exit 1 = at least one did not; do not proceed on a failure.

set -uo pipefail
RAW="${1:?usage: verify-census-capture.sh <raw-capture> [instrument.sql]}"
INSTR="${2:-}"
EXPECT_RELATIONS="${EXPECT_RELATIONS:-557}"
EXPECT_COLLISIONS="${EXPECT_COLLISIONS:-9}"

fails=0
ok()   { printf '  PASS  %s\n' "$1"; }
bad()  { printf '  FAIL  %s\n' "$1"; fails=$((fails+1)); }
check(){ if [ "$2" = "$3" ]; then ok "$1 = $3"; else bad "$1: expected $3, got $2"; fi; }

[ -r "$RAW" ] || { echo "cannot read capture: $RAW" >&2; exit 1; }
echo "capture: $RAW"
command -v shasum >/dev/null 2>&1 && HASH="shasum -a 256" || HASH="sha256sum"
echo "capture sha256: $($HASH "$RAW" | awk '{print $1}')"

# ── instrument binding ──────────────────────────────────────────────────────
if [ -n "$INSTR" ] && [ -r "$INSTR" ]; then
  ISHA=$($HASH "$INSTR" | awk '{print $1}')
  echo "instrument sha256: $ISHA"
  if [ -n "${EXPECT_INSTRUMENT_SHA256:-}" ]; then
    check "instrument sha256" "$ISHA" "$EXPECT_INSTRUMENT_SHA256"
  fi
fi
echo
echo "── acceptance criteria ──"

# ── relation population ─────────────────────────────────────────────────────
# A data row is the only line carrying the fk column's YES/no; the header carries 'fk→id'.
ROWS=$(grep -cE '\| (YES|no)[[:space:]]*\|' "$RAW")
check "printed relation rows" "$ROWS" "$EXPECT_RELATIONS"

SUMMARY=$(grep -oE 'relations examined: [0-9]+[[:space:]]+UNCOUNTED: [0-9]+[[:space:]]+ERROR: [0-9]+' "$RAW" | tail -1)
if [ -z "$SUMMARY" ]; then
  bad "summary line absent — the census block did not finish"
else
  check "relations examined" "$(echo "$SUMMARY" | awk '{print $3}')" "$EXPECT_RELATIONS"
  check "UNCOUNTED"          "$(echo "$SUMMARY" | awk '{print $5}')" "0"
  check "ERROR"              "$(echo "$SUMMARY" | awk '{print $7}')" "0"
fi

# a per-row ERROR status must not appear even if the summary says zero
ERRROWS=$(grep -cE '\| ERROR:' "$RAW")
check "rows with ERROR status" "$ERRROWS" "0"
UNCROWS=$(grep -cE '\| UNCOUNTED_' "$RAW")
check "rows with UNCOUNTED status" "$UNCROWS" "0"

# ── buckets must sum mechanically ───────────────────────────────────────────
OWN=$(grep -oE 'ownership: A-only [0-9]+ \| B-only [0-9]+ \| both [0-9]+ \| zero [0-9]+ \| UNCOUNTED [0-9]+ \(sum [0-9]+\)' "$RAW" | tail -1)
if [ -z "$OWN" ]; then
  bad "ownership tally absent (instrument older than 8376e2e?)"
else
  echo "  ---   $OWN"
  OSUM=$(echo "$OWN" | sed -E 's/.*\(sum ([0-9]+)\)/\1/')
  OADD=$(echo "$OWN" | grep -oE '[0-9]+' | head -5 | awk '{s+=$1} END {print s}')
  check "ownership buckets add up" "$OADD" "$OSUM"
  check "ownership sum"            "$OSUM" "$EXPECT_RELATIONS"
fi

TSUM=$(awk '/tally by rule:/{f=1;next} f&&/: *[0-9]+$/{s+=$NF} f&&!/: *[0-9]+$/{f=0} END{print s+0}' "$RAW")
check "rule tally sums to relations" "$TSUM" "$EXPECT_RELATIONS"

# ── the specific relations that must be re-established, not inherited ───────
COLL=$(grep -cE '\| COLLISION_MANUAL[[:space:]]*$' "$RAW")
check "COLLISION_MANUAL relations" "$COLL" "$EXPECT_COLLISIONS"

SPC=$(grep -E 'soul_portrait_consents[[:space:]]*\|[[:space:]]*actor_member_id' "$RAW" | tail -1)
if [ -z "$SPC" ]; then
  bad "soul_portrait_consents.actor_member_id not present in capture"
elif echo "$SPC" | grep -qE '\| (UNCOUNTED_|ERROR)'; then
  bad "soul_portrait_consents.actor_member_id was NOT counted: $(echo "$SPC" | sed 's/.*| \(OK\|UNCOUNTED[^|]*\|ERROR[^|]*\).*/\1/')"
else
  ok "soul_portrait_consents.actor_member_id counted (status OK)"
fi

SP=$(grep -E 'soul_portraits[[:space:]]*\|[[:space:]]*owner_member_id' "$RAW" | tail -1)
if [ -z "$SP" ]; then
  bad "soul_portraits.owner_member_id not present in capture"
else
  SPA=$(echo "$SP" | awk -F'|' '{gsub(/ /,"",$5); print $5}')
  SPB=$(echo "$SP" | awk -F'|' '{gsub(/ /,"",$6); print $6}')
  check "portraits owned by A" "$SPA" "16"
  check "portraits owned by B" "$SPB" "0"
fi

# ── the orphan conclusion must not rest on a nullable portrait_id ───────────
if grep -q 'consent_rows_for_portraits_that_no_longer_exist' "$RAW"; then
  ORPH=$(grep -A2 'consent_rows_for_portraits_that_no_longer_exist' "$RAW" | grep -oE '^ +[0-9]+' | head -1 | tr -d ' ')
  ok "orphan probe present (result: ${ORPH:-?}) — instrument excludes NULL portrait_id by construction"
else
  bad "orphan probe absent from capture"
fi

# ── no write, transaction closed ────────────────────────────────────────────
grep -q 'NO WRITES WERE PERFORMED' "$RAW" && ok "no-writes banner present" || bad "no-writes banner absent"
grep -qE '^ROLLBACK' "$RAW" && ok "transaction ended in ROLLBACK" || bad "no ROLLBACK in capture"
grep -qiE '^(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE) [0-9]*$' "$RAW" \
  && bad "a write command tag appears in the capture" || ok "no write command tag in capture"

echo
if [ "$fails" -eq 0 ]; then
  echo "RESULT: all criteria held. The capture is bound to this instrument and this run."
  exit 0
fi
echo "RESULT: $fails criterion/criteria FAILED. STOP — report the disagreement, do not reconcile it."
exit 1
