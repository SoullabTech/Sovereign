---
room: Vision Studio — Query Readiness
human_activity: returning to a chosen Vision or Practice Field with the exact phase and authored field context intact
surfaces:
  - app/maia/vision-studio/page.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE_STANDARD — a room and its chosen context cannot be guessed from an unresolved route
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — the member's actual authoring context precedes any UI interpretation
  - MAIA_OATH — no interface should imply it has recognized a context it has not actually received
reference_surfaces:
  - docs/design/contracts/living-constellation-projection.md
  - docs/design/contracts/LIVING_CONSTELLATION_CONTRACT_V0_1_2026-09-18.md
  - components/maia/vision-studio/VisionStudioRoom.tsx
  - components/maia/practice-field/PracticeFieldEditor.tsx
shared_with_house: exact route meaning, ordinary return navigation, member-originated context and truthful pending state
distinct_to_room: Vision Studio keeps its developing-work phase and opaque fieldContext separate from the practitioner-authored Practice Field; neither is replaced by a default before the route is resolved
screenshot_desktop: docs/design/contracts/screenshots/vision-studio-query-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/vision-studio-query-mobile.png
experience_verification: >-
  2026-10-17 — genuine locally running Next.js Vision Studio in WebKit with
  a disposable PostgreSQL16 synthetic member session, 1280x820 desktop and
  390x844 mobile. Anonymous Vision Studio was refused at Sign in. A fictional
  signed-in desktop session rendered Vision Studio with phase=water_2 and the
  exact opaque fieldContext; clicking Practice and returning to Vision
  preserved both query values. A distinct fictional mobile query rendered
  Practice Field without changing phase or fieldContext. The verified
  screenshots contain only synthetic context and current application UI.
  The acceptance passed 12 browser interactions and 13 infrastructure
  checks, with no external model or website requests and no saved content.
  The Vision Studio screenshot honestly shows "Your wider field is
  unavailable right now" because all private data GETs were refused;
  the page did not claim another member's field. The same message appears
  in Practice Field on mobile, and UI spacing needs a separate review.
  The temporary auth database, browser and vault were cleaned. This is not
  real-member authentication or production/private-field correctness.
---

# Vision Studio — Resolved Query Boundary

The member must be able to return to the **same** emerging body of work or
practice surface, with the actual phase and opaque fieldContext intact.

The Vision/Practice tab is an orientation, not account authorization. A
different tab deliberately changes only the explicit tab query parameter;
all other query values are carried forward as they were given. The Living
Field button is a separate room crossing, not a silent rewrite of the
Practice Field or member's private context.

When the Next.js router has not resolved searchParams, the interface may
say **Opening the field…** but must not initiate a default body-of-work,
propose a fieldContext, or navigate from an incomplete query. This
preserves authorship and prevents an accidental crossing into a room with
the wrong context.

**Evidence scope:** The SSR/pure tests exercise null queries, the resolved
default phase, exact fieldContext retention (including escaped characters),
Practice versus Vision separation, tab transitions and preservation of
existing query values. Separately, a real Next.js WebKit browser running
against *fictional* PostgreSQL authentication exercised both tabs and
reviewed desktop/mobile screenshots. A real member session, independent
Vision/Practice provenance and physical iPhone Safari remain separate gates.

**Production and restricted Writer beta: HOLD.** This contract gives no
session, Work, private proposal, KMS or beta admission authority.
