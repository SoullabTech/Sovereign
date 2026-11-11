# WS-DEVELOP density views — build record B1-B5 (2026-11-09)

Spec: `WS-DEVELOP_DENSITY_VIEWS_SPEC_DRAFT_2026-11-09.md` (approved; §10-§13), on PR #2207. Base: canonical `b1d013bca`. Branch `feature/ws-develop-density-b1-20261109`.

## Built
- **B1** `lib/writersStudio/presentationRequests.ts`: per-writer key (`getValidMemberId`), legacy unscoped key never read or adopted (left in place), temporary per-Work choice in sessionStorage, precedence override > default > focused; the change notice carries the choice so an unstorable choice still holds for the session; subscribers respect precedence; cross-tab reads only the writer's own key.
- **B2** `P4R1DevelopView` reads/subscribes with the Work id and owns the one setting both render paths use.
- **B3** `DevelopStage`: View control in the header (names the current view for screen readers); All tools opens plan, sources and starters below the chapter; Quiet/Balanced keep them behind More. Registered in `DEVELOP_CAPABILITIES` (key `view`, reach: conversation).
- **B4** on-screen labels Quiet / Balanced / All tools from one table; stored values unchanged; also in `WriterPreferencesMenu`.

## Evidence (local, jsdom; not a browser run)
- `presentationScope.test.ts` 12/12; mutating the key to unscoped fails 4.
- `developStage.test.ts` 28/28 incl. 5 new; disabling All tools fails 2.
- All suites touching these modules: 428/429. The 1 failure (`developAskable` "every control … classified": `data-depth`, introduced by #2201's `<option data-depth>`) fails identically on canonical; not absorbed here.
- Typecheck gate: identical to canonical (4 diagnostics in KMS/Stripe/theme files from this worktree borrowing the main checkout's older dependencies).

## Deviations from the spec, deliberate
1. **Rail not driven by density.** Shell already persists the writer's own rail collapse ("an explicitly saved collapse wins"); density does not override a writer's own act. Spec §3 "rail collapsed in Quiet" is not implemented.
2. **On the calm stage Balanced = Quiet.** Balanced differs on the dense path (existing `guided` behaviour). Whether Balanced earns its place is the beta question already in §9.
3. **Disclosure labels unchanged** ("More" not renamed): R5 copy change left for the founder walk.

## Findings, not fixed
- MAIA's existing presentation proposals (`proposePresentationRequest`) change working-style pace together with density (e.g. "Gentle guidance" sets pace `guided` and depth `guided`). The spec separates density from working style; this coupling predates this work. Founder question.
- Path B (dense view) folds by its own existing `focused/guided/full` logic; the per-control fold table in spec §3 is not re-implemented there.

## Owed before merge
Fictional-account walk on this exact candidate (local or preview): scenarios 1-12, keyboard and screen reader, two writers on one browser, temporary choice across refresh. Review Custody. Merge and deploy are founder acts. No migration.
