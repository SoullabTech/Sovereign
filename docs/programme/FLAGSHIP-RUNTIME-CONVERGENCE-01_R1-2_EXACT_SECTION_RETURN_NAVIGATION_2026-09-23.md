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

---

## 10. Founder adjudication (R1-2A — record addendum only, 2026-09-23)

**Custody note.** Everything above this rule was written at `829a3e225` and ends at "STOPPED for founder adjudication"; it is preserved as written. This section is added by `R1-2A` (*R1-2 FOUNDER ADJUDICATION RECORD ADDENDUM ONLY*) and lands in a later commit that is **documentation custody, ⛔ not semantic or product authority**. The semantic authority of R1-2 is `829a3e225`; the governing freeze is FS3 @ `9682dda96`. R1-2A mutates this one file and nothing else: no product code, no test law, no freeze mutation, no new witness, no R2, production untouched.

### 10.1 Disposition

`FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-2` — **PASS · CLOSED ON CANDIDATE @ `829a3e225`**. FS3 establishment commit `9682dda96` accepted as the governing post-R1-2 flagship freeze. The adjudication accepts the submitted repository/container evidence; it is not an independent re-execution of the gates.

```text
FS1        CLOSED · historical pre-Review-navigation freeze
FS2        CLOSED · historical pre-return-navigation freeze
FS3        ESTABLISHED · GOVERNING @ 9682dda96

R1-0       CLOSED
R1-1A      CLOSED
R1-1B      CLOSED @ 1fcf1ad0a
R1-1C      CLOSED @ e9f7ffcb5
R1-2       PASS · CLOSED @ 829a3e225

production UNTOUCHED
```

### 10.2 Laws established

- **Capability succession**: `READ_ONLY_REVIEW_CAPABILITIES.navigate` `false → true`; `askMaia · discuss · explore · commission · acknowledgeStale · ownObservation · facet` remain `false`. R1-2 spends exactly one capability. No cognition authority and no member-write authority enter with navigation.
- **Return-address law**: mounted Review → exact durable section identity → remove `reading=<id>` + preserve `m=<work>` + set `s=<exact sectionId>` → plain Write. Section-level only. No `passage= · range= · start= · end= · selection= · highlight=` or equivalent vocabulary. No held passage, no highlight, no member gesture inferred because navigation occurred. The durable section address remains the authority.

### 10.3 Ruling — coverage control without section identity

The coverage condition is lawful and accepted. The census established the coverage control carries the literal `coverage`, not a section identity. **Coverage navigation must remain absent under R1-2.** This is successful enforcement of the address law, not a failure to implement an authorized capability. No nearest, current, first, derived or semantic section may be substituted. The authorization's broader expectation that coverage might participate is superseded by the substrate fact that it has no lawful R1-2 address. No new capability axis is required.

### 10.4 Ruling — continuity map not populated by the real mapper

Accepted. The R1-0 real-reading mapper produces no live continuity-map population, so a live witness cannot truthfully exercise a map cell. The governing law stands: an addressed map cell may navigate only by its exact durable section identity. Presentation-level constitutional proof is sufficient for the presently unpopulated surface. ⛔ Do not manufacture map data to satisfy a witness. ⛔ Do not modify R1-0 to produce a map under R1-2. If a future governed act populates cells from real readings, FS3 already binds the condition they must obey.

```text
real map population absent   ≠   navigation failure
fabricated map population    =   forbidden
```

### 10.5 Live navigation evidence accepted

Finding return uses the durable return section; the context-foot return uses its exact section identity; coverage navigation is absent; map navigation is protected but not fabricated; entering Write removes `reading`, `m` is the same Work, `s` is the exact target, plain Write mounts; browser Back returns naturally to the previous Review; member-state digest byte-identical; provider hits 0. The substance of R1-2: *Review observation → Go to passage → the actual manuscript section*, never *→ the system guesses where it probably belongs*.

### 10.6 Ruling — R1-1C-L15 additional succession

Accepted as a **necessary freeze-custody succession, not an ungoverned product-capability widening**. The predecessor law literally described FS2 as superseding FS1 through the manifest's predecessor field; once FS3 → FS2 → FS1 was authorized, that two-generation assertion could not remain current without making lawful FS3 succession impossible. Accepted pattern: exact predecessor law witnessed → reason recorded → freeze authority generalized to a custody chain. The R1-1C law file was already in the governed succession population; no unrelated file population was opened; no R1-1C product authority changed. **No separate R1-1C repair or reopening is required.** Constitutional maintenance required by the authorized FS2 → FS3 transition.

### 10.7 FS3 accepted

102 frozen artifacts · 4 explicit supersessions · FS3 → FS2 → FS1 with predecessor custody preserved by digest · verifier lethal in four directions. Governing principle: *historical freeze remains reconstructible + successor freeze names what changed + reason is explicit + current law becomes independently frozen* — not permanent immutability of every historical assertion. FS1 and FS2 remain historical authorities; FS3 is the current flagship authority.

### 10.8 Ruling — duplicate R1-1B loader pass on browser Back

Accepted as inherited runtime behaviour and **non-blocking technical debt**. The R1-2 invariants hold: exact Review URL restored, exact reading identity restored, member-scoped reads only, no fallback, no write, no cognition, generation guard intact. The extra GET arises because Back changes both `s` and `reading` and the inherited host/context dependencies run the read-only loader again; it predates R1-2 and is not an R1-2 regression. Correcting the witness from *exactly two GETs* to *only lawful ledger/detail GET shapes for the exact selected reading* is accepted — the former was an instrument overconstraint, not product law.

**Carried technical debt, named**: *Redundant read-only re-fetch on Review restoration via browser Back.* It may later be optimized; ⛔ no future act may silently alter it while spending unrelated authority. It does not block R1-2 closure.

### 10.9 Ruling — branch-scope design-contract coverage

The contract additions for `LiveReviewView.tsx` and `reviewReturn.ts` are accepted as **contract coverage completion, not a new design-law succession**. The branch-scope gate correctly found `LiveReviewView.tsx` had existed since R1-1B without being named in the flagship Experience Contract's `surfaces:`; `reviewReturn.ts` belongs to the same surface. Accepted on the condition that no unrelated Experience Contract semantics changed (none did). This does not reopen R1-1B or R1-1C. Classification: *design-canon coverage debt discovered and closed during R1-2*, not evidence that earlier runtime authority was invalid.

### 10.10 Frozen-law successions accepted

- **R1-1B-L18**: from *navigation control absent because navigate=false* to *navigate=true + navigation controls lawful only where exact durable addresses exist + all other forbidden controls remain absent*.
- **R1-1C-L11**: from *all read-only capability axes false* to *navigate=true, all other axes false*.
- **R1-1C-L15**: the freeze-chain succession ruled in §10.6.

No historical law was silently rewritten.

### 10.11 Inherited diagnostics

The 17 C1B/C1C1 strict diagnostics (`readState.ts` 7 · `draftSections.ts` 10) remain **inherited baseline debt**, not R1-2 regressions, outside this act. ⛔ Do not opportunistically repair them under a later unrelated capability act.

### 10.12 Evidence accepted

```text
R1-2 laws                     18/18
R1-2 defeat candidates        16/16 dead
matrix                        LETHAL
runtime walk                  11/11
member-state digest           byte-identical
provider/model hits           0
unauthorized writes           0
all nine inherited matrices   LETHAL
FS3                           INTACT · verifier lethal in four directions
R1-2 strict typecheck         PASS
ship typecheck                no regression
design-canon · ci:sovereignty · no-supabase · no-openai · git diff --check   GREEN
```

No contradictory evidence reported.

### 10.13 Product standing after R1-2

```text
WRITE → REVIEW → (explicit durable reading) → FINDING → (exact durable section identity) → WRITE AT SOURCE SECTION
```

Two orientation questions are now answerable without cognition: *Which reading am I looking at?* (chosen by the writer) · *Where in my manuscript does this belong?* (named by the durable reading address). MAIA decides neither at navigation time. `R1-2` is CLOSED. No further Review capability is implied.

### 10.14 R2 remains unopened — the questions carried

No authority is conferred for Discuss, Ask MAIA, finding-bound or passage-bound cognition, thread creation, commissioning, member observations, Keeps, standing changes, rereading, or a fresh developmental reading.

**Open founder architecture question before any R2 implementation act — the epistemic object of Review Discuss**:

```text
C1C1:  held manuscript passage                              → passage-bound discussion
R2 candidate:  durable Review finding + exact manuscript passage → finding-grounded discussion
```

⛔ Not to be treated silently as the same cognition object. The founder's stated hypothesis (roadmap, same day): *Review Discuss is not merely passage-bound; its epistemic object is the durable Review finding together with the exact manuscript passage to which that finding returns* (Option B). The next clean boundary is a separately named `R2-0 — REVIEW DISCUSS EPISTEMIC-OBJECT CONSTITUTION`, ⛔ not implementation of Discuss.

Substrate inputs raised for R2-0 (raised, ⛔ not answered, ⛔ not ruled):

1. **Time is a third component.** A finding's evidence is frozen at a revision (`readState`: revision number, code-point range, digest) while the passage it returns to may have been edited since; R1-0 separates `recoverEvidence` (historical, digest-verified) from `locateCurrent` (three-state, never fuzzy) and C1C1 already discloses staleness rather than re-anchoring. A discussion turn must say whether it discusses the passage as read or as it now is; collapsing the two is how a discussion silently becomes a reread.
2. **Address law gates R3.** Observations carry a minted `observation_id` and a read-local `(readingId, observationKey)`; `OBSERVATION-ADDRESS-01` rules that member actions addressed to `observation_id` may not be created until that lane closes, and existing standing custody stays on the older address. R2 threads bound to a finding must name their binding address explicitly; R3 (writer response) is exactly the gated member action.
3. **The C1C1 seam is disclosure-governed and never writes the Work** (`askRouteEffectFamily`: conversation · authority · posture · crossing only; eleven Work tables asserted disjoint; body reads pass through the S3 authorization-act claim). A finding-grounded Discuss adds a new cognition input class — MAIA's own prior output — and whether that is a disclosure crossing or provenance is a governance question, not plumbing. The sharpest reason R2-0 precedes R2-1.
4. **R3 has an unratified law waiting**: the disagreement law (*evidence revises the reading, does not delete it, does not automatically win*) is carried in the convergence charter as ⛔ NOT ratified; R3's utterances are exactly the acts it governs.

Founder's recommended sequence after R1-2A, recorded as roadmap and ⛔ not as authorization: R2-0 (epistemic-object constitution) → R2-1 (pure finding-grounded Discuss contract: selected durable finding + exact current passage + reading identity/provenance → one bounded turn; prohibiting reread, fresh assessment, hidden aggregation, mutation of the original finding) → R2-2 (live runtime, `discuss` only) → R3 (writer response / own observation — the first true member-write act) → R4 (Keep / continuity) → R5 (new-reading / reread commissioning) → later, broader Ask MAIA / Explore.

**Standing after R1-2A: R1-2 PASS · CLOSED @ `829a3e225` · FS3 GOVERNING @ `9682dda96` · R2 ⛔ NOT OPEN · production UNTOUCHED · STOPPED.**
