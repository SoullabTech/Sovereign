#!/usr/bin/env bash
set -euo pipefail

REPO="$(cd "$(dirname "$0")/../../.." && pwd)"
TMP="$(mktemp -d /tmp/jarvis-keychain-proof-XXXXXX)"
trap 'rm -rf "$TMP"' EXIT

export AIN_DELEGATION_HOME="$TMP/ain"
export AIN_WORKTREES_ROOT="$TMP/worktrees"
FAKE_BIN="$TMP/bin"
ARGS_FILE="$TMP/opencode-args.txt"
SECURITY_ARGS_FILE="$TMP/security-args.txt"

mkdir -p "$AIN_DELEGATION_HOME/packets" "$AIN_DELEGATION_HOME/results" "$AIN_DELEGATION_HOME/logs"
mkdir -p "$AIN_WORKTREES_ROOT" "$FAKE_BIN"

cat > "$FAKE_BIN/opencode" <<'EOF'
#!/bin/sh
printf '%s
' "$@" > "$STUB_OPENCODE_ARGS"
printf 'stub-opencode-ok
'
exit 0
EOF
chmod +x "$FAKE_BIN/opencode"

cat > "$FAKE_BIN/security" <<'EOF'
#!/bin/sh
printf '%s
' "$@" > "$STUB_SECURITY_ARGS"
if [ "$STUB_KEYCHAIN_ENABLED" = "1" ]; then
  printf '%s
' "$STUB_KEYCHAIN_VALUE"
  exit 0
fi
exit 44
EOF
chmod +x "$FAKE_BIN/security"

export PATH="$FAKE_BIN:$PATH"
export STUB_OPENCODE_ARGS="$ARGS_FILE"
export STUB_SECURITY_ARGS="$SECURITY_ARGS_FILE"
export STUB_KEYCHAIN_ENABLED=1
export STUB_KEYCHAIN_VALUE="proof-only-keychain-secret"
unset NVIDIA_API_KEY || true

ID="keychain-proof-$$"
cd "$REPO"
bash scripts/ain-delegate.sh new "$ID" >/dev/null
PACKET="$AIN_DELEGATION_HOME/packets/$ID.json"

jq '
  .title = "Keychain provider proof"
  | .objective = "Synthetic read-only provider proof."
  | .governing_authority = "Test only."
  | .allowed_files = ["README.md"]
  | .prohibited_files_actions = ["no writes", "no production"]
  | .acceptance_criteria = ["credential recovered from Keychain fallback"]
  | .verification_commands = ["git diff --check"]
  | .expected_output = "synthetic"
  | .authorized_acts = ["repo.read", "network.external", "provider.spend"]
  | .not_authorized_acts = ["repo.write:worktree","production.read","production.write","deploy","authority.change"]
  | .integration_actor = "founder"
' "$PACKET" > "$PACKET.tmp"
mv "$PACKET.tmp" "$PACKET"

bash scripts/ain-delegate.sh opencode "$ID" nemotron-nvidia >/dev/null
RESULT="$AIN_DELEGATION_HOME/results/$ID.json"

test "$(jq -r '.model' "$RESULT")" = "nvidia/nvidia/nemotron-3-ultra-550b-a55b"
echo "PASS  Keychain fallback resolves NVIDIA provider"

grep -Fx -- "$USER" "$SECURITY_ARGS_FILE" >/dev/null
grep -Fx -- "ai.soullab.jarvis.nvidia-api-key" "$SECURITY_ARGS_FILE" >/dev/null
! grep -Fq '${USER:-soullab}' "$SECURITY_ARGS_FILE"
echo "PASS  Keychain lookup uses the actual macOS account and NVIDIA service"

! grep -q "proof-only-keychain-secret" "$ARGS_FILE"
echo "PASS  credential never appears in OpenCode arguments"
