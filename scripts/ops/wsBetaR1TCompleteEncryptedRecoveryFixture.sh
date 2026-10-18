#!/usr/bin/env bash
# R1T — one encrypted DB+vault recovery GENERATION, fixture ONLY.
# This is NOT A PRODUCTION BACKUP WRITER and cannot use maia-postgres, NAS,
# Mac/home vaults, live credentials or cron. No production execution branch.
# Release readiness requires separate real encryption recipient custody,
# consistent SQL/vault snapshot, erasure nonresurrection, replacement of BOTH
# installed backup jobs, cold offsite restore and independent Class A review.
set -Eeuo pipefail
umask 077

refuse(){ printf 'R1T_ENCRYPTED_RECOVERY_REFUSED_%s\n' "$1" >&2; exit 70; }
[[ "$#" -eq 0 ]] || refuse 'UNEXPECTED_ARGUMENTS'
[[ "${WS_R1T_MODE:-}" == 'fictional-only' ]] || refuse 'DEFAULT_OFF'
[[ "${WS_R1T_SOURCE_CONTAINER:-}" =~ ^ws-r1t-src-[a-f0-9]{8}$ ]] || refuse 'SOURCE_SCOPE'
[[ "${WS_R1T_EVIDENCE_DIR:-}" == /Volumes/T7\ Shield/ws-beta-r1t-* ]] || refuse 'EVIDENCE_SCOPE'
[[ -d "${WS_R1T_EVIDENCE_DIR:-/nonexistent}" && ! -L "${WS_R1T_EVIDENCE_DIR:-/nonexistent}" ]] || refuse 'EVIDENCE_DIRECTORY'
[[ -d "${GNUPGHOME:-/nonexistent}" && ! -L "${GNUPGHOME:-/nonexistent}" ]] || refuse 'PUBLIC_KEYRING_DIRECTORY'
[[ "${WS_R1T_RECIPIENT_FPR:-}" =~ ^[A-Fa-f0-9]{40}$ ]] || refuse 'PUBLIC_RECIPIENT_FINGERPRINT'
[[ "${WS_R1T_FAIL_STAGE:-}" == '' || "${WS_R1T_FAIL_STAGE}" == after_db ||
   "${WS_R1T_FAIL_STAGE}" == after_vault || "${WS_R1T_FAIL_STAGE}" == before_complete ]] || refuse 'INVALID_FAILURE_MODE'
command -v docker >/dev/null 2>&1 || refuse 'DOCKER_UNAVAILABLE'
command -v gpg >/dev/null 2>&1 || refuse 'GPG_UNAVAILABLE'
command -v tar >/dev/null 2>&1 || refuse 'TAR_UNAVAILABLE'
command -v shasum >/dev/null 2>&1 || refuse 'SHASUM_UNAVAILABLE'
command -v python3 >/dev/null 2>&1 || refuse 'PYTHON_UNAVAILABLE'
[[ "$(stat -f '%Lp' "$WS_R1T_EVIDENCE_DIR")" == 700 ]] || refuse 'EVIDENCE_NOT_PRIVATE'
[[ "$(stat -f '%Lp' "$GNUPGHOME")" == 700 ]] || refuse 'PUBLIC_KEYRING_NOT_PRIVATE'
base="$(cd "$WS_R1T_EVIDENCE_DIR" && pwd -P)"
[[ "$base" == "$WS_R1T_EVIDENCE_DIR" ]] || refuse 'EVIDENCE_SYMLINK_PATH'
vault="$base/fictional-vault"
[[ -d "$vault" && ! -L "$vault" ]] || refuse 'FICTIONAL_VAULT_REQUIRED'
[[ "$(cd "$vault" && pwd -P)" == "$vault" ]] || refuse 'VAULT_SYMLINK_PATH'
[[ -z "$(find "$vault" -type l -print -quit)" ]] || refuse 'VAULT_SYMLINK_CONTENT'
[[ -z "$(find "$vault" ! -type d ! -type f -print -quit)" ]] || refuse 'VAULT_SPECIAL_FILE'
[[ "$(find "$vault" -type f | wc -l | tr -d ' ')" -ge 2 ]] || refuse 'FICTIONAL_MEDIA_COUNT'

fpr="$(printf '%s' "$WS_R1T_RECIPIENT_FPR"|tr '[:lower:]' '[:upper:]')"
installed="$( (gpg --batch --homedir "$GNUPGHOME" --with-colons --list-keys "$fpr" 2>/dev/null || true) | awk -F: '$1=="fpr"{print toupper($10)}')"
printf '%s\n' "$installed" | grep -Fxq "$fpr" || refuse 'MISSING_PUBLIC_RECIPIENT'
if gpg --batch --homedir "$GNUPGHOME" --with-colons --list-secret-keys 2>/dev/null | grep -Eq '^sec:'; then
  refuse 'BACKUP_WRITER_HAS_PRIVATE_KEY'
fi
container="$WS_R1T_SOURCE_CONTAINER"
[[ "$(docker inspect -f '{{.Name}}|{{.HostConfig.NetworkMode}}|{{len .Mounts}}|{{index .Config.Labels "soullab.fixture"}}' "$container" 2>/dev/null)" == "/$container|none|0|r1t" ]] || refuse 'NOT_ISOLATED_R1T_CONTAINER'
docker exec "$container" pg_isready -U fict -d ws_fixture >/dev/null 2>&1 || refuse 'FICTIONAL_POSTGRES_UNAVAILABLE'

complete="$base/complete"
if [[ ! -e "$complete" ]];then mkdir -m 700 "$complete" || refuse 'COMPLETE_DIRECTORY_CREATE';fi
[[ -d "$complete" && ! -L "$complete" && "$(stat -f '%Lp' "$complete")" == 700 ]] || refuse 'COMPLETE_DIRECTORY_UNSAFE'
# Unique per-attempt, private staging. Incomplete generations are never
# advertised via the complete/ directory; cleanup removes only THIS pending.
pending="$(mktemp -d "$base/.r1t.pending.XXXXXXXX")" || refuse 'STAGING_UNAVAILABLE'
[[ "$pending" == "$base/.r1t.pending."* ]] || refuse 'STAGING_PATH_OUT_OF_SCOPE'
cleanup(){
 if [[ -n "${pending:-}" && -d "$pending" && "$pending" == "$base/.r1t.pending."* ]];then
   rm -rf -- "$pending"
 fi
}
trap cleanup EXIT
trap 'exit 70' HUP INT TERM
generation="$(date -u +%Y%m%dT%H%M%SZ)-$(basename "$pending" | sed 's/^\.r1t.pending\.//')"
final="$complete/$generation"
[[ ! -e "$final" ]] || refuse 'GENERATION_COLLISION'

# Actual pg_dump never produces a plaintext archive on disk. The writer's
# only output is ciphertext. Linux production credentials are NOT accepted.
docker exec "$container" pg_dump -U fict -Fc ws_fixture |
  gpg --batch --no-tty --yes --homedir "$GNUPGHOME" --trust-model always \
    --cipher-algo AES256 --encrypt --recipient "$fpr" --output "$pending/postgres.pgdump.gpg" \
  || refuse 'SQL_DUMP_OR_ENCRYPTION'
[[ -s "$pending/postgres.pgdump.gpg" ]] || refuse 'EMPTY_ENCRYPTED_SQL'
[[ "${WS_R1T_FAIL_STAGE:-}" != after_db ]] || refuse 'INJECTED_AFTER_SQL'

# Entire fixture vault is encrypted in transit; no plaintext tar/tempfile.
# Production vault content scope and coherent capture remain NOT CERTIFIED.
tar -C "$vault" -cf - . |
  gpg --batch --no-tty --yes --homedir "$GNUPGHOME" --trust-model always \
    --cipher-algo AES256 --encrypt --recipient "$fpr" --output "$pending/vault.tar.gpg" \
  || refuse 'VAULT_TAR_OR_ENCRYPTION'
[[ -s "$pending/vault.tar.gpg" ]] || refuse 'EMPTY_ENCRYPTED_VAULT'
[[ "${WS_R1T_FAIL_STAGE:-}" != after_vault ]] || refuse 'INJECTED_AFTER_VAULT'
for archive in "$pending/postgres.pgdump.gpg" "$pending/vault.tar.gpg";do
  [[ "$(stat -f '%Lp' "$archive")" == 600 ]] || refuse 'ARCHIVE_PERMISSIONS'
  [[ "$(stat -f '%z' "$archive")" -gt 100 ]] || refuse 'SUSPICIOUSLY_SMALL_CIPHERTEXT'
done
postgres_sha="$(shasum -a 256 "$pending/postgres.pgdump.gpg" | awk '{print $1}')"
vault_sha="$(shasum -a 256 "$pending/vault.tar.gpg" | awk '{print $1}')"

# Manifest contains opaque digests and ciphertext byte counts only. No
# member metadata, filenames, Work secrets or plaintext content are included.
python3 - "$pending" "$generation" "$postgres_sha" "$vault_sha" <<'PY'
import json,pathlib,sys
p=pathlib.Path(sys.argv[1]);generation,pg_hash,vault_hash=sys.argv[2:]
manifest={
  'protocol':'soullab.ws.r1t.complete-encrypted-recovery.fixture.v1',
  'generation':generation,
  'status':'FICTIONAL_DB_AND_VAULT_CIPHERTEXT_COMPLETE_BETA_HOLD',
  'source':'ONE_DISPOSABLE_POSTGRES_AND_TWO_OR_MORE_SYNTHETIC_FILES',
  'postgres':{'file':'postgres.pgdump.gpg','sha256':pg_hash,'bytes':(p/'postgres.pgdump.gpg').stat().st_size},
  'vault':{'file':'vault.tar.gpg','sha256':vault_hash,'bytes':(p/'vault.tar.gpg').stat().st_size},
  'productionSnapshotCoherenceVerified':False,
  'productionSqlWalCovered':False,'actualVaultAttachmentScopeVerified':False,
  'offHostRecoveryKeyProven':False,'deletedWorkNonresurrectionCertified':False,
  'productionCutoverApproved':False,'realMemberBetaApproved':False,
}
with (p/'manifest.json').open('x') as f:json.dump(manifest,f,indent=2);f.write('\n')
(p/'manifest.json').chmod(0o600)
PY
[[ "${WS_R1T_FAIL_STAGE:-}" != before_complete ]] || refuse 'INJECTED_BEFORE_COMPLETE'
# Atomic directory commit ONLY once all three files exist. A DB-only file
# is never mistaken for a recoverable complete generation.
[[ -f "$pending/postgres.pgdump.gpg" && -f "$pending/vault.tar.gpg" && -f "$pending/manifest.json" ]] || refuse 'NOT_COMPLETE'
mv -n -- "$pending" "$final" || refuse 'ATOMIC_GENERATION_PUBLICATION'
[[ -d "$final" && ! -e "$pending" ]] || refuse 'PUBLISH_UNVERIFIED'
pending=''
printf 'R1T_FICTIONAL_DB_AND_VAULT_GENERATION_PUBLISHED SHA256_DB=%s SHA256_VAULT=%s\n' "$postgres_sha" "$vault_sha"
