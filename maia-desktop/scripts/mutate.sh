#!/usr/bin/env bash
# MAIA Desktop — the negative-control harness.
#
# Mutation controls have found five real proof gaps across the DSC sequence and
# twice destroyed uncommitted work, because a failed restore falls back to the
# last COMMIT, not to what was on disk. Remembering to commit first is not a
# control. This is.
#
#   ./scripts/mutate.sh "<label>" <file> <<'PY'
#   OLD = "..."
#   NEW = "..."
#   PY
#
# Refuses a dirty tree, verifies the mutation actually applied, runs the suite,
# then hard-restores to the recorded baseline and verifies the tree is clean.
set -uo pipefail

LABEL="${1:?usage: mutate.sh <label> <file>}"
FILE="${2:?usage: mutate.sh <label> <file>}"
cd "$(dirname "$0")/.."

# ⛔ A dirty baseline is the failure mode this script exists for. Refuse it.
if [ -n "$(git status --porcelain)" ]; then
  echo "REFUSED: working tree is dirty. Commit before running controls —"
  echo "         a failed restore falls back to the last commit, not to disk."
  git status --short
  exit 2
fi
BASELINE="$(git rev-parse HEAD)"

python3 - "$FILE" || { echo "REFUSED: mutation did not apply cleanly"; exit 3; }

if git diff --quiet -- "$FILE"; then
  echo "REFUSED: mutation produced no change — the control would prove nothing"
  git reset --hard "$BASELINE" --quiet
  exit 4
fi

node --test 'test/*.test.mjs' 2>&1 | grep -E "^# (pass|fail)" | tr '\n' ' '
echo "<- $LABEL"

git reset --hard "$BASELINE" --quiet
[ -z "$(git status --porcelain)" ] || { echo "RESTORE FAILED — tree still dirty"; exit 5; }
