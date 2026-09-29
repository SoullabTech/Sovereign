#!/usr/bin/env bash
set -euo pipefail

FILE="${1:-scripts/pre-deploy-gate.sh}"

pass(){ printf 'PASS  %s\n' "$1"; }
fail(){ printf 'FAIL  %s\n' "$1" >&2; exit 1; }

prepare="$(awk '/^cmd_prepare_maia\(\)/{f=1} f{print} f && /^}/{exit}' "$FILE")"
cutover="$(awk '/^cmd_cutover_maia\(\)/{f=1} f{print} f && /^}/{exit}' "$FILE")"

[ -n "$prepare" ] || fail 'prepare-maia function missing'
[ -n "$cutover" ] || fail 'cutover-maia function missing'

grep -Fq 'deploy_ctx_compose build maia' <<<"$prepare" \
  && pass 'prepare builds candidate' || fail 'prepare does not build'

if grep -Fq 'up -d --force-recreate' <<<"$prepare"; then
  fail 'prepare may move traffic'
else
  pass 'prepare has no traffic-swap command'
fi

if grep -Fq 'tag_images_for_rollback' <<<"$prepare"; then
  fail 'prepare mutates rollback role tags'
else
  pass 'prepare leaves current/previous role tags untouched'
fi
grep -Fq 'docker tag "$prior_prod_id" "$MAIA_IMAGE_REPO:prod"' <<<"$prepare" \
  && pass 'prepare restores prod alias' || fail 'prepare prod restore missing'

grep -Fq 'docker tag "$MAIA_IMAGE_REPO:prod" "$candidate_image"' <<<"$prepare" \
  && pass 'prepare pins immutable candidate' || fail 'candidate immutable tag missing'

if grep -Fq 'deploy_ctx_compose build maia' <<<"$cutover"; then
  fail 'cutover rebuilds candidate'
else
  pass 'cutover performs no build'
fi

grep -Fq 'Rollback artifact does not equal the running production image' <<<"$cutover" \
  && pass 'cutover proves rollback artifact equals live reader' || fail 'rollback identity proof missing'

grep -Fq 'tag_images_for_rollback "$GIT_COMMIT"' <<<"$cutover" \
  && pass 'cutover advances rollback roles only at cutover' || fail 'cutover rollback role promotion missing'

grep -Fq 'up -d --force-recreate --no-deps maia' <<<"$cutover" \
  && pass 'cutover swaps reader only' || fail 'reader-only cutover missing'

TAG_FILE="${2:-scripts/deploy-tag.sh}"
for forbidden in \
  'docker tag "$repo:current" "$repo:previous" 2>/dev/null || true' \
  'docker tag "$repo:prod" "$repo:current" 2>/dev/null || true' \
  'docker tag "$repo:prod" "$repo:$sha" 2>/dev/null || true'
do
  if grep -Fq "$forbidden" "$TAG_FILE"; then
    fail 'essential rollback-role tag write still suppresses failure'
  fi
done
pass 'essential rollback-role tag writes fail closed'

printf 'DEPLOYMENT_STOP_BOUNDARIES=PASS\n'
