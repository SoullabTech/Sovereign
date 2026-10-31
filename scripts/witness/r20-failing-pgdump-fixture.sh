#!/bin/sh
# Synthetic fault: version check passes, actual governance export fails.
for arg in "$@"; do
  if [ "$arg" = '--version' ]; then
    printf 'pg_dump (PostgreSQL) 16.13\n'
    exit 0
  fi
done
exit 43
