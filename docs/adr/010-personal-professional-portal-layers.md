# ADR-010: Personal Portal as Base Layer; Professional Portal as Additive Co-Lab Layer

**Status:** Accepted
**Date:** 2026-07-01
**Author:** Kelly Nezat

---

## Context

The platform has grown to serve two distinct but overlapping purposes:

1. Personal development — a person's relationship with MAIA, their own life, and their inner development.
2. Professional work — a person's contribution to the world through practice, creation, teaching, or organization.

Early architecture conflated these by making Practitioner Studio the organizing identity of the platform. This created tension: not every member is a practitioner, and not every practitioner wants their professional identity to be the primary frame for their personal development work.

A secondary tension emerged from the Co-Lab structure: Co-Labs were conceived as team workspaces but lacked a principled way to configure themselves for different kinds of professional work (coaching vs. creative collaboration vs. teaching vs. team leadership).

---

## Decision

### Layer 1: Personal Portal (universal base)

Every member always has a Personal Portal. It is not optional, not upgradable away from, and not replaced by any professional identity.

Personal Portal contains:
- MAIA conversations and memory
- Personal journey and development
- Personal relationships and encounters
- Journal, practices, astrology, personal memory
- Vision Studio (the developmental environment for a lifetime body of work)

Personal Portal answers: *How do I develop as a person?*

### Layer 2: Professional Portal (additive, Co-Lab-scoped)

A member may participate in one or more Co-Labs configured for professional work. Each Co-Lab has a `studio_type` field that configures the surrounding tooling without changing the underlying architecture.

Professional Portal answers: *How do I bring meaningful work into the world?*

> **Naming note:** "Professional Portal" is the current working name for this layer. The constitutional distinction is between personal development and contribution — not employment status. A founder, artist, retiree writing a memoir, or open-source maintainer all belong here without being "professionals" in any conventional sense. The name should be tested with users and may be refined; the constitutional distinction it marks is durable regardless of what the layer is called.

### `studio_type` belongs on the Co-Lab, not the member

A member is never declared to be a practitioner, creator, or educator at the account level. The platform says: *"This Co-Lab is configured for practitioner work."* The member's identity remains sovereign.

A single member may simultaneously:
- Use Personal Portal privately
- Be a practitioner in one Co-Lab
- Be a creator in another
- Be an advisor or collaborator in a third

### Studio type taxonomy (initial)

| `studio_type`    | Primary purpose                                                |
|------------------|----------------------------------------------------------------|
| `practitioner`   | Serving people — clients, relationships, encounters, consent   |
| `creator`        | Creating work — projects, writing, research, publishing        |
| `educator`       | Teaching — courses, cohorts, workshops, learning journeys      |
| `organization`   | Leading teams — projects, governance, shared knowledge         |

Future studio types may be added without architectural change.

### Shared foundation (studio_type-independent)

All Co-Labs share:
- Relationships
- Encounters
- Sessions
- MAIA
- Relationship Spaces
- Co-Lab membership

What changes is the surrounding domain tooling surfaced by `studio_type`.

### Vision Studio placement

Vision Studio is constitutionally part of the Personal Portal. It is the developmental environment where someone cultivates a lifetime body of work — regardless of whether that work is a psychotherapy practice, a novel, a research framework, a startup, or a spiritual lineage. Professional Studios may surface and reference Vision Studio, but they do not own or redefine it.

---

## Consequences

### Structural

- `studio_colab` table receives `studio_type` column (enum, nullable — null = untyped/organization default)
- No `studio_type` or professional identity field on `members` table
- Personal Portal surfaces are not gated behind any Co-Lab membership
- Professional Portal entry point becomes a distinct UI layer above typed Co-Labs

### Architectural invariants introduced

1. **Personal Portal is always present.** A member who has no Co-Lab still has full Personal Portal access.
2. **Professional Portal is additive.** It does not replace or restrict the Personal Portal.
3. **studio_type configures, not constrains.** A `practitioner` Co-Lab still has Relationships, Encounters, and Messaging — they are just surfaced in a practitioner-appropriate configuration.
4. **Identity sovereignty.** The platform never asserts what kind of person a member is. It only describes what a Co-Lab is configured for.
5. **One constitutional foundation.** Studio types configure presentation, workflows, and domain tooling. They do not create separate architectures, schemas, or platform identities. Any divergence that requires a schema fork or a separate platform is a violation of this invariant.

### Market implication

This separates the platform's two audiences without fragmenting the architecture:
- **Personal Portal** — anyone seeking personal development with MAIA
- **Professional Portal** — anyone bringing meaningful work into the world

Both enter the same platform. Neither is a second-class pathway.

---

## Alternatives considered

### Make studio_type a member attribute
Rejected. A member may inhabit multiple professional roles across Co-Labs. Locking a professional identity to the account violates identity sovereignty and misrepresents how practitioners actually work.

### Keep Practitioner Studio as the organizing identity
Rejected. It excludes creators, educators, researchers, and founders who are not practitioners in the clinical/coaching sense, and forces a practitioner frame onto members who don't identify with it.

### Separate products per studio type
Rejected. The constitutional foundation (MAIA, Relationships, Encounters, Vision Studio) is shared. Separate products would fragment what should be a single coherent architecture.

---

## Related

- ADR-005: Studio as Orchestration Domain
- ADR-006: Session Anchor
- ADR-007: Person Anchor
- `docs/canon/PREPARATION_IS_NOT_AUTHORIZATION.md`
- `docs/canon/LIVING_FIELDS.md`
