#!/usr/bin/env bash
# W5-LANDING-02 · GATE B — THE NARROW CARRIER, PROVEN ON A DISPOSABLE DATABASE.
#
# ⭐⭐ THE QUESTION GATE B EXISTS FOR:
#
#     Gate A established WHAT the runner would attempt. Gate B establishes
#     WHAT HAPPENS WHEN IT DOES — on a real database, from the real base
#     schema, through the repository's own migration runner.
#
# ⛔ DISPOSABLE DATABASES ONLY. Every database this touches must be named
# `*witness*`, and it takes a LOCAL CLUSTER SOCKET, never a DSN — it cannot
# reach the protected host, by construction.
#
# ⛔ NOTHING HERE AUTHORIZES A PRODUCTION MIGRATION, A DEPLOY, OR A MERGE.
#
# ── THE SIX OBLIGATIONS, AS RULED ─────────────────────────────────────────
#
#   B1  exactly five migration files added, and nothing else in that directory
#   B2  all five blob hashes exact against the founder's pins
#   B3  fresh/base schema → the five execute in order
#   B4  postconditions after EACH, including what must still be ABSENT
#   B5  the W5-LANDING-01 census reads LANDED 5 · DRIFT 0 · PARTIAL 0
#   B6  ⭐⭐ the existing Ask thread remains an ORDINARY Ask thread — no
#       backfill, no invented chain relationship
#
# ── ⭐ TWO DATABASES, AND WHY ─────────────────────────────────────────────
#
#   SEQ    the five applied ONE AT A TIME, postconditions read after each.
#          This is where B4 lives.
#   BULK   all five dropped in together and THE RUNNER chooses the order.
#          This is where B3 lives, because in SEQ the order is mine.
#
# ⛔ Their final schemas are then compared. If applying them one at a time and
# letting the runner do it produce different schemas, the package is not a
# package — and neither database alone could tell you.
set -u

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT" || exit 2

BASE_SHA="${GATE_B_BASE:-1a5554300e855d3581085849301a39cbb10ab385}"
CENSUS_REF="${GATE_B_CENSUS_REF:-origin/claude/w4-2-schema-design}"
CENSUS_PATH="scripts/witness/w5-landing-01-lane-census.sql"
PGH="${PGH:-/tmp}"; PGP="${PGP:-5599}"; PGU="${PGU:-postgres}"
SEQ_DB="${SEQ_DB:-gateb_witness_seq}"
BULK_DB="${BULK_DB:-gateb_witness_bulk}"

for d in "$SEQ_DB" "$BULK_DB"; do
  case "$d" in *witness*) ;; *) echo "REFUSED · '$d' is not a witness database."; exit 2;; esac
done

PINS="45b7578d88a1990d82fbb7e575734c0a48e69eca 20260914000001_proposal_succession.sql
df200edfb66fde4aecfe8d57ddc6d439c2ec4274 20260914000002_manuscript_revision_offers.sql
44ae7019e102677aaaf083b970eb4d893731f9e8 20260914000003_proposal_chains_member_identity.sql
beb02f67ad837dfc802dad413f0839d2e95607f0 20260914000004_manuscript_revision_authorizations.sql
7215e1bb59314e4d1302069373faf01c988abe9e 20260914000005_editorial_ontology.sql"
FIVE="$(echo "$PINS" | awk '{print $2}')"

T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
pass=0; fail=0
ok(){  pass=$((pass+1)); printf "  PASS  %s\n" "$1"; }
bad(){ fail=$((fail+1)); printf "  FAIL  %s\n     -> %s\n" "$1" "$2"; }
eq(){  if [ "$2" = "$3" ]; then ok "$1"; else bad "$1" "want [$3] got [$2]"; fi; }

URL=""
q(){ psql "$URL" -X -q -t -A -c "$1" 2>&1 | tr -d ' '; }
present(){ # present <label> <sql-boolean>
  if [ "$(q "$2")" = t ]; then ok "$1"; else bad "$1" "expected PRESENT, the database says no"; fi; }
absent(){
  if [ "$(q "$2")" = f ]; then ok "$1"; else bad "$1" "expected ABSENT — it is already there"; fi; }
TBL(){ echo "select to_regclass('public.$1') is not null"; }
COL(){ echo "select exists(select 1 from information_schema.columns where table_name='$1' and column_name='$2')"; }
IDX(){ echo "select exists(select 1 from pg_class where relname='$1' and relkind='i')"; }
UNQ(){ echo "select exists(select 1 from pg_index i join pg_class c on c.oid=i.indexrelid where c.relname='$1' and i.indisunique)"; }
CON(){ echo "select exists(select 1 from pg_constraint where conname='$1')"; }
FN(){  echo "select exists(select 1 from pg_proc where proname='$1')"; }
TRG(){ echo "select exists(select 1 from pg_trigger where tgname='$1' and not tgisinternal)"; }

echo ""
echo "══════════════════════════════════════════════════════════════════"
echo " W5-LANDING-02 · GATE B — NARROW CARRIER ON A DISPOSABLE DATABASE"
echo "══════════════════════════════════════════════════════════════════"
echo " base    $BASE_SHA"
echo " cluster $PGH:$PGP  (local socket — the protected host is unreachable)"
echo ""

# ══ B1/B2 · THE CARRIER'S SHAPE ═══════════════════════════════════════
echo "── B1/B2 · the carrier: exactly five files, exact bytes ──────────"
git rev-parse --verify --quiet "$BASE_SHA^{commit}" >/dev/null || {
  echo "  ⛔ REFUSED — unknown base: $BASE_SHA"; exit 2; }

git diff --name-status "$BASE_SHA" HEAD -- database/migrations/ > "$T/dmig"
ADD=$(awk '$1=="A"' "$T/dmig" | wc -l | tr -d ' ')
OTH=$(awk '$1!="A"' "$T/dmig" | wc -l | tr -d ' ')
eq "B1 exactly five files ADDED under database/migrations" "$ADD" "5"
eq "B1 ⛔ and nothing there modified, deleted or renamed" "$OTH" "0"
if [ "$(awk '$1=="A"{sub(".*/","",$2);print $2}' "$T/dmig" | sort)" = "$(echo "$FIVE" | sort)" ]; then
  ok "B1 ⭐ and they are exactly the five named in the package"
else bad "B1 the added set is not the five" "$(awk '$1=="A"{print $2}' "$T/dmig" | tr '\n' ' ')"; fi

pf=0
while read -r want name; do
  [ -n "$name" ] || continue
  got="$(git rev-parse --verify --quiet "HEAD:database/migrations/$name" || echo MISSING)"
  [ "$got" = "$want" ] || { bad "B2 $name" "want $want got $got"; pf=1; }
done <<< "$PINS"
[ "$pf" = 0 ] && ok "B2 ⭐ all five blobs byte-identical to the founder's pins (asserted, not copied)"

# ⭐ The carrier must not have picked up anything ELSE from the evidence lane.
git diff --name-only "$BASE_SHA" HEAD | grep -v '^database/migrations/' | grep -v '^docs/programme/' \
  | grep -v '^scripts/witness/w5-gate-b-landing' > "$T/other" || true
if [ -s "$T/other" ]; then
  bad "B1 ⛔ the carrier carries files beyond migrations + its own record/witness" "$(tr '\n' ' ' < "$T/other")"
else ok "B1 ⛔ nothing beyond the five, this witness, and its record"; fi

# ══ BASE STATE ════════════════════════════════════════════════════════
echo ""
echo "── base state · the real bootstrap, the real runner ──────────────"
BM="$T/basemigs"; mkdir -p "$BM"
git archive "$BASE_SHA" database/migrations | tar -x -C "$BM" --strip-components=2
echo "   base migration files      $(ls "$BM" | grep -c '\.sql$') .sql"

build_base(){ # build_base <db>
  psql -h "$PGH" -p "$PGP" -U "$PGU" -d postgres -X -q \
    -c "DROP DATABASE IF EXISTS $1;" -c "CREATE DATABASE $1;" >/dev/null 2>&1
  local u="postgresql://$PGU@/$1?host=$PGH&port=$PGP"
  DATABASE_URL="$u" MIG_DIR="$BM" bash scripts/bootstrap-database.sh  >"$T/boot.$1.log"  2>&1 || return 1
  DATABASE_URL="$u" MIG_DIR="$BM" bash scripts/apply-migrations.sh    >"$T/apply.$1.log" 2>&1 || return 1
}

build_base "$SEQ_DB" || { echo "  ⛔ REFUSED — base state failed; see $T/*.log"; exit 2; }
URL="postgresql://$PGU@/$SEQ_DB?host=$PGH&port=$PGP"
LEDGER0="$(q 'select count(*) from schema_migrations')"
echo "   ledger rows at base       $LEDGER0"
echo "   ⭐ 51 of those are ledger-only (source file gone) — the"
echo "      BASELINE-SUBSUMED class Gate A was repaired to recognise."

# ⛔ NOTHING OF THE FIVE MAY EXIST YET. If it does, the base is not the base.
absent "base ⛔ proposal_chains absent"                 "$(TBL proposal_chains)"
absent "base ⛔ proposal_versions absent"               "$(TBL proposal_versions)"
absent "base ⛔ manuscript_revision_offers absent"      "$(TBL manuscript_revision_offers)"
absent "base ⛔ manuscript_revision_authorizations absent" "$(TBL manuscript_revision_authorizations)"
absent "base ⛔ proposal_chain_insights absent"         "$(TBL proposal_chain_insights)"
absent "base ⛔ proposal_chain_directions absent"       "$(TBL proposal_chain_directions)"
absent "base ⛔ ask_threads.proposal_chain_id absent"   "$(COL ask_threads proposal_chain_id)"

# ══ B6 fixture · AN ORDINARY ASK THREAD, SPOKEN BEFORE THE EDITORIAL OBJECT
echo ""
echo "── B6 fixture · an ordinary Ask thread, opened BEFORE the five ───"
psql "$URL" -X -q -v ON_ERROR_STOP=1 >"$T/fixture.log" 2>&1 <<'SQL'
BEGIN;
INSERT INTO members (id, passkey, username, password_hash)
VALUES ('11111111-1111-4111-8111-111111111111','GATEB-WITNESS','gateb_witness','x');
INSERT INTO member_manuscripts (id, member_id)
VALUES ('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111');
INSERT INTO manuscript_working_drafts (id, manuscript_id, member_id, content, base_source_hash)
VALUES ('33333333-3333-4333-8333-333333333333','22222222-2222-4222-8222-222222222222',
        '11111111-1111-4111-8111-111111111111','Before the water.','sha-gateb');
INSERT INTO manuscript_draft_sections (id, draft_id, position, text)
VALUES ('44444444-4444-4444-8444-444444444444','33333333-3333-4333-8333-333333333333',1,'Before the water.');
INSERT INTO ask_threads (id, manuscript_id, member_id, anchor, canonical_at_open, initiated_by)
VALUES ('55555555-5555-4555-8555-555555555555','22222222-2222-4222-8222-222222222222',
        '11111111-1111-4111-8111-111111111111','{"kind":"section","sectionId":"44444444-4444-4444-8444-444444444444"}',
        'sha-gateb','author');
COMMIT;
SQL
[ "$(q "select count(*) from ask_threads where id='55555555-5555-4555-8555-555555555555'")" = 1 ] \
  && ok "B6 the thread exists before any editorial object does" \
  || { bad "B6 fixture" "$(tail -3 "$T/fixture.log")"; }
# ⭐⭐ NAMED COLUMNS, AND THE FIRST VERSION OF THIS LINE WAS WRONG.
# It hashed `t.*::text`, which NECESSARILY changes when 000005 adds a column —
# so it could never distinguish "the thread was altered" from "the table gained
# a column", and it reported a change that had not happened. The obligation was
# always about the columns the thread had WHEN IT WAS SPOKEN.
TCOLS="id,manuscript_id,member_id,anchor,reading_identity,canonical_at_open,initiated_by,opened_at"
THREAD_BEFORE="$(q "select md5(row($TCOLS)::text) from ask_threads where id='55555555-5555-4555-8555-555555555555'")"
echo "   thread row digest (base)  $THREAD_BEFORE"

# ══ B3/B4 · THE FIVE, ONE AT A TIME ═══════════════════════════════════
echo ""
echo "── B3/B4 · the five applied one at a time, in filename order ─────"
# ⭐⭐ THE FIVE ARE STAGED FROM HEAD'S BLOBS, NOT FROM THE WORKING TREE.
#
# ⛔ A MUTANT FOUND THIS. B2 verifies the blob at HEAD; the first version of
# this loop then applied `database/migrations/$m` FROM DISK. On a clean tree
# they agree — but an uncommitted edit made the witness APPLY mutated SQL while
# reporting the pins as exact. The gate would have proven the wrong artifact and
# said nothing. It is Gate A's §0 defect again, one level down: *what was
# verified and what was used must be the same bytes.*
STAGE="$T/stage"; cp -r "$BM" "$STAGE"
git diff --quiet HEAD -- database/migrations/ \
  || { echo "  ⛔ REFUSED — database/migrations/ differs from HEAD. The carrier"
       echo "     must be a committed artifact; an uncommitted edit is not one."
       exit 2; }
step=0
for m in $FIVE; do
  step=$((step+1))
  git cat-file blob "HEAD:database/migrations/$m" > "$STAGE/$m"
  if ! DATABASE_URL="$URL" MIG_DIR="$STAGE" bash scripts/apply-migrations.sh >"$T/step$step.log" 2>&1; then
    bad "B3 step $step · $m FAILED TO APPLY" "$(grep -iE 'error|fail' "$T/step$step.log" | head -3)"
    echo "  ⛔ Gate B stops: a migration that does not apply has no postconditions."
    echo ""; echo "  $pass passed · $fail failed"; exit 1
  fi
  ok "B3 step $step applied · $m"
  eq "B3 step $step ⭐ ledger grew by exactly one" \
     "$(q 'select count(*) from schema_migrations')" "$((LEDGER0 + step))"

  case $step in
  1)
    present "B4.1 proposal_chains"                   "$(TBL proposal_chains)"
    present "B4.1 proposal_versions"                 "$(TBL proposal_versions)"
    present "B4.1 proposal_chains_member_idx"        "$(IDX proposal_chains_member_idx)"
    present "B4.1 proposal_chains_target_idx"        "$(IDX proposal_chains_target_idx)"
    present "B4.1 ⭐ proposal_versions_one_successor is UNIQUE" "$(UNQ proposal_versions_one_successor)"
    present "B4.1 ⭐ proposal_versions_one_root is UNIQUE"      "$(UNQ proposal_versions_one_root)"
    present "B4.1 refuse_proposal_version_mutation()" "$(FN refuse_proposal_version_mutation)"
    present "B4.1 refuse_proposal_chain_mutation()"   "$(FN refuse_proposal_chain_mutation)"
    present "B4.1 proposal_versions_immutable"        "$(TRG proposal_versions_immutable)"
    present "B4.1 proposal_chains_immutable"          "$(TRG proposal_chains_immutable)"
    absent  "B4.1 ⛔ and NOTHING from 000002 yet"     "$(TBL manuscript_revision_offers)"
    absent  "B4.1 ⛔ nor from 000003"                 "$(CON proposal_chains_member_id_id_key)"
    absent  "B4.1 ⛔ nor from 000004"                 "$(TBL manuscript_revision_authorizations)"
    absent  "B4.1 ⛔ nor from 000005"                 "$(COL ask_threads proposal_chain_id)"
    ;;
  2)
    present "B4.2 manuscript_revision_offers"        "$(TBL manuscript_revision_offers)"
    present "B4.2 idx_manuscript_revision_offers_section" "$(IDX idx_manuscript_revision_offers_section)"
    present "B4.2 idx_manuscript_revision_offers_thread"  "$(IDX idx_manuscript_revision_offers_thread)"
    present "B4.2 idx_manuscript_revision_offers_draft"   "$(IDX idx_manuscript_revision_offers_draft)"
    present "B4.2 manuscript_revision_offers_freeze()"    "$(FN manuscript_revision_offers_freeze)"
    present "B4.2 ⭐ producer_required() — MAIA may not author anonymously" \
            "$(FN manuscript_revision_offers_producer_required)"
    present "B4.2 producer_check trigger"            "$(TRG manuscript_revision_offers_producer_check)"
    present "B4.2 freeze_check trigger"              "$(TRG manuscript_revision_offers_freeze_check)"
    absent  "B4.2 ⛔ and still nothing from 000003"   "$(CON proposal_chains_member_id_id_key)"
    absent  "B4.2 ⛔ nor 000004"                      "$(TBL manuscript_revision_authorizations)"
    absent  "B4.2 ⛔ nor 000005"                      "$(COL ask_threads proposal_chain_id)"
    ;;
  3)
    present "B4.3 ⭐⭐ proposal_chains_member_id_id_key UNIQUE (member_id, id)" \
            "$(CON proposal_chains_member_id_id_key)"
    eq "B4.3 ⭐ and it really is UNIQUE, not merely named so" \
       "$(q "select contype from pg_constraint where conname='proposal_chains_member_id_id_key'")" "u"
    absent  "B4.3 ⛔ and still nothing from 000004"   "$(TBL manuscript_revision_authorizations)"
    absent  "B4.3 ⛔ nor 000005"                      "$(COL ask_threads proposal_chain_id)"
    ;;
  4)
    present "B4.4 manuscript_revision_authorizations" "$(TBL manuscript_revision_authorizations)"
    present "B4.4 idx_mra_member_work"                "$(IDX idx_mra_member_work)"
    present "B4.4 idx_mra_unspent"                    "$(IDX idx_mra_unspent)"
    present "B4.4 ⭐ uq_mra_one_unspent_permission is UNIQUE" "$(UNQ uq_mra_one_unspent_permission)"
    present "B4.4 refuse_mra_identity_mutation()"     "$(FN refuse_mra_identity_mutation)"
    present "B4.4 mra_identity_immutable"             "$(TRG mra_identity_immutable)"
    absent  "B4.4 ⛔ and still nothing from 000005"    "$(COL ask_threads proposal_chain_id)"
    ;;
  5)
    present "B4.5 proposal_chains_member_work_id_key" "$(CON proposal_chains_member_work_id_key)"
    present "B4.5 ask_threads.proposal_chain_id"      "$(COL ask_threads proposal_chain_id)"
    present "B4.5 ask_threads_proposal_chain_fkey"    "$(CON ask_threads_proposal_chain_fkey)"
    present "B4.5 idx_ask_threads_proposal_chain"     "$(IDX idx_ask_threads_proposal_chain)"
    present "B4.5 proposal_chain_insights"            "$(TBL proposal_chain_insights)"
    present "B4.5 proposal_chain_directions"          "$(TBL proposal_chain_directions)"
    present "B4.5 authored_editorial_record_immutable()" "$(FN authored_editorial_record_immutable)"
    present "B4.5 insights_no_update"                 "$(TRG proposal_chain_insights_no_update)"
    present "B4.5 insights_no_delete"                 "$(TRG proposal_chain_insights_no_delete)"
    present "B4.5 directions_no_update"               "$(TRG proposal_chain_directions_no_update)"
    present "B4.5 directions_no_delete"               "$(TRG proposal_chain_directions_no_delete)"
    eq "B4.5 ⭐⭐ the composite FK is MATCH SIMPLE — an unbound thread is not checked" \
       "$(q "select confmatchtype from pg_constraint where conname='ask_threads_proposal_chain_fkey'")" "s"
    eq "B4.5 ⛔ ON DELETE RESTRICT — deleting a chain never deletes a conversation" \
       "$(q "select confdeltype from pg_constraint where conname='ask_threads_proposal_chain_fkey'")" "r"
    eq "B4.5 ⛔ and the column is NULLABLE — binding is optional by construction" \
       "$(q "select is_nullable from information_schema.columns where table_name='ask_threads' and column_name='proposal_chain_id'")" "YES"
    ;;
  esac
done

# ══ B6 · THE ASK THREAD IS STILL AN ORDINARY ASK THREAD ═══════════════
echo ""
echo "── B6 ⭐⭐ the existing Ask thread, after all five ─────────────────"
eq "B6 ⛔ NO BACKFILL — proposal_chain_id is NULL" \
   "$(q "select coalesce(proposal_chain_id::text,'NULL') from ask_threads where id='55555555-5555-4555-8555-555555555555'")" "NULL"
eq "B6 ⛔ NO INVENTED CHAIN — proposal_chains is empty" \
   "$(q 'select count(*) from proposal_chains')" "0"
eq "B6 ⛔ nor an invented version, insight or direction" \
   "$(q 'select (select count(*) from proposal_versions)+(select count(*) from proposal_chain_insights)+(select count(*) from proposal_chain_directions)')" "0"
eq "B6 ⭐ and every column the thread had BEFORE is UNCHANGED" \
   "$(q "select md5(row($TCOLS)::text) from ask_threads where id='55555555-5555-4555-8555-555555555555'")" "$THREAD_BEFORE"

# ⭐⭐ THE DECISIVE ONE. Absence of backfill is weak evidence; IMPOSSIBILITY of
# backfill is strong. A historical thread cannot be attached to a chain later.
psql "$URL" -X -q -v ON_ERROR_STOP=1 >"$T/backfill.log" 2>&1 <<'SQL'
INSERT INTO proposal_chains
  (id, member_id, work_id, draft_id, base_version, target_section_id, expected_text)
VALUES ('66666666-6666-4666-8666-666666666666','11111111-1111-4111-8111-111111111111',
        '22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333',
        1,'44444444-4444-4444-8444-444444444444','Before the water.');
UPDATE ask_threads SET proposal_chain_id='66666666-6666-4666-8666-666666666666'
 WHERE id='55555555-5555-4555-8555-555555555555';
SQL
if grep -qi "a thread cannot be re-pointed" "$T/backfill.log"; then
  ok "B6 ⭐⭐ a later attempt to BIND the historical thread is REFUSED by the freeze"
elif grep -qiE "error" "$T/backfill.log"; then
  bad "B6 the backfill attempt failed for the WRONG reason" "$(grep -iE 'error' "$T/backfill.log" | head -2)"
else
  bad "B6 ⛔⛔ THE HISTORICAL THREAD WAS SUCCESSFULLY BACKFILLED" "the freeze did not refuse it"
fi
eq "B6 ⛔ and it is still NULL afterwards" \
   "$(q "select coalesce(proposal_chain_id::text,'NULL') from ask_threads where id='55555555-5555-4555-8555-555555555555'")" "NULL"

# ⭐ An ordinary Ask thread must still be OPENABLE, unbound, after the five.
psql "$URL" -X -q -v ON_ERROR_STOP=1 >"$T/newthread.log" 2>&1 <<'SQL'
INSERT INTO ask_threads (id, manuscript_id, member_id, anchor, canonical_at_open, initiated_by)
VALUES ('77777777-7777-4777-8777-777777777777','22222222-2222-4222-8222-222222222222',
        '11111111-1111-4111-8111-111111111111','{"kind":"section","sectionId":"44444444-4444-4444-8444-444444444444"}',
        'sha-gateb','author');
SQL
eq "B6 ⭐ a NEW ordinary Ask thread still opens unbound (MATCH SIMPLE, not FULL)" \
   "$(q "select coalesce(proposal_chain_id::text,'NULL') from ask_threads where id='77777777-7777-4777-8777-777777777777'")" "NULL"

# ══ B3 · THE RUNNER'S OWN ORDER, ON A SECOND DATABASE ═════════════════
echo ""
echo "── B3 ⭐ the runner's own order, all five at once ─────────────────"
if build_base "$BULK_DB"; then
  BURL="postgresql://$PGU@/$BULK_DB?host=$PGH&port=$PGP"
  BSTAGE="$T/bstage"; cp -r "$BM" "$BSTAGE"
  for m in $FIVE; do git cat-file blob "HEAD:database/migrations/$m" > "$BSTAGE/$m"; done
  if DATABASE_URL="$BURL" MIG_DIR="$BSTAGE" bash scripts/apply-migrations.sh >"$T/bulk.log" 2>&1; then
    ok "B3 ⭐ all five applied in one runner pass"
    ORDER="$(psql "$BURL" -X -q -t -A -c \
      "select string_agg(filename,',' order by applied_at, filename) from schema_migrations where filename like '20260914%'")"
    eq "B3 ⭐⭐ and the runner's order IS filename order" "$ORDER" "$(echo "$FIVE" | paste -sd,)"
    # ⭐ THE COMPARISON. One-at-a-time and all-at-once must agree.
    # ⛔ pg_dump wraps its output in `\restrict <random token>` psql meta-commands.
    # They are NOT SQL and the token differs per invocation, so an unstripped diff
    # reports a schema difference that does not exist — which is exactly what it
    # did here first. Stripped by the same rule, and for the same reason, as
    # scripts/capture-baseline.sh.
    dump(){ pg_dump "$1" --schema-only --no-owner --no-privileges --quote-all-identifiers 2>/dev/null \
            | sed -E '/^\\(restrict|unrestrict) /d'; }
    dump "$URL"  > "$T/seq.sql"
    dump "$BURL" > "$T/bulk.sql"
    if diff -q "$T/seq.sql" "$T/bulk.sql" >/dev/null; then
      ok "B3 ⭐⭐ the two databases' schemas are IDENTICAL — the order is not mine"
    else
      bad "B3 one-at-a-time and all-at-once DISAGREE" "$(diff "$T/seq.sql" "$T/bulk.sql" | head -6 | tr '\n' ' ')"
    fi
  else
    bad "B3 the bulk pass failed" "$(grep -iE 'error|fail' "$T/bulk.log" | head -3)"
  fi
else
  bad "B3 could not build the bulk base state" "see $T/boot.$BULK_DB.log"
fi

# ══ B5 · THE W5-LANDING-01 CENSUS ═════════════════════════════════════
echo ""
echo "── B5 · the W5-LANDING-01 census, unmodified, from its own lane ──"
echo "   census ref  $CENSUS_REF:$CENSUS_PATH"
if git cat-file -e "$CENSUS_REF:$CENSUS_PATH" 2>/dev/null; then
  git cat-file blob "$CENSUS_REF:$CENSUS_PATH" > "$T/census.sql"
  echo "   census blob $(git rev-parse "$CENSUS_REF:$CENSUS_PATH")"
  psql "$URL" -X -f "$T/census.sql" > "$T/census.out" 2>&1
  # ⛔ ROW-SCOPED, AND THE C21 CLASS COST A FAILURE HERE TOO. `grep -c DRIFT`
  # counted the census's OWN LEGEND — the sentence "DRIFT and it is NOT resolved
  # here" — and reported drift in a database that had none. A prohibition must
  # never fire on the prose that documents it.
  grep -E '^ *20[0-9]{12}_[^|]*\|[^|]*\|[^|]*\|' "$T/census.out" > "$T/derived" || true
  DR=$(wc -l < "$T/derived" | tr -d ' ')
  # ⭐ ANTI-VACUITY. If the extraction matched nothing, every count below would
  # be zero and every obligation would pass while judging nothing at all.
  eq "B5 ⭐ the census emitted five derived-state rows to judge" "$DR" "5"
  eq "B5 ⭐⭐ LANDED 5"  "$(grep -c 'LANDED'  "$T/derived" || true)" "5"
  eq "B5 ⛔ DRIFT 0"    "$(grep -c 'DRIFT'   "$T/derived" || true)" "0"
  eq "B5 ⛔ PARTIAL 0"  "$(grep -c 'PARTIAL' "$T/derived" || true)" "0"
  eq "B5 ⛔ PENDING 0"  "$(grep -c 'PENDING' "$T/derived" || true)" "0"
else
  bad "B5 the census is not reachable at $CENSUS_REF" "fetch the evidence lane, or pass GATE_B_CENSUS_REF"
fi

echo ""
echo "── WHAT THIS RUN DOES NOT AUTHORIZE ──────────────────────────────"
echo "   disposable-database proof   ✅ this"
echo "   production execution        ⛔"
echo "   canonical merge             ⛔"
echo "   deployment                  ⛔"
echo "   20260903000001 reconciled   ⛔ still an independent custody finding"
echo ""
echo "  $pass passed · $fail failed"
[ "$fail" -eq 0 ]
