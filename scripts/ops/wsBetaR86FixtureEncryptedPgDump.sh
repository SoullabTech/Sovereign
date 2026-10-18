#!/usr/bin/env bash
# R86 -- self-contained encrypted backup acceptance, deliberately FICTIONAL ONLY.
#
# The installed production cron writer must NEVER invoke this script: it has
# no production mode. This validates the future backup primitive on an isolated
# Postgres fixture with a PUBLIC-only recipient key. There is no unencrypted
# .sql/.dump tempfile, no live member data, no production archive, no retention
# change and no user-supplied arbitrary container.
set -Eeuo pipefail
umask 077

refuse() { printf '%s\n' "R86_BACKUP_REFUSED_$1" >&2; exit 70; }
[[ "${WS_R86_MODE:-}" == 'fictional-only' ]] || refuse 'DEFAULT_OFF'
[[ "${WS_R86_CONTAINER:-}" =~ ^ws-r86-src-[a-f0-9]{8}$ ]] || refuse 'CONTAINER_SCOPE'
[[ "${WS_R86_BACKUP_DIR:-}" == /Volumes/T7\ Shield/ws-beta-r86-* ]] || refuse 'DIRECTORY_SCOPE'
[[ -d "${WS_R86_BACKUP_DIR}" && ! -L "${WS_R86_BACKUP_DIR}" ]] || refuse 'DIRECTORY_ABSENT_OR_SYMLINK'
[[ -d "${GNUPGHOME:-/dev/null}" && ! -L "${GNUPGHOME:-/dev/null}" ]] || refuse 'GPG_HOME'
[[ "${WS_R86_RECIPIENT_FINGERPRINT:-}" =~ ^[A-Fa-f0-9]{40}$ ]] || refuse 'RECIPIENT_FINGERPRINT'
[[ "$(stat -f '%Lp' "${WS_R86_BACKUP_DIR}")" == '700' ]] || refuse 'BACKUP_DIR_PERMISSIONS'
[[ "$(stat -f '%Lp' "${GNUPGHOME}")" == '700' ]] || refuse 'GPG_HOME_PERMISSIONS'

command -v docker >/dev/null 2>&1 || refuse 'DOCKER_ABSENT'
command -v gpg >/dev/null 2>&1 || refuse 'GPG_ABSENT'
command -v shasum >/dev/null 2>&1 || refuse 'SHASUM_ABSENT'

# Validate an exact public recipient fingerprint; no secret/private key may
# exist in the writer's keyring. A true independent restore needs that key
# held by a separately trusted custodian, never the backup generator.
fpr="$(printf '%s' "${WS_R86_RECIPIENT_FINGERPRINT}" | tr '[:lower:]' '[:upper:]')"
installed="$(gpg --batch --homedir "${GNUPGHOME}" --with-colons --list-keys "${fpr}" 2>/dev/null \
  | awk -F: '$1=="fpr"{print toupper($10)}')"
printf '%s\n' "${installed}" | grep -Fxq "${fpr}" || refuse 'PUBLIC_RECIPIENT_KEY_NOT_FOUND'
if gpg --batch --homedir "${GNUPGHOME}" --with-colons --list-secret-keys 2>/dev/null \
  | grep -Eq '^sec:'; then
  refuse 'PRIVATE_KEY_INSIDE_BACKUP_WRITER'
fi

# Source fixture exists and is tagged fictional: this never targets the
# installed maia-postgres or accepts real DB credentials.
docker inspect -f '{{.Name}}' "${WS_R86_CONTAINER}" 2>/dev/null \
  | grep -Fxq "/${WS_R86_CONTAINER}" || refuse 'FICTIONAL_CONTAINER_ABSENT'
# Atomic publish only after pg_dump + encryption BOTH succeed. The sole
# on-disk pending artifact is ALREADY encrypted.
dir="${WS_R86_BACKUP_DIR}"
pending="$(mktemp "${dir}/.r86-pending.XXXXXXXX")"
cleanup() {
  if [[ -n "${pending:-}" && -e "${pending}" ]]; then rm -f -- "${pending}"; fi
}
trap cleanup EXIT HUP INT TERM
date_stamp="$(date -u +%Y%m%dT%H%M%SZ)"
id="$(basename "${pending}" | sed 's/^\.r86-pending\.//')"
final="${dir}/R86_FICTIONAL_${date_stamp}_${id}.pgdump.gpg"
[[ ! -e "${final}" ]] || refuse 'ARCHIVE_ALREADY_EXISTS'

docker exec "${WS_R86_CONTAINER}" pg_dump -U fict -Fc ws_fixture \
 | gpg --batch --yes --no-tty --homedir "${GNUPGHOME}" --trust-model always \
   --cipher-algo AES256 --encrypt --recipient "${fpr}" --output "${pending}" \
 || refuse 'DUMP_OR_ENCRYPTION_FAILED'
[[ -s "${pending}" ]] || refuse 'EMPTY_ENCRYPTED_ARCHIVE'
# mv in the same exclusive directory is an atomic publish, not a rewrite.
mv -n -- "${pending}" "${final}" || refuse 'ATOMIC_ENCRYPTED_PUBLISH_FAILED'
[[ -s "${final}" && ! -e "${pending}" ]] || refuse 'PUBLISH_INCOMPLETE'
digest="$(shasum -a 256 "${final}" | awk '{print $1}')"
size="$(stat -f '%z' "${final}")"
printf 'R86_FICTIONAL_ENCRYPTED_BACKUP_PUBLISHED SHA256=%s BYTES=%s\n' "${digest}" "${size}"
