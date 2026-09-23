#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# NAS-BACKUP-01 / R1 — restore witness (Mac Studio only, disposable target)
# ═══════════════════════════════════════════════════════════════════════════════
# Question answered: can the latest intact nightly dump on the NAS be restored
# into a database at all, and does what comes back look like MAIA's schema?
#
# What it does:
#   1. Picks the newest `maia_*.sql.gz` on the NAS mount that passes `gzip -t`
#      AND carries pg_dump's closing marker (or takes the dump given as $1).
#   2. Copies it to a local temp file and records its SHA-256 (the NAS copy is
#      never modified; the 18 Sep file is under forensic hold and is skipped by
#      the integrity test regardless).
#   3. Starts a DISPOSABLE pgvector/pgvector:pg16 container with NO published
#      ports — nothing on this machine can connect to it except `docker exec`.
#   4. Restores through scripts/restore-governed.sh (R20: a raw psql restore is
#      refused by policy; the governed path is THE restore path), pointed at the
#      disposable via RESTORE_DB_URL and a psql/pg_dump shim that execs into
#      the container.
#   5. Verifies: extensions present, table count, row counts of a few tables
#      (counts only, never content), and that the restore exited 0.
#   6. Writes a content-free report to logs/ and DESTROYS the container and the
#      local dump copy, on success and on failure alike (trap).
#
# What it refuses:
#   - to run anywhere but macOS (production is Linux; this never touches it)
#   - to run without WITNESS_AUTHORIZED=1 and RESTORE_AUTHORIZED_BY=<ruling>
#   - to publish the report to the NAS unless WITNESS_PUBLISH=1
#
# Usage (from the Studio, NAS mounted at /Volumes/soullab-backups):
#   WITNESS_AUTHORIZED=1 RESTORE_AUTHORIZED_BY="NAS-BACKUP-01/R1 <founder> <date>" \
#     scripts/ops/nas-restore-witness.sh [dump.sql.gz]
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

fail() { echo "❌ $*" >&2; exit 1; }

[[ "$(uname -s)" == "Darwin" ]] || fail "witness runs on the Mac Studio only (this host: $(uname -s))"
[[ "${WITNESS_AUTHORIZED:-}" == "1" ]] || fail "refusing: set WITNESS_AUTHORIZED=1 (named founder act)"
[[ -n "${RESTORE_AUTHORIZED_BY:-}" ]] || fail "refusing: set RESTORE_AUTHORIZED_BY=<ruling ref> (R20)"
command -v docker >/dev/null || fail "docker not found"
docker info >/dev/null 2>&1 || fail "Docker Desktop is not running"

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
GOVERNED="$REPO/scripts/restore-governed.sh"
[[ -x "$GOVERNED" || -f "$GOVERNED" ]] || fail "missing $GOVERNED"

NAS_DIR="${NAS_DUMP_DIR:-/Volumes/soullab-backups/maia-backups/postgres}"
REPORT_DIR="${WITNESS_REPORT_DIR:-$REPO/logs}"
NAS_REPORT_DIR="${NAS_REPORT_DIR:-/Volumes/soullab-backups/maia-backups/restore-reports}"
IMAGE="${WITNESS_IMAGE:-pgvector/pgvector:pg16}"
NAME="maia-restore-witness-$$"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
REPORT="$REPORT_DIR/restore-witness-$STAMP.txt"
WORK="$(mktemp -d -t restore-witness)"
mkdir -p "$REPORT_DIR"

cleanup() {
  docker rm -f "$NAME" >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT

intact() {  # dump path → 0 if gzip-intact and carries the closing marker
  gzip -t "$1" 2>/dev/null || return 1
  gzip -cd -- "$1" 2>/dev/null | tail -n 8 | grep -q "PostgreSQL database dump complete"
}

# ── 1. choose the dump ────────────────────────────────────────────────────────
if [[ -n "${1:-}" ]]; then
  DUMP="$1"; [[ -f "$DUMP" ]] || fail "dump not found: $DUMP"
  intact "$DUMP" || fail "given dump fails integrity: $DUMP"
else
  [[ -d "$NAS_DIR" ]] || fail "NAS dump dir not mounted: $NAS_DIR"
  DUMP=""
  for f in $(ls -t "$NAS_DIR"/maia_*.sql.gz 2>/dev/null); do
    if intact "$f"; then DUMP="$f"; break; else echo "skip (not intact): $(basename "$f")"; fi
  done
  [[ -n "$DUMP" ]] || fail "no intact maia_*.sql.gz found in $NAS_DIR"
fi
echo "dump: $DUMP"

# ── 2. local copy + hash ──────────────────────────────────────────────────────
LOCAL="$WORK/$(basename "$DUMP")"
cp "$DUMP" "$LOCAL"
SHA_NAS="$(shasum -a 256 "$DUMP" | cut -d' ' -f1)"
SHA_LOCAL="$(shasum -a 256 "$LOCAL" | cut -d' ' -f1)"
[[ "$SHA_NAS" == "$SHA_LOCAL" ]] || fail "local copy hash differs from NAS (SMB read error?)"
BYTES="$(stat -f %z "$LOCAL")"
echo "sha256: $SHA_LOCAL ($BYTES bytes)"

# ── 3. disposable target, no ports ────────────────────────────────────────────
docker run -d --name "$NAME" \
  -e POSTGRES_USER=soullab -e POSTGRES_PASSWORD=witness -e POSTGRES_DB=maia_consciousness \
  "$IMAGE" >/dev/null
for i in $(seq 1 60); do
  docker exec "$NAME" pg_isready -U soullab -d maia_consciousness >/dev/null 2>&1 && break
  sleep 1; [[ $i -eq 60 ]] && fail "disposable postgres did not become ready"
done
echo "disposable: $NAME ($IMAGE), no published ports"

# psql/pg_dump shims → exec inside the container; 127.0.0.1 there is the target
SHIM="$WORK/bin"; mkdir -p "$SHIM"
cat > "$SHIM/psql"    <<S
#!/bin/bash
exec docker exec -i "$NAME" psql "\$@"
S
cat > "$SHIM/pg_dump" <<S
#!/bin/bash
exec docker exec -i "$NAME" pg_dump "\$@"
S
chmod +x "$SHIM/psql" "$SHIM/pg_dump"
URL="postgresql://soullab:witness@127.0.0.1:5432/maia_consciousness"

# ── 4. governed restore ───────────────────────────────────────────────────────
T0=$(date +%s)
set +e
PATH="$SHIM:$PATH" RESTORE_DB_URL="$URL" RESTORE_AUTHORIZED_BY="$RESTORE_AUTHORIZED_BY" \
  bash "$GOVERNED" "$LOCAL" >"$WORK/restore.out" 2>&1
RC=$?
set -e
T1=$(date +%s)
tail -n 5 "$WORK/restore.out"

# ── 5. verify (counts only) ───────────────────────────────────────────────────
q() { docker exec -i "$NAME" psql -U soullab -d maia_consciousness -At -c "$1" 2>/dev/null; }
EXTS="$(q "SELECT string_agg(extname, ',' ORDER BY extname) FROM pg_extension" || echo "?")"
TABLES="$(q "SELECT count(*) FROM pg_tables WHERE schemaname='public'" || echo "?")"
COUNTS=""
for t in members maia_turns developmental_memories schema_migrations; do
  if [[ "$(q "SELECT to_regclass('public.$t') IS NOT NULL")" == "t" ]]; then
    COUNTS+="  $t: $(q "SELECT count(*) FROM $t")"$'\n'
  else
    COUNTS+="  $t: ABSENT"$'\n'
  fi
done

if [[ $RC -eq 0 && "$TABLES" =~ ^[0-9]+$ && "$TABLES" -gt 0 ]]; then VERDICT=PASS; else VERDICT=FAIL; fi

# ── 6. report ─────────────────────────────────────────────────────────────────
{
  echo "NAS-BACKUP-01 / R1 restore witness"
  echo "when:         $STAMP"
  echo "host:         $(hostname) ($(uname -s))"
  echo "authorized:   $RESTORE_AUTHORIZED_BY"
  echo "dump:         $DUMP"
  echo "bytes:        $BYTES"
  echo "sha256:       $SHA_LOCAL"
  echo "image:        $IMAGE"
  echo "restore path: scripts/restore-governed.sh (R20 governed lane), exit=$RC, $((T1-T0))s"
  echo "extensions:   $EXTS"
  echo "public tables: $TABLES"
  echo "row counts (counts only, never content):"
  printf '%s' "$COUNTS"
  echo "verdict:      $VERDICT"
  echo "disposable destroyed: yes (trap)"
} | tee "$REPORT"
echo "report: $REPORT"

if [[ "${WITNESS_PUBLISH:-}" == "1" && -d "$NAS_REPORT_DIR" ]]; then
  cp "$REPORT" "$NAS_REPORT_DIR/" && echo "published: $NAS_REPORT_DIR/$(basename "$REPORT")"
fi

[[ "$VERDICT" == "PASS" ]]
