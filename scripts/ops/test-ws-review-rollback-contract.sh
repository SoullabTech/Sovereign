#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
gate=scripts/ops/ws-review-rollback-contract.sh
pass=0
for spec in "seven:seven:0" "seven::42" "seven:eight:42" "seven:unknown:42" "eight:seven:0" ":seven:0" "::0" "eight:eight:0"; do
  IFS=: read -r from to expected <<< "$spec"
  set +e
  bash "$gate" "$from" "$to" >/dev/null 2>&1
  rc=$?
  set -e
  if [ "$rc" -ne "$expected" ]; then
    echo "FAIL: $spec yielded $rc" >&2
    exit 1
  fi
  pass=$((pass+1))
done
grep -q 'WS_REVIEW_WRITES_CONTRACT=seven' Dockerfile
grep -q 'scripts/ops/ws-review-rollback-contract.sh "$current_review_contract" "$previous_review_contract"' scripts/deploy-production.sh
# Prove the contract refusal runs before any role-tag mutation.
python3 - <<'INNER'
s=open('scripts/deploy-production.sh').read()
b=s[s.index('cmd_rollback() {'):s.index('# ═══════════════════════════════════════════════════════════════════════',s.index('cmd_rollback() {'))]
assert b.index('scripts/ops/ws-review-rollback-contract.sh') < b.index('docker tag maia-sovereign:current maia-sovereign:broken')
assert 'WS_REVIEW_WRITES_CONTRACT' in b
INNER
bash -n scripts/deploy-production.sh
echo "WS_REVIEW_ROLLBACK_GUARD_PASS $pass pure cases + pre-tag ordering"
