#!/usr/bin/env bash
set -euo pipefail
umask 077

if [[ "${WS_LEGACY_SOURCE_RECOVERY:-}" != "fictional-only" ]]; then
  echo 'REFUSED: set WS_LEGACY_SOURCE_RECOVERY=fictional-only' >&2
  exit 64
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
: "${WRITER_SOURCE_COMMIT:?exact source commit required}"
: "${WRITER_SOURCE_TREE:?exact source tree required}"
[[ "$WRITER_SOURCE_COMMIT" =~ ^[a-f0-9]{40}$ ]] || { echo 'invalid source commit' >&2; exit 64; }
[[ "$WRITER_SOURCE_TREE" =~ ^[a-f0-9]{40}$ ]] || { echo 'invalid source tree' >&2; exit 64; }

RUN="${R20_JOINED_RUN:-$(openssl rand -hex 4)}"
[[ "$RUN" =~ ^[a-f0-9]{8}$ ]] || { echo 'invalid run id' >&2; exit 64; }
PORT="${WRITER_LEGACY_RECOVERY_PORT:-5657}"
NAME="writer-legacy-recovery-${RUN}"
DB="ws_r20_joined_restore"
USER="fict"
DSN="postgresql://${USER}@127.0.0.1:${PORT}/${DB}"
PACKET="${WRITER_LEGACY_RECOVERY_EVIDENCE_DIR:-$HOME/Soullab-Review-Packets/WRITER_LEGACY_RECOVERY_${RUN}_20261027}"
EXTERNAL="$PACKET/external-authority"
SNAPSHOTS="$PACKET/snapshots"
LOCAL="$PACKET/local-state"
ACTIVE="$LOCAL/active"
VAULT="/tmp/writer-legacy-recovery-vault-${RUN}"
LOG="$PACKET/RUN.log"
mkdir -p "$PACKET" "$EXTERNAL" "$SNAPSHOTS" "$ACTIVE" "$VAULT"
chmod 700 "$PACKET" "$EXTERNAL" "$SNAPSHOTS" "$LOCAL" "$ACTIVE" "$VAULT"

cleanup() {
  docker rm -f "$NAME" >/dev/null 2>&1 || true
  rm -rf "$VAULT"
}
trap cleanup EXIT

docker rm -f "$NAME" >/dev/null 2>&1 || true
docker run -d --rm --name "$NAME" \
  --network bridge --memory 1g --cpus 2 \
  -e POSTGRES_HOST_AUTH_METHOD=trust \
  -e POSTGRES_USER="$USER" -e POSTGRES_DB="$DB" \
  -p "127.0.0.1:${PORT}:5432" \
  --tmpfs /var/lib/postgresql/data:rw,nosuid,nodev,size=768m \
  pgvector/pgvector:pg16 >/dev/null
for i in $(seq 1 120); do
  docker exec "$NAME" pg_isready -U "$USER" -d "$DB" >/dev/null 2>&1 && break
  [[ "$i" == 120 ]] && { echo 'PostgreSQL readiness timeout' >&2; exit 70; }
  sleep .25
done

export DATABASE_URL="$DSN"
export FILE_STORAGE_PATH="$VAULT"
export NODE_ENV=test
export WS_R20_JOINED_RESTORE=fictional-only
export R20_JOINED_RUN="$RUN"
export WRITER_LEGACY_RECOVERY_EVIDENCE_DIR="$PACKET"
export WRITER_LEGACY_RECOVERY_EXTERNAL_DIR="$EXTERNAL"
export WRITER_SOURCE_KEY_PROVIDER=local-test
export WRITER_SOURCE_KEK_ID="fictional-legacy-recovery-k1"
export WRITER_SOURCE_KEK='UVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVE='
unset WRITER_SOURCE_KEK_RING_JSON

run_phase() {
  local phase="$1" out="$2"
  ./node_modules/.bin/tsx scripts/witness/r20-writer-legacy-source-recovery.ts "$phase" \
    2>&1 | tee "$out"
}

drop_create_db() {
  docker exec "$NAME" psql -X -v ON_ERROR_STOP=1 -U "$USER" -d postgres \
    -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${DB}' AND pid<>pg_backend_pid();" >/dev/null
  docker exec "$NAME" dropdb --if-exists -U "$USER" "$DB"
  docker exec "$NAME" createdb -U "$USER" "$DB"
}

snapshot_db() {
  local out="$1"
  docker exec "$NAME" pg_dump -Fc --no-owner --no-privileges -U "$USER" -d "$DB" > "$out"
  [[ -s "$out" ]] || { echo "empty database snapshot: $out" >&2; exit 71; }
}

restore_db() {
  local dump="$1"
  drop_create_db
  docker exec -i "$NAME" pg_restore --exit-on-error --no-owner --no-privileges \
    -U "$USER" -d "$DB" < "$dump" >/dev/null
}

snapshot_vault() {
  local out="$1"
  tar -C "$VAULT" -czf "$out" .
}

restore_vault() {
  local archive="$1"
  rm -rf "$VAULT"; mkdir -p "$VAULT"; chmod 700 "$VAULT"
  tar -C "$VAULT" -xzf "$archive"
}

sha() { shasum -a 256 "$1" | awk '{print $1}'; }

{
  echo "protocol=soullab.writer.legacy-source-recovery-pg16.v1"
  echo "run=$RUN"
  echo "source_commit=$WRITER_SOURCE_COMMIT"
  echo "source_tree=$WRITER_SOURCE_TREE"
  echo "container=$NAME"
  echo "database=$DB"
  echo "vault_class=disposable_private_tmp"
  echo "real_member_data=false"
  echo "production_data=false"
  echo "release=HOLD"
} | tee "$LOG"

# Full current schema, including the exact legacy-retirement migration.
./scripts/bootstrap-database.sh 2>&1 | tee "$PACKET/00_BOOTSTRAP.log"
npm run db:migrate 2>&1 | tee "$PACKET/01_MIGRATIONS.log"

# Existing exact joined fixture seeds two complete fictional Works with plaintext Source.
./node_modules/.bin/tsx scripts/witness/r20-writer-old-snapshot-joined.ts seed \
  2>&1 | tee "$PACKET/02_SEED_LEGACY.log"

# Snapshot the genuinely dangerous pre-migration database and plaintext vault.
snapshot_db "$SNAPSHOTS/OLD_DATABASE.dump"
snapshot_vault "$SNAPSHOTS/OLD_VAULT.tar.gz"
OLD_DB_SHA="$(sha "$SNAPSHOTS/OLD_DATABASE.dump")"
OLD_VAULT_SHA="$(sha "$SNAPSHOTS/OLD_VAULT.tar.gz")"
OLD_DATABASE_GENERATION_SHA256="$OLD_DB_SHA" \
OLD_VAULT_GENERATION_SHA256="$OLD_VAULT_SHA" \
run_phase capture-old "$PACKET/03_CAPTURE_OLD.log"

# Simulated local recovery/admin state is intentionally inside the rollback set.
printf '%s\n' '{"source":"legacy-local-state","generation":0}' > "$ACTIVE/application-source.json"
printf '%s\n' '{"provider":"none","generation":0}' > "$ACTIVE/writer-source-key-metadata.json"
printf '%s\n' '{"admin":"fictional-local-admin","generation":0}' > "$ACTIVE/admin-state.json"
tar -C "$ACTIVE" -czf "$SNAPSHOTS/OLD_LOCAL_STATE.tar.gz" .

# Real local R20 ledger/key state protects the migration and deletion act.
openssl rand -hex 32 > "$ACTIVE/r20-ledger.key"
chmod 600 "$ACTIVE/r20-ledger.key"
export R20_LEDGER_FILE="$ACTIVE/r20-ledger.json"
export R20_HIGH_WATER_FILE="$ACTIVE/r20-high-water.json"
export R20_LEDGER_KEY_FILE="$ACTIVE/r20-ledger.key"
export R20_LEDGER_ALLOW_INITIALIZE=true
run_phase migrate "$PACKET/04_MIGRATE_TO_CIPHERTEXT.log"
unset R20_LEDGER_ALLOW_INITIALIZE

# Existing exact Delete Work path removes the target; bystander remains.
./node_modules/.bin/tsx scripts/witness/r20-writer-old-snapshot-joined.ts delete \
  2>&1 | tee "$PACKET/05_DELETE_TARGET.log"

snapshot_db "$SNAPSHOTS/CURRENT_DATABASE.dump"
snapshot_vault "$SNAPSHOTS/CURRENT_VAULT.tar.gz"
CURRENT_DB_SHA="$(sha "$SNAPSHOTS/CURRENT_DATABASE.dump")"
CURRENT_VAULT_SHA="$(sha "$SNAPSHOTS/CURRENT_VAULT.tar.gz")"
CURRENT_DATABASE_GENERATION_SHA256="$CURRENT_DB_SHA" \
CURRENT_VAULT_GENERATION_SHA256="$CURRENT_VAULT_SHA" \
run_phase capture-current-authority "$PACKET/06_CAPTURE_EXTERNAL_AUTHORITY.log"
printf '%s\n' "{\"sourceCommit\":\"$WRITER_SOURCE_COMMIT\",\"sourceTree\":\"$WRITER_SOURCE_TREE\",\"generation\":1}" > "$ACTIVE/application-source.json"
printf '%s\n' '{"provider":"local-test","keyId":"fictional-legacy-recovery-k1","generation":1}' > "$ACTIVE/writer-source-key-metadata.json"
printf '%s\n' '{"admin":"fictional-local-admin","generation":1}' > "$ACTIVE/admin-state.json"
tar -C "$ACTIVE" -czf "$SNAPSHOTS/CURRENT_LOCAL_STATE.tar.gz" .

# Coordinated rollback of every local recovery plane. The separate authority is not rolled back.
restore_db "$SNAPSHOTS/OLD_DATABASE.dump"
restore_vault "$SNAPSHOTS/OLD_VAULT.tar.gz"
rm -rf "$ACTIVE"; mkdir -p "$ACTIVE"; chmod 700 "$ACTIVE"
tar -C "$ACTIVE" -xzf "$SNAPSHOTS/OLD_LOCAL_STATE.tar.gz"
unset R20_LEDGER_FILE R20_HIGH_WATER_FILE R20_LEDGER_KEY_FILE
run_phase verify-old-refusal "$PACKET/07_VERIFY_OLD_REFUSAL.log"

# Restore the externally admitted encrypted generation; only the unrelated Work returns.
restore_db "$SNAPSHOTS/CURRENT_DATABASE.dump"
restore_vault "$SNAPSHOTS/CURRENT_VAULT.tar.gz"
rm -rf "$ACTIVE"; mkdir -p "$ACTIVE"; chmod 700 "$ACTIVE"
tar -C "$ACTIVE" -xzf "$SNAPSHOTS/CURRENT_LOCAL_STATE.tar.gz"
export R20_LEDGER_FILE="$ACTIVE/r20-ledger.json"
export R20_HIGH_WATER_FILE="$ACTIVE/r20-high-water.json"
export R20_LEDGER_KEY_FILE="$ACTIVE/r20-ledger.key"
run_phase verify-current "$PACKET/08_VERIFY_CURRENT_RECOVERY.log"

python3 - "$PACKET" "$RUN" "$WRITER_SOURCE_COMMIT" "$WRITER_SOURCE_TREE" \
  "$OLD_DB_SHA" "$OLD_VAULT_SHA" "$CURRENT_DB_SHA" "$CURRENT_VAULT_SHA" <<'PY'
import hashlib,json,pathlib,sys
packet=pathlib.Path(sys.argv[1])
receipt={
 'protocol':'soullab.writer.legacy-source-recovery-pg16.v1',
 'result':'PASS_LEGACY_PLAINTEXT_GENERATION_RETIRED_CURRENT_ENCRYPTED_GENERATION_ADMITTED',
 'run':sys.argv[2],
 'sourceCommit':sys.argv[3],
 'sourceTree':sys.argv[4],
 'oldGeneration':{'databaseSha256':sys.argv[5],'vaultSha256':sys.argv[6],'admission':'RETIRED'},
 'currentGeneration':{'databaseSha256':sys.argv[7],'vaultSha256':sys.argv[8],'admission':'ADMITTED'},
 'coordinatedLocalRollbackTested':['application-source','database','vault','local-ledger','local-high-water','key-metadata','admin-state'],
 'separateAuthorityRolledBack':False,
 'targetReconstructed':False,
 'bystanderRestored':True,
 'realMemberDataUsed':False,
 'productionDataTouched':False,
 'productionCredentialsUsed':False,
 'buildPerformed':False,
 'imageFrozen':False,
 'deploymentPerformed':False,
 'release':'HOLD',
}
(packet/'FINAL_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n')
files=[]
for p in sorted(packet.rglob('*')):
 if p.is_file() and p.name!='SHA256SUMS.txt':
  files.append((hashlib.sha256(p.read_bytes()).hexdigest(),str(p.relative_to(packet))))
(packet/'SHA256SUMS.txt').write_text(''.join(f'{h}  {n}\n' for h,n in files))
print(json.dumps(receipt,indent=2))
print('manifest_sha256='+hashlib.sha256((packet/'SHA256SUMS.txt').read_bytes()).hexdigest())
print('evidence_files='+str(len(files)))
PY
