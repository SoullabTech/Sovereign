#!/usr/bin/env bash
# R109 disposable two-container named-volume mismatch demonstration.
# Review/test only, on GitHub-hosted runner. NO production Docker context.
set -euo pipefail
: "${GITHUB_ACTIONS:?CI-only run required}"
: "${GITHUB_RUN_ID:?GitHub run identity required}"
cd "$(dirname "$0")/../.."
expect_vault='e2471c6a865f12103a9ca4497647fa636295cb52'
expect_compose='30e0d9f50e952535aeff86ede389c2343a2e2b49'
test "$(git hash-object lib/storage/fileVault.ts)" = "$expect_vault"
test "$(git hash-object docker-compose.production.yml)" = "$expect_compose"
vol="r109_fictional_${GITHUB_RUN_ID}_${GITHUB_RUN_ATTEMPT:-1}"
image='node:22-alpine'
src="$PWD/lib/storage/fileVault.ts"
docker volume create "$vol" >/dev/null
cleanup() { docker volume rm -f "$vol" >/dev/null 2>&1 || :; }
trap cleanup EXIT

# Container A has the named vault and writes a COMPLETELY FICTIONAL blob.
docker run --rm --network none \
  --mount "type=volume,source=$vol,target=/app/data/vault" \
  --mount "type=bind,source=$src,target=/qa/fileVault.ts,readonly" \
  "$image" node --experimental-strip-types --input-type=module -e '
    const v=await import("file:///qa/fileVault.ts");
    const p=await v.writeVaultBytes("fictional","r109-review","bin",
      Buffer.from("FICTIONAL_R109_DISPOSABLE_ONLY"));
    if(p!=="fictional/r109-review.bin") process.exit(31);
  '

# Container B uses image-local /app/data/vault WITHOUT the named volume.
# The ORIGINAL actual TypeScript function returns normally (false success).
docker run --rm --network none \
  --mount "type=bind,source=$src,target=/qa/fileVault.ts,readonly" \
  "$image" sh -ceu '
    mkdir -p /app/data/vault
    node --experimental-strip-types --input-type=module -e '\''
      const v=await import("file:///qa/fileVault.ts");
      await v.destroyVaultBytes("fictional/r109-review.bin");
      console.log("FICTIONAL_WORKER_WRONG_ROOT_RETURNED_SUCCESS");
    '\''
  '

# Container C remounts the same named volume, proving the fictional original
# survived the worker's ENOENT-success and only then lawfully erases it.
docker run --rm --network none \
  --mount "type=volume,source=$vol,target=/app/data/vault" \
  --mount "type=bind,source=$src,target=/qa/fileVault.ts,readonly" \
  "$image" node --experimental-strip-types --input-type=module -e '
    const v=await import("file:///qa/fileVault.ts");
    const p="fictional/r109-review.bin";
    const bytes=await v.readVaultBytes(p);
    if(bytes.toString()!=="FICTIONAL_R109_DISPOSABLE_ONLY") process.exit(32);
    console.log("FICTIONAL_ORIGINAL_STILL_PRESENT_AFTER_WRONG_ROOT");
    await v.destroyVaultBytes(p);
    try { await v.readVaultBytes(p); process.exit(33); }
    catch(e){ if(e.code!=="ENOENT") process.exit(34); }
    console.log("FICTIONAL_CORRECT_MOUNT_REMOVES_ORIGINAL");
  '
