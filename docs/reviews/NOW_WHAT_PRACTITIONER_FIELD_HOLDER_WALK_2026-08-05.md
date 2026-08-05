# Now What? — Practitioner Field Holder Walk (acceptance instrument)

**Authored:** founder direction, 2026-08-05 (evening), verbatim intent preserved.
**Status:** PENDING — not yet walked. This walk is the acceptance gate for the
practitioner stewardship surface (`/now-what/admin`, commits `95cfae2e8` +
`ab57d848b` on `feature/labtools-redesign`). Merge/deploy of this lane does not
satisfy it; only the walk does.

## The decisive question

> **Is this stewardship of a field, or administration of a database?**

The practitioner should experience stewardship of their field — not
administration of their data. If the second, redesign it.

## Who walks, and what Claude cannot do

The walker is the **actual field holder** (the authenticated member whose
`practice_fields.practitioner_member_id` + non-null `field_slug` grant the
door). Claude cannot produce this walk: it cannot authenticate as the holder,
must not write test material into production, and holder interpretation is the
evidence itself. Open founder decision: where the walk runs (prod vs
local/staging) and who holds the credentials.

## Operational checklist (mechanical preconditions — pass/fail)

1. Practitioner sees the door at the bottom of the Now What home.
2. Door enters the correct field environment (their own slug, no other).
3. Existing field renders correctly.
4. A Develop edit creates a revision (append-only spine, PR #586).
5. History remains append-only — nothing erased by the edit.
6. Explore's composed view matches what members actually receive.
7. Monitor contains only field facts — nothing about clients.
8. Imagineer remains clearly non-live ("Designed · not yet built").

## Experiential acceptance (the walk proper — holder's felt answers)

1. Does the practitioner **recognize their own work**?
2. Can they **understand what reaches the member environment**?
3. Does revision history feel like **stewardship rather than version control**?
4. Does Monitor create **awareness without creating surveillance**?
5. Does Explore reveal **translation without pretending to replace relationship**?
6. Does Develop feel like **tending a living field**?
7. Are unfinished capabilities **honestly marked**?
8. Does the practitioner **leave with greater clarity about their role**?

## Governing framing (context the walk observer must hold)

- The practitioner field **informs the client environment through authored,
  governed translation** — the bridge is the point, not a violation. The
  governance question is how the bridge carries meaning without carrying
  ownership.
- **"You provide the terrain; the journey through it is theirs."** The
  practitioner creates conditions; the member creates lived meaning.
- A database row is not a stewardship relationship: the door keys on
  `field_slug` (attachment to an environment, a steward act), never on the mere
  existence of a field row.

## Out of scope for this walk

Provenance expansion, corpus ratification, the authority model for
`active_field_content` composition, and any Larry material ingestion — separate
lanes with their own gates (see
`docs/specs/PRACTITIONER_WISDOM_FIELD_PRODUCT_DEFINITION_v0.md`). This walk
asks only whether the existing stewardship surface is experienced as such.
