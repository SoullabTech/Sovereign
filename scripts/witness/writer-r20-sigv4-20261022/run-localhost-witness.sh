#!/usr/bin/env bash
# Writer R20 Class A REVIEW ONLY. No real AWS, member data, or Writer routes.
set -euo pipefail
umask 077
ROOT="$(cd -- "$(dirname -- "$0")" && pwd)"
MODE=--offline
if [[ $# -ge 1 ]]; then MODE="$1"; fi
[[ "$MODE" == --offline || "$MODE" == --real-sdk ]] || { echo R20_CI_REFUSE_MODE >&2; exit 33; }
node --check "$ROOT/sigv4-witness.mjs"
node --check "$ROOT/R21_REAL_AWS_SDK_WITNESS.mjs"
if [[ "$MODE" == --offline ]]; then
  node --test "$ROOT/tests/r22-signed-owner-opaque-version.node.test.mjs" \
    "$ROOT/tests/r24-sigv4-body-hash.node.test.mjs"
  echo R20_CI_R22_R24_30_OFFLINE_PASS
  exit 0
fi
[[ -n "$R20_FICTIONAL_SDK_DIR" && "$R20_FICTIONAL_SDK_DIR" = /* ]] \
  || { echo R20_CI_REFUSE_UNSPECIFIED_ABSOLUTE_SDK_DIR >&2; exit 34; }
[[ -f "$R20_FICTIONAL_SDK_DIR/package.json" && -f "$R20_FICTIONAL_SDK_DIR/package-lock.json" ]] \
  || { echo R20_CI_REFUSE_SDK_MANIFEST_ABSENT >&2; exit 35; }
node "$ROOT/R21_REAL_AWS_SDK_WITNESS.mjs" --project "$R20_FICTIONAL_SDK_DIR"
echo R20_CI_REAL_SDK_LOOPBACK_COMPLETED_REVIEW_ONLY
