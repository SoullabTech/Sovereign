# Writer's Studio R37 — Section-preserving encrypted passage Apply/Undo and idempotency

**October 16, 2026 · Local fictional-only engineering candidate · Real-member release HOLD**

## Source ancestry and division of responsibility

- R36 codepoint-positioned 2–4 MAIA/member alternative passage preview and synthetic single-section encrypted Apply: `be1eb8a4653ef76ce4f45474b3a353484454758e`.
- R35 encrypted section-aware Draft HTTP/idempotency/atomic ciphertext-manifest ledger: `7385256e4a15bca0a89eb41f5d238ac8e2d2bd50` (first functional R35 source commit `66f45961c96c34d86661f1cd5e040988544c62f5`).
- New isolated branch `fix/ws-beta-r37-section-passage-ledger-20261016` merges both source lineages without conflicts. Original R35, R36 and in-progress WebKit branches remain intact.
- No active Next.js author-edit or beta route imports this service. No actual user click, KMS, member data, production DB, billing, SMTP, DNS or deployment is used.

## Actual change

`lib/writersStudio/recovery/heldSectionApplyR37.ts` joins **R36's pure passage review** to **R35's encrypted, multi-section, section-identity-preserving, durable idempotent Draft ledger**. This is deliberately safer than using the R36 single-section-only `applyReviewedPassageR36` to replace an entire real multi-section Work.

- Its preview validates an existing R35 decrypted, author-owned **section-addressable Work** with at least two frozen UUID sections, unchanged server order/IDs and exact concatenation. It checks the Work's whole-text SHA256 and revision generation, each target section's exact SHA256 and its Unicode **codepoint** selection range, selected exact author words, and the chosen version among **2–4 distinct** MAIA/member-labeled alternatives. A regression caught missing validation of the Work's entire supplied section array; that failure was repaired before acceptance.
- It returns an author-visible structural preview with original/proposed words, deterministic changed-word diff, exact replacement in only the selected section and untouched section IDs. Neither a private key nor SQL is used to preview.
- Only an explicit **fictional** gesture matching Work, section, selected passage hash, proposed alternative, author section SHA, draft revision and bounded idempotency key can continue. This object is caller-supplied test data, **not cryptographic evidence of a real click or consent**.
- A newly reopened R35 encrypted historical Work anchors the exact selection. The bridge reconstructs *all* original section IDs/order and all untouched section bytes, replacing only the target's contents. It writes through R35's own Work-owner-lock, PostgreSQL head/generation CAS, R34 exact Draft route validation, AES-256-GCM immutable file-vault, ciphertext-only manifests, and **HMAC-scoped idempotency receipt committed in the same SQL transaction**. It does not duplicate entire author prose into normal SQL.
- An exact repeated Apply is a **structural replay** (no extra ciphertext generation), including after the head advances. A changed version with a previously used idempotency key and a stale new key both refuse.
- Each applied R37 action leaves a *versioned, encrypted private note* containing section UUID, chosen alternative ID, prior generation, prior whole-Work SHA and revised section SHA; it stores no bare passage or author text in SQL. Synthetic Undo validates that note, exact previous version and unchanged frozen section partition, then uses R35's encrypted **restore** as a newly appended version/checkpoint. Repeated Undo replays its receipt rather than restoring a second time; attempting another unrelated Undo refuses.

All real-member authoring flags still compile to **false**. R37 requires an exact `R37_SECTION_PASSAGE_FIXTURE=fictional-only`, R36's synthetic preview gate, and R35's additional `fictional-only` plus disposable local PG16/vault checks. No live authoring or API path was added. Only one strictly controlled test function can produce an R35 draft edit.

## Verification

- Focused R37 state/section/idempotency/Undo unit tests: **10/10 PASS** (mocked R35 persistence, actual R36 pure preview).
- Combined selected Studio/auth/invite/consent/Source/editorial/custody/recovery/draft-route tests: **59 suites / 636 tests PASS**.
- Strict scoped TypeScript `tsconfig.r35-protected-draft.json`, `tsconfig.r36-passage-bridge.json`, `tsconfig.r37-section-apply.json` and `tsconfig.r37-physical.json`: **all PASS**.
- Dedicated actual disposable **PostgreSQL 16 + fsync/readback AES-GCM file vault** through `scripts/ops/wsBetaR37PG16SectionPassage.ts`: **49 checks PASS**, **19 refusal categories**, including inherited R35 owner/key/revocation/ciphertext/idempotency/section partitions and new R37 selected passage, choice-forgery, stale edits, cross-member denial, exact second section preservation, apply-retry and undo-retry. All synthetic user text and idempotency tokens absent from entire PG dump. R35's staged encrypted orphan on forced SQL receipt failure remains a visible fixture-only HOLD; no destructive cleanup of real data.
- Fixture uses synthetic Ed25519 signer in process memory and a synthetic structural subject; the PostgreSQL Work row lock is **not** an independently governed KMS/Work revocation coordinator. The HTTP browser and real MAIA generation were **not** exercised in the physical runner.
- Original R11 classified-field registry and existing client/Next.js production routes remain unchanged.

## Remaining hard release gates

1. **Actual browser/author intent:** a real member's UI selection and chosen alternative must be bound to an independently minted session, current consent event and a server-witnessed, single-use Apply/Undo approval. The R37 gesture supplied by a fixture must not become a public trust API. The independent R34 WebKit-research worktree remained in progress and unmodified.
2. **True external custody and concurrent revocation:** real KMS/key/custodian with separate accountable administrators, current nonrollbackable external deletion epoch, nonce/replay ledger, Work-scoped fence that serializes withdrawal and remote unwrap with the final PG+vault commit, and governed orphan reconciliation. Prior raw key copies can still decrypt older ciphertext; no irreversible deletion is promised.
3. **Legacy writing migration:** existing manuscript Source, drafts, sections, revisions, kept quotes, proposed alternatives, Apply/Undo authorizations, derived JSON, SQL/WAL/exports, old backups and model retention are not migrated by this isolated path. Earlier source worklist found at least 51 legacy SQL writer candidates across 19 files. Never silently fall back to ordinary SQL when custody fails.
4. **Functional Studio/Portal:** real MAC and physical iPhone Safari/Chrome passage selection, diff, Develop/Write/Review with 2–4 MAIA options, precise Apply/Undo, autosave/reopen/export, three adjustable columns and author-owned Work continuity. Actual MAIA provider/consent rules and member HTTP Draft response/idempotency must be requalified on one exact image.
5. **Production:** full enforced TypeScript/shipping build (previously ~193 global errors), complete encrypted DOCX/PDF parsing/streaming, approved non-Resend invitation sender/current notice, independent old-reader/offsite restore/rollback and founder Class A exact source/image release authorization. Linux disk/custody must be rechecked at build.

**Verdict:** synthetic multi-section passage → R35 encrypted immutable idempotent Apply/Undo source and local PG16 acceptance PASS; **five real invited writer beta on `soullab.life` remains HOLD**.
