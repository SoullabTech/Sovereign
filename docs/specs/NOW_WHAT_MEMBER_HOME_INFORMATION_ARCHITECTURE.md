# Now What? — Member Home Information Architecture

**Date**: 2026-08-03
**Status**: DRAFT for review. **Does not authorize implementation.**
**Companion**: `NOW_WHAT_MEMBER_FIELD_EXPERIENCE_ARCHITECTURE.md` (experience model);
`../architecture/NOW_WHAT_HOME_ACTIVATION_MODEL_2026-08-03.md` (the finding that started this).

---

## 0. The one-line finding

> **The Home exposes the object model. Members do not think in objects.**
> And underneath, a full programme / group / resource substrate already exists
> and is almost entirely unused — `coach_program_definitions` holds **5 rows**,
> `coach_program_enrollments` holds **0**.

Programmes have been authored. Nobody has ever been enrolled in one. That empty
join table is the entire practitioner→member activation gap, named precisely.

---

## 1. Current state

### 1.1 What the member sees

Six bands on `/now-what`, each named after a backend concept:
My Journey · Decisions · Commitments · Sessions · Reflections · Coach Connection.

Five are empty for a new member. Before the candidate branch, the only action
on the whole page was *→ session room*, so the environment collapsed into chat.

### 1.2 What actually backs it

Home reads **two tables**:

| Read | Table | Bands fed |
|---|---|---|
| threads | `member_field_note_threads` | Decisions · Commitments · Questions · Reflections · Shared · Sessions |
| position | `field_program_positions` | My Journey |

Band assignment is by `spiralogic_phase`, written by the member's own gesture:
`decision`→Decisions, `practice`→Commitments, `question`→Questions, anything
else→Reflections. There is no inference anywhere in the path.

### 1.3 What exists and is NOT surfaced

This is the substance of the finding. All of the following exist in schema today:

| Domain | Tables | Rows |
|---|---|---|
| **Programmes** | `coach_program_definitions` · `coach_program_stages` · `coach_program_enrollments` | 5 · 0 · **0** |
| **Field catalog** | `practice_fields` · `field_programs` · `field_program_lessons` | 2 · 4 · — |
| **Groups** | `client_groups` · `client_group_members` · `coach_cohorts` · `coach_cohort_memberships` | 0 · 0 · — |
| **Group sessions** | `group_sessions` · `group_session_attendance` | 0 |
| **Resources** | `practitioner_resources` · `practitioner_materials` · `coach_resource_recommendations` | 0 · — · 0 |
| **Library** | `library_sources` · `library_chunks` · `library_distillates` | — |
| **Communication** | `team_channels` · `team_messages` · `team_dm_threads` · `team_dm_messages` | — |

`coach_program_stages` already carries `default_practice`, `default_assignment`,
`default_resource_ids`, `client_facing_language`, `expected_offset_days` — a
practitioner-authored programme structure with member-facing language and
suggested practices, fully modelled and never rendered.

---

## 2. Proposed state

Six member-facing sections that answer the five questions
(*where am I · what am I in · what next · what am I exploring · who am I with*).
None of them names an object.

| # | Section | Answers | Voice rule |
|---|---|---|---|
| 1 | **My Programs** | What am I part of? | the container's name, not "field object" |
| 2 | **Prepare** | What is coming? | never "assignments due" |
| 3 | **My Work** | What am I doing between sessions? | **never "homework"** — implies compliance |
| 4 | **Explore** | What am I learning? | where Decisions/Questions/Reflections live |
| 5 | **Connect** | Who am I with? | practitioner · group · community |
| 6 | **Library** | Where are the materials? | — |

### Gesture language (the constraint)

The UI exposes **gestures, not objects**:

| Never | Always |
|---|---|
| Create Decision | Work through something |
| Create Commitment | Choose what you want to practise |
| Add Reflection | Capture what you want to remember |
| Update Field Object | *(never surfaced at all)* |

---

## 3. Object mapping — **no new database objects required**

| New section | Existing objects | New tables? |
|---|---|---|
| My Programs | `coach_program_definitions` + `coach_program_enrollments` + `field_programs` + `field_program_positions` | **none** |
| Prepare | `coach_program_stages` (`expected_offset_days`, `client_facing_language`) + `group_sessions.prep_notes` + threads tagged `question` | **none** |
| My Work | threads tagged `practice` + `coach_program_stages.default_practice` | **none** |
| Explore | threads tagged `decision` / `question` / untagged | **none** |
| Connect | `client_groups` + `client_group_members` + `team_channels` / `team_dm_*` + practitioner relationship | **none** |
| Library | `practitioner_resources` + `coach_resource_recommendations` + `library_sources` | **none** |

The six sections are a **re-projection of existing storage**. The only thing
genuinely missing is not a table — it is *rows in a table that already exists*.

### The one real gap

`coach_program_enrollments` is empty and has **no write path**. Nothing in the
application can enrol a member into a programme. Until that exists:

- My Programs renders empty for everyone, correctly.
- Prepare and Library have nothing to draw from, because both hang off programme structure.
- The Journey gesture 404s (`No such field here`) — verified on the dev server.

**Everything a member can author alone already works. Everything requiring the
practitioner bridge does not exist.** (Verified end-to-end on a local dev server
against a throwaway fixture, rows removed after: decision/practice/question/
reflection writes all 200 and land in the right band; share-at-creation and
withdraw both work; `program-position` 404s for want of a catalog entry.)

---

## 4. Migration approach

Sequenced so nothing renders before it can be true.

**Phase 0 — enrolment write path.** One route: practitioner offers, member
enters. Writes `coach_program_enrollments` only. This unblocks §1, §2, §6 and is
the smallest change that makes the House inhabitable.
*Invariant: assignment creates **availability**, never **ownership**.*

**Phase 1 — re-project the Home.** Rename and regroup the six bands into the six
sections. No storage change; a read-layer and copy change over existing queries.

**Phase 2 — Prepare + Library.** Render `coach_program_stages` and
`practitioner_resources` for enrolled programmes. Read-only.

**Phase 3 — Connect.** Groups and messaging. Requires a boundary model that does
not exist yet (see Q3) — do not start before it is ruled.

**Reversibility**: Phases 0–2 add no columns and no tables. Phase 1 is pure
presentation and revertible by a single commit.

---

## 5. Open questions blocking implementation

1. **Reflections — act or return surface?** Model A (a door) vs Model B (things appear because they were kept). Current lean: **Model B**. Blocks the candidate branch, which builds Model A.
2. **Does "Continue" open a conversation?** If yes, chat re-enters through every room's back door and the collapse returns.
3. **Group visibility boundary.** `client_group_members` exists with no rule for what members see of each other. Nothing in Connect may ship before this is ruled.
4. **Sharing is asymmetric.** `PATCH` supports withdraw only; there is no path to share an already-authored thread. Deliberate or gap?
5. **Two programme models coexist** — `coach_program_definitions` (practitioner-authored) and `field_programs` (field catalog). Which is canonical for My Programs? Mapping them is not a merge; picking wrong duplicates the object.

---

## 6. Success criteria

A new member understands, without being taught the object model:
where they are · what they are part of · what they can do next · how they work
with their coach · where their insights and practices live.

The platform should feel like a home, not a database interface.

---

## 7. Status of related work

- `feature/client-home-executive-copy` — copy tightening (`7ea8f5420`), activation model (`bdacdc006`), working member gestures (`d8fb19794`). **CANDIDATE, not for merge**: conflicts with Q1 and Q2.
- The arrival walk instrument stays pinned to `95b21ce42`, untouched. It did its job — it surfaced this mismatch.
