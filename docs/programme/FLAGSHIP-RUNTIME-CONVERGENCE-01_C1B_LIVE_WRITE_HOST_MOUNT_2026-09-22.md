# FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1B — Live Write Host Mount

**Date**: 2026-09-22
**Act**: C1B (founder-authorized after S1 and C1A passed adjudication on candidate)
**Canonical**: `b23ae2d7fd31ee56841af3930b31658ab286a2a3` — unmoved
**Accepted flagship head at authorization**: `7deb87810` (C1A record)
**C1B lineage**: baseline walk → mount + suite → this record (SHAs in §9)
**Authority**: composition convergence at `/writers-studio/rebuild` only. ⛔ Merge, deploy, production: NOT authorized. ⛔ STOPPED for founder adjudication.

---

## 0. Standing at the top

- **`/writers-studio/rebuild` now renders the flagship Write composition around the proven authorship substrate.** `RebuildAuthoredBody` is mounted inside `WriteFrame` inside `StudioShell`, bound to the one `SectionWriting` session that `RebuildWritingBoundary` creates. The five authority files are blob-identical to canonical.
- **Known-good baseline first**: the same browser walk ran against the legacy host before the mount. Typing saved through the existing path (draft version 1→2), reload returned the exact text, selection held the exact passage.
- **Live candidate walk on the flagship host: 22/22.** Real `next dev`, real full-schema disposable Postgres, real authenticated session, real rows. Status read *Unsaved* while typing and *Saved · v2* after; exactly one section save lane; passage held at code-point address `21:29`; zero buttons; zero legacy links; no static paragraphs; no fixture phrase; no invented kind or organisation.
- **C1B matrix lethal + discriminating**: reference **10/10**, nine founder-named candidates **9/9 dead**, two irreducible collateral entries classified.
- **Every required gate green**: flagship matrix 13/13 · C1A matrix 9/9 with golden intact · controlled browser witness identical to baseline (result file + 44/44 captures byte-identical) · `typecheck:ws-flagship` · `typecheck:ws-flagship-c1a` · `typecheck:ws-flagship-c1b` · ship no-regression typecheck 226 vs 239 · design-canon · `ci:sovereignty` · `check:no-openai` · `check:no-supabase` · S1 matrix 27/27.
- ⚠️ `npm run check:sovereignty` cannot run on any branch: its script `scripts/check-maia-sovereignty.ts` does not exist in the repository. The composite `ci:sovereignty` gate is what ran. Routed out (§8).

## 1. Authority split, as built

```text
FLAGSHIP        StudioShell (destinations=['write'], affordance='orientation', project only if declared)
                WriteFrame  (place · status · heading · foot — all host-supplied)
                flagship.css via the ratified .fs-tokens / .fs-root roots
                     │
THIS HOST       app/writers-studio/rebuild/FlagshipWriteHost.tsx
                identity (m + /api/writers-studio/rebuild/context) · Work resolution
                (useLivingWorks + resolveWorkContext) · focus/place (resolveInitialSection ·
                replacePlaceAddress) · held passage {sectionId,start,end,text} · truthfulStatus()
                     │
SUBSTRATE       RebuildWritingBoundary → useSectionWriting → makeSectionSave
(unchanged)     staging · save queue · version concurrency · stale_base · capture-before-unmount
                RebuildAuthoredBody — editing · selection → exact code-point address
```

`authoredBodyProps(writing, section, held, hooks)` is the seam as data: `onEdit → writing.editSection`, `onCaptureBeforeBlur → writing.captureForUnmount`, `onSelectPassage → onHold(id, start, end, text)` verbatim. It is exported so the law calls it rather than trusting the JSX.

## 2. Changed-file population (exact)

| File | Change |
|---|---|
| `app/writers-studio/rebuild/FlagshipWriteHost.tsx` | **new** — the host (§1); exports `FlagshipWriteView`, `authoredBodyProps`, `truthfulStatus` |
| `app/writers-studio/rebuild/flagshipWriteHost.css` | **new** — host styles through tokens only; serif on the section so editing keeps the Work's face |
| `app/writers-studio/rebuild/page.tsx` | mounts `FlagshipWriteHost`; imports `flagship.css` + host css; no longer mounts `RebuildStudioClient` |
| `app/writers-studio/flagship/StudioChrome.tsx` | `project?` / `member?` optional (blocks omitted when absent); `workKind?` optional; `affordance: 'reference' \| 'orientation'` on shell/rail/mobile nav (`orientation` renders `<span data-affordance="orientation">`, never a button); `CrumbBar.work?` optional. Defaults unchanged → controlled witness byte-identical |
| `app/writers-studio/flagship/WriteFrame.tsx` | one line: `WritePlace.work?` optional — the founder's *make the presentation capable of honestly omitting* |
| `scripts/witness/flagship/c1b-live-write-walk.ts` | **new** — the live walk, `--host legacy\|flagship` |
| `docs/design/contracts/screenshots/flagship-c1b/*.png` | legacy baseline (4) + flagship candidate (5) captures |
| `docs/design/contracts/flagship-studio.md` | **new** Experience Contract covering `app/writers-studio/flagship/**` + the host (design-canon gate) |
| `tests/constitutional/writers-studio/flagship-c1b/**` | `laws.ts` · `candidates.tsx` (+`D2_SecondSessionHost.tsx`) · `matrix.ts` |
| `tsconfig.ws-flagship-c1b.json` · `scripts/typecheck-ws-flagship-c1a.mjs` | strict config; runner now takes a config and carries per-config named allowances |
| `package.json` | `typecheck:ws-flagship-c1b` · `matrix:ws-flagship-c1b` |

⛔ Untouched, asserted by law L10 against canonical: `RebuildAuthoredBody.tsx` · `RebuildWritingBoundary.tsx` · `RebuildStudioClient.tsx` · `useSectionWriting.ts` · `sectionSaveClient.ts`; adapters identical to C1A. Also untouched: schema · migrations · S1 files · provider routing · Develop/Review runtime · F5 · F7 · F8 · production.

## 3. What the live host asserts, and deliberately does not

**Asserts**: Write, as non-interactive orientation. The Work's declared name (else the manuscript's own title, else nothing). The member's own word for the Work's form, if declared. The chapter root's own heading. The section's own heading. A word count. A status from the session.

**Does not draw** (each keeps its substrate; none has a lawful action in this composition yet): `Aa` · voice note · Comment · More · facet selection · Ask MAIA · the contextual MAIA layer · Pure Canvas · the editorial workspace · chapter review · Develop · Review. **Pure Canvas is omitted rather than forked** — the founder's rule when preserving one session would exceed the bounded mount.

**Legacy `RebuildStudioClient`** is retained in the directory, unmounted, byte-identical: its editorial, review and MAIA presentation are raw material for the later bounded convergence acts, not deleted capability.

## 4. Baseline first — what the legacy walk established (pre-mount)

`c1b-live-write-walk.ts --host legacy`: manuscript by identity · one authored body (legacy passage focus renders one section) · typing does not shift the column · draft version 1→2 through the existing save path · saved text exact · one PUT · place address `s=` follows · exact passage held (`far bank`, 21:29) · reload exact. Two instrument assumptions were wrong and corrected before the flagship run: the legacy host renders one section in passage mode (law now ≥1 shared, flagship held to 2 inside the geometry), and a section autosave advances `manuscript_working_drafts.version` but never writes `working_draft_revisions` (that ledger belongs to Keep-a-version / conversion) — recorded, not asserted.

## 5. Live candidate walk — flagship host (22/22)

```
W-1  opens by identity · W-2 two real authored bodies · W-3 seeded text exact
W-4  editing does not shift the column (x 348.36→348.36, w 567.27→567.27)
F-1  status while typing = "Unsaved"
W-5  version 1→2 through the existing path · W-7 saved text exact · W-8 PUT requests = 1
W-9  s= follows the section · F-2 status after save = "Saved · v2"
W-10 held mark = "far bank" · F-3 data-held-passage-address = "21:29"
W-11 reload returns exact text
F-4  2 authored bodies inside article[data-manuscript] · F-5 fs-p = 0 · F-6 buttons = 0
F-7  legacy links = 0 · F-8 data-nav = 2 (rail+mobile), 0 buttons, both aria-current
F-9  fs-root = 1, legacy regions = 0 · F-10 no "Saved 2m ago" · F-11 rail carries no invented kind/org
```
Captures: `flagship__1-open` · `2-typing` · `3-held` · `4-reloaded` (1440×900) · `5-mobile-390`. ⛔ Candidate evidence: a controlled browser walk with a seeded member on a shadow, not production and not a member walk.

**Contextual layer**: none is mounted in C1B, so the no-jump/no-occlusion laws have nothing to measure beyond W-4 (the manuscript column does not move when editing begins).

## 6. C1B laws and lethality (`npm run matrix:ws-flagship-c1b`)

| Law | Kills |
|---|---|
| L1 live-authorship-in-flagship-geometry (2 bodies, 2 textboxes, 0 `fs-p` inside the article) | **D1** static flagship manuscript |
| L2 single-writing-session (host references the boundary; never `useSectionWriting(`/`makeSectionSave`/queue; one `data-manuscript`) | **D2** second writing session |
| L3 truthful-status (five-row table; rendered `Saved · v7`; no `2m ago` in source or markup) | **D3** false saved state |
| L4 no-fabricated-presentation-fact (title-less, heading-less context → no crumb name, no rail work block, no chapter heading, no `Untitled`/`Novel`) | **D4** fabricated presentation fact |
| L5 no-dead-production-control (0 `<button>`, 0 `<a>`) | **D5** dead production control |
| L6 no-legacy-mode-bridge (no legacy hrefs; navs = write,write; both orientation) | **D6** legacy mode bridge |
| L7 save-wiring-to-existing-session (`onEdit`/`onCaptureBeforeBlur` reach the injected session verbatim) | **D7** save regression |
| L8 passage-address-exact (`onSelectPassage(21,29)` → `onHold(id,21,29,text)`; `data-held-passage-address="21:29"` renders) | **D8** passage-selection regression |
| L9 not-the-legacy-workbench (`fs-root` once; no `wsr-*`; host never imports `RebuildStudioClient`/`StudioModeBar`) | **D9** visual fallback |
| L10 authority-files-untouched (5 blobs = canonical; adapters = C1A) | guard |

Collateral, adjudicated irreducible: **D1** also dies on L8 (a static surface has no passage to hold); **D6** also dies on L5 (a bridge is an anchor). Result: **10/10 · 9/9 · LETHAL + DISCRIMINATING**.

## 7. Instrument findings (⛔ none repaired by weakening a law)

1. **The host imported its stylesheets and `tsx` could not load `.css`** — the matrix died before any law ran. CSS imports belong to the route file; moved there. (Not a law.)
2. **An extending tsconfig replaces `include`**, so the C1B config silently dropped the substrate files from the automatic-JSX transform and every render law threw `React is not defined`. Include restored explicitly.
3. **Editing switched the face to sans** — visible only in the capture, invisible to the DOM laws. `RebuildAuthoredBody` uses inline `font: inherit`; the legacy host put the serif on its `<article>`. Same fix on the section. *A screenshot is still an instrument the assertions are not.*
4. **Design-canon**: `app/writers-studio/flagship/**` had no Experience Contract (C1A did not run that gate; C1B's authorization requires it). `docs/design/contracts/flagship-studio.md` authored; the gate passes with two contracts covering the change.

## 8. Routed out (⛔ no lane opened, ⛔ none repaired)

- **R-1** `npm run check:sovereignty` → `scripts/check-maia-sovereignty.ts` does not exist (same class as the `verify-colab-boundaries.ts` name in CLAUDE.md). `ci:sovereignty` is the gate that actually runs, and passed.
- **R-2** `app/writers-studio/__tests__/workbenchUsability.test.ts` has two failures **at HEAD before C1B** (review progressive-lens assertions), unrelated to this act; confirmed pre-existing.
- **R-3** `scripts/witness/flagship/fixtures.tsx:201` carries a real type error (`'themes'` not a lens id); pre-existing; kept outside the strict programs by the runtime fixture load.
- **R-4** `working_draft_revisions` is not advanced by section autosave — a substrate fact worth stating wherever "revision advances" is claimed: the draft `version` is the autosave revision.

## 9. Gates and lineage

| Gate | Result |
|---|---|
| `matrix:ws-flagship` | 13/13 · 8/8 |
| `matrix:ws-flagship-c1a` (golden intact after chrome changes) | 9/9 · 8/8 |
| `matrix:ws-flagship-c1b` | 10/10 · 9/9 · lethal |
| controlled browser witness `render.tsx` | identical to pre-C1A baseline: result file + 44/44 captures byte-identical |
| `typecheck:ws-flagship` · `-c1a` · `-c1b` | exit 0 · PASS · PASS (named allowances: studioTheme 24; c1b adds workingDraftClient 3, canvasIdentity 1, useLivingWorks 1, workContext 1 — all pre-existing, all reached through the host's real imports) |
| `npm run typecheck` (ship) | 226 vs baseline 239 · 0 regressions |
| `check:design-canon` | ✅ 2 contracts cover the change |
| `ci:sovereignty` · `check:no-openai` · `check:no-supabase` | ✅ |
| S1 `matrix:ws-sanctuary-keep` | 27/27 |
| live walk legacy (baseline) / flagship (candidate) | substrate green / 22/22 |

Lineage is recorded in the commit messages of this act (baseline walk → mount + suite → record).

## 10. Attestation

- population: exactly §2 · schema: none · migrations: none · production: untouched · S1 files: untouched · authority files: blob-identical to canonical (L10)
- disposable shadow (`initdb`, 441 migrations applied / 56 refused as in prior witnesses) and the `next dev` server were destroyed after the walk.
- **Next act: founder adjudication of C1B.** The next convergence act is separately governed. ⛔ C1B STOPS HERE.
