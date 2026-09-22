#!/usr/bin/env bash
# JARVIS-KP-01 / I5-P0R2R1 §II — falsifiers for the ceiling-repaired remediation
# instrument. READ ONLY; builds fixtures in a throwaway dir and removes them.
#
# Discharges the five required propositions:
#   1 a hanging Docker call returns within the configured ceiling
#   2 exactly one causal STOP is emitted
#   3 no generic second STOP obscures it
#   4 an ordinary non-timeout failure retains its original refusal reason
#   5 all pre-existing P0R2 substantive checks remain unchanged vs the
#     Founder-authorized e2f7d806 bytes
set -uo pipefail

AUTHORIZED_REF="${I5_AUTHORIZED_REF:-e2f7d806}"
SCRIPT_PATH="scripts/witness/i5-p0r2-remediation.sh"
REPAIRED="$SCRIPT_PATH"
PASS=0; FAIL=0
ok()  { printf 'PASS  %-4s %s\n        %s\n' "$1" "$2" "${3:-}"; PASS=$((PASS+1)); }
no()  { printf 'FAIL  %-4s %s\n        %s\n' "$1" "$2" "${3:-}"; FAIL=$((FAIL+1)); }

WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
git show "$AUTHORIZED_REF:$SCRIPT_PATH" > "$WORK/authorized.sh" || { echo "cannot read $AUTHORIZED_REF"; exit 3; }

# ── fixture: a hanging docker on PATH, plus the instrument set and a record ──
mkdir -p "$WORK/run/bin"
printf '#!/bin/sh\nsleep 120\n' > "$WORK/run/bin/docker"; chmod +x "$WORK/run/bin/docker"
cp "$REPAIRED" "$WORK/run/i5-p0r2-remediation.sh"
cp scripts/witness/seam-identity.mjs scripts/witness/seam-identity-container.mjs "$WORK/run/"
chmod +x "$WORK/run/i5-p0r2-remediation.sh"
printf 'STATUS: ISSUED\nfixture record\n' > "$WORK/run/issued.md"

# ── 1–3 · the timeout path ───────────────────────────────────────────────────
START=$(date +%s)
OUT="$(cd "$WORK/run" && PATH="$WORK/run/bin:$PATH" I5_CALL_TIMEOUT_S=2 \
       timeout 40 ./i5-p0r2-remediation.sh --authorization ./issued.md 2>&1)"
ELAPSED=$(( $(date +%s) - START ))
STOPS="$(printf '%s\n' "$OUT" | grep -c '^STOP ')"
CAUSE="$(printf '%s\n' "$OUT" | grep '^STOP ' | head -1)"

if [ "$ELAPSED" -lt 20 ]; then ok F1 "hanging Docker call returns within the ceiling" "returned in ${ELAPSED}s (ceiling 2s, harness cap 40s)"
else no F1 "hanging Docker call returns within the ceiling" "took ${ELAPSED}s"; fi

if [ "$STOPS" = "1" ]; then ok F2 "exactly one causal STOP is emitted" "$CAUSE"
else no F2 "exactly one causal STOP is emitted" "emitted $STOPS"; fi

case "$CAUSE" in
  *DOCKER_CONTROL_PLANE_TIMEOUT*) ok F3 "no generic second STOP obscures the cause" "cause names the control plane, and CONTAINER_UNREADABLE is absent: $(printf '%s\n' "$OUT" | grep -c 'CONTAINER_UNREADABLE')" ;;
  *) no F3 "no generic second STOP obscures the cause" "first STOP was: $CAUSE" ;;
esac

# ── 4 · an ordinary (non-timeout) docker failure keeps its own reason ────────
mkdir -p "$WORK/fail/bin"
printf '#!/bin/sh\necho "cannot connect" >&2\nexit 1\n' > "$WORK/fail/bin/docker"; chmod +x "$WORK/fail/bin/docker"
cp "$WORK/run/"*.mjs "$WORK/run/issued.md" "$WORK/fail/" 2>/dev/null
cp "$REPAIRED" "$WORK/fail/i5-p0r2-remediation.sh"; chmod +x "$WORK/fail/i5-p0r2-remediation.sh"
OUT2="$(cd "$WORK/fail" && PATH="$WORK/fail/bin:$PATH" timeout 40 \
        ./i5-p0r2-remediation.sh --authorization ./issued.md 2>&1)"
S2="$(printf '%s\n' "$OUT2" | grep '^STOP ' | head -1)"
if printf '%s' "$S2" | grep -q 'CONTAINER_UNREADABLE' && ! printf '%s' "$S2" | grep -q 'TIMEOUT'; then
  ok F4 "non-timeout failure retains its original refusal reason" "$S2"
else no F4 "non-timeout failure retains its original refusal reason" "got: $S2"; fi

# ── 5 · substantive checks unchanged vs the authorized bytes ─────────────────
inv() { # inv <file> — print the substantive invariants, order-stable
  local f="$1"
  grep -oE '^(EXPECT_FULL|EXPECT_PRODUCTION_FULL|EXPECT_CANONICAL_FULL|EXPECT_IMAGE|MODEL)="[^"]*"' "$f"
  grep -oE '^FLAGS=\(.*' "$f"
  sed -n '/^FLAGS=(/,/)$/p' "$f" | tr ' ' '\n' | grep -oE '(MAIA|AIN)_[A-Z0-9_]+' | sort
  grep -oE 'set_key [A-Z_]+' "$f" | sort
  grep -oE 'docker compose -f [^ ]+ up -d [^|]*' "$f" | sed 's/^timeout [0-9]* //' | tr -s ' '
  grep -oE 'SELECT count\(\*\) FROM [a-z_.]+' "$f" | sort
  grep -oE '^hdr "[^"]+"' "$f"
}
codes() { # every refusal identifier, however it is emitted
  { grep -oE '\b(stop|refuse) [A-Z_]{4,}' "$1" | awk '{print $2}'
    # ...including ones echoed directly rather than routed through stop(), which
    # an earlier version of this extractor missed — so the ADDED list it printed
    # read as complete while omitting DOCKER_CONTROL_PLANE_TIMEOUT.
    grep -oE 'STOP [A-Z_]{4,}' "$1" | awk '{print $2}'
  } | sort -u; }

# ⭐ R3 authorizes exactly one binding-law replacement: the historical single
# EXPECT_FULL becomes explicit production + canonical identities. Everything
# else in the substantive invariant set must remain byte-identical.
AUTHORIZED_DELTA_FROM='EXPECT_FULL="195b16bce1c807477bf97befc3c9b6d64a22e4520d0bdd8e9fcd173e35bb885b"'
AUTHORIZED_DELTA_PROD='EXPECT_PRODUCTION_FULL="195b16bce1c807477bf97befc3c9b6d64a22e4520d0bdd8e9fcd173e35bb885b"'
AUTHORIZED_DELTA_CANON='EXPECT_CANONICAL_FULL="b828400c7aaceafbbfcc66144018a6b0fe538dab1c806bbe3de635b2fc6ff6b4"'
diff <(inv "$WORK/authorized.sh") <(inv "$REPAIRED") > "$WORK/inv.diff.raw" 2>&1
grep -E '^[<>]' "$WORK/inv.diff.raw" \
  | grep -vFx "< $AUTHORIZED_DELTA_FROM" \
  | grep -vFx "> $AUTHORIZED_DELTA_PROD" \
  | grep -vFx "> $AUTHORIZED_DELTA_CANON" > "$WORK/inv.diff" || true
FIRED=0
grep -qFx "< $AUTHORIZED_DELTA_FROM" "$WORK/inv.diff.raw" \
  && grep -qFx "> $AUTHORIZED_DELTA_PROD" "$WORK/inv.diff.raw" \
  && grep -qFx "> $AUTHORIZED_DELTA_CANON" "$WORK/inv.diff.raw" && FIRED=1
if [ "$FIRED" = "0" ]; then
  printf 'NOTE  the authorized R3 dual-binding delta did not fire — do not leave
      a stale allowance standing.\n'
fi
if [ ! -s "$WORK/inv.diff" ] && [ "$FIRED" = "1" ]; then
  ok F5a "substantive checks unchanged but for the Founder-authorized R3 binding replacement" "residual invariant diff empty; R3 delta fired=1"
else
  no F5a "substantive checks unchanged but for the Founder-authorized R3 binding replacement" "$(head -12 "$WORK/inv.diff" | tr '\n' ' ')"
fi

REMOVED="$(comm -23 <(codes "$WORK/authorized.sh") <(codes "$REPAIRED") | tr '\n' ' ')"
ADDED="$(comm -13 <(codes "$WORK/authorized.sh") <(codes "$REPAIRED") | tr '\n' ' ')"
if [ -z "$(printf '%s' "$REMOVED" | tr -d ' ')" ]; then
  ok F5b "no pre-existing refusal was removed" "added only: ${ADDED:-<none>}"
else
  no F5b "no pre-existing refusal was removed" "removed: $REMOVED"
fi

printf '\n%s/%s falsifiers passed\n' "$PASS" "$((PASS+FAIL))"
[ "$FAIL" = "0" ]
