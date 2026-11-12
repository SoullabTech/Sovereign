#!/usr/bin/env bash
# Falsifiers for the :prod guard (scripts/deploy-tag.sh prod_tag_guard_*):
# a full deploy that ends BEFORE its swap (migration review gate refusal, migration
# failure, image verify failure) must leave :prod where it was before the build.
# Uses a stateful fake docker on PATH; touches no real images.
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(mktemp -d)"; trap 'rm -rf "$ROOT"' EXIT
pass=0; fail=0
ok()  { echo "  ok:   $1"; pass=$((pass+1)); }
bad() { echo "  FAIL: $1"; fail=$((fail+1)); }

mkdir -p "$ROOT/bin"
# tag file: $FAKE_TAGS/<tag> contains "<image-id>"
cat > "$ROOT/bin/docker" <<'EOF'
#!/usr/bin/env bash
T="$FAKE_TAGS"
tagof() { echo "${1##*:}"; }
case "$1 $2" in
  "image inspect") f="$T/$(tagof "$3")"; [ -f "$f" ] || exit 1; cat "$f"; exit 0 ;;
  "image rm") rm -f "$T/$(tagof "$3")"; exit 0 ;;
esac
if [ "$1" = tag ]; then
  case "$2" in
    sha256:*) echo "$2" > "$T/$(tagof "$3")" ;;
    *) src="$T/$(tagof "$2")"; [ -f "$src" ] || exit 1; cp "$src" "$T/$(tagof "$3")" ;;
  esac
  exit 0
fi
exit 0
EOF
chmod +x "$ROOT/bin/docker"
export PATH="$ROOT/bin:$PATH" MAIA_IMAGE_REPO=maia-sovereign

reset() { export FAKE_TAGS="$ROOT/tags-$1"; rm -rf "$FAKE_TAGS"; mkdir -p "$FAKE_TAGS"; }
id_of() { cat "$FAKE_TAGS/$1" 2>/dev/null || echo "<none>"; }
build() { echo "sha256:candidate" > "$FAKE_TAGS/prod"; }   # what `compose build` does to :prod

run() {   # run a snippet in a fresh shell with the real scripts sourced
  bash -c "source '$HERE/deploy-tag.sh'; $1"
}

echo "1. refused before the swap: :prod restored, candidate kept as :refused-<sha>"
reset 1; echo "sha256:live" > "$FAKE_TAGS/prod"
run 'prod_tag_guard_arm abc123; echo sha256:candidate > "$FAKE_TAGS/prod"; prod_tag_guard_restore' 2>/dev/null
[ "$(id_of prod)" = "sha256:live" ] && ok ":prod back on the live image" || bad ":prod is $(id_of prod)"
[ "$(id_of refused-abc123)" = "sha256:candidate" ] && ok "candidate kept as :refused-abc123" || bad "refused tag is $(id_of refused-abc123)"

echo "2. swap reached (disarmed): :prod stays on the candidate"
reset 2; echo "sha256:live" > "$FAKE_TAGS/prod"
run 'prod_tag_guard_arm abc123; echo sha256:candidate > "$FAKE_TAGS/prod"; prod_tag_guard_disarm; prod_tag_guard_restore' 2>/dev/null
[ "$(id_of prod)" = "sha256:candidate" ] && ok ":prod is the deployed candidate" || bad ":prod is $(id_of prod)"
[ "$(id_of refused-abc123)" = "<none>" ] && ok "no refused tag" || bad "unexpected refused tag"

echo "3. no prior :prod: candidate untagged from :prod, kept as :refused-<sha>"
reset 3
run 'prod_tag_guard_arm abc123; echo sha256:candidate > "$FAKE_TAGS/prod"; prod_tag_guard_restore' 2>/dev/null
[ "$(id_of prod)" = "<none>" ] && ok ":prod removed" || bad ":prod is $(id_of prod)"
[ "$(id_of refused-abc123)" = "sha256:candidate" ] && ok "candidate kept" || bad "refused tag is $(id_of refused-abc123)"

echo "4. never armed: restore is a no-op"
reset 4; echo "sha256:candidate" > "$FAKE_TAGS/prod"
run 'prod_tag_guard_restore' 2>/dev/null
[ "$(id_of prod)" = "sha256:candidate" ] && ok "untouched" || bad ":prod is $(id_of prod)"

echo "5. end to end through the deploy-context EXIT handler, exit status preserved"
reset 5; echo "sha256:live" > "$FAKE_TAGS/prod"
bash -c "source '$HERE/deploy-tag.sh'; source '$HERE/deploy-context.sh' >/dev/null 2>&1; d=\$(mktemp -d); _deploy_ctx_register_cleanup_dir \"\$d\"; prod_tag_guard_arm abc123; echo sha256:candidate > \"\$FAKE_TAGS/prod\"; exit 7" 2>/dev/null
rc=$?
[ "$(id_of prod)" = "sha256:live" ] && ok "handler restored :prod on a refusal-style exit" || bad ":prod is $(id_of prod) after exit"
[ "$rc" = 7 ] && ok "failed deploy still exits non-zero ($rc)" || bad "exit status became $rc"

echo "6. wiring in deploy-production.sh: arm before each build, gate between, disarm before the tags and swap"
S="$HERE/deploy-production.sh"
for fn in cmd_deploy cmd_update; do
  body="$(awk "/^$fn\\(\\)/,/^}/" "$S")"
  a=$(printf '%s\n' "$body" | grep -n 'prod_tag_guard_arm' | head -1 | cut -d: -f1)
  b=$(printf '%s\n' "$body" | grep -n 'deploy_ctx_compose build' | head -1 | cut -d: -f1)
  g=$(printf '%s\n' "$body" | grep -n 'review_migration_custody_or_abort' | head -1 | cut -d: -f1)
  d=$(printf '%s\n' "$body" | grep -n 'prod_tag_guard_disarm' | head -1 | cut -d: -f1)
  t=$(printf '%s\n' "$body" | grep -n 'tag_images_for_rollback' | head -1 | cut -d: -f1)
  u=$(printf '%s\n' "$body" | grep -n 'deploy_ctx_compose up' | head -1 | cut -d: -f1)
  if [ -n "$a" ] && [ -n "$b" ] && [ -n "$g" ] && [ -n "$d" ] && [ -n "$t" ] && [ -n "$u" ] \
     && [ "$a" -lt "$b" ] && [ "$b" -lt "$g" ] && [ "$g" -lt "$d" ] && [ "$d" -lt "$t" ] && [ "$t" -lt "$u" ]; then
    ok "$fn: arm < build < gate < disarm < tags < swap"
  else
    bad "$fn order (arm=$a build=$b gate=$g disarm=$d tags=$t up=$u)"
  fi
done

echo "Result: $pass passed, $fail failed"
[ "$fail" -eq 0 ]
