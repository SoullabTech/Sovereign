# R111 — actual media worker + PostgreSQL 16 + named vault negative review

**Class A / DRAFT / HOLD — evidence only. This must not be merged or deployed.**

## Source boundaries

Test runner `scripts/qualification/r111-real-media-worker-pg16-vault-negative.review.sh` calls the real, unmodified `scripts/run-media-worker.ts` executable inside a disposable `node:22-bookworm` container. A genuine disposable `postgres:16-alpine` instance holds `vault_erasure_queue` from the original `database/migrations/20260907000001_vault_erasure_queue.sql`, plus `media_jobs` and its dependencies from the original `20260407100001_media_studio_build_a.sql`. The worker invokes the original `sweepVaultErasureQueue` → `destroyVaultBytes` code.

The script **SHA-pins** all of: `fileVault.ts` blob `e2471c6a865f12103a9ca4497647fa636295cb52`; `eraseManuscript.ts` `a480ab1fd50085e6d926cb535b6e81102c431150`; `run-media-worker.ts` `46935ab7ec048d85a30396d904042f78493f62ed`; Compose `30e0d9f50e952535aeff86ede389c2343a2e2b49`. Refuse drift rather than silently exercising replacement source.

The ephemeral Postgres has **no published port** and uses a private Docker `--internal` network. The two fictional vault files are seeded only in a new, run-specific Docker named volume. Worker has a read-only bind of checked-out source, no named production volume, no host secret mount, no production `.env`, no external model service, no R20 key and no elevated Linux capabilities. The test refuses non-GitHub-hosted runners, non-Linux, nondefault Docker context or remote Docker host. Trap removes the test-only worker/database containers, named volume and network, even on a failed assertion.

## Expected evidence

1. **Wrong mount — defect witness:** the unmodified media-worker runs normally against *real* PG16. Its erasure consumer receives an obligation while the original fictional file is present in the independent named vault. It has NO mount of that vault. Current source may report `destroyed 1`, DELETE the actual PG16 queue row, and leave the named-volume file physically present: **expected unsafe**. This is evidence of a defective implementation; do not interpret the CI job's expected-unsafe success as security PASS.
2. **Correct mount — positive control:** reinsert the same fictional obligation, restart the actual worker with the one temporary named volume mounted and prove that the original is absent after queue discharge, while the unrelated fictional file remains byte-for-byte untouched.
3. **Log privacy:** worker logs may describe bounded erasure counts / R20 availability errors but must not include fictional test contents. No claim about all production error paths.

## Still unqualified

- Not the actual production image / Compose, production host, media workload, production DB, original member Source, live file vault, backup or historical erasure queue.
- **No independent mount identity** inside the worker namespace; the correctly mounted case still relies on an intentionally fixed test configuration.
- **No authoritative R20 ledger seal or key**, current at-use revocation, old-image grant fencing or antirollback. The R20 key path intentionally remains unavailable to the worker; it cannot be used to make a completed-custody claim.
- **No actual multipart Source API / visual/Work HTTP completion semantics**, no overlapping sweepers/concurrency, symlink/hardlink TOCTOU, crash prefixes or proven member-by-member reconstruction barrier.
- Full canonical 494-path protected Writer source remains 0 admitted; this test-only branch is not an alternative Writer build or source owner.

## Disposition

Do not remove R109's two intentionally failing security tests in draft PR #1971, do not merely grant a broad media-worker access to the actual named vault, and do not clear #1970 or gate #1938.

The next approved corrective candidate must enforce fail-closed and independently attested vault identity **within every erasure consumer**, bind per-artifact durable completion evidence, fence old app/SQL permissions, separate limited erasure actor from media and R20 signing, and pass the original wrong-mount negatives in their safe expectations, plus independent human Class A/SRE and founder review.

**No production/live mutations or source-owner approvals are implied by this review-only GitHub runner.**
