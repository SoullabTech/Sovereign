# WRITERS-STUDIO-EDITORIAL-READING-01 · A1 — EXISTING-SUBSTRATE + SIBLING-LAW CENSUS · 2026-09-22

**Status:** CENSUS · READ-ONLY · NON-EXECUTING · ⛔ NO IMPLEMENTATION
**Opened by:** founder act, 2026-09-22 — *census only*
**Canonical:** `9da7195ef28e37652d2b22b300121719326f3953`
**Answers:** A0 §XIV's four A1 questions

> ⛔ **No Editorial Reading object, synthesis runtime, model call, prompt, schema, route or UI is created by this act.**

---

## I. Headline

⭐⭐ **Every input exists. The output object does not.**

The Developmental Reading layer is complete and governed: observations are typed, evidence-bound, coverage-recorded, revision-frozen, identity-minted, persisted and member-addressable. **What does not exist anywhere is the object that stands ABOVE many admitted observations and says what the Work appears to be doing** — the Editorial Reading itself.

⭐ **The nearest existing thing is `chapterReview`, and its own header states why it is not the missing object:**

> *"One explicit member gesture, seven governed readings over the exact chapter range. Each commission remains its own immutable reading; **this function only groups their ids for the experience**."*

⭐ *Grouping ids is not synthesis.* `chapterReview` is the **correct precedent for commissioning**, and ⛔ **explicitly not** a precedent for composing.

## II. Question 1 — what substrate exists

**`lib/manuscript/developmentalReading/**` — the governed reading layer**

| Object | Lines | What it establishes |
| --- | --- | --- |
| `contract.ts` | 299 | `ReaderClaimDraft` · `doesNotEstablish: NonEmptyArray<DevelopmentalNonConclusion>` · `coverage: DevelopmentalCoverage` · the lens vocabulary |
| `freeze.ts` | 193 | `freezeReading()` — ⭐ **the single admission seam**; `structureDependencyOf()` |
| `store.ts` | 143 | `freezeAndStore()` → `INSERT INTO developmental_readings`; `loadReading()`; `listReadings()`; ⭐ `assertNoProseKeys()` |
| `observationIdentity.ts` | 157 | `ObservationId` (branded) · `mintObservationId()` → `dobs_${uuid}` · `computeBasisFingerprint()` · `resolveManuscriptPosition()` · `compareAdmitted()` |
| `observationAddress.ts` | 136 | `ObservationAddress` · `ResolveOutcome` · `ReadingIdentityState: canonical \| legacy \| mixed \| not_found` |
| `classify.ts` · `scope.ts` · `refusalRecord.ts` | 232 · 147 · 218 | classification, scope, governed refusal |

**`lib/manuscript/developmentalReader/**`** — `contract.ts` (424) · `render.ts` (272) · `read.ts` (159) · `parse.ts` (125). ⭐ `read.ts` sends `messages:[{content: renderRequest(request)}]`, so **the whole prompt is a pure function of `DevelopmentalReaderRequest`** — the type-level Compass guard established by OBSERVATION-IDENTITY-01 holds here.

**`lib/manuscript/development/**`** — `readState.ts` (409) · `resolve.ts` (317) · `bind.ts` (210) · `preparation.ts` (213) · `evidenceRef.ts` (200) · `capture.ts` (197). Evidence binding and frozen read state.

**`lib/manuscript/editorialRuntime/**`** — `adoption.ts` (416) · `turn.ts` (404) · `thread.ts` (368) · `assembly.ts` (221). ⭐ The existing governed mutation path.

**Presentation and standing** — `lib/writersStudio/observationStanding.ts` (216, BUILD-07F: `UNSET · "No standing taken"` is a state) · `reviewPresentation.ts` (252) · `developPresentation.ts` (316) · `rebuild/chapterReview.ts`.

**Persistence** — table `developmental_readings`; standing keyed `(member_id, reading_id, observation_key)`.

## III. Question 2 — what is reusable without creating a second substrate

✅ **Reuse directly, ⛔ do not reimplement:**

- **Commissioning** — `chapterReview.runChapterReview()`'s discipline: one member gesture, N governed readings over an exact range, each its own immutable reading, **a failed lens reported while the others still run — partial never mislabeled complete**.
- **Admission** — `freezeReading()`, the single seam. ⛔ A second admission path would mint a second identity for one observation and nothing downstream could tell.
- **Identity and ordering** — `mintObservationId`, `computeBasisFingerprint`, `compareAdmitted`. ⭐ The presentation cut A0 §VIII permits (*a few at a time*) must use **manuscript order via `compareAdmitted`**, never an evaluative cut.
- **Coverage** — `DevelopmentalCoverage` on the contract is the warrant substrate. A0 §IV's whole-Work warrant is a **predicate over existing coverage records**, ⛔ not a new coverage system.
- **Prose exclusion** — `assertNoProseKeys()` already enforces §V's chain at the storage boundary.
- **Mutation handoff** — `editorialRuntime/adoption.ts`. ⛔ §XIII falsifier 7 forbids a second mutation substrate; this is the one.
- **Standing** — `observationStanding.ts`, keyed by `observation_key`, **authoritative and not to be duplicated**.

## IV. Question 3 — what does not exist

| Missing object | Status |
| --- | --- |
| ⭐ **The Editorial Reading itself** | Nothing composes many admitted observations into a governed synthesis. `chapterReview` groups ids and says so. |
| **A whole-Work coverage warrant predicate** | Coverage is recorded per reading; nothing evaluates *is this sufficient for a whole-Work claim*. |
| **Multi-pass composition under the ceiling** | `DEVELOPMENTAL_READ_CEILING_CODE_POINTS = 500_000`, *refused whole, nothing trimmed*. ⛔ No mechanism composes bounded passes into one warrant. |
| **A non-conclusion inheritance rule for synthesis** | The eight-member vocabulary binds a claim. ⛔ Nothing defines what a synthesis inherits from its sources — A0 §VI's laundering falsifier has no mechanism yet. |
| **Presentation of an unranked, all-reachable set** | §VIII forbids ranking; §IX forbids suppression. ⛔ No surface satisfies both today. |

⚠️ **Not missing and not to be built here:** identity, address, coverage recording, evidence binding, refusal, standing, adoption, undo.

## V. Question 4 — which sibling law binds which seam

| Constraint | Binds which seam | Force |
| --- | --- | --- |
| **Observation Identity** (`OBSERVATION-IDENTITY-01`) | admission — `freezeReading()` | ⛔ One seam. A second minting path violates L0. |
| **Observation Address + `observation_id` gate** (`OBSERVATION-ADDRESS-01`) | any member action on an observation | ⛔ **HARD GATE. No member action addressed to `observation_id` until that lane closes.** Standing stays keyed `(member_id, reading_id, observation_key)`; ⛔ no duplicate standing. |
| **Editorial Scope / runtime** (`WS-EDITORIAL-SCOPE-01`) | proposal → adoption → undo | ⛔ Editorial Reading hands off; it gains no mutation of its own. |
| **Convergence observation / coverage law** | what a reading may claim | ⭐ Coverage licenses; fluency does not. |
| **FACETS-01** GUIDED · LEARNING · DIRECT | expression only | ⛔ Same Work + scope + commission ⇒ **same underlying observation**. C6R4-1 and C6R5-2 already gate this. |
| **Closed eight-member non-conclusion vocabulary** | every claim, and every synthesis over claims | ⛔ `author-intent` and `reader-effect` **permanent**; `editorial-consequence` **fully binding**; coverage may discharge only `whole-work-pattern`, `across-unread-span`, `outside-coverage`. ⛔ No ninth. |
| **Elemental Alchemy isolation** | any EA-as-manuscript reading | ⛔ EA-as-governed-knowledge must be **proved unreachable**, not assumed — otherwise a reading is indistinguishable from a recollection. |
| **500k ceiling** | every read | ⛔ *Refused whole, nothing trimmed.* Multi-pass composes; it does not weaken. |
| **Work Compass / intention custody** | the reader's input | ⛔ Never evidence, never discharges coverage, never restated as an observation. ⭐ Structurally held: the prompt is a pure function of `DevelopmentalReaderRequest`. |
| **Gestalt non-capture law** | retrieval into the reading | ⚠️ Same history + materially different present must be able to produce materially different orientation. |

## VI. Two hazards this census names

⚠️ **1 — The 1:1 identity/key relation is guarded, not structural.** `observation_id` and `(readingId, observationKey)` are 1:1 *within a reading*, held by `L7-identity-and-key-are-1to1` and `L7-key-tracks-admission-index`. A2's contract must address observations **without assuming the bridge**, because if either guard fails the premise has failed with it.

⚠️⚠️ **2 — Synthesis is where laundering becomes structurally easy.** Every source observation carries `doesNotEstablish`. A synthesis over many sources has **no defined inheritance rule**, so the natural implementation — compose the claims, drop the qualifications — is exactly A0 §XIII falsifier 2. ⭐ **A2 should define non-conclusion inheritance BEFORE it defines the object's shape**, and the falsifier for it should be written before any implementation exists, per the ratified lethality-first discipline.

## VII. Recommended A2 scope — ⛔ FOR SEPARATE ADJUDICATION

```text
A2a  non-conclusion inheritance rule      ⭐ first, per §VI.2
A2b  whole-Work coverage warrant predicate over existing coverage
A2c  the Editorial Reading object shape — provenance, revision
     binding, source-observation references
A2d  falsifiers + defeat candidates for each, proved lethal
     BEFORE any implementation
⛔   still non-executing; no runtime, no prompt, no schema
```

## VIII. Standing

> **`WRITERS-STUDIO-EDITORIAL-READING-01 / A1` · CENSUS COMPLETE · ⭐ ALL INPUTS EXIST · ⛔ THE OUTPUT OBJECT DOES NOT · ⚠️ NON-CONCLUSION INHERITANCE IS THE FIRST THING A2 MUST DEFINE · ⛔ `observation_id` ACTION GATE HOLDS · ⛔ A2 NOT OPENED · PRODUCTION UNTOUCHED**
