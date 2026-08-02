# Coach Field foundation — three load-bearing invariants

**Date:** 2026-08-02 · **Status:** RECORDED with the foundation they govern, before any
service or UI depends on them. Both are founder-ruled. Neither may be relaxed by a
downstream lane without a new ruling.

These are written here, in the repository, rather than only in a session's memory, because
**every downstream practitioner service will depend on them** and a rule that lives only in
a conversation is not a rule anyone can inherit.

---

## Invariant 1 — the relationship is the bridge; the member remains the person

> **`members` models persons. `practitioner_clients` models bounded professional
> relationships. Developmental processes, enrollments, notes, sessions, commitments and
> cohorts belong to the relationship, not directly to the person.**

This is the ground the other two stand on. It is the answer to *why* `practitioner_clients`
became canonical rather than a new table: a person is not a caseload entry, and a caseload
entry is not a person. Everything a practitioner does is done **within a bounded
relationship**, and that boundary is what makes the work legible, scopeable and revocable.

The schema says it out loud. Every record of the work carries `relationship_id`:

```
coach_client_processes · coach_program_enrollments (via process) · coach_sessions
coach_authored_notes · coach_note_publications · coach_work_items · coach_important_dates
coach_follow_ups · coach_resource_recommendations · coach_cohort_memberships
coach_client_shared_items · coach_position_shares · coach_position_share_consents
```

**The nuance that makes it precise.** Those tables also reference `members`, but every such
reference is **authorship** — *who did this* — never **ownership**. `originated_by_member_id`,
`published_by_member_id`, `changed_by_member_id`, `recorded_by_member_id`: all answer "which
person performed the act", none answer "whose record is this".

Exactly two tables are **person-owned**, keyed on `members.id` with **no `relationship_id`
at all**:

| Table | Why it belongs to the person, not the relationship |
|---|---|
| `coach_client_personal_notes` | the client's own private notes. They exist whether or not any practitioner does. |
| `coach_client_selected_focus` | which process the client is attending to. Their attention is theirs. |

That absence is the enforcement. There is no practitioner-scoped path to those rows —
not guarded, **absent** — because a practitioner query starts from a relationship, and those
tables have no relationship to start from. The boundary gate asserts this structurally
(`1a`/`1b`), so a future migration that "helpfully" adds `relationship_id` to either one
fails the gate rather than quietly opening a door.

**The test to apply to any new table:** does this record exist because of a professional
relationship, or does it exist because the person exists? The first gets `relationship_id`.
The second must never get one.

---

## Invariant 2 — `practitioner_id` has no freestanding meaning

> **`practitioner_id` has no freestanding meaning. Its identity domain is established by the
> table contract. Translation between practitioner-profile identity and member identity
> occurs once, behind typed boundaries.**

This is not defensive style. The live schema proves the ambiguity:

| Table | `practitioner_id` references |
|---|---|
| `practitioner_clients` | `practitioners(id)` — the **practice record** |
| `practitioner_client_notes` | `practitioners(id)` — the **practice record** |
| `client_invites` | `members(id)` — the **person** |
| `practitioner_sessions` | `members(id)` — the **person** |

Four tables, one column name, two different referents. Any code that writes
`a.practitioner_id = b.practitioner_id` across that boundary is comparing a practice to a
person, and it will authorize the wrong human without erroring.

**Where the translation lives:** `lib/coachField/identity.ts`, and nowhere else.

```
resolvePractitionerRecordFromMember(memberId)      members.id -> practitioners.id
resolvePractitionerMemberFromRecord(recordId)      practitioners.id -> members.id
authorizePractitionerClientRelationship(actorMemberId, relationshipId)
```

`PractitionerRecordId`, `MemberId` and `RelationshipId` are branded types: passing one where
another is expected fails to typecheck. That is the point — the invariant is enforced by the
compiler rather than by everyone remembering it.

**Rules for every downstream service:**

1. No route improvises the translation.
2. Scope derives from the authenticated actor, server-side. A caller never submits an
   authoritative `practitioner_id` or an ownership claim.
3. `authorizePractitionerClientRelationship` returns `null` rather than throwing when the
   actor has no standing, so callers cannot distinguish "does not exist" from "not yours"
   and leak the difference.

**Why no table below the relationship carries a bare `practitioner_id`:** a practitioner is
reached only through `relationship_id`, and an actor is recorded as an explicit pair
(`*_member_id` and/or `*_practitioner_id`) so the referent is never inferred from a name.

---

## Invariant 3 — ending a relationship is not deleting it

> **Once a practitioner–client relationship has authored history, ending the relationship is
> a lifecycle transition. Hard deletion is unavailable to application code.**

Append-only triggers on `coach_enrollment_stage_history`, `coach_note_publications` and
`coach_position_shares` refuse `DELETE` — **including a `DELETE` arriving via cascade**. So a
relationship that has accumulated history cannot be removed by deleting its parent row. This
is the ruling working, not a defect to route around: a person's developmental history is not
a row to be reclaimed.

**The lifecycle that replaces deletion.** `practitioner_clients.relationship_status`:

| State | Meaning |
|---|---|
| `pending` | invited; no member identified yet. Must carry a member or an invitation address. |
| `active` | live. Readable and writable. Exactly one per practitioner + member. |
| `paused` | suspended. Readable, **not** writable — work is on hold, not erased. |
| `ended` | terminated. Present access is revoked immediately; history is retained. Requires `relationship_ended_at`. |

`ended` revokes access at the authorization layer the moment it is set —
`authorizePractitionerClientRelationship` grants nothing beyond a live relationship. It does
not touch a single historical record.

**`archived` was deliberately NOT invented.** The four states above are what this foundation
committed; nothing else may be introduced silently in code. If a distinction between "ended"
and "archived" is wanted, it is a ruling, not a refactor. (Legacy
`practitioner_clients.status` carries other vocabularies — `invited` / `waitlist` /
`inactive` / `completed` — and is deprecated and deliberately not mirrored, because the three
historical definitions disagree and any automatic mapping would invent meaning the source
never carried.)

**Re-engagement is supported and does not overwrite anything.** Uniqueness binds only
*active* relationships and *pending* invitations, so ending one relationship and starting a
new one leaves the first intact as history.

**The one permitted suspension.** The evidence harness
(`scripts/verify-coach-field-boundaries.ts`) suspends those triggers to clear its own
fixtures. That suspension is explicit, local to one transaction, restored in the same
transaction, and confined to an isolated test database. **No production helper, service, admin
route or migration may expose that capability.** If a future migration genuinely needs to
move historical rows, it does so deliberately and under review — never through a general
"force delete" affordance.
