# R20-R2 — Local model review adjudication (candidate only)

**Date:** 2026-10-12
**Source:** Read-only local `jarvis-qwen3-coder:65k` response saved at `~/JARVIS-handoffs/R20-R2-qwen3-coder-LOCAL-READONLY-REVIEW-20261012.md`.
**Authority:** Automated code-review suggestions only; not an independent human review, merge verdict or production authorization.

## Technical disposition of Qwen's seven observations

| Observation | Disposition | Basis |
|---|---|---|
| Missing `ON DELETE CASCADE` from outbox to deletion manifest | **Rejected as a bug** | The `REFERENCES deletion_manifests(id) ON DELETE RESTRICT` FK is deliberate: deleting the authority manifest must be refused while an outbox obligation exists. Cascading would be dangerous. |
| Living Work missing from outbox event | **Rejected as described** | The outbox references the manifest; both `member_manuscripts` and removed `living_works` tombstones reference that manifest. A surviving Living Work must not be tombstoned. Independent export must prove it includes both tombstone kinds. |
| Time-window semantics insufficient | **Partially valid integration gap** | `signedLedger.mjs` now rejects malformed/reversed windows; `sealedRestore.mjs` validates row timestamps. Exhaustive production predicate coverage, time-zone/range policy and schema-specific SQL remain unproven and release-blocking. |
| `deletedWorkId` is not checked against deletion | **Rejected as described** | The isolated integration calls `removeDeclaration`, which supplies the ID only from `DELETE FROM living_works ... RETURNING id`; malformed UUIDs are refused. An independent database-level linkage regression test remains appropriate. |
| Advisory lock may race | **Not demonstrated** | `pg_advisory_xact_lock` serializes lockers on one key until commit/rollback. Contention/availability under load requires bounded measurement; lock alone is not an external monotonic checkpoint. |
| Archive planner lacks automatic reclassification | **By design** | This component is explicitly read-only and fail-closed. Separate human review follows verified clean continuity; no automatic archive deletion permitted. |
| Advisory transaction lock might remain held after rollback | **Rejected** | PostgreSQL transaction-scoped advisory locks are released at transaction end. |

## Accepted residual risks (already explicit in R20-R2 candidate)

- Incomplete vault/media/derived artifact deletion coverage and offline Cabin deletion lane.
- Independent signer, signed head, and anti-rollback custody not deployed.
- The outbox is restorable; without an independent anchored head, a historic restore could erase the outbox history.
- Original production `restore-governed.sh` remains unchanged and has a proven member-scope fail-open path.
- Candidate `sealedRestore.mjs` is a fabricated-data simulator; no production restore or schema-wide compatibility claim.
- Existing NAS backups have no independently verified deletion watermark; no automatic snapshots/purges authorized.
- No independent human review of a sealed exact commit has yet occurred.

**Disposition:** Keep candidate in isolated branch; request a genuine evidence-backed independent review before any production advancement.

## GPT-OSS local review — disposition

The second GPT-OSS attempt returned a source-only review, saved at
`~/JARVIS-handoffs/R20-R2-gpt-oss-LOCAL-READONLY-REVIEW-20261012.md`.
The first attempt returned no verdict and is not counted.

- Claimed a work tombstone is inserted when `deletedWorkId` is undefined: **false**.
  `identities` adds the `living_works` entry conditionally; the specific
  manuscript-only test exercises this path.
- Claimed a missing Work tombstone for an unlinked manuscript: **false premise**.
  When no Living Work was deleted there is no work identity to tombstone.
- Warned private key PEM could be accepted as a verification public key:
  **defense-in-depth accepted**. Verification now explicitly rejects private-only
  key material; added a negative regression test.
- Claimed `integration_passes` is absent from the allowlist: **false**. It
  appears explicitly in `signedLedger.mjs`; an additional positive test now
  checks it.
- Missing archive digest/coverage is deliberately held as
  `HELD_UNATTRIBUTED`; that is fail-closed behavior, not unsafe acceptance.
- Work-expression ownership query filters through the linked
  `living_works.member_id`; no cross-member Work count is admitted by that
  join. The broader shared-expression rule still requires separate review.
- GPT-OSS cited a `sweepVaultErasureQueue.ts` path outside the six supplied
  review files. That assertion cannot be accepted as file-read evidence.

**Both local model reviews are advisory and contain false positives.**
They do not satisfy the independent human read-trace requirement, nor authorize
production restoration, migration or archival purge.
