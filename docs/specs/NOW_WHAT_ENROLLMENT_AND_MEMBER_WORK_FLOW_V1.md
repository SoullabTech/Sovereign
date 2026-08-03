# Enrolment and Member Work — flow v1

**Date**: 2026-08-03
**Status**: DRAFT for ruling. **Does not authorize implementation.**
**Depends on**: Steps 1–2 ruled 2026-08-03 —
canonical identity = `coach_program_definitions.id`;
link direction = `field_programs.program_definition_id → coach_program_definitions.id`.

> Programs provide structure. Enrolment creates participation.
> Home provides orientation. Field preserves meaning.

---

## 0. The blocking finding

**The schema cannot currently represent an invitation. Writing an enrolment row
*is* the enrolment.**

```sql
coach_program_enrollments_status_check
  CHECK (status = ANY (ARRAY['enrolled','paused','completed','withdrawn']))

status       DEFAULT 'enrolled'
enrolled_at  DEFAULT now()
```

There is no `invited` state, no `declined` state, and the defaults enrol on
insert. So the only enrolment the current schema supports is **the practitioner
placing a member into a programme silently** — precisely what the ruling
forbids ("No silent enrollment").

This is the one place the *"no new database objects"* claim breaks, and it
breaks at the sovereignty-critical seam. **Step 3 cannot be built as ruled
without a forward-only migration.**

**Recommended migration (minimal, additive):** widen the CHECK to
`('invited','enrolled','declined','paused','completed','withdrawn')`. Every
existing value stays valid; no row is rewritten. This mirrors the precedent
already set by `20260730000002_practitioner_visibility_withdrawn_event.sql`,
which widened an accepted set rather than replacing it. `enrolled_at` should
become nullable, or be left unset until acceptance and read as "the moment the
member entered" — it must not be stamped by an invitation.

⚠️ Before designing this route, check `lib/coachField/invitation.ts` — an
invitation concept already exists in the coach field and may already carry the
offer/accept semantics. Do not build a second one.

## 1. Program creation — *practitioner*

Writes `coach_program_definitions` (+ `coach_program_stages`). Already exists:
5 definitions, 0 stages. Creation is complete as a capability and out of scope
for v1.

**Invariant**: creating a programme touches no member and produces no member-visible object.

## 2. Invitation — *practitioner offers*

An invitation is **an offer, not a placement**.

- Scope: enrolment hangs off `coach_client_processes.process_id`, which hangs off `relationship_id → practitioner_clients`. **An invitation therefore presupposes an existing practitioner–client relationship.** A practitioner cannot invite a stranger, and a member cannot self-join a programme they have no relationship with. That is a structural guarantee, not a policy — and it resolves D2 option B: member self-join is not reachable in this schema.
- Writes: one row, `status='invited'`, `enrolled_by_member_id`=practitioner, `enrolled_at` **unset**.
- Produces: a member-visible offer. Nothing else. No field material, no position, no thread.

## 3. Enrolment — *member chooses*

The member sees:

```
You have been invited into Leadership Presence
by Sarah · 8 weeks

[ Join ]   [ Learn more ]   [ Not now ]
```

| Choice | Effect |
|---|---|
| **Join** | `status='enrolled'`, `enrolled_at=now()`. Access begins. |
| **Learn more** | Reads `client_facing_language` + stages. **No write.** |
| **Not now** | `status='declined'`. Reversible by a later invitation; leaves no mark on the member's field. |

**Invariants**
1. **No silent enrolment.** Only a member act moves `invited → enrolled`.
2. **Enrolment creates access, never field material.** No Field Object, no position, no thread is created by joining.
3. **Declining is not a failure state** and is never reported as one.

## 4. Home projection — *"My Work", not "My Programs"*

Home leads with current work; the programme is the organizing context.

```
MY WORK

Leadership Presence · with Sarah

You are here:   Difficult conversations
Next:           Prepare for Thursday
Practice:       Your experiment this week
Explore:        Your current leadership edge
Connect:        Sarah + cohort
```

Sources per line — all existing reads:

| Line | Source |
|---|---|
| You are here | `field_program_positions` (member-stated or confirmed) |
| Next | `coach_program_stages` via `current_stage_id` |
| Practice | threads tagged `practice` + `stages.default_practice` (offered, unaccepted) |
| Explore | threads tagged `decision` / `question` |
| Connect | `coach_cohorts` / `client_groups` + practitioner |

⚠️ `coach_program_stages.expected_offset_days` is the column most likely to
become a compliance signal. It may determine what is **available**. It may never
render as whether the member is on schedule, behind, or complete.

## 5. Member gestures

Unchanged from the verified set — all member-only, all already working:

| Gesture | Result |
|---|---|
| "This is where I am" | `field_program_positions` |
| "I am carrying this choice" | thread `decision` |
| "I want to practise this" | thread `practice` |
| "I am living with this question" | thread `question` |
| "I want to keep this" | thread, untagged |
| "I choose to share this" | `can_be_shown_to_practitioner` |

A programme may **offer** a practice (`stages.default_practice`). Only the
member's acceptance makes it theirs — an offered practice is not a commitment.

## 6. Field Object emergence — **optional, never automatic**

```
Program → Enrolment → Experience → Member meaning-making → Field Object (optional)
```

The Home asks *"what am I engaged in?"* The Field asks *"what is becoming part
of me?"* **Home is not the archive.** Joining a programme never asserts that the
work is part of the member's identity, is wanted in memory, or belongs in their
enduring field. Only a member gesture crosses that line.

## 7. Practitioner visibility rules

| Practitioner sees | Basis |
|---|---|
| programmes they invited the member into | their own offer |
| enrolment status + stage position | access they granted |
| agreed practices | member acceptance |
| explicitly shared threads | `can_be_shown_to_practitioner = true` |

| Practitioner never sees | |
|---|---|
| unshared decisions, questions, reflections | member-only by default |
| the member's own field position wording | unless shared |
| whether the member opened the Home, or how often | no activity record exists |

Sharing is **per-thread, default false, member-initiated**. Withdrawal ends
practitioner access without touching the member's own copy. ⚠️ Sharing remains
**asymmetric**: a member can share at authoring and withdraw later, but there is
no path to share an already-authored thread. Unresolved (Q4).

---

## 8. Open, blocking

1. **Approve the status-CHECK widening?** Without it, Step 3 cannot be built as ruled. This is the only schema change v1 requires.
2. **Does `lib/coachField/invitation.ts` already cover the offer/accept flow?** Must be read before any route is designed.
3. **Reflections Model B** — removes the Reflections door from candidate `d8fb19794` before merge.
4. **Does "Continue" open a conversation?** If yes, chat re-enters through every room.
5. **Group visibility boundary** — nothing in Connect ships before it is ruled.
