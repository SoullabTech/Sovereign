# Coach Field foundation — two load-bearing invariants

**Date:** 2026-08-02 · **Status:** RECORDED with the foundation they govern, before any
service or UI depends on them. Both are founder-ruled. Neither may be relaxed by a
downstream lane without a new ruling.

These are written here, in the repository, rather than only in a session's memory, because
**every downstream practitioner service will depend on them** and a rule that lives only in
a conversation is not a rule anyone can inherit.

---

## Invariant 1 — `practitioner_id` has no freestanding meaning

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

## Invariant 2 — ending a relationship is not deleting it

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
