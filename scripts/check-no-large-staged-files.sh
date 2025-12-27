#!/usr/bin/env bash
set -euo pipefail

MAX_BYTES=$((50 * 1024 * 1024)) # 50MB

# staged files only
FILES=$(git diff --cached --name-only --diff-filter=AM)

bad=0
while IFS= read -r f; do
  [ -z "$f" ] && continue
  if [ -f "$f" ]; then
    size=$(wc -c < "$f" | tr -d ' ')
    if [ "$size" -gt "$MAX_BYTES" ]; then
      echo "❌ Staged file too large (>50MB): $f ($size bytes)"
      bad=1
    fi
  fi
done <<< "$FILES"

if [ "$bad" -eq 1 ]; then
  echo "Remove large files from git (use storage, LFS, or ignore)."
  exit 1
fi

echo "✅ No staged files exceed 50MB."
