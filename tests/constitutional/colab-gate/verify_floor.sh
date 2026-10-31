#!/usr/bin/env bash
# Deploy-gate behaviour for the Co-Lab verifier: stubs the verifier via COLAB_VERIFIER_CMD.
# Proves the gate BLOCKS on: failures, warnings, a count under the floor, a precondition abort (with or
# without the marker), an unparseable run, and a non-zero exit with a clean-looking summary; and PASSES
# only on a clean run at/above the floor.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../../.."
OUT="$(mktemp "${TMPDIR:-/tmp}/colab-floor.XXXXXX")"; trap 'rm -f "$OUT"' EXIT
FLOOR="$(sed -n 's/^MIN_COLAB_CHECKS="${MIN_COLAB_CHECKS:-\([0-9]*\)}"$/\1/p' scripts/pre-deploy-gate.sh)"
PASS=0; FAIL=0
ok(){ echo "  ok:   $1"; PASS=$((PASS+1)); }
bad(){ echo "  FAIL: $1"; FAIL=$((FAIL+1)); }
run(){ COLAB_VERIFIER_CMD="$1" bash scripts/pre-deploy-gate.sh colab >"$OUT" 2>&1; echo $?; }
sum(){ echo "echo \"Results: $1 passed · $2 failed · $3 warned ($(( $1 + $2 + $3 )) total)\"; exit $4"; }
echo "floor under test: $FLOOR"
[ -n "$FLOOR" ] && ok "the floor default is readable from the gate" || bad "could not read the floor"
[ "$(run "$(sum $FLOOR 0 0 0)")" = 0 ] && ok "clean run at the floor passes" || bad "clean run at the floor was blocked"
[ "$(run "$(sum $((FLOOR+16)) 0 0 0)")" = 0 ] && ok "clean run above the floor passes" || bad "clean run above the floor was blocked"
[ "$(run "$(sum $((FLOOR-1)) 0 0 0)")" != 0 ] && ok "one under the floor (a check disappeared) is BLOCKED" || bad "a count under the floor passed"
[ "$(run "$(sum $FLOOR 1 0 1)")" != 0 ] && ok "a failed check is BLOCKED" || bad "a failure passed"
[ "$(run "$(sum $FLOOR 0 1 0)")" != 0 ] && ok "a warning is BLOCKED" || bad "a warning passed"
[ "$(run "$(sum $FLOOR 0 0 1)")" != 0 ] && ok "a non-zero verifier exit with a clean-looking summary is BLOCKED" || bad "non-zero exit passed"
[ "$(run 'echo nothing useful; exit 0')" != 0 ] && ok "an unparseable run is BLOCKED" || bad "an unparseable run passed"
[ "$(run 'printf "PRECONDITION UNMET — the instrument cannot render a verdict.\n"; exit 3')" != 0 ] && ok "a precondition abort (exit 3, marker present) is BLOCKED" || bad "a precondition abort passed"
grep -q "could NOT RUN" "$OUT" && ok "the precondition block says plainly that no verdict exists" || bad "precondition message missing"
[ "$(run 'echo something else; exit 3')" != 0 ] && ok "exit 3 WITHOUT the marker is still BLOCKED" || bad "exit 3 without the marker passed"
[ "$(run "$(sum $FLOOR 0 0 3)")" != 0 ] && ok "exit 3 alongside a clean-looking summary is BLOCKED (cannot be mistaken for a pass)" || bad "exit 3 with a clean summary passed"
echo; echo "passed: $PASS  failed: $FAIL"; [ "$FAIL" -eq 0 ]
