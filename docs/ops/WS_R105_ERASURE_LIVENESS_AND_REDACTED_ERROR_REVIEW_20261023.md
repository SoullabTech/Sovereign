# R105 — Erasure liveness before mount confinement; protected-log remediation candidate

**October 23, 2026 | Isolated Class A review source | No deployment | Writer and real-member HOLD**

## Source and operational discovery

R104 confirmed the running media worker's effective mounts include R20 ledger key (readable), R20 authority (writable), original manuscript vault (writable) and media. The R104 offline-only Compose exercise illustrated an end state with **media only**, but must **NOT** be deployed as-is: the media worker currently owns the durable vault-erasure sweeper that completes outstanding member Delete Work obligations.

Read-only examination of the **running container's source** confirms `scripts/run-media-worker.ts` calls `sweepVaultErasureQueue()` on its scheduled loop. It is normally invoked about every 90 seconds. The standalone `scripts/ops/sweep-vault-erasure-queue.ts` exists and is independently runnable, but current source says it lacks a separately qualified autonomous scheduling mechanism. A worker deprived of vault access without replacement can strand owed erasures, undermining the user's deletion guarantee.

The R104 proposed media-only synthetic `!override` is therefore explicitly **unsafe as a standalone operational fix**. R105 adds a different **synthetic transitional** Compose scenario: media worker retains media **and the vault** (2 mounts) while dropping both R20 key and authority mounts. Offline Compose merges verify 4 observed-risk targets → 2 transitional, while the premature 1-mount candidate remains correctly flagged as needing a replacement erasure consumer. This is not a real deploy, privilege proof or functional qualification. The media worker still needs least-privilege SQL and file access review, and a separate external R20 authority remains missing.

## Narrow Class A log-privacy source candidate

The reviewed source has three paths that can print raw filesystem paths or Error objects during failed vault erasures:

- `lib/manuscript/source/eraseManuscript.ts`: logs the owed artifact reference and raw error.
- `scripts/ops/sweep-vault-erasure-queue.ts`: prints `artifact_ref`, attempts, stored error, plus a raw top-level Error.
- `scripts/run-media-worker.ts`: logs an unfiltered error object when the sweep raises.

R105's **isolated candidate only** changes their outward observability to **counts and allowlisted filesystem errno categories**. It does not alter `destroyVaultBytes`, erasure selection, row ownership, queue persistence, author consent, member deletion, reviewer authority or the non-auto-erasure policy. A queue row remains owed on failure; `DELETE FROM vault_erasure_queue` follows successful byte deletion only. Messages, stacks, paths and foreign error codes are redacted. The actual production image was not modified, and no live user log containing a path was opened—this is a reviewed-source privacy finding and patch candidate, not a proved production disclosure.

## Required future acceptance before any real worker change

1. **Preserve autonomous owed erasure:** independently witness a failed byte-delete obligation surviving HTTP completion and being cleared by an autonomous independent queue consumer; verify surviving artifacts are never deleted incorrectly.
2. **Create a dedicated erasure service if moving the sweep:** distinct least-privilege SQL role, narrowly rooted vault access, no MAIA/R20 signer private key, no unreviewed admin fallback, monitored scheduling, resilient failure/restore semantics, continuous negative liveness checks.
3. **Never conflate key mount removal with independent R20 trust:** even after worker R20 mounts are removed, the main app retains the R20 key/authority. Separate R20 signer and monotonic nonrollbackable deletion highwater remain Class A HOLD.
4. **Protect error outputs:** fixture-proof that a private path/prose in `Error.message` or database `last_error` cannot appear in any worker/sweep log, while operators still see bounded counts and canonical error codes.
5. **Deployment owner/Founder GO separate:** source freeze, real Docker effective Compose render, protected existing erasures and media workload tests, independent privacy/recovery review, rollback, and an explicit approved window. No historic archive deletion, key replacement, cron change, upload resumption or beta admission here.

**R105 review status:** staged source/privacy mitigation and synthetic transitional mount configuration; real R20 authority, autonomous erasure migration, worker deployment and wider beta HOLD.
