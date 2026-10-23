# R109 — worker vault-mount identity is an unadmitted Class A STOP

DRAFT / TEST ONLY / DO NOT MERGE, DEPLOY OR CHANGE THE ACTUAL VAULT.

## Exact unchanged sources on default clean-main-no-secrets at review creation
- `lib/storage/fileVault.ts` Git blob `e2471c6a865f12103a9ca4497647fa636295cb52`; `destroyVaultBytes()` treats ENOENT as success.
- `lib/manuscript/source/eraseManuscript.ts` Git blob `a480ab1fd50085e6d926cb535b6e81102c431150`; `sweepVaultErasureQueue()` deletes durable row after normal return.
- `scripts/run-media-worker.ts` Git blob `46935ab7ec048d85a30396d904042f78493f62ed`; worker periodically calls sweep.
- `docker-compose.production.yml` Git blob `30e0d9f50e952535aeff86ede389c2343a2e2b49`; main maia mounts `vault_data:/app/data/vault`, media-worker only `media_data:/app/data/media`.

## Two independent negative/positive tracks
1. The real `destroyVaultBytes` and `sweepVaultErasureQueue` against **real disposable filesystem directories** and an injected fictional queue: worker wrong-root and non-mounted-root assertions are **EXPECTED RED** (current source deletes the queue record while the authoritative original file survives); correctly shared root, traversal refusal, and idempotent already-absent path are GREEN. The queue mock does not prove SQL concurrency, rollback or deployed worker behavior.
2. The actual, byte-pinned `fileVault.ts` executes inside three disposable `node:22-alpine` **network-none** containers: A writes fictional bytes to a unique GitHub CI Docker named volume, B with no named vault mount gets success on the same relative path, C with the original named volume verifies the file still exists and then deliberately deletes the test file. Strict cleanup deletes the newly created QA Docker volume. It does NOT run the actual media worker, real PostgreSQL, any live mount or member Source.

## Nonwaivable review and fix contract
- This proves a source and path-namespace false-completion vulnerability under synthetic conditions; **not** a live production erasure incident or evidence of any erased member records.
- A missing/wrong/image-local mount must never clear an erasure queue row. Add independently verified, fail-closed **mount-identity and origin** proof with expected named volume, non-forgeable instance, secure permissions, no unchecked symlink/hardlink, and approved effective container mount namespace before any filesystem operation.
- Separate the eraser from broad media processing under least privilege and independent R20 current erasure/negative revocation trust; merely adding `vault_data` to an unrestricted worker is insufficient.
- In one approved, signed, production-equivalent **disposable PG16+two-container** test, require persistence of original file and queued obligation under missing/wrong mount, no false success on restart and file removal/queue clearance only under real correct vault; preserve unrelated file.
- R108 actual worker's 21/21 correctly mounted fictitious test still stands independently. Those results cannot override this R109 mount requirement.
- Privileged deployed-container mount inspection, Class A reviewer, Owner, independent recoverable rollback, Source original HTTP423/noautoexpiry, R20 old-image/SQL/vault/backup antiresurrection, and Founder production/beta GO all remain HOLD.

No product code/migration/worker/Compose modification in this PR. Original source and historical pins untouched. The branch's expected RED negative assertions are an unwaived release STOP.
