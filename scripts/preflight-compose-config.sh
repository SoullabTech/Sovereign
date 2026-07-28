#!/usr/bin/env bash
# Final preflight step: validate the docker compose config.
#
# Guard: docker-compose.yml reads env_file .env.docker, which is gitignored and
# exists only in the main checkout — so in a fresh git worktree `docker compose
# config` fails with "env file ... .env.docker not found". Detect that case and
# print the exact fix instead of the raw compose error.
# See CLAUDE.md "Known recurring traps".
set -euo pipefail

if [ ! -f .env.docker ]; then
  git_dir="$(git rev-parse --git-dir 2>/dev/null || echo '')"
  common_dir="$(git rev-parse --git-common-dir 2>/dev/null || echo '')"
  if [ -n "$common_dir" ] && [ "$git_dir" != "$common_dir" ]; then
    main_checkout="$(cd "$common_dir/.." && pwd)"
    echo "preflight: .env.docker not found — this is a git worktree, and .env.docker is gitignored (it lives only in the main checkout)." >&2
    echo "preflight: fix with: cp ${main_checkout}/.env.docker .env.docker" >&2
  else
    echo "preflight: .env.docker not found — docker compose config requires it (env_file in docker-compose.yml)." >&2
  fi
  exit 1
fi

docker compose config >/dev/null
