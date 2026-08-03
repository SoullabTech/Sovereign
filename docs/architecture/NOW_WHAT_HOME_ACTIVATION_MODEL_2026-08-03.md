# Now What? — Client Home activation model

**Date**: 2026-08-03
**Status**: FINDING + proposed model. Not implemented.
**Referent**: `components/now-what/ClientHome.tsx` @ `568cca29b` (deployed `95b21ce42`),
read paths `app/api/now-what/home/route.ts`, write paths under `app/api/now-what/*`.

---

## I. The diagnosis

The Home renders six bands. Five of them are empty for a new member, and every
one of those five offers the same single action: **→ the session room**.

That collapses the environment:

```
My Journey        → (no action)
Decisions         → Work a decision through  → chat
Commitments       → (no action)
Sessions          → Enter the session room   → chat
Reflections       → (no action)
Coach Connection  → (no action)

Net: one live relationship — chat.
```

A house with six labelled rooms and one usable door is not a house. The rooms
read as descriptions of capability rather than capability.

## II. The finding that changes the fix

**The doors are not missing. The backend for five of the six already exists.**
This is a UI omission, not an architecture gap.

Inventory of what is already built and reachable:

| Room | Object | Backing write path | Exists |
|---|---|---|---|
| My Journey | `field_program_positions` | `POST /api/now-what/program-position` — accepts `member_stated`, `practitioner`-seeded, `member_confirmed` | ✅ |
| Decisions | `member_field_note_threads` kind `decision` | `POST /api/now-what/field-note` | ✅ |
| Commitments | same table, kind `practice` | `POST /api/now-what/field-note` | ✅ |
| Questions | same table, kind `question` | `POST /api/now-what/field-note` | ✅ |
| Reflections | same table, kinds `theme` / `closure` | `POST /api/now-what/field-note` | ✅ |
| Coach Connection | thread visibility | `PATCH /api/now-what/field-note/[id]` — `share`, `withdraw_practitioner_visibility` | ✅ |
| Sessions | conversations | session room | ✅ |

Supported gestures on a thread: `create` · `keep` · `revise` · `discard` · `split`.

`HomeThread.sessionRef` is **nullable** — the data model already permits a
decision, practice or reflection authored **without a preceding conversation**.
Nothing in the substrate requires chat to be the way in. Only the UI does.

So the correct question is not "what should activate each room". It is:

> **Why does Home surface only the chat door when five member-initiated doors
> already have write paths?**

## III. The activation model

Each room needs its own **latent state** — a door, not a description — naming
the gesture that opens it and who holds the handle.

| Room | Activated by | Who holds the door | Latent-state action |
|---|---|---|---|
| **My Journey** | member declares a focus · practitioner seeds a programme · member confirms a seeded one | **both**, separately attributed | *Name what you are working on* |
| **Decisions** | member names a decision they are carrying | **member only** | *Name a decision you are carrying* |
| **Commitments** | member names a practice | **member only** | *Name a practice* |
| **Sessions** | an actual conversation | **member** | *Enter the session room* (correctly chat) |
| **Reflections** | member keeps something — from a session **or authored directly** | **member only** | *Keep something* |
| **Coach Connection** | a practitioner relationship exists **and** the member shares a piece | **member** for each share; practitioner may **invite**, never take | *(no action until a relationship exists)* |

Two rules the model must hold:

1. **Only Sessions may route to chat.** If a room's latent action opens the
   session room, that room has no object of its own and the collapse returns.
2. **Practitioner-side activation may place, never author.** `program-position`
   already encodes this (`practitioner` seed → `member_confirmed`). A seeded
   item is visible as *placed by your coach — yours when you say so*. No other
   room currently has a practitioner-seed path, and none should acquire one
   without ruling who may produce that value.

## IV. What is unresolved

- **Practitioner invitation into Decisions/Commitments** — no write path, and
  the authority question ("may a coach open a room in the member's house?") is
  not ruled. Excluded from any first implementation.
- **Whether a directly-authored decision needs a session to become workable** —
  the substrate says no; the intended experience has not been decided.
- **Coach Connection latent state** — needs a real relationship to render
  against; unverifiable until a practitioner link exists in the environment.

## V. Proposed first cut

Add the five member-held latent actions to Home. No new tables, no new
endpoints, no practitioner paths, no changes to what any room *holds*. It is
wiring existing write paths to the surface that already names them.

This is the unit that turns six labelled rooms into six enterable ones.
