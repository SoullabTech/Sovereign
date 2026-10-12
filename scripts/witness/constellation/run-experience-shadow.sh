#!/usr/bin/env bash
set -euo pipefail
export LC_ALL=C LANG=C
# Explicitly creates and destroys its OWN socket-only PostgreSQL cluster.
# Never reads DATABASE_URL, never connects to the member or production database.
[[ "${1:-}" == '--run-disposable' ]] || { echo 'Usage: run-experience-shadow.sh --run-disposable' >&2; exit 2; }
PG_BIN="${PG_BIN:-/opt/homebrew/opt/postgresql@17/bin}"
[[ -x "$PG_BIN/initdb" && -x "$PG_BIN/pg_ctl" ]] || { echo 'Local PostgreSQL binaries required' >&2; exit 2; }
REPO="$(cd "$(dirname "$0")/../../.." && pwd)"
ROOT="$(mktemp -d /private/tmp/sl-c7b2-XXXXXX)"
printf 'C7B2 DISPOSABLE ONLY\n' > "$ROOT/witness.marker"
STARTED=0
cleanup() {
  local rc=$?
  if [[ "$rc" != 0 ]]; then
    for log in "$ROOT/init.log" "$ROOT/start.log" "$ROOT/server.log"; do
      [[ ! -f "$log" ]] || tail -12 "$log" >&2
    done
  fi
  if [[ "$STARTED" == 1 ]]; then
    "$PG_BIN/pg_ctl" -D "$ROOT/db" -m fast -w stop >/dev/null 2>&1 || { echo 'Owned witness cluster could not stop; directory retained' >&2; return; }
  fi
  # Only the newly minted directory with this exact marker may be removed.
  if [[ "$ROOT" == /private/tmp/sl-c7b2-* && "$(cat "$ROOT/witness.marker")" == 'C7B2 DISPOSABLE ONLY' ]]; then
    rm -rf -- "$ROOT"
  fi
}
trap cleanup EXIT
"$PG_BIN/initdb" -D "$ROOT/db" -U constellation_witness -A trust --encoding=UTF8 --locale=C > "$ROOT/init.log" 2>&1
printf "\nlisten_addresses = ''\nshared_buffers = '16MB'\nmax_connections = 12\n" >> "$ROOT/db/postgresql.conf"
"$PG_BIN/pg_ctl" -D "$ROOT/db" -o "-k $ROOT -p 56541" -l "$ROOT/server.log" -w start > "$ROOT/start.log" 2>&1
STARTED=1
"$PG_BIN/createdb" -h "$ROOT" -p 56541 -U constellation_witness constellation_witness
cd "$REPO"
CONSTELLATION_WITNESS_SOCKET="$ROOT" ./node_modules/.bin/tsx scripts/witness/constellation/experience-lifecycle.ts
