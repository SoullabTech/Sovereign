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
# DEPLOYMENT-SAFETY-03 strengthens this law without replacing it:
# normal deploy/update now run migration BEFORE candidate swap, after an exact
# review/compatibility gate and an immediate relation re-witness. A migration
# failure must therefore leave the old reader live and prevent candidate swap.
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
    MAIA_BUILD_CONTEXT=/tmp/step3-fixture-snapshot
    # The immediate pending-set re-witness is read-only and empty in this fixture.
    # Only the actual migration invocation receives the requested exit code.
    deploy_ctx_compose() {
      case " $* " in
        *" -T migrate sh -c "*) return 0 ;;
        *) return '"$2"' ;;
      esac
    }
    MIGRATION_COMPAT_EXPECTED_PENDING=""
    MIGRATION_COMPAT_EXPECTED_OLD_READER=""
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
case "$OUT" in *"DEPLOYMENT ABORTED PRE-SWAP"*) ok "the abort is explicitly pre-swap" ;;
  *) bad "the failure is not stated as a pre-swap abort" ;; esac
case "$OUT" in *"candidate reader was NOT swapped in"*) ok "candidate reader is explicitly unswapped on migration failure" ;;
  *) bad "failure does not state that the candidate reader stayed unswapped" ;; esac
case "$OUT" in *"old reader remains the live reader"*) ok "old reader remains live on migration failure" ;;
  *) bad "failure does not preserve the old-reader standing" ;; esac

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

# ── 4 · STRUCTURAL — gate → migrate → tags → swap → verify → success ────────
python3 - "$DEPLOY" <<'PY'
import re, sys
src = open(sys.argv[1]).read()
def section(name):
    m = re.search(rf'^{name}\(\) \{{(.*?)^\}}', src, re.S | re.M)
    return m.group(1) if m else None
issues = []
for fn, phase, success in (
    ('cmd_deploy', 'Deployment', 'Deployment complete!'),
    ('cmd_update', 'Update', 'Update complete!'),
):
    body = section(fn)
    if body is None:
        issues.append(f'{fn} not found')
        continue
    bare = re.search(rf'^\s*run_migrations_or_abort "{phase}"\s*$', body, re.M)
    if not bare:
        issues.append(f'{fn}: migration is not a bare command')
        continue
    markers = {
        'gate': body.find(f'review_migration_custody_or_abort "{phase}"'),
        'migrate': bare.start(),
        'tag': body.find('tag_images_for_rollback "$GIT_COMMIT"'),
        'swap': body.find('deploy_ctx_compose up -d'),
        'verify': body.find('deploy_ctx_verify_running "$GIT_COMMIT"'),
        'success': body.find(f'log_success "{success}"'),
    }
    if any(v < 0 for v in markers.values()):
        issues.append(f'{fn}: missing order marker(s): {markers}')
        continue
    order = [markers[k] for k in ('gate','migrate','tag','swap','verify','success')]
    if order != sorted(order) or len(set(order)) != len(order):
        issues.append(f'{fn}: wrong order {markers}')
if re.search(r'if ! deploy_ctx_compose --profile migrate', src):
    issues.append('a swallowing if-not migrate block remains')
if not re.search(r'^set -e', src, re.M):
    issues.append('set -e absent')
for i in issues: print('  FAIL:', i)
sys.exit(1 if issues else 0)
PY
STRUCT=$?
if [ "$STRUCT" -eq 0 ]; then
  ok "deploy/update structurally order gate → migrate → tags → swap → verify → success"
else
  bad "deploy/update structural ordering is wrong"
fi

# ── 5 · the real tree is untouched ─────────────────────────────────────────
AFTER="$(sha256sum "$DEPLOY" | cut -c1-16)"
[ "$BEFORE" = "$AFTER" ] && ok "real deploy script untouched ($BEFORE)" \
                         || bad "real deploy script CHANGED ($BEFORE → $AFTER)"

echo ""
echo "$PASS passed · $FAIL failed"
[ "$FAIL" -eq 0 ] || exit 1
