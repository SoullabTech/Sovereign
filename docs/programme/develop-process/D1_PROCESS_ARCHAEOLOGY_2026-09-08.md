# D1 — process archaeology · **READ-ONLY CENSUS**

**Parent flow**: `docs/programme/JARVIS-WS2-DEVELOP-PROCESS-ENVIRONMENT_FLOW_2026-09-08.md`
**Repository state**: `49460c6c0` · **No design. No implementation.**

> **Gate D1**: no inferred capability. If a writer action cannot be traced to a real
> surface/runtime path, it is not present.

Every row below names the route or module that proves it. Where a capability exists in code but is
not reachable by a writer, it is `PARTIAL` with the reason, never `PRESENT`.

---

## 1 · The thirteen capabilities

| capability | state | what proves it |
|---|---|---|
| present intention / commission | **ABSENT** | The only commission that exists is `selectionCommission` in `ask/route.ts`, and it means *"choose an observation to raise"*, not *"here is what I am trying to do"*. Nothing anywhere records a writer's purpose for a session. The Develop surface carrying even that gesture is **held out of the tree**. |
| scope declaration | **PARTIAL** | `POST /[id]/readings` accepts a structural `scope` (`developmentalReading/scope.ts`), and `DevelopRoom.tsx` offers whole/part with a section range. It scopes **what MAIA reads**, once, at commission. It is not a scope the writer inhabits or changes while working. |
| reading request | **PRESENT** | `POST /[id]/readings` → `developmentalReading/commission.ts` → reader + classifier → `freezeAndStore`. Verified live: 58s, 201, 8 observations over EA Chapter 4. |
| observation inspection | **PRESENT** | `lib/writersStudio/developPresentation.ts` renders every observation with evidence, limits, state chip; `DevelopRoom.tsx` lists them in the reading's own order. |
| anchored conversation | **PRESENT** | `POST /[id]/ask` with `{on:'observation',readingId,observationKey}` → `developmentalTurn()` → `askMaiaDevelopmental` → `ask_threads`/`ask_turns`. |
| exact manuscript navigation | **PARTIAL** | The Canvas outline lists all sections and opens one into the editor (`write-state` + `outlineRows`). But `developPresentation` renders evidence as **prose labels** — *"Section 4"*, *"a section that was not in the reading"* — with **no link, no id, no navigation target**. There is no path from an observation to the passage it is about. |
| editing | **PRESENT — in WRITE, not in DEVELOP** | `PUT /[id]/write-state` → `sections/saveSection.ts`: row lock, optimistic `version` check, one increment per save. Reached from the Canvas. Nothing in Develop edits anything. |
| versioning | **PRESENT** | `POST /[id]/draft/checkpoint` → `INSERT INTO working_draft_revisions (…, section_partition)`, `revision_count + 1`, idempotency-keyed. ⭐ Deliberately member-gestured: *"no autosave-as-version, no silent checkpoint"* (`SectionWritingSurface.tsx`). |
| proposed text / diff | **ABSENT** | No table, no route, no module. `manuscript_structure_proposals` proposes **structure**, never prose. `comms_reply_suggestions` and `tool_suggestions` belong to other products. MAIA cannot offer words for this Work. |
| revision provenance | **PARTIAL** | `working_draft_revisions` = `draft_id · revision_number · content · saved_by · note · created_at · section_partition`. It records **who and when**, and a free-text `note`. ⛔ There is **no field linking a revision to the intention, observation or conversation that produced it** — the §4.2 lineage of the parent flow has no substrate. |
| return-to-Develop | **PARTIAL** | `GET /[id]/readings` lists prior readings and `?r=` reopens one; `GET /[id]/ask` lists threads on an anchor. So a writer can return to *an artifact*. Nothing resumes a *process* — there is no "where you were". |
| standing / keep / dismiss | **PRESENT** | `POST /[id]/readings/[readingId]/standings` → `standing/store.ts` append-only events; `YourStanding` in the room; `currentStandings` read only through the boundary seam. |
| session / process persistence | **ABSENT** | `ask_threads`/`ask_turns` persist **conversation**, and offer memory is deliberately confined to one commission (Q8). `studio_session_markers` / `studio_session_live_prompts` belong to the Studio-session product, not Develop. No Develop process state exists. |

### The count

```text
PRESENT   6      reading request · observation inspection · anchored conversation ·
                 editing (in Write) · versioning · standing
PARTIAL   4      scope declaration · exact manuscript navigation · revision provenance ·
                 return-to-Develop
ABSENT    3      present intention · proposed text/diff · session/process persistence
```

⭐ **Read down the ABSENT and PARTIAL rows and the shape of the founder finding appears as
substrate, not opinion.** What is missing is precisely: *why the writer came*, *the way from an
observation to the manuscript*, *the record of what an edit was for*, and *anything to return to*.
Those are the joints of a process. What is PRESENT is perception, conversation, and authorship —
three capable systems with no process connecting them.

---

## 2 · WRITE ⇄ DEVELOP ⇄ SHARED — the hypothesis, tested

The parent instruction asked that this be **established from the runtime, not assumed**.

### Result: the shared substrate is REAL, and there are TWO section substrates, not one

```text
WRITE                                    DEVELOP
PUT  /[id]/write-state                   POST /[id]/readings
POST /[id]/draft/checkpoint              POST /[id]/ask
POST /[id]/draft                         POST /[id]/readings/[id]/standings
     │                                        │
     └────────────┬───────────────────────────┘
                  ▼
        SHARED CANONICAL SUBSTRATE
        manuscript_working_drafts     draft identity, `version`, section_addressable_at
        manuscript_draft_sections     the sections BOTH rooms speak in
        working_draft_revisions       revision lineage + section_partition
```

**Evidence, each traceable:**

```text
saveSection.ts:108,114    WRITE locks manuscript_working_drafts and updates
                          manuscript_draft_sections, one version increment per save
checkpoint/route.ts:168   the revision is written here, with section_partition
readings/route.ts         DEVELOP resolves its bodyScope over manuscript_draft_sections
capture.ts:181-196        loadLiveWork reads the SAME draft + draft sections
readState.draftId         the frozen reading names the working draft and revision number
resolve.ts:115            supersession = sha256(section text) vs the digest frozen at read time
```

⭐ **The coupling is not organizational, it is cryptographic.** A `saveSection` in Write changes a
draft section's bytes; the next `assessReading` digests those bytes and the observation resting on
them becomes `superseded`. **Write already speaks to Develop — through supersession, one-way, and
only to invalidate.** That is the entire existing continuity between the rooms.

### ⚠️ The second substrate, which is NOT shared

```text
manuscript_sections   (SOURCE)   used by:  /[id] index · /render · /keeps · /candidates ·
                                           /collections · POST /manuscripts (import)
                                 NOT used by: any Develop path
```

Import writes Source; `POST /[id]/draft` seeds the Working Draft **from** Source; thereafter the
two diverge and nothing reconciles them. ⭐ **This is exactly what retired WALK-FIXTURE-01**: draft
sections existed, Source was empty, so the reading was valid and the Work was unreadable. The
census records it as a structural property of the product, not as that fixture's accident.

### Editing vocabulary

```text
PRIMARY authorship + PRIMARY editing     WRITE       saveSection → draft sections, versioned
SECONDARY editing                        NOWHERE     Develop cannot edit. There is no
                                                     secondary-editing path, in Develop or
                                                     anywhere else; the only editor is the
                                                     Canvas writing surface.
```

⛔ **So the WRITE / DEVELOP / SHARED triad is only two-thirds real.** The shared substrate is
established. Primary authorship in Write is established. **Developmental/secondary editing has no
runtime existence at all** — it is the hypothesis's missing term, and the census refuses to infer it.

---

## 3 · Where the roadmap depends on the critique-first model

⛔ **Nothing below rewrites a historical record.** The roadmap, the productization table and the
phase texts stand as written. This names which **opening conditions** now need a process-oriented
reading, and why.

| phase | the critique-first dependency, quoted | what now needs interpretation |
|---|---|---|
| **Phase 2** — one excellent section-level working session | `OPEN SECTION → READ WITH MAIA → DISCUSS → EXPLORE → OPTIONALLY EDIT → KEEP WRITING` | ⭐ **The most load-bearing.** Reading is step two and editing is *optional* — the writer's own purpose never appears, and the session is entered through MAIA's perception. §4.3 of the parent flow forbids exactly this (*"a reading may orient; it may not become an entrance tax"*), and §1 forbids the obvious repair (*critique → edit*). The acceptance question — *"was writing with MAIA easier and more useful than writing without her?"* — survives intact and is arguably strengthened; the **loop** is what needs re-reading. |
| **Phase 5** — *"Write and Develop have lawful continuity"* | continuity is a later phase | Presupposes two rooms joined afterwards. The census shows they already share one substrate and already communicate — through supersession. Under a process reading, continuity is **constitutive of the room, not a later increment**; Phase 5's opening condition may already be partly discharged, and what remains is *lineage* (intention → observation → edit), which has no substrate. |
| **Phase 6** — *"Development happens as conversation"* | conversation is a later phase | If conversation arrives at Phase 6, Phases 2–5 are non-conversational — i.e. critique with steps. Anchored conversation is already **PRESENT**. The phase's real content under a process reading is not *whether* dialogue exists but *what dialogue is allowed to do* to the Work. |
| **SEL-0** — *"MAIA knows what to raise first"* | raising is the primary act | Selection presupposes that the room's job is to surface findings. The parent flow already demotes it: *"subordinate capability: what might be worth raising now."* The **capability claim is unaffected**; its position as the Studio's gateway capability is what changes. |
| **F-7** — *"what she is permitted to infer or raise"* | phrased around raising | Constitutional and unaffected in substance. Its Studio-capability sentence inherits the critique framing but the rule does not. |
| **Phase 3** — scope + competence | mild | Scope is currently a commission-time parameter (`PARTIAL` above), not something a writer inhabits. Process-oriented reading makes scope a property of *where the writer is*, not of *what MAIA read*. |
| **Phase 4 / 7** — Work understanding, whole-Work cognition | low | Perception capabilities. Largely orthogonal to the critique/process distinction. |
| **Phases 8 / 9 / 10** | low | Model choice, voice preservation, other writers. Unaffected. |

### The one line that most needs a founder reading

```text
Phase 2:  OPEN SECTION → READ WITH MAIA → DISCUSS → EXPLORE → OPTIONALLY EDIT → KEEP WRITING
```

⚠️ Under the founder finding this is **critique-first with an edit appended** — the precise shape
§1 of the parent flow says must not be built. It is also the phase whose acceptance question the
whole direction rests on. Whether Phase 2's opening condition is *reinterpreted* or *superseded* is
a founder act, and this census does not take it.

---

## 4 · Standing

```text
D0                  RECORDED — before-state preserved untidied
D1                  RECORDED — census complete, 13 capabilities, every claim traced
capabilities        6 PRESENT · 4 PARTIAL · 3 ABSENT
shared substrate    ESTABLISHED — working draft · draft sections · revision lineage
two substrates      ESTABLISHED — Source and Draft diverge; only Draft reaches Develop
secondary editing   NO RUNTIME EXISTENCE — the triad's missing term, not inferred
roadmap dependency  MAPPED — Phase 2 primary, Phases 5 and 6 secondary, SEL-0 repositioned
historical records  UNCHANGED
D2 and beyond       NOT OPENED
design              NOT STARTED — no redesign, no implementation, as instructed
```
