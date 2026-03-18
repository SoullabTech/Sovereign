#!/usr/bin/env bash
# git-safe-commit.sh
# Removes a stale index.lock before committing.
# Use this in hooked environments where parallel processes race for the lock.
#
# Usage: bash scripts/git-safe-commit.sh -m "your message"

LOCK_FILE=".git/index.lock"

if [ -f "$LOCK_FILE" ]; then
  echo "Removing stale git lock: $LOCK_FILE"
  rm -f "$LOCK_FILE"
fi

git commit "$@"
