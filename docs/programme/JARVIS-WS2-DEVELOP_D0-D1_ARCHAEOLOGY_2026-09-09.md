# WS2-DEVELOP — D0 BEFORE-STATE + D1 PROCESS ARCHAEOLOGY

**Programme**: `JARVIS-WS2-DEVELOPMENTAL-INTELLIGENCE-CONTINUATION.md` — **ACTIVE**.
**This is a CHILD INVESTIGATION inside that programme, not a new roadmap and not an
architecture reset** (founder correction, 2026-09-09). One programme, one history, one line of
authority. The flow below is the child produced by the founder walk.

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

## D1 (cont.) — WHERE THE ROADMAP DEPENDS ON THE FALSIFIED MODEL

Founder obligation, 2026-09-09: *map where the current Developmental Intelligence roadmap
phases depend on the critique-first model that the founder walk falsified. **Do not rewrite
those historical records**; identify which future phase opening conditions now need a
process-oriented interpretation.*

⛔ **Nothing below edits the continuation roadmap.** These are readings of existing phase
statements against D1 evidence.

**The shared dependency**: every phase capability in *The destination is the Studio* is stated
with **MAIA as subject** — *MAIA knows · MAIA can conduct · MAIA develops · MAIA can reason*.
Under a critique-first model that is coherent, because the room's whole output is MAIA's. Under
a process model several of these name **the wrong subject**: the capability belongs to the
room, or to the writer's process, and MAIA participates in it.

| Phase | Stated capability | D1 reading |
|---|---|---|
| **SEL-0** | MAIA knows **what to raise first** | ⚠️ **Needs reinterpretation.** Presupposes raising is the act and ranking is standalone. In a process, what to raise first depends on **what the writer is working**, which no substrate carries (F-D1-4). Selection inside a thread ≠ selection over a Work. |
| **F-7** | what she is permitted to **infer or raise** | ✅ **Survives.** A constitutional boundary on MAIA holds under either model. One extension: it must also govern MAIA's answers inside **writer-initiated** work, not only what she raises unprompted. |
| **Phase 2** | **one excellent developmental session** | 🔴 **DIRECTLY FALSIFIED AS PREVIOUSLY READ.** Implicitly *excellent reading + good conversation about it*; the founder's restatement includes *"writer works directly on the manuscript"* and *"writer sees what changed."* D1 says every capability that restatement requires is ABSENT in Develop. |
| **Phase 3** | **scope and competence** boundaries | ⚠️ Partly. Scope exists for **reading** (`ReadingScope`, PRESENT). Scope for **editing within a developmental context** has no referent today. |
| **Phase 4** | persistent **Work understanding** | ⚠️ **Gains a second object.** Stated as MAIA's understanding. F-D1-4 shows the missing persistence is the **writer's developmental thread** — Develop persists observations, not process. Both are needed; only one is named. |
| **Phase 5** | Write and Develop have **lawful continuity** | 🔴 **ORDERING CONSEQUENCE — see F-D1-5.** |
| **Phase 6** | development happens **as conversation** | ⚠️ Partly already true (07E is live). But under the amended hypothesis conversation is **one strand beside editing**, not the destination. "As conversation" may now understate the phase. |
| **Phase 7** | reason across the **whole Work** | ✅ Largely unaffected — `ReadingScope.whole` already exists. |
| **Phase 8** | best model / configuration | ✅ Unaffected. |
| **Phase 9** | **preserves the writer's voice** | ⚠️ Now coupled to A1's prose-authorship provenance (SHARED · provenance = PARTIAL). "Preserves voice" becomes measurable only once whose-language-is-whose is recorded. |
| **Phase 10** | other writers, other Works | ✅ Unaffected. |

### 🔴 F-D1-5 — PHASE 5 HAS BECOME A PRECONDITION OF PHASE 2.

Phase 2's amended definition contains *"writer works directly on the manuscript"* and *"writer
sees what changed."* Those are **Write ↔ Develop continuity** — the subject matter scheduled at
**Phase 5**, three phases later.

D1 makes the dependency concrete rather than theoretical: the SHARED substrate Phase 5 would
establish **already exists and is already lawful** (one Working Draft, shared section and
revision identity, structurally defended against a second lifecycle — F-D1-3). What is missing
is Develop's reach into it.

> **So Phase 5 is not blocked work waiting its turn. Part of it is already built, and the
> unbuilt part is now inside Phase 2's definition.** A sequence that keeps them three phases
> apart will either stall Phase 2 or quietly satisfy it with critique plus a handoff — **PF-5,
> exactly.**

⛔ **Not a proposal to reorder the roadmap.** That is a founder act. Recorded as the ordering
question D2 must carry.

### ⭐ F-D1-6 — THE WALK VALIDATED THE PRODUCTIZATION RULE, ONE ALTITUDE UP.

The rule ratified 2026-09-08:

```
BENCHMARK PASSES  ≠  STUDIO HAS THE CAPABILITY
```

The founder walk produced its successor:

```
CRITIQUE EXISTS   ≠  DEVELOP EXISTS
```

**Same rule, next altitude.** The first says a passing evaluation is not a Studio capability;
the second says a *shipped* Studio capability is not the *purpose* it was built to serve. 07A–07F
each closed on its own acceptance terms and each was honestly built — D1 found no unmet
obligation in any of them. **The gap is not between claim and implementation; it is between an
implemented capability and the room a writer needs.** That is what a founder walk catches and
no unit gate can, and it is the programme working as designed rather than failing.

## Gate D1

**PASS.** Every capability above names a route, module or surface on canonical `6345b8e08`.
Nothing is recorded as PRESENT on the strength of an intention, a comment, or a held patch —
F-D1-2 exists precisely because a comment and the code disagreed, and the code was taken.

```
WS2 DEVELOPMENTAL INTELLIGENCE     ACTIVE — one programme, one history
  SEL-0 corpus 01                  RETIRED UNRUN
  SEL-0B                           REQUIRED LATER
  selector core / runtime          BUILT / LOCKED
  F-7 adjudicator                  PRODUCT GAP
  Develop founder walk             PURPOSE-LEVEL FAIL — critique-first, process-incomplete

CURRENT CHILD                      Develop process architecture
  D0 preserve before-state         COMPLETE
  D1 process archaeology           COMPLETE — WRITE / DEVELOP / SHARED + phase dependency map
  D2 human developmental process   NOT STARTED

WRITE ↔ DEVELOP relationship       LOAD-BEARING QUESTION — hypothesis, established not presumed
implementation                     NOT AUTHORIZED
merge / deploy                     NOT AUTHORIZED

not reopened: selector · Q12 · D5 standing ruling · F-7 · SEL-0B
roadmap NOT rewritten — phase readings recorded, historical records untouched
no redesign · no implementation · read-only throughout
```

**Next act — D2** (model the writer's developmental process, no screens), which now opens
against the founder's amended hypothesis: *two editing regimes over one canonical Working
Draft — primary authorship in Write, secondary developmental editing in Develop.* **D1's answer
to that hypothesis is that the shared ground exists and Develop cannot yet reach it.**

**FOUNDER RULING REQUIRED? NO** — D2 is authorized by the flow. This record stops at the gate
as instructed.
