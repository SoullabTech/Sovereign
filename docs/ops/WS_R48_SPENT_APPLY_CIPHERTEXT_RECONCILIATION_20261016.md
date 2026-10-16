# Writer’s Studio R48 — Spent Apply recovery from encrypted evidence

**October 16, 2026 | Mac Studio | HELD fictional-only qualification | Five-tester production beta HOLD**

## Governing distinction

A durable author approval and a completed editorial edit are different facts.

R46 stores an author’s one-use approval as SPENT in R44 PostgreSQL **before** asking R39/R37/R35 to commit an encrypted manuscript revision. If an application crashes, a Work-key issuer refuses, or the separate SQL/vault write is interrupted, SPENT remains true. This correctly prevents duplicate authorization, but it does not prove the words were saved.

R48 adds a **read-only fail-closed evidence classifier**. Only a token-specific R35 immutable idempotency receipt, an authenticated encrypted revision and matching encrypted R37 provenance can justify a fictional positive observation. Every failed or incomplete check leaves the attempt HELD; retryAuthorized is ALWAYS false. No recovery code retries, rewrites, restores, deletes ciphertext or retires keys.

R47 durable Undo is already under independent development in a different uncommitted worktree, which R48 did not touch. This separate lane is solely about reconciliation of interrupted R46 Apply, not Undo.

## Frozen ancestry and held services

- Committed R46 parent: 796812141da1a3cc6bcb068c5d51c5891ce56b6d.
- Isolated branch: fix/ws-beta-r48-spent-apply-evidence-chatgpt-20261016.
- Working directory: /Volumes/T7 Shield/ws-beta-r48-spent-apply-evidence-chatgpt-20261016.
- Read-only classifier: lib/writersStudio/recovery/heldSpentApplyEvidenceR48.ts.
- New focused tests: lib/writersStudio/recovery/__tests__/heldSpentApplyEvidenceR48.test.ts.
- Genuine PG16 + encrypted storage acceptance: scripts/ops/wsBetaR48SpentApplyPG16.ts.
- Fresh Node-process evidence reader: scripts/ops/wsBetaR48ColdSpentApply.ts.
- Conditional R48 physical test additions only: scripts/ops/__tests__/r39ActualSignedSectionPG16.test.ts.
- Strict scope: tsconfig.r48-spent-apply.json.
- R48_REAL_SPENT_APPLY_RECOVERY_ENABLED=false; no Next.js API route imports this service. No live schema, production member, source, provider, email, billing or KMS operation.

## What a verified fictional custodian can prove

A protected recovery operator must separately hold (1) the original 256-bit approval token, (2) the R46 approval issuer root, and (3) the exact R35 Work key plus a signed deletion/highwater witness. Ordinary R44/R35 SQL metadata cannot supply or regenerate these secrets. Their possession and structural fixture authority do **not** qualify real administrator identity or consent.

R48 independently checks:

1. A single member/Work R44 approval located by the keyed token HMAC, with immutable SPENT status, original section and chosen alternative UUIDs, generation, approved notice, session binding and consent-event metadata.
2. R46’s exact token-derived idempotency key, separately HMACed under the R35 Work key, identifying one specific immutable R35 Save receipt. Expected saved generation is approved generation plus one.
3. Exact R35 version metadata, ciphertext key identifier and chain; both prior and edited versions must reopen under authentic AES-GCM with R35’s predecessor ciphertext digest validation.
4. The exact encrypted R37 Apply note: section UUID, alternative UUID, previous generation, previous whole-Work SHA and resulting selected-section SHA; all other section identities and text remain byte-identical.
5. The independently recomputed R35 Work-keyed **save-payload HMAC** of the authenticated edited sections, checkpoint flag and encrypted note, compared with the immutable SQL receipt by constant-time digest comparison.

The verified outcome is metadata-only: FICTIONAL_CIPHERTEXT_APPLY_CONFIRMED, the saved generation/ciphertext digest, previous Draft revision verified, unchanged section UUIDs, releaseApproved=false and retryAuthorized=false. This does **not** independently reverify R32 immutable original Source; it verifies the prior Draft and exact Apply.

Refusal/hold results are HELD_UNVERIFIED_REQUEST, HELD_NO_SPENT_APPROVAL, HELD_SPENT_WITHOUT_MATCHING_RECEIPT and HELD_RECEIPT_OR_CIPHERTEXT_INCONSISTENT. Missing SQL receipt is **not proof of no write**, since orphan ciphertext or in-flight publication is still possible. Revoked keys, SQL/network failure, wrong member, wrong token, altered note, missing ciphertext and incorrect fingerprints also fail closed.

## Actual physical fictional acceptance

R48’s isolated runner starts a randomized disposable PostgreSQL 16 database bound only to Mac loopback, review-only R44 SQL and an actual R35 AES-GCM/fsync file-vault. PostgreSQL lives on an anonymous Docker volume so a **controlled restart** preserves fictional data. There are no production host mounts. After testing, Docker removal includes the anonymous volume.

- **12/12** focused read-only unit tests PASS; strict scoped TypeScript clean.
- **26/26** R39/R43/R46/R48 physical application tests PASS. A real fictional R46 encrypted Apply creates Work 12 generation 2; another spent R46 approval for Work 13 encounters consent withdrawal and produces no additional revision.
- **21/21** infrastructure/privacy/restart/cleanup checks PASS, including HMAC-only approval metadata, full fictional SQL dump and encrypted vault marker scans. No invented Source/proposed passages, original tokens or key bytes appear in tested ordinary SQL.
- PostgreSQL was restarted, then a **fresh Node.js process** independently reclassified Work 12 as CONFIRMED and Work 13 as HELD_SPENT_WITHOUT_MATCHING_RECEIPT. No additional draft version was written by recovery.
- The temporary fictional Work keys and raw approval tokens were placed in a mode-0600 file in the disposable marked fixture directory ONLY, without private prose or private signing keys, then removed with the test vault. This is not independent operational KMS or offsite escrow.
- The expanded accepted Studio/security/consent/custody regression population passed **70/70 suites, 741/741 tests**.

Precommit private Mac evidence: /Volumes/T7 Shield/ws-beta-r48-spent-apply-evidence-20261016/R48_SPENT_APPLY_RECOVERY_ACTUAL_PG16_20261016.json. Requalify the exact final committed revision and save a separate receipt before calling the frozen candidate accepted.

## Unwaived beta STOP

- **Operator authority:** the custodian’s structural fixture claim is not a real independently administered role, current member consent, external signer authority or permission to decrypt writing after withdrawal. The old Work key alone can still decrypt old ciphertext offline.
- **Recoverable private choices:** without the original token, issuer root and exact independent Work key, the metadata-only approval SQL cannot reconstruct the written request after loss. A separately encrypted, consent-controlled private proposal/choice source is still required.
- **External revocation and atomicity:** R44 approval and R35 Save are separate cross-domain commits, not remotely atomic with independently issued Work keys or a global deletion fence. Orphan ciphertext and spent-but-unproven attempts require an operator reconciliation process, never an automatic retry.
- **Durable Undo:** separately developing R47 remains unmerged and needs its own privacy, provenance and failure/restart acceptance. A changed sentence is not an Undo proof.
- **Historical manuscript content:** live Source, ordinary SQL drafts, editorial proposals and keeps, WAL, legacy backups/logs/readers and rollback images remain plaintext-capable and outside this held-only lane. Never fall back to plaintext when independent KMS is unavailable.
- **Actual member-facing experience:** real session cookie, consent, MAIA and author choice in canonical Writer’s Studio; DOCX/PDF/TXT/MD fidelity; three adjustable columns, semantic zoom, full Develop/Write/Review, Save a Copy and Listen; authenticated Mac Safari and physical iPhone; current notice and Proton-only invitation flow all remain unqualified on one frozen production-equivalent image.
- **Full production build and release:** R46’s whole-shipping TypeScript had 193 inherited diagnostics. Scoped clean compilation is not a production build; independent Class A custody/security review, exact-image deployment, offsite restore/rollback and founder admission authorization remain necessary.

**Decision: R48 read-only spent-approval evidence recovery passes fictional local qualification. Real five-tester Soullab.life launch remains HOLD. No push, deployment, real-member writing, KMS provision, production migration or invitation occurred.**
