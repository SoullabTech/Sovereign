#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# MAIA Sovereign — Nightly Backup (NAS-BACKUP-01 / R2 hardened candidate)
# Candidate replacement for /usr/local/bin/maia-backup on the minisforum.
# ⛔ NOT DEPLOYED. Founder review precedes any change to the live authority.
# ═══════════════════════════════════════════════════════════════════════════════
# Law this script enforces (R2 §III.A): a PostgreSQL backup is reported
# successful, manifested, retained as canonical evidence, or promoted to a
# weekly/monthly generation ONLY after the completed NAS-resident artifact has
# independently passed integrity verification. "The command returned 0" is not
# evidence of a durable backup. The four claims — backup created · artifact
# intact · durable on the NAS · restorable — are recorded separately; this
# script establishes the first three and never the fourth (that is the
# restore witness, scripts/ops/maia-restore-witness.sh).
#
# Finalization sequence (fail-closed at every step):
#   1. pg_dump | gzip  →  postgres/.incoming/<name>.part   (never the final name)
#   2. every pipeline exit status checked (PIPESTATUS)
#   3. decompress the whole .part once: gzip integrity + pg_dump closing marker
#   4. bytes recorded · 5. sha256 recorded (both from the completed .part)
#   6. rename .part → final name (same filesystem, atomic on CIFS)  +  sync
#   7. REOPEN the final NAS-resident artifact: bytes and sha256 must match 4/5
#   8. only now: "PostgreSQL backup complete"; sidecar <final>.sha256 written
#   9. manifest records final path · exact bytes · digest · integrity=verified
#  Weekly/monthly promotion copies are re-verified after copy (§III.B).
#  A failed artifact is quarantined under postgres/.failed/, never left as
#  canonical. Files named in $BACKUP_ROOT/HOLD are never pruned (forensic hold).
#
# Environment (all optional; production cron sets none):
#   BACKUP_ROOT   default /mnt/ds225/maia-backups
#   MOUNT_POINT   default /mnt/ds225 — must be a mountpoint; set to "" only in
#                 the falsifier harness, where there is no NAS to mount
#   LOG_FILE      default /var/log/maia-backup.log
#   BACKUP_DOW / BACKUP_DOM  override date +%u / +%d (harness: promotion tests)
# The harness injects faults by PATH shims (docker · gzip · mv · sync · cp),
# never by switches inside this script.
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

BACKUP_ROOT="${BACKUP_ROOT:-/mnt/ds225/maia-backups}"
MOUNT_POINT="${MOUNT_POINT-/mnt/ds225}"
LOG_FILE="${LOG_FILE:-/var/log/maia-backup.log}"
POSTGRES_DIR="$BACKUP_ROOT/postgres"
INCOMING_DIR="$POSTGRES_DIR/.incoming"
FAILED_DIR="$POSTGRES_DIR/.failed"
MEDIA_DIR="$BACKUP_ROOT/media"
MANIFEST_DIR="$BACKUP_ROOT/manifests"
STATE_DIR="$BACKUP_ROOT/state"
HOLD_FILE="$BACKUP_ROOT/HOLD"
MIN_FREE_KB=10485760   # 10 GB

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y%m%d)
DOW="${BACKUP_DOW:-$(date +%u)}"   # 1=Monday 7=Sunday
DOM="${BACKUP_DOM:-$(date +%d)}"

log()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }
fail() { log "ERROR: $*"; log "=== MAIA backup FAILED ==="; exit 1; }

size_of()   { if stat -c %s "$1" >/dev/null 2>&1; then stat -c %s "$1"; else stat -f %z "$1"; fi; }
digest_of() { if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | cut -d' ' -f1; else shasum -a 256 "$1" | cut -d' ' -f1; fi; }
is_mountpoint() {
  if command -v mountpoint >/dev/null 2>&1; then mountpoint -q "$1"; return $?; fi
  local d p
  d=$(stat -c %d "$1" 2>/dev/null || stat -f %d "$1") ; p=$(stat -c %d "$1/.." 2>/dev/null || stat -f %d "$1/..")
  [ "$d" != "$p" ]
}
run_pg_dump() { docker exec maia-postgres pg_dump -U soullab maia_consciousness; }

# write $2 (content) to $1 atomically
write_atomic() { local f="$1"; printf '%s\n' "$2" > "$f.tmp.$$"; mv -f "$f.tmp.$$" "$f"; }

log "=== MAIA backup started (R2) ==="

# ── preconditions ────────────────────────────────────────────────────────────
if [ -n "$MOUNT_POINT" ]; then
  is_mountpoint "$MOUNT_POINT" || fail "$MOUNT_POINT is not mounted. Nothing written."
fi
mkdir -p "$POSTGRES_DIR" "$INCOMING_DIR" "$FAILED_DIR" "$MEDIA_DIR" "$MANIFEST_DIR" "$STATE_DIR"
AVAIL=$(df -k "$BACKUP_ROOT" | awk 'NR==2{print $4}')
[ "${AVAIL:-0}" -ge "$MIN_FREE_KB" ] || fail "less than 10GB free on backup volume ($AVAIL KB). Nothing written."

# ── 1–2. dump to a non-final name; check every pipeline status ───────────────
NAME="maia_${TIMESTAMP}.sql.gz"
PART="$INCOMING_DIR/$NAME.part"
FINAL="$POSTGRES_DIR/$NAME"
cleanup_part() { rm -f "$PART"; }
log "Dumping PostgreSQL → $(basename "$PART")"
set +e
run_pg_dump | gzip -c > "$PART"
ST=("${PIPESTATUS[@]}")
set -e
if [ "${ST[0]}" -ne 0 ] || [ "${ST[1]}" -ne 0 ]; then
  cleanup_part; fail "dump pipeline failed (pg_dump=${ST[0]} gzip=${ST[1]}). Partial artifact removed."
fi

# ── 3. integrity of the completed .part: one full decompression ──────────────
set +e
TAIL=$(gzip -cd -- "$PART" 2>/dev/null | tail -n 8)
GZ=${PIPESTATUS[0]}
set -e
[ "$GZ" -eq 0 ] || { cleanup_part; fail "gzip integrity check failed on $(basename "$PART") (exit $GZ). Removed."; }
printf '%s\n' "$TAIL" | grep -q "PostgreSQL database dump complete" \
  || { cleanup_part; fail "dump lacks pg_dump closing marker — incomplete. Removed."; }

# ── 4–5. record bytes + digest of the completed artifact ─────────────────────
PART_BYTES=$(size_of "$PART")
PART_SHA=$(digest_of "$PART")
[ "$PART_BYTES" -gt 0 ] || { cleanup_part; fail "zero-byte artifact. Removed."; }
log "Artifact complete in staging: $PART_BYTES bytes sha256=$PART_SHA"

# ── 6. finalize: same-filesystem rename, then sync ───────────────────────────
if ! mv -f "$PART" "$FINAL"; then
  cleanup_part; fail "finalization rename failed for $NAME. Staged artifact removed; no final artifact exists."
fi
sync || true

# ── 7. reopen the FINAL NAS-resident artifact and verify independently ───────
quarantine() {  # $1 reason
  local q="$FAILED_DIR/$NAME"
  mv -f "$FINAL" "$q" 2>/dev/null || true
  printf '%s\n' "$1" > "$q.reason" 2>/dev/null || true
  fail "$1 — artifact quarantined to $(basename "$FAILED_DIR")/$NAME, NOT canonical."
}
[ -f "$FINAL" ] || fail "final artifact absent after rename: $FINAL"
FINAL_BYTES=$(size_of "$FINAL")
[ "$FINAL_BYTES" = "$PART_BYTES" ] || quarantine "post-finalization size mismatch ($FINAL_BYTES != $PART_BYTES)"
FINAL_SHA=$(digest_of "$FINAL")
[ "$FINAL_SHA" = "$PART_SHA" ] || quarantine "post-finalization digest mismatch"
gzip -t -- "$FINAL" 2>/dev/null || quarantine "post-finalization gzip integrity failed"

# ── 8. only now: success, sidecar, state ─────────────────────────────────────
write_atomic "$FINAL.sha256" "$FINAL_SHA  $NAME"
log "PostgreSQL backup complete: $FINAL ($FINAL_BYTES bytes, sha256=$FINAL_SHA, verified on NAS)"
write_atomic "$STATE_DIR/last-verified-backup.env" "$(printf 'BACKUP_PATH=%s\nBACKUP_BYTES=%s\nBACKUP_SHA256=%s\nVERIFIED_AT=%s\n' "$FINAL" "$FINAL_BYTES" "$FINAL_SHA" "$(date -u +%Y-%m-%dT%H:%M:%SZ)")"

# ── media (unchanged from R1: incremental rsync; not part of the R2 claim) ───
MEDIA_RESULT="skipped"
MEDIA_VOL=$(docker inspect maia-sovereign --format '{{range .Mounts}}{{if eq .Destination "/app/data/media"}}{{.Source}}{{end}}{{end}}' 2>/dev/null || echo "")
if [ -n "$MEDIA_VOL" ] && [ -d "$MEDIA_VOL" ]; then
  if rsync -a --delete --stats "$MEDIA_VOL/" "$MEDIA_DIR/" 2>&1 | tail -5 | tee -a "$LOG_FILE"; then
    MEDIA_RESULT="rsync-ok"; log "Media backup complete: $MEDIA_DIR"
  else
    MEDIA_RESULT="rsync-FAILED"; log "WARNING: media rsync failed (backup artifact unaffected)"
  fi
else
  log "WARNING: media volume not found; media backup skipped"
fi

# ── promotion: weekly (Sunday) / monthly (1st) — copy, then verify the copy ──
promote() {  # $1 dest
  local dest="$1" b s
  cp -f "$FINAL" "$dest" || { rm -f "$dest"; fail "promotion copy failed: $(basename "$dest")"; }
  sync || true
  b=$(size_of "$dest"); s=$(digest_of "$dest")
  if [ "$b" != "$FINAL_BYTES" ] || [ "$s" != "$FINAL_SHA" ]; then
    rm -f "$dest"; fail "promotion copy $(basename "$dest") did not match its verified source (bytes $b/$FINAL_BYTES). Copy removed."
  fi
  write_atomic "$dest.sha256" "$s  $(basename "$dest")"
  log "Promoted + verified: $(basename "$dest")"
}
PROMOTED="none"
if [ "$DOM" = "01" ]; then promote "$POSTGRES_DIR/monthly_${DATE}.sql.gz"; PROMOTED="monthly"; fi
if [ "$DOW" = "7" ];  then promote "$POSTGRES_DIR/weekly_${DATE}.sql.gz";  PROMOTED="${PROMOTED},weekly"; fi

# ── retention: 14 daily · 56d weekly · 365d monthly; HOLD is never pruned ────
prune() {  # $1 glob-pattern  $2 mtime-days
  local f
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    if [ -f "$HOLD_FILE" ] && grep -qxF "$(basename "$f")" "$HOLD_FILE"; then
      log "HOLD: not pruning $(basename "$f")"; continue
    fi
    rm -f -- "$f" "$f.sha256"; log "Pruned: $(basename "$f")"
  done < <(find "$POSTGRES_DIR" -maxdepth 1 -name "$1" -mtime "+$2" 2>/dev/null)
}
prune "maia_*.sql.gz" 14
prune "weekly_*.sql.gz" 56
prune "monthly_*.sql.gz" 365
find "$INCOMING_DIR" -name '*.part' -mtime +1 -delete 2>/dev/null || true

# ── 9. manifest ───────────────────────────────────────────────────────────────
MANIFEST="$MANIFEST_DIR/manifest_${TIMESTAMP}.txt"
{
  echo "MAIA Backup Manifest (R2)"
  echo "Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "Hostname: $(hostname)"
  echo ""
  echo "PostgreSQL:"
  echo "  File: $FINAL"
  echo "  Bytes: $FINAL_BYTES"
  echo "  SHA256: $FINAL_SHA"
  echo "  Integrity: verified-on-nas (reopened after finalization; gzip + closing marker + digest)"
  echo "  Promotion: $PROMOTED"
  echo ""
  echo "Media: $MEDIA_RESULT $(du -sh "$MEDIA_DIR" 2>/dev/null | cut -f1)"
  echo "Backup volume free: $(df -h "$BACKUP_ROOT" | awk 'NR==2{print $4}')"
  echo ""
  echo "Postgres files retained (name bytes sha256-sidecar):"
  for f in "$POSTGRES_DIR"/*.sql.gz; do
    [ -f "$f" ] || continue
    printf '  %s %s %s\n' "$(basename "$f")" "$(size_of "$f")" "$( [ -f "$f.sha256" ] && cut -d' ' -f1 "$f.sha256" || echo unverified-pre-R2 )"
  done
} > "$MANIFEST.tmp" && mv -f "$MANIFEST.tmp" "$MANIFEST"
log "Manifest written: $MANIFEST"
log "=== MAIA backup complete (R2) ==="
