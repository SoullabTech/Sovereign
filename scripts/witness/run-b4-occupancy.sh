#!/usr/bin/env bash
#
# B4 launcher — RESOLVE, EXTRACT, PROVE, THEN CONTACT PRODUCTION.
#
# ⭐ THE FLAW THIS CLOSES, found by a real failure and not by the synthetic
# hostile case. `set -o pipefail` makes a failed pipeline REPORT failure; it does
# not stop the pipeline's other processes from starting. In
#
#     git show <sha>:<path> | ssh … psql …
#
# both sides start together. If `git show` fails, ssh has already opened a
# connection to production and psql receives empty stdin. Nothing executes — but
# production was contacted for a run that could never happen, and "instrument
# retrieval must succeed before production is contacted" was the contract.
#
# ⛔ pipefail proves failure. It does not enforce ordering. This script does:
#
#     resolve pinned commit → extract exact bytes → prove non-empty
#       → ONLY THEN contact production
#
# Usage:  scripts/witness/run-b4-occupancy.sh <PINNED-SHA> [ssh-target]
#
# --no-replace-objects is deliberate: a local `git replace` ref could present a
# different tree under the same commit name, and the instrument subject must be
# the committed bytes, not a locally substituted view of them.

set -euo pipefail

SHA="${1:?usage: run-b4-occupancy.sh <PINNED-SHA> [ssh-target]}"
TARGET="${2:-soullab@minisforum}"
PATH_IN_COMMIT=scripts/witness/maia-turns-b4-occupancy.sql

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

# 1 · The pinned commit must exist locally, as a commit, before anything else.
if ! git --no-replace-objects cat-file -e "${SHA}^{commit}" 2>/dev/null; then
  echo "B4 STOP — commit ${SHA} is not present locally." >&2
  echo "  Fetch the lane first, then retry. Production was NOT contacted." >&2
  echo "  git fetch origin refs/heads/claude/maia-turns-derivative-custody:refs/remotes/origin/claude/maia-turns-derivative-custody" >&2
  exit 2
fi

# 2 · Extract the exact committed bytes. No working tree, no replacement objects.
if ! git --no-replace-objects show "${SHA}:${PATH_IN_COMMIT}" > "$TMP"; then
  echo "B4 STOP — ${PATH_IN_COMMIT} could not be extracted from ${SHA}." >&2
  echo "  Production was NOT contacted." >&2
  exit 2
fi

# 3 · Prove the extraction produced something. An empty instrument is the exact
#     shape that made psql exit 0 having witnessed nothing.
if [ ! -s "$TMP" ]; then
  echo "B4 STOP — extracted instrument is empty. Production was NOT contacted." >&2
  exit 2
fi

echo "B4 instrument resolved: ${SHA}:${PATH_IN_COMMIT} ($(wc -c < "$TMP") bytes)" >&2
echo "B4 contacting production now — read-only, ON_ERROR_STOP, ends in ROLLBACK." >&2

# 4 · Only now. The witness itself refuses on schema drift and exits non-zero.
ssh "$TARGET" 'docker exec -i maia-postgres \
  psql -v ON_ERROR_STOP=1 -U soullab -d maia_consciousness -f -' < "$TMP"
