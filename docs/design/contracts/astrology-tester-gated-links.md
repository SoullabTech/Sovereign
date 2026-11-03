---
# ── Identity ────────────────────────────────────────────────────────────────
room: Free Astrology doors (tester-gated links)
human_activity: a member who is a Free Astrology tester finds the way into the Astrology room. A member who is not a tester is shown no door into a room that would refuse them.

surfaces:
  - components/maia/MaiaLeftRail.tsx
  - components/maia/MaiaHouseSheet.tsx
  - components/SacredLabDrawer.tsx
  - components/ui/SacredLabDrawer.tsx
  - app/patterns/page.tsx

# These surfaces already link to /astrology. The proxy 404s every Free
# Astrology room page unless members.tester is true (lib/astrology/testerGate.ts,
# founder admission 2026-10-30). This change only hides those links from
# members the gate would refuse. It adds no room, no copy and no layout.
change_class: structural
structural_rationale: >-
  The only change to these surfaces is that the existing Astrology link is
  hidden when the member's own members.tester flag is false (read from
  /api/members/tester, failing closed). Testers see exactly what they saw
  before. Non-testers lose a link that led to a 404. No wording, layout or
  other link moves.

# ── Governing law ───────────────────────────────────────────────────────────
principles:
  - ASTRO-FREE-TESTERS-ONLY — Free Astrology's room pages are visible only to members whose tester flag is true
  - Interface Humility — the interface offers no door the system will refuse
  - The navigation follows the gate; it never decides access itself

reference_surfaces:
  - lib/astrology/testerGate.ts
  - lib/hooks/useAstrologyTester.ts
  - lib/navigation/__tests__/astrologyTesterAudience.test.ts

# ── The House / Room split ──────────────────────────────────────────────────
shared_with_house: >-
  The House, the rail, the Lab drawer and the Patterns page keep their existing
  look and grammar. The only difference is whether the Astrology door appears.
distinct_to_room: >-
  None. This contract adds no room. It governs only whether existing doors into
  Free Astrology are shown.
---

# Free Astrology doors — Experience Contract (structural)

## Status

**Structural.** This contract covers hiding existing links. It does not grant
design approval for the surfaces themselves, which keep their own contracts or
owe them.

## What changes for a member

- **A tester** sees no change.
- **A non-tester**, founder or not, no longer sees the Astrology link in the
  rail, the House, the Lab drawer ("Cosmic Blueprint") or the Patterns page.
  Before this change, each of those links led to a 404.

## Forbidden here

- Showing a door the gate refuses.
- Using founder status, tier or cohort to reveal the link. Only the tester
  flag admits, as in `lib/astrology/testerGate.ts`.
- Treating the hidden link as access control. The proxy remains the gate.

## The two brand tests

**Same house?** Yes. Nothing about the surfaces' look changes.

**Distinct room?** Not applicable. No room is added.
