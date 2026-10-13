---
room: Writer's Studio — Constellation Arrival
human_activity: crossing from a public invitation into the actual Studio while carrying just enough context for the Studio to meet the person where they arrived
surfaces:
  - app/writers-studio/ConstellationArrival.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE — arrival should orient the person toward the human activity, not expose system architecture
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — campaign context may inform an opening but may not become a claim about who the member is
  - MAIA_OATH — the Studio meets rather than categorizes
  - STUDIO_COPY_VOICE — language returns attention to the writer's work rather than explaining internal machinery
reference_surfaces:
  - docs/design/contracts/studio-home.md
  - docs/design/contracts/writers-studio-doorway.md
shared_with_house: quiet hierarchy · human-language gestures · provenance-aware claims · easy return to the work itself
distinct_to_room: this is a one-time membrane between public invitation and working Studio. It remembers why the person arrived only long enough to acknowledge that entry, then yields completely to the member's actual work.
screenshot_desktop: docs/design/contracts/screenshots/writers-studio-constellation-arrival-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/writers-studio-constellation-arrival-mobile.png
experience_verification: Walked live on 2026-10-03 at 1280x900 and 390x844 through /writers-studio?arrival=doorway&campaign=writers-discover&audience=wisdom-carrier. Confirmed the temporary arrival membrane renders in both widths, speaks to the declared invitation without asserting a stable identity, and explicitly states that the context does not become a label. Separately walked the existing-author path and activated Begin with my work; the arrival, audience, and campaign parameters were removed, the URL returned to /writers-studio, and the arrival surface disappeared. This verifies the context is consumable and temporary rather than a persistent persona.
---

# Writer's Studio — Constellation Arrival

## What this room is for

This is not a new room in the Studio. It is a membrane used when someone crosses
from a public Constellation doorway into the authenticated Writer's Studio.

Its job is deliberately small: acknowledge the reason they came, then get out of
the way.

The public campaign may know that the person clicked an invitation written for a
"wisdom carrier" or an "existing author." That is evidence about an arrival path.
It is **not evidence about the person's identity**. The arrival membrane therefore
uses the context once and provides an explicit act that removes it from the URL.

## Arrival

> **Welcome to Writer's Studio**

The next line adapts to the invitation that was actually chosen. It does not say
"You are a healer," "You are an author," or assign any permanent category.

For an unrecognized or absent audience context, the Studio falls back to a generic
arrival and does not preserve the unknown value.

## Gesture

| Gesture | Language used | Effect |
|---|---|---|
| Continue into the Studio | **Begin with my work** | Removes `arrival`, `audience`, and `campaign` from the URL and leaves the ordinary Writer's Studio Home in place. |

## Persistence law

The following may cross the auth boundary temporarily:

- that the member arrived through a Constellation doorway
- which declared campaign was used
- which declared audience invitation they chose

None of these become profile fields, memory claims, personality tags, or access
controls in this implementation.

## Forbidden here

- assigning the member a durable persona from campaign attribution
- changing Studio capability based on audience segment
- saying "because you are a healer/author/teacher" when the only evidence is a clicked campaign
- repeatedly resurfacing the arrival after the person has dismissed it
- forcing the person through a separate onboarding track by audience
- replacing their actual Studio history with campaign assumptions

## The two brand tests

**Same house?** Yes. The membrane is quiet, provenance-aware, and gives authority
back to the member immediately.

**Distinct room?** It is intentionally not a room. It should be perceptible at the
threshold and then vanish. If the member keeps experiencing "the wisdom carrier
version" of Writer's Studio afterward, this contract has failed.
