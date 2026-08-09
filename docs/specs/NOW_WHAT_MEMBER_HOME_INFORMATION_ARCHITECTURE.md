# Now What? — Member Home Information Architecture

**Status:** PROPOSAL — architecture for review. **Authorizes no code.**
**Referent:** deployed SHA `95b21ce42`; code + schema read at trunk `5e8f8a5bb`.
**Supersedes (member-facing IA only):** the six-section taxonomy in
`components/now-what/ClientHome.tsx`.
**Preserves:** `docs/specs/NOW_WHAT_HOME_ACTIVATION_MODEL_v0.md` §7 — Model 3, gesture
grammar, MAIA-proposes/member-declares, coach attribution. Those rulings survive this
redesign intact and constrain it.

---

## 0. Headline finding

> **The practitioner authoring platform is already built. The member-side Home is not wired
> to it.**
>
> The Home composes from **2 of ~8 available sources**. Almost nothing in the proposed IA
> requires a new table. This is a composition and information-architecture problem, not a
> schema problem.

Second finding, load-bearing and previously unnamed:

> **A member enrolled in a program sees "No programme is named here yet."**
>
> `app/api/now-what/home/route.ts:179` drives its journey read from
> `field_program_positions` and joins `field_programs` only for the title. No position row
> ⇒ no program rendered — **even when the practitioner has authored and assigned one.**
> The Home shows the member's *declared position in* a program, never the *program itself*.
> Enrollment and position are different facts, and only one of them is being read.

---

## 1. Current state

### What the Home renders

Six sections named for internal ontology: My Journey · Decisions · Commitments · Sessions ·
Reflections · Coach Connection.

### What the Home actually reads

`GET /api/now-what/home` — one member-scoped call, two sources:

| Source | Feeds |
|---|---|
| `member_field_note_threads` (discriminated on `spiralogic_phase` via `KIND_OF_TAG`) | Decisions, Commitments, Questions, Reflections, Sessions |
| `field_program_positions` ⋈ `field_programs` | My Journey |

Sessions are derived from kept threads. Coach Connection reads the
`shareWithPractitioner` flag on those same threads.

### Known defects carried forward

| # | Defect | Evidence |
|---|---|---|
| D1 | Two doors, identical URL | `ClientHome.tsx:219,344,399` — one `roomHref` constant |
| D2 | Decisions door carries no `phase`; work begun there stores as Reflection and can never reach its own section | `NowWhatRoom.tsx:646`, `home/route.ts:44` |
| D3 | Four sections have no door at all | Journey, Commitments, Reflections, Coach |
| D4 | Nine sibling routes unreachable from Home | `app/now-what/*` |
| D5 | Enrolled member sees "no programme" | `home/route.ts:179` (above) |
| D6 | Sections named for objects, not for member intent | whole surface |

D6 is the one this document addresses. D1–D5 resolve as consequences of the IA, not as
patches.

---

## 2. Design principle

The Home answers five member questions. The architecture disappears behind them.

| # | Member question | Area |
|---|---|---|
| 1 | Where am I? | My Programs |
| 2 | What am I involved in? | My Programs |
| 3 | What do I need to do next? | Prepare · My Work |
| 4 | What am I learning / exploring? | Explore |
| 5 | Who am I connected with? | Connect |
| — | Where is the material? | Library |

A member never needs to understand the MAIA/AIN object model.

---

## 3. Proposed state — ONE field, not six areas

### 3.1 The correction

An earlier draft of this document proposed six navigable areas (Programs · Prepare · My Work
· Explore · Connect · Library). **That was still a filing cabinet** — it separated domains
because *the database* has domains. A member does not experience "program objects," "field
objects," "resources" and "containers." They experience one question:

> *What am I working on, and what do I do next?*

**The member should not have to navigate the ontology.** The six areas are retained in §4 as
**assembly dimensions** — the sources the field composes from — **not as destinations.**

⛔ Not this:

```
Home
 ├── Programs
 ├── Preparation
 ├── My Work
 ├── Explore
 ├── Connect
 └── Library
```

✅ This:

```
                    MY WORK FIELD

        Leadership Presence Program

        Where I am:
        Week 4 — Leading difficult conversations

        Next:
        Prepare for Thursday session

        Bring:
        Team conflict I am navigating

        Practice:
        Pause before responding

        Explore:
        What kind of leader am I becoming?

        Resources:
        Workbook · Recording · Notes

        Connect:
        Sarah + Leadership Cohort
```

One field. One context. Everything flows through it.

### 3.2 The mental model

The member does not ask *"where do my commitments live?"* They ask:

- What am I working on?
- What matters right now?
- What should I prepare?
- What did I learn?
- What is my next move?
- Who is helping me?

**The system organizes underneath.** Like a car: the engine has thousands of parts; the
driver sees a steering wheel, a speed, a destination.

> **Governing principle: the system organizes the complexity; the human experiences the
> simplicity.**

The Client Field is the **cockpit** for a person's development. Not six rooms. Not a
dashboard. Not a database browser. One living field that knows where you are, what you are
doing, what you are carrying, who is with you, and what comes next.

This is closer to the founding MAIA/AIN posture: **the environment adapts around the person
rather than making the person adapt to the architecture.**

### 3.3 The two risks this creates — and they are the whole design problem

Collapsing six surfaces into one field is right. But compression is where two canon
boundaries get crossed by accident, and neither is visible in the mockup above.

#### Risk A — Compression becomes collapse of authorship

Every line in that field has a **different author**:

| Field line | Authored by | Authority |
|---|---|---|
| "Leadership Presence Program" | enrollment fact | system-known |
| "Week 4 — Leading difficult conversations" | practitioner **or** member | ⚠️ **two different authorities, same slot** |
| "Prepare for Thursday session" | scheduling fact | system-known |
| "Bring: team conflict I am navigating" | practitioner prompt **or** member's own words | ⚠️ **two different authorities** |
| "Practice: pause before responding" | member (committed) or practitioner (suggested) | ⚠️ **two different authorities** |
| "What kind of leader am I becoming?" | **member** | member-authored |
| "Your coach shared this resource" | practitioner | attributed |

Rendered in one voice, the field would tell a member their coach's framing as if it were
their own. That is a direct violation of Activation Model **§7.3** (coach-stated content
stays visibly attributed) and of the Direction of Authority.

> **Constraint: the field is visually unified and epistemically differentiated.**
> One surface, many authors, each still legible. Attribution is not metadata to be tidied
> away in the name of simplicity — it is the thing that makes the simplicity honest.
>
> The car analogy holds for *mechanism*, not for *authorship*. A driver need not know how
> the engine works. A member must always be able to know **who said this about me.**

#### Risk B — "What matters right now" is a salience judgment

A cockpit that surfaces *what matters now* and *what comes next* is **ranking**. The current
Home states the opposite commitment explicitly: *"not ranked, not summarised, not scored,"*
held *"in the order you kept them."*

Assembly is safe where ordering is a **fact**:

- ✅ the next session is Thursday — chronology
- ✅ Week 4 of 8 — the practitioner's authored sequence
- ✅ the practice the member committed to most recently — recency of a member act

Assembly is **not** safe where ordering implies a judgment MAIA is not authorized to make:

- ⛔ "this decision is the important one"
- ⛔ "you should focus on delegation"
- ⛔ any surfacing that reads as *this matters more than that*

> **Constraint: the field may assemble authored facts. It may not synthesize meaning or
> rank significance.** Where the cockpit appears to prioritize, the priority must come from
> a real, attributable source — the calendar, the practitioner's sequence, or the member's
> own most recent gesture — never from an inference.

**§9.6 records the open question this leaves: who authors salience?** It is the single
largest unresolved question in this architecture, and it cannot be settled by implementation.

---

## 4. Object mapping — no new tables

Every proposed area maps to tables that already exist.

| Area | Existing objects | New schema? |
|---|---|---|
| **My Programs** | `field_programs` (`kind IN coaching/training/workshop/course/retreat`, `focal_points[]`, `current_focal_point`) · `field_program_positions` · `client_groups` · `client_group_members` · `practice_fields` | **none** |
| **Prepare** | `field_program_lessons.reflection_prompt` · `field_program_lessons.purpose` · `sessions` · `group_sessions` · `practitioner_availability` · `calendar_events` · `session_join_tokens` · `member_field_note_threads` tag `question` | **none** |
| **My Work** | `field_program_lessons.practice` · `member_field_note_threads` tag `practice` · `practice_sessions` · `practice_streaks` | **none** |
| **Explore** | `member_field_note_threads` (`decision` · `question` · default→reflection) · `conversation_themes` · `session_insights` · `reflection_capsules` | **none** |
| **Connect** | `practitioner_clients` · `client_relationships` · `practitioner_messages` · `client_messages` · `client_group_members` · `team_dm_threads` · `community_*` | **none** |
| **Library** | `library_sources` (ratification lifecycle) · `field_program_lessons.material_ids[]` · `practitioner_materials` · `practitioner_files` · `practitioner_file_shares` · `media_assets` | **none** |

### The decisive detail

`field_program_lessons` (migration `20260714000001`) already carries, **per focal point**:

```
purpose             → Prepare (why this step)
reflection_prompt   → Prepare (what to bring)
practice            → My Work
material_ids[]      → Library (ratification re-checked at read time)
```

**Prepare, My Work and Library are three readings of one practitioner-authored lesson
row.** The authoring side is built; the member-side read is not.

---

## 5. Gap analysis — built vs. wired

| Capability | Schema | Practitioner authoring | Member read | Gap |
|---|---|---|---|---|
| Programs | ✅ | ✅ `/api/practitioner/programs` | ⚠️ position only | **wire** |
| Lessons (prep/practice/materials) | ✅ | ✅ | ❌ none | **wire** |
| Groups / cohorts | ✅ | ✅ `/api/studio/groups` | ❌ none | **wire** |
| Sessions / scheduling | ✅ | ✅ | ❌ none on Home | **wire** |
| Library / materials | ✅ | ✅ (ratification) | ❌ none on Home | **wire** |
| Practitioner messaging | ✅ | ✅ | ❌ none on Home | **wire** |
| Explore (threads) | ✅ | n/a | ✅ live | — |

**Six of seven capabilities are built and unwired.** None needs a migration.

---

## 6. Migration approach

Composition-first, no schema. Each phase is independently reviewable and reversible.

| Phase | Change | Schema |
|---|---|---|
| **P0** | Extend `GET /api/now-what/home` to read `field_programs` by **enrollment**, not only by position. Closes D5. | none |
| **P1** | Re-shape `ClientHome.tsx` into the six areas. Pure presentation over the existing payload plus P0. | none |
| **P2** | Compose `field_program_lessons` into Prepare · My Work · Library. | none |
| **P3** | Compose sessions/scheduling into Prepare. | none |
| **P4** | Compose Connect (practitioner + group). | none |
| **P5** | Program detail surface (`Enter Program`). | none |

Constraints: member-scoped reads only; no practitioner read of member positions
(unaffected and unaffectable from the program tables); unratified material composes as
nothing; every phase preserves the Sanctuary and consent boundaries already in force.

---

## 7. Gesture constraint — carried from the ruling

Activation Model §7.1 governs every label in this IA. The UI exposes **gestures, not
database objects.**

| ⛔ Object-named | ✅ Gesture |
|---|---|
| Create Decision | Work through something |
| Create Commitment | Choose what you want to practise |
| Add Reflection | Capture what you want to remember |
| Manage Field Object | — (never surfaced) |

Also still binding from §7:

- **MAIA proposes meaning; the member declares it.** The tag is a member-authority act.
- **Coach-stated content stays visibly attributed** — *"Your coach identified this as a
  focus"*, never rendered in the member's own voice. `stated_by` /
  `member_confirmed_at` already carry this.
- **Sequence:** `Object → Relationship → Gesture → Surface`, never
  `Surface → Button → Object`.

---

## 8. Practitioner activation

The member Home populates **dynamically from what the practitioner activates.** Sarah
creates "Leadership Cohort" ⇒ the member sees it under My Programs, and inside it: Prepare
(session prep), My Work (practice), Explore (reflections), Connect (Sarah + cohort),
Library (resources). No member-side configuration.

Practitioner may create programs · groups · classes · coaching containers; and inside each,
add sessions · resources · practices · preparation prompts · communications. **The authoring
APIs for programs, lessons, materials and groups already exist.**

---

## 9. Open questions — require ruling before build

1. **Enrollment object.** What makes a member "in" a program — a `field_program_positions`
   row, `client_group_members`, `practitioner_clients`, or an explicit enrollment fact?
   Today it is inferred from position, which is why D5 exists. **This is the P0 blocker.**
2. **Reflection ontology** (open edge, Activation Model §7.4). Is Reflection (A) an act the
   member initiates, or (B) the return surface where meaning appears after a keeping
   gesture? Under this IA it lands in **Explore** — which leans toward (B) but does not
   settle it. Still requires explicit closure.
3. **Does My Work display practitioner-assigned practice the member has not accepted?**
   Bears directly on the no-compliance boundary.
4. **Community scope.** `community_*` is a large existing surface; is it in scope for
   Connect, or deferred?
5. **Does Explore keep a door into the room, or is the room entered from a program?** Model
   3 says the room is the hearth, not the destination — this decides where the hearth sits.

---

## 10. Success criteria

A new member immediately understands: *Where am I? What am I part of? What can I do next?
How do I work with my coach? Where do my insights and practices live?*

The member never needs to understand the internal MAIA/AIN object model. **The platform
feels like a home, not a database interface.**

---

## 11. What this document does not authorize

- ⛔ No code. Review first, per Implementation Rule 3.
- ⛔ No migration. If any phase appears to need one, that is a finding to bring back here.
- ⛔ No fix to D1–D5 as standalone patches.
- ⛔ No copy written before the gesture-vocabulary artifact exists (§7).
