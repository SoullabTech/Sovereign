#!/usr/bin/env bash
# Branch triage — READ ONLY. Deletes nothing, merges nothing, writes no ref.
#
# Asks one question per origin/claude/* branch that is "ahead" of canonical:
#   WOULD MERGING THIS BRANCH CHANGE CANONICAL?
# Commit counts cannot answer it — squash merges, cherry-picks and re-landed
# docs leave a branch "ahead" while canonical already holds every byte. This
# performs the merge in memory (`git merge-tree --write-tree`, no worktree, no
# ref written) and compares the result with canonical's tree.
#
#   ABSORBED   merge result == canonical          → nothing to keep; safe to delete
#   DOCS_ONLY  merges clean, only docs/*.md differ → extract docs (or delete)
#   CODE       merges clean, code would change     → founder decision: PR or close
#   CONFLICT   cannot merge cleanly                → stale against canonical; close
#                                                    unless named as live work
#
# Requires a full (non-shallow) clone: in a shallow clone every branch looks
# unrelated to canonical. Refuses rather than misclassify.
#
# Output TSV: class  ahead  files_changed  last_commit  branch  sample_code_files
set -euo pipefail
CANON="${CANON:-origin/clean-main-no-secrets}"
if [ "$(git rev-parse --is-shallow-repository)" = "true" ]; then
  echo "refusing: shallow clone (run: git fetch --unshallow origin)" >&2; exit 2
fi
canon_tree=$(git rev-parse "$CANON^{tree}")
for b in $(git for-each-ref --format='%(refname:short)' refs/remotes/origin/claude/); do
  ahead=$(git rev-list --count "$CANON..$b")
  [ "$ahead" -gt 0 ] || continue
  last=$(git log -1 --format=%cs "$b")
  name=${b#origin/}
  set +e
  out=$(git merge-tree --write-tree --no-messages "$CANON" "$b" 2>/dev/null)
  rc=$?
  set -e
  if [ "$rc" -ne 0 ]; then
    printf 'CONFLICT\t%s\t-\t%s\t%s\t\n' "$ahead" "$last" "$name"; continue
  fi
  tree=$(printf '%s\n' "$out" | head -1)
  if [ "$tree" = "$canon_tree" ]; then
    printf 'ABSORBED\t%s\t0\t%s\t%s\t\n' "$ahead" "$last" "$name"; continue
  fi
  files=$(git diff --name-only "$canon_tree" "$tree")
  n=$(printf '%s\n' "$files" | grep -c . || true)
  code=$(printf '%s\n' "$files" | grep -vE '^docs/|\.md$' || true)
  if [ -z "$code" ]; then cls=DOCS_ONLY; else cls=CODE; fi
  printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$cls" "$ahead" "$n" "$last" "$name" "$(printf '%s\n' "$code" | head -3 | paste -sd, -)"
done
