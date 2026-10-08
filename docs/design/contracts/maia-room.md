---
room: MAIA
human_activity: entering direct relationship with MAIA while remaining oriented inside the larger Soullab platform

surfaces:
  - app/maia/page.tsx
  - app/maia/encounter/page.tsx
  - components/maia/MaiaShell.tsx

change_class: experiential

principles:
  - SOULLAB_PLATFORM_IDENTITY_CANON_2026-09-28 — Soullab is the platform; Home is the canonical return; MAIA is a destination
  - INHABITABLE_ARCHITECTURE_STANDARD — the member knows where they are and how to leave without encountering competing platform maps
  - SOULLAB_THEME — preserve quiet field hierarchy and relationship-first presentation

reference_surfaces:
  - app/home/page.tsx
  - app/house/page.tsx
  - components/maia/MaiaCenterField.tsx

shared_with_house: Soullab identity, deep field atmosphere, quiet orientation, and a single clear return to Home
distinct_to_room: MAIA is a direct relational encounter; the conversation remains primary and the wider platform is not reproduced as a second navigation house inside the room

screenshot_desktop: docs/design/contracts/screenshots/maia-room-home-return-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/maia-room-home-return-mobile.png
experience_verification: Presentation fixture witness at desktop 1440x960 and mobile 390x844 verified that the MAIA encounter carries a single Home return, keeps MAIA centered as the destination, and does not render the old House sheet. Separate live local browser witnesses at docs/design/contracts/screenshots/maia-legacy-threshold-desktop.png and maia-legacy-threshold-mobile.png verified bare /maia now renders the compatibility threshold with Go to Soullab → /home. Runtime route assertions verify /maia/encounter hosts the canonical MAIA conversation and remains member-gated.
---

# MAIA — Experience Contract

## What this room is for

`/maia/encounter` is the place for direct encounter with Soullab's relational intelligence. Bare `/maia` is only a compatibility threshold that returns old bookmarks and direct visitors to Soullab. MAIA does not own the platform map; the member may remain in conversation or return to Home to reorient across the larger field.

## Arrival

> **MAIA**

The room should feel like entering a relationship, not opening another dashboard or mini operating system.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| Platform return | Home | Home is canonical Soullab orientation, not an old House submenu |
| Direct encounter | MAIA | Names the destination the member intentionally entered |
| Input | Speak or type | Keeps relationship and modality primary rather than product controls |

## Forbidden here

- treating /maia as the platform homepage
- mounting the old House sheet as a competing platform navigation system
- labeling the platform return "Return to House"
- redirecting /maia to /home merely because Home is canonical
- removing useful MAIA runtime substrate just to achieve naming cleanliness

## The two brand tests

**Same house?** Yes. MAIA remains unmistakably within Soullab through field atmosphere, typography, restraint, and the canonical Home return.

**Distinct room?** Yes. The center is the relationship with MAIA; Home and the other facets remain elsewhere.

## Sanctuary source-persistence notification — October 8, 2026 local candidate

Scope: `app/maia/page.tsx` is the encounter component re-exported by
`app/maia/encounter/page.tsx`. This change mounts a non-rendering listener for the
existing MAIA settings event; it adds no visible control, language, position, or
layout. Voice HUD, Quick Settings, and direct conversation-command changes are
**not** certified by this amendment.

- **Human activity:** a member who has entered Sanctuary should not have that
  entry lost because the encounter mounted after the original event.
- **Reference:** the existing MAIA room visuals above are pre-change baseline
  references, not new evidence of the changed runtime behavior.
- **House versus room:** the House retains its orientation, while this MAIA
  encounter coordinates a narrowly scoped privacy signal without taking over
  Writer's Studio's authorization.
- **Verification:** coordinator tests include initial ON, OFF, malformed state,
  event entry, and listener teardown. No authenticated desktop/mobile visual
  witness has been performed on this candidate. That remains an explicit release
  blocker, as do server acknowledgement display and all source-write tests.

## Verified-session recovery of the MAIA encounter — October 8, 2026 local candidate

A valid authenticated `maia_session` may survive while the browser's older
`beta_user` / `explorerId` mirror is missing. In the isolated local fixture this
previously redirected the authenticated member to Sign in or Home even though
Writer's Studio could load from the same verified cookie. The MAIA encounter now
asks `/api/members/me` for the canonical member **before** applying its legacy
browser-session migration check. Only a server-confirmed UUID may restore the
local display mirror. Explicit sign-out, mismatched existing identity, a failed
server check, or an invalid response cannot create a local identity.

- **Human activity:** arriving in a continuous relationship with MAIA after
  authentication, without repeating a sign-in that the server has already
  established.
- **Experience change:** identity restoration only, no additional buttons,
  controls, voice behaviors, layouts or palette changes.
- **Visual evidence (local test fixture, not production):**
  `docs/programme/evidence/WS-SANCTUARY-BETA-LOCAL-20261008/maia-desktop-recovered.png`
  (1440×900) and `maia-mobile-recovered.png` (390×844), both reviewed after
  `maia_session_version=2` was restored from server truth. The page remained at
  `/maia/encounter`, with MAIA's greeting and conversation entry present.
- **Strict limit:** these screenshots prove authenticated encounter arrival, not
  server-authoritative Sanctuary toggle synchronization. The source-persistence
  schema remains pending, and source POST/PATCH remain intentionally held.
- **Actual active controls:** `OracleConversation.tsx` renders
  `QuickSettingsSheet` conditionally. Its `VoiceHUD` invocation is currently
  commented out, so no witness should claim a visible working VoiceHUD from
  these screenshots.
