# Writer’s Studio Free + Pro — R8 stable grant generation and retry reconciliation

**22 October 2026 · Class A research candidate · draft/source HOLD**

## Founder product contract — unchanged

Free Writer’s Studio must support a meaningful writer-owned practice. Pro adds deeper editorial collaboration. **Every individually founder-approved, account-verified member of the restricted Writer’s Studio beta will receive all currently approved Pro features without charge.** Initial canary is two distinct writers, not a rolling or public cohort. No one loses essential authorship, privacy, self-service deletion, or safe essential export due to subscription state.

This research increment makes no changes to current production access, real user accounts, manuscript custody, public enrollment, payment processors, hosting or irreversible cloud retention.

## The R7 → R8 gap

R7 already made plan, beta access and explicit feedback agree on one per-member entitlement rule, and placed a deliberately unavailable R20 authorization guard ahead of founder/writer mutation HTTP calls.

But its stub supplied only `{ action, memberId, actorId }`. There was no durable grant generation ID at the moment of external approval. The local R2/R3 PostgreSQL table could mint its `grant_id` using a default **after** a putative external seal. That order cannot cryptographically prove the grant used in the member database is the grant that was independently authorized. Retries after a crash might also mint different IDs or charge multiple initial beta seats.

R8 makes those missing requirements executable in a bounded research lane:

- `lib/writersStudio/pilotR20MutationCandidate.ts`: domain-separated Ed25519 mutation receipt verifier and seal-before-local-write coordinator.
- `lib/writersStudio/__tests__/pilotR20MutationCandidate.test.ts`: signed fictional receipt protocol, crash, retry, same-actor/member/idempotency binding, wrong-key/tamper/expiration and two-seat tests.
- `scripts/writers-studio/r8-fixture/pilotR20R8PostgresProof.ts`: **actual PostgreSQL 16 transactions** using the existing review-only `writer_studio_beta_grants` schema and *explicit externally minted* `grant_id`.

### Correct proposed issue/accept/revoke lifecycle

1. **Issue:** server authenticates the founder and the intended account. Independent R20 service atomically chooses a fresh grant UUID and persists a unique immutable `issued` event keyed to the verified member, founder, operation ID, and member-derived subject commitment. Only *after* this seal is independently verified does the member database attempt to insert `(member_id, grant_id, approved_by)` using **that exact grant ID**.
2. **Accept:** signed-in writer verifies control of their own member account, under valid consent. Existing canonical grant ID is resolved server-side. The external service seals `accepted` with that grant generation and writer identity before the local pending → accepted transition.
3. **Revoke:** verified founder seals the irreversible `revoked` event for the current generation first, then marks the local grant revoked. A crash between these operations leaves the local row superficially accepted, but the external authority already refuses all future Pro reads.
4. **Retry:** the external service retains the same `operationId → exact event sequence + grantId + member/actor/action` association. Reissuing the same request obtains a newly short-lived signed acknowledgement for the **same historical event**, not another event, grant or seat. An operation key reused for a different actor/member/action is refused. **A newer terminal revocation supersedes all older issue/accept idempotency entries:** these must NEVER be refreshed with a newly signed acknowledgement after revocation, even if the local grant row was deleted. Repeating the terminal revoke ID itself may be acknowledged idempotently.
5. **Reconcile:** if PostgreSQL failed after the external event persisted, the next authorized retry reuses that sealed generation and conditionally applies the outstanding database transition. A duplicate commit returns `replayed`; conflicting generations and post-revocation admissions refuse.

The R8 coordinator explicitly performs `await external.seal()` → `verify signed exact request and grant` → `await scopedDb.applySealedMutation()`. A DB or external failure propagates; an unsigned or mismatched receipt cannot enter the DB port. These are **review-only injectable test ports**, not network endpoints or a live membership API.

## Test result and precise limits

- **23/23 R8 in-memory/Ed25519 unit tests PASSED** with fixture-issued grant IDs, eight simultaneous duplicate requests, network and DB failure, acceptance/revocation retry, two-seat saturation, replayed operation IDs, other-member denial, signature forgery, mismatched claims, stale challenge and high-water sequence.
- **26/26 R8 actual disposable PostgreSQL16 integration checks PASSED.** The R2/R3 founder-bound migration ran in a fresh empty loopback database. The fixture externally sealed grant A, intentionally failed the DB insert, retried with the **same exact UUID**, and handled **8 concurrent grant-B requests** yielding precisely one SQL row and one consumed second seat. Acceptance and revocation also survived failed local DB writes and were replayed without new external events. Older issue/accept operation IDs were refused after terminal revocation even after the local row was deleted. A third member remained excluded, including after removal of the revoked writer’s local row.
- **159/159 R1–R8 focused Jest tests PASSED across 17 suites**, including all previous Free/Pro, beta-authority, signature, checkpoint, hash-chain, feedback/ownership and R8 mutation/retry cases. Writer flagship TypeScript and targeted ESLint checks PASSED. Sovereignty precommit and final source identity are recorded at review commit time.
- PostgreSQL was bound to `127.0.0.1:55439` with temporary Docker **tmpfs** database storage and stopped after the experiment. All people, tokens and membership data were fictional. No real email, backup content, manuscript, source vault, cloud resource or subscriber account was touched.

## The production controls still missing

**The external service is a memory-only fixture, NOT a durable R20 trust service.** The current production-bound `pilotR20Authority.ts` still refuses both Pro reads and mutation receipts. None of the new R8 coordinator functions are imported by the production application routes.

Before any real runtime integration, the production authority needs independent Class A review and proof of:

- A separately administered immutable/R20 WORM current-head journal supporting terminal revocation, nonreplenishing two-writer issuance and externally persisted idempotency keys that survive service restart and backup restore.
- An authorized signer with distinct key custody, verified latest monotonic epoch, proper key rotation and deletion-safe archival. These cannot rely on the restorable writer DB, user headers or an ordinary bucket `latest.json` alias.
- Transaction privilege separation: production database roles cannot bypass the external verified grant intent through direct calls to old R2/R3 helpers. The R8 SQL model is intentionally a **script fixture**, not an authorization-bearing production stored procedure.
- Idempotency across duplicate HTTP requests, process crashes, concurrent authorization changes, partial R20/DB commits, stale/cross-account sessions, signing-key retirement and offline clients.
- Signed immutable exact-image source lineage, current P4R1 owner-verified Work access, real two-writer authenticated HTTP and Safari/VoiceOver tests, Source vault and member-deletion restore acceptance, independent security review, and explicit founder release authority.

A valid Ed25519 signature and an event sequence **do not themselves prove latestness**. The separate R5 checkpoint and R6 independently anchored immutable chain remain mandatory. R8 adds correct mutation *ordering and identity binding* only.

**Disposition: DRAFT/HOLD. No source merge, production migration, grants, writer invitations, paid subscriptions, new uploads or independent media downloads are authorized by these tests.**
