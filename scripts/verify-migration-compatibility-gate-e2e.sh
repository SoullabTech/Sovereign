#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
TSX="$ROOT/node_modules/.bin/tsx"
TARGET="$(git rev-parse HEAD)"
OLD="$(git rev-parse HEAD^)"
PLAN="docs/programme/DEPLOYMENT-SAFETY-03_MIGRATION_COMPATIBILITY_CONTRACT_2026-09-21.md"
MIG="database/migrations/20260916123000_turn_taking_preferences.sql"
OLD_EVIDENCE="scripts/deploy-production.sh"
OLD_TRACE_PATH="old-reader/$OLD/$OLD_EVIDENCE"
SID="step2b-e2e-session"
TMP="$(mktemp -d /tmp/migration-compat-e2e.XXXXXX)"
TARGET_WT="$TMP/target"
BUNDLE="$TMP/bundle"

cleanup(){
  git -C "$ROOT" worktree remove --force "$TARGET_WT" >/dev/null 2>&1 || true
  rm -rf "$TMP"
}
trap cleanup EXIT

git -C "$ROOT" worktree add --detach "$TARGET_WT" "$TARGET" >/dev/null
"$ROOT/scripts/migration-compatibility-review-bundle.sh" "$OLD" "$TARGET" "$BUNDLE" >/dev/null

MIG_SHA="$(git -C "$ROOT" show "$TARGET:$MIG" | shasum -a 256 | awk '{print $1}')"
EVID_SHA="$(git -C "$ROOT" show "$OLD:$OLD_EVIDENCE" | shasum -a 256 | awk '{print $1}')"
REC="$TMP/record.json"
REV="$TMP/review.json"
TRACE="$TMP/trace.ndjson"

(
  cd "$TARGET_WT"
  "$TSX" "$ROOT/scripts/review-custody.ts" bind --plan "$PLAN" --base HEAD --out "$REC" >/dev/null
)
PLAN_SHA="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["plan"]["sha256"])' "$REC")"

TARGET="$TARGET" OLD="$OLD" PLAN="$PLAN" PLAN_SHA="$PLAN_SHA" MIG="$MIG" MIG_SHA="$MIG_SHA" \
OLD_EVIDENCE="$OLD_EVIDENCE" OLD_TRACE_PATH="$OLD_TRACE_PATH" EVID_SHA="$EVID_SHA" \
SID="$SID" REV="$REV" TRACE="$TRACE" BUNDLE="$BUNDLE" python3 - <<'PY'
import json, os
review={
  "verdict":"APPROVED",
  "plan_sha256":os.environ["PLAN_SHA"],
  "trace_id":os.environ["SID"],
  "reviewer":"Step2B e2e fixture",
  "summary":"Synthetic custody/composition fixture over exact git-object bundle bytes.",
  "findings":[],
  "coverage":{"files":[os.environ["PLAN"],os.environ["MIG"],os.environ["OLD_TRACE_PATH"]]},
  "limitations":["Synthetic composition witness; no production claim."],
  "migration_compatibility":{
    "instrument":"migration-compatibility/v1",
    "verdict":"COMPATIBLE",
    "old_reader_commit":os.environ["OLD"],
    "target_reader_commit":os.environ["TARGET"],
    "pending":[{"path":os.environ["MIG"],"sha256":os.environ["MIG_SHA"]}],
    "old_reader_evidence":[{
      "repo_path":os.environ["OLD_EVIDENCE"],
      "sha256":os.environ["EVID_SHA"],
      "trace_path":os.environ["OLD_TRACE_PATH"]
    }],
    "rationale":"Fixture old reader tolerates fixture target migration.",
    "limitations":["Synthetic fixture only."]
  }
}
open(os.environ["REV"],"w").write(json.dumps(review,indent=2)+"\n")
calls=[
  {"type":"system","subtype":"init","cwd":os.environ["BUNDLE"],"session_id":os.environ["SID"]},
]
for f in review["coverage"]["files"]:
  calls.append({"type":"assistant","session_id":os.environ["SID"],
    "message":{"content":[{"type":"tool_use","name":"Read","input":{"file_path":f}}]}})
open(os.environ["TRACE"],"w").write("\n".join(json.dumps(x) for x in calls)+"\n")
PY

(
  cd "$TARGET_WT"
  "$TSX" "$ROOT/scripts/review-custody.ts" admit \
    --record "$REC" --review "$REV" --trace "$TRACE" --repo-root "$BUNDLE" >/dev/null
)

OUT="$("$TSX" "$ROOT/scripts/review-custody-migration-gate.ts" \
  --record "$REC" --review "$REV" --trace "$TRACE" \
  --repo "$ROOT" --target "$TARGET" --old-reader "$OLD" --migration "$MIG" 2>&1)"
case "$OUT" in
  *"MIGRATION REVIEW + COMPATIBILITY GATE APPLIES"*) ;;
  *) echo "FAIL: composed gate did not apply" >&2; echo "$OUT" >&2; exit 1 ;;
esac

# Counterexample: the raw trace still contains the old-reader Read, but the
# admitted custody coverage omits it. Compatibility must NOT borrow that read.
REC2="$TMP/record2.json"
REV2="$TMP/review2.json"
(
  cd "$TARGET_WT"
  "$TSX" "$ROOT/scripts/review-custody.ts" bind --plan "$PLAN" --base HEAD --out "$REC2" >/dev/null
)
python3 - "$REV" "$REV2" "$PLAN" "$MIG" <<'PY'
import json,sys
r=json.load(open(sys.argv[1]))
r["coverage"]["files"]=[sys.argv[3],sys.argv[4]]
open(sys.argv[2],"w").write(json.dumps(r,indent=2)+"\n")
PY
(
  cd "$TARGET_WT"
  "$TSX" "$ROOT/scripts/review-custody.ts" admit \
    --record "$REC2" --review "$REV2" --trace "$TRACE" --repo-root "$BUNDLE" >/dev/null
)

set +e
BAD="$("$TSX" "$ROOT/scripts/review-custody-migration-gate.ts" \
  --record "$REC2" --review "$REV2" --trace "$TRACE" \
  --repo "$ROOT" --target "$TARGET" --old-reader "$OLD" --migration "$MIG" 2>&1)"
RC=$?
set -e
[ "$RC" -ne 0 ] || { echo "FAIL: second witness corpus was accepted" >&2; exit 1; }
case "$BAD" in
  *"COMPATIBILITY_REFUSED"*"OLD_READER_EVIDENCE_UNWITNESSED"*) ;;
  *) echo "FAIL: wrong refusal for omitted custody witness" >&2; echo "$BAD" >&2; exit 1 ;;
esac

echo "MIGRATION COMPATIBILITY GATE E2E: PASS"
echo "  lawful exact review + same trace -> applies"
echo "  raw trace read omitted from admitted custody coverage -> compatibility refused"
