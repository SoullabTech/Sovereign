#!/usr/bin/env bash
# W5-LANDING-02 · GATE A — CLASSIFIER SEAL.
#
# ⭐ Gate A's gathering needs the protected host; its CLASSIFIER does not. This
# exercises the classifier on synthetic carrier/image/ledger states through the
# instrument's own declared test seam, so every verdict branch is falsified
# without a protected read — and the instrument announces SYNTHETIC in that mode
# so a seal run can never be mistaken for one.
set -u
cd /home/user/Sovereign
S=scripts/witness/w5-landing-02-gate-a.sh
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
FIVE="20260914000001_proposal_succession.sql
20260914000002_manuscript_revision_offers.sql
20260914000003_proposal_chains_member_identity.sql
20260914000004_manuscript_revision_authorizations.sql
20260914000005_editorial_ontology.sql"
pass=0; fail=0
ok(){ pass=$((pass+1)); echo "  PASS  $1"; }
bad(){ fail=$((fail+1)); echo "  FAIL  $1"; echo "     -> $2"; }
run(){ GATE_A_CARRIER="$1" GATE_A_IMAGE="$2" GATE_A_LEDGER="$3" bash "$S" 2>&1; }
chk(){ if echo "$3" | grep -qF -- "$2"; then ok "$1"; else bad "$1" "expected: $2"; fi; }
chkn(){ if echo "$3" | grep -qF -- "$2"; then bad "$1" "must not contain: $2"; else ok "$1"; fi; }

printf 'old_a.sql\nold_b.sql\n%s\n' "$FIVE" > $T/carrier
printf 'old_a.sql\nold_b.sql\n' > $T/img_base
printf 'old_a.sql\nold_b.sql\n' > $T/led_all

echo "── W5-LANDING-02 · Gate A classifier, on synthetic states ────────"

O=$(run $T/carrier $T/img_base $T/led_all); rc=$?
chk  "G1 exactly the five pending → PASSES" "GATE A PASSES" "$O"
[ $rc -eq 0 ] && ok "G1 exit 0" || bad "G1 exit code" "rc=$rc"
chk  "G1 all five tagged W5 package" "W5 package" "$O"
chkn "G1 nothing tagged OUTSIDE" "OUTSIDE W5" "$O"

printf 'old_a.sql\nold_b.sql\nstray_2026.sql\n%s\n' "$FIVE" > $T/carrier2
O=$(run $T/carrier2 $T/img_base $T/led_all); rc=$?
chk "G2 ⭐ one stray pending → FAILS" "GATE A FAILS" "$O"
chk "G2 names it OUTSIDE the package" "stray_2026.sql" "$O"
chk "G2 demands disposition" "must precede W5" "$O"
[ $rc -ne 0 ] && ok "G2 nonzero exit" || bad "G2 exit code" "rc=$rc"

printf 'old_a.sql\nold_b.sql\n20260910000001_pending_ask_claims.sql\n%s\n' "$FIVE" > $T/carrier3
O=$(run $T/carrier3 $T/img_base $T/led_all)
# ⚠️ A BROKEN OBLIGATION LIVED HERE. It passed a LINE NUMBER as the expected
# string, so it asserted nothing about ordering and failed on its own nonsense.
# The real check is the position comparison below, which is what was meant.
b=$(echo "$O" | grep -n 'pending_ask_claims.sql' | head -1 | cut -d: -f1)
a=$(echo "$O" | grep -n '20260914000001_proposal' | tail -1 | cut -d: -f1)
if [ -n "$b" ] && [ -n "$a" ] && [ "$b" -lt "$a" ]; then ok "G3 ordering is the runner's, not the package's"; else bad "G3 ordering" "stray=$b five=$a"; fi

printf 'old_a.sql\nold_b.sql\nghost.sql\n' > $T/led_ghost
O=$(run $T/carrier $T/img_base $T/led_ghost); rc=$?
chk "G4 ledgered but file absent → drift named" "ledgered with NO FILE" "$O"
chk "G4 and the gate FAILS on it" "the ledger names files the image lacks" "$O"
[ $rc -ne 0 ] && ok "G4 nonzero exit" || bad "G4 exit code" "rc=$rc"

printf 'old_a.sql\nold_b.sql\nlatent_x.sql\n' > $T/img_latent
O=$(run $T/carrier $T/img_latent $T/led_all)
chk "G5 ⭐ latent pending in the CURRENT image is surfaced" "PENDING IN THE CURRENT IMAGE" "$O"
chk "G5 and named" "latent_x.sql" "$O"

# ⚠️ AND THIS FIXTURE WAS MALFORMED. It put 000001 in the LEDGER but not in the
# IMAGE, so the instrument correctly reported the ghost/drift state FIRST — a
# ledger row with no file really is drift. The property under test needs the
# file present AND ledgered.
printf 'old_a.sql\nold_b.sql\n20260914000001_proposal_succession.sql\n' > $T/img_one
printf 'old_a.sql\nold_b.sql\n20260914000001_proposal_succession.sql\n' > $T/led_one
O=$(run $T/carrier $T/img_one $T/led_one); rc=$?
chk "G6 ⭐⭐ one of the five ALREADY applied → package is stale, FAILS" "are NOT pending against this" "$O"
[ $rc -ne 0 ] && ok "G6 nonzero exit" || bad "G6 exit code" "rc=$rc"

chk "G7 a synthetic run declares itself, twice" "SYNTHETIC INPUTS" "$O"
chk "G7 and says it was not a protected reading" "not a protected reading" "$O"

echo ""
echo "  $pass passed · $fail failed"
[ "$fail" -eq 0 ]
