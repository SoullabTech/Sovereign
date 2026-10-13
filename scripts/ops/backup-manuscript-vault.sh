#!/usr/bin/env bash
# WS-VAULT-BACKUP-01 — encrypted-only Source vault archive candidate.
# Default = read-only preflight. Production writes require independent Class A
# approval and recovery/retention receipts. Never run as a new cron job by default.
set -Eeuo pipefail
umask 077

MODE="${1:---preflight}"
PUBLIC_VOLUME='maia-sovereign_vault_data'
PRODUCTION_NAS='//192.168.4.42/soullab-backups'
PROD_DEST='/mnt/ds225/maia-encrypted-release-backups/manuscript-vault'
PROD_RECIPIENT='CF8F15836A03DC444E521B600A8285A96F374F2D'
DEST=''
RECIPIENT=''
SOURCE=''
PENDING=''

fail(){ printf 'REFUSED: %s\n' "$*" >&2; exit 2; }
cleanup(){
  if [ -n "$PENDING" ] && [ -f "$PENDING" ]; then
    rm -f -- "$PENDING" || true
  fi
}
trap cleanup EXIT HUP INT TERM

case "$MODE" in
  --preflight|--execute)
    command -v docker >/dev/null || fail 'Docker unavailable'
    command -v findmnt >/dev/null || fail 'Mount inspection unavailable'
    source_mount="$(docker inspect maia-sovereign --format '{{range .Mounts}}{{if eq .Destination "/app/data/vault"}}{{.Type}}:{{.Name}}{{end}}{{end}}' 2>/dev/null || true)"
    [ "$source_mount" = "volume:$PUBLIC_VOLUME" ] || fail 'Expected public vault volume not mounted'
    [ "$(docker volume inspect "$PUBLIC_VOLUME" --format '{{.Name}}' 2>/dev/null)" = "$PUBLIC_VOLUME" ] ||
      fail 'Expected public vault volume missing'
    mounted="$(findmnt -n -T /mnt/ds225 -t cifs -o SOURCE 2>/dev/null | tail -1)"
    [ "$mounted" = "$PRODUCTION_NAS" ] || fail 'Trusted NAS CIFS mount not verified'
    [ -d /mnt/ds225/maia-encrypted-release-backups ] || fail 'Encrypted NAS root absent'
    [ -w /mnt/ds225/maia-encrypted-release-backups ] || fail 'Encrypted NAS root not writable'
    RECIPIENT="$PROD_RECIPIENT"
    DEST="$PROD_DEST"
    ;;
  --fixture-test)
    # Fixture mode cannot use production source or NAS: caller must name two
    # paths under one /tmp/ws-vault-fixture-* root. Production mode ignores them.
    ROOT="${WS_VAULT_FIXTURE_ROOT:-}"
    [ -n "$ROOT" ] && [ -d "$ROOT" ] && [ ! -L "$ROOT" ] || fail 'Synthetic fixture root missing'
    ROOT="$(realpath -e "$ROOT")"
    case "$ROOT" in /tmp/ws-vault-fixture-*) : ;; *) fail 'Fixture root is not bounded to /tmp';; esac
    SOURCE="$ROOT/source"
    DEST="$ROOT/encrypted"
    [ -d "$SOURCE" ] && [ ! -L "$SOURCE" ] || fail 'Synthetic source missing'
    [ -d "$DEST" ] && [ ! -L "$DEST" ] || fail 'Synthetic output missing'
    RECIPIENT="${WS_VAULT_FIXTURE_RECIPIENT:-}"
    [ -n "$RECIPIENT" ] || fail 'Synthetic test recipient missing'
    ;;
  *) fail 'Usage: backup-manuscript-vault.sh [--preflight|--execute|--fixture-test]' ;;
esac

for tool in tar gpg python3 sha256sum stat realpath openssl; do
  command -v "$tool" >/dev/null || fail "Required tool unavailable: $tool"
done
case "$RECIPIENT" in
  *[!0-9a-fA-F]*|'') fail 'Recipient must be hexadecimal public-key fingerprint' ;;
esac
[ "${#RECIPIENT}" -eq 40 ] || fail 'Recipient must be full 40-character fingerprint'
gpg --batch --list-keys "$RECIPIENT" >/dev/null 2>&1 || fail 'Required public encryption key not available'

if [ "$MODE" = --preflight ]; then
  printf 'PREFLIGHT_PASS: expected Docker vault, trusted NAS, public key and tools found\n'
  printf 'RECOVERY_STATUS: not proven by preflight; no file copied or encrypted\n'
  exit 0
fi

if [ "$MODE" = --execute ]; then
  # These declarations are NOT cryptographic authorization. Governance still
  # requires independent, externally evidenced approvals before operator act.
  [ -n "${WS_VAULT_CLASS_A_RELEASE_REF:-}" ] || fail 'Independent Class A approval not supplied'
  [ -n "${WS_VAULT_RECOVERY_VERIFIED_REF:-}" ] || fail 'Private-key restore proof not supplied'
  [ -n "${WS_VAULT_ERASURE_POLICY_REF:-}" ] || fail 'Member erasure/backup-retention approval not supplied'
  [ -n "${WS_VAULT_NAS_ACL_REF:-}" ] || fail 'NAS ACL approval not supplied'
  [ "${WS_VAULT_EXECUTE_CONFIRMATION:-}" = 'ENCRYPT_REAL_MEMBER_VAULT' ] ||
    fail 'Explicit vault execution confirmation absent'
  mkdir -m 0700 -p -- "$DEST"
  [ ! -L "$DEST" ] || fail 'NAS destination is a symlink'
  [ "$(findmnt -n -T "$DEST" -t cifs -o SOURCE 2>/dev/null | tail -1)" = "$PRODUCTION_NAS" ] ||
    fail 'Destination escaped trusted CIFS mount'
  [ "$(df -Pk "$DEST" | awk 'NR==2{print $4}')" -ge 10485760 ] ||
    fail 'Less than 10GiB free NAS storage'
fi

# Never print source paths or file names. All archive metadata and bytes are
# carried only INSIDE the encrypted payload.
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
nonce="$(openssl rand -hex 10)"
FINAL="$DEST/vault-${stamp}-${nonce}.tar.gpg"
[ ! -e "$FINAL" ] || fail 'Destination already exists'
PENDING="$(mktemp "$DEST/.vault-${stamp}-${nonce}.XXXXXX.pending")"
[ -f "$PENDING" ] || fail 'Failed to reserve encrypted temporary artifact'

source "$(dirname "$0")/vault-archive-stream.sh"
emit_archive(){
  if [ "$MODE" = --fixture-test ]; then
    tar --format=posix --sort=name --numeric-owner --one-file-system -C "$SOURCE" -cf - .
  else
    # Read-only, unprivileged Docker volume stream; GPG stays on host.
    vault_emit_readonly_docker_tar "$PUBLIC_VOLUME"
  fi
}

# set -o pipefail above: a failed tar or gpg cannot publish a partial artifact.
emit_archive | gpg --batch --yes --trust-model always --cipher-algo AES256 \
   --recipient "$RECIPIENT" --encrypt --output "$PENDING"
[ -s "$PENDING" ] || fail 'Ciphertext is empty'
sha_before="$(sha256sum "$PENDING" | cut -d' ' -f1)"

# No-clobber same-directory hard-link publish; both file and directory are
# fsynced. If CIFS refuses hard links or fsync, stop with no completed backup.
python3 - "$PENDING" "$FINAL" <<'PY'
import os,sys
pending,final=sys.argv[1:3]
with open(pending,'rb') as f: os.fsync(f.fileno())
os.link(pending,final)
os.unlink(pending)
directory=os.open(os.path.dirname(final),os.O_RDONLY|os.O_DIRECTORY)
try: os.fsync(directory)
finally: os.close(directory)
PY
PENDING=''
sha_after="$(sha256sum "$FINAL" | cut -d' ' -f1)"
[ "$sha_before" = "$sha_after" ] || fail 'Published encrypted artifact changed'
size="$(stat -c '%s' "$FINAL")"
printf 'ENCRYPTED_ARCHIVE_STORED: ciphertext_sha256=%s bytes=%s\n' "$sha_after" "$size"
printf 'RESTORE_NOT_YET_PROVEN_BY_THIS_ACT: encrypted ciphertext is not a recovery demonstration\n'
