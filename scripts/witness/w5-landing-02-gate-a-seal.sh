#!/usr/bin/env bash
# W5-LANDING-02A · GATE A — INSTRUMENT SEAL.
#
# ⭐ Gate A's gathering needs the protected host; its PIN RESOLUTION and its
# CLASSIFIER do not. This falsifies both without a protected read, and the
# instrument announces SYNTHETIC / PINS-ONLY in those modes so a seal run can
# never be mistaken for one.
#
# ── WHAT 2026-09-15 ADDED, AND WHY ────────────────────────────────────────
#
# The first protected run refused at §0 with all five pins `MISSING`, and the
# founder's independent run then found a second, graver defect. Both are sealed
# here:
#
#   §0  ABSENT ≠ MISMATCH ≠ UNKNOWN REF. P6 is the discriminator: it asserts
#       the two refusals do not use each other's word. An instrument that says
#       "pin failure" for "wrong directory" has told you nothing.
#
#   §4  BASELINE-SUBSUMED ≠ APPLIED-OUTSIDE-CARRIER ≠ UNCLASSIFIED.
#       capture-baseline.sh preserves a ledger row after its source file leaves
#       the tree ON PURPOSE. Calling that drift — as the instrument did — would
#       have condemned 51 lawful history entries to hide the one real finding.
#
# ⛔ EVIDENCE CLASSES ARE NAMED PER OBLIGATION.
#     BEHAVIOURAL   the instrument was run and its output judged
#     SOURCE-LEVEL  a pinned slice of the script, with an anti-vacuity anchor
#
# ⛔ The §2 protected-identity assertions are SOURCE-LEVEL and say so: sealing
# them behaviourally would require a database, which is exactly what this seal
# refuses to touch.
#
# ⛔ MUTATION: P4 writes ONE unreferenced blob/tree/commit into the local object
# store to construct a divergent ref. It creates NO ref, moves NO branch, and
# touches NO index and NO working tree. Nothing outside .git/objects changes.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT" || exit 2
S="$ROOT/scripts/witness/w5-landing-02-gate-a.sh"
G="$ROOT/scripts/witness/w5-landing-02-gate-a.sh"
[ -f "$S" ] || { echo "REFUSED · instrument not found: $S"; exit 2; }
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT

FIVE="20260914000001_proposal_succession.sql
20260914000002_manuscript_revision_offers.sql
20260914000003_proposal_chains_member_identity.sql
20260914000004_manuscript_revision_authorizations.sql
20260914000005_editorial_ontology.sql"
ONE="20260914000001_proposal_succession.sql"

pass=0; fail=0
ok(){   pass=$((pass+1)); echo "  PASS  $1"; }
bad(){  fail=$((fail+1)); echo "  FAIL  $1"; echo "     -> $2"; }
chk(){  if echo "$3" | grep -qF -- "$2"; then ok "$1"; else bad "$1" "expected: $2"; fi; }
chkn(){ if echo "$3" | grep -qF -- "$2"; then bad "$1" "must NOT contain: $2"; else ok "$1"; fi; }
rc_is(){ if [ "$2" = "$3" ]; then ok "$1 · exit $3"; else bad "$1 exit code" "want $3, got $2"; fi; }

# ══ §0 · PIN RESOLUTION ═══════════════════════════════════════════════
# BEHAVIOURAL. Real repository, real founder pins, only the SOURCE ref varies.
echo "── §0 · pin resolution, against location and content failure ─────"

pins(){ GATE_A_PINS_ONLY=1 bash "$S" origin/clean-main-no-secrets "$1" 2>&1; }

O=$(pins HEAD); rc=$?
chk  "P1 the five resolve on HEAD" "verified 5 · absent 0 · mismatched 0" "$O"
chk  "P1 and it stops at §0 without a protected read" "NO PROTECTED READ" "$O"
chk  "P1 ⛔ and refuses to be read as a result" "This is not a Gate A result" "$O"
rc_is "P1" "$rc" 0

O=$(pins refs/heads/no-such-ref-for-the-seal); rc=$?
chk  "P2 unknown ref → named as unknown" "unknown ref" "$O"
chk  "P2 ⭐ and declares NO PIN WAS JUDGED" "NO PIN WAS JUDGED" "$O"
chkn "P2 ⛔ never claims a pin was verified" "verified 5" "$O"
rc_is "P2" "$rc" 2

# a commit that predates the five: the parent of the commit that added 000001
ADDER=$(git rev-list HEAD -- "database/migrations/$ONE" | tail -1)
BEFORE=$(git rev-parse --verify --quiet "$ADDER^") || BEFORE=""
if [ -n "$BEFORE" ]; then
  P3O=$(pins "$BEFORE"); rc=$?
  chk  "P3 a ref without the files → ABSENT" "⛔ ABSENT" "$P3O"
  chk  "P3 ⭐ named a LOCATION finding, and nothing was compared" "were never compared" "$P3O"
  chk  "P3 and it reports candidate refs rather than choosing one" "The gate does not choose for you" "$P3O"
  chk  "P3 ⭐⭐ the candidate search finds the ref that does carry them" "refs/heads/claude/w4-2-schema-design" "$P3O"
  rc_is "P3" "$rc" 2
else
  bad "P3 could not construct a pre-five commit" "git rev-list found no adder for $ONE"
  P3O=""
fi

# ⛔ P4 · a DIVERGENT ref, built from unreferenced objects. No ref is created.
IDX="$T/idx"
GIT_INDEX_FILE="$IDX" git read-tree HEAD
MB=$(printf 'not the pinned migration\n' | git hash-object -w --stdin)
GIT_INDEX_FILE="$IDX" git update-index --add --cacheinfo "100644,$MB,database/migrations/$ONE"
MT=$(GIT_INDEX_FILE="$IDX" git write-tree)
MC=$(git commit-tree "$MT" -p HEAD -m "seal P4 · divergent 000001 · unreferenced")
P4O=$(pins "$MC"); rc=$?
chk  "P4 a ref with different bytes → MISMATCH" "⛔ MISMATCH" "$P4O"
chk  "P4 ⭐ named a CONTENT finding" "A CONTENT finding" "$P4O"
chk  "P4 ⛔ and the pin is held as the authority" "Do not re-pin to make it pass" "$P4O"
chk  "P4 the other four still verify" "verified 4" "$P4O"
rc_is "P4" "$rc" 2

# ⭐⭐ P6 · THE DISCRIMINATOR. The whole repair is that these are two findings.
chkn "P6 ⭐⭐ an ABSENT run never says MISMATCH" "MISMATCH" "$P3O"
chkn "P6 ⭐⭐ a MISMATCH run never says ABSENT" "⛔ ABSENT" "$P4O"

# P5 · cwd independence, both directions
O=$(cd "$T" && GATE_A_PINS_ONLY=1 bash "$S" 2>&1); rc=$?
chk  "P5 outside a repository → refused as LOCATION" "not inside a git repository" "$O"
chk  "P5 ⭐ and NO PIN WAS JUDGED" "NO PIN WAS JUDGED" "$O"
rc_is "P5" "$rc" 2
O=$(cd "$ROOT/scripts/witness" && GATE_A_PINS_ONLY=1 bash "$S" origin/clean-main-no-secrets HEAD 2>&1)
chk  "P5 ⭐ from a SUBDIRECTORY it still resolves — cwd cannot move a pin" "verified 5" "$O"

# ══ §3/§4/§6 · CLASSIFIER ═════════════════════════════════════════════
echo ""
echo "── §3/§4/§6 · classifier, on synthetic states ────────────────────"
run(){ GATE_A_CARRIER="$1" GATE_A_IMAGE="$2" GATE_A_LEDGER="$3" GATE_A_MANIFEST="${4:-}" bash "$S" 2>&1; }

printf 'old_a.sql\nold_b.sql\n%s\n' "$FIVE" > "$T/carrier"
printf 'old_a.sql\nold_b.sql\n'               > "$T/img_base"
printf 'old_a.sql\nold_b.sql\n'               > "$T/led_all"
printf 'ancient_0001.sql\n'                   > "$T/man"

O=$(run "$T/carrier" "$T/img_base" "$T/led_all" "$T/man"); rc=$?
chk  "G1 exactly the five pending → PASSES" "GATE A PASSES" "$O"
rc_is "G1" "$rc" 0
chk  "G1 all five tagged W5 package" "W5 package" "$O"
chkn "G1 nothing tagged OUTSIDE" "OUTSIDE W5" "$O"

printf 'old_a.sql\nold_b.sql\nstray_2026.sql\n%s\n' "$FIVE" > "$T/carrier2"
O=$(run "$T/carrier2" "$T/img_base" "$T/led_all" "$T/man"); rc=$?
chk  "G2 ⭐ one stray pending → FAILS" "GATE A FAILS" "$O"
chk  "G2 names it OUTSIDE the package" "stray_2026.sql" "$O"
chk  "G2 demands disposition" "must precede W5" "$O"
rc_is "G2" "$rc" 1

printf 'old_a.sql\nold_b.sql\n20260910000001_pending_ask_claims.sql\n%s\n' "$FIVE" > "$T/carrier3"
O=$(run "$T/carrier3" "$T/img_base" "$T/led_all" "$T/man")
b=$(echo "$O" | grep -n 'pending_ask_claims.sql' | head -1 | cut -d: -f1)
a=$(echo "$O" | grep -n '20260914000001_proposal' | tail -1 | cut -d: -f1)
if [ -n "$b" ] && [ -n "$a" ] && [ "$b" -lt "$a" ]; then ok "G3 ordering is the runner's, not the package's"
else bad "G3 ordering" "stray=$b five=$a"; fi

# ⭐⭐ G4 · THE CORRECTION. A ledger row whose file left the tree, RECORDED IN
# THE BASELINE MANIFEST, is lawful history — and the gate still passes.
printf 'old_a.sql\nold_b.sql\nsubsumed_2024.sql\n' > "$T/led_sub"
printf 'ancient_0001.sql\nsubsumed_2024.sql\n'     > "$T/man_sub"
O=$(run "$T/carrier" "$T/img_base" "$T/led_sub" "$T/man_sub"); rc=$?
chk  "G4 ⭐⭐ baseline-subsumed ledger row → lawful, not drift" "BASELINE-SUBSUMED        1" "$O"
chk  "G4 ⭐ and the gate still PASSES" "GATE A PASSES" "$O"
rc_is "G4" "$rc" 0
chkn "G4 ⛔ never called drift" "APPLIED OUTSIDE THE CARRIER" "$O"
chkn "G4 ⛔ and the old blanket sentence is gone" "the ledger names files the image lacks" "$O"

# ⭐⭐ G5 · the real finding: post-baseline, ledgered, no file anywhere.
printf 'old_a.sql\nold_b.sql\n20260903000001_return_authority_fail_closed.sql\n' > "$T/led_post"
O=$(run "$T/carrier" "$T/img_base" "$T/led_post" "$T/man_sub"); rc=$?
chk  "G5 ⭐⭐ post-baseline ledger-only → APPLIED-OUTSIDE-CARRIER" "APPLIED-OUTSIDE-CARRIER  1" "$O"
chk  "G5 named" "20260903000001_return_authority_fail_closed.sql" "$O"
chk  "G5 ⭐ the ORDER question still passes" "GATE A PASSES" "$O"
chk  "G5 ⛔ and the finding is NOT disposed of by that pass" "does not dispose of them" "$O"
chk  "G5 ⛔ nor mistaken for something a deploy would attempt" "It is NOT a migration the next deploy would attempt" "$O"
chk  "G5 §7 records the debt" "OWED — reported here, disposed nowhere" "$O"
rc_is "G5 ⭐⭐ a PASS with a standing finding is exit 3, never 0" "$rc" 3

# ⭐ G6 · no manifest → NOT MEASURABLE. Never lawful, never drift.
O=$(run "$T/carrier" "$T/img_base" "$T/led_post"); rc=$?
chk  "G6 ⭐ no manifest → UNCLASSIFIED" "NOT MEASURABLE" "$O"
chk  "G6 ⛔ and not translated into either answer" "Not translated into lawful, not into drift" "$O"
chk  "G6 the gate FAILS on an unmeasurable state" "could not be" "$O"
rc_is "G6" "$rc" 1
# ⚠️ ROW-SCOPED, AND THE DISTINCTION IS THE C21 CLASS AGAIN. §4 PRINTS the
# taxonomy as its own legend, so banning the word outright fails on the prose
# that documents the rule. The obligation was always about a COUNT LINE.
chkn_re(){ if echo "$3" | grep -qE -- "$2"; then bad "$1" "must NOT match: $2"; else ok "$1"; fi; }
chkn_re "G6 ⛔ never reports a subsumed count it cannot know" "^ +BASELINE-SUBSUMED +[0-9]" "$O"

# ⭐ G7 · correction 3 · latent pending in the RUNNING image must FAIL.
printf 'old_a.sql\nold_b.sql\nlatent_x.sql\n' > "$T/img_latent"
O=$(run "$T/carrier" "$T/img_latent" "$T/led_all" "$T/man"); rc=$?
chk  "G7 ⭐ latent pending in the CURRENT image is surfaced" "PENDING IN THE CURRENT IMAGE" "$O"
chk  "G7 and named" "latent_x.sql" "$O"
chk  "G7 ⭐⭐ and it now FAILS the gate until disposition" "the RUNNING image already has" "$O"
rc_is "G7" "$rc" 1

printf 'old_a.sql\nold_b.sql\n%s\n' "$ONE" > "$T/img_one"
printf 'old_a.sql\nold_b.sql\n%s\n' "$ONE" > "$T/led_one"
O=$(run "$T/carrier" "$T/img_one" "$T/led_one" "$T/man"); rc=$?
chk  "G8 ⭐ one of the five ALREADY applied → package is stale, FAILS" "are NOT pending against this" "$O"
rc_is "G8" "$rc" 1

chk "G9 a synthetic run declares itself, twice" "SYNTHETIC INPUTS" "$O"
chk "G9 and says it was not a protected reading" "not a protected reading" "$O"

# ══ §2 · PROTECTED IDENTITY — SOURCE-LEVEL ════════════════════════════
echo ""
echo "── §2 · protected identity · SOURCE-LEVEL (no database is touched) ─"
src(){ sed -n "$1" "$G"; }
anchor(){ if grep -qF -- "$2" "$G"; then ok "$1 · anchor present"; else bad "$1 · ANCHOR MISSING" "$2 — every pin below would be vacuous"; fi; }

anchor "S0" 'IDENT="$(ssh'
IDB=$(grep -n 'IDENT="\$(ssh' "$G" | head -1 | cut -d: -f1)
LED=$(grep -n 'SELECT filename FROM schema_migrations' "$G" | head -1 | cut -d: -f1)
BLK=$(sed -n "${IDB},$((IDB+22))p" "$G")
chk "S1 identity asks the database who it is" "current_database()" "$BLK"
chk "S1 and under what role" "current_user" "$BLK"
chk "S1 and whether the membrane is on" "transaction_read_only" "$BLK"
chk "S2 ⛔ a wrong database is REFUSED, not noted" "Wrong database" "$BLK"
chk "S3 ⛔ a membrane that is not on is REFUSED" "the read membrane is not on" "$BLK"
chk "S4 silence is refused too" "did not identify itself" "$BLK"
if [ -n "$IDB" ] && [ -n "$LED" ] && [ "$IDB" -lt "$LED" ]; then
  ok "S5 ⭐ identity is established BEFORE the ledger is read"
else bad "S5 ordering" "identity line $IDB, ledger read line $LED"; fi

echo ""
echo "  $pass passed · $fail failed"
[ "$fail" -eq 0 ]
