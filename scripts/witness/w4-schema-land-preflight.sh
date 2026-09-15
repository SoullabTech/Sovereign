#!/usr/bin/env bash
# W4-SCHEMA-LAND · PROTECTED PREFLIGHT. READ ONLY.
#
# ⭐ Run IMMEDIATELY BEFORE landing. Its whole content is that it is read NOW:
# a reading taken days earlier is yesterday's clean state treated as permanent,
# which is the thing this gate exists to forbid.
#
# ⛔ It reads. It never writes, never migrates, never deploys.
#
#     bash scripts/witness/w4-schema-land-preflight.sh [candidate-ref]
#
# ── ⭐⭐ THE TWO QUESTIONS THAT DECIDE THE LANDING ─────────────────────────
#
#   1  will S2's two VALIDATEs pass?   (a violating row is a FINDING, not an
#                                       obstacle — the migration stops)
#   2  is the pending set exactly the two files, in order, and nothing else?
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$ROOT" || exit 2
CAND="${1:-HEAD}"
HOST="${W4_HOST:-soullab@minisforum}"
APP="${W4_APP_CONTAINER:-maia-sovereign}"
DB="${W4_DB_CONTAINER:-maia-postgres}"
DBNAME="${W4_DBNAME:-maia_consciousness}"
DBUSER="${W4_DBUSER:-soullab}"
WANT_SHA="${W4_WANT_SHA:-348b9e54d}"
TWO="20260915000001_ask_threads_subject_preparation.sql
20260915000002_editorial_turn_bindings.sql"

T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
pass=0; fail=0
ok(){  pass=$((pass+1)); printf "  PASS  %s\n" "$1"; }
bad(){ fail=$((fail+1)); printf "  FAIL  %s\n     -> %s\n" "$1" "$2"; }
eq(){  if [ "$2" = "$3" ]; then ok "$1"; else bad "$1" "want [$3] got [$2]"; fi; }
ro(){ ssh "$HOST" "docker exec -i $DB psql -U $DBUSER -d $DBNAME -X -q -t -A -F'|'" \
       <<< "BEGIN READ ONLY; $1 COMMIT;" 2>/dev/null; }

echo ""
echo "══════════════════════════════════════════════════════════════════"
echo " W4-SCHEMA-LAND · PROTECTED PREFLIGHT — READ ONLY"
echo "══════════════════════════════════════════════════════════════════"

echo ""
echo "── 1 · IDENTITY, BEFORE ANY RESULT IS ACCEPTED ───────────────────"
IDENT="$(ro "SELECT current_database(), current_user, current_setting('transaction_read_only'), current_setting('server_version'), pg_is_in_recovery();" | grep '|' | head -1)"
[ -n "$IDENT" ] || { echo "  ⛔ REFUSED — the database did not identify itself."; exit 2; }
I_DB="$(echo "$IDENT" | cut -d'|' -f1)"; I_RO="$(echo "$IDENT" | cut -d'|' -f3)"
printf "   %-12s %s\n" db "$I_DB" role "$(echo "$IDENT" | cut -d'|' -f2)" \
       read_only "$I_RO" server "$(echo "$IDENT" | cut -d'|' -f4)" in_recovery "$(echo "$IDENT" | cut -d'|' -f5)"
[ "$I_DB" = "$DBNAME" ] || { echo "  ⛔ REFUSED — wrong database: '$I_DB'"; exit 2; }
[ "$I_RO" = "on" ]      || { echo "  ⛔ REFUSED — the read membrane is not on."; exit 2; }

echo ""
echo "── 2 · RUNTIME PROVENANCE ────────────────────────────────────────"
LIVE="$(ssh "$HOST" "docker exec $APP printenv GIT_COMMIT" 2>/dev/null | tr -d '\r\n ')"
echo "   live GIT_COMMIT   ${LIVE:-<unreadable>}"
case "${LIVE:-}" in "$WANT_SHA"*) ok "2 the W5 carrier is still live ($WANT_SHA)" ;;
  "") bad "2 could not read GIT_COMMIT" "the app container did not answer" ;;
  *)  bad "2 ⛔ a DIFFERENT commit is live" "live=$LIVE expected=$WANT_SHA — everything below describes THAT deploy" ;; esac

echo ""
echo "── 3 · PENDING ORDER · image, ledger, candidate ──────────────────"
ssh "$HOST" "docker exec $APP ls -1 /app/database/migrations" 2>/dev/null | grep '\.sql$' | sort -u > "$T/image"
[ -s "$T/image" ] || { echo "  ⛔ REFUSED — could not list the image's migrations."; exit 2; }
ro "SELECT filename FROM schema_migrations;" | grep '\.sql$' | sort -u > "$T/ledger"
[ -s "$T/ledger" ] || { echo "  ⛔ REFUSED — could not read schema_migrations."; exit 2; }
echo "   image files $(wc -l < "$T/image" | tr -d ' ')  ·  ledger rows $(wc -l < "$T/ledger" | tr -d ' ')"

comm -23 "$T/image" "$T/ledger" > "$T/latent"
LAT=$(wc -l < "$T/latent" | tr -d ' ')
eq "3a ⭐ the RUNNING image has no latent pending migration" "$LAT" "0"
[ "$LAT" != 0 ] && sed 's/^/     ⚠️ /' "$T/latent"

git rev-parse --verify --quiet "$CAND^{commit}" >/dev/null || { echo "  ⛔ REFUSED — unknown ref: $CAND"; exit 2; }
git ls-tree -r --full-tree --name-only "$CAND" database/migrations/ | grep '\.sql$' | sed 's|.*/||' | sort -u > "$T/cand"
comm -23 "$T/cand" "$T/ledger" > "$T/pending"
echo "   candidate $CAND → pending set, in the runner's filename order:"
nl -ba -w4 -s'  ' "$T/pending" | sed 's/^/   /'
if [ "$(cat "$T/pending")" = "$TWO" ]; then
  ok "3b ⭐⭐ EXACTLY the two, in order, with nothing else and nothing missing"
else bad "3b the pending set is not the two" "$(tr '\n' ' ' < "$T/pending")"; fi

echo ""
echo "── 4 · ⭐⭐ WILL S2's VALIDATEs PASS? ──────────────────────────────"
echo "   ⛔ A violating row is a FINDING, not an obstacle. Something wrote it,"
echo "      and the migration must STOP rather than repair it."
V="$(ro "SELECT
  (SELECT count(*) FROM ask_threads WHERE anchor IS NOT NULL AND proposal_chain_id IS NOT NULL),
  (SELECT count(*) FROM ask_threads WHERE anchor IS NULL AND proposal_chain_id IS NULL),
  (SELECT count(*) FROM ask_threads WHERE proposal_chain_id IS NOT NULL AND reading_identity IS NOT NULL),
  (SELECT count(*) FROM ask_threads WHERE anchor IS NULL),
  (SELECT count(*) FROM ask_threads),
  (SELECT is_nullable FROM information_schema.columns WHERE table_name='ask_threads' AND column_name='anchor');" \
  | grep '|' | head -1)"
[ -n "$V" ] || { echo "  ⛔ REFUSED — the subject census returned nothing."; exit 2; }
NULLABLE="$(echo "$V" | cut -d'|' -f6)"
echo "   ask_threads total            $(echo "$V" | cut -d'|' -f5)"
echo "   anchor is nullable already?  $NULLABLE"
eq "4a ⭐⭐ both anchor AND chain — the row that would REFUSE ask_threads_one_subject" \
   "$(echo "$V" | cut -d'|' -f1)" "0"
eq "4b ⭐⭐ chain AND reading_identity — would REFUSE editorial_has_no_reading" \
   "$(echo "$V" | cut -d'|' -f3)" "0"

# ⭐ ANTI-VACUITY. Two of the four counts the ruling names are STRUCTURALLY
# impossible before S1 lands, because `anchor` is still NOT NULL. Reporting them
# as passing checks would be reporting a zero that no row could ever have made
# non-zero — the same error as calling an absent schema "zero violations".
if [ "$NULLABLE" = "NO" ]; then
  echo "   4c ⛔ NOT MEASURABLE · neither anchor nor chain   = $(echo "$V" | cut -d'|' -f2)"
  echo "   4d ⛔ NOT MEASURABLE · editorial threads          = $(echo "$V" | cut -d'|' -f4)"
  echo "      ⭐ the anchor column is still NOT NULL, so both counts are"
  echo "         STRUCTURALLY zero. Reported, not counted as evidence: a zero"
  echo "         that no row could have made non-zero proves nothing."
else
  eq "4c neither anchor nor chain"  "$(echo "$V" | cut -d'|' -f2)" "0"
  eq "4d editorial threads already exist?" "$(echo "$V" | cut -d'|' -f4)" "0"
  echo "      ⚠️ anchor is ALREADY nullable — S1 may have landed before. Check §3b."
fi

echo ""
echo "── 5 · OPTION A · has the dated unique-build ruling changed? ─────"
echo "   ⭐ Option A was earned on 2026-09-14: ask_threads 8 kB · ask_turns 24 kB."
echo "      This rechecks that the ordinary UNIQUE build is still a blip."
S="$(ro "SELECT pg_size_pretty(pg_total_relation_size('ask_threads')),
                pg_size_pretty(pg_total_relation_size('ask_turns')),
                (SELECT reltuples::bigint FROM pg_class WHERE relname='ask_threads'),
                (SELECT reltuples::bigint FROM pg_class WHERE relname='ask_turns');" | grep '|' | head -1)"
echo "   ask_threads  $(echo "$S" | cut -d'|' -f1)  · est rows $(echo "$S" | cut -d'|' -f3)"
echo "   ask_turns    $(echo "$S" | cut -d'|' -f2)  · est rows $(echo "$S" | cut -d'|' -f4)"
echo "   ⛔ reltuples is an ESTIMATE and reads -1 when never analyzed; it sizes"
echo "      the build, it does not answer an integrity question."
echo "   ⚠️ Founder judgement: if either table has grown materially, Option A is"
echo "      re-decided, not assumed. This instrument reports; it does not rule."

echo ""
echo "── WHAT THIS RUN DOES NOT AUTHORIZE ──────────────────────────────"
echo "   protected read              ✅ this (read only)"
echo "   canonical acquisition       ⛔ a separate founder ruling"
echo "   S1/S2 execution             ⛔"
echo "   deployment                  ⛔"
echo "   20260903000001 repair       ⛔ still parked in its own lane"
echo ""
echo "  $pass passed · $fail failed"
[ "$fail" -eq 0 ]
