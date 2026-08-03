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

---

## 9. Invitation path verification (2026-08-03) — **step 3 is NOT yet safe**

Two bounded checks were run. Both came back against the plan.

### 9.1 Reachability — `coachField/invitation.ts` is orphaned

`acceptInvitation()` and `createPendingRelationship()` have **zero callers in
application code**. The only importer in the entire repo is
`scripts/verify-coach-field-boundaries.ts` — a verification script. The module
exists to be tested, not to be used.

The **live** claim paths are different code:
`app/api/portal/[slug]/invites/claim/route.ts` and
`app/api/portal/[slug]/claim/route.ts`. Both update `practitioner_clients` and
`client_invites`. **Neither touches `coach_program_enrollments`.**

⇒ Adding `pending` to the CHECK would unblock a function nothing calls.
**It would produce no behaviour change.** The prior recommendation (§0) is
therefore premature as sequenced.

### 9.2 `relationship_spaces` is a third path, not an older one

It carries its own `invite_token`, `invite_expires_at`, `invitation_mode`,
`consent_status`, `consent_items`, and an FK `practitioner_client_id →
practitioner_clients`. It has a live accept route (`/api/join/[token]/accept`),
is read by 7 files including the member portal, and holds the only live
invitation row in the database (1).

### 9.3 Corrected picture

| Layer | Reality |
|---|---|
| Invitation model | ✅ exists — **three** implementations |
| Relationship acceptance | ✅ live |
| **Programme enrolment on acceptance** | ❌ **no live path writes `coach_program_enrollments`** |
| Pending state | ❌ blocked by CHECK |
| Code that would use it | ⚠️ orphaned |

The bridge is not "built but disconnected by a state model." The **relationship**
half is built and live. The **enrolment** half exists only as an uncalled
function plus an empty table. `coachField/invitation.ts` is a design of that
segment, kept alive by a boundary test.

### 9.4 The question that now precedes step 3

Which of the three invitation mechanisms is canonical? Same class of question as
program identity — several implementations of one concept, and the one carrying
the capability we want is the one not connected. Ruling that comes before any
constraint change.

**No schema change is recommended until it is ruled.**
