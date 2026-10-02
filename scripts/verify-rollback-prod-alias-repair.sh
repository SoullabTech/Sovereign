#!/usr/bin/env bash
set -euo pipefail

FILE="${1:-scripts/deploy-production.sh}"

pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1" >&2; exit 1; }

grep -Fq 'docker tag maia-sovereign:previous maia-sovereign:prod' "$FILE" \
  && pass ':previous is promoted onto Compose-consumed :prod' \
  || fail ':prod retag missing'

grep -Fq 'up -d --force-recreate --no-deps maia' "$FILE" \
  && pass 'rollback recreates only maia with --no-deps' \
  || fail 'reader-only recreate missing'

grep -Fq 'running_id="$(docker inspect maia-sovereign --format' "$FILE" \
  && pass 'running image identity is re-read after restart' \
  || fail 'post-rollback image witness missing'

grep -Fq '[ "$running_id" = "$previous_id" ]' "$FILE" \
  && pass 'running image must equal pre-rollback :previous image' \
  || fail 'running image equality gate missing'

if grep -Fq 'docker tag maia-sovereign:current maia-sovereign:broken 2>/dev/null || true' "$FILE"; then
  fail 'essential current→broken tag still suppresses failure'
else
  pass 'essential role-tag mutation no longer suppresses failure'
fi

printf 'ROLLBACK_PROD_ALIAS_REPAIR=PASS\n'
