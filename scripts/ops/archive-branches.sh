#!/usr/bin/env bash
# Archive-then-delete for origin/claude/* branches. Makes branch closure REVERSIBLE.
#
#   scripts/ops/archive-branches.sh tag    <branch>...   create + push archive/<branch> tags
#   scripts/ops/archive-branches.sh verify <branch>...   remote tag == remote branch tip, for each
#   scripts/ops/archive-branches.sh delete <branch>...   delete the remote branch ONLY IF verify passes
#
# Branch names are given without "origin/" (e.g. claude/epic-leakey). Read them
# from the triage, e.g.:
#   scripts/ops/branch-triage.sh | awk -F'\t' '$1=="ABSORBED"{print $5}' | xargs scripts/ops/archive-branches.sh tag
#
# Restoring a closed branch:  git push origin archive/<branch>:refs/heads/<branch>
#
# `delete` requires ARCHIVE_DELETE_AUTHORIZED=1 — it is a founder act — and
# re-verifies each branch immediately before deleting it, so a branch that
# moved after it was tagged is refused, never deleted with its new commits.
set -euo pipefail
act="${1:-}"; shift || true
[ "$#" -gt 0 ] || { echo "usage: $0 tag|verify|delete <branch>..." >&2; exit 2; }

remote_sha() { git ls-remote origin "$1" | awk 'NR==1{print $1}'; }

verify_one() {  # prints nothing on success
  local b="$1" bsha tsha
  bsha="$(remote_sha "refs/heads/$b")"; tsha="$(remote_sha "refs/tags/archive/$b^{}")"
  [ -n "$tsha" ] || tsha="$(remote_sha "refs/tags/archive/$b")"
  if [ -z "$bsha" ]; then echo "GONE      $b (branch absent on origin)"; return 1; fi
  if [ -z "$tsha" ]; then echo "UNTAGGED  $b"; return 1; fi
  if [ "$bsha" != "$tsha" ]; then echo "MOVED     $b (branch ${bsha:0:9} != tag ${tsha:0:9}); re-tag before deleting"; return 1; fi
}

case "$act" in
  tag)
    git fetch -q origin "$@" 2>/dev/null || true
    refs=()
    for b in "$@"; do
      git tag -f "archive/$b" "origin/$b" >/dev/null
      refs+=("refs/tags/archive/$b")
    done
    git push -q origin "${refs[@]}"
    echo "tagged + pushed ${#refs[@]}"
    ;;
  verify)
    bad=0; for b in "$@"; do verify_one "$b" || bad=$((bad+1)); done
    echo "verified $(( $# - bad ))/$#"; [ "$bad" -eq 0 ]
    ;;
  delete)
    [ "${ARCHIVE_DELETE_AUTHORIZED:-}" = 1 ] || { echo "refusing: set ARCHIVE_DELETE_AUTHORIZED=1 (founder act)" >&2; exit 3; }
    n=0; for b in "$@"; do
      if verify_one "$b"; then git push -q origin --delete "$b" && n=$((n+1)) && echo "deleted  $b (restorable from archive/$b)"; fi
    done
    echo "deleted $n/$#"
    ;;
  *) echo "usage: $0 tag|verify|delete <branch>..." >&2; exit 2 ;;
esac
