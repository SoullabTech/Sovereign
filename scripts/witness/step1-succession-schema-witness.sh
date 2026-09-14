#!/usr/bin/env bash
# STEP 1 · schema lane — the eleven acceptance facts, against a real database.
#
# ⛔ DISPOSABLE CLUSTER ONLY. It refuses any database whose name does not
# contain `witness`, for the same reason the EW-F2 staging script does: a
# witness that can reach a database someone uses is not a witness.
#
# ⭐ Every fact is asserted on the DATABASE's behaviour, not on the SQL text.
# A constraint that exists and does not fire is not enforcement.
set -u
PGH="${PGH:-/tmp}"; PGP="${PGP:-5599}"; PGU="${PGU:-postgres}"; PGDB="${PGDB:-succession_witness}"
case "$PGDB" in *witness*) ;; *) echo "REFUSED · '$PGDB' is not a witness database."; exit 2;; esac

q() { psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -tAq -c "$1" 2>&1; }
run() { psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -v ON_ERROR_STOP=1 -tAq -c "$1" 2>&1; }

PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); printf '  PASS  %s\n' "$1"; }
bad()  { FAIL=$((FAIL+1)); printf '  FAIL  %s\n     -> %s\n' "$1" "$2"; }
# Asserts the statement FAILS, and names the constraint/message that refused it.
refuses() { # $1 label  $2 sql  $3 expected fragment
  local out; out="$(q "$2")"
  if printf '%s' "$out" | grep -q "ERROR"; then
    if printf '%s' "$out" | grep -q "$3"; then ok "$1  [$3]"
    else bad "$1" "refused, but not by '$3': $(printf '%s' "$out" | head -1)"; fi
  else bad "$1" "NOT REFUSED"; fi
}

M=11111111-1111-1111-1111-111111111111
run "TRUNCATE proposal_versions, proposal_chains RESTART IDENTITY CASCADE;" >/dev/null 2>&1 || true
run "DELETE FROM proposal_versions; DELETE FROM proposal_chains;" >/dev/null

echo "── STEP 1 · schema acceptance ───────────────────────────────"

C=$(run "INSERT INTO proposal_chains (member_id, work_id, draft_id, base_version, target_section_id, expected_text)
         VALUES ('$M', gen_random_uuid(), gen_random_uuid(), 40, gen_random_uuid(), ', fixated') RETURNING id;")
C2=$(run "INSERT INTO proposal_chains (member_id, work_id, draft_id, base_version, target_section_id, expected_text)
          VALUES ('$M', gen_random_uuid(), gen_random_uuid(), 40, gen_random_uuid(), 'other') RETURNING id;")

# 1 · MAIA v1 → Kelly v2 → MAIA v3 → Kelly v4
V1=$(run "INSERT INTO proposal_versions (chain_id, author, formulation) VALUES ('$C','maia','f1') RETURNING id;")
V2=$(run "INSERT INTO proposal_versions (chain_id, author, formulation, supersedes) VALUES ('$C','member','f2','$V1') RETURNING id;")
V3=$(run "INSERT INTO proposal_versions (chain_id, author, formulation, supersedes) VALUES ('$C','maia','f3','$V2') RETURNING id;")
V4=$(run "INSERT INTO proposal_versions (chain_id, author, formulation, supersedes) VALUES ('$C','member','f4','$V3') RETURNING id;")
GOT=$(q "SELECT string_agg(author || ':' || formulation, ' ' ORDER BY created_at, id) FROM proposal_versions WHERE chain_id='$C';")
[ "$(q "SELECT count(*) FROM proposal_versions WHERE chain_id='$C';")" = "4" ] \
  && ok "1 · four formulations persist, none lost  [$GOT]" \
  || bad "1 · four formulations persist" "$GOT"

# 2 · consecutive same author is LEGAL
CC=$(run "INSERT INTO proposal_chains (member_id, work_id, draft_id, base_version, target_section_id, expected_text)
          VALUES ('$M', gen_random_uuid(), gen_random_uuid(), 1, gen_random_uuid(), 'x') RETURNING id;")
A=$(run "INSERT INTO proposal_versions (chain_id, author, formulation) VALUES ('$CC','maia','a') RETURNING id;")
B=$(run "INSERT INTO proposal_versions (chain_id, author, formulation, supersedes) VALUES ('$CC','maia','b','$A') RETURNING id;")
D=$(run "INSERT INTO proposal_versions (chain_id, author, formulation, supersedes) VALUES ('$CC','member','d','$B') RETURNING id;")
E=$(run "INSERT INTO proposal_versions (chain_id, author, formulation, supersedes) VALUES ('$CC','member','e','$D') RETURNING id;")
SEQ=$(q "WITH RECURSIVE w AS (
           SELECT id, author, 1 n FROM proposal_versions WHERE chain_id='$CC' AND supersedes IS NULL
           UNION ALL SELECT v.id, v.author, w.n+1 FROM proposal_versions v JOIN w ON v.supersedes=w.id)
         SELECT string_agg(author, ',' ORDER BY n) FROM w;")
[ "$SEQ" = "maia,maia,member,member" ] \
  && ok "2 · consecutive same-author versions are legal  [$SEQ]" \
  || bad "2 · consecutive same-author" "$SEQ"

# 3 · predecessor from another chain
refuses "3 · cross-chain predecessor refuses" \
  "INSERT INTO proposal_versions (chain_id, author, formulation, supersedes) VALUES ('$C2','maia','x','$V1');" \
  "proposal_versions_predecessor_same_chain"

# 4 · self-reference
refuses "4 · self-predecessor refuses" \
  "INSERT INTO proposal_versions (id, chain_id, author, formulation, supersedes)
   VALUES ('22222222-2222-2222-2222-222222222222','$C','maia','x','22222222-2222-2222-2222-222222222222');" \
  "proposal_versions_no_self_predecessor"

# 5 · branch
refuses "5 · a branch refuses" \
  "INSERT INTO proposal_versions (chain_id, author, formulation, supersedes) VALUES ('$C','maia','branch','$V2');" \
  "proposal_versions_one_successor"

# 5b · second root
refuses "5b · a second root refuses" \
  "INSERT INTO proposal_versions (chain_id, author, formulation) VALUES ('$C','maia','root2');" \
  "proposal_versions_one_root"

# 6 · CYCLE.
#
# ⚠️ THE FIRST VERSION OF THIS TEST DID NOT TEST CYCLES. It inserted ONE row
# naming a predecessor that did not exist — which is test 3 again — and it
# passed against a DEFERRABLE FK, the exact mutation the enforcement matrix
# claimed would reopen the hole. A mutation that passes means the instrument is
# not testing the property.
#
# ⭐ The discriminating case is TWO ROWS SUPERSEDING EACH OTHER IN ONE
# TRANSACTION. With a NOT DEFERRABLE FK the first insert fails immediately.
# With `DEFERRABLE INITIALLY DEFERRED` both rows land and the commit SUCCEEDS,
# because at commit time each one's predecessor exists — and the database then
# holds a real cycle.
#
# ⛔ So the assertion is on the TABLE afterwards, not on the error text: a
# cycle that was refused leaves nothing behind.
CY1=33333333-3333-3333-3333-333333333333
CY2=44444444-4444-4444-4444-444444444444
psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -q >/dev/null 2>&1 <<CYCLE
BEGIN;
INSERT INTO proposal_versions (id, chain_id, author, formulation, supersedes)
  VALUES ('$CY1','$C','maia','c1','$CY2');
INSERT INTO proposal_versions (id, chain_id, author, formulation, supersedes)
  VALUES ('$CY2','$C','member','c2','$CY1');
COMMIT;
CYCLE
LANDED=$(q "SELECT count(*) FROM proposal_versions WHERE id IN ('$CY1','$CY2');")
[ "$LANDED" = "0" ] \
  && ok "6 · a mutual-succession cycle refuses, and leaves nothing behind" \
  || bad "6 · a cycle refuses" "$LANDED cycle row(s) PERSISTED — the FK is deferrable"

# 7 · immutability
refuses "7a · author cannot be rewritten" \
  "UPDATE proposal_versions SET author='member' WHERE id='$V3';" "append-only"
refuses "7b · formulation cannot be rewritten" \
  "UPDATE proposal_versions SET formulation='rewritten' WHERE id='$V3';" "append-only"
refuses "7c · predecessor cannot be rewritten" \
  "UPDATE proposal_versions SET supersedes='$V1' WHERE id='$V3';" "append-only"
refuses "7d · a version cannot be deleted" \
  "DELETE FROM proposal_versions WHERE id='$V2';" "append-only"

# 8 · head derived, with no stored flag
HEAD=$(q "SELECT formulation FROM proposal_versions v WHERE v.chain_id='$C'
          AND NOT EXISTS (SELECT 1 FROM proposal_versions s WHERE s.supersedes=v.id);")
COLS=$(q "SELECT string_agg(column_name, ',' ORDER BY column_name) FROM information_schema.columns
          WHERE table_name='proposal_versions';")
if [ "$HEAD" = "f4" ]; then
  case "$COLS" in
    *is_head*|*superseded_by*|*current*) bad "8 · head derived" "a stored flag exists: $COLS";;
    *) ok "8 · head derived, and no is_head / superseded_by / current column exists";;
  esac
else bad "8 · head derived" "got '$HEAD'"; fi

# 9 · second locus
refuses "9 · a chain cannot acquire a second locus" \
  "UPDATE proposal_chains SET target_section_id=gen_random_uuid() WHERE id='$C';" \
  "locus is immutable"
G=$(q "UPDATE proposal_chains SET decision_chain_id=gen_random_uuid() WHERE id='$C'; SELECT 'ok';")
[ "$G" = "ok" ] && ok "9b · but a ruling may come to govern a chain (relationship, not identity)" \
                || bad "9b · governing ruling settable" "$G"

# 10 · a ruling cannot become wording or authority
FK=$(q "SELECT count(*) FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage k ON k.constraint_name=tc.constraint_name
        WHERE tc.constraint_type='FOREIGN KEY' AND k.column_name='decision_chain_id';")
VC=$(q "SELECT count(*) FROM information_schema.columns WHERE table_name='proposal_versions'
        AND column_name LIKE '%decision%';")
[ "$FK" = "0" ] && [ "$VC" = "0" ] \
  && ok "10 · no lifecycle path from a ruling into wording (no FK, no column on versions)" \
  || bad "10 · ruling isolation" "fk=$FK versionCols=$VC"

# 11 · nothing here can change manuscript state
WRITE=$(q "SELECT count(*) FROM information_schema.columns WHERE table_name IN ('proposal_versions','proposal_chains')
           AND (column_name LIKE '%accept%' OR column_name LIKE '%execut%' OR column_name LIKE '%applied%'
                OR column_name LIKE '%resulting%' OR column_name LIKE '%authoriz%');")
REFS=$(q "SELECT count(*) FROM information_schema.table_constraints tc
          JOIN information_schema.constraint_column_usage c ON c.constraint_name=tc.constraint_name
          WHERE tc.constraint_type='FOREIGN KEY' AND tc.table_name IN ('proposal_versions','proposal_chains')
          AND c.table_name LIKE 'manuscript%';")
[ "$WRITE" = "0" ] && [ "$REFS" = "0" ] \
  && ok "11 · no accept/execute/authorize column, and no FK into any manuscript table" \
  || bad "11 · no write capability" "cols=$WRITE manuscriptFKs=$REFS"

echo
echo "  $PASS passed · $FAIL failed"
[ "$FAIL" -eq 0 ] || exit 1
