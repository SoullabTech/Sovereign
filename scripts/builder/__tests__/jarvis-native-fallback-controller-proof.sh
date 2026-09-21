#!/bin/zsh
set -euo pipefail

SRC="$(cd "$(dirname "$0")/../../.." && pwd)"
ROOT="$SRC"
R6="$SRC"
RUNNER="$(mktemp -d /private/tmp/r6-fallback-runner-XXXXXX)"
AIN="$(mktemp -d /private/tmp/r6-fallback-ain-XXXXXX)"
WORKTREES="$(mktemp -d /private/tmp/r6-fallback-worktrees-XXXXXX)"
INVOCATIONS="$AIN/invocations.log"
CANON="$(git -C "$ROOT" rev-parse origin/clean-main-no-secrets)"
ID="r6-fallback-e2e-$(date +%s)"
BRANCH="chore/ain-delegate-$ID"
PACKET="$AIN/packets/$ID.json"

cleanup() {
  set +e
  AIN_DELEGATION_HOME="$AIN" AIN_WORKTREES_ROOT="$WORKTREES" bash "$RUNNER/scripts/ain-delegate.sh" release "$ID" completed >/dev/null 2>&1
  WT="$(jq -r '.worktree // empty' "$PACKET" 2>/dev/null)"
  [ -n "$WT" ] && git -C "$ROOT" worktree remove --force "$WT" >/dev/null 2>&1
  git -C "$ROOT" branch -D "$BRANCH" >/dev/null 2>&1
  git -C "$ROOT" worktree remove --force "$RUNNER" >/dev/null 2>&1
  rm -rf "$AIN" "$WORKTREES" "$RUNNER"
}
trap cleanup EXIT

git -C "$ROOT" worktree add --detach "$RUNNER" "$CANON" >/dev/null

cp "$R6/scripts/ain-delegate.sh" "$RUNNER/scripts/ain-delegate.sh"
cp "$R6/scripts/builder/jarvis-native-patch-admission.mjs" "$RUNNER/scripts/builder/jarvis-native-patch-admission.mjs"
cp "$R6/scripts/builder/jarvis-native-prompt.mjs" "$RUNNER/scripts/builder/jarvis-native-prompt.mjs"
cp "$R6/scripts/builder/jarvis-native-fallback-prompt.mjs" "$RUNNER/scripts/builder/jarvis-native-fallback-prompt.mjs"

cat > "$RUNNER/scripts/builder/jarvis-local-worker.mjs" <<'EOF'
#!/usr/bin/env node
import { appendFileSync } from "node:fs";
const args=process.argv.slice(2);
const mi=args.indexOf("--model");
const model=mi>=0 ? args[mi+1] : "";
if (process.env.STUB_INVOCATIONS) appendFileSync(process.env.STUB_INVOCATIONS, model+"\n");
const path="scripts/builder/__tests__/delegate-workspace-convergence-proof.mjs";
if (model === "qwen3-coder:30b") {
  process.stdout.write([
    "diff --git a/"+path+" b/"+path,
    "@@ -13,1 +13,1 @@",
    "-THIS_BYTE_DOES_NOT_EXIST",
    "+still_wrong",
  ].join("\n"));
  process.exit(0);
}
if (model === "gpt-oss:20b") {
  process.stdout.write([
    "diff --git a/"+path+" b/"+path,
    "@@ -4,0 +5,1 @@",
    "+import { fileURLToPath } from 'node:url';",
    "@@ -13,1 +13,1 @@",
    "-const REPO = '/Users/soullab/MAIA-SOVEREIGN';",
    "+const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');",
  ].join("\n"));
  process.exit(0);
}
process.stderr.write("unexpected model "+model+"\n");
process.exit(44);
EOF
chmod +x "$RUNNER/scripts/builder/jarvis-local-worker.mjs"

mkdir -p "$AIN/packets" "$AIN/results" "$AIN/logs"

cat > "$PACKET" <<EOF
{
  "work_unit_id": "$ID",
  "title": "R6 fallback controller proof",
  "objective": "Make the delegate workspace convergence proof portable by deriving the repository root from its own ES-module location.",
  "execution_lane": "local-native",
  "task_class": "CODE_GROUNDED",
  "canonical_sha": "$CANON",
  "branch": "$BRANCH",
  "governing_authority": "R6 synthetic fallback proof",
  "established_facts": [
    "The target is an ES module.",
    "The sibling precedent uses fileURLToPath(import.meta.url)."
  ],
  "allowed_files": [
    "scripts/builder/__tests__/delegate-workspace-convergence-proof.mjs"
  ],
  "prohibited_files_actions": [
    "Do not modify any other file."
  ],
  "acceptance_criteria": [
    "The proof contains no hardcoded /Users path.",
    "The existing proof passes."
  ],
  "verification_commands": [
    "node scripts/builder/__tests__/delegate-workspace-convergence-proof.mjs",
    "! grep -n \"/Users/\" scripts/builder/__tests__/delegate-workspace-convergence-proof.mjs"
  ],
  "escalation_conditions": [
    "The requested change cannot be made in the allowed file."
  ],
  "context_selectors": [
    {
      "ref": "scripts/builder/__tests__/delegate-workspace-convergence-proof.mjs",
      "selector": {
        "type": "anchor",
        "find": "import { mkdtempSync, mkdirSync, writeFileSync, chmodSync, rmSync, existsSync, realpathSync } from 'node:fs';",
        "mode": "lines",
        "after": 17
      },
      "why": "Target import and root-resolution region."
    },
    {
      "ref": "scripts/builder/__tests__/opencode-adapter-governance-proof.mjs",
      "selector": {
        "type": "anchor",
        "find": "import { execFileSync } from 'node:child_process';",
        "mode": "lines",
        "after": 15
      },
      "why": "Read-only sibling precedent."
    }
  ],
  "autonomy_ceiling": "LEVEL_2_IMPLEMENT"
}
EOF

echo "=== ENVELOPE ==="
AIN_DELEGATION_HOME="$AIN" node "$RUNNER/scripts/builder/work-unit.mjs" permission-envelope "$ID"

echo "=== RUN ==="
set +e
AIN_DELEGATION_HOME="$AIN" AIN_WORKTREES_ROOT="$WORKTREES" STUB_INVOCATIONS="$INVOCATIONS" bash "$RUNNER/scripts/ain-delegate.sh" local-native "$ID"
RC=$?
set -e
echo "RUN_RC=$RC"

echo "=== RESULT ==="
cat "$AIN/results/$ID.json"

echo "=== INVOCATIONS ==="
cat "$INVOCATIONS"

echo "=== PRIMARY LOG ==="
cat "$AIN/logs/$ID.log"

echo "=== FALLBACK LOG ==="
cat "$AIN/logs/$ID.log.fallback"

WT="$(jq -r '.worktree' "$PACKET")"
echo "=== CANDIDATE ==="
git -C "$WT" status --short --branch
git -C "$WT" log -2 --oneline
git -C "$WT" show --stat --oneline HEAD
git -C "$WT" show --format= -- scripts/builder/__tests__/delegate-workspace-convergence-proof.mjs

jq -e '
  .exit_code == 0
  and .test_results == "pass"
  and .attempts == 2
  and .primary_model == "qwen3-coder:30b"
  and .candidate_model == "gpt-oss:20b"
  and .native_fallback.used == true
  and .native_fallback.model == "gpt-oss:20b"
  and .native_fallback.primary_patch_admission.code == "PATCH_OLD_BYTES_MISMATCH"
  and .patch_admission.code == "PATCH_APPLIED"
' "$AIN/results/$ID.json" >/dev/null

[ "$(sed -n '1p' "$INVOCATIONS")" = "qwen3-coder:30b" ]
[ "$(sed -n '2p' "$INVOCATIONS")" = "gpt-oss:20b" ]
[ "$(wc -l < "$INVOCATIONS" | tr -d ' ')" = "2" ]

echo "R6_FALLBACK_E2E_PASS"
