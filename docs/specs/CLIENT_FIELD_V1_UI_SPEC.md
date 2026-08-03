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
| **My Practice** | threads `practice` | `Compose phase="practice"` | ✅ |
| **Explore** | threads `decision` · `question` · untagged | `Compose` ×2 | ✅ |
| **Connection** | `sessions` · `shared` | session room · withdraw | ✅ |

Four of five zones render real member data today. **Prepare is the only zone
gated on enrolment** — it states that honestly rather than rendering blank.

## 3. Rules

1. **Reflections have no door** (Model B, ruled). They appear inside Explore because they were kept elsewhere.
2. **Only Connection routes to conversation.** Every other zone's primary action creates its own object.
3. Zone headings are member language. `Decision`, `Commitment`, `Field Object`, `thread` never appear in the UI.
4. No score, streak, percentage, completion count, or "recent" label.
5. Sharing stays per-thread, default off, withdrawable.

## 4. Retired

The six taxonomy bands — My Journey · Decisions · Commitments · Sessions ·
Reflections · Coach Connection — are replaced, not renamed. Their reads are
re-projected into the five zones; no storage changes.

## 5. Then

Test with one practitioner + one member. Prepare stays empty until the
enrolment migration (`invited`/`declined`) is approved.
