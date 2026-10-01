#!/usr/bin/env bash
# Falsifiers for deploy_ctx_assert_descends_from_running (scripts/deploy-context.sh).
# Law: a deploy may only move production forward; a non-descendant needs a recorded reason.
# Builds a throwaway git history + fake docker; touches no real repo or container.
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(mktemp -d)"; trap 'rm -rf "$ROOT"' EXIT
pass=0; fail=0
ok()  { echo "  ok:   $1"; pass=$((pass+1)); }
bad() { echo "  FAIL: $1"; fail=$((fail+1)); }

# history:  A ── B (running) ── C (forward)
#            \── D (divergent, behind production)
R="$ROOT/repo"; git init -q "$R"; git -C "$R" config user.email t@t; git -C "$R" config user.name t
c() { git -C "$R" commit -q --allow-empty -m "$1"; git -C "$R" rev-parse HEAD; }
A=$(c A); B=$(c B); C=$(c C); git -C "$R" checkout -q -b side "$A"; D=$(c D)

FAKE="$ROOT/fake"; mkdir -p "$FAKE"
cat > "$FAKE/docker" <<'EOF'
#!/usr/bin/env bash
if [ "$1" = exec ]; then [ -n "${FAKE_RUNNING:-}" ] && { echo "$FAKE_RUNNING"; exit 0; }; exit 1; fi
if [ "$1" = image ]; then [ -n "${FAKE_CURRENT:-}" ] && { echo "PATH=/x"; echo "GIT_COMMIT=$FAKE_CURRENT"; exit 0; }; exit 1; fi
exit 1
EOF
chmod +x "$FAKE/docker"

# shellcheck source=/dev/null
source "$HERE/deploy-context.sh"
export DEPLOY_SOURCE_REPO="$R" DEPLOY_DOCKER_BIN="$FAKE/docker" DEPLOY_OVERRIDE_LOG="$ROOT/overrides.log"

run() { # target running current [env...]
  local target="$1" running="$2" current="$3"; shift 3
  ( export DEPLOY_CTX_FULL_SHA="$target" DEPLOY_CTX_SHORT_SHA="${target:0:9}" FAKE_RUNNING="$running" FAKE_CURRENT="$current" "$@"
    deploy_ctx_assert_descends_from_running "harness" ) >/dev/null 2>&1
}
green() { if run "$@"; then ok "$label"; else bad "$label (expected allow)"; fi; }
red()   { if run "$@"; then bad "$label (expected REFUSE)"; else ok "$label"; fi; }

echo "[deploy-ancestry]"
label="forward deploy (target descends from running) is allowed";       green "$C" "${B:0:9}" ""
label="redeploy of the running commit is allowed";                       green "$B" "${B:0:9}" ""
label="non-descendant target (canonical behind production) is REFUSED";  red   "$D" "${B:0:9}" ""
label="older ancestor target (silent rollback) is REFUSED";              red   "$A" "${B:0:9}" ""
label="unknown running stamp is REFUSED (fail closed)";                  red   "$C" "unknown" ""
label="unresolvable running stamp is REFUSED";                           red   "$C" "deadbeef0" ""
label="no container: falls back to :current image and allows forward";   green "$C" "" "${B:0:9}"
label="no container: :current fallback still REFUSES non-descendant";    red   "$D" "" "${B:0:9}"
label="no container and no :current image is REFUSED";                   red   "$C" "" ""
label="override without a reason is REFUSED";                            red   "$D" "${B:0:9}" "" DEPLOY_ALLOW_NON_DESCENDANT=1
label="override with blank reason is REFUSED";                           red   "$D" "${B:0:9}" "" DEPLOY_ALLOW_NON_DESCENDANT=1 "DEPLOY_NON_DESCENDANT_REASON=   "
: > "$DEPLOY_OVERRIDE_LOG"
label="override WITH a reason is allowed";                               green "$D" "${B:0:9}" "" DEPLOY_ALLOW_NON_DESCENDANT=1 "DEPLOY_NON_DESCENDANT_REASON=incident 42 rollback"
if grep -q "target=$D.*running=$B.*reason=incident 42 rollback" "$DEPLOY_OVERRIDE_LOG"; then ok "override is recorded (target, running, reason)"; else bad "override not recorded"; fi
label="override that cannot be recorded is REFUSED"
if run "$D" "${B:0:9}" "" DEPLOY_ALLOW_NON_DESCENDANT=1 "DEPLOY_NON_DESCENDANT_REASON=x" DEPLOY_OVERRIDE_LOG=/nonexistent/dir/log; then bad "$label"; else ok "$label"; fi
label="missing target (called before resolve) is REFUSED";               red   "" "${B:0:9}" ""

echo; echo "[deploy-ancestry] $pass passed · $fail failed"
[ "$fail" -eq 0 ]
