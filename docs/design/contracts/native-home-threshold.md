---
room: House
human_activity: arriving at Soullab Home from the native iPhone or iPad app, where Home cannot yet open, and choosing whether to talk with MAIA here or open Home in the browser

surfaces:
  - components/mobile/MobileRouteGuard.tsx

change_class: experiential

principles:
  - SOULLAB_PLATFORM_IDENTITY_CANON_2026-09-28 — Home is the entrance; MAIA is entered deliberately from Home or another explicit member gesture, never deep-linked automatically
  - INHABITABLE_ARCHITECTURE_STANDARD — the member knows where they are, why Home is not here, and where they can go next
  - SOULLAB_THEME — restrained accent; one primary gesture, one quiet secondary path

reference_surfaces:
  - docs/design/contracts/house-room.md — Home's own contract; consulted for what Home is for and what this threshold must not pretend to be
  - docs/design/contracts/soullab-entry.md — entry threshold; consulted for "MAIA is a destination, not the platform"
  - docs/design/contracts/maia-room.md — the destination this threshold offers; consulted for the deliberate-entry rule
  - components/mobile/MobileRouteGuard.tsx OpenInWebScreen — the existing native web-only screen this threshold specialises

shared_with_house: Soullab's own words for Home, a quiet dark field, one clear primary gesture, and the member choosing where to go rather than being moved
distinct_to_room: this is not Home and does not imitate it. It says plainly that Home is on the web for now, offers MAIA as one deliberate choice, and keeps the browser path to Home one tap away

screenshot_desktop: docs/design/contracts/screenshots/native-home-threshold-wide.png
screenshot_mobile: docs/design/contracts/screenshots/native-home-threshold-mobile.png
experience_verification: >-
  2026-11-19, iOS simulator, debug build of fix/ios-voice-transcript-reset-20261118,
  founder's own account signed in by the founder. iPhone 17 Pro (narrow): from the app
  entry screen, "Go to Soullab" opened this threshold, not MAIA; "Continue to MAIA"
  opened the MAIA encounter with the session intact. iPad Pro 13-inch (wide,
  landscape): after sign-in the MAIA encounter's Home icon opened this threshold.
  Looked for: no automatic entry into MAIA, wording true on both iPhone and iPad
  (the first draft said "iPhone app" and was corrected to "the app" after the iPad
  walk), both paths visible without scrolling. Not walked: a physical device, and
  the "Open Home in your browser" hand-off to Safari. The website's Home is
  unchanged: MobileRouteGuard returns its children untouched off the native
  platform.
---

# Native Home threshold — Experience Contract

## What this room is for

Soullab Home is where a member orients before choosing a place to enter. The native
iPhone and iPad app cannot run Home yet, because Home is rendered on the server and the
app ships only pages that can be bundled. Sign-in and the app's own entry both lead to
Home, so members meet this moment often. This threshold tells them the truth about
where Home is and lets them choose where to go next.

## Arrival

> **Soullab Home is on the web for now**

Where am I: at Home's door inside the app. What is this place for: choosing where to go
when Home itself is not here. Where can I begin: talk with MAIA here, or open Home in
the browser.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| Primary | Continue to MAIA | A deliberate choice to enter MAIA, as the platform canon requires; "continue" because the member came here to go somewhere |
| Secondary | Open Home in your browser | Names where Home actually is, without sending the member away unasked |

## Forbidden here

- opening the MAIA conversation automatically from Home
- imitating Home's layout or its facets, which would promise a Home that is not here
- the generic "Available in Web Studio" wording, which names the wrong place
- device-specific wording that is untrue on another device ("iPhone app" on an iPad)

## The two brand tests

**Same house?** Yes. It uses Soullab's names for Home and MAIA, the same quiet dark
field as the other native thresholds, and one primary gesture, as in
`soullab-entry.md`.

**Distinct room?** Yes. It is plainly a doorway, not Home: no facets, no Home content,
and a single honest sentence about why.

## Standing

This contract covers the native threshold only. It does not change Home, MAIA, or the
public entry, and it does not authorize auto-entry into MAIA. If Home ships inside the
native app, this threshold should be removed rather than extended.
