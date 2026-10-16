# Writer’s Studio R46 — Durable approval must precede signed encrypted Apply

**October 16, 2026 | Founder Mac Studio | Fixture-only | Five-tester production beta HOLD**

## Purpose and ancestry

R43 qualified a process-local, one-use fictional author gesture that calls the R39 signed editor, but it did not have a durable claim across processes. R44 independently qualified a metadata-only PostgreSQL one-use review/claim, including process restart and two concurrent OS processes, but did not call any writer. Merely merging both histories does not enforce that the encrypted writer respects the durable claim.

R46 combines them **in this order**: verify current author session/consent → reread exact encrypted Work and R37 selected-passage preview → prepare immutable R44 metadata-only token → receive an explicit, closed browser-shaped POST containing only kind and token → durably spend token by R44 SQL CAS → R39 signed R26/R29 consent/Work fence → R37/R35 encrypted Apply. A downstream failure leaves the token SPENT and the result HELD, never automatically retried.

Immutable source parent: c6b994022fe0734c874f6d2843a76a375d975ed3, an accepted combined R45 snapshot including canonical R41 exact selection, ordered R42 Source/Draft, R39 signed editing, R43 process-local gesture and R44 durable approval. R45’s working tree, original parent histories and concurrent work were untouched. Isolated new branch: fix/ws-beta-r46-durable-claim-signed-apply-chatgpt-20261016.

## Implemented, still held

The new module is **lib/writersStudio/recovery/heldDurableSignedApplyR46.ts**. It is compiled default-off and unmounted. It takes a trusted internal fictional selection and R35 Work-read authority; a browser must not supply the original/source, section text, alternative, author identity, encryption key, or a false authorConfirmed flag. The reviewer opens the current immutable R35 encrypted draft, verifies the exact R37 section/order/whole-Work hashes, Unicode codepoint locus and 2–4 alternatives, then asks R44 to HMAC-bind its complete selected revision to the session, consent notice/event and Work.

A random opaque token is the only token the browser may return. The server checks POST, same HTTPS origin, JSON type, a closed two-key request shape, current signed-in synthetic member/consent and correct Work. R44 then validates the independently read encrypted revision and claims its immutable row using one PostgreSQL conditional UPDATE. Only the winning claim invokes R39, whose signed lease/consent and fictional Work fence still govern R35 AES-GCM/fsync ledger writes. A deterministic secret-keyed R46 idempotency key is never the raw approval token. A receipt contains only action/version/checkpoint/replay and releaseApproved=false.

R44's accepted standalone fixture still admits only the exact localhost fict PostgreSQL r44_choice database. R46 adds an **additional**, independently flagged localhost fict r35_draft schema option only if both R45 and R46 synthetic opt-ins and marked disposable ws-r35-physical vault are present. There are no production database/migration/route changes and no real KMS or credential use.

**R46 explicitly does not qualify durable Undo.** R43’s independent process-local Undo test must not be promoted as R44-backed durable Undo. An interrupted R46 claim is spent pending independently governed reconciliation; the source cannot guess whether ciphertext was actually written.

## Accepted local tests

- R46 closed-request, default-off and claim-before-signed writer tests: **13/13 PASS**.
- Original R44 security/default-off plus the R46-only dual-flag database guard: **5/5 PASS**.
- Disposable physical PostgreSQL 16 + R39 session/consent/signature + R37/R35 encrypted actual write: **25/25 application tests PASS** with **13/13 infrastructure/privacy/cleanup checks**. Two simultaneous R46 requests with one token produced exactly one encrypted Apply and one refusal, leaving a single SPENT R44 row and no duplicate ciphertext. When consent was revoked during fictional key issuance, the approval stayed SPENT, but no new protected draft generation was created; later reacceptance did not revive it. Original Source and the untouched section remained unchanged.
- Tested SQL R44 approval metadata contained no raw token, selected/proposed author prose or original fictional section text. Full fictional SQL dump and encrypted vault content scans excluded specified synthetic prose and idempotency markers; temporary Docker, anonymous volume, vault and key fixtures were removed.
- The original R44 independent two-Node-process claim/forced restart physical runner was requalified without changing its source evidence: **15/15 checks PASS** in a newly created separate evidence folder.
- Combined accepted Source/Studio/security/consent/response regression: **69 suites, 729/729 tests PASS**.
- Strict scoped TypeScript: **PASS** (zero diagnostics for the R46 gate and physical tests).

Exact candidate physical evidence root on the Mac Studio: /Volumes/T7 Shield/ws-beta-r46-durable-signed-evidence-20261016

Files under review: lib/writersStudio/recovery/heldDurableSignedApplyR46.ts; lib/writersStudio/recovery/heldDurableAuthorApprovalR44.ts (fixture exception only); lib/writersStudio/recovery/__tests__/heldDurableSignedApplyR46.test.ts; scripts/ops/__tests__/r39ActualSignedSectionPG16.test.ts (R46 conditional tests); scripts/ops/wsBetaR46DurableSignedApplyPG16.ts; tsconfig.r46-durable-signed-apply.json.

## Nonwaivable release stops

1. The real PC3 Writer’s Studio is **not** wired to R46; no genuine author click, browser cookie, accepted consent or physical Mac/iPhone Safari flow on a production-equivalent image is certified. A same-origin POST is not proof of an actual human.
2. R46 requires the server caller to reconstruct the exact protected editorial alternative and section. R44 intentionally holds only secret-keyed HMAC metadata, not the private proposal. Reopening after a crash needs a separately owned **encrypted proposal and choice source**, or it must refuse. One-use consumption itself survives PostgreSQL restarts, but a remote edit after a lost process is not automatically recoverable.
3. R44 approval CLAIM and R39 signed encrypted EDIT remain separate commits. A network outage or crash between them yields SPENT/HOLD and requires explicit reconciliation of approval, encrypted R35 version and actual Work receipt. No durable distributed undo, source-to-proposal recovery or multi-node KMS/Work revocation coordinator is implemented.
4. Operational external KMS and independent signer/key administration, monotonic deletion highwater, remotely fenced revocation, original/DB/vault/key offsite restore, orphan reconciliation and historical plaintext migration remain unqualified. Old copied raw keys and backups can still decrypt old ciphertext; no claim of irreversible erasure.
5. Live Source/drafts/revisions/proposals/keeps, provider logs, WAL, exports/backup and old reader images are still capable of plaintext exposure. Never fall back to plaintext on external-key outage.
6. Actual DOCX/PDF/TXT/MD import fidelity, MAIA Develop/Write/Review, semantic zoom, adjustable columns, Undo, Save a Copy/Listen, genuine Safari, first-writer notice, Proton non-Resend invites and exact-image rollback all need independent review. The whole app previously had 193 inherited TypeScript diagnostics; an enforced production build is NOT established by scoped checks.

## Next

R47 should implement a separately approved durable Undo authorization tied to encrypted versioned last-Apply provenance, alongside an encrypted private editorial-choice source for recovery after process restart. Independently qualify real member session/consent and KMS/restore before any production beta cutover. A founder-specific exact-source/image decision is required for deployment and member admission.

**Disposition: fictional durable-SQL-claim-before-signed-Apply PASS; five-tester release HOLD; no push, live route, member enrollment, production database, AWS provisioning or actual author writes.**
