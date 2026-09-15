#!/usr/bin/env bash
# W4-SCHEMA-LAND · POST-LANDING VERIFICATION. READ ONLY.
#
# ⭐ Step 8 of the authorized change window, as an INSTRUMENT rather than prose.
#
# ⛔ It reads. It never writes, never migrates, never rolls back, and it never
# recommends a rollback. Under the execution law a ledgered S1 with S2 refused is
# THE SAFE PREFIX — the state the files were split to make representable. This
# instrument names it and stops.
#
#     bash scripts/witness/w4-post-landing-verify.sh
#
# ── ⚠️ EVIDENCE CLASSES, NAMED PER OBLIGATION ─────────────────────────────
#
#   LEDGER      schema_migrations
#   CATALOGUE   pg_constraint / pg_trigger / information_schema
#   DATA        row counts
#
# ⛔ THERE IS NO BEHAVIOURAL CLASS HERE, AND THAT IS NOT AN OVERSIGHT.
# "the binding refuses UPDATE" and "the binding still allows DELETE" cannot be
# proved on a read-only membrane without writing to production. They are
# established here from the CATALOGUE — the trigger's own timing and event mask —
# and they are proved BEHAVIOURALLY in `w4-schema-witness.sh` (W6/W7) against a
# disposable database. ⛔ A catalogue fact must never be reported as a behaviour.
set -u
HOST="${W4_HOST:-soullab@minisforum}"
APP="${W4_APP_CONTAINER:-maia-sovereign}"
DB="${W4_DB_CONTAINER:-maia-postgres}"
DBNAME="${W4_DBNAME:-maia_consciousness}"
DBUSER="${W4_DBUSER:-soullab}"
WANT_SHA="${W4_WANT_SHA:-53cd18524}"
S1=20260915000001_ask_threads_subject_preparation.sql
S2=20260915000002_editorial_turn_bindings.sql

pass=0; fail=0
ok(){  pass=$((pass+1)); printf "  PASS  %s\n" "$1"; }
bad(){ fail=$((fail+1)); printf "  FAIL  %s\n     -> %s\n" "$1" "$2"; }
eq(){  if [ "$2" = "$3" ]; then ok "$1"; else bad "$1" "want [$3] got [$2]"; fi; }
ro(){ ssh "$HOST" "docker exec -i $DB psql -U $DBUSER -d $DBNAME -X -q -t -A -F'|'" \
       <<< "BEGIN READ ONLY; $1 COMMIT;" 2>/dev/null; }

echo ""
echo "══════════════════════════════════════════════════════════════════"
echo " W4-SCHEMA-LAND · POST-LANDING VERIFICATION — READ ONLY"
echo "══════════════════════════════════════════════════════════════════"

echo ""
echo "── 1 · IDENTITY, BEFORE ANY RESULT IS ACCEPTED ───────────────────"
IDENT="$(ro "SELECT current_database(), current_user, current_setting('transaction_read_only'), current_setting('server_version');" | grep '|' | head -1)"
[ -n "$IDENT" ] || { echo "  ⛔ REFUSED — the database did not identify itself."; exit 2; }
I_DB="$(echo "$IDENT" | cut -d'|' -f1)"; I_RO="$(echo "$IDENT" | cut -d'|' -f3)"
printf "   %-12s %s\n" db "$I_DB" role "$(echo "$IDENT" | cut -d'|' -f2)" \
       read_only "$I_RO" server "$(echo "$IDENT" | cut -d'|' -f4)"
[ "$I_DB" = "$DBNAME" ] || { echo "  ⛔ REFUSED — wrong database: '$I_DB'"; exit 2; }
[ "$I_RO" = "on" ]      || { echo "  ⛔ REFUSED — the read membrane is not on."; exit 2; }
LIVE="$(ssh "$HOST" "docker exec $APP printenv GIT_COMMIT" 2>/dev/null | tr -d '\r\n ')"
echo "   live GIT_COMMIT  ${LIVE:-<unreadable>}"
case "${LIVE:-}" in "$WANT_SHA"*) ok "1 the authorized candidate is live" ;;
  "") bad "1 could not read GIT_COMMIT" "the app container did not answer" ;;
  *)  bad "1 ⛔ a DIFFERENT commit is live" "live=$LIVE authorized=$WANT_SHA" ;; esac

echo ""
echo "── 2 · LEDGER · S1 then S2 ───────────────────────────────────────"
L="$(ro "SELECT
  (SELECT count(*) FROM schema_migrations WHERE filename='$S1'),
  (SELECT count(*) FROM schema_migrations WHERE filename='$S2');" | grep '|' | head -1)"
G1="$(echo "$L" | cut -d'|' -f1)"; G2="$(echo "$L" | cut -d'|' -f2)"
eq "2a S1 LANDED" "$G1" "1"
eq "2b S2 LANDED" "$G2" "1"

# ⭐⭐ THE SAFE PREFIX, NAMED. This is the state the two files exist to make
# representable, and it is a KNOWN STATE — not a failure to unwind.
if [ "$G1" = "1" ] && [ "$G2" = "0" ]; then
  echo ""
  echo "   ⚠️⚠️ S1 LANDED · S2 NOT LANDED — THE SAFE PREFIX."
  echo "      anchor is nullable · both CHECKs enforced ON NEW ROWS ·"
  echo "      any violating row still visible, unrepaired and findable ·"
  echo "      S1 ledgered · S2 retryable once the row is ruled on."
  echo "   ⛔ STOP. ⛔ No automatic rollback. ⛔ Do not delete or repair the row."
  echo "   ⛔ Do not continue. This is exactly why the files were split."
  echo ""
  echo "  $pass passed · $fail failed"
  exit 1
fi

echo ""
echo "── 3 · CATALOGUE · the subject refinement ────────────────────────"
C="$(ro "SELECT
  (SELECT is_nullable FROM information_schema.columns WHERE table_name='ask_threads' AND column_name='anchor'),
  (SELECT convalidated FROM pg_constraint WHERE conname='ask_threads_one_subject'),
  (SELECT convalidated FROM pg_constraint WHERE conname='ask_threads_editorial_has_no_reading');" | grep '|' | head -1)"
eq "3a ask_threads.anchor is nullable"                        "$(echo "$C" | cut -d'|' -f1)" "YES"
eq "3b ⭐ ask_threads_one_subject is VALIDATED, not merely present"      "$(echo "$C" | cut -d'|' -f2)" "t"
eq "3c ⭐ ask_threads_editorial_has_no_reading is VALIDATED"             "$(echo "$C" | cut -d'|' -f3)" "t"
echo "   ⛔ convalidated is the whole point: a NOT VALID constraint is enforced"
echo "      for new rows and silently unenforced over the existing ones."

echo ""
echo "── 4 · CATALOGUE · the binding substrate ─────────────────────────"
eq "4a editorial_turn_bindings present" \
   "$(ro "SELECT to_regclass('public.editorial_turn_bindings') IS NOT NULL;" | head -1)" "t"
U="$(ro "SELECT count(*) FROM pg_constraint WHERE contype='u' AND conname IN (
  'ask_threads_id_chain_key','ask_turns_thread_index_speaker_key',
  'proposal_chain_directions_chain_id_id_author_key','proposal_versions_chain_id_id_author_key');" | head -1)"
eq "4b ⭐ all four supporting UNIQUE constraints present" "$U" "4"
eq "4c ⛔ and the existing UNIQUE (chain_id,id) STAYS — succession targets it" \
   "$(ro "SELECT count(*) FROM pg_constraint WHERE conname='proposal_versions_chain_id_id_key';" | head -1)" "1"
eq "4d the two partial unique indexes present" \
   "$(ro "SELECT count(*) FROM pg_class WHERE relkind='i' AND relname IN ('etb_one_turn_per_direction','etb_one_turn_per_version');" | head -1)" "2"

# ⚠️ CATALOGUE EVIDENCE FOR A BEHAVIOURAL CLAIM, AND IT SAYS SO.
# tgtype bits: 1 ROW · 2 BEFORE · 4 INSERT · 8 DELETE · 16 UPDATE.
TG="$(ro "SELECT (tgtype & 16 = 16), (tgtype & 8 = 0), (tgtype & 2 = 2)
          FROM pg_trigger WHERE tgname='editorial_turn_bindings_no_update' AND NOT tgisinternal;" | grep '|' | head -1)"
[ -n "$TG" ] || bad "4e the immutability trigger is absent" "no such trigger"
if [ -n "$TG" ]; then
  eq "4e ⭐ the binding's UPDATE refusal is installed (trigger fires on UPDATE)" "$(echo "$TG" | cut -d'|' -f1)" "t"
  eq "4f ⭐⭐ and DELETE is NOT in its event mask — withdrawal can still remove one" "$(echo "$TG" | cut -d'|' -f2)" "t"
  eq "4g it is a BEFORE trigger" "$(echo "$TG" | cut -d'|' -f3)" "t"
fi
eq "4h ⛔ and it is NOT authored_editorial_record_immutable — that one refuses DELETE too" \
   "$(ro "SELECT p.proname FROM pg_trigger t JOIN pg_proc p ON p.oid=t.tgfoid WHERE t.tgname='editorial_turn_bindings_no_update';" | head -1)" \
   "editorial_turn_binding_immutable"
echo "   ⚠️ 4e/4f are CATALOGUE evidence for a behavioural claim, and are labelled"
echo "      as such. The behaviour itself is proved in w4-schema-witness.sh"
echo "      (W6/W7) on a disposable database. ⛔ A read-only membrane cannot"
echo "      prove a write refusal without writing."

echo ""
echo "── 5 · DATA · ⭐⭐ the historical Ask thread is untouched ──────────"
D="$(ro "SELECT
  (SELECT count(*) FROM ask_threads),
  (SELECT count(*) FROM ask_threads WHERE anchor IS NOT NULL),
  (SELECT count(*) FROM ask_threads WHERE proposal_chain_id IS NOT NULL),
  (SELECT count(*) FROM ask_threads WHERE anchor IS NULL),
  (SELECT count(*) FROM editorial_turn_bindings);" | grep '|' | head -1)"
echo "   ask_threads total              $(echo "$D" | cut -d'|' -f1)"
eq "5a ⭐ every existing thread still has its anchor POPULATED" \
   "$(echo "$D" | cut -d'|' -f2)" "$(echo "$D" | cut -d'|' -f1)"
eq "5b ⛔ proposal_chain_id remains NULL — no thread was made editorial" \
   "$(echo "$D" | cut -d'|' -f3)" "0"
eq "5c ⛔ and no editorial thread exists yet (anchor IS NULL)" "$(echo "$D" | cut -d'|' -f4)" "0"
eq "5d ⛔ no binding invented" "$(echo "$D" | cut -d'|' -f5)" "0"

echo ""
echo "── WHAT THIS RUN DOES NOT AUTHORIZE ──────────────────────────────"
echo "   protected read              ✅ this (read only)"
echo "   rollback                    ⛔ never automatic, never recommended here"
echo "   editorial runtime           ⛔ its own lane, its own act"
echo "   20260903000001 P6 repair    ⚠️ separate lane, untouched"
echo "   W5 S6 vacuity · stub gap    ⚠️ disclosed, unrepaired, not absorbed"
echo ""
echo "  $pass passed · $fail failed"
[ "$fail" -eq 0 ]
