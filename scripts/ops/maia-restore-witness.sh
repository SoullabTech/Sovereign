#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# MAIA Sovereign — Scheduled restore witness (NAS-BACKUP-01 / R2 §III.C)
# Candidate for /usr/local/bin/maia-restore-witness on the minisforum,
# root cron, WEEKLY: Monday 04:00 UTC (see scripts/ops/r2-deploy/cron.d).
# ⛔ NOT DEPLOYED. Founder review precedes installation.
# ═══════════════════════════════════════════════════════════════════════════════
# Claim it establishes: the selected VERIFIED backup is MATERIALLY RESTORABLE.
# Nothing else — not that the nightly job ran, not that the artifact is intact
# (the sidecar already says so), and never anything about production, which it
# does not touch: the restore goes into a fresh, port-less, uniquely named
# disposable container that is destroyed on exit, success or failure.
#
#  1. select: newest postgres/maia_*.sql.gz that HAS a .sha256 sidecar and whose
#     digest re-computes to match (an unverified pre-R2 dump is not eligible);
#     or the file named in WITNESS_DUMP (harness / manual run)
#  2. copy locally, hash both copies (SMB/CIFS read errors surface here)
#  3. docker run pgvector/pgvector:pg16, no published ports, POSTGRES_USER=soullab
#  4. restore through scripts/restore-governed.sh (R20 governed lane) with
#     RESTORE_DB_URL + psql/pg_dump PATH shims that exec inside the container
#  5. deterministic sanity: extensions include vector · public tables ≥ MIN_TABLES
#     · members present and ≥ 1 row · schema_migrations present and ≥ 1 row
#  6. destroy the container (trap) · 7. write restore-reports/<stamp>.txt and
#     state/last-restore-witness.env · 8. PASS only if restore AND sanity passed
#
# Environment (optional): BACKUP_ROOT · MOUNT_POINT ("" disables) · REPO_DIR
#   (default /home/soullab/MAIA-SOVEREIGN) · WITNESS_DUMP · MIN_TABLES (500) ·
#   LOG_FILE (/var/log/maia-restore-witness.log) · WITNESS_IMAGE
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

BACKUP_ROOT="${BACKUP_ROOT:-/mnt/ds225/maia-backups}"
MOUNT_POINT="${MOUNT_POINT-/mnt/ds225}"
REPO_DIR="${REPO_DIR:-/home/soullab/MAIA-SOVEREIGN}"
LOG_FILE="${LOG_FILE:-/var/log/maia-restore-witness.log}"
IMAGE="${WITNESS_IMAGE:-pgvector/pgvector:pg16}"
MIN_TABLES="${MIN_TABLES:-500}"
POSTGRES_DIR="$BACKUP_ROOT/postgres"
REPORT_DIR="$BACKUP_ROOT/restore-reports"
STATE_DIR="$BACKUP_ROOT/state"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
NAME="maia-restore-witness-$$"
WORK=$(mktemp -d 2>/dev/null || mktemp -d -t rw)

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }
size_of()   { if stat -c %s "$1" >/dev/null 2>&1; then stat -c %s "$1"; else stat -f %z "$1"; fi; }
digest_of() { if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | cut -d' ' -f1; else shasum -a 256 "$1" | cut -d' ' -f1; fi; }
is_mountpoint() {
  if command -v mountpoint >/dev/null 2>&1; then mountpoint -q "$1"; return $?; fi
  local d p; d=$(stat -c %d "$1" 2>/dev/null || stat -f %d "$1"); p=$(stat -c %d "$1/.." 2>/dev/null || stat -f %d "$1/.."); [ "$d" != "$p" ]
}
write_atomic() { local f="$1"; printf '%s\n' "$2" > "$f.tmp.$$"; mv -f "$f.tmp.$$" "$f"; }

VERDICT=FAIL; REASON=""; DUMP=""; DUMP_BYTES=""; DUMP_SHA=""; RC=""; SECS=""
EXTS="?"; TABLES="?"; MEMBERS="?"; MIGS="?"

finish() {
  docker rm -f "$NAME" >/dev/null 2>&1 || true
  rm -rf "$WORK"
  mkdir -p "$REPORT_DIR" "$STATE_DIR" 2>/dev/null || true
  local report="$REPORT_DIR/restore-witness_${STAMP}.txt"
  {
    echo "NAS-BACKUP-01 restore witness"
    echo "when:           $STAMP"
    echo "host:           $(hostname)"
    echo "dump:           ${DUMP:-none-selected}"
    echo "bytes:          ${DUMP_BYTES:-?}"
    echo "sha256:         ${DUMP_SHA:-?}"
    echo "image:          $IMAGE"
    echo "restore:        governed lane (scripts/restore-governed.sh), exit=${RC:-not-run}, ${SECS:-?}s"
    echo "extensions:     $EXTS"
    echo "public tables:  $TABLES (min $MIN_TABLES)"
    echo "members rows:   $MEMBERS"
    echo "schema_migrations rows: $MIGS"
    echo "verdict:        $VERDICT"
    [ -n "$REASON" ] && echo "reason:         $REASON"
    echo "disposable destroyed: yes"
  } > "$report" 2>/dev/null || true
  write_atomic "$STATE_DIR/last-restore-witness.env" "$(printf 'WITNESS_RESULT=%s\nWITNESS_AT=%s\nWITNESS_DUMP=%s\nWITNESS_SHA256=%s\nWITNESS_REPORT=%s\nWITNESS_REASON=%s\n' "$VERDICT" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "${DUMP:-}" "${DUMP_SHA:-}" "$report" "${REASON:-}")" 2>/dev/null || true
  log "restore witness $VERDICT ${REASON:+— $REASON} (report: $report)"
  [ "$VERDICT" = "PASS" ]
}
trap finish EXIT
die() { REASON="$1"; log "FAIL: $1"; exit 1; }

log "=== restore witness started ==="
if [ -n "$MOUNT_POINT" ]; then is_mountpoint "$MOUNT_POINT" || die "$MOUNT_POINT not mounted"; fi
command -v docker >/dev/null || die "docker not found"
docker info >/dev/null 2>&1 || die "docker daemon not reachable"
[ -f "$REPO_DIR/scripts/restore-governed.sh" ] || die "governed restore script not found under $REPO_DIR"

# ── 1. select a VERIFIED backup ──────────────────────────────────────────────
if [ -n "${WITNESS_DUMP:-}" ]; then
  DUMP="$WITNESS_DUMP"; [ -f "$DUMP" ] || die "WITNESS_DUMP not found: $DUMP"
else
  for f in $(ls -t "$POSTGRES_DIR"/maia_*.sql.gz 2>/dev/null); do
    [ -f "$f.sha256" ] || continue
    if [ "$(cut -d' ' -f1 "$f.sha256")" = "$(digest_of "$f")" ]; then DUMP="$f"; break; fi
    log "skip: sidecar digest mismatch on $(basename "$f")"
  done
  [ -n "$DUMP" ] || die "no verified backup eligible (no daily dump with a matching .sha256 sidecar)"
fi
DUMP_BYTES=$(size_of "$DUMP"); DUMP_SHA=$(digest_of "$DUMP")
log "selected: $DUMP ($DUMP_BYTES bytes sha256=$DUMP_SHA)"

# ── 2. local copy, hashes must agree ─────────────────────────────────────────
LOCAL="$WORK/$(basename "$DUMP")"
cp "$DUMP" "$LOCAL" || die "could not copy dump locally"
[ "$(digest_of "$LOCAL")" = "$DUMP_SHA" ] || die "local copy digest differs from NAS copy (read error)"
gzip -t -- "$LOCAL" 2>/dev/null || die "dump fails gzip integrity"

# ── 3. disposable target, no ports ───────────────────────────────────────────
docker run -d --name "$NAME" \
  -e POSTGRES_USER=soullab -e POSTGRES_PASSWORD=witness -e POSTGRES_DB=maia_consciousness \
  "$IMAGE" >/dev/null || die "could not start disposable container"
for i in $(seq 1 90); do
  docker exec "$NAME" pg_isready -U soullab -d maia_consciousness >/dev/null 2>&1 && break
  sleep 1; [ "$i" -eq 90 ] && die "disposable postgres did not become ready"
done
SHIM="$WORK/bin"; mkdir -p "$SHIM"
printf '#!/bin/bash\nexec docker exec -i "%s" psql "$@"\n' "$NAME"    > "$SHIM/psql"
printf '#!/bin/bash\nexec docker exec -i "%s" pg_dump "$@"\n' "$NAME" > "$SHIM/pg_dump"
chmod +x "$SHIM/psql" "$SHIM/pg_dump"
URL="postgresql://soullab:witness@127.0.0.1:5432/maia_consciousness"

# ── 4. governed restore ──────────────────────────────────────────────────────
T0=$(date +%s)
set +e
PATH="$SHIM:$PATH" RESTORE_DB_URL="$URL" RESTORE_AUTHORIZED_BY="NAS-BACKUP-01/R2 scheduled restore witness" \
  bash "$REPO_DIR/scripts/restore-governed.sh" "$LOCAL" >"$WORK/restore.out" 2>&1
RC=$?
set -e
SECS=$(( $(date +%s) - T0 ))
[ "$RC" -eq 0 ] || { tail -n 20 "$WORK/restore.out" | tee -a "$LOG_FILE"; die "governed restore exited $RC"; }

# ── 5. deterministic sanity (counts only, never content) ─────────────────────
q() { docker exec -i "$NAME" psql -U soullab -d maia_consciousness -At -c "$1" 2>/dev/null; }
EXTS=$(q "SELECT string_agg(extname, ',' ORDER BY extname) FROM pg_extension" || echo "?")
TABLES=$(q "SELECT count(*) FROM pg_tables WHERE schemaname='public'" || echo 0)
MEMBERS=$(q "SELECT count(*) FROM members" 2>/dev/null || echo "ABSENT")
MIGS=$(q "SELECT count(*) FROM schema_migrations" 2>/dev/null || echo "ABSENT")
case ",$EXTS," in *,vector,*) ;; *) die "vector extension absent after restore";; esac
[ "$TABLES" -ge "$MIN_TABLES" ] 2>/dev/null || die "public table count $TABLES below minimum $MIN_TABLES"
[ "$MEMBERS" != "ABSENT" ] && [ "$MEMBERS" -ge 1 ] 2>/dev/null || die "members table absent or empty ($MEMBERS)"
[ "$MIGS" != "ABSENT" ] && [ "$MIGS" -ge 1 ] 2>/dev/null || die "schema_migrations absent or empty ($MIGS)"

VERDICT=PASS
log "restore verified: tables=$TABLES members=$MEMBERS migrations=$MIGS in ${SECS}s"
exit 0
