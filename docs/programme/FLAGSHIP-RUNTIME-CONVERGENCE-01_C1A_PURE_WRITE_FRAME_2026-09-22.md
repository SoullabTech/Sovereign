# FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1A — Pure Write Frame + Live-Host Contract

**Date**: 2026-09-22
**Act**: C1A (founder-authorized; opened after S1 closed, on its own lineage)
**Canonical**: `b23ae2d7fd31ee56841af3930b31658ab286a2a3` — unmoved
**Flagship lineage accepted through**: `eb7ca25bc` (S0) → S1 `46dcfc2cf`·`6d36484d9`·`ec5991071`
**C1A lineage**: golden `e2a019b0e` → extraction `0cdae09a9` → this record
**Authority**: presentation architecture only. ⛔ Nothing is mounted into `/writers-studio/rebuild`. ⛔ Merge, deploy, production: NOT authorized. ⛔ STOPPED at the C1A boundary; C1B is a separate act.

---

## 0. Standing at the top

- **A pure Write frame exists** (`app/writers-studio/flagship/WriteFrame.tsx`): geometry only; the manuscript surface, the contextual layer, the trail, the status line and every action are host-supplied. It fetches nothing, persists nothing, mints nothing, infers nothing, renders no control of its own.
- **The controlled witness is preserved, byte for byte.** All six accepted Write states render markup identical to the golden captured from the untouched room, and the browser witness after the extraction produced a result file identical to the baseline run and **44/44 screenshots byte-identical** (`cmp`). V9 and F13 stay green (`44/44` each).
- **The live-host contract is proved, not described**: `RebuildAuthoredBody` renders inside the flagship manuscript geometry (`article.fs-ms[data-manuscript]` → `[data-authored-body][role="textbox"]`), and the five authorship-substrate files are **blob-identical to canonical** (law L9).
- **Lethal + discriminating**: reference **9/9**, eight founder-named defeat candidates **8/8 dead**, **zero collateral**.
- Gates: `typecheck:ws-flagship` exit 0 (program untouched) · `typecheck:ws-flagship-c1a` PASS · `matrix:ws-flagship` 13/13 · 8/8 · `matrix:ws-flagship-c1a` 9/9 · 8/8 · ship `typecheck` 226 vs 239, 0 regressions · `check:no-supabase` clean · S1 matrix still 27/27.

## 1. Composition delivered

```text
WriteFrame                        pure · geometry only
  place       { work, chapter?, place?, facet? }      ← host strings, verbatim
  status?     string                                  ← host truth, verbatim (⛔ never composed here)
  actions?    ReactNode                               ← host-supplied; omit what lacks substrate
  trail?      ReactNode                               ← host-supplied
  heading?    { chapterLabel?, chapterTitle?, epigraph? }   ← absent renders as absent
  children    ReactNode                               ← THE MANUSCRIPT SURFACE
  contextual? ReactNode                               ← MAIA layer / floats / drawers
  foot?       { chapterLabel?, words?, wordDelta?, actions? }

WriteRoom  = WriteFrame ∘ (fixture paragraphs · MaiaPanel · floats · witness toolbar · "Saved 2m ago")
Live host  = WriteFrame ∘ (RebuildWritingBoundary → RebuildAuthoredBody · host status · host actions)   ← C1B, not built
```

⭐ The witness's *"Saved 2m ago"*, its `Aa · ◍ · Comment · ⋯` toolbar and its `Focus` tool are now visibly **the controlled room's fixtures**, passed in by `WriteRoom`; the frame carries none of them. C1A confers no runtime authority for any of them.

## 2. Changed-file population (exact)

| File | Change |
|---|---|
| `app/writers-studio/flagship/WriteFrame.tsx` | **new** — the frame (§1) |
| `app/writers-studio/flagship/WriteRoom.tsx` | composes `WriteFrame`; `CrumbBar` import replaced by `WriteFrame`; ⛔ no markup change (L8) |
| `app/writers-studio/flagship/StudioChrome.tsx` | `destinations?: readonly NavDestination[]` on `StudioShell` · `StudioRail` · `MobileNav`, default = full approved reference; ⛔ no markup change at default |
| `app/writers-studio/flagship/flagship.css` | tokens declared once on `.fs-tokens, .fs-root`; the rail+content grid remains on `.fs-root` alone; `*{box-sizing}` and `:focus-visible` cover both roots. ⛔ Same declarations, same specificity, same order → identical computed styles (screenshots prove it) |
| `lib/writersStudio/studio/adapters/writeView.ts` | **new** — `toWritePlace` · `toWriteHeading` · `countWords` · `toWriteFoot`, pure over `RebuildSection` / `ChapterSpan` / explicit `workTitle` |
| `tests/constitutional/writers-studio/flagship-c1a/**` | `laws.ts` · `candidates.tsx` (+3 disposable candidate frames) · `matrix.ts` · `renderStates.tsx` · `captureGolden.tsx` · `golden/*.html` |
| `tsconfig.ws-flagship-c1a.json` · `scripts/typecheck-ws-flagship-c1a.mjs` | strict + `noUncheckedIndexedAccess` + `react-jsx` over the new pure code and the composed substrate (§5) |
| `package.json` | `typecheck:ws-flagship-c1a` · `matrix:ws-flagship-c1a` |

⛔ Untouched (blob-identical to canonical, asserted by L9): `RebuildStudioClient.tsx` · `RebuildAuthoredBody.tsx` · `RebuildWritingBoundary.tsx` · `useSectionWriting.ts` · `sectionSaveClient.ts`. Also untouched: editorial routes · Develop/Review runtime · S1 files · schema · migrations · `tsconfig.ws-flagship.json` · production.

## 3. Laws and lethality (`npm run matrix:ws-flagship-c1a`)

| Law | What it observes | Kills |
|---|---|---|
| L1 host-body-is-live-authorship | `RebuildAuthoredBody` inside `article[data-manuscript]`, `role=textbox`, zero `fs-p` | **D1** static body replacement |
| L2 frame-persists-nothing | frame source has no `fetch( · apiFetch · useSectionWriting · makeSectionSave · localStorage · /api/` | **D2** second save owner |
| L3 no-forced-dead-control | frame with no `actions` renders 0 `<button>`/`<a>`; frame source has no `<button` | **D3** dead control |
| L4 no-legacy-nav-bridge | `destinations=['write']` → exactly 2 `data-nav` (rail + mobile); no `href`, no `/writers-studio/(develop|review|rebuild)` on subset **and** default renders | **D4** legacy nav bridge |
| L5 tokens-declared-once-on-token-root | `--ground-work:` once; its rule's selector includes `.fs-tokens` and carries no grid; `.fs-root` carries the geometry | **D5** token duplication |
| L6 adapter-conserves-truth | every output string ∈ input strings; no `kind · epigraph · label · opening · id · observationId` key | **D6** fabricated view fact |
| L7 frame-owns-no-state | frame source has no React state/effect/ref hooks, no `randomUUID/crypto/uuid` | **D7** second state owner |
| L8 controlled-witness-unchanged | six states byte-identical to golden | **D8** visual regression |
| L9 authorship-substrate-untouched | five substrate files blob-identical to `b23ae2d7f` | (guard) |

Result: reference **9/9** · **8/8 DEAD** · zero collateral · `LETHAL + DISCRIMINATING`.

## 4. Instrument findings (⛔ none repaired by weakening a law)

1. **D4 survived its first run.** L4 rendered the shell with `['write']` only, and a bridge that links Develop/Review had nothing to link. *The law was too narrow*; it now scans both the subset and the default render. A surviving candidate repairs the suite.
2. **L1 threw `React is not defined`.** Under the root tsconfig's `jsx: preserve`, `tsx` compiles the rebuild substrate (which does not import React by name) to the classic runtime. The matrix runs under `tsconfig.ws-flagship-c1a.json` (`react-jsx`); the substrate file is in that config's include so the transform applies. Instrument, not law.
3. **`git mv -k` on untracked files is a silent no-op** — a directory move "succeeded" while nothing moved. Caught by the next gate run; noted so the next lane does not trust `-k`.

## 5. Typecheck disposition (the ratified S3 shape, ⛔ not a weakened flag)

`flagshipTokens.ts` re-exports `RADIUS · SPACE · MEASURE` from `app/writers-studio/studioTheme.ts`, so any strict program containing a flagship component contains that file — and it was never written to `noUncheckedIndexedAccess`: **24 diagnostics (16×TS18048 · 4×TS2532 · 4×TS2345), all pre-existing at canonical, outside this population**. Refused: weakening the flag; leaving the command red; widening the canonical `tsconfig.ws-flagship.json` (its program is the existing gate and is untouched). Taken: a sibling config + `scripts/typecheck-ws-flagship-c1a.mjs` that allows exactly that file's diagnostics **by name**, fails on any other diagnostic, and reports a stale allowance. ⭐ The witness fixtures are loaded at runtime by `renderStates.tsx` (shape pinned locally) so the strict program checks the new code without absorbing the witness module graph. **Routed out**: `scripts/witness/flagship/fixtures.tsx:201` carries a real pre-existing type error (`'themes'` is not a lens id) — not this act's.

## 6. What C1A does not do (binding)

- ⛔ Does not mount into `/writers-studio/rebuild`; no live route changed.
- ⛔ Confers no runtime authority for `Aa · voice note · Comment · More · facet selection · Develop navigation · Review navigation`.
- ⛔ Connects no flagship navigation to `/writers-studio/develop` or `/writers-studio/review` (L4 forbids it structurally).
- ⛔ Reimplements none of `RebuildWritingBoundary · useSectionWriting · makeSectionSave · version concurrency · stale_base refusal · capture-before-unmount · passage selection` — the frame hosts them as children (L1) and the files are untouched (L9).
- ⛔ The `.fs-tokens` root is CSS only; no live host uses it yet.
- ⛔ No screenshot is relabelled as production evidence; the witness remains a controlled-component witness.

## 7. Attestation

- population: exactly §2 · schema: none · migrations: none · production: untouched · S1 files: untouched
- **Next act: `FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1B — LIVE WRITE HOST MOUNT`**, separately authorized. ⛔ C1A STOPS HERE.
