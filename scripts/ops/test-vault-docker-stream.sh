#!/usr/bin/env bash
# WS-VAULT-STREAM-01 · synthetic Docker volume only; no member data.
set -Eeuo pipefail
umask 077
lib="$(dirname "$0")/vault-archive-stream.sh"
source "$lib"
VOL="ws-vault-fixture-stream-20261012-$(openssl rand -hex 5)"
DIR="$(mktemp -d /tmp/ws-vault-volume-XXXXXXXX)"
TESTKEY=''
cleanup(){
  docker volume rm "$VOL" >/dev/null 2>&1 || true
  if [ -n "$TESTKEY" ];then rm -rf -- "$TESTKEY";fi
  rm -rf -- "$DIR"
}
trap cleanup EXIT HUP INT TERM
docker volume create "$VOL" >/dev/null
docker run --rm --network none --cap-drop ALL --security-opt no-new-privileges \
 --mount "type=volume,source=$VOL,target=/synthetic" \
 --entrypoint sh node:22-slim -c '
   mkdir -p /synthetic/chapter
   printf "fixture-only words\n" > /synthetic/chapter/readme.txt
   printf "a second fictional paragraph\n" > /synthetic/root.txt
   chmod -R a+rX /synthetic
 ' >/dev/null
mkdir -p "$DIR/recovered"
vault_emit_readonly_docker_tar "$VOL" | tar -C "$DIR/recovered" -xf -
python3 - "$DIR/recovered" <<'PY'
from pathlib import Path
import sys
d=Path(sys.argv[1])
assert (d/'chapter'/'readme.txt').read_text()=='fixture-only words'+chr(10)
assert (d/'root.txt').read_text()=='a second fictional paragraph'+chr(10)
print('SYNTHETIC_READONLY_DOCKER_VOLUME_STREAM_PASS',len(list(d.rglob('*'))))
PY
# Malformed volume identities must never be passed to Docker.
if vault_emit_readonly_docker_tar 'synthetic;rm -rf /' >/dev/null 2>&1;then
 echo 'INVALID_VOLUME_NAME_ACCEPTED';exit 4
fi
echo 'UNSAFE_VOLUME_IDENTITY_REFUSED'
# Exercise the actual read-only volume pipe through GPG, not just TAR alone.
TESTKEY="$(mktemp -d /dev/shm/ws-vault-volume-key.XXXXXXXX)"
chmod 0700 "$TESTKEY"
export GNUPGHOME="$TESTKEY"
gpg --batch --pinentry-mode loopback --passphrase '' \
  --quick-generate-key 'WS Synthetic Volume <test-only@local.invalid>' rsa2048 encr 1d \
  >/dev/null 2>&1
recipient="$(gpg --batch --with-colons --list-keys | awk -F: '$1=="fpr"{print $10;exit}')"
[ -n "$recipient" ] || { echo 'TEST_VOLUME_GPG_KEY_MISSING';exit 5; }
vault_emit_readonly_docker_tar "$VOL" |
  gpg --batch --yes --trust-model always --recipient "$recipient" \
    --cipher-algo AES256 --encrypt --output "$DIR/volume.tar.gpg"
mkdir "$DIR/encrypted-restored"
gpg --batch --quiet --decrypt "$DIR/volume.tar.gpg" |
  tar -C "$DIR/encrypted-restored" -xf -
python3 - "$DIR/encrypted-restored" <<'PYINNER'
from pathlib import Path
import sys
d=Path(sys.argv[1])
assert (d/'chapter'/'readme.txt').read_text()=='fixture-only words'+chr(10)
assert (d/'root.txt').read_text()=='a second fictional paragraph'+chr(10)
print('READONLY_DOCKER_VOLUME_ENCRYPT_DECRYPT_PASS')
PYINNER

echo 'NO_LIVE_VAULT_READ_OR_MODIFIED'
