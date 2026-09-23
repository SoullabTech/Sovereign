# FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-2 — Exact Review → Manuscript Section Navigation + Governed Re-freeze (FS3)

**Date**: 2026-09-23
**Act**: R1-2 (founder-authorized after R1-1C PASS · CLOSED @ `e9f7ffcb5`)
**Starting head**: `e9f7ffcb5` on `fix/flagship-ec1-contract-reconciliation-20260923` · **FS2** `a1a2ead79` (manifest sha256 `d7421b38…`) · **carried semantic authority** `1fcf1ad0a` (R1-1B, unchanged)
**Lineage**: suite `588d83e45` (RED on `e9f7ffcb5`) → implementation + successions + witness `464bb5d43` → FS3 freeze `9682dda96` → this record
**Authority**: a mounted Review finding returns the member to the manuscript at the exact durable section its evidence names — `returnTo.sectionId` → `locationForWrite` (`reading` removed, `m` kept) → `locationForSection` (`s=<exact id>`) → the unchanged Write runtime. ⛔ Only `navigate` moved (false → true) · no other capability changed · no new URL vocabulary · no held passage, selection, highlight, trail or banner · no member write · no cognition · no reading API, mapper, schema, C1C1 Discuss, provider or deployment change · no deploy · no flag. ⛔ STOPPED for founder adjudication. R2 (Discuss seam) NOT answered, NOT prototyped.

## 0. Standing at the top

- **The address is the durable identity and nothing else.** `returnTargetFor(address, ctx)` answers `section` only when the address is itself a section of the mounted context (R1-1B `bindContext` already guarantees this for every mounted finding); everything else is `unaddressable`, and an unaddressable control is **absent, never a guess**. Hints (focus, index, text) are accepted by the signature only so an unlawful resolver can be built and killed (D1–D4); the reference never reads them.
- **One capability, three control classes, lawful absences named.** `navigate: true` in `READ_ONLY_REVIEW_CAPABILITIES`; every other capability still `false` (R1-2-L1; R1-1C-L11 successor). Finding row → `<a data-return-to href>` for the finding's own section. Context-pane foot → the same anchor for the selected finding's exact section (never the highlight stand-in, never "full manuscript"). Map cells → anchors only for cells whose `addressOf[i].sectionId` is present in context. The coverage line carries no section identity (`Coverage {read,total,depth,when}`; its control literal is `coverage`), previous-reading targets a reading not a section, so both are **absent under live navigation** — no derived target (R1-2-L11, W2).
- **The return is a location.** `returnGesture` composes the href through the two existing composers and calls the host's `go` (the same `router.push` R1-1C uses); it holds nothing, writes nothing, commissions nothing (R1-2-L8; D8/D9/D10 dead). Plain Write mounts at `s=<exact id>` with `keys = m,s` and no reading GET (W1, W1b, W8). Browser Back restores the prior exact Review URL and reading identity through ordinary history (W4).
- **Suite first**: reference 0 runtime laws mounted on `e9f7ffcb5` (navigate=false; no return module), D1–D16 dying on their named laws. After the act: **18/18 · 16/16 dead · LETHAL + DISCRIMINATING**. Two laws (L13, L17) stayed RED until FS3 by construction.
- **Live runtime witness 11/11** (§5): 2 return anchors, both to the exact section; forbidden controls 0; W1/W1b/W8 arrivals lawful; W4 Back lawful; W2 coverage lawfully absent; W3 map **NOT WITNESSABLE live** (recorded as a result, not a pass); member digest byte-identical; provider hits 0; non-GET requests 0.
- ⚠️ **Two findings surfaced by the instruments, both recorded rather than absorbed** (§7): the R1-1B loader runs twice on Back (inherited, routed out); and R1-1C-L15 pinned the FS2 *shape*, forbidding any successor freeze literally — succeeded explicitly within the already-superseded file.
- **FS3 established** (§6): 102 frozen · 95 FS2 files accounted for · 4 explicitly superseded · FS2 preserved byte-for-byte and pinned · FS1 still preserved and named by FS2 (chain custody) · verifier proven lethal four ways.

## 1. Successor laws and the predecessors they succeed

| Predecessor (FS2-frozen, read from `git show e9f7ffcb5:…` at every run) | What it pinned | Successor | Reason the law existed, preserved |
|---|---|---|---|
| **R1-1B-L18** `read-only-review-has-no-controls` (`flagship-r1-1b/laws.ts` `21c8c0a6` → `20e02927`) | every read-only capability false, so `FORBIDDEN_CONTROLS` also named `data-return-to` | non-navigation controls stay forbidden; `returnControls === 0` when no navigation is supplied; predecessor witnessed by `'data-return-to=\|fs-cell'` in the historical blob | read-only Review draws no control that lacks a lawful action — return controls now carry one |
| **R1-1C-L11** `read-only-capabilities-unchanged` (`flagship-r1-1c/laws.ts` `c7f2aef2` → `c6db6f40`) | `expected.every(k => caps[k] === false)` | `navigate === true` and `askMaia · discuss · explore · commission · acknowledgeStale · ownObservation · facet` all `false`, no other key | R1-2 moves exactly one capability; the rest is asserted, not assumed |
| **R1-1C-L15** `refreeze-carries-governing-laws` (same file) | `supersedes.manifest_sha256 === FS1` and `/FS2/.test(act)` — the FS2 **shape** | FS3 supersedes FS2 by digest at its preserved address; FS1 preserved at its digest; every FS2 file re-frozen or superseded (`fs2_blob`); R1-2 laws frozen; verifier pinned; predecessor text witnessed | the freeze carries every governing law and custodies the manifest it succeeds — the literal FS2 pin would have forbidden FS3 itself (§7.2) |
| **R1-1B walk** · **R1-1C walk** (`7cfef32a` → `d6792e2a` · `bda474fa` → `4ceb3467`) | `FORBIDDEN` lines named `data-return-to=` | only that token removed; every other forbidden control and every check unchanged | the live Review must not carry unlawful controls — the exact-address anchor is now lawful |

R1-2-L12 asserts both predecessor blobs still contain their predecessor assertions and both files carry `R1-2 SUCCESSION` markers; D15 (silent rewrite) dies on it. R1-2-L13 asserts the FS3 manifest names both files superseded with successors; D16 dies on it.

## 2. Return law, as data (`app/writers-studio/rebuild/reviewReturn.ts`, pure)

- `returnTargetFor(address, ctx, _hints)` → `{kind:'section', sectionId}` iff `address` ∈ `ctx.paragraphs[].id`, else `{kind:'unaddressable'}` (L2 · L3 · L4 · L5).
- `locationForReturn(loc, id)` = `locationForWrite(pathname, search)` then `locationForSection(…, id)` — the R1-1C composer and the WS2-05A composer, no third (L6; D5 reading-preserved and D6 work-dropped dead). Static scan for `passage|range|start|end|selection|highlight` as URL parameters is empty (L7; D7 dead).
- `returnGesture(id, loc, act)` → `act.go(href)`; returns `{kind:'navigate', href}` (L8).
- `navigationFor(view, loc, act)` → `{hrefFor(id): string|null; onGo(id, href)}` over ONE mounted view's context — the host supplies it only for `review.kind === 'ready'`, through the same `go` (`FlagshipWriteHost.tsx`, +9/−2).
- Presentation (`DevelopReview.tsx` · `ReviewPanels.tsx` · `DevelopViews.tsx` · `LiveReviewView.tsx`): `ReviewNavigation` is an optional prop; without it the controlled rendering is **byte-identical** to the R1-1A goldens (L14: 4/4) and `LiveReviewView` withholds `navigate` (so the R1-1B walk's zero-control census still holds where no navigation is supplied). With it, anchors render only where an exact address is present (L9 · L10 · L15; D12 finding-only, D13 map-guess, D14 coverage-guess dead). Copy carries no identifier (L18). Accepted golden `flagship-r1-2/golden/review-ready-navigable.html` (L16).

## 3. What was NOT built, and why each absence is lawful

- **Coverage-line return** — no section identity exists on the coverage object; a derived target would be a guess. Absent (W2 `coverageControls=0`, `coverageLine=1`).
- **Previous-reading return** — targets a reading, not a section. Absent under live navigation.
- **Full-manuscript / highlight stand-in foot control** — the R1-1A controlled foot uses `paragraphs[1]` as a stand-in; live foot anchors only to the selected finding's exact section. "Open the full manuscript" absent live (W7 census).
- **Map-cell return, live** — the R1-0 mapper builds no continuity map for real readings (0 cells), so it is **NOT WITNESSABLE live** (W3). The cell law is proved at presentation level (L9/L10 over `withMap`), ⛔ not claimed live.

## 4. Matrix (`npm run matrix:ws-flagship-r1-2`)

Reference 18/18. D1 positional → L2 · D2 nearest → L3 · D3 focus → L4 · D4 semantic → L5 · D5 → L6 · D6 → L6 · D7 → L7 · D8/D9/D10 → L8 · D11 → L1 · D12 → L9 · D13 → L10 · D14 → L11 · D15 → L12 · D16 → L13. Classified collateral, each irreducible: D1/D3/D4 also fail L3 (a resolver that guesses is by construction one that returns something for an unaddressable input); D7 also fails L6 (a new parameter is a different location); D11 also fails L15 (a widened capability draws a forbidden control); D12 also fails L10 (withholding navigation from the map makes every cell a span); D13/D14 also fail L15 (a guessed target is a forbidden control). Typecheck `npm run typecheck:ws-flagship-r1-2` (strict + `noUncheckedIndexedAccess`, BASE `e9f7ffcb5`): PASS.

## 5. Live runtime witness (⚠️ candidate evidence · ⛔ not production · ⛔ not a member walk)

`npm run witness:flagship-r1-2` → `scripts/witness/flagship/r1-2-live-return-walk.ts`, against a disposable PostgreSQL 16 shadow (446 migrations applied / 51 refused, nothing shared with production), a real `next dev` at `/writers-studio/rebuild` with a real authenticated session, `ANTHROPIC_BASE_URL` pointed at a counting stub. One member, one Work (`d1`, `d2`), one frozen reading whose single finding returns to `d2`, opened at `d1`. **11 passed · 0 failed.**

| Check | Result |
|---|---|
| W7 census in mounted Review | 2 anchors, both `data-return-to=<d2>` (finding row, context foot) · forbidden controls 0 · no Ask MAIA / What MAIA read / Open the full manuscript |
| W1 href law | `/writers-studio/rebuild?m=<A>&s=<d2>` · no `reading=` · no new vocabulary |
| W1 finding return | `keys=m,s` · `reading=null` · 2 bodies · Review 0 · held 0 · focused body `<d2>` · reading GETs 0 · no trail/banner |
| W4 browser Back | URL `m=<A>&s=<d1>&reading=<current>` · `data-review-reading=<current>` · traffic since Back = ledger GET then `<current>` reading GET only, no other identity, no non-GET · `loaderPasses=2` (§7.1) |
| W1b context foot | identical law to W1 |
| W2 coverage | lawfully absent |
| W3 map | NOT WITNESSABLE live (0 cells) |
| W8 mobile 390 | same 2 anchors · arrival `s=<d2>` |
| W5 member-scoped digest | byte-identical before and after the whole cycle |
| W6 provider / mutation | providerHits 0 · non-GET 0 |

Captures: `docs/design/contracts/screenshots/flagship-r1-2/` (review with return · arrived Write · mobile pair). Screenshots carry no member identifier.

## 6. Governed re-freeze — FS3 (`npm run verify:flagship-freeze`)

- `FLAGSHIP_FREEZE_FS2.json`: the FS2 manifest preserved verbatim, sha256 `d7421b38c1fd…`, pinned in the verifier.
- `FLAGSHIP_FREEZE.json` → FS3 (sha256 `cdc74d8b82af…`, pinned): **102 frozen** · 95 FS2 files accounted for · **4 superseded** (`fs2_blob` → `fs3_blob`, successor, reason — §1) · new: R1-2 laws · candidates · matrix · golden · walk · tsconfig · typecheck runner.
- Deliberately not frozen, each with a reason: R1-1A candidate seams (R1-1A-L9), the capture tools (incl. `flagship-r1-2/captureGolden.tsx`), the preserved FS1/FS2 manifests (pinned by digest, not blob), the verifier itself (it pins the manifest; freezing it by the manifest it verifies is circular).
- Verifier generalized to **chain custody**: the immediate predecessor (FS2) is custodied file-by-file; every earlier ancestor (FS1) must stay preserved at its own digest and be named by the next manifest. Proven lethal: frozen file appended → exit 1 · FS2 preserved tampered → 1 · FS1 removed → 1 ("chain shortened") · manifest edited → 1 (pin mismatch, `cdc74d8b` vs `c5d108a7`) · all restored → 0.

## 7. Findings surfaced, recorded, not absorbed

**7.1 The R1-1B loader runs twice on Back (inherited, routed out).** Back restores `s=<d1>` and `reading=<current>` in one popstate. The Write host's `load()` depends on `requestedSection`, so it re-fetches the manuscript context; the R1-1B Review effect keys on `context` **identity** (`[requestedReading, context]`), so the same reading is commissioned once more and the generation guard attaches only the latest. Observed: ledger, ledger, `<current>`, `<current>`. Idempotent read-only GETs; no write; no cognition; not a law violation. ⛔ Not repaired: the host's load law and the R1-1B effect are outside R1-2's population. The W4 instrument first asserted "exactly two GETs" — an instrument over-strictness, corrected to assert the law (only ledger→`<current>` shapes, no other identity, no non-GET) and to *record* `loaderPasses`. A future act may key the effect on manuscript identity rather than context identity; that is a founder call.

**7.2 R1-1C-L15 pinned the FS2 shape.** As frozen at FS2, L15 asserted `supersedes.manifest_sha256 === FS1_MANIFEST_SHA256` and `/FS2/.test(act)`. R1-2-L13 requires `supersedes.manifest_sha256 === FS2`. Both read the same field, so no FS3 manifest could satisfy both: the FS2 text, read literally, forbade any successor freeze. The authorization named two successions (R1-1B-L18, R1-1C-L11) and the FS2→FS3 re-freeze; L15 lives in the same `flagship-r1-1c/laws.ts` already named for succession, so the **file set did not widen** — one more law in it succeeded, explicitly, with its predecessor text witnessed from `e9f7ffcb5` at every run and its reason (the freeze carries every governing law and custodies its predecessor) preserved and strengthened (FS1 preservation is now asserted too). ⚠️ Raised for adjudication as a succession wider than the two named laws, in the same class the founder accepted for R1-1C.

**7.3 Branch-scope design-canon gap (documentation, closed in the act).** `check:design-canon --branch` found `app/writers-studio/rebuild/LiveReviewView.tsx` (created in R1-1B) in no Experience Contract; earlier acts ran the gate in working-tree scope only, where a committed file is invisible. `reviewReturn.ts` and `LiveReviewView.tsx` are now named in `docs/design/contracts/flagship-studio.md` `surfaces:`. Gate green in both scopes.

## 8. Closing gates (working tree = `9682dda96` + this record)

| Gate | Result |
|---|---|
| `matrix:ws-flagship-r1-2` | 18/18 · 16/16 dead · LETHAL + DISCRIMINATING |
| inherited matrices `r1-1c` · `r1-1b` · `r1-1a` · `r1-readonly` · `c1a` · `c1b` · `c1c1` · `ws-flagship` | 19/19·15/15 · 18/18·16/16 · 12/12·11/11 · 14/14·12/12 · 9/9·8/8 · 10/10·9/9 · 19/19·16/16 · 13/13·8/8 — all LETHAL |
| strict typechecks `r1-2` · `r1-1c` · `r1-1b` · `r1-1a` · `r1-readonly` · `c1a` · `ws-flagship` | PASS |
| strict typechecks `c1b` · `c1c1` | FAIL on the same 17 inherited diagnostics (`readState.ts` 7 · `draftSections.ts` 10) present since `1fcf1ad0a` — founder-accepted baseline debt, unchanged, ⛔ not repaired |
| `verify:flagship-freeze` (FS3) | exit 0 · lethal four ways |
| frozen render witness (`render.tsx`) | exit 0 · 0 changed captures |
| `witness:flagship-r1-2` | 11/11 |
| zero-write · zero-cognition | W5 digest identical · W6 providerHits 0 · nonGet 0 · D9/D10 dead |
| `check:design-canon` (tree and `--branch`) · `ci:sovereignty` · `check:no-supabase` · `check:no-openai` · `git diff --check` | green |
| `npm run typecheck` (ship, no-regression) | 0 regressions |

## 9. Not done, by design

No passage/range/selection/highlight addressing · no held passage on arrival · no trail, banner, badge or scroll annotation · no coverage-line or previous-reading return (no lawful address) · no map return witnessed live (no substrate) · no capability other than `navigate` · no reading API, mapper, schema, cognition, member write, C1C1 Discuss, provider routing or deployment change · no repair of the inherited double loader pass (§7.1) · no repair of the 17 inherited diagnostics · no deploy · no flag · production untouched. **R2 — whether Discuss from a Review finding extends the C1C1 seam or is a separate commission — is unanswered and unprototyped.**

**Standing: R1-2 ✅ BUILT · WITNESSED · RE-FROZEN (FS3) · GATED ON CANDIDATE · ⚠️ one succession beyond the two named (R1-1C-L15, §7.2) raised for adjudication · STOPPED for founder adjudication · production untouched.**
