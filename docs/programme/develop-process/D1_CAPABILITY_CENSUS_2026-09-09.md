# D1 — capability census · **READ-ONLY** · 18 capabilities

**Parent flow**: `docs/programme/JARVIS-WS2-DEVELOP-PROCESS-ENVIRONMENT_FLOW_2026-09-08.md`
**D0/D1 narrative of record**: `docs/programme/JARVIS-WS2-DEVELOP_D0-D1_ARCHAEOLOGY_2026-09-09.md`
(recorded by a parallel session; findings F-D1-1 … F-D1-4 stand)

> **This file does not duplicate that record.** It is the census in the required three-field form,
> extended to the full eighteen capabilities, plus the reconciliation of two places where the two
> sessions' archaeology disagreed.
>
> ⚠️ Two earlier files of mine — `D0_BEFORE_STATE_2026-09-08.md` and
> `D1_PROCESS_ARCHAEOLOGY_2026-09-08.md` — were removed in the preceding commit to avoid a third
> parallel account. Their substance is folded in here and in the record above; nothing they
> established is dropped.

> **Gate D1**: no inferred capability. Every state names the route, module or surface that proves
> it. Where something exists in code but a writer cannot reach it, it is not PRESENT.

---

## Reconciliation — where the two archaeologies disagreed

**1 · Production SHA. Mine is correct; the other record's is not.**

```text
recorded there   production lock green at 6345b8e08
measured here    docker exec maia-sovereign printenv GIT_COMMIT  →  3afa51b9f
                 container Created                               →  2026-09-08T17:28:33Z
```

⛔ `6345b8e08` is not the production runtime. The consequence matters: **the deployed image predates
the selector entirely**, which is also why no selector run against the frozen 19 was ever possible.
Corrected here rather than in that file, so the disagreement stays visible.

**2 · "present intention / commission" — PRESENT there, ABSENT in my first pass; the honest answer
is PARTIAL.** `requestDevelopmentalReading` / `CommissionOutcome` genuinely exist, so *a commission*
is present. What is absent is *present intention*: nothing records what the writer came to do.
Collapsing the two halves into one verdict is what produced the disagreement.

**3 · F-D1-1 confirmed independently.** `DevelopRoom.tsx:830` is the only `canvasForManuscript` call
in the room, and it renders **only** inside `commission.outcome.refusal === 'revision_not_current'`.
The single doorway from Develop to the manuscript is an error-recovery link.

---

## DEVELOP

| capability | state | evidence | consequence for process-oriented Develop |
|---|---|---|---|
| present intention / commission | **PARTIAL** | `lib/writersStudio/developClient.ts` `requestDevelopmentalReading` / `CommissionOutcome`; `POST /api/sovereign/manuscripts/[id]/readings` | A commission to **read** exists; a record of the writer's **purpose** does not. The room can be asked for perception but cannot be entered with an intention, so every session begins from MAIA's side. |
| scope declaration | **PRESENT** | `lib/manuscript/developmentalReading/scope.ts` — `whole \| section \| unit \| range`, with `ScopeRefusal`/`ScopeOutcome`; read-mode controls in `DevelopRoom.tsx` | Scope is fixed **at commission** and describes what MAIA read. It is not a locus the writer occupies or moves, so it cannot serve as "where I am working". |
| reading request | **PRESENT** | `POST /[id]/readings` → `developmentalReading/commission.ts` → reader + classifier → `freezeAndStore`. Verified live: 58s, 201, 8 observations over EA Chapter 4 | Perception is a solved capability. It is also currently the **only** way in, which is the critique-first shape itself. |
| observation inspection | **PRESENT** | `lib/writersStudio/developPresentation.ts` `readingView` / `ObservationView`; superseded rendered in place and marked | The writer can examine what MAIA noticed and its limits cheaply. The room's strongest existing act; it needs no repair, only demotion from primary object. |
| anchored conversation | **PRESENT** | `POST /[id]/ask` → `developmentalTurn()` → `askMaiaDevelopmental`; `ask_threads` / `ask_turns`; resumes across close, reload, device | Dialogue already exists and already persists. Phase 6's premise that conversation arrives later is not what the runtime says. |
| exact manuscript navigation | **ABSENT** | `developPresentation.ts` renders evidence as prose labels — *"Section 4"*, *"a section that was not in the reading"* — carrying no id, link or target | An observation cannot be followed to the passage it is about. The movement from noticing to working breaks at its first step. |
| Develop → manuscript crossing | **ABSENT** | `DevelopRoom.tsx:830` — the sole `canvasForManuscript` link, rendered only on `revision_not_current` | The only exit to the Work is an error-recovery link. There is no ordinary crossing, so §4.2's lineage has nowhere to begin. |
| proposed revision / diff | **ABSENT** | No table, route or module. `manuscript_structure_proposals` refuses prose outright (`prose_in_payload: 422`) | MAIA cannot offer words for this Work at all. Mission §7's "commission MAIA to propose options" has no substrate whatsoever. |
| explicit adoption | **PARTIAL — structure only** | `POST /[id]/structure/proposals/[proposalId]/adopt`; `docs/design/contracts/structure-review.md` | The adoption *pattern* is built, proven and constitutionally careful — but only for structure. For prose there is nothing to adopt, because nothing can be proposed. |
| return-to-Develop | **PARTIAL** | `GET /[id]/readings` lists prior readings, `?r=` reopens one; `GET /[id]/ask` lists threads. `DEVELOP_HREF` has no inbound reference outside `studioMap.ts` and its test | A writer can return to an **artifact**, never to a **place in a process**. Nothing knows where they were. |
| standing / keep / dismiss | **PRESENT** | `POST /[id]/readings/[readingId]/standings` → `standing/store.ts` append-only; `lib/writersStudio/observationStanding.ts`; UNSET ≠ UNKNOWN | Writer lifecycle authority over MAIA's perceptions is real and enforced. It governs observations only; there is no equivalent authority over process. |
| process / session persistence | **PARTIAL** | threads and standings persist server-side; offer memory is deliberately confined to one commission (Q8) | Persistence is **per-observation**, not per-process. No durable object represents a development episode, so nothing can be resumed, reflected on, or continued. |

## WRITE

| capability | state | evidence | consequence for process-oriented Develop |
|---|---|---|---|
| section writing | **PRESENT** | `app/writers-studio/canvas/SectionWritingSurface.tsx`, `SectionWritingSession.tsx` | Authorship is a working capability. The process must reach *into* this, not reproduce it. |
| direct prose editing | **PRESENT in WRITE · ABSENT in DEVELOP** | `lib/manuscript/sections/saveSection.ts` — row lock, optimistic `version`, one increment per save; Develop's own header: *"no control here that changes a manuscript"* | Editing exists and is safe, but lives in another room. The founder finding is exactly this boundary: the process breaks at the moment it would become work. |
| selection / range editing | **PARTIAL** | selection is markable (`keeps`, verbatim-verified) and anchorable (`canvas/AskMaia.tsx`); the save path is **per-section** (`saveSection.ts`) | A writer can point at a passage but cannot write at that granularity. An observation about a sentence cannot become an edit of that sentence. |
| MAIA-assisted writing | **ABSENT** | `canvas/AskMaia.tsx:12` — *"nothing here changes the book."* No generative prose path exists in Write or Develop | Mission §7 is half-buildable today: the direct-editing half exists in Write; the commissioned half exists nowhere. |
| version creation | **PRESENT** | `POST /[id]/draft/checkpoint` → `INSERT INTO working_draft_revisions (…, section_partition)`, `revision_count + 1`, idempotency-keyed; `SectionWritingSurface.tsx`: *no autosave-as-version, no silent checkpoint* | Versioning is member-gestured by design. "See what changed" has a substrate — but only if a developmental act can reach it, which today it cannot. |

## SHARED

| capability | state | evidence | consequence for process-oriented Develop |
|---|---|---|---|
| canonical Working Draft | **PRESENT** | `manuscript_working_drafts`; `develop/preparation/route.ts`: *"a second place that can mint a working draft is a second lifecycle, and the two would drift"* | One lifecycle, structurally defended. The process does not need to invent a home for the Work. |
| section identity | **PRESENT** | `manuscript_draft_sections`; section-addressable saves; both rooms speak in these ids | Write and Develop already name the same things. Shared identity is not a gap. |
| revision / version lineage | **PRESENT** | `working_draft_revisions` + `20260902000002_working_draft_revision_partition`; `/draft/revisions` | The spine for "what changed" exists. |
| provenance | **PARTIAL** | reading provenance frozen (`development/readState.ts`, `evidenceRef.ts`, reader/classifier identity). `working_draft_revisions` = `draft_id · revision_number · content · saved_by · note · created_at · section_partition` | ⛔ A revision records **who and when**, never **why**. No field binds a revision to the intention, observation or conversation that produced it — §4.2's lineage has no column. |

---

## The hypothesis, tested rather than assumed

⭐ **The shared substrate is real, and the coupling is cryptographic rather than organizational.**

```text
saveSection.ts:108,114   WRITE locks manuscript_working_drafts, updates draft sections
capture.ts:181-196       DEVELOP's loadLiveWork reads the SAME draft and sections
resolve.ts:115           supersession = sha256(section text) vs the digest frozen at read time
```

A save in Write changes bytes; the next assessment digests those bytes and the observation resting
on them becomes `superseded`. **Write already speaks to Develop — one-way, and only to invalidate.**

⚠️ **Two section substrates exist and only one reaches Develop.** `manuscript_sections` (Source)
serves the Work index, render, keeps, candidates, collections and import; `manuscript_draft_sections`
serves Write and Develop. `POST /[id]/draft` seeds Draft from Source, after which nothing reconciles
them. This is what retired WALK-FIXTURE-01: draft sections existed, Source was empty, the reading
was valid and the Work was unreadable.

⛔ **The triad's third term has no runtime existence.** WRITE / primary authorship: established.
SHARED / canonical draft, identity, lineage, partial provenance: established. **DEVELOP / secondary
editing: nothing.** Not partial, not indirect — there is no developmental editing path in the
product, and this census declines to infer one from the existence of an editor in another room.

---

## Tally

```text
PRESENT   10     scope · reading request · observation inspection · anchored conversation ·
                 standing · section writing · direct editing (Write) · version creation ·
                 canonical draft · section identity · revision lineage
PARTIAL    6     present intention/commission · explicit adoption · return-to-Develop ·
                 process persistence · selection/range editing · provenance
ABSENT     4     exact manuscript navigation · Develop → manuscript crossing ·
                 proposed revision/diff · MAIA-assisted writing
```

⭐ **Read the ABSENT row alone and the founder finding appears as substrate rather than opinion**:
no way to the passage, no way into the Work, nothing to propose, no assisted writing. Those four are
the joints between perception and authorship. Everything on either side of the joint is built.

---

## Standing

```text
D0                    RECORDED (JARVIS-WS2-DEVELOP_D0-D1_ARCHAEOLOGY_2026-09-09.md)
D1                    RECORDED — 18 capabilities, three-field form, every claim traced
disagreements         RECONCILED — production SHA corrected · intention/commission split ·
                      F-D1-1 independently confirmed
duplicate files       REMOVED
SHARED substrate      ESTABLISHED
secondary editing     NO RUNTIME EXISTENCE
D2 and beyond         NOT OPENED
UI / redesign         NOT PROPOSED
SEL-0B                NOT OPENED
selector / F-7        NOT REOPENED
MERGE / DEPLOY        NONE
```

**STOP at the D1 gate.**
