# Writer's Studio R52 — Real Next.js PC3 WebKit-authenticated review and precise author selection

**October 16, 2026 · Mac Studio · Local fictional PG16/real Next.js acceptance PASS · Real-member beta HOLD**

## Purpose: the real Studio, not another separate mockup

The accepted R51 source already protects one fictional original through pending/immutable Source, section-addressable Draft, separately encrypted MAIA/member private editorial proposal, durable one-use signed Apply, separate durable Undo, restart/reopen and R49 orphan/ownership inspection. **But that protected pipeline is not the live Writer's Studio browser route.** Earlier R40 browser research used a detached HTML prototype. R52 instead drives the actual canonical `/writers-studio?mode=write&m=<manuscriptId>` route through Next.js and **real PC3/V10 React components** without activating real writing.

R52 is based on pristine R51 documentation source `d2306c48437821eb5e6e89f535aa86c73a54e243` in the separate local branch `fix/ws-beta-r52-canonical-local-browser-20261016` at `/Volumes/T7 Shield/ws-beta-r52-canonical-local-browser-20261016`. The earlier R52 legacy mutation ingress gate, current production app, and prior R51 private-encryption worktrees are **unchanged**.

## Actual source improvements made

### Precise selection in the real rendered manuscript

The actual `P4R1Pc3WriteEditView.tsx` uses both a virtualized full-manuscript textarea and an existing `WriteRoom` contenteditable rendering with paragraphs. The accepted R41 exact DOM helper correctly refuses when paragraph rendering omits source line-break characters; its conservative uniqueness-only fallback also refuses a second occurrence of identical words.

R52 adds `lib/writersStudio/exactRenderedPassageR52.ts` and calls it **only after R41 exact DOM verification is unavailable**, before the existing unique-only fallback. It serially maps each actual `[data-write-block]` child to the current A1 authoritative section body, requiring the skipped gaps and final residue be whitespace only and the whole set/order match before deriving a Unicode codepoint span. It rejects stale/unsaved text, foreign/cross-paragraph selection, extra content nodes and altered text, and never searches for another duplicate phrase to relocate the writer's click.

This code is now **directly imported by the actual canonical PC3 Write View**. No editor/MAIA request or manuscript write is made by the helper; compile-time `R52_REAL_PROTECTED_EDITORIAL_WRITE_ENABLED=false`. Nine standalone source/DOM Jest tests verify second repeated phrase `lantern glows` after a Unicode symbol, exact position over two paragraphs, stale/missing/cross-block refusal, no side effects and source-wiring custody.

### Fix the actual narrow-screen toolbar

One 390px actual WebKit screenshot revealed that the real PC3 topbar expanded the document to **419px**, clipping History/Save a copy. R52 updates only the canonical P4R1 responsive CSS in `app/dev/writers-studio-p4r1/p4r1-live.css`: the product bar can wrap, and existing Theme, History and Save a copy actions receive a small, independently scrollable second row. The manuscript and all panels retain their original identity/layout logic.

The new actual mobile browser acceptance checks the measured `document.documentElement.scrollWidth` against `window.innerWidth`; it passed **390px document within 390px viewport**. This is WebKit mobile viewport emulation, **not** acceptance on a physical iPhone.

## Actual Next.js, authentication and browser test

A new uniquely named, opt-in `scripts/ops/wsBetaR52ActualStudioNextPG16.py` creates a randomly named disposable `postgres:16.13` DB on a localhost-only published port, with no host mounts and limited CPU/memory. It creates **only fictional** `members` and `auth_sessions` records, including one fake authenticated token, and starts the real Next.js canonical route via `next dev --webpack` on localhost in a *sanitized environment* with no real auth/key/provider/mail credentials or production database. The WebKit binary is read from the already-cached Mac browser cache, without pulling software.

`scripts/ops/wsBetaR52ActualStudioPlaywright.cjs` performs an actual browser visit to `/writers-studio`: the existing Node proxy denies an anonymous viewer and admits the fabricated HTTP-only `maia_session` only through the actual disposable PG16 session query. All browser GET content APIs are intercepted and replaced with explicit fictional data (a two-section manuscript and an invented Work whose `expressions` table declares exactly this manuscript). **Every browser POST/PUT/DELETE API request receives HTTP 423 `persisted=false`**; no real protected Source, provider, KMS or editorial backend is connected.

Real WebKit then sees the actual `P4R1StudioHost`, `P4R1WriteEditController`, `P4R1Pc3WriteEditView`, `Shell` and manuscript paragraph editor. It verifies:
- Two separately identified fictional manuscript sections, MAIA relation to the correctly declared Work, explicit MAIA reveal, real Outline/MAIA resizing and Reset widths.
- Exact **SECOND** `lantern glows` selected inside the genuine PC3 `contenteditable` paragraph. It opens **Work with passage → Discuss / Revise** and leaves the manuscript intact. There is no automatic editorial Apply.
- Modes **Develop → Review → Write** use the actual unified router and retain the manuscript identity and words.
- In real WebKit at 390×844, the manuscript is visible and no document horizontal overflow occurs; the Theme/History/Save controls are visible and accessible. Screenshot contains only fictional prose.
- Some controller requests to remember the member's selected place are **metadata PUTs**; two such `/api/writers-studio/return/place` attempts were observed, separately classified and explicitly HTTP-423-refused. **Zero manuscript/editorial content write calls were attempted or accepted**. All off-host browser requests were blocked, with zero such attempts on the passing run.

The original real Next.js proxy authentication was tested, but the fictional context GETs are browser mocks and **not** evidence of a real database-retrieved manuscript or actual user consent. The Next.js startup attempts a schema check against the intentionally incomplete disposable database; that check is not evidence of a production schema. This remains dev-mode Webpack acceptance, not a signed enforced production image.

## Qualification

- Current precommit WebKit browser: **29/29** actual PC3/Next interaction checks PASS, including source selection, Work/MAIA binding, three-mode navigation, mobile layout and zero external/content writes. **13/13** disposable PG/Next/cleanup driver checks PASS.
- Rendered source-locus tests: **9/9 PASS**. New no-release/real-browser source boundary tests: **10/10 PASS**.
- Inherited encrypted Source, separate private editorial, session/consent, durable Apply/Undo, restoration/orphan controls, genuine PC3 UI source regression: **79/79 suites and 809/809 tests PASS**.
- Strict `tsconfig.r52-canonical-next-webkit.json`: **0 diagnostics**, including both the actual modified PC3 view and page.
- Full repository `tsconfig.ship.json` returned **193 inherited TypeScript diagnostics (exit 2)**. The ordered, normalized file/error-code/message sequence exactly matches accepted R51, canonical SHA256 `695ea8f398339d681a7882328449e6af9c8f168fa483839911780d6951566908`. **Zero new diagnostics, but NOT a clean full Next.js production build.**
- Evidence folder: `/Volumes/T7 Shield/ws-beta-release-r11-build-20261016/R52_CANONICAL_REAL_NEXT_WEBKIT_20261016/`. Contains private mode-0600 `R52_ACTUAL_NEXT_AUTH_CANONICAL_WEBKIT_20261016.json`, browser and Next logs, and actual desktop/mobile WebKit screenshot PNGs. Distinct previous passes and expected diagnostic refusals are preserved in separately named R52 folders. All R52-owned Docker/Next/test HOME resources are torn down.
- **Exact commit and evidence qualification will be rerun after the implementation source is committed**, with a separate receipt and no overwriting older acceptance files.

## Next release gates, still unwaived

1. **Actual browser's protected editorial Apply/Undo not connected.** R52 did not route browser requests into R51's signed private-source proposal/Apply/Undo; those writer mutation endpoints were deliberately 423-refused. An explicit trusted one-use server-side author-choice witness and signed Work-kms/consent on an actual Next authenticated request must be independently qualified, with no legacy plaintext fallback. R50 server-owned choice research remains a separate default-OFF test lane.
2. **Real manuscript flows incomplete.** R52 tested a fictional already-section-aware manuscript, not authentic DOCX/PDF/MD/TXT import, first Start writing, real provider MAIA alternatives, saved modifications, actual export or long-manuscript performance. Develop/Review navigation preserves identity but their functional content APIs were mocked/held.
3. **Operational trust roots absent.** All independent signers/Work-key, external deletion highwater, cross-node write/revoke fence, encrypted private proposal escrow keys and approval tokens are still same-Mac synthetic fixtures. Cold restore wasn't offsite, and old copied encryption keys can still decrypt historical ciphertext.
4. **Legacy plaintext migration and privacy gates incomplete.** Source/draft/revision, Keeps, editorial, MAIA/provider, SQL/WAL/exports/logs/backups/old-reader routes still have plaintext-capable paths; previous bounded inventory identified at least 51 old writing SQL statements across 19 source files (30 draft/revision). R52's blocked browser writes do not qualify the migration.
5. **Founder/operational acceptance.** Full enforced production build, host capacity/rollback, actual Mac Safari + physical iPhone Safari, first real member invite/login/approved notice and Proton-only email, independent privacy/security Class A review, and explicit founder exact-source/image deployment and two-member canary authorization before any of five writers join.

**Disposition: actual Writer's Studio canonical Next/PC3 browser READ/SELECTION/MODE and mobile-UX qualification PASS, fictional DB/auth/content only. Real protected writer editing and public beta HOLD.**
