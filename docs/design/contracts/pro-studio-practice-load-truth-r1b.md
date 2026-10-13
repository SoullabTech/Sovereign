---
room: Pro Studio — Practice Home truthful loading (R1b candidate)
human_activity: a practitioner returning to their existing practice and accurately distinguishing records present, verified empty records and records temporarily unavailable
surfaces:
  - app/studio/page.tsx
  - components/studio/PracticeHomeLoadNotice.tsx
change_class: experiential
principles:
  - docs/canon/INHABITABLE_ARCHITECTURE_STANDARD.md — failed data loading is not a fake empty room
  - docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md — observable facts only, never invented activity or lack of clients
  - docs/canon/SOULLAB_THEME.md — clear accessible error gestures while protecting the existing Practice context
reference_surfaces:
  - app/studio/page.tsx — the previously client-first practice home and its existing add-person zero state
  - app/studio/layout.tsx — preserved practitioner shell and navigation hierarchy
  - docs/design/contracts/journal-room.md — House material hierarchy and truthful state vocabulary
shared_with_house: truthful observable status, the member-facing clear retry gesture, explicit non-disclosure of private information during failure and continuity of existing Studio voice
distinct_to_room: Practice Home holds records of other people, so a failed client or bookings request must NEVER be presented as no people in the practitioner's care; Reflect has no such client list and uses a separate arrival
screenshot_desktop: docs/design/contracts/screenshots/prostudio-r1b-practice-failure-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/prostudio-r1b-practice-failure-mobile.png
experience_verification: 2026-10-12 SYNTHETIC SSR COMPONENT WITNESS ONLY, NOT A MEMBER SESSION. PracticeHomeLoadNotice was rendered from its exact R1b React component with fictional standing unavailable, no member/client data, and app/globals.css compiled by local Tailwind. Playwright Google Chrome static DOM at 1280x800 and 390x844 blocked ALL network requests, showing a readable error title, a truthful sentence that unavailable records do not mean an empty practice, and one visible Try again action, with no horizontal overflow. Separate native Node adapter tests 10/10 verify 401/403/network/invalid/empty as distinct states, and Jest route/identity tests 18/18 pass; this screenshot does NOT prove client API integration, hydrated button click, practitioner session identity, live retries, mobile device interaction, actual loading sequence or current production semantics. Founder review remains outstanding.
---

# Practice Home — failure should not look like emptiness

## What this room is for

A practitioner arrives in the ongoing work of care. The existing Practice room contains people, sessions and preparations. Its zero-state may invite the first person **only when the clients and booking records were successfully retrieved and really are empty**.

## Failure state

> **Your practice could not be loaded.**

The message distinguishes a failed read from an empty practice and offers **Try again**. On 401 it instead asks the member to sign in; on 403 it says their practitioner access cannot be confirmed. None of these outcomes imply a client exists, is absent, or that work was deleted.

## Preserved Practice

The earlier Practice entry and Add your first person gesture remain unmodified for confirmed zero records. Practitioner identity and the SQL query's practitioner ownership predicate remain in existing API handlers. No new subscription permission, team sharing or member-data operation is added in R1b.

## Same House / distinct room

The House expects language grounded in evidence, not inferred significance. Practice is unusual because "nothing here" is a high-stakes claim about another human being's records. A failure must therefore interrupt the ordinary Home before rendering zero-state.

## Limit

This verifies a pure adapter and its synthetic error visualization. A later governed beta walk must prove failed clients and bookings calls trigger this view, that retry actually re-requests correctly, and that the existing Practice Home/Session Room remains usable for authorized practitioners. This contract cannot be interpreted as an independent privacy approval or paid-plan authorization.
