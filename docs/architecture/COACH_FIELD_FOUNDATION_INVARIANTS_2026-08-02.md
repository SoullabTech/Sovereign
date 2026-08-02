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

**The precise rule for the second** — person-owned does not mean unshareable:

> A person-owned **source** record must not acquire `relationship_id` as an ownership key.
> Any relational sharing must occur through a separate consent or publication object.

So a member may share a personal note with a practitioner. What they must never do is
*attach the private source itself* to Larry's relationship. Sharing creates a distinct
object — a consent row, or a snapshot pointed at from an authorized relationship — while the
source stays owned by the person and stays unreachable from a practitioner-scoped query.
That is the same shape as `coach_note_publications`: the practitioner's private note is not
made visible, a separate delivery object is created.

This wording matters in both directions. Without it, a later developer might attach the
private source directly to a relationship because "it's shared anyway", or conclude that
person-owned material can never be shared at all. Neither is correct.

**Structural privacy is not encryption.** These assertions prove that no *practitioner
relationship path* reaches a person-owned record. They prove nothing about database
administrators, backups, logs, exports, a future unrelated query path, or data at rest.
Confidentiality of the content itself is a separate protection, met by the encryption
contract — see the note on the content lane in the evidence document.

---

## Invariant 2 — `practitioner_id` has no freestanding meaning

> **`practitioner_id` has no freestanding meaning. Its identity domain is established by the
> table contract. Translation between practitioner-profile identity and member identity
> occurs once, behind typed boundaries.**

This is not defensive style. The live schema proves the ambiguity, and it is **repository-wide**:

> **68 tables carry a `practitioner_id` foreign key. 38 reference `practitioners(id)` — the
> practice record. 30 reference `members(id)` — the person.**

Examples on either side: `practitioner_clients`, `practitioner_client_notes`, `academy_paths`,
`availability_overrides` → `practitioners(id)`. `client_invites`, `practitioner_sessions`,
`case_notes`, `client_messages`, `client_portal_tokens`, `booking_funnels` → `members(id)`.

One column name, two referents, across a third of the schema. Any code that writes
`a.practitioner_id = b.practitioner_id` across that boundary is comparing a practice to a
person, and it will authorize the wrong human without erroring.

**What this foundation does and does not claim.** It does **not** resolve the repository-wide
ambiguity, and branded types have not fixed 68 tables:

> The foundation path does not introduce new ambiguous practitioner identity interpretation;
> it routes authorization through explicit identity translation. Existing ambiguous columns
> elsewhere remain a separate migration and inventory concern.

That debt is real and unowned. It is named here so a reader does not mistake a scoped
resolution for a repository-wide one.

**Where the translation lives:** `lib/coachField/identity.ts`, and nowhere else.

```
resolvePractitionerRecordFromMember(memberId)      members.id -> practitioners.id
resolvePractitionerMemberFromRecord(recordId)      practitioners.id -> members.id
authorizePractitionerClientRelationship(actorMemberId, relationshipId)
```

`PractitionerRecordId`, `MemberId` and `RelationshipId` are branded types: passing one where
another is expected fails to typecheck.

**Branding is not the enforcement, and this document previously overstated it.** A branded type
erases at runtime, and `asMemberId` / `asPractitionerRecordId` / `asRelationshipId` are exported
unguarded casts — so a caller *can* construct one from a raw string. Branding provides
compile-time friction, accidental-mixing prevention and API clarity. It does **not** provide
runtime validation, ownership proof, or protection from a caller who means it.

The actual boundary is that **authorization never relies on caller-supplied practitioner
identity**:

```
credential
   ↓  the session, never a request parameter
actor member identity
   ↓  resolvePractitionerRecordFromMember — server-owned, one implementation
practitioner identity
   ↓  authorizePractitionerClientRelationship — joins practitioners→members, returns null without standing
relationship authorization
   ↓
allowed operation
```

Every service in this module takes the actor and derives the rest. None accepts a practice id
as an argument — see `createPendingRelationship`, whose signature was corrected during
acceptance review for exactly that reason.

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

### ⚠️ This invariant is two claims, and only one is enforced today

The wording above states them as one. They carry different authorities and different evidence:

| Claim | Kind | Status |
|---|---|---|
| Ending a relationship revokes present access | **current-state authorization** | ✅ **enforced** — `identity.ts` treats only `active`/`paused` as live, so `ended` yields `canWrite: false` and `canReadMemberShared: false`. Covered by the boundary gate. |
| Ending is the governed lifecycle act, rather than deletion or manual mutation | **transition authority** | ⏳ **not yet enforced** — no service performs the transition. Nothing in `lib/` or `app/` sets `relationship_status = 'ended'`. |

So the honest statement of this foundation's position:

> **The access consequence of ending is enforced. The transition authority that makes ending the
> governed lifecycle operation remains unimplemented.**

The schema holds the coherence rules — an `ended` relationship must carry
`relationship_ended_at`, history refuses `DELETE` — but today a caller would reach that state
by writing the column directly, and no service owns the act.

**`endRelationship()` is deliberately not written here.** The gap was found by tracing
claim → schema → service → evidence, and implementing it now would convert a *discovered gap*
into an *implementation decision* before the questions it depends on are answered. Those are
lifecycle authority questions, not coding questions:

- Who may end a relationship — the practitioner, the member, either?
- May a member *request* ending, and is that a different act?
- Is ending reversible, or is re-engagement always a new relationship?
- Is a reason code required, and who may read it?
- Does ending emit a notice or an event to the other party?
- Does ending preserve invitations, notes, commitments and cohort membership — or only revoke access?

They belong to the service-layer artifact, which can then own the lifecycle transition question
rather than silently inheriting it.

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
