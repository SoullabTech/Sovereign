#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# Falsification harness — MIGRATIONS FAIL CLOSED (DEPLOYMENT-SAFETY-01)
# ═══════════════════════════════════════════════════════════════════════════════
# Founder ruling 2026-09-14. The law, in full:
#
#   migration success  →  deployment may continue
#   migration failure  →  deployment MUST STOP · non-zero · no success message
#
# No migration may be silently skipped and followed by a successful application
# release. Before this repair both deploy paths caught the runner's non-zero exit
# with `if ! …; then log_warn …; fi` and continued to "Deployment complete!",
# which broke the migrations README's own rule — *schema and reader ship
# together* — in the FAILURE direction.
#
# Method is the house one (cf. verify-deploy-provenance.sh): the REAL function is
# sourced from the REAL script, seams are stubbed, the hostile mutation is applied
# to a THROWAWAY COPY and shown to go RED, the innocent control is shown GREEN,
# and the real tree is proven untouched.
#
# ⚠️ SCOPE, SAID PLAINLY — THIS DOES NOT PREVENT THE SWAP. Migrations run AFTER
# the container swap (build → swap → provenance verify → migrate), so when a
# failure becomes visible the reader is already live. This proves the deploy
# FAILS CLOSED and routes to rollback; it does NOT prove the reader never
# shipped. Whether migrate should precede the swap is a deploy-ORDERING question
# and is deliberately NOT answered here.
#
# Run:  scripts/verify-migrate-fail-closed.sh   (npm run verify:migrate-fail-closed)
# ═══════════════════════════════════════════════════════════════════════════════
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY="$SCRIPT_DIR/deploy-production.sh"
BEFORE="$(sha256sum "$DEPLOY" | cut -c1-16)"

PASS=0; FAIL=0
ok()   { echo "  ok:   $1"; PASS=$((PASS + 1)); }
bad()  { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); }

echo "MIGRATIONS FAIL CLOSED — falsification harness"
echo ""

# ── the seam ────────────────────────────────────────────────────────────────
# Runs the REAL run_migrations_or_abort out of a given copy of the deploy
# script, with the compose call forced to succeed or fail. SENTINEL is echoed
# only if control returns — i.e. only if the deployment would have continued.
run_case() { # $1=script $2=migrate exit code $3=phase
  bash -c '
    source "$1" >/dev/null 2>&1
    set +e
    deploy_ctx_compose() { return '"$2"'; }
    run_migrations_or_abort "$3"
    echo "SENTINEL_DEPLOYMENT_CONTINUED"
  ' _ "$1" "$3" 2>&1
}
run_code() { run_case "$@" >/dev/null 2>&1; echo $?; }

# ── 1 · FAILURE WITNESS ─────────────────────────────────────────────────────
OUT="$(run_case "$DEPLOY" 1 Deployment)"; CODE="$(run_code "$DEPLOY" 1 Deployment)"
[ "$CODE" != "0" ] && ok "forced migration failure → non-zero exit ($CODE)" \
                   || bad "forced migration failure exited 0"
case "$OUT" in *SENTINEL_DEPLOYMENT_CONTINUED*)
  bad "deployment CONTINUED past a failed migration" ;; *)
  ok "deployment did NOT continue past a failed migration" ;; esac
case "$OUT" in *"Deployment complete"*|*"Update complete"*|*"Migrations applied"*)
  bad "a success message was emitted on failure" ;; *)
  ok "no success message emitted on failure" ;; esac
case "$OUT" in *"DEPLOYMENT ABORTED"*) ok "the abort is stated to the operator" ;;
  *) bad "the failure is not stated as an abort" ;; esac
case "$OUT" in *"rollback"*) ok "the operator is routed to rollback" ;;
  *) bad "no rollback route offered after a live swap" ;; esac

# ── 2 · SUCCESS WITNESS ─────────────────────────────────────────────────────
OUT_OK="$(run_case "$DEPLOY" 0 Deployment)"; CODE_OK="$(run_code "$DEPLOY" 0 Deployment)"
[ "$CODE_OK" = "0" ] && ok "migration success → exit 0" || bad "migration success exited $CODE_OK"
case "$OUT_OK" in *SENTINEL_DEPLOYMENT_CONTINUED*)
  ok "deployment continues normally on success" ;; *)
  bad "deployment did not continue on a successful migration" ;; esac

# ── 3 · HOSTILE MUTATION — the pre-repair swallow must go RED ───────────────
# Applied to a THROWAWAY COPY. If this harness cannot see the old behaviour, it
# is not an instrument.
TMP="$(mktemp -d "${TMPDIR:-/tmp}/migrate-failclosed.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
# The mutant must resolve its own siblings, which the real script sources
# relative to its directory — so the throwaway dir gets links to them.
for sib in "$SCRIPT_DIR"/*.sh; do ln -sf "$sib" "$TMP/$(basename "$sib")"; done
MUT="$TMP/deploy-mutated.sh"
# The mutation is SCOPED to run_migrations_or_abort: its failure branch is made
# to return instead of exiting — exactly the pre-repair swallow.
python3 - "$DEPLOY" "$MUT" <<'MUTPY'
import re, sys
src = open(sys.argv[1]).read()
m = re.search(r'^run_migrations_or_abort\(\) \{.*?^\}', src, re.S | re.M)
assert m, 'run_migrations_or_abort not found'
body = m.group(0)
mutated = body.replace('    exit 1\n', '    return 0\n')
assert mutated != body, 'mutation did not apply'
open(sys.argv[2], 'w').write(src[:m.start()] + mutated + src[m.end():])
MUTPY
MUT_OUT="$(run_case "$MUT" 1 Deployment)"
case "$MUT_OUT" in *SENTINEL_DEPLOYMENT_CONTINUED*)
  ok "hostile mutation (swallow restored) is DETECTED — the harness discriminates" ;; *)
  bad "hostile mutation was NOT detected — this harness proves nothing" ;; esac

# ── 4 · STRUCTURAL — both paths call it, bare, before any success message ───
python3 - "$DEPLOY" <<'PY'
import re, sys
src = open(sys.argv[1]).read()
def section(name):
    m = re.search(rf'^{name}\(\) \{{(.*?)^\}}', src, re.S | re.M)
    return m.group(1) if m else None
issues, oks = [], []
for fn, msg in (('cmd_deploy', 'Deployment complete!'), ('cmd_update', 'Update complete!')):
    body = section(fn)
    if body is None:
        issues.append(f'{fn} not found'); continue
    call = re.search(r'^\s*run_migrations_or_abort "\w+"\s*$', body, re.M)
    if not call:
        issues.append(f'{fn} does not call run_migrations_or_abort as a bare command')
        continue
    oks.append(f'{fn} calls run_migrations_or_abort as a bare command '
               '(not in $(...), not behind || or if !)')
    at = body.index(f'log_success "{msg}"') if f'log_success "{msg}"' in body else -1
    if at < 0: issues.append(f'{fn} success message not found')
    elif call.start() < at: oks.append(f'{fn} success message comes strictly AFTER the migration step')
    else: issues.append(f'{fn} reports success BEFORE migrations run')
if re.search(r'if ! deploy_ctx_compose --profile migrate', src):
    issues.append('a swallowing `if ! … migrate` block remains')
else:
    oks.append('no swallowing `if ! … migrate` block remains anywhere')
if re.search(r'^set -e', src, re.M): oks.append('set -e is in force, so cmd_migrate aborts on failure too')
else: issues.append('set -e absent — cmd_migrate would not fail closed')
for o in oks: print(f'  ok:   {o}')
for i in issues: print(f'  FAIL: {i}')
sys.exit(len(issues))
PY
STRUCT=$?
PASS=$((PASS + 5 - STRUCT)); FAIL=$((FAIL + STRUCT))

# ── 5 · the real tree is untouched ─────────────────────────────────────────
AFTER="$(sha256sum "$DEPLOY" | cut -c1-16)"
[ "$BEFORE" = "$AFTER" ] && ok "real deploy script untouched ($BEFORE)" \
                         || bad "real deploy script CHANGED ($BEFORE → $AFTER)"

echo ""
echo "$PASS passed · $FAIL failed"
[ "$FAIL" -eq 0 ] || exit 1
