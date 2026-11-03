#!/bin/bash
# Restore a MAIA encrypted backup into a THROWAWAY scratch container and verify
# row counts against the manifest. A backup that has never been restored is a
# hope — this makes it a fact. Run on any machine with docker + gpg + the
# backup PRIVATE key (i.e. NOT minisforum; typically Mac Studio).
#
# Usage:
#   scripts/ops/restore-verify.sh <path/to/maia_*.dump.gpg> [path/to/manifest]
#   (manifest defaults to the sibling maia_*.manifest.txt)
#
# Env:
#   GNUPGHOME        keyring holding the private key (default ~/.maia-backup/gnupg)
#   GPG_PASSPHRASE_FILE  (default ~/.maia-backup/passphrase.txt)
#   SCRATCH_NAME     container name (default maia-restore-verify)
#   SCRATCH_PORT     host port (default 55432) — must not collide with a live stack
#   KEEP_SCRATCH=1   leave the container up for manual inspection (default: destroy)
#
# Never point this at a live stack's port/name. It creates and destroys its own
# container; it touches nothing else.
set -euo pipefail

ART="${1:?usage: restore-verify.sh <maia_*.dump.gpg> [manifest]}"
MANIFEST="${2:-${ART%.dump.gpg}.manifest.txt}"
export GNUPGHOME="${GNUPGHOME:-$HOME/.maia-backup/gnupg}"
GPG_PASSPHRASE_FILE="${GPG_PASSPHRASE_FILE:-$HOME/.maia-backup/passphrase.txt}"
SCRATCH_NAME="${SCRATCH_NAME:-maia-restore-verify}"
SCRATCH_PORT="${SCRATCH_PORT:-55432}"
SCRATCH_IMAGE="${SCRATCH_IMAGE:-pgvector/pgvector:pg16}"   # must match prod major version
PG_USER=soullab
PG_DB=maia_consciousness

PLAIN=$(mktemp -d)/restore.dump
cleanup() {
  rm -rf "$(dirname "$PLAIN")"
  if [ "${KEEP_SCRATCH:-0}" != "1" ]; then
    docker rm -f -v "$SCRATCH_NAME" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

[ -f "$ART" ] || { echo "FAIL: artifact not found: $ART" >&2; exit 1; }

# 1. Decrypt (private key required — this is also the key-health check).
gpg --batch --pinentry-mode loopback --passphrase-file "$GPG_PASSPHRASE_FILE" \
    -o "$PLAIN" --decrypt "$ART"
[ -s "$PLAIN" ] || { echo "FAIL: decrypted dump is empty" >&2; exit 1; }

# 2. Scratch postgres (fresh anonymous volume, own name+port; -v on rm removes it).
docker rm -f -v "$SCRATCH_NAME" >/dev/null 2>&1 || true
docker run -d --name "$SCRATCH_NAME" -p "127.0.0.1:$SCRATCH_PORT:5432" \
  -e POSTGRES_USER=$PG_USER -e POSTGRES_PASSWORD=restore-test -e POSTGRES_DB=$PG_DB \
  "$SCRATCH_IMAGE" >/dev/null

echo "waiting for scratch postgres..."
for i in $(seq 1 60); do
  docker exec "$SCRATCH_NAME" pg_isready -U $PG_USER -d $PG_DB >/dev/null 2>&1 && break
  sleep 1
  [ "$i" = 60 ] && { echo "FAIL: scratch postgres never became ready" >&2; exit 1; }
done

# 3. Restore. --no-owner/--no-privileges: single-db dump, roles differ in scratch.
#    pg_restore warnings (e.g. pre-existing extension) are tolerated; a zero-table
#    result is not — the count checks below are the real gate.
docker exec -i "$SCRATCH_NAME" pg_restore -U $PG_USER -d $PG_DB \
  --no-owner --no-privileges < "$PLAIN" || echo "note: pg_restore exited nonzero (warnings are common; verifying counts)"

# 4. Verify.
counts=$(docker exec "$SCRATCH_NAME" psql -U $PG_USER -d $PG_DB -At -c \
  "SELECT (SELECT count(*) FROM members) || '|' || (SELECT count(*) FROM member_memory_atoms) || '|' || (SELECT count(*) FROM quick_journal_entries) || '|' || (SELECT count(*) FROM pg_stat_user_tables)")
IFS='|' read -r r_members r_atoms r_journal r_tables <<< "$counts"

status=PASS
check() { # label restored expected
  if [ -n "$3" ] && [ "$2" != "$3" ]; then
    echo "  $1: restored=$2 expected=$3  << MISMATCH"; status=FAIL
  else
    echo "  $1: restored=$2 expected=${3:-n/a}"
  fi
}

e_members=""; e_atoms=""; e_journal=""; e_tables=""
if [ -f "$MANIFEST" ]; then
  e_members=$(awk '/^count_members:/ {print $2}' "$MANIFEST")
  e_atoms=$(awk '/^count_member_memory_atoms:/ {print $2}' "$MANIFEST")
  e_journal=$(awk '/^count_quick_journal_entries:/ {print $2}' "$MANIFEST")
  e_tables=$(awk '/^count_user_tables:/ {print $2}' "$MANIFEST")
else
  echo "note: no manifest found — reporting restored counts without comparison"
fi

echo "restore verification ($(basename "$ART")):"
check members "$r_members" "$e_members"
check member_memory_atoms "$r_atoms" "$e_atoms"
check quick_journal_entries "$r_journal" "$e_journal"
check user_tables "$r_tables" "$e_tables"

# Spot check: a real row must come back, not just counts (no content printed).
spot=$(docker exec "$SCRATCH_NAME" psql -U $PG_USER -d $PG_DB -At -c \
  "SELECT count(*) FROM members WHERE passkey IS NOT NULL AND length(passkey) > 0")
echo "  spot check — members with non-empty passkey: $spot"
[ "$spot" -gt 0 ] || status=FAIL

echo "RESULT: $status"
[ "$status" = "PASS" ]
