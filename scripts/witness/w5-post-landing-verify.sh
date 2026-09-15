#!/usr/bin/env bash
# W5-SCHEMA-LAND · POST-LANDING VERIFICATION. READ ONLY.
#
# ⭐ Step 5 of the authorized change window — "immediately verify protected
# ledger + catalogue" — as an INSTRUMENT rather than as prose.
#
# ⛔ It reads. It never writes, never migrates, never rolls back, and it never
# recommends a rollback. Under the founder's failure custody a ledgered prefix
# is a KNOWN STATE: stop, record it, reconcile forward or rule otherwise.
#
#     bash scripts/witness/w5-post-landing-verify.sh
#
# ── WHAT IT ANSWERS ───────────────────────────────────────────────────────
#
#   1  who the database is                   (identity before any result)
#   2  runtime provenance                    (is the authorized SHA live?)
#   3  ledger × catalogue for the five       (the W5-LANDING-01 census, unmodified)
#   4  ⭐⭐ did any historical Ask thread become editorial?
set -u

HOST="${W5_HOST:-soullab@minisforum}"
APP="${W5_APP_CONTAINER:-maia-sovereign}"
DB="${W5_DB_CONTAINER:-maia-postgres}"
DBNAME="${W5_DBNAME:-maia_consciousness}"
DBUSER="${W5_DBUSER:-soullab}"
WANT_SHA="${W5_WANT_SHA:-348b9e54d}"
CENSUS="scripts/witness/w5-landing-01-lane-census.sql"

FIVE="20260914000001_proposal_succession.sql
20260914000002_manuscript_revision_offers.sql
20260914000003_proposal_chains_member_identity.sql
20260914000004_manuscript_revision_authorizations.sql
20260914000005_editorial_ontology.sql"

T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
pass=0; fail=0
ok(){  pass=$((pass+1)); printf "  PASS  %s\n" "$1"; }
bad(){ fail=$((fail+1)); printf "  FAIL  %s\n     -> %s\n" "$1" "$2"; }
eq(){  if [ "$2" = "$3" ]; then ok "$1"; else bad "$1" "want [$3] got [$2]"; fi; }

ro(){ ssh "$HOST" "docker exec -i $DB psql -U $DBUSER -d $DBNAME -X -q -t -A -F'|'" \
       <<< "BEGIN READ ONLY; $1 COMMIT;" 2>/dev/null; }

echo ""
echo "══════════════════════════════════════════════════════════════════"
echo " W5-SCHEMA-LAND · POST-LANDING VERIFICATION — READ ONLY"
echo "══════════════════════════════════════════════════════════════════"

echo ""
echo "── 1 · IDENTITY, BEFORE ANY RESULT IS ACCEPTED ───────────────────"
IDENT="$(ro "SELECT current_database(), current_user, current_setting('transaction_read_only'), current_setting('server_version'), pg_is_in_recovery();" | grep '|' | head -1)"
[ -n "$IDENT" ] || { echo "  ⛔ REFUSED — the database did not identify itself."; exit 2; }
I_DB="$(echo "$IDENT" | cut -d'|' -f1)"; I_RO="$(echo "$IDENT" | cut -d'|' -f3)"
printf "   %-12s %s\n" db "$I_DB" role "$(echo "$IDENT" | cut -d'|' -f2)" \
                       read_only "$I_RO" server "$(echo "$IDENT" | cut -d'|' -f4)" \
                       in_recovery "$(echo "$IDENT" | cut -d'|' -f5)"
[ "$I_DB" = "$DBNAME" ] || { echo "  ⛔ REFUSED — wrong database: '$I_DB'"; exit 2; }
[ "$I_RO" = "on" ]      || { echo "  ⛔ REFUSED — read membrane is not on."; exit 2; }

echo ""
echo "── 2 · RUNTIME PROVENANCE ────────────────────────────────────────"
LIVE="$(ssh "$HOST" "docker exec $APP printenv GIT_COMMIT" 2>/dev/null | tr -d '\r\n ')"
echo "   live GIT_COMMIT   ${LIVE:-<unreadable>}"
echo "   authorized SHA    $WANT_SHA"
case "${LIVE:-}" in
  "$WANT_SHA"*|"") [ -n "$LIVE" ] && ok "2 the authorized carrier is live" \
                    || bad "2 could not read GIT_COMMIT" "the app container did not answer" ;;
  *) bad "2 ⛔ a DIFFERENT commit is live" "live=$LIVE authorized=$WANT_SHA — a verdict below describes THAT deploy, not this one" ;;
esac

echo ""
echo "── 3 · LEDGER × CATALOGUE · the W5-LANDING-01 census, unmodified ─"
[ -f "$CENSUS" ] || { echo "  ⛔ REFUSED — census not found: $CENSUS"; exit 2; }
echo "   census blob  $(git hash-object "$CENSUS")"
ssh "$HOST" "docker exec -i $DB psql -U $DBUSER -d $DBNAME -X" < "$CENSUS" > "$T/census.out" 2>&1

# ⛔ ROW-SCOPED. `grep -c DRIFT` over the whole output matches the census's OWN
# legend sentence and reports drift in a database that has none. It cost a
# failure in Gate B and it is not repeated here.
grep -E '^ *20[0-9]{12}_[^|]*\|[^|]*\|[^|]*\|' "$T/census.out" > "$T/derived" || true
DR=$(wc -l < "$T/derived" | tr -d ' ')
# ⭐ ANTI-VACUITY: with no rows extracted, every count below is zero and every
# obligation would pass while judging nothing.
eq "3 ⭐ the census emitted five derived-state rows to judge" "$DR" "5"
L=$(grep -c 'LANDED' "$T/derived" || true)
eq "3 ⭐⭐ LANDED 5"  "$L" "5"
eq "3 ⛔ PENDING 0"  "$(grep -c 'PENDING' "$T/derived" || true)" "0"
eq "3 ⛔ PARTIAL 0"  "$(grep -c 'PARTIAL' "$T/derived" || true)" "0"
eq "3 ⛔ DRIFT 0"    "$(grep -c 'DRIFT'   "$T/derived" || true)" "0"

# ⭐ FAILURE CUSTODY. A partial prefix is a KNOWN STATE, named as such.
if [ "$DR" = 5 ] && [ "$L" != 5 ] && [ "$L" != 0 ]; then
  echo ""
  echo "   ⚠️⚠️ PARTIAL PREFIX — $L of 5 landed. The exact applied prefix:"
  grep 'LANDED' "$T/derived" | sed 's/^/     /'
  echo "   ⛔ STOP. Do not run the next migration. ⛔ NO AUTOMATIC ROLLBACK."
  echo "      A ledgered prefix is a known state: reconcile forward, or rule"
  echo "      otherwise. This instrument recommends neither."
fi

echo ""
echo "── 4 · ⭐⭐ DID ANY HISTORICAL ASK THREAD BECOME EDITORIAL? ────────"
if [ "$L" = 5 ]; then
  A="$(ro "SELECT (SELECT count(*) FROM ask_threads),
            (SELECT count(*) FROM ask_threads WHERE proposal_chain_id IS NOT NULL),
            (SELECT count(*) FROM proposal_chains),
            (SELECT count(*) FROM proposal_versions),
            (SELECT count(*) FROM proposal_chain_insights),
            (SELECT count(*) FROM proposal_chain_directions);" | grep '|' | head -1)"
  [ -n "$A" ] || bad "4 could not read the editorial objects" "the query returned nothing"
  if [ -n "$A" ]; then
    echo "   ask_threads total          $(echo "$A" | cut -d'|' -f1)"
    eq "4 ⛔ NO thread has been made editorial (proposal_chain_id NOT NULL)" "$(echo "$A" | cut -d'|' -f2)" "0"
    eq "4 ⛔ no chain invented"       "$(echo "$A" | cut -d'|' -f3)" "0"
    eq "4 ⛔ no version invented"     "$(echo "$A" | cut -d'|' -f4)" "0"
    eq "4 ⛔ no insight invented"     "$(echo "$A" | cut -d'|' -f5)" "0"
    eq "4 ⛔ no direction invented"   "$(echo "$A" | cut -d'|' -f6)" "0"
  fi
else
  echo "   ⛔ NOT MEASURED — the five are not all landed, so the editorial"
  echo "      tables may not exist. ⛔ Absence of a table is NOT zero rows."
fi

echo ""
echo "── WHAT THIS RUN DOES NOT AUTHORIZE ──────────────────────────────"
echo "   protected read              ✅ this (read only)"
echo "   rollback                    ⛔ never automatic, never recommended here"
echo "   further migration           ⛔"
echo "   W4-2 schema                 ⛔"
echo "   20260903000001 repair       ⛔ still an independent custody finding"
echo "   b67eb15e to canonical       ⏸ owed by W4-2 landing, by cherry-pick only"
echo ""
echo "  $pass passed · $fail failed"
[ "$fail" -eq 0 ]
