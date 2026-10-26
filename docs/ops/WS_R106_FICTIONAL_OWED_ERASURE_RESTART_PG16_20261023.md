# R106 — Physical fictional owed-erasure restart, retry and bounded worker permissions

**October 23, 2026 · isolated Mac Studio/T7 · production Writer and real-member HOLD**

## Why R106

R105's real source keeps a committed `vault_erasure_queue` row until `destroyVaultBytes` succeeds and logs only allowlisted errno/counts. The unit tests verified the order but did not prove the physical filesystem + PostgreSQL behavior after an interrupted worker or another process taking over.

R106 adds **only test fixtures**, based directly on accepted R105 source `bf97cea08ba9bb827f9d778c114dc012509f2e13`. It does not change production erasure SQL, fileVault, real media worker, Compose, schedule, member data or R20 keys.

## Fully owned fictional setup

- A freshly created PostgreSQL16.13 container with tmpfs PGDATA, no host bind mounts and only a loopback-published test database `ws_r106`.
- A new current-user-owned `/private/tmp/ws-r106-fictional-<eight random hex>/vault` tree, marked and mode 0700. **No real member original is opened, copied or erased.**
- The unchanged canonical `20260907000001_vault_erasure_queue.sql` migration. A privileged fake fixture producer writes ONE synthetic obligation and a synthetic original; an unrelated sentinel is not queued.
- A separate `ws_r106_eraser` PostgreSQL login with `SELECT`, `DELETE` and narrow column `UPDATE` on the queue only. It has no INSERT, source-table read, schema CREATE, role switching, or superuser rights. No R20/MAIA/private-key environment is passed to its subprocess.
- Test-only `wsBetaR106FictionalPeriodicConsumer.cjs` automatically invokes the existing `scripts/ops/sweep-vault-erasure-queue.ts --quiet` on a bounded timer. It is NOT an installed production scheduler.

## Physical failure and real recovery

1. The synthetic original is intentionally hardlinked to a second test-owned file. The real vault eraser detects `nlink=2` and refuses deletion. The queued database row survives and gains only `UNKNOWN` as a sanitized error code. Neither stdout nor stderr contains the fake private text, filename or vault path.
2. A separate scheduler OS process tries the real CLI and observes that deletion is still owed. The test terminates that scheduler, proves the PostgreSQL row and bytes survive the interruption, and starts a fresh OS process. The member never reissues a delete.
3. The test removes only the extra **synthetic** hardlink (not the owed original). The *restarted fictional timer* eventually calls the real CLI and clears the queue and original file without any further HTTP/author request. A nonqueued sentinel is retained byte-for-byte. A further idle sweep returns success without inventing work.
4. On every failure or success path, the temporary worker, Docker PostgreSQL16 container and owned fake vault are removed. The only persistent artifact is a bounded, metadata-only test receipt on T7.

The first **precommit** attempt yielded a safe HOLD because the existing PostgreSQL connector appended a harmless pool-close diagnostic after the JSON receipt. The driver now selects only its specifically marked fictional JSON report, never treating arbitrary output as evidence. The corrected fresh precommit result at `/Volumes/T7 Shield/ws-beta-r106-erasure-a8f513d1/` passed **40/40 physical checks**; both fake container and test vault were removed. The result is still precommit; repeat on the exact committed source before acceptance.

## Limits and next release gates

This demonstrates **real filesystem + real PostgreSQL + separate short-lived fictional retry scheduling**, not an autonomous production service. The production media worker still owns the erasure loop, and its effective container mounts presently include vault, R20 key and R20 authority. R105's transitional Compose recommendation retains vault access so queued deletion is not stranded while removing unnecessary R20 mounts; that configuration is NOT deployed.

No independent R20 signer, external monotonic deletion highwater, least-privilege real DB credentials/TLS, offsite recovery key, full vault+WAL restore, meaningful consent/outage handling or real member release has been qualified by R106. Do not infer an operational deletion guarantee from a disposable timer test, or remove production vault access until a replacement worker has been accepted and scheduled under a reviewed rollback plan.

**Decision: fictional self-retry mechanism qualification only; production and beta HOLD.**
