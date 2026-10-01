#!/usr/bin/env bash
# Falsifiers for tag_images_for_rollback (scripts/deploy-tag.sh):
# a same-commit redeploy must NOT rotate :previous; a different-commit deploy must.
# Uses a stateful fake docker on PATH; touches no real images.
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(mktemp -d)"; trap 'rm -rf "$ROOT"' EXIT
pass=0; fail=0
ok()  { echo "  ok:   $1"; pass=$((pass+1)); }
bad() { echo "  FAIL: $1"; fail=$((fail+1)); }

mkdir -p "$ROOT/bin" "$ROOT/tags"
# tag file: $ROOT/tags/<tag> contains "<image-id> <GIT_COMMIT>"
cat > "$ROOT/bin/docker" <<'EOF'
#!/usr/bin/env bash
T="$FAKE_TAGS"
ref_tag() { echo "${1##*:}"; }
case "$1 $2" in
  "image inspect")
    f="$T/$(ref_tag "$3")"; [ -f "$f" ] || exit 1
    if [ "${4:-}" = "--format" ]; then
      read -r id commit < "$f"
      case "$5" in *Config.Env*) [ "$commit" != "-" ] && echo "GIT_COMMIT=$commit"; echo "PATH=/x" ;; *) echo "$id" ;; esac
    fi; exit 0 ;;
esac
case "$1" in
  tag) src="$T/$(ref_tag "$2")"; [ -f "$src" ] || exit 1; cp "$src" "$T/$(ref_tag "$3")" ;;
  images) exit 0 ;;   # prune sees nothing to prune
  rmi) exit 0 ;;
  *) exit 0 ;;
esac
EOF
chmod +x "$ROOT/bin/docker"
export PATH="$ROOT/bin:$PATH" FAKE_TAGS="$ROOT/tags" MAIA_IMAGE_REPO=fake-repo
# shellcheck source=/dev/null
source "$HERE/deploy-tag.sh"

state() { rm -f "$ROOT/tags/"*; for kv in "$@"; do echo "${kv#*=}" > "$ROOT/tags/${kv%%=*}"; done; }
prev() { cut -d' ' -f1 "$ROOT/tags/previous" 2>/dev/null || echo none; }
cur()  { cut -d' ' -f1 "$ROOT/tags/current"  2>/dev/null || echo none; }

echo "[deploy-tag rollback point]"
# different commit: current(old) → previous
state "current=img-old aaaaaaaaa" "previous=img-older 999999999" "prod=img-new bbbbbbbbb"
tag_images_for_rollback bbbbbbbbb >/dev/null 2>&1
[ "$(prev)" = img-old ] && [ "$(cur)" = img-new ] && ok "different-commit deploy rotates :previous to the old :current" || bad "different-commit rotation (prev=$(prev) cur=$(cur))"

# same commit redeploy: previous must stay on the last DIFFERENT commit
state "current=img-rc1a 03f0fd3ab" "previous=img-pre 975a208b8" "prod=img-rc1b 03f0fd3ab"
tag_images_for_rollback 03f0fd3ab >/dev/null 2>&1
[ "$(prev)" = img-pre ] && ok "same-commit redeploy keeps :previous on the last different commit" || bad "same-commit redeploy rotated :previous to $(prev)"
[ "$(cur)" = img-rc1b ] && ok "same-commit redeploy still moves :current to the new build" || bad ":current not updated ($(cur))"

# same commit, full SHA stamped vs short SHA argument
state "current=img-rc1a 03f0fd3abce16fcc1132481836b2e6ff8d364cd7" "previous=img-pre 975a208b8" "prod=img-rc1b 03f0fd3ab"
tag_images_for_rollback 03f0fd3ab >/dev/null 2>&1
[ "$(prev)" = img-pre ] && ok "same commit across short/full SHA forms is recognised" || bad "short/full SHA not matched (prev=$(prev))"

# unknown stamp on :current: cannot prove same commit → old behaviour (rotate)
state "current=img-x -" "previous=img-pre 975a208b8" "prod=img-new bbbbbbbbb"
tag_images_for_rollback bbbbbbbbb >/dev/null 2>&1
[ "$(prev)" = img-x ] && ok "unstamped :current rotates (no same-commit claim without evidence)" || bad "unstamped :current did not rotate (prev=$(prev))"

echo; echo "[deploy-tag rollback point] $pass passed · $fail failed"
[ "$fail" -eq 0 ]
