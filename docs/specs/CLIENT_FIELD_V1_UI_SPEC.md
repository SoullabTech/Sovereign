# Client Field v1 — UI spec

**Date**: 2026-08-03 · **Status**: for implementation.
One page. Five zones. No object taxonomy.

> The member should never think *"I need the Decisions module."*
> They should think *"I am working on this. What is next?"*

---

## 1. Wireframe

```
MY WORK FIELD

┌─ CURRENT WORK ─────────────────┐   what am I working on
│ Program · focus · context       │   [ Make this my focus ]
├─ PREPARE ──────────────────────┤   what do I do next
│ Before your next session        │   [ Prepare for your session ]
├─ MY PRACTICE ──────────────────┤   between sessions
│ Experiments · commitments       │   [ Name what you want to practise ]
├─ EXPLORE ──────────────────────┤   after sessions
│ Questions · decisions · kept    │   [ Carry a decision ] [ Name a question ]
├─ CONNECTION ───────────────────┤   who am I with
│ Practitioner · sessions · group │   [ Continue a conversation ]
└─────────────────────────────────┘
```

## 2. Component map

| Zone | Data (all existing reads) | Door | Live today |
|---|---|---|---|
| **Current Work** | `journey` ← `field_program_positions` | `JourneyCompose` → `POST /program-position` | ✅ needs a field |
| **Prepare** | `coach_program_stages` · resources | *(gated on enrolment)* | ⛔ 0 rows |
| **Your work** | threads `decision` · `practice` · `question` | `Compose` ×3 | ✅ |
| **What you discovered** | threads untagged | *(no door — Model B)* | ✅ |
| **Connection** | `sessions` · `shared` | session room · withdraw | ✅ |

Four of five zones render real member data today. **Prepare is the only zone
gated on enrolment** — it states that honestly rather than rendering blank.

## 3. The empty-room rule (ruled 2026-08-03)

> **Rooms are visible when the capability exists; meaning is visible only when
> the member has created it.**

Capability exists, no content → **show the room**, in relational language
("Your decisions, practices and questions gather here as you work").
Capability does not exist → **do not render the door**. It is not a room yet.

This dissolves the apparent conflict between *"expose the gap, don't pretend"*
(about the system's internal truth) and *"don't render empty sections"* (about
the member surface). Both refuse pretense; only one is about implementation debt.
Show the room. Do not show the absence.

## 3b. Rules

1. **Reflections have no door** (Model B, ruled). They appear inside Explore because they were kept elsewhere.
2. **Only Connection routes to conversation.** Every other zone's primary action creates its own object.
3. Zone headings are member language. `Decision`, `Commitment`, `Field Object`, `thread` never appear in the UI.
4. No score, streak, percentage, completion count, or "recent" label.
5. Sharing stays per-thread, default off, withdrawable.

## 4. Retired

The six taxonomy bands — My Journey · Decisions · Commitments · Sessions ·
Reflections · Coach Connection — are replaced, not renamed. Their reads are
re-projected into the five zones; no storage changes.

## 5. What v1 must NOT pretend to support

The participation layer does not exist — three invitation mechanisms compete and
none carries programme enrolment (see `NOW_WHAT_ENROLLMENT_AND_MEMBER_WORK_FLOW_V1.md` §9).
v1 therefore truthfully supports member-confirmed positions, member-created
field material, and existing session context — **and must not imply**:

- practitioner-assigned programmes
- automatic preparation flows
- cohort participation
- coach-created commitments

**Prepare states its own gap without describing a mechanism, and does not route to conversation.** Copy that
forward-promised *"what they have laid out for the next stretch appears here"*
was removed: the shape of practitioner-side preparation is not ruled, so v1 may
not describe it. An honest empty beats a dead module; an honest empty that makes
no promise beats both.

## 6. Then

Test with one practitioner + one member on the member surface only.
**No `pending` migration, no enrolment writes, no practitioner-side expansion**
until the canonical invitation/participation model is ruled.
