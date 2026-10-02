# WRITERS-STUDIO-NEXT-01 · A1 — MANUSCRIPT CANVAS COMPOSITION CENSUS · 2026-09-22

**Status:** CENSUS · READ-ONLY · DOCUMENTARY ONLY · ⛔ NO IMPLEMENTATION
**Opened by:** founder act, 2026-09-22 — *census only, implementation not authorized*
**Canonical:** `9da7195ef28e37652d2b22b300121719326f3953`
**Governing framing:** ⭐ **compose before author**

> ⛔ **This census proposes; it does not build.** No `app/`, `lib/`, `tests/`, schema, route or UI file is changed by this act.

---

## I. Headline

⭐⭐ **A1 is overwhelmingly a COMPOSITION and RESOLUTION problem, ⛔ not an authoring problem.** The manuscript-first surface largely exists — **twice**, in two independently evolved rooms, plus a third developmental room. What is missing is not a Canvas. What is missing is **one room**.

⚠️⚠️ **THE SINGLE MOST IMPORTANT FINDING, and it is a naming defect with member-facing consequences:**

```
studioMap.ts:142    export const CANVAS_HREF = '/writers-studio/rebuild';
```

The constant named `CANVAS_HREF` **does not point at the Canvas.** The Studio map's `Manuscript` destination (`:187`) and the `Write` mode (`:519`) both resolve to **`/writers-studio/rebuild`**. So:

- **`/writers-studio/rebuild`** — `RebuildStudioClient`, **2,019 lines** — is the room members actually enter.
- **`/writers-studio/canvas`** — `CanvasClient`, **1,507 lines**, whose own header calls it *"THE WRITER'S STUDIO — the persistent shell"* — is **reachable only by typing the URL**. Nothing in the map links to it.

⭐ *The room that calls itself the persistent shell is not the room the member walks into, and the constant that would tell you so says the opposite.*

## II. Inventory

`app/writers-studio/**` — **126 files · ~29,360 lines**, of which **39 are test files**. Routes under `app/api/writers-studio/**` — **12**.

The five largest surfaces:

| Surface | Lines | Reachable at | What it is |
| --- | --- | --- | --- |
| `rebuild/RebuildStudioClient.tsx` | 2,019 | **`/writers-studio/rebuild`** ← the live room | Carries the entire C5/C6 editorial convergence |
| `canvas/CanvasClient.tsx` | 1,507 | `/writers-studio/canvas` (unlinked) | The WS2-03B shell: mode bar, rail, outline, measured writing field, MAIA column, materials, lower band |
| `canvas/StructureReview.tsx` | 1,479 | `/writers-studio/review` | Structure proposal review |
| `develop/DevelopRoom.tsx` | 1,381 | `/writers-studio/develop` | *"the manuscript seen developmentally"* |
| `HomeView.tsx` | 1,284 | `/writers-studio` | Home / Work list |

## III. The composition problem, stated exactly

**Each room holds something the other lacks, and neither is a superset.**

**`rebuild/` holds the editorial intelligence.** Its imports are the census in miniature: `GoldLine` · `MaiaListen` · `InlineWorkspace` · `ManuscriptPassage` · `RevisionDesk` · `EditingLatitude` · `editorialDiff` (`editorialSegments`, `editIds`, `composeSelected`) · `editorialDepth` (GUIDED · LEARNING · DIRECT) · `insightCanvas` · `chapterReview` · `editorialCollaboration` (thread, turn, adoption, undo) · `placeInWork` (`locationForSection`, `replacePlaceAddress`, `SECTION_PARAM`) · `focus/studioFocus` · `structureClient`.

**`canvas/` holds the room geometry.** Its header documents what it deliberately removed and added: *gone* the drawer spine and the one-drawer-at-a-time rule that *"made the manuscript share the room with a 288px accordion"*; *gone* the folded 40px MAIA strip; *new* the five-mode bar, sixteen-destination shell rail, standing outline column, **the writing field at its MEASURED share**, MAIA as a column, materials, lower band.

⭐ **That last item is directly load-bearing for E1.** `canvas/` states the rule as law: *"the writing field is an explicit width, never a `flex: 1` remainder. That was the WS2-02B defect and it is the one failure mode this layout is built to make impossible."*

⚠️⚠️ **So the A2/A3 substrate lives in the room that lacks the geometry, and the geometry lives in the room no one enters.** That is the composition A1 exists to resolve, and it is why A1 must not begin by authoring a third room — ⛔ *a third room would make the problem worse by exactly one room.*

## IV. NEXT A0 · E1–E10 — present state

| Law | State | Evidence |
| --- | --- | --- |
| **E1** manuscript primacy is structural | ⚠️ **PARTIAL, and split** | `canvas/` enforces the measured-share rule as law; the live room `rebuild/` is not known to carry it. **Owed: a width audit of the live room.** |
| **E2** one conversation, many scopes | ⚠️ **PARTIAL** | `rebuild/` has one bound editorial thread + `chapterReview` across a chapter span; whole-Work scope has no surface. `develop/` is a separate room with its own dialogue. |
| **E3** nothing changes without an authored act | ✅ **SATISFIED** | The adoption seam, the proposal chain, and the C6R2 gates (`adoption calls the guard before authorizing`, `refusal is whole`) are canonical and gate-tested. |
| **E4** legible · reversible · **attributed** | ⚠️ **SPLIT** | Legible + reversible: ✅ `editorialDiff` word-level segments, `RevisionDesk`, `editorial/undo` route, `editorial/version`. **Attribution: ⛔ the E4 NEW clause is the open one** — C6R2-11 distinguishes *member-authored subset* from *MAIA proposal adopted whole*, which is a start, ⛔ not the durable writer-vs-MAIA provenance E4 requires. **Owed: a provenance audit.** |
| **E5** no dead end, no loss of place | ✅ **MOSTLY** | `lib/writersStudio/placeInWork.ts` (106 lines) — `SECTION_PARAM` · `resolveInitialSection` · `locationForSection` · `replacePlaceAddress` · `STUDIO_PLACE_CHANGE_EVENT`; `placeCrumb.ts` (45) — `backToManuscriptHref` · `placeLine`. ⚠️ Adoption across rooms unverified. |
| **E6** MAIA carries complexity | ⚠️ **CONTESTED** | `chapterReview` commissions seven lenses on one gesture — good. But the live room exposes **depth choice, lens vocabulary, structure panels and review manifests**. **Owed: a machinery-exposure audit against E6's narrowed text.** |
| **E7** facet changes explanation, never authorship | ✅ **GATED** | `C6R4-1 authorship-is-depth-invariant` PASS; `editorialDepth.ts` is directive-only. |
| **E8** the map is honest | ✅ **ENFORCED** | `assertStudioMapHonest()` — `later` ⇔ no `href`, both directions, and `later` destinations are **dropped** at the render boundary. |
| **E9** teaching describes technique | ⭐ **UNKNOWN — REQUIRES HUMAN WITNESS** | Carried unchanged from FACETS-01 §X. ⛔ Not mechanically testable. |
| **E10** reduces its own centrality | ⛔ **UNMEASURED** | No instrument exists. Properly an A9 question. |

## V. Inherited Convergence obligations (A0 §VIII mapping)

| Inherited step | Present state |
| --- | --- |
| **Step 2 — Work-primary composition** | ⚠️ **THE OPEN OBLIGATION.** Two rooms, split as §III describes. This is A1's actual work. |
| **Step 3 — place / breadcrumb / back-to-manuscript** | ✅ **SUBSTRATE EXISTS** (`placeInWork.ts`, `placeCrumb.ts`, `PlaceInWork.tsx`, `StudioMovements.tsx`). ⚠️ Coverage across all rooms unverified. |
| **Step 4 — remove the unavailable-capability shell** | ✅ **DONE AND ENFORCED.** `studioMap.ts` declares **22 destinations: 5 available, 17 `later`**, and `later` destinations are dropped rather than rendered inert. |

⛔ Steps 5–8 are A2 and later; not in this census's scope.

## VI. Duplication and competition — the disposition question

| Thing | Count | Question A1 must answer |
| --- | --- | --- |
| Rooms rendering the manuscript centrally | **3** (`rebuild`, `canvas`, `develop`) | Which is the host? |
| Manuscript writing surfaces under `canvas/` | **4** (`WritingSurface` 708 · `WholeManuscriptSurface` 439 · `SectionWritingSurface` 267 · `Worktable` 596) | Which are reachable from the live room? |
| Editorial conversation components | **2** (`canvas/EditorialConversation` 764 · `rebuild` via `InlineWorkspace`) | Which is the one conversation of E2? |
| Outline components | **2** (`ManuscriptOutline` · `StructuredOutline` 537) | Duplicate or different jobs? |

⚠️ **This census does NOT propose retiring anything.** Retirement is a surface act and is outside the authorization. It names the contested pairs so the disposition can be ruled.

## VII. What is genuinely missing

1. ⭐ **One room.** Not a new one — a ruling on which existing room hosts, and what composes into it.
2. ⭐ **E4 authorship provenance.** A durable record of how much of a given passage MAIA authored. C6R2-11 distinguishes adoption *paths*; it does not carry provenance forward on the text.
3. **Whole-Work conversational scope** (E2). Today's largest scope is a chapter span via `chapterReview`. ⚠️ This is properly `EDITORIAL-READING-01`'s to supply and composes in at **NEXT A4** — ⛔ A1 must not build it.
4. **A machinery-exposure reckoning** (E6) — which of depth, lens, structure and manifest controls the writer should never have to operate.
5. **`CANVAS_HREF`'s name.** ⛔ Not cosmetic: it is the single identifier most likely to mislead the next reader about which room is live.

## VIII. Proposed minimal A1 implementation boundary — ⛔ FOR SEPARATE ADJUDICATION

⭐ **Recommendation: A1 should be a RULING plus the smallest composition that proves it, ⛔ not a build.**

```text
A1a  FOUNDER RULING — which room is the host
       rebuild/ (has the intelligence, is the live room)
       or canvas/ (has the geometry, is unreachable)
       ⭐ recommended: rebuild/ hosts; canvas/'s measured-share
         geometry composes INTO it. The live room keeps its address.

A1b  Compose the measured writing-field geometry into the host room.
       One law moves: the writing field is an explicit width,
       never a flex remainder. ⛔ No new component.

A1c  Verify Step 3 place continuity across every reachable room
       against the existing placeInWork/placeCrumb substrate.
       Repair gaps; ⛔ add no new place mechanism.

A1d  Rename CANVAS_HREF to name the room it reaches.
       ⛔ No behaviour change; one identifier.

A1e  Falsifiers first, per S3 Class-B discipline:
       author the E1/E5 conformance tests and a deliberately
       wrong candidate for each BEFORE the composition lands.
```

⛔ **Explicitly NOT in the proposed boundary:** a new Canvas surface · retirement of any room · whole-Work scope · Editorial Reading composition · E4 provenance implementation (its own act, once audited) · E6 machinery reduction (needs the audit first) · any schema, route or migration.

## IX. Owed before A1b can be specified

Three audits this census names but does not perform, each read-only:

1. **E1 width audit** of the live room — does `rebuild/` allocate the writing field an explicit share, or a `flex: 1` remainder?
2. **E4 provenance audit** — what, if anything, durably records MAIA-authored versus writer-authored prose after adoption.
3. **E6 machinery audit** — the exact list of controls the live room asks the writer to operate.

## X. Standing

> **`WRITERS-STUDIO-NEXT-01 / A1` · CENSUS COMPLETE · ⭐ COMPOSITION CONFIRMED OVER AUTHORING · ⚠️ HOST-ROOM RULING OWED · ⛔ IMPLEMENTATION NOT AUTHORIZED · ⛔ NOTHING RETIRED · ⛔ A2 SHUT · PRODUCTION UNTOUCHED**
