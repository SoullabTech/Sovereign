#!/bin/zsh
set -euo pipefail

SRC="$(cd "$(dirname "$0")/../../.." && pwd)"
ROOT="$SRC"
R6="$SRC"
RUNNER="$(mktemp -d /private/tmp/r6-nofallback-runner-XXXXXX)"
AIN="$(mktemp -d /private/tmp/r6-nofallback-ain-XXXXXX)"
WORKTREES="$(mktemp -d /private/tmp/r6-nofallback-worktrees-XXXXXX)"
INVOCATIONS="$AIN/invocations.log"
CANON="$(git -C "$ROOT" rev-parse origin/clean-main-no-secrets)"
ID="r6-nofallback-e2e-$(date +%s)"
BRANCH="chore/ain-delegate-$ID"
PACKET="$AIN/packets/$ID.json"

cleanup() {
  set +e
  AIN_DELEGATION_HOME="$AIN" AIN_WORKTREES_ROOT="$WORKTREES" bash "$RUNNER/scripts/ain-delegate.sh" release "$ID" abandoned >/dev/null 2>&1
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
if (model === "qwen3-coder:30b") {
  process.stdout.write([
    "diff --git a/scripts/ain-delegate.sh b/scripts/ain-delegate.sh",
    "@@ -1,1 +1,1 @@",
    "-#!/usr/bin/env bash",
    "+#!/usr/bin/env hacked",
  ].join("\n"));
  process.exit(0);
}
process.stdout.write("GOVERNANCE_GATE:{\"gate_class\":\"WRITE_AUTHORITY_REQUIRED\"}");
process.exit(0);
EOF
chmod +x "$RUNNER/scripts/builder/jarvis-local-worker.mjs"

mkdir -p "$AIN/packets" "$AIN/results" "$AIN/logs"
cat > "$PACKET" <<EOF
{
  "work_unit_id": "$ID",
  "title": "R6 unauthorized fallback falsifier",
  "objective": "Make the delegate convergence proof portable.",
  "execution_lane": "local-native",
  "task_class": "CODE_GROUNDED",
  "canonical_sha": "$CANON",
  "branch": "$BRANCH",
  "governing_authority": "R6 synthetic no-fallback proof",
  "established_facts": [],
  "allowed_files": ["scripts/builder/__tests__/delegate-workspace-convergence-proof.mjs"],
  "prohibited_files_actions": ["Do not modify any other file."],
  "acceptance_criteria": ["Bounded proof."],
  "verification_commands": ["true"],
  "escalation_conditions": [],
  "context_selectors": ["scripts/builder/__tests__/delegate-workspace-convergence-proof.mjs"],
  "autonomy_ceiling": "LEVEL_2_IMPLEMENT"
}
EOF

set +e
AIN_DELEGATION_HOME="$AIN" AIN_WORKTREES_ROOT="$WORKTREES" STUB_INVOCATIONS="$INVOCATIONS" bash "$RUNNER/scripts/ain-delegate.sh" local-native "$ID" >/tmp/r6-nofallback-run.out 2>/tmp/r6-nofallback-run.err
RC=$?
set -e

echo "RUN_RC=$RC"
cat "$AIN/results/$ID.json"
echo "=== INVOCATIONS ==="
cat "$INVOCATIONS"
echo "=== STDERR ==="
cat /tmp/r6-nofallback-run.err

jq -e '
  .exit_code != 0
  and .attempts == 1
  and .primary_model == "qwen3-coder:30b"
  and .candidate_model == "qwen3-coder:30b"
  and (.native_fallback? == null)
  and .patch_admission.code == "PATCH_PATH_NOT_AUTHORIZED"
  and .patch_admission.event.applied == false
  and .patch_admission.event.git_apply_invoked == false
' "$AIN/results/$ID.json" >/dev/null

[ "$(cat "$INVOCATIONS")" = "qwen3-coder:30b" ]
echo "R6_UNAUTHORIZED_NO_FALLBACK_PASS"
