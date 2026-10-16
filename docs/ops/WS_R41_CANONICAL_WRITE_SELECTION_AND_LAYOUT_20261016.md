# Writer's Studio R41 — Exact selected passage and visible layout Reset in the canonical Write room

**October 16, 2026 · Isolated real-component qualification PASS · No protected-route activation or real beta admission**

## Purpose and source

R40 qualified a warm, manuscript-first **fictional standalone** writing room in desktop/mobile WebKit. The real Writer’s Studio does not use that mockup: `/writers-studio` hosts the PC3/V10 `P4R1StudioHost`, the authenticated `P4R1WriteEditController`, `P4R1Pc3WriteEditView` and the canonical `Shell` with three live panels, typed manuscript editing and actual MAIA conversation. Replacing those would lose established Work identity, author custody, conversational continuity and current editorial flows.

R41 therefore makes **two small source changes in those exact canonical components** rather than deploying a detached static prototype or creating an open authoring endpoint:

1. `app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx`: selected writing is now resolved from **the actual DOM/textarea selection offsets and current authored A1 section body**, first. `lib/writersStudio/exactLiveSelectionR41.ts` returns an immutable `{start,end,text}` measured in Unicode **codepoints** after validating the exact text. For virtualized whole-manuscript textarea selections, raw UTF-16 browser offsets are converted to codepoint positions and the textarea must equal the current authoritative body byte-for-byte. This locates the writer's **second identical occurrence**, not the first. Mismatched, unsaved/stale or cross-section selections refuse without silently relocating.
2. For the contenteditable paragraph editor, a live DOM Range may establish the exact codepoint start/end only if the *whole serialized editor* agrees with the section's authored body. Rich paragraph DOM may introduce synthetic boundaries; in that case the original `locateUniquePassage` fallback remains **unique-text only**, never guessing between repeated phrases. This preserves existing functionality where exact raw block serialization cannot be trusted.
3. `app/writers-studio/full-redesign/Shell.tsx`: a visible keyboard-accessible **Reset widths** button is now alongside the real existing Manuscript and MAIA show/hide controls. It resets *both* panel widths to their role-specific defaults, lets the already-existing per-mode localStorage effect persist the adjustment, and never unmounts the editor or MAIA. Full Canvas and single-room Home do not show the control; the already-existing stylesheet hides panel controls on mobile screen widths.

**No actual current Edit/Apply/Undo, R39 signed backend, API route, production data, member identity, model API, mail or cloud key was changed.** The new exact selection merely hands a better section-owned codepoint locus to the existing `onHoldPassage` controller callback. It is essential for future R39 section/witness binding but is *not* itself evidence of a real writer authorizing an Apply.

## Frozen source and local test contracts

- Parent: committed R40 fictional-only WebKit review `ea15a9c3d7f35e384e600dcf9affe729d4dba4eb`. New isolated R41 worktree `/Volumes/T7 Shield/ws-beta-r41-exact-live-selection-20261016`, branch `fix/ws-beta-r41-exact-live-selection-20261016`; the R40 fixture, R39 encrypted write path, real public app and concurrently developed branches remain unchanged.
- Pure/contract R41 selection tests: **8/8 PASS**, including duplicate passage's *second* occurrence, supplementary-plane emoji offsets, stale-body refusal, invalid selections, source wiring in the real Write component, unique-only rich DOM fallback and no new network or real Apply controls.
- Actual React Studio Shell tests under JSDOM: **5/5 PASS**, including both real splitter keyboard positions, visible accessible Reset, existing localStorage key persistence, DOM identity unchanged/Work not remounted and Full Canvas/Home controls held.
- Combined selected R35–R41 actual UI/custody regression: **8 suites, 82/82 PASS**.
- Headless real **desktop/mobile WebKit** via `scripts/ops/wsBetaR41ExactAnchorWebkit.cjs`: **11 checks PASS**. It bundles the **actual TypeScript helper imported by the real Write component** into isolated about:blank WebKit DOM matching `data-write-editor` / `data-whole-manuscript-section` scaffolds, with a fabricated author section and textarea. It selects both occurrences of an identical passage, refuses stale and cross-Work selections, verifies Unicode codepoint positions and receives **zero off-device requests**. WebKit passes browser-type semantics, but does NOT render the entire actual authenticated Studio or a real Work.
- Scoped strict TypeScript `tsconfig.r41-exact-live-selection.json` includes both canonical components and two new test suites (plus `next-env.d.ts`) and passed with **zero diagnostics**.
- The exact R41 source run with full `tsconfig.ship.json` returned **193 inherited diagnostics (exit 2)**. Normalized file/code/message entries are identical in order to R40, with canonical SHA256 `695ea8f398339d681a7882328449e6af9c8f168fa483839911780d6951566908`: **zero newly introduced TypeScript errors**, but **not a clean enforced production build**.
- All standalone WebKit sources/receipts include only fictional writing. New R41 helper does **not** import a model provider, manuscript persistence service, real KMS, password reader, Next API route or private member data.

## Actual writer experience versus mock preview

The manuscript remains the product's first visual authority; the existing `P4R1Pc3WriteEditView` still owns selection, writing, development, review, MAIA thread integration, Undo and Source custody. R41's single selection change avoids shifting a writer's intention to another identical phrase, and the native shell's visible Reset brings an already-approved R40 behavior to the real product.

The R40 Mac preview file `/Volumes/T7 Shield/ws-beta-release-r11-build-20261016/R40_FICTIONAL_WRITER_ROOM_PREVIEW_20261016.html` remains useful for a local **design** walkthrough, but does **not** show R41's newly improved actual source code executing against real manuscripts. R41's actual shell was rendered in React/JSDOM and its exact selection helper in real WebKit.

## Release remains held

- The actual public Writer's Studio still relies on **legacy ordinary-SQL manuscript Source, draft, revisions, keeps, Apply/Undo and editorial JSON paths**. A prior bounded source census found 51 literal writing candidates/19 source files (30 draft/revision). R39's encrypted session-bound Apply/Undo is **fictional-only** and not connected to the live writing application.
- An actual **server-witnessed one-use author-choice gesture** cryptographically bound to member session, Work, selected section/locus, exact accepted notice and consent epoch, chosen MAIA/member option, and Work revision must be designed and verified before protected Apply. Neither a fake checkbox nor client-submitted `authorConfirmed` is authorization.
- An independently controlled real Work-key issuer, current tamper-resistant deletion high-water, cross-node Work revocation/commit fence, encrypted orphan reconciliation and isolated offsite restore remain unqualified. Old raw encryption keys kept with historical ciphertext can still decrypt offline; do not imply universal instant erasure.
- Complete real Writer's Studio/Personal Portal UI and MAIA Develop/Write/Review, multi-chapter rendering, autosave/reopen/export, genuine Safari Mac and physical iPhone consent/login, exact-image enforced build/rollback and Proton-only reviewed invitation transport remain separately held before any actual five-person beta.
- The founder must separately authorize exact source/image deployment and any provider spend or real-member write. This local source candidate grants none of those authorities.

**R41 disposition:** real product-component precision selection and visible Reset qualified locally with synthetic author text. R39 protected backend integration, real-member admission, production build and public deployment remain HOLD.
