# ADR-007: Person, Relationship, and Participation as separate authority domains

**Status:** Accepted
**Date:** 2026-06-27
**Authors:** Kelly Nezat, Claude
**Reviewers:** Kelly Nezat

## Context

Studio began as client management: the only person record was `practitioner_clients`, the
only API was `/api/studio/clients`, and the navigation said "Clients." But a practitioner
stewards an ecosystem of relationships — clients, colleagues, mentors, referral partners,
prospective members, friends, family, collaborators, organizations — and people who merely
*participate* in one encounter (a guest speaker, a workshop attendee, a family member
sitting in) without ever becoming a saved contact or a member.

Modeling all of this as "types of client" collapses concepts that have **different sources
of authority, different lifecycles, and different governance rules**. Conflating them now
produces a foundation that has to be redesigned later to grow from individual sessions into
groups, organizations, referrals, mentoring, teaching, and communities.

## Decision

Studio's people model is organized around **three enduring concepts**, kept distinct:

| Concept | What it is | Authority | Lifecycle |
|---|---|---|---|
| **Person** | a human identity | the human exists | stable |
| **Relationship** | how *this* practitioner knows that person | the practitioner's private declaration | starts, deepens, ends, archives |
| **Participation** | how a person took part in a *specific* encounter | the encounter happened | per-encounter |

Membership (an independent, sovereign MAIA account) is a **fourth, orthogonal** axis whose
authority is the person's *own* consent — never implied by being known to a practitioner.

We adopt these **additively**, in this order of maturity, and name what is transitional:

1. **Person** — `practitioner_clients` is the person record today. It is **not renamed** yet
   (10+ FKs and ~12 callers depend on the name), but a `practitioner_people` **view** gives
   the vocabulary-correct surface now and is the seam for the eventual rename.
2. **Relationship** — represented **transitionally** as `practitioner_clients.relationship_roles
   TEXT[]` (orthogonal labels: `client`, `trusted-contact`, `colleague`, `mentor`,
   `referral-partner`, `guest`, …). This is the correct *first* step, but it is explicitly a
   placeholder for a first-class `practitioner_relationships` entity. Promote it the moment a
   relationship needs its **own** lifecycle/authority: `started_at` / `ended_at`, notes,
   permissions, visibility, trust level, archive state. Those belong to the relationship, not
   the person.
3. **Participation** — a first-class table **now**: `encounter_participants`. Everyone
   participates, not only guests; `participant_role` (guest, client, practitioner,
   co-facilitator, observer, interpreter, family-member, …) is the role *in that encounter*,
   distinct from the standing relationship. Each row references a saved Person (`person_id`)
   or an anonymous identity (name/email).

**Promotion preserves authorship.** A guest does not become a permanent record by attending.
The practitioner explicitly chooses "save as contact," which creates/links a Person and sets
`encounter_participants.person_id` — and even then never rewrites how they participated.

**Declared ≠ Observed (invariant).** A *declared* relationship ("mentor") is the practitioner's
authority; *observed* interaction ("17 conversations") is a platform summary. The platform may
summarize interaction history but must **never** overwrite the declared relationship. In code
today these are already separate fields (`relationship_roles` vs computed session counts);
this separation must survive the move to a first-class Relationship entity.

**No automatic crossing.** Adding a participant, saving a contact, or linking a member writes
only Studio-side tables (`encounter_participants` / `practitioner_clients`) — never `members`,
`member_memory_atoms`, or `case_memories`. Practitioner data never migrates into a person's
sovereign space without explicit, separate consent.

## Consequences

### Positive

- One person, many relationships — no duplicate records for someone who is both a colleague
  and a client.
- Groups, events, workshops, and circles get a real participation model immediately, without
  forcing every attendee into the contact list.
- Each concept can evolve on its own clock; the additive steps are reversible and ship
  independently.

### Negative

- Two transitional shapes carry naming debt until promoted: `practitioner_clients` (the table
  name) and `relationship_roles[]` (relationship-as-column). This ADR is the standing record
  of that debt so it is paid deliberately, not forgotten.
- Relationship lifecycle data (started/ended/visibility/trust) cannot be stored until the
  Relationship entity is promoted; until then those needs are deferred, not met.

### Neutral

- `participant_role` and relationship roles share some labels (e.g. `client`, `family`) but on
  different axes; this is expected, not duplication.

## References

- Migrations: `database/migrations/20260627000001_practitioner_clients_relationship_roles.sql`,
  `database/migrations/20260627000002_encounter_participants.sql`
- APIs: `app/api/studio/people/route.ts`, `app/api/studio/participants/route.ts`
- Heuristic: separate-by-authority-source (project memory `feedback_separate_by_authority_source`)
- Plan: `~/.claude/plans/sunny-discovering-journal.md`
