# Writer’s Studio R42 — Accepted Ordered Source + Encrypted Editorial Reconciliation (HELD)

**October 16, 2026 · Five individually invited beta writers at `soullab.life` · Real admission and production launch HOLD.**

## Source authority and correction

R38 `c4add50ba500bd54c1a7478bdf2e801476ba0dc2` previously merged an *earlier* R36 Source one-shot prototype `4929eacaff592ae8c10d9bafb18c1ddd8d3821ac` with R37 encrypted Apply/Undo. It did **not** contain the later accepted, physically qualified **ordered R36 Source composer** `079fcfb5f48c559701596882af751d7c1bd1b6f1`, whose PostgreSQL session-level orchestration, lock-order corrections and fresh-process recovery matter for avoiding duplicate or misordered Source publication.

R42 is a **new isolated integration branch** from latest clean editorial/UI R40 `ea15a9c3d7f35e384e600dcf9affe729d4dba4eb`. It merges exact accepted ordered Source R36 `079fcfb5f48c559701596882af751d7c1bd1b6f1` with **no file conflict**. Neither parent worktree, pre-existing R38 review/work-in-progress tree, nor the separately edited R41 actual Writer’s Studio selection surface was modified by this work.

R40 brings fictional signed request and section Apply/Undo lineage through R39, plus the manuscript-first **offline WebKit UI fixture**. It does NOT mean this layout or its click-to-author approval is mounted in a real Next.js Writer’s Studio route.

## New R42 Source → first Draft protected bridge

The new held-only `lib/writersStudio/recovery/heldSourceDraftBridgeR42.ts` composes existing exact source and draft components with a conservative metadata-only transition. It is **not** a production writer service.

1. **Verify and publish Source first.** R36 accepts a signed, already-committed R33 pending-Source claim, records prewrite R35 Source intention, writes/authenticates the R32 separately encrypted original bytes/extracted text/private provenance, checks the immutable member-owned PG16 manifest and completes authenticated R34/R35 custody observation. The R33 pending key is **NOT retired**.
2. **Reopen exact Source from ciphertext.** R42 receives text only from the owner-authenticated R32 AES-GCM read. The browser cannot supply replacement prose for first-draft creation. If an explicit, **server-supplied fictional section plan** is provided, its identities must be UUIDs, unique and ordered, and the concatenated section bytes must equal the exact decrypted Source text; no boundary is silently inferred.
3. **Use a distinct Draft Work key.** R42 requires different Source and Draft key IDs and material; both receive independently supplied signed deletion/highwater proofs, all still fictional. R35 saves the initial section-aware draft in a separate authenticated AES-GCM WorkSnapshot in the immutable fsync file vault. Never put original text, chapter sections, filenames or editorial notes in ordinary SQL.
4. **Commit a PRE-DRAFT intention.** Before any R35 Draft ciphertext is written, an immutable R42 metadata-only row records member/Work/Source arrival/claim and exact R32 Source manifest/digest plus a **Work-keyed HMAC** of the precise first-draft section plan. A SHA-256 of common/guessable prose is not stored in SQL. Review-only R42 PG16 schema is kept exclusively in `docs/ops/WS_R42_SOURCE_DRAFT_INTENT_REVIEW_ONLY.sql`, **outside `database/migrations`**.
5. **Create or recover, never launder.** A session-level PostgreSQL advisory lock per fictional member/Work covers the R42 intent, nested R35 draft transaction and final link. It cannot be a real distributed revocation fence. If the Draft already existed *before* any matching Source/Draft intention, R42 refuses instead of creating an after-the-fact provenance statement. Exact prior intent + encrypted first Draft can be reopened and verified after an interrupted link operation without another draft generation or ciphertext write.
6. **Link cipher digests, not words.** The immutable R42 link records only exact matching member/Work/arrival/Source ciphertext manifest/digests and initial encrypted R35 draft version hash. SQL guards validate the R35 observed Source/claim, distinct key IDs, and R35 initial Draft version. Both R42 intent and link reject UPDATE/DELETE.

All R32–R36, R35 protected draft and R42 fixture flags must equal `fictional-only`; `R42_REAL_SOURCE_DRAFT_ENABLED=false` is a compiled stop rule. Exact local PostgreSQL URL and temporary vault path requirements are preserved. No active Next.js API routes invoke R42.

## Physical Mac-local integration and recovery acceptance

`scripts/ops/wsBetaR42SourceDraftPG16.py` creates a randomized **disposable PostgreSQL 16.13** container bound to **127.0.0.1 only**, with no host bind mounts, and a disposable `ws-r35-physical-r42-*/vault`. It applies review-only R32/R33/R35 Source-intent/R35 protected-draft/R42 link schema in order; production schema remains untouched.

- **Phase 1: actual PostgreSQL + file vault, synthetic test content — 11/11 PASS.** Verifies accepted R36 Source publication before R42 intention; new initial R35 encrypted two-section draft with a separate fake Work key; original text/bytes/provenance remain unchanged; exact retry does not produce duplicate ciphertext; interruption after intent or after draft persistence reconciles existing Work; a changed passage, changed section ID or topology refuses; simultaneous identical requests serialize; a prior unlinked legacy Draft cannot be retroactively blessed; foreign member/revoked Work/same-key scope refuse; immutable SQL link denies DELETE. Uses fabricated signer keys and a **synthetic** author gesture, not a witnessed browser consent.
- **Author editing: authenticated encrypted generation chain in the SAME PG16 physical workflow.** The fictional Source-derived draft receives a synthetic R37 passage review: two labeled MAIA/member alternatives, exact section/codepoint selection and idempotent Apply. Generation 2 changes only the chosen passage in section 1; section 2 is byte-identical. An exact repeated Apply replays the same receipt rather than adding another generation. A matching synthetic Undo creates generation 3 restoring exact original text and section identities, including the checkpoint count; repeated Undo is idempotent. Source original bytes and its private provenance are untouched.
- **Phase 2: PostgreSQL forced SIGKILL → restart → new Node.js process, 5/5 PASS.** Recovers exact encrypted original bytes and private filename/extractor, initial draft section IDs/content, second-generation Apply and third-generation Undo history, current revoked-Work denial for both Source and Draft, and foreign-member refusal. The key/signing material comes from a distinct *same-Mac temporary 0600 fictional key directory*, **not** an operational independent KMS or offsite escrow.
- The complete *fictional* PostgreSQL dump and every encrypted vault file were checked in memory for invented Source, private filename, original bytes and editor prose markers; all ciphertext/metadata controls passed. Every disposable Docker container/volume, source vault and fictional key fixture was removed and verified absent.
- **Route/default-off source tests: 3/3 PASS**. Without exact fictional-only opt-in, no Source, SQL or vault call can proceed; no live API route references the R42 bridge.
- **Merged Source/Studio/consent/custody/editorial/UI regression: 64/64 suites, 682/682 PASS.** Includes the accepted R36 source selection and R40 editing/UI source regression plus R42 default-off controls.
- **Scoped strict TypeScript: PASS**. The full `tsconfig.ship.json` check **FAILED (exit 2) with 193 diagnostics**; however all 193 normalized file/error-code/message records are exactly identical, in the same order, to the accepted pre-merge R40 shipping TypeScript baseline. **No added TypeScript diagnostic** in this review, but **NOT an enforced clean production build**. Baseline/candidate normalized joined-errors SHA-256: `d06d9a453a0fd175a29c46b8c9f686f5ec446866068e6d0143db0f431a9abf15`.

Private founder-Mac evidence:
- `/Volumes/T7 Shield/ws-beta-release-r11-build-20261016/R42_SOURCE_DRAFT_UNIFIED_PG16_20261016.json` (earlier first draft acceptance)
- `R42_SOURCE_DRAFT_APPLY_UNDO_PG16_20261016.json` (expanded Apply/Undo + restart acceptance)
- `R42_SOURCE_DRAFT_APPLY_PHASE1_JEST_20261016.log`, `R42_SOURCE_DRAFT_APPLY_COLD_JEST_20261016.log`
- `R42_DEFAULT_OFF_AND_ROUTE_ISOLATION_20261016.log`, `R42_ACCEPTED_SOURCE_EDITORIAL_REGRESSION_20261016.log`, `R42_STRICT_SOURCE_DRAFT_20261016.log`.

## Unwaived release STOP conditions

**No independent key custody:** R26/R29 signer/consent signatures in earlier suites are still synthetic. R42's new first-draft bridge currently accepts structurally asserted server subjects and **does not itself enforce a live R17 member session + current consent**, nor does its local PG advisory lock serialize revocation with an independent key authority. Real provider/operator/admin/region/budget/deletion and approved notice still require founder decisions; no real keys or AWS services were provisioned.

**No cross-domain atomicity:** R32/R35 write multiple immutable ciphertext objects and independent SQL records. R42 verifies committed intention and exact reconciliation in a fictional database, but cannot atomically protect a separate remote KMS, real member withdrawal, concurrent app nodes, old raw keys or a sudden offsite disaster. An encrypted vault file with **no SQL manifest** remains an unresolved orphan, not silent proof of custody and never authorized for arbitrary deletion.

**No active content migration:** Current live `recordArtifactArrival`, plain Source and chapter/draft/revision/editorial/kept text SQL and historical WAL/backups/export remain outside the new bridge. A successful held-only encrypted route does not erase prior copies or change existing production readers. No fallback from unavailable KMS to plaintext must ever be allowed.

**No real browser/MAIA acceptance:** The R40 WebKit Writer's Room is a **separate fictional local UI**, not the active `app/writers-studio/full-redesign/Shell.tsx`. Actual Mac Safari and physical iPhone Safari, current consent, actual MAIA provider, server-minted author passage approval, adjustable columns, original DOCX/PDF parser and streaming, import/Develop/Write/Review/Apply/Undo/reopen/export and Personal Portal have not passed on a frozen source/image. R40's earlier whole-shipping TypeScript had **193 inherited diagnostics**; no enforced clean build can be claimed until checked independently.

**No release authority:** Five invited writers on `soullab.life` remain CLOSED. Production, Caddy, DNS, member data, storage migrations, mail, KMS and billing were untouched. Founder must separately approve exact integrated source/image and independent rollback/recovery/restore before any production admission.

## Next recommended R43 gate

Converge this accepted R42 Source+Draft+cipher-author-Apply branch with the separately in-progress **R41 actual Studio selection/adjustable UI** only after its source/tests are clean and frozen; maintain one selected component authority. Then run **real Next.js authenticated fictional member Chrome/WebKit** end-to-end against a disposable physical database and encrypted vault (not just static preview or mocked editor), with no plaintext fallback or model/provider calls. Separately complete the independently administered KMS/deletion operator choice and historical content migration before any genuine beta cutover.

**Decision: R42 local encrypted original → section Draft → idempotent Apply/Undo and fresh-process recovery PASSED. Operational Writer's Studio member release remains HOLD.**
