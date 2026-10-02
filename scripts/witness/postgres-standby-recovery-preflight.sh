#!/usr/bin/env bash
# Read-only preflight for O2 Postgres standby recovery.
# Proves only whether the primary is replication-ready and whether the standby
# host is reachable enough to begin recovery discovery. It changes nothing.

set -u

PRIMARY_SSH="${PRIMARY_SSH:-soullab@minisforum}"
STANDBY_SSH="${STANDBY_SSH:-soullab@100.118.111.37}"
CONNECT_TIMEOUT="${CONNECT_TIMEOUT:-5}"

say() { printf '%s\n' "$*"; }
fail() { say "FAIL · $*"; exit 2; }

say "== O2 standby recovery preflight =="
say "primary=$PRIMARY_SSH"
say "standby=$STANDBY_SSH"

say
say "-- primary replication posture --"
ssh -o BatchMode=yes -o ConnectTimeout="$CONNECT_TIMEOUT" "$PRIMARY_SSH" '
  set -eu
  printf "running_commit="; docker exec maia-sovereign printenv GIT_COMMIT
  printf "postgres_bind="; docker inspect -f "{{range .NetworkSettings.Ports}}{{println .}}{{end}}" maia-postgres 2>/dev/null || true
  printf "wal_level="; docker exec maia-postgres psql -U soullab maia_consciousness -Atc "SHOW wal_level;"
  printf "max_wal_senders="; docker exec maia-postgres psql -U soullab maia_consciousness -Atc "SHOW max_wal_senders;"
  printf "wal_keep_size="; docker exec maia-postgres psql -U soullab maia_consciousness -Atc "SHOW wal_keep_size;"
  printf "replication_rows="; docker exec maia-postgres psql -U soullab maia_consciousness -Atc "SELECT count(*) FROM pg_stat_replication;"
' || fail "primary witness unavailable"

say
say "-- standby reachability --"
if ! ssh -o BatchMode=yes -o ConnectTimeout="$CONNECT_TIMEOUT" "$STANDBY_SSH" '
  set -eu
  echo "standby_host=$(hostname)"
  echo "standby_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf "pg_basebackup="; command -v pg_basebackup || true
  pg_basebackup --version 2>/dev/null || true
  df -h /
  command -v docker >/dev/null 2>&1 && docker ps --format "container={{.Names}} image={{.Image}}" || true
' ; then
  fail "standby host is unreachable; restore host/network/Tailscale before any Postgres reseed"
fi

say
say "PASS · host is reachable. Continue with discovery in docs/ops/POSTGRES_STANDBY_RECOVERY_2026-10-01.md"
