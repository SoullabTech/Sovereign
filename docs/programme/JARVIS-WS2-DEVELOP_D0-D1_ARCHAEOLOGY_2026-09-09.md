# WS2-DEVELOP — D0 BEFORE-STATE + D1 PROCESS ARCHAEOLOGY

**Flow**: `docs/programme/JARVIS-WS2-DEVELOP-PROCESS-ENVIRONMENT_FLOW_2026-09-08.md` @ `49460c6c`
**Acts executed**: **D0** and **D1 only.** Read-only. **STOPPED at the D1 gate.**
**Substrate surveyed**: canonical `6345b8e08` — the commit live in production. *"What can Studio
actually do today"* is answered against what a member meets, not against unmerged work.

⚠️ **Branch note**: the flow was committed on
`feature/jarvis-ws2-sel0-production-discovery-2026-09-08`. This session is pinned to
`claude/jarvis-flow-architecture-w2gont`, so this record lands there and must be moved or
merged to sit beside the flow. **No branch was pushed to but the designated one.**

---

## D0 — BEFORE-STATE, PRESERVED WITHOUT TIDYING

| Artefact | State as of 2026-09-09 |
|---|---|
| Develop room | **LIVE IN PRODUCTION** at `6345b8e08` — `app/writers-studio/develop/DevelopRoom.tsx` (1188 lines), `ObservationDialogue.tsx` (328), `page.tsx` |
| Held Develop surface patch | `feature/jarvis-ws2-sel0-production-discovery-2026-09-08` — **20 insertions, 1 deletion, one file**: the `INVOCATION_SENTENCE` |
| Develop preparation | `app/api/sovereign/manuscripts/[id]/develop/preparation/route.ts` — on canonical |
| Founder finding | the room is **critique-first and process-incomplete** |
| Production lock | green at `6345b8e08`; no pending migrations |

### The held patch, verbatim in effect

`INVOCATION_SENTENCE` changes from *"MAIA will look at how this work is developing and bring
back what she noticed"* to *"MAIA will read this work and tell you what she notices"* —
retaining *"Nothing changes unless you change it."*

Its own comment is part of the before-state and is preserved because it is evidence:

> *"⛔ IT IS DELIBERATELY NOT YET THE FULL REPLACEMENT … this room has no discussion turn, no
> scope switching and no 'what else did you notice?'. This sentence is live on the production
> branch, so promising those would be telling tomorrow's story as if it were today's."*

⭐ **The patch author already recorded the process gap, in the file, as a reason not to promise
it.** The before-state is not a room that failed to notice its incompleteness — it is a room
whose incompleteness was documented at the point of copy-editing and left standing.

**Gate D0 — PASS.** The before-state is recorded as the room that failed, including its own
account of why. Nothing here is rewritten as though a process model had existed.

---

## D1 — PROCESS ARCHAEOLOGY

Census amended mid-execution by founder act (2026-09-09) to the three-part **WRITE / DEVELOP /
SHARED** shape. `PRESENT · PARTIAL · ABSENT`, each traced to a route/module/surface. **No
capability inferred.**

### DEVELOP

| Capability | State | Evidence |
|---|---|---|
| developmental intention / commission | **PRESENT** | `requestDevelopmentalReading`, `CommissionOutcome` with staged refusals — `lib/writersStudio/developClient.ts`; `/api/sovereign/manuscripts/[id]/readings` |
| scope declaration | **PRESENT** | `ReadingScope = whole \| section \| unit \| range` + `ScopeRefusal`/`ScopeOutcome` — `lib/manuscript/developmentalReading/scope.ts` |
| reading request | **PRESENT** | as above; one lens per reading, closed vocabulary |
| observation inspection | **PRESENT** | `readingView` / `ObservationView` — `lib/writersStudio/developPresentation.ts`; superseded rendered **in place**, marked, never re-read |
| anchored conversation | **PRESENT** | BUILD-07E `ObservationDialogue.tsx` → `askClient.ask`; anchor + reading held **server-side**; resumes from the store across close, reload, device |
| standing / keep / dismiss | **PRESENT** | BUILD-07F `lib/writersStudio/observationStanding.ts`; `Standing` contract; **UNSET ≠ UNKNOWN** enforced by `expectationFor` |
| **manuscript visibility** | **ABSENT** | the room calls `fetchWriteState` for a **section list**; it renders no prose. Header: *"no control here that changes a manuscript"* |
| **direct editing** | **ABSENT** | by construction — same header |
| **proposal / diff (prose)** | **ABSENT** | `structure/proposals` refuses prose outright: `prose_in_payload: 422`. Proposals are **structure-only** |
| **exact manuscript locus navigation** | **ABSENT** | ⭐ see finding **F-D1-1** |
| **revision lineage from a developmental act** | **ABSENT** | no write path exists in the room to originate one |
| **reflection after edit** | **ABSENT** | no post-edit return exists to reflect from |
| **return-to-Develop** | **ABSENT** *(as contextual return)* | `DEVELOP_HREF` has **no inbound reference** anywhere outside `studioMap.ts` and `__tests__/modeNavigation.test.ts`. The mode selector exists; a contextual return does not |
| session / process persistence | **PARTIAL** | threads and standings persist server-side and survive reload/device (`observationDialogueResume.ts`, `observationStanding.ts`). **No durable object represents a development episode** — persistence is per-observation, not per-process |

### WRITE

| Capability | State | Evidence |
|---|---|---|
| section writing | **PRESENT** | `canvas/SectionWritingSurface.tsx`, `SectionWritingSession.tsx` |
| direct editing | **PRESENT** | `lib/manuscript/sections/saveSection.ts` — WS2-04B section-addressable: *"the browser edits ONE SECTION and never submits a whole-manuscript string"* |
| selection editing | **PARTIAL** | selection is markable (`keeps`, verbatim-verified) and anchorable (`canvas/AskMaia.tsx`); the **save path is per-section**, not per-selection |
| MAIA-assisted prose work | **ABSENT** | `AskMaia.tsx`: *"nothing here changes the book."* No generative path exists in Write |
| revision / version creation | **PRESENT** | `/draft`, `/draft/revisions`, `/draft/checkpoint` |

### SHARED

| Capability | State | Evidence |
|---|---|---|
| canonical Working Draft | **PRESENT** | one lifecycle, structurally defended — `develop/preparation/route.ts`: *"a second place that can mint a working draft is a second lifecycle, and the two would drift"* |
| section identity | **PRESENT** | section-addressable saves; `manuscript_sections` |
| revision identity | **PRESENT** | `/draft/revisions`; `20260902000002_working_draft_revision_partition` |
| version history | **PRESENT** | revisions + checkpoint |
| provenance | **PARTIAL** | reading provenance frozen (`development/readState.ts`, `evidenceRef.ts`, `ReaderProvenance`); `lastWrittenAt` distinguishes a member act from a row mutation. ⛔ **Prose-level authorship provenance ABSENT** — the A1 WG-W1 obligation |

---

## Findings

### 🔴 F-D1-1 — THE ONLY DOORWAY FROM DEVELOP TO THE MANUSCRIPT IS AN ERROR-RECOVERY LINK.

`DevelopRoom.tsx` contains exactly one outbound link to the Work:

```tsx
{commission.outcome.refusal === 'revision_not_current' && (
  <Link href={canvasForManuscript(CANVAS_HREF, manuscriptId)}>Go to the Writer Canvas</Link>
)}
```

Two facts, both load-bearing:

1. **It renders only inside a refusal branch** — when a commission is declined because the
   revision is not current. **There is no ordinary crossing from Develop to the manuscript at
   all.** The one door out is an apology.
2. **It carries the manuscript id and nothing else.** `canvasForManuscript` appends only
   `?manuscript=<id>` — no section, no observation key, no reading id, no thread.

> **PF-6 ("context is lost when crossing into authorship") is not a risk this redesign must
> guard against. It is the current state — and the stronger statement is that there is no
> crossing in which to lose context.**

This is the archaeological form of the founder's hypothesis, and it is more severe than the
hypothesis assumed. Develop is not *a process that hands off too early*. **It is a process
with no exit toward the Work except a failure path.**

### 🔴 F-D1-2 — THE ROOM'S OWN DOCTRINE IS STALE ON TWO CAPABILITIES IT NOW HAS.

`DevelopRoom.tsx` header: *"WHAT IS ABSENT BY CONSTRUCTION. Interpretation, questions,
possibilities, **dialogue**, accept / reject / hold …"* — while the same file imports
`ObservationDialogue` (07E) and the full standing surface (07F). **Dialogue and standing were
added after 07D wrote that sentence and the sentence was not revised.**

⛔ **A documentation defect, not a capability question** — the census records the imports, not
the comment. Recorded because the room's self-description is a source a later act will read,
and it currently understates the room by two whole capabilities. **Not repaired here** (D1 is
read-only).

### ⭐ F-D1-3 — THE SHARED SUBSTRATE ALREADY SATISFIES THE HYPOTHESIS'S HARDEST REQUIREMENT.

The founder's amendment requires *"one canonical Working Draft — no duplicate manuscript, no
development copy, no MAIA-owned revision branch."*

**That is already structurally true and structurally defended.** `develop/preparation` refuses
to mint a working draft precisely to avoid a second lifecycle, deferring to the same
`beginDraft` call Write has always used. Section identity, revision identity and version
history are shared, not per-room.

> **What is missing is not shared ground. It is Develop's ability to stand on it.** Every
> SHARED row is PRESENT; every Develop row that would *touch* the manuscript is ABSENT.

### ⚠️ F-D1-4 — DEVELOP PERSISTS OBSERVATIONS, NOT PROCESS.

Threads and standings survive reload and device — genuinely durable, server-side, deliberately
never in React state. But they are keyed **per observation** (`dialogueSurfaceKey(readingId,
observationKey)`, `standingSurfaceKey`). **No object represents "the developmental thread I am
working" across observations, sections, or sessions.** The flow's D6 (process continuity) has
no substrate today, and D4's loop has nothing to persist into.

---

## Gate D1

**PASS.** Every capability above names a route, module or surface on canonical `6345b8e08`.
Nothing is recorded as PRESENT on the strength of an intention, a comment, or a held patch —
F-D1-2 exists precisely because a comment and the code disagreed, and the code was taken.

```
D0    COMPLETE — before-state preserved, including the patch's own account of the gap
D1    COMPLETE — WRITE / DEVELOP / SHARED censused on canonical
STOP  D2 NOT STARTED — no process model, no UI, no architecture proposed

not reopened: selector · Q12 · D5 standing ruling · F-7 · SEL-0B
no redesign · no implementation · no merge · no deploy · read-only throughout
```

**Next act — D2** (model the writer's developmental process, no screens), which now opens
against the founder's amended hypothesis: *two editing regimes over one canonical Working
Draft — primary authorship in Write, secondary developmental editing in Develop.* **D1's answer
to that hypothesis is that the shared ground exists and Develop cannot yet reach it.**

**FOUNDER RULING REQUIRED? NO** — D2 is authorized by the flow. This record stops at the gate
as instructed.
