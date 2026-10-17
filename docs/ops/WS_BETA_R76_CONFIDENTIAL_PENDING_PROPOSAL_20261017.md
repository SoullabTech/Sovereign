# R76 — Confidential prepublication candidate; joined R74 and R75

**October 17, 2026 · isolated local acceptance · Writer’s Studio production/five-person beta HOLD**

## Consolidated source

R76 was created from the clean R74 provenance-and-author candidate `8f1db8c56943091b7b1a81255c83479c4b05496f` and clean, separately accepted R75 provider-response witness `cb4bf897efe6364c0c83f27ace33146989c41c78`. The source merged automatically, with no conflicts, into the isolated two-parent commit `73549f84c8b3606a066cebae85125ac3d1efd49c`. Both parents and any hosted, protected or production source were left unchanged.

This avoids parallel provenance authorities. R74 guards canonical MAIA author identity and withholds its plaintext `proposal_versions.formulation`. R75 signs the provider/model identity actually *reported* by the server's response adapter and hashes exact content with a separate keyed secret. **R76 supplies the missing sealed prepublication candidate**, while remaining default-off and unable to create an executable editorial proposal.

## R76 custody boundary

The isolated `heldConfidentialCandidateR76.ts` uses the already audited `workEnvelopeV1.ts` AES-256-GCM Work envelope. It encrypts one bounded synthetic suggestion under fresh authenticated-encryption randomness, with AAD covering the exact member ID, manuscript ID, draft generation and injected key ID. The encrypted content classification is the existing `manuscript_revision_offers.proposed_text` field; that classification does not imply an Offer has been published. The record ID is a **reserved future proposal identity**, not a current row in `proposal_versions`.

Inside one actual PostgreSQL transaction, R76 checks current owner, exact addressable draft and section, current generation, separately approved Writer beta notice and the latest consent sequence; refuses a conflicting published version; and inserts ciphertext plus metadata and the R75 signed server-witness response. A future reader checks **current consent and Work state before it even selects the ciphertext**, verifies the ciphertext manifest, decrypts with the separately injected Work key, then verifies the R75 server signature, served provider/model and exact plaintext HMAC. Without each of those facts it refuses.

The receipt explicitly reports `canApply=false`, `canUndo=false`, `releaseApproved=false`. Even a successfully decrypted pending candidate is **not** entered into `proposal_versions`, and no Writer’s Studio route publishes or applies it.

The SQL schema `scripts/ops/fixtures/wsR76PrivateCandidate.sql` is deliberately OUTSIDE `database/migrations`. It has no plaintext-prose column, rejects mismatched author/Work/draft/section/version, and refuses UPDATE/DELETE. The test reads actual repository migrations for `member_manuscripts`, section-addressable drafts, proposal succession and ordered beta consent in a unique disposable PG16 container, reachable only on the local machine at `127.0.0.1`. No keys or proposals are exported to a public route. The Work key, Ed25519 server signer and HMAC secret exist only in synthetic test-process memory.

## Physical acceptance

The initial fictional-only PG16 acceptance completed **12/12 database, privacy and cleanup checks** and **12/12 actual PostgreSQL-backed Jest tests**. An expanded case deliberately bypassed the fixture table's UPDATE trigger *only as a test*, mutated the encrypted JSON and proved the read would refuse it; after the original ciphertext was restored, authenticated decryption succeeded again. The expanded acceptance completed **13/13 Jest tests** and all **13/13 runner checks**, including its additional no-plaintext error-log guard:

- No plaintext pending suggestion in SQL metadata or ciphertext JSON; no plaintext-prose column; no `proposal_versions` publication or manuscript mutation.
- A synthetic valid provider-reported response can be signed and sealed; mismatched models and truncated responses refuse before storage.
- Other member, wrong encryption key, wrong signature, wrong content-HMAC secret, stale consent sequence, changed draft version, conflicting duplicate publication and later member consent revocation all refuse.
- An immutable SQL candidate cannot be updated or deleted; even privileged fixture tampering is detected by the stored cipher digest.
- The actual immutable Source remains untouched. All temporary PostgreSQL resources are removed. No external model calls, production keys, credentials, member data, GitHub changes or deployment occurred.

Precommit evidence: `/Volumes/T7 Shield/ws-beta-r76-confidential-precommit-v2-20261017/`, `/Volumes/T7 Shield/ws-beta-r76-merged-112-suite-regression-precommit.log`, `/Volumes/T7 Shield/ws-beta-r76-real-writer-precommit-20261017/`, and `/Volumes/T7 Shield/ws-beta-r76-shipping-type-diagnostics-precommit.log`. Requalify the exact committed source separately.

The merged R74/R75 Writer custody and provider regression population also passed **112/112 suites, 1,175/1,175 tests**, a strict extension of R75's previous 111 suites/1,162 tests. The inherited R75 physical server-witness test reran on this merged source and passed all **17/17** checks.

The actual Next.js + WebKit + disposable PostgreSQL16 canonical Writer’s Studio also ran on the R76 merge: **74/74 genuine WebKit browser and 60/60 independent SQL/infrastructure checks passed** for original import/retry, Write, Review, History/restore, two member-authored versions, explicit Apply, separate Undo, cross-member denial and later consent revocation. These are independent from the new encrypted-pending service: the latter has no live browser route.

The unsuppressed whole-app TypeScript audit remains a **release HOLD with 113 diagnostics**, exactly the R75 accepted shipping baseline after normalizing worktree prefixes: **0 new** and **0 disappeared**. The new strict scoped R76 TypeScript check passes, but shipping is not green.

The R76 physical PG suite is intentionally SKIPPED outside the explicitly opted-in disposable PG16 runner; an ordinary Jest skip is not counted as acceptance.

## What is not released

**R76 does not make MAIA live.** This test simulates the server's model-response object, proves its recorded provider/model consistency and signs it with fictional server keys, but it does not execute the genuine MAIA provider success branch. The signer is *server-witnessed*, not provider-signed. No real model, real member account, real consent notice, or real writer manuscript is touched.

**R76 is a pending candidate, not a deployable proposal replacement.** It does not migrate production's existing plaintext `proposal_versions.formulation` or older Source, Draft, revision, Keep, WAL, log or backup readers. Converting a sealed candidate into a genuine author-visible, provenance-attributed and confidently confidential proposed formulation requires a separately ratified persistence/ontology boundary: never insert dummy `proposal_versions.formulation` to pretend an encrypted candidate was published. A current, actor-verified consent and authorization must govern every future Apply/Undo within a production-compatible transaction.

The production encryption-at-rest key administrator, complete SQL/WAL/offsite-backup encryption, cold restore, shipping build, real Safari and physical iPhone acceptance, and founder-approved canary member admission remain separate release gates. An independent sovereign per-Work key service may be offered later; ordinary writer beta needs verified conventional security first.

**Disposition:** Isolated confidential pending-candidate custody qualified for further integration only; beta and production HOLD, no activation or deployment.
