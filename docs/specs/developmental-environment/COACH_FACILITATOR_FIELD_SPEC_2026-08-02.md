# Coach / Facilitator Field — specification

**Date:** 2026-08-02 · **Author:** Kelly (founder direction) · **Recorded by:** Claude Code
**Status:** RECORDED — not ratified, not implemented. Supersedes the "BACKEND PRACTITIONER SUPPORT" section of the
Now What? developmental-home brief.
**Companion:** `docs/architecture/NOW_WHAT_DEVELOPMENTAL_HOME_AUDIT_2026-08-02.md`

---

## 0. The load-bearing ruling

> **The client home and Larry's practitioner field must be two views of the same developmental process — not two
> separate systems that Larry has to keep synchronized.**

Stated because the alternative is the predictable failure: an attractive client home with a thin administrative
editor bolted behind it. The practitioner field is not support infrastructure attached to the product. It is the
surface through which the living context is actually tended.

Corollary: **one underlying record, two views.** The client experience must never depend on Larry entering the same
information twice.

> *"This practitioner-side experience is not optional support infrastructure. It is one half of the Now What?
> product. The client's oriented arrival cannot be real unless Larry has a coherent, usable way to maintain the
> process that the client is being oriented within."*

---

## 1. Scope

Do not build the practitioner side as a collection of forms for creating notes, assignments, and dates. Build a
coherent coach/facilitator field through which Larry can understand, maintain, and support the ongoing
developmental process of every client.

It must function as a **living caseload and developmental-process environment** — not a generic CRM, and not a
clinical record system.

### The ten questions the field must answer at a glance

1. Who is this person in relation to my practice?
2. What program, engagement, or process are they in?
3. Where are they within that process?
4. What are they currently working with?
5. What have we agreed they will do?
6. What is coming up?
7. What needs my attention?
8. What has been shared with them?
9. What remains private to me?
10. What should be carried into the next session?

---

## 2. Object model

The central objects are no longer just `client`, `program`, and `note`:

```
Practitioner · Client · PractitionerClientRelationship
ProgramDefinition · ProgramStage · ProgramEnrollment · StageHistory
ClientProcess
Cohort · CohortMembership
Session · ImportantDate
Assignment · Practice · Commitment
PractitionerNote · ClientVisibleNote · PersonalNote
SharedItem · ResourceRecommendation · CurrentFocus · FollowUp
```

**`ClientProcess` is the load-bearing object.** It binds the person, practitioner, program or engagement, current
position, commitments, sessions, dates, and continuity — without reducing the client to a profile or forcing every
coaching relationship into a predefined program.

A client may be in: one program · multiple concurrent programs · individual coaching with no named program ·
a cohort-based process · a time-bounded engagement · an open-ended developmental relationship.

**Model each active process explicitly. Do not flatten multiple processes into a single generic "current program"
field.** Larry must be able to move between a client's processes and see both the distinct history and requirements
of each, and the client's overall relationship with his practice.

---

## 3. Practitioner client profiles

A practitioner-facing profile for every client relationship, including where available: name and contact ·
relationship status and start date · active/paused/completed/former · current program(s) · enrollment history ·
cohort membership · current developmental focus · current stage/module/week/phase/position · next and recent
session · upcoming dates · active commitments · homework and assignments · practices or experiments · questions the
client is living · resources recommended · practitioner-visible observations · client-visible notes · items shared
by the client · recent keeps or continuity items · preparation needed · unresolved follow-up · scheduling context.

**Bounds:**
- Not a totalizing dossier. A bounded record of the *relationship* and the processes supported within it.
- No diagnostic labels, psychological scoring, hidden profiling, or automated judgments about the client's
  character, readiness, or developmental capacity.

---

## 4. Position and developmental stage — four distinct axes

Larry must be able to record and update where a client is within each program or process, supporting structured
positions (program · phase · module · week · session · milestone · completion state) **and** practitioner-defined
language where a program has no fixed sequence.

**These four are not interchangeable:**

| Axis | Authored by | Example |
|---|---|---|
| Formal program position | Program structure | "Week 4 of Flourishing" |
| Practitioner-observed developmental stage | Larry | *(private unless explicitly shared)* |
| Client-declared sense of where they are | The client | "I feel like I am beginning again" |
| Current practical focus | Either, explicitly | "Working with belonging and self-trust" |

**Rules:**
- Do not present practitioner interpretation as objective fact.
- Do not expose a private developmental assessment to the client merely because it exists in the backend.
- Where stage language is shown to the client, it must be **explicitly designated client-visible** or drawn from the
  program's established structure.
- **Changing a client's current stage must not rewrite the history of where they have been.** (`StageHistory`.)

---

## 5. Program definitions

Larry defines and manages programs without custom code per client: name · description · owner · active/archived ·
stages/phases/modules/weeks · default practices · default assignments · default resources · milestones · expected
important dates · cohort applicability · optional session sequence · client-facing language · practitioner-facing
guidance.

Templates provide structure while allowing client-specific adaptation. Larry must be able to enroll · place at an
initial stage · advance or move · pause · complete · restart or re-enroll · customize assignments or practices ·
override default dates · add individual context · **preserve the historical record of prior stages**.

---

## 6. Caseload view

Filterable by: active process · program · cohort · current stage · next session · overdue homework · unresolved
follow-up · unread client-shared material · upcoming important date · paused/inactive · preparation needed.

The default view helps Larry recognize **where his attention is needed**. It must not become an analytics dashboard
or rank clients by algorithmic urgency.

Permitted deterministic indicators: session approaching · assignment due · commitment awaiting follow-up · client
shared something new · practitioner promised to send something · no next session scheduled · milestone approaching ·
process paused · preparation incomplete.

**Every indicator must be explainable from visible records.**

> **Do not infer crisis, disengagement, resistance, readiness, or emotional state from silence, missed actions, or
> usage patterns.**

---

## 7. Client profile workspace

Organize around the relationship and process, **not around database object types**. A suitable structure:
Overview · Processes/Programs · Sessions · Commitments and Practices · Homework/Assignments · Schedule and Important
Dates · Shared with Client · Shared by Client · Practitioner Notes · Cohort · Resources · History.

Design direction, not a mandate for a dense tab bar. The test is whether Larry can easily answer: What should I know
before our next session? · What did we agree last time? · What is the client meant to be doing now? · What have they
shared since we met? · What do I need to send or update? · Where are they in the program? · **What will they see when
they return to Now What?**

---

## 8. Easy process updates

Larry must be able to update a client's process quickly, during or immediately after a session: update stage · set
focus · schedule next session · add important date · create homework · assign practice · record commitment ·
recommend resource · write private note · write client-visible note · mark for next-session preparation ·
acknowledge client-shared material · advance/pause/complete a program · add or remove cohort membership.

**A post-session update should be achievable through one coherent flow** — not multiple disconnected administrative
screens.

Supporting affordances: reusable program defaults · assignment templates · practice templates · resource libraries ·
repeatable follow-up patterns · copying an item to several cohort members · individualized editing before sending ·
scheduled visibility dates · due dates · completion/acknowledgement state.

> **Bulk actions must never erase the ability to individualize a client's process.**

---

## 9. Session-to-process continuity

Per session Larry sees: which process it belongs to · the client's stage *at the time* · preparation material ·
recent client-shared items · active commitments · outstanding homework · relevant dates · prior follow-up ·
practitioner-private notes · client-visible follow-up.

After a session he carries forward: updated focus · new commitment · homework · practice · resource · next session
date · client-visible note · private observation · item to revisit.

- Not all sessions belong to a formal program.
- **Do not retroactively change a historical session's program stage when the client later advances.**

---

## 10. Visibility and ownership

Every practitioner- or client-created record carries explicit ownership and visibility. At minimum distinguish:
practitioner-private · visible to the client · shared by the client with the practitioner · visible to a cohort ·
administrative only · program-wide · client-specific.

> **A practitioner-private note must never become client-visible through a default setting, inference, bulk
> operation, or reused component.**

The creation interface must make unmistakable the difference between: *"Note to myself"* · *"Note for the client"* ·
*"Assignment"* · *"Shared resource"* · *"Program update"*. Visibility is shown both at creation and at later review.

---

## 11. Client-facing synchronization

Larry's updates appear coherently in the client's Now What?: stage change updates orientation · homework lands in
active work · scheduling updates upcoming context · an important date appears in the relevant timeline · a shared
note lands in Notes from Larry · a resource becomes an opportunity to learn more · a commitment joins current
commitments · cohort change updates cohort access · completing or pausing changes visible status.

- Do not expose backend terminology or internal administrative fields to the client.
- Do not make the client experience depend on Larry entering the same information in multiple places.
- **One underlying record, appropriately different practitioner and client views.**

---

## 12. Scheduling

Past and upcoming sessions · schedule or record a session · associate with a process · cohort events · milestones ·
assignment due dates · reminders and follow-up dates · confirmed/tentative/completed/cancelled/missed states.

Reuse existing calendar integration. **Do not create duplicate events without reconciliation rules.**

Dates shown to clients must distinguish: confirmed session · suggested date · assignment due date · program
milestone · personal reminder · cohort event.

---

## 13. Homework · Practices · Commitments — three meanings, not one task object

| | Meaning | Completion |
|---|---|---|
| **Homework** | requested or assigned | may have due date and completion/response |
| **Practice** | repeated, explored, lived with over time | may have no completion state; may be ongoing |
| **Commitment** | the client agreed or chose to do it | preserves *who articulated it*; client-originated vs practitioner-proposed |

Each records: creator · source · date · associated process · visibility · due date or duration · current state ·
completion or acknowledgement · follow-up · history of material changes.

> **Do not make completion tracking punitive or gamified.**

---

## 14. Cohort management

Create or identify a cohort · associate with a program · add/remove members · start and end dates · schedule cohort
events · share cohort-wide prompts, assignments, practices, notes, resources · see which material is cohort-wide vs
individual · individualize a cohort item for one client.

> **Never expose one member's personal notes, conversations, homework responses, practitioner observations, or
> private process information to another cohort member.**

---

## 15. Minimum usable practitioner experience (acceptance)

Without database access or developer assistance, Larry can:

1. Open his client field · 2. Find a client · 3. See every active process and program for that client ·
4. Understand where the client is in each process · 5. See the next session and important dates · 6. Review current
commitments, homework, and practices · 7. See material newly shared by the client · 8. Update the client's stage or
focus · 9. Assign or modify homework · 10. Add a practice or commitment · 11. Schedule or update a session ·
12. Add a private note · 13. Send a client-visible note · 14. Recommend a resource · 15. Add or update cohort
membership · 16. **See exactly what the client will encounter on return** · 17. Prepare coherently for the next
session.

---

## 16. What this spec reverses — and the one question it leaves open

Recorded, not decided. This section is the reason the spec is `RECORDED` rather than `RATIFIED`.

### 16.1 Reversal: enrollment becomes practitioner-administered

`database/migrations/20260712000001_field_programs_and_positions.sql` encodes the opposite as an *authority split,
not a schema convenience*:

> *"Enrollment is declared by arrival, not administered by roster… **There is no enrollment table, no roster**, no
> departed-status graveyard — departure hard-deletes."*

This spec's `ProgramEnrollment` + `StageHistory` + *"enroll a client… advance or move them… pause… restart or
re-enroll them… preserve the historical record of prior stages"* is a **deliberate reversal** of that ruling, and
answers open decision **D-NW-1 → Option B**.

Consequences that need naming, not just implementing:
- **Departure gets a history.** The old ruling hard-deleted on departure specifically so there would be no churn
  ledger about a person. `StageHistory` + paused/completed/former status creates exactly that record. This may be
  correct for a coaching practice — but it is a change in what the system remembers about someone who left.
- The superseded specs (`NOW_WHAT_PROGRAM_POSITION_SPEC_2026-07-10`, `NOW_WHAT_PROGRAM_CATALOG_SPEC_2026-07-10` §8)
  need explicit supersession, not silent divergence.

### 16.2 OPEN — may Larry read the client's *declared* position?

`field_program_positions` carries a categorical prohibition:

> *"**NO practitioner read of these rows, ever** (catalog spec §8)."*

§4 of this spec lists *"client-declared sense of where they are"* as one of four axes Larry works with. If that axis
is read from `field_program_positions` without a client share gesture, it **breaks §8 directly**.

This is the sharpest remaining question because §0 depends on it: if Larry cannot see where the client says they
are, the "two views of one process" diverge at exactly the point that matters most.

Three coherent resolutions:

- **(i) §8 stands.** Larry sees formal position, his own observation, and current focus — never the client's
  declared position unless the client shares it via the existing share gesture. Preserves the member-sovereign
  boundary; costs Larry the axis he may most want.
- **(ii) §8 narrows to consent.** The client's declared position becomes shareable — visible to Larry only after an
  explicit member act, defaulting private. Consistent with the ratified Field Object promotion ruling
  (*the declaration creates the object, not the source*) and with the anchor/atoms `surface_preference` precedent.
- **(iii) §8 is repealed.** Larry reads declared positions directly. Simplest to build; removes a member-sovereign
  boundary that was written categorically and deliberately.

**Recommendation: (ii).** It gives Larry the axis, keeps the member the author of their own position, and reuses a
consent pattern already live in this codebase rather than inventing one.

### 16.3 Still unanswered from the prior round: D-NW-2

The client-visible note surface (`PractitionerNote` vs `ClientVisibleNote` in §2, §10) rests on
`practitioner_client_notes` — PRs #888/#889/#890, unmerged, **0/12 acceptance criteria verified**, with an
unpatched covenant-gate hole (`class-a` is a category, not a severity rank, so `covenant-gates.yml:127` never fires
rollback discipline) and `sessions.notes` plaintext PHI unruled. This spec **substantially increases** that
dependency — §10's visibility semantics are now load-bearing for the whole practitioner field, not just one panel.
