#!/usr/bin/env bash
# WS-BETA-R2 / #1804 — pure, fail-closed Review rollback contract comparison.
# Consumed by deploy-production.sh rollback BEFORE image role tags move.
set -euo pipefail
current="${1-}"
target="${2-}"
if [ "$current" = seven ] && [ "$target" != seven ]; then
  echo "WS_REVIEW_ROLLBACK_REFUSED: seven-lens Review writes cannot roll back to an unverified reader" >&2
  exit 42
fi
# This new gate is specific to releases that advertise seven-lens writes.
# Do not break the existing, separately governed historical rollback pathway.
if [ "$current" != seven ]; then
  echo "WS_REVIEW_ROLLBACK_LEGACY_PATH_UNCHANGED_NOT_CERTIFIED"
  exit 0
fi
echo "WS_REVIEW_ROLLBACK_CONTRACT_COMPATIBLE"
