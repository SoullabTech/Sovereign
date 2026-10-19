#!/usr/bin/env bash
# WS-VAULT-RESTORE-01 · synthetic-only encryption and NAS restore witness.
# Never opens, backs up, or decrypts member data. Test key resides in tmpfs.
set -Eeuo pipefail
umask 077
SCRIPT="${1:?pass vetted backup script path}"
test -f "$SCRIPT"
ROOT="$(mktemp -d /tmp/ws-vault-fixture-XXXXXXXX)"
TESTKEY="$(mktemp -d /dev/shm/ws-vault-test-key.XXXXXXXX)"
EMPTYKEY="$(mktemp -d /dev/shm/ws-vault-no-key.XXXXXXXX)"
NAS_FIXTURE="/mnt/ds225/maia-encrypted-release-backups/.ws-vault-fixture-$(basename "$ROOT")"
CIPHERTEXT=''
cleanup(){
  if [ -n "$NAS_FIXTURE" ] && [ -d "$NAS_FIXTURE" ];then
    case "$NAS_FIXTURE" in
      /mnt/ds225/maia-encrypted-release-backups/.ws-vault-fixture-ws-vault-fixture-*)
        rm -rf -- "$NAS_FIXTURE" ;;
    esac
  fi
  rm -rf -- "$ROOT" "$TESTKEY" "$EMPTYKEY"
}
trap cleanup EXIT HUP INT TERM

[ "$(findmnt -n -T /mnt/ds225 -t cifs -o SOURCE | tail -1)" = '//192.168.4.42/soullab-backups' ] ||
  { echo "TEST_NAS_NOT_TRUSTED"; exit 2; }
mkdir -p "$ROOT"/{source/chapters,encrypted,recovered,via-nas}
python3 - "$ROOT/source" <<'PY'
from pathlib import Path
import sys
root=Path(sys.argv[1])
(root/'synthetic-story.txt').write_text('TEST ONLY: A voice is heard without interruption.\n☀️\n' * 30)
(root/'chapters'/'draft.bin').write_bytes(bytes(range(256))*128)
(root/'chapters'/'chapter-one.md').write_text('# This is synthetic test text, not member writing\n' * 20)
(root/'chapters'/'a-link').symlink_to('chapter-one.md')
PY
echo "SYNTHETIC_CONTENT_CREATED"

chmod 700 "$TESTKEY" "$EMPTYKEY"
export GNUPGHOME="$TESTKEY"
gpg --batch --pinentry-mode loopback --passphrase '' \
  --quick-generate-key 'WS Vault Fixture <test-only@local.invalid>' rsa2048 encr 1d \
  >/dev/null 2>&1
RECIPIENT="$(gpg --batch --with-colons --list-keys | awk -F: '$1=="fpr" {print $10;exit}')"
[ "${#RECIPIENT}" -eq 40 ] || { echo "FIXTURE_KEY_FAILED";exit 3; }
WS_VAULT_FIXTURE_ROOT="$ROOT" WS_VAULT_FIXTURE_RECIPIENT="$RECIPIENT" \
  bash "$SCRIPT" --fixture-test > "$ROOT/backup-receipt.txt"
cat "$ROOT/backup-receipt.txt"
CIPHERTEXT="$(find "$ROOT/encrypted" -maxdepth 1 -type f -name '*.gpg' -print -quit)"
test -s "$CIPHERTEXT"
test "$(find "$ROOT/encrypted" -maxdepth 1 -type f -name '.*.pending' | wc -l)" = 0
if env GNUPGHOME="$EMPTYKEY" gpg --batch --quiet --decrypt "$CIPHERTEXT" >/dev/null 2>&1; then
  echo "ERROR: UNAUTHORIZED_DECRYPT_SUCCEEDED";exit 4
fi
echo "PRIVATE_KEY_REQUIRED_CONFIRMED"

# Valid GPG decrypt and tar extraction happen ONLY in disposable fixture dirs.
gpg --batch --quiet --decrypt "$CIPHERTEXT" | tar -C "$ROOT/recovered" -xf -
python3 - "$ROOT/source" "$ROOT/recovered" <<'PY'
import hashlib,os,sys
from pathlib import Path
def manifest(root):
    entries=[]
    for p in sorted(root.rglob('*')):
        rel=p.relative_to(root).as_posix()
        if p.is_symlink(): entries.append((rel,'symlink',os.readlink(p)))
        elif p.is_file(): entries.append((rel,'file',hashlib.sha256(p.read_bytes()).hexdigest()))
        elif p.is_dir(): entries.append((rel,'dir',''))
    return entries
assert manifest(Path(sys.argv[1]))==manifest(Path(sys.argv[2]))
print('FIXTURE_RESTORE_ALL_BYTES_AND_LINKS_VERIFIED',len(manifest(Path(sys.argv[1]))))
PY

# Tamper must invalidate the encrypted payload; no extraction of corrupt bytes.
cp "$CIPHERTEXT" "$ROOT/tampered.gpg"
python3 - "$ROOT/tampered.gpg" <<'PY'
from pathlib import Path
import sys
p=Path(sys.argv[1])
with p.open('r+b') as f:
    f.seek(-18,2);x=f.read(1);f.seek(-18,2);f.write(bytes([x[0]^0xFF]))
PY
if gpg --batch --quiet --decrypt "$ROOT/tampered.gpg" >/dev/null 2>&1;then
  echo "TAMPERED_ENCRYPTED_ARCHIVE_WAS_ACCEPTED";exit 5
fi
echo "TAMPERED_ARCHIVE_REJECTED"

# Only synthetic ciphertext is written to the Synology. No private key or
# plaintext member content ever traverses this share.
mkdir -m 0700 "$NAS_FIXTURE"
PENDING="$NAS_FIXTURE/.test-archive.pending"
FINAL="$NAS_FIXTURE/fixture-archive.tar.gpg"
cp -- "$CIPHERTEXT" "$PENDING"
python3 - "$PENDING" "$FINAL" <<'PY'
import os,sys
pending,final=sys.argv[1:]
with open(pending,'rb') as f:os.fsync(f.fileno())
os.link(pending,final)
os.unlink(pending)
directory=os.open(os.path.dirname(final),os.O_RDONLY|os.O_DIRECTORY)
try:os.fsync(directory)
finally:os.close(directory)
PY
[ "$(sha256sum "$CIPHERTEXT" | cut -d' ' -f1)" = "$(sha256sum "$FINAL" | cut -d' ' -f1)" ] ||
  { echo "CIPHERTEXT_CHANGED_ON_NAS";exit 6; }
gpg --batch --quiet --decrypt "$FINAL" | tar -C "$ROOT/via-nas" -xf -
python3 - "$ROOT/source" "$ROOT/via-nas" <<'PY'
import hashlib,os,sys
from pathlib import Path
def tree(root):
    out=[]
    for p in sorted(root.rglob('*')):
        rel=str(p.relative_to(root))
        if p.is_symlink():out.append((rel,'link',os.readlink(p)))
        elif p.is_file():out.append((rel,'file',hashlib.sha256(p.read_bytes()).hexdigest()))
        else:out.append((rel,'dir',None))
    return out
assert tree(Path(sys.argv[1]))==tree(Path(sys.argv[2]))
print('NAS_ENCRYPTED_ROUNDTRIP_EXACT_BYTES_PASS',len(tree(Path(sys.argv[1]))))
PY

# Production mode without independently recorded authorizations is refused.
if env -u WS_VAULT_CLASS_A_RELEASE_REF -u WS_VAULT_RECOVERY_VERIFIED_REF \
  -u WS_VAULT_ERASURE_POLICY_REF -u WS_VAULT_NAS_ACL_REF \
  -u WS_VAULT_EXECUTE_CONFIRMATION bash "$SCRIPT" --execute >"$ROOT/refusal.txt" 2>&1;then
  echo "UNAUTHORIZED_PRODUCTION_BACKUP_WAS_NOT_BLOCKED";exit 7
fi
grep -q 'REFUSED:' "$ROOT/refusal.txt"
echo "UNAUTHORIZED_PRODUCTION_BACKUP_REFUSED"
echo "FIXTURE_ONLY_ENCRYPTION_NAS_RESTORE_WITNESS_PASS"
