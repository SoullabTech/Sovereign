#!/bin/bash
# MAIA encrypted offsite backup — Stage 0 reliability (runs on minisforum).
#
# Produces a GPG-encrypted pg_dump artifact + plaintext manifest (counts/hashes
# only, no member content) in STAGING_DIR, then ships it to any configured
# destination. The decryption key NEVER exists on this host — encryption uses
# the public key only (scripts/ops/maia-backup-public.asc).
#
# Sovereignty invariant: no unencrypted member data leaves this box.
# The plaintext dump exists only transiently in STAGING_DIR and is removed
# before any network transfer.
#
# Destinations (all optional, provider-swappable; configure at least one):
#   RCLONE_REMOTE   e.g. "b2:maia-backups/offsite" — any rclone backend
#   (pull model)    Mac Studio / any second machine pulls STAGING_DIR via
#                   scripts/ops/pull-offsite-copy.sh — prod box holds no
#                   credentials to anywhere.
#
# Config file (optional): ~/.maia-backup.env — overrides the defaults below.
set -euo pipefail

CONFIG_FILE="${CONFIG_FILE:-$HOME/.maia-backup.env}"
[ -f "$CONFIG_FILE" ] && . "$CONFIG_FILE"

PG_CONTAINER="${PG_CONTAINER:-maia-postgres}"
PG_USER="${PG_USER:-soullab}"
PG_DB="${PG_DB:-maia_consciousness}"
GPG_RECIPIENT="${GPG_RECIPIENT:-backup@soullab.life}"
STAGING_DIR="${STAGING_DIR:-$HOME/backups/offsite}"
LOCAL_RETENTION="${LOCAL_RETENTION:-7}"        # encrypted artifacts kept locally
RCLONE_REMOTE="${RCLONE_REMOTE:-}"             # empty = skip cloud push
RCLONE_MIN_AGE_PRUNE="${RCLONE_MIN_AGE_PRUNE:-30d}"
HEARTBEAT_URL="${HEARTBEAT_URL:-}"             # healthchecks.io-style ping URL

TS=$(date -u +%Y%m%dT%H%M%SZ)
DUMP="$STAGING_DIR/maia_${TS}.dump"            # transient plaintext (custom format)
ART="$STAGING_DIR/maia_${TS}.dump.gpg"         # encrypted artifact that ships
MANIFEST="$STAGING_DIR/maia_${TS}.manifest.txt"

fail() {
  echo "[$(date -u +%FT%TZ)] BACKUP FAILED: $*" >&2
  rm -f "$DUMP"
  [ -n "$HEARTBEAT_URL" ] && curl -fsS -m 10 --retry 3 "$HEARTBEAT_URL/fail" >/dev/null 2>&1 || true
  exit 1
}

mkdir -p "$STAGING_DIR"
chmod 700 "$STAGING_DIR"

# Encryption key must be present BEFORE we dump anything.
gpg --list-keys "$GPG_RECIPIENT" >/dev/null 2>&1 \
  || fail "GPG public key for $GPG_RECIPIENT not in keyring. Import scripts/ops/maia-backup-public.asc first."

# 1. Dump (read-only; custom format is compressed and pg_restore-able).
docker exec "$PG_CONTAINER" pg_dump -U "$PG_USER" -Fc "$PG_DB" > "$DUMP" \
  || fail "pg_dump exited nonzero"
[ -s "$DUMP" ] || fail "dump file is empty"

# 2. Manifest — verification metadata only (row counts, sizes, hashes). No content.
counts=$(docker exec "$PG_CONTAINER" psql -U "$PG_USER" -d "$PG_DB" -At -c \
  "SELECT (SELECT count(*) FROM members) || '|' || (SELECT count(*) FROM member_memory_atoms) || '|' || (SELECT count(*) FROM quick_journal_entries) || '|' || (SELECT count(*) FROM pg_stat_user_tables)") \
  || fail "manifest count query failed"
IFS='|' read -r c_members c_atoms c_journal c_tables <<< "$counts"

# 3. Encrypt, then destroy plaintext before anything else happens.
gpg --batch --yes --trust-model always -r "$GPG_RECIPIENT" -o "$ART" --encrypt "$DUMP" \
  || fail "gpg encryption failed"
rm -f "$DUMP"

sha256=$(sha256sum "$ART" | awk '{print $1}')
cat > "$MANIFEST" <<EOF
artifact: $(basename "$ART")
created_utc: $TS
db: $PG_DB
pg_image: $(docker inspect "$PG_CONTAINER" --format '{{.Config.Image}}')
sha256_encrypted: $sha256
size_bytes: $(stat -c %s "$ART")
count_members: $c_members
count_member_memory_atoms: $c_atoms
count_quick_journal_entries: $c_journal
count_user_tables: $c_tables
gpg_recipient: $GPG_RECIPIENT
EOF

# 4. Ship (cloud push, if configured; the pull path needs nothing here).
if [ -n "$RCLONE_REMOTE" ]; then
  command -v rclone >/dev/null || fail "RCLONE_REMOTE set but rclone not installed"
  rclone copy "$ART" "$RCLONE_REMOTE/" --checksum || fail "rclone copy artifact failed"
  rclone copy "$MANIFEST" "$RCLONE_REMOTE/" || fail "rclone copy manifest failed"
  # Remote retention (see RECOVERY_RUNBOOK.md — Retention policy).
  rclone delete "$RCLONE_REMOTE/" --min-age "$RCLONE_MIN_AGE_PRUNE" 2>/dev/null || true
fi

# 5. Local retention: keep newest N encrypted artifacts (+ their manifests).
ls -1t "$STAGING_DIR"/maia_*.dump.gpg 2>/dev/null | tail -n +$((LOCAL_RETENTION + 1)) | while read -r old; do
  rm -f "$old" "${old%.dump.gpg}.manifest.txt"
done

# 6. Heartbeat — dead-man switch (missing ping = alert).
[ -n "$HEARTBEAT_URL" ] && curl -fsS -m 10 --retry 3 "$HEARTBEAT_URL" >/dev/null 2>&1 || true

echo "[$(date -u +%FT%TZ)] OK artifact=$(basename "$ART") sha256=$sha256 members=$c_members atoms=$c_atoms journal=$c_journal tables=$c_tables shipped=${RCLONE_REMOTE:-pull-model}"
