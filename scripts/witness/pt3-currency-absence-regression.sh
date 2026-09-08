#!/bin/sh
# PT-3 §VIII — SOURCE-CURRENCY ABSENCE REGRESSION. DISPOSABLE DATABASES ONLY.
#
# AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §V–§VIII (disposable rehearsal).
#
#   OWNER_DATABASE_URL=postgresql://soullab:…@127.0.0.1:5432/…_shadow \
#   PT3_REGRESSION_CONFIRM=1 sh scripts/witness/pt3-currency-absence-regression.sh
#
# ⭐ WHY THIS EXISTS. The repaired I4/I6 admit two lawful absences of Source currency. Without a
# negative control, that repair degrades into "NULL is always okay" — which it is not.
#
#   NULL MUST BE EXPLAINABLE.
#
# Four fixtures, and the two that must FAIL matter as much as the two that must PASS:
#
#   1 MULTI-ARRIVAL   two arrivals, an unacted representation, an open ambiguity record   → PASS
#   2 WITHDRAWAL      a governed member withdrawal ended currency; sections retained      → PASS
#   3 NEGATIVE        sections, no currency, no withdrawal, no ambiguity record           → FAIL
#   4 UNRECORDED      a representation with no act and no ambiguity record                → FAIL
#   5 STALE WITHDRAWAL  an OLD lawful withdrawal, then a LATER unexplained loss           → FAIL
#
# ⛔ Do not weaken 3, 4 or 5 to obtain green. They are the reason the repair is not an escape hatch.
# Case 5 is what makes the withdrawal rule falsifiable rather than merely demonstrating the friendly
# case: cases 1-4 contain no withdrawal followed by anything, so a predicate that accepted ANY
# historical withdrawal passed all four while letting a stale one mask a newer loss.
#
# The invariants themselves are NOT re-typed here: they are sourced from the same file the
# post-cutover witness sources. An instrument that restates the law it tests can pass while the law
# it claims to test has drifted away from it.
#
# Fixtures are created by the OWNER, including states no lawful path can produce — that is the
# point of a negative control — and every fixture is destroyed in a rollback at the end.

set -eu
: "${OWNER_DATABASE_URL:?set OWNER_DATABASE_URL to a local, disposable database}"
[ "${PT3_REGRESSION_CONFIRM:-}" = "1" ] || {
  echo "Refusing to run: this writes fixtures. Set PT3_REGRESSION_CONFIRM=1." >&2; exit 1; }

case "$OWNER_DATABASE_URL" in
  *@127.0.0.1*|*@localhost*) ;;
  *) echo "Refusing: OWNER_DATABASE_URL must name a local host." >&2; exit 1 ;;
esac
case "$OWNER_DATABASE_URL" in
  *falsifier*|*fixture*|*shadow*|*disposable*|*legacy*) ;;
  *) echo "Refusing: the database must be marked disposable (…falsifier/fixture/shadow/disposable/legacy)." >&2; exit 1 ;;
esac

PT3_LIB="${PT3_LIB:-$(dirname "$0")}"
[ -r "$PT3_LIB/pt3-currency-invariants.sh" ] || {
  echo "ABORT — $PT3_LIB/pt3-currency-invariants.sh not found; nothing to regress against." >&2; exit 1; }
# shellcheck source=/dev/null
. "$PT3_LIB/pt3-currency-invariants.sh"

PSQL="psql $OWNER_DATABASE_URL -X -q -v ON_ERROR_STOP=1 -tA"
q() { $PSQL -c "$1"; }

fail=0
expect() {  # label · actual · expected
  if [ "$2" = "$3" ]; then printf 'PASS  %-56s %s\n' "$1" "$2"
  else printf 'FAIL  %-56s got %s, expected %s\n' "$1" "$2" "$3"; fail=$((fail+1)); fi
}

TAG="PT3CUR-$$"
# ⭐ TEARDOWN GOES THROUGH THE SEAM, because PT-3 refuses a bare DELETE on the protected tiers —
# even to the owner, via pt3_sections_refuse. A naive DELETE leaves the fixtures behind (observed),
# and an instrument that cannot clean up after itself leaves residue in the very database the next
# witness reads. source_commission_erasure() opens a TRANSACTION-LOCAL window, so the whole teardown
# must be one transaction: a DO block is exactly that.
cleanup() {
  $PSQL -c "
DO \$\$
DECLARE w record;
BEGIN
  FOR w IN SELECT m.id, m.member_id FROM member_manuscripts m WHERE m.title LIKE '$TAG%' LOOP
    PERFORM source_commission_erasure(w.id, w.member_id, 'regression teardown');
    DELETE FROM manuscript_sections                 WHERE manuscript_id = w.id;
    DELETE FROM manuscript_source_representations   WHERE manuscript_id = w.id;
    DELETE FROM manuscript_source_arrivals          WHERE manuscript_id = w.id;
    -- NOT source_lifecycle_acts: it is append-only BY DESIGN (a lifecycle act, once recorded, is
    -- history -- enforcement witness H4). The acts of an erased fixture correctly survive as
    -- tombstones; they name no surviving row, carry no content, and perturb no invariant, since
    -- every invariant iterates over live representations and sections. An instrument must not
    -- fight the law it exists to verify.
    DELETE FROM source_lifecycle_reconciliation     WHERE manuscript_id = w.id;
    DELETE FROM member_manuscripts                  WHERE id = w.id;
  END LOOP;
  DELETE FROM members WHERE name = '$TAG';
END \$\$;" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM
cleanup

MEMBER=$(q "INSERT INTO members (id, passkey, username, password_hash, name, email, onboarded)
            VALUES (gen_random_uuid(), '$TAG-key', '${TAG}_u', repeat('x',64), '$TAG',
                    '$TAG@fixture.invalid', true) RETURNING id")

mk_work()  { q "INSERT INTO member_manuscripts (member_id, title, provenance, source_custody)
                VALUES ('$MEMBER', '$TAG $1', 'member_uploaded', '$2') RETURNING id"; }
mk_arr()   { q "INSERT INTO manuscript_source_arrivals
                  (manuscript_id, member_id, source_kind, source_text, source_text_hash,
                   extraction_method, extractor_version)
                VALUES ('$1','$MEMBER','member_supplied_text','$2', encode(sha256('$2'::bytea),'hex'),
                        'regression','1')
                RETURNING id"; }
mk_rep()   { q "INSERT INTO manuscript_source_representations (manuscript_id, arrival_id, custody)
                VALUES ('$1', $2, '$3') RETURNING id"; }
mk_sec()   { q "INSERT INTO manuscript_sections (manuscript_id, representation_id, position, heading, body)
                VALUES ('$1','$2',0,'h','b') RETURNING id" >/dev/null; }

# Every count below is scoped to THIS fixture set, so an unrelated pre-existing row in the shadow
# cannot make a control look green or a positive case look red.
scoped() { printf '%s' "$1" | sed "s/FROM (SELECT DISTINCT manuscript_id AS m FROM manuscript_sections) w/FROM (SELECT DISTINCT s.manuscript_id AS m FROM manuscript_sections s JOIN member_manuscripts mm ON mm.id=s.manuscript_id AND mm.title LIKE '$TAG%') w/; s/FROM manuscript_source_representations r$/FROM manuscript_source_representations r JOIN member_manuscripts mm ON mm.id=r.manuscript_id AND mm.title LIKE '$TAG%'/"; }

absence()    { q "$(scoped "$PT3_INV_UNEXPLAINED_ABSENCE")"; }
unrecorded() { q "$(scoped "$PT3_INV_UNRECORDED_REPRESENTATION")"; }

echo "── 1 · MULTI-ARRIVAL — the migration refused to decide, and said so ──"
W1=$(mk_work "multi-arrival" source_custodied)
A1=$(mk_arr "$W1" "first"); mk_arr "$W1" "second" >/dev/null
R1=$(mk_rep "$W1" "'$A1'" source_custodied); mk_sec "$W1" "$R1"
q "INSERT INTO source_lifecycle_reconciliation (manuscript_id, kind, detail)
   VALUES ('$W1','multiple_legacy_arrivals', jsonb_build_object('arrival_count',2))" >/dev/null
expect "no operative representation"                "$(q "SELECT (source_operative_representation('$W1') IS NULL)::text")" "true"
expect "no lifecycle act for the ambiguous rep"     "$(q "SELECT count(*) FROM source_lifecycle_acts WHERE representation_id='$R1'")" "0"
expect "open multiple_legacy_arrivals recorded"     "$(q "SELECT count(*) FROM source_lifecycle_reconciliation WHERE manuscript_id='$W1' AND kind='multiple_legacy_arrivals' AND resolved_at IS NULL")" "1"
expect "→ absence is EXPLAINED (invariant clean)"   "$(absence)" "0"
expect "→ unacted rep is ACCOUNTED FOR"             "$(unrecorded)" "0"

echo
echo "── 2 · WITHDRAWAL — the member ended currency through the seam ──"
W2=$(mk_work "withdrawal" source_custodied)
A2=$(mk_arr "$W2" "text")
R2=$(mk_rep "$W2" "'$A2'" source_custodied); mk_sec "$W2" "$R2"
q "INSERT INTO source_lifecycle_acts (manuscript_id, act, representation_id, operative, actor_member_id)
   VALUES ('$W2','extraction','$R2',true,'$MEMBER')" >/dev/null
q "SELECT source_withdraw_representation('$W2','$MEMBER','$R2','regression')" >/dev/null
expect "Source sections remain"                     "$(q "SELECT count(*) FROM manuscript_sections WHERE manuscript_id='$W2'")" "1"
expect "no operative representation"                "$(q "SELECT (source_operative_representation('$W2') IS NULL)::text")" "true"
expect "governed withdrawal act present"            "$(q "SELECT count(*) FROM source_lifecycle_acts WHERE manuscript_id='$W2' AND act='withdrawal' AND provenance='member_act' AND actor_member_id IS NOT NULL")" "1"
expect "→ absence is EXPLAINED (invariant clean)"   "$(absence)" "0"

echo
echo "── 3 · NEGATIVE CONTROL — currency gone, nothing explains it ──"
# ⛔ This MUST report a violation. If it ever reads 0, the I4 repair has become 'NULL is always okay'.
W3=$(mk_work "negative-control" source_custodied)
A3=$(mk_arr "$W3" "text")
R3=$(mk_rep "$W3" "'$A3'" source_custodied); mk_sec "$W3" "$R3"
q "INSERT INTO source_lifecycle_acts (manuscript_id, act, representation_id, operative, actor_member_id)
   VALUES ('$W3','replacement','$R3',false,'$MEMBER')" >/dev/null
expect "no operative representation"                "$(q "SELECT (source_operative_representation('$W3') IS NULL)::text")" "true"
expect "no withdrawal act"                          "$(q "SELECT count(*) FROM source_lifecycle_acts WHERE manuscript_id='$W3' AND act='withdrawal'")" "0"
expect "no open ambiguity record"                   "$(q "SELECT count(*) FROM source_lifecycle_reconciliation WHERE manuscript_id='$W3' AND resolved_at IS NULL")" "0"
expect "→ UNEXPLAINED absence is DETECTED"          "$(absence)" "1"

echo
echo "── 4 · UNRECORDED REPRESENTATION — no act, no recorded reason ──"
# ⛔ Also a control. A representation may lack an act ONLY where the refusal to infer one is recorded.
W4=$(mk_work "unrecorded" source_custodied)
A4=$(mk_arr "$W4" "text")
R4=$(mk_rep "$W4" "'$A4'" source_custodied)
expect "representation carries no lifecycle act"    "$(q "SELECT count(*) FROM source_lifecycle_acts WHERE representation_id='$R4'")" "0"
expect "no open ambiguity record"                   "$(q "SELECT count(*) FROM source_lifecycle_reconciliation WHERE manuscript_id='$W4' AND resolved_at IS NULL")" "0"
expect "→ UNRECORDED representation is DETECTED"    "$(unrecorded)" "1"

echo
echo "── 5 · STALE WITHDRAWAL — an old lawful withdrawal must not excuse a later loss ──"
# ⛔ Control. Representation A was lawfully withdrawn long ago; representation B then lost currency
# with nothing explaining it. The Work's LATEST representation-level act is B's replacement, not A's
# withdrawal, so the absence is unexplained and must be DETECTED. If this ever reads 0, PT3_WITHDRAWN
# has drifted back to "some representation somewhere ended in withdrawal".
W5=$(mk_work "stale-withdrawal" source_custodied)
A5=$(mk_arr "$W5" "text")
R5A=$(mk_rep "$W5" "'$A5'" source_custodied); mk_sec "$W5" "$R5A"
q "INSERT INTO source_lifecycle_acts (manuscript_id, act, representation_id, operative, actor_member_id, occurred_at)
   VALUES ('$W5','extraction','$R5A',true,'$MEMBER', now() - interval '3 days')" >/dev/null
q "INSERT INTO source_lifecycle_acts (manuscript_id, act, representation_id, operative, actor_member_id, occurred_at)
   VALUES ('$W5','withdrawal','$R5A',false,'$MEMBER', now() - interval '2 days')" >/dev/null
R5B=$(mk_rep "$W5" "'$A5'" source_custodied)
q "INSERT INTO source_lifecycle_acts (manuscript_id, act, representation_id, operative, actor_member_id, occurred_at)
   VALUES ('$W5','replacement','$R5B',false,'$MEMBER', now() - interval '1 day')" >/dev/null
expect "a historical withdrawal exists"             "$(q "SELECT count(*) FROM source_lifecycle_acts WHERE manuscript_id='$W5' AND act='withdrawal'")" "1"
expect "the LATEST act is not that withdrawal"      "$(q "SELECT act FROM source_lifecycle_acts WHERE manuscript_id='$W5' AND representation_id IS NOT NULL ORDER BY occurred_at DESC, id DESC LIMIT 1")" "replacement"
expect "no operative representation"                "$(q "SELECT (source_operative_representation('$W5') IS NULL)::text")" "true"
expect "no open ambiguity record"                   "$(q "SELECT count(*) FROM source_lifecycle_reconciliation WHERE manuscript_id='$W5' AND resolved_at IS NULL")" "0"
expect "→ stale withdrawal does NOT excuse the loss" "$(absence)" "2"

echo
echo "════════════════════════════════════════════════════════════════════════"
if [ "$fail" -eq 0 ]; then
  echo "REGRESSION PASSED — absence of currency is admitted only when it is explained,"
  echo "                    and only by the act that actually explains it."
  echo
  echo "teardown: live fixture residue 0 · lifecycle tombstones RETAINED BY LAW"
  echo "          (source_lifecycle_acts is append-only; the acts of an erased fixture survive"
  echo "           as history naming no live row and carrying no content — that is not residue.)"
  exit 0
fi
echo "REGRESSION FAILED — $fail expectation(s). Do not weaken the negative controls to obtain green."
exit 1
