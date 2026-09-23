# `FLAGSHIP-RUNTIME-CONVERGENCE-01 / C0` — CURRENT HOST ↔ FLAGSHIP HOST COMPOSITION CENSUS

Authority: `JARVIS_WS_E1_ADJUDICATION_AND_F8_I0_WORK_ROOT_CENSUS_v1` §XXV (READ-ONLY).
Canonical `b23ae2d7f` · head `b7bf9a428` · tree clean · ⛔ no source, schema, migration, dependency,
fixture or production change. F8-I0's runtime claims were re-verified against the repo, not inherited.

> **The question:** what minimum host composition makes the accepted flagship a real runtime
> without replacing proven writing/editorial substrate?

---

## I. The two hosts, measured

| | Current host `/writers-studio/rebuild?m=` | Flagship candidate `app/writers-studio/flagship/**` |
|---|---|---|
| size | `RebuildStudioClient.tsx` **2,038** lines (+ `DevelopRoom.tsx` 1,381) | **1,388** lines across 5 files |
| network | 8 API surfaces (§II) | **0** `fetch` / `apiFetch` |
| state | **51** `useState` atoms | **0** — every room is a pure function of a view type |
| identity | `?m=` manuscript via `canvasIdentity`, `?s=` section via `placeInWork`, Work via `workContext` | none — receives `work: string`, `chapterTitle: string` |
| authority | Focus route (the ONLY route that may send Work context to MAIA), editorial version/undo, section save | none — `machine.ts` is reached by `WriteRoom`/`ReviewPanels` for shape only |
| evidence | E-live: it is the product members use | E4: controlled-component renders over fixtures |

⭐ The shape of the bridge is already visible in the numbers: one side has all the data and
authority and the old composition; the other has the accepted composition and no data. ⛔ Neither
is the product alone.

---

## II. What `/rebuild` OWNS and must remain canonical

| Surface | Route / module | Why it is not replaceable |
|---|---|---|
| Manuscript + draft sections | `GET /api/writers-studio/rebuild/context` → `{state: no_draft│continuous│section_aware, sections[{draftSectionId, sourceSectionId, position, heading, body, editable}]}` | the Work's words, one place, one cascade, one Sanctuary boundary |
| Writing | `RebuildAuthoredBody` → `useSectionWriting` · `sectionSaveClient` · `rebuild/model` | optimistic `version` concurrency, `stale_base` refusal (VET) |
| Work context | `workContext.ts` (derived, never stored) + `useLivingWorks` | the one prior ruling on resume; F4.3 preserved it |
| Place | `placeInWork` `?s=` grammar | the only place address the runtime has |
| MAIA disclosure | `POST /api/writers-studio/focus` — *the ONLY route that may send Work context to MAIA* | S3 lineage: one requestId, no alternate path, 404 not 403 |
| Editorial | `editorialCollaboration.ts` (`RebuildEditorialThread`), `/editorial/version`, `/editorial/undo`, `RevisionDesk` (445 lines) | proposal → version → undo lineage, receipt-whole constraint |
| Readings | `developClient.ts` → `/manuscripts/[id]/readings[/[id]][/standings]`, `requestDevelopmentalReading` | immutable `developmental_readings`, standing events |
| Chapter review | `chapterReview.ts` `ChapterReviewBundle {readingIds, payloads, findings, failures, remaining}` → `/manuscripts/[id]/chapter-reviews` | a per-chapter multi-lens run already exists |
| Insight | `insightCanvas.ts` `loadCanvasInsight(manuscriptId, readingId, observationKey)` | already joins a reading to sections by `(readingId, observationKey)` — the read-local address |
| Atmosphere | `StudioAtmosphere` (server + localStorage) | member preference, already lawful |

⭐ **Every data need of the flagship's three view types has a canonical source in this column.**
⛔ Nothing in the flagship may fetch; nothing in `/rebuild` needs to be rewritten to feed it.

---

## III. What the flagship OWNS — presentation only, by construction

`WriteRoom(ManuscriptView)` · `DevelopRoom(DevelopView)` · `ReviewRoom(ReviewView)` · `StudioChrome`
(rail, crumb, facet, mobile nav) · `ReviewPanels` (stale reading, own observation, manuscript context,
trail) · `DevelopViews` (continuity map, spiral, lenses) · `flagship.css` (the normalized token system,
V10 PASS at `f9fbb828b`).

Each is a function of a view. ⭐ That is exactly the property that makes convergence an
**adapter** problem, ⛔ not a rewrite: the accepted composition can be mounted the moment something
produces its views from §II's sources.

---

## IV. The view contracts — and where each field comes from

**`ManuscriptView`** `{work, chapterLabel, chapterTitle, epigraph?, paragraphs[{id,text,held?}], heldParagraphId?, words, wordDelta?}`
→ `rebuild/context.sections` (body → paragraphs; heading → chapter), `workContext` (work), `selectedPassage` (held). ⚠️ `epigraph` has **no substrate**; `wordDelta` needs the version diff `/editorial/version` already exposes.

**`DevelopView`** `{work, kind, pages, sections, words, observations: DevelopObservation[], map: ContinuityMapData, lenses: LensStanding[], coverage, opening: WorkOpening, structureDeclaredLabel?}`
→ readings (`fetchReadingSummaries`/`fetchReading`) for observations, lenses, coverage; `rebuild/context` for counts. ⚠️ `map` (presence across sections) and `opening` (a Work line with a factual reason) have **no producing code** — the fixtures hand-author them. ⚠️ `kind` ("Novel") is a Work fact with no column.

**`ReviewView`** `{work, kind, scope, freshness, coverage, findings, citations?, lenses[{id, availability}], map?, changed?, context{chapterLabel, chapterTitle, page, paragraphs}, selectedFindingId?}`
→ readings + `locateCurrent` for freshness/citations (VET), `rebuild/context` for context paragraphs, `ChapterReviewBundle` for a chapter's findings. ⚠️ `selectedFindingId` is a render prop with no state owner (F1 finding, still true).

---

## V. ⭐⭐ THE SHADOW OBJECT, NOW WITH ITS BRIDGE MEASURED

Flagship `DevelopObservation` `{id, domain, label, description, evidence: string[], returnTo: Address, doesNotEstablish, provenance, coverage?, crossWork}` vs persisted `ObservationRecord` `{observationId, admissionIndex, basisFingerprint, position, lens, phenomenon, evidenceRefs, observation, doesNotEstablish, …}`.

The F4 rider ruled: *the persisted admitted observation is the product truth; flagship cards must become projections of it.* C0 finds the projection is **mechanical for six of nine fields** and **blocked for three**:

| Card field | From record | Standing |
|---|---|---|
| `id` | `observationId` | ✅ — and the wire already carries it *incidentally*: `readings/[id]/route.ts:64` returns the row whole, so post-I1 readings ship `observationId`; ⚠️ `developClient.ts` never types it. **Carried, not contracted.** |
| `domain` | `lens` | ✅ (seven lenses; ⛔ no `themes`) |
| `description` | `observation` | ✅ |
| `evidence` | `evidenceRefs` → `recoverEvidence` | ✅ (digest-verified text) |
| `returnTo` | `position` / first ref | ✅ (I1 defined position; null for structural refs) |
| `doesNotEstablish` | same | ✅ |
| `label` | — | ⛔ no field; the fixture's short title has **no source** |
| `provenance` | — | ⚠️ every record is `maia-observation`; `member-declared` / `template-selected` / `textual-entity` have no substrate yet (B-I ratifies member; the other two are DEFER) |
| `coverage` / `crossWork` | reading `coverage` | ✅ |

⛔ **`label` is the one field an adapter would be tempted to generate.** Generating a title for a
MAIA observation is authoring a claim about the Work in MAIA's voice — a language-canon question,
not an adapter default.

---

## VI. Duplicate / competing runtimes

| Concept | Current runtime | Flagship | Disposition |
|---|---|---|---|
| Mode navigation | `STUDIO_MODES` = Write · Develop · **Explore** · Review · **Publish** (`studioMap.ts:518`; `assertModesHonest` pairs availability with href) | `NAV_DESTINATIONS` = Write · Develop · Review | ⚠️ two grammars. Explore/Publish are `later` previews — honest today, ⛔ but the flagship law has three modes. Convergence must retire two entries, ⛔ not restore Home. |
| Review | `/writers-studio/review` mounts `StructureReview` (structure-proposal review) | `ReviewRoom` (observations + manuscript context) | ⛔ **different products under one word.** F8-I0 §XXI stands: never route flagship Review there. |
| Develop | `/writers-studio/develop` → old `DevelopRoom` (1,381 lines, its own readings loop + `commission` state) | flagship `DevelopRoom` (pure) | the old room is a **second host**, not a component — it fetches. Convergence replaces its composition, keeps `developClient`. |
| MAIA | host: `maiaMode chapter│passage`, `PassageTab interpret│suggest│explore│ask`, `MaiaListen`, `InlineWorkspace` | flagship: `MaiaTab Discuss│Revise│Teach│Reason│What MAIA read` | ⚠️ two tab vocabularies. Flagship's is the ratified one (Language canon); the host's tabs are the old machinery names. |
| Held passage | host `selectedPassage: PassageSelection` | `machine.ts` `HOLD_PASSAGE` → `passage-held` | same concept, two state owners |
| Insight arrival | host `arrivalInsight: CanvasInsight` via `(readingId, observationKey)` | `ARRIVE_AT_PASSAGE` with `Trail` | same concept; the host already resolves by the read-local address |

---

## VII. ⭐ Minimum host composition (proposal, ⛔ not authorization)

```text
/writers-studio/rebuild?m=<id>[&s=<section>]          ← unchanged route, unchanged identity
   RebuildStudioClient  (KEEP: fetch · identity · focus · editorial · save · readings)
        │
        ├── viewAdapters/          NEW · pure · lib/writersStudio/studio/adapters/
        │     toManuscriptView(context, selectedPassage, work)
        │     toDevelopView(readings, context, work)          ⚠️ map · opening · kind: ABSENT
        │     toReviewView(readings, chapterReview, context)  ⚠️ selectedFindingId: no owner
        │     projectObservation(record) → DevelopObservation ⚠️ label · provenance kinds
        │
        └── flagship rooms         KEEP: WriteRoom · DevelopRoom · ReviewRoom · StudioChrome
              (replace: old mode bar · old MAIA tabs · old Develop composition · old Review route)
```

**Presentation-only in the candidate** (safe to mount): all five flagship files.
**Must remain canonical** (never re-implemented in the flagship): everything in §II.
**Adapter, not authority**: the adapters may *select and shape*; ⛔ they may not mint, infer, rank,
title or fabricate — every ⚠️ in §IV/§V is a field the adapter must leave **absent** until its
substrate exists, and the room must render the absence honestly (`LensAvailability` already models
`not-read`; `WorkOpening` needs an absent state it does not yet have).

---

## VIII. What convergence must NOT do

- ⛔ move a fetch into a flagship component;
- ⛔ resurrect `Home`, `Explore` or `Publish` as flagship modes because `STUDIO_MODES` lists them;
- ⛔ route flagship Review to `/writers-studio/review`;
- ⛔ generate `label`, `opening` or `kind` from nothing;
- ⛔ collapse `observationId` and `(readingId, observationKey)` — the host addresses by the second, facets by the first; the ratified bridge (`OBSERVATION-ADDRESS-01`) is not built;
- ⛔ carry the host's 51 atoms into the machine or vice versa in one act — the two state owners (§VI) are reconciled per concept, each its own bounded act.

---

## IX. Exact next bounded act (proposal)

`FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1 — VIEW ADAPTERS + WRITE-HOST MOUNT` ONLY:
pure adapters with a falsifier matrix (a candidate that fabricates `label`, that fetches, that
mints an id, that collapses the two addresses — each must die), then mount **WriteRoom only**
inside `/rebuild` behind the existing identity and save paths, rendered from `toManuscriptView`.
⛔ Develop and Review mount in later acts, after `map`/`opening`/`selectedFindingId` have owners.
⛔ F8 arrival state lands *after* the Write host is real, as F8-I1 Option B.

```text
FLAGSHIP-RUNTIME-CONVERGENCE-01 / C0
READ-ONLY CENSUS COMPLETE
source changes: none · schema: none · migrations: none · dependencies: none · production: untouched
implementation authority: NOT GRANTED · next act: founder adjudication of §VII / §IX
```
