#!/usr/bin/env bash
# STEP 2 · schema lane — the acceptance facts, against a real database.
#
# ⛔ DISPOSABLE CLUSTER ONLY — it refuses any database whose name lacks
# `witness`, for the same reason the Step 1 witness does: an instrument that can
# reach a database someone uses is not an instrument.
#
# ⭐ Every fact is asserted on the DATABASE's behaviour, never on SQL text. A
# constraint that exists and does not fire is not enforcement — and the
# transition below is PROVEN BY PERFORMING IT, not by grepping a trigger.
set -u
PGH="${PGH:-/tmp}"; PGP="${PGP:-5599}"; PGU="${PGU:-postgres}"; PGDB="${PGDB:-step2_witness}"
case "$PGDB" in *witness*) ;; *) echo "REFUSED · '$PGDB' is not a witness database."; exit 2;; esac

q() { psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -tAq -c "$1" 2>&1; }
run() { psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -v ON_ERROR_STOP=1 -tAq -c "$1" 2>&1; }

PASS=0; FAIL=0
ok()  { PASS=$((PASS+1)); printf '  PASS  %s\n' "$1"; }
bad() { FAIL=$((FAIL+1)); printf '  FAIL  %s\n     -> %s\n' "$1" "$2"; }
refuses() {
  local out; out="$(q "$2")"
  if printf '%s' "$out" | grep -q "ERROR"; then
    if printf '%s' "$out" | grep -q "$3"; then ok "$1  [$3]"
    else bad "$1" "refused, but not by '$3': $(printf '%s' "$out" | head -1)"; fi
  else bad "$1" "NOT REFUSED"; fi
}

M=11111111-1111-1111-1111-111111111111
M2=55555555-5555-5555-5555-555555555555
run "INSERT INTO members (id) VALUES ('$M'),('$M2') ON CONFLICT DO NOTHING;" >/dev/null 2>&1

echo "── STEP 2 · authorization schema acceptance ──────────────────"

mkchain() { # $1 member  → chain id
  run "INSERT INTO proposal_chains (member_id, work_id, draft_id, base_version, target_section_id, expected_text)
       VALUES ('$1', gen_random_uuid(), gen_random_uuid(), 40, gen_random_uuid(), ', fixated') RETURNING id;"
}
mkver() { # $1 chain  $2 author  $3 text  $4 supersedes|NULL
  run "INSERT INTO proposal_versions (chain_id, author, formulation, supersedes)
       VALUES ('$1','$2','$3',$4) RETURNING id;"
}

C=$(mkchain "$M");  V1=$(mkver "$C" maia 'f1' NULL); V2=$(mkver "$C" member 'f2' "'$V1'")
C2=$(mkchain "$M"); W1=$(mkver "$C2" maia 'g1' NULL)
CR=$(mkchain "$M2"); R1=$(mkver "$CR" maia 'r1' NULL)

mkauth() { # $1 member $2 chain $3 version → id
  run "INSERT INTO manuscript_revision_authorizations
         (member_id, proposal_chain_id, proposal_version_id, work_id, draft_id,
          base_version, target_section_id, expected_text)
       VALUES ('$1','$2','$3', gen_random_uuid(), gen_random_uuid(), 41,
               gen_random_uuid(), ', fixated') RETURNING id;"
}

A=$(mkauth "$M" "$C" "$V2")
[ -n "$A" ] && [ "${A#ERROR}" = "$A" ] \
  && ok "1 · an authorization names one exact version and persists" \
  || bad "1 · authorization persists" "$A"

# ── 2 · ⭐⭐ THE VERSION BELONGS TO THE CHAIN ──────────────────────────────
refuses "2 · a version from ANOTHER chain refuses" \
  "INSERT INTO manuscript_revision_authorizations
     (member_id, proposal_chain_id, proposal_version_id, work_id, draft_id,
      base_version, target_section_id, expected_text)
   VALUES ('$M','$C','$W1', gen_random_uuid(), gen_random_uuid(), 41,
           gen_random_uuid(), 'x');" \
  "mra_version_belongs_to_chain"

# ── 3 · ⭐⭐ THE MEMBER OWNS THE CHAIN ─────────────────────────────────────
# ⚠️ THE DISCRIMINATING CASE: a real version of a real chain, and a real member
# — only the OWNERSHIP is wrong. The version FK is satisfied; only §5.2 refuses.
refuses "3 · another member's chain refuses, even with a version that fits it" \
  "INSERT INTO manuscript_revision_authorizations
     (member_id, proposal_chain_id, proposal_version_id, work_id, draft_id,
      base_version, target_section_id, expected_text)
   VALUES ('$M','$CR','$R1', gen_random_uuid(), gen_random_uuid(), 41,
           gen_random_uuid(), 'x');" \
  "mra_member_owns_chain"

# ── 4 · the closed operation vocabulary ────────────────────────────────────
refuses "4 · an operation outside the vocabulary refuses" \
  "INSERT INTO manuscript_revision_authorizations
     (member_id, proposal_chain_id, proposal_version_id, work_id, draft_id,
      base_version, target_section_id, expected_text, operation)
   VALUES ('$M','$C','$V1', gen_random_uuid(), gen_random_uuid(), 41,
           gen_random_uuid(), 'x', 'insert_text');" \
  "operation"
OP=$(q "SELECT operation FROM manuscript_revision_authorizations WHERE id='$A';")
[ "$OP" = "replace_exact_text" ] \
  && ok "4b · and the default is the one primitive  [$OP]" \
  || bad "4b · default operation" "$OP"

# ── 5 · the receipt is whole ───────────────────────────────────────────────
refuses "5 · a half receipt refuses at INSERT" \
  "INSERT INTO manuscript_revision_authorizations
     (member_id, proposal_chain_id, proposal_version_id, work_id, draft_id,
      base_version, target_section_id, expected_text, accepted_at)
   VALUES ('$M','$C','$V1', gen_random_uuid(), gen_random_uuid(), 41,
           gen_random_uuid(), 'x', now());" \
  "mra_receipt_whole"
refuses "5b · and a half receipt refuses at UPDATE" \
  "UPDATE manuscript_revision_authorizations SET accepted_at=now() WHERE id='$A';" \
  "mra_receipt_whole"

# ── 6 · ⭐⭐ THE ONE LAWFUL TRANSITION — PROVEN BY PERFORMING IT ───────────
# ⛔ Not by grepping the trigger. The matrix requires the transition to be
# demonstrated, and a trigger whose text looks right may still refuse the act.
SPENT=$(q "UPDATE manuscript_revision_authorizations
             SET accepted_at=now(), resulting_version=42 WHERE id='$A'
           RETURNING resulting_version;")
[ "$SPENT" = "42" ] \
  && ok "6 · ⭐ unspent → spent is PERFORMED, once  [resulting_version=42]" \
  || bad "6 · the lawful transition" "$SPENT"

refuses "6b · ⛔ and a SECOND execution refuses" \
  "UPDATE manuscript_revision_authorizations
      SET accepted_at=now(), resulting_version=43 WHERE id='$A';" \
  "one change, once"
refuses "6c · ⛔ a spent receipt cannot be un-spent" \
  "UPDATE manuscript_revision_authorizations
      SET accepted_at=NULL, resulting_version=NULL WHERE id='$A';" \
  "one change, once"

# ── 7 · identity and binding are immutable ─────────────────────────────────
# ⚠️ B names V1, so every rewrite below must name something DIFFERENT.
# The first draft tried `proposal_version_id='$V1'` on a row that already held
# it — a NO-OP, which `IS DISTINCT FROM` correctly ignores, so the row fell
# through to the receipt check and the test caught the wrong refusal. A mutation
# that changes nothing proves nothing; this programme has now written four.
B=$(mkauth "$M" "$C" "$V1")
for pair in "member_id='$M2':the member" "proposal_version_id='$V2':the version" \
            "expected_text='something else':the expected text" \
            "base_version=99:the base version" "authorized_at=now():the moment"; do
  SET="${pair%%:*}"; LABEL="${pair#*:}"
  refuses "7 · $LABEL cannot be rewritten" \
    "UPDATE manuscript_revision_authorizations SET $SET WHERE id='$B';" \
    "immutable"
done
refuses "7f · an authorization cannot be deleted" \
  "DELETE FROM manuscript_revision_authorizations WHERE id='$B';" \
  "not deleted"

# ── 8 · ⛔ deleting a named version or chain is RESTRICTED ─────────────────
# ⚠️ proposal_versions has its own append-only trigger, so the FK is a SECOND
# guard. This asserts the FK independently by disabling nothing and reading the
# refusal's own name where PostgreSQL gives it.
DEL=$(q "DELETE FROM proposal_chains WHERE id='$C';")
printf '%s' "$DEL" | grep -q "ERROR" \
  && ok "8 · a chain an authorization names cannot be deleted" \
  || bad "8 · chain delete restricted" "NOT REFUSED"

# ── 8b · ⭐⭐ THE VERSION FK'S DELETE ACTION, ISOLATED SO IT CAN BE SEEN.
#
# ⚠️ TWO DRAFTS FAILED TO SEE THIS, AND EACH FAILURE WAS INFORMATIVE.
#
#   1  the first had no version-delete test at all: `M-cascade-version`
#      SURVIVED, because `proposal_versions`' own append-only trigger refuses
#      every DELETE before the foreign key is consulted.
#   2  the second dropped that trigger — and the mutation STILL survived,
#      because the cascade reached `manuscript_revision_authorizations` and
#      THAT table's DELETE trigger refused it:
#        ERROR: an authorization is a durable record of a member act
#               and is not deleted
#
# ⭐ THE SECOND DISCOVERY IS A REAL PROPERTY, NOT AN OBSTACLE: a historical
# authorization is protected TWICE — by the FK's action, and by its own refusal
# to be deleted. ⛔ But two guards in series mean neither can be observed while
# the other stands, so the FK action is isolated here deliberately.
#
# With RESTRICT the FK refuses. With CASCADE the delete would proceed and the
# authorization would be erased — untruthful, because an authorization is
# evidence that the member authorized THAT EXACT formulation, and ordinary
# lifecycle mechanics must not rewrite it.
#
# ⛔ CRASH-SAFE, the F16 discipline: both triggers are recreated unconditionally
# afterwards, so an interrupted run cannot leave this database without them.
restore_guards() {
  run "DROP TRIGGER IF EXISTS proposal_versions_immutable ON proposal_versions;
       CREATE TRIGGER proposal_versions_immutable BEFORE UPDATE OR DELETE ON proposal_versions
         FOR EACH ROW EXECUTE FUNCTION refuse_proposal_version_mutation();
       DROP TRIGGER IF EXISTS mra_identity_immutable ON manuscript_revision_authorizations;
       CREATE TRIGGER mra_identity_immutable
         BEFORE UPDATE OR DELETE ON manuscript_revision_authorizations
         FOR EACH ROW EXECUTE FUNCTION refuse_mra_identity_mutation();" >/dev/null 2>&1
}
restore_guards
run "DROP TRIGGER IF EXISTS proposal_versions_immutable ON proposal_versions;
     DROP TRIGGER IF EXISTS mra_identity_immutable ON manuscript_revision_authorizations;" >/dev/null 2>&1
VDEL=$(q "DELETE FROM proposal_versions WHERE id='$V2';")
SURVIVES=$(q "SELECT count(*) FROM manuscript_revision_authorizations WHERE id='$A';")
restore_guards
if printf '%s' "$VDEL" | grep -q "ERROR" && [ "$SURVIVES" = "1" ]; then
  ok "8b · ⭐ the version FK itself REFUSES the delete — RESTRICT, not CASCADE"
else
  bad "8b · the version FK is RESTRICT, not CASCADE" \
    "delete=$(printf '%s' "$VDEL" | head -1) · authorization rows remaining=$SURVIVES"
fi

# ── 9 · ⭐⭐ THE ONTOLOGY ABSENCES (matrix §4) ─────────────────────────────
absent() { # $1 table  $2 pattern  $3 label
  local n; n=$(q "SELECT count(*) FROM information_schema.columns
                   WHERE table_name='$1' AND column_name ~ '$2';")
  [ "$n" = "0" ] && ok "9 · $1 has no $3" || bad "9 · $1 · $3" "$n column(s)"
}
absent manuscript_revision_authorizations 'replacement|proposed_text|rationale' 'authored wording'
absent manuscript_revision_authorizations 'execution_authority|inspection' 'authority flag'
absent manuscript_revision_authorizations 'head|current|latest' 'head/current field'
absent manuscript_revision_authorizations 'thread_id|produced_in_turn' 'producer provenance'
absent manuscript_revision_authorizations 'decision_chain' 'ruling reference'
absent manuscript_revision_offers 'accepted_at|resulting_version|execution_authority' 'execution capability'
absent manuscript_revision_offers 'supersedes|chain_id' 'succession column'

# ── 10 · the offer kept its earned semantics ──────────────────────────────
OFFER_C=$(q "SELECT count(*) FROM pg_constraint
              WHERE conrelid='manuscript_revision_offers'::regclass AND contype='c';")
OFFER_T=$(q "SELECT count(*) FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
              WHERE NOT t.tgisinternal AND c.relname='manuscript_revision_offers';")
[ "$OFFER_C" -ge 6 ] && [ "$OFFER_T" = "2" ] \
  && ok "10 · the offer kept its CHECKs and both triggers  [$OFFER_C checks · $OFFER_T triggers]" \
  || bad "10 · offer semantics preserved" "checks=$OFFER_C triggers=$OFFER_T"

DECLINE=$(q "SELECT count(*) FROM information_schema.columns
              WHERE table_name='manuscript_revision_offers' AND column_name='declined_at';")
[ "$DECLINE" = "1" ] \
  && ok "10b · and declining is still the member's one disposition" \
  || bad "10b · declined_at" "$DECLINE"

echo
echo "  $PASS passed · $FAIL failed"
[ "$FAIL" -eq 0 ] || exit 1
