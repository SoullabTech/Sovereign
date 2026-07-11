# Circle Administrator Role — Candidate Spec

**Status:** Candidate (Not Canon)

## Constitutional Boundary

This document defines a **role, not a permission set.**

The constitutional purpose of the Circle Administrator is to describe the
responsibility the role exists to fulfill. The specific permissions granted to
that role are **implementation decisions** that must remain subordinate to this
constitutional purpose and may evolve as observation accumulates.

Responsibilities are constitutional; permissions are implementation. Permissions
drift faster than responsibilities — so a future permission change must never
silently rewrite the role itself.

---

## Purpose

A **Circle Administrator** stewards the operational life of a Circle.

This role exists so a Circle can be created, organized, and maintained without
granting platform-level or constitutional authority.

The Circle Administrator governs **the Circle as a place**, not the
developmental meaning that emerges within it.

---

## Constitutional Position

The Circle Administrator is **not** a Founder.

The Circle Administrator is **not** a constitutional authority.

The Circle Administrator is accountable to existing Circle doctrine and may not
alter it.

---

## Responsibilities

A Circle Administrator may:

* Create a Circle.
* Configure Circle metadata.
* Manage membership.
* Invite and remove participants.
* Configure visibility within existing policy.
* Schedule gatherings.
* Associate the Circle with an approved focus (when that capability exists).
* Archive or close the Circle.
* Manage operational settings.

---

## Explicit Non-Authority

A Circle Administrator may **not**:

* Modify Circle doctrine.
* Override constitutional safeguards.
* Change MAIA's constitutional floor.
* Manufacture recognition or meaning.
* Alter facilitator doctrine.
* Override member consent.
* Access founder-only governance.

---

## Relationship to Other Roles

| Role | Responsibility |
| --- | --- |
| Founder | Constitutional governance |
| Soullab Administrator *(Candidate)* | Organizational operations |
| Practitioner | Stewardship of their own practice |
| Circle Administrator | Stewardship of a specific Circle |
| Facilitator *(Founder-open)* | Stewardship of the Circle process |
| Member | Participation |

**Soullab Administrator** remains explicitly a *candidate* organizational role —
the current observation pilot generates **no** evidence for it. **Circle
Administrator** is directly testable in the Elemental Alchemy pilot, making it
the observation-driven candidate.

---

## Relationship to Facilitator

These roles are intentionally independent.

A person may be:

* Administrator only
* Facilitator only
* Both
* Neither

The current platform does **not** define facilitator behavior. This
specification intentionally does not answer that constitutional question.

---

## First Implementation Scope

The first implementation should remain narrow:

* Existing Circle creation
* Membership management
* Circle configuration
* Existing inquiry permissions only
* No new facilitator behavior
* No MAIA behavior changes

---

## Evidence Required Before Canonization

This role becomes eligible for constitutional promotion only if observation
demonstrates that:

1. Operational stewardship is consistently distinct from facilitation.
2. The permissions remain stable across multiple Circles.
3. No founder authority is required for routine Circle administration.
4. The separation simplifies governance rather than introducing ambiguity.

---

## Falsifier

This candidate fails if repeated observation shows that operational
administration cannot be cleanly separated from facilitation or constitutional
governance. In that case, the role model should be reconsidered rather than
expanded.

---
---

# Implementation Grounding (operational facts — not constitutional text)

Retained from audit so a future build inherits accurate facts. This section
authorizes nothing; it records what exists and what a build would touch.

## What exists today

- `circle_memberships.role CHECK (role IN ('member','helper','facilitator'))`
  — `database/migrations/20260213000004_circles_commons.sql:34`. No
  `administrator`; the word appears nowhere in circles code or canon (clean
  name, no collision).
- Circle-management authority today is **welded to the creator**:
  `lib/circles/inviteService.ts` — "Only the circle creator can generate
  invites"; inquiry close is opener-only. There is no assignable admin role.
- Circle surface gate: `app/commons/circles/layout.tsx:11` → `requireFounder()`.
  No non-founder tier exists.

So the role does two concrete jobs when built: **decouple** management
authority from `created_by`, and become the **surface key** for a non-founder.

## Change surface (only if/when a build is authorized)

1. Add `administrator` to the `circle_memberships.role` CHECK enum (migration).
2. `app/commons/circles/layout.tsx`: founder-only → *founder OR holds a circle
   membership*; fail-closed preserved (no membership → 403).
3. Move creator-keyed capability checks (invite/remove/configure/manage focus)
   to `role = 'administrator'` (creator auto-administers what they create).

## Shipping precondition

Any build touching the role enum / invitations / membership triggers the
**Co-Lab Release Gate** (`verify-colab-boundaries.ts`, 31/31 in production)
before any non-founder tester gains live access. Mandatory (CLAUDE.md).

## First instance

**Andrea Fagan = Circle Administrator of the Elemental Alchemy Circle** — not a
founder, not (yet) a facilitator. Preceded by the zero-code founder-cohort
observation pilot (`ELEMENTAL_ALCHEMY_CIRCLE_OBSERVATION_PILOT_2026-07-08.md`),
which supplies the Evidence-Required signals above before this role is built.
