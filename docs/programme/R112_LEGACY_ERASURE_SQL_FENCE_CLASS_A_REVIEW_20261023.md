# R112 — legacy erasure SQL permission fence / exact-source integration review

**CLASS A / DRAFT / HOLD — synthetic execution and design only, not a canonical migration or a deployable patch.**

## Why this narrowly scoped proof

R111 [draft #1973](https://github.com/SoullabTech/Sovereign/pull/1973) executed the actual unmodified `run-media-worker.ts` against real disposable PostgreSQL16 and a fictional Docker named vault. Without that mount, its `destroyVaultBytes()` returned on `ENOENT` and its original `sweepVaultErasureQueue()` deleted the actual queue row even though the original fictional file survived. A code-only mount identity guard cannot protect an **older worker process with its old SQL DELETE credential**.

This R112 review isolates one necessary, NOT sufficient guard: a distinct **legacy role** retains SELECT/UPDATE access for its existing poll path but has NO DELETE privilege on `vault_erasure_queue`. The actual unmodified old worker should be unable to discharge a durable erasure obligation, even if its application code sees a missing image-local vault.

## Exact executable witness

GitHub-hosted Linux runner ONLY, with no remote/nondefault Docker context, no production secrets or mounts. Exactly pin original published Git blob IDs:
- `lib/storage/fileVault.ts` `e2471c6a865f12103a9ca4497647fa636295cb52`
- `lib/manuscript/source/eraseManuscript.ts` `a480ab1fd50085e6d926cb535b6e81102c431150`
- `scripts/run-media-worker.ts` `46935ab7ec048d85a30396d904042f78493f62ed`
- `docker-compose.production.yml` `30e0d9f50e952535aeff86ede389c2343a2e2b49`

Fixture uses a NEW isolated Postgres 16 instance, original media_jobs and `vault_erasure_queue` migrations, an **internal Docker network with no exposed host port**, and a new test-only Docker volume with exactly two fictional files. It creates a fictional, no-password `legacy_worker` PG login scoped to the isolated network; SELECT/UPDATE permission on `media_jobs` and erasure queue only; **DELETE explicitly refused** by PG. No production role/grant/migration exists in this PR.

1. Spawn unmodified worker without the QA vault mounted, pointing to `legacy_worker`. Require actual failed erasure/discharge attempt (`attempts >= 1`), SQL row remains present, and both original fictional file and bystander remain intact.
2. Destroy that temporary worker container, spawn a separate worker process with the same fictional DB credentials, and require attempts advance (`attempts >= 2`) but queue and physical bytes still remain. This proves legacy worker process restart does not bypass **this limited SQL grant fence**.
3. Verify worker logs omit fictional file contents. Clean every generated container, network and QA volume.

**A passing fixture is not erasure completion**: it means old worker cannot report SQL queue erasure as successful under the artificially revoked permission. It is not proof old production processes were fenced, nor of a functioning legitimate dedicated eraser.

## Corrective architectural decision for independent Class A reviewer

Propose, subject to sole Writer source owner / DB SRE review:

1. **Retire implicit erasure from broad callers.** Member DELETE, Work/visual endpoint, CLI and ordinary media worker enqueue or inspect obligations, but cannot directly unlink protected vault bytes or clear persistent erasure state. This must preserve member-visible `custody_incomplete` and Source original HTTP423. No API may claim a particular artifact completed based on the global queue count.
2. **Dedicated eraser trust boundary.** One least-privilege, paused-at-start actor owns actual scoped filesystem operations. It must validate the *effective* live mount namespace against an independently pinned vault identity and a separate trusted attestation; refuse absent, substituted, image-local, symlink/TOCTOU or foreign-object ambiguity. Host `mountinfo` or Compose text alone cannot attest identity. A production-grade race-resistant descriptor-relative filesystem facility, or equivalent independently accepted protection, is required before GO. Never blindly mount member vault to the broad media worker.
3. **SQL completion authority.** Only a new constrained actor identity can invoke an exact-object completion transaction/procedure bound to an immutable obligation and independently witnessed deletion outcome. Create a durable, privacy-preserving **per-artifact receipt**, distinct from the existing queue (which is explicitly not an audit log). Revoke legacy DELETE and old shared/owner credentials *at the actual deployment boundary*. A newly restricted test role is **not** proof existing production superuser or old image credentials cannot bypass.
4. **Key and restore isolation.** Vault eraser access must not confer R20 signer/ledger private key, SQL backup/restoration privileges, or the ability to revive old encrypted snapshots. An authenticated high-water/antirollback barrier remains separate and fail closed; historical erased content must not reappear from old app+DB+vault+key backups.
5. **Source custody.** The f70 Writer owner checkout has 83 tracked dirty + 411 untracked paths; no protected source admission. This draft is **test-only**, on published source lineage, not an alternate compiled Writer beta or release.

## Required acceptance before any actual patch/deploy

- Check actual current production worker mounts and historical real queue consumption privately; current queue 0 cannot prove past erasure.
- Real PG16 negative: **old image with its ACTUAL formerly issued credentials** cannot DELETE queue, update tombstones or egress vault bytes. An old worker given volume read/write could still unlink before denied SQL, so this narrow test does not close that path.
- New actor: file/queue both survive wrong root; correct attested root yields only specifically requested physical deletion and an independently bound completion receipt. Crash windows, concurrent sweeps, 2 unrelated members, symlinks/hardlinks/root swaps, corrupt receipt, revoked request, old SQL restore and signer outage must fail closed.
- Independently attributable Class A reviewer, named production SRE, sole source owner and founder must approve the exact source/image/migration/custody plan. **No production action is authorized by a passing CI job.**

**Status: R111 vulnerable behavior reproduced, R112 SQL-fence synthetic witness to be independently verified. Class A, R20, Writer beta and production remain HOLD.**
