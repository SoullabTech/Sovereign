---
room: Studio Doorway Join
human_activity: arriving at one Studio's own front door with an invitation, and creating the one Soullab account to use there — without being routed through Soullab or MAIA first
surfaces:
  - app/doorway/**
  - components/studios/**
change_class: experiential
principles:
  - SOULLAB-CONSTELLATION-01 Doorway laws 1, 2, 7 — worth entering without knowing Soullab; no ontology toll; declining costs nothing
  - STUDIO-A-LA-CARTE-01 R1/R2 (founder 2026-11-12) — own door, one identity underneath, MAIA off until connected; "<X> Studio" naming
  - MARKETING_CLAIM_DISCIPLINE — copy states facts only; it promises no Studio access the Studio's own gate has not granted
  - Now What? arrival ordering invariant (Kelly ruling 2026-07-29) — no account-creating field before eligibility is established; existing members always have a sign-in path
reference_surfaces:
  - app/now-what/arrive/page.tsx
  - docs/design/contracts/writers-studio-doorway.md
  - docs/design/contracts/astrology-doorway.md
shared_with_house: Soullab mark and "by Soullab" endorsement (founder direction 2026-11-13) · the House's warm dark field and amber hairline accents · the Now What? arrival's quiet single-column form · one Soullab identity
distinct_to_room: the Studio's own name leads; no MAIA handle, no Soullab navigation, no AIN vocabulary — the door belongs to the Studio, and Soullab stands behind it rather than in front of it
screenshot_desktop: docs/design/contracts/screenshots/studio-doorway-join-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/studio-doorway-join-mobile.png
experience_verification: Walked live 2026-11-13 on a local dev server (STUDIO_DOORWAYS_ENABLED=true, schema-only throwaway database, no member data) at http://writer.localhost:3123/join, at 1440x900 and 375x812. The door opens on the Soullab mark, "Writer's Studio", "by Soullab" and "This door opens with an invitation code." with one field — no account fields. A wrong code was refused ("That code doesn't open this door…") and no account fields appeared. The issued code, typed lowercase with spaces, was accepted and only then were name / email / password shown. Creating the account made a normal members row (STUDIO-WRITER-* passkey, onboarded, step complete), a redemption row for 'writer', and used the code (1/1); the person was sent to /writers-studio, whose own beta gate redirected to /explore/writers-studio?access=invitation-required — the invitation creates an account, it does not grant Studio entry. Re-entering the spent code was refused.
---

# Studio Doorway Join — Experience Contract

## What this room is for

Someone has been invited to one Studio — a writer to Writer's Studio, an engineer to Sound Studio, an astrologer to
Astrology Studio, a practitioner to Guide Studio. This is the door they meet. It should feel like that Studio's own
front door, with Soullab visibly standing behind it, and it should ask for nothing until it knows the person was invited.

## Arrival

> **Writer's Studio · by Soullab — This door opens with an invitation code.**

Where am I: the Studio's door. What is it for: joining with an invitation. Where can I begin: the code field — or
"Sign in" if I already have an account.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| Enter code | "Invitation code" · "Continue" | Names the one thing needed; no promise about what follows |
| Wrong code | "That code doesn't open this door. Check it with the person who invited you." | States the fact, points to the human who can help, reveals nothing about the code |
| Create account | "Create your Soullab account to use with Writer's Studio." · "Create account" | Honest that this is a Soullab account (one identity), used with this Studio |
| Existing member | "Already have a Soullab account? Sign in" | An existing member is never forked into a second account |

## Known gap (not hidden)

After joining, a person not yet on that Studio's own roster lands on its public preview with
`access=invitation-required`, and that preview's header still offers "Sign in" to someone already signed in. Issuing
an invitation must be paired with the Studio's own admission (roster / allowlist / grant) until a later lane joins them.
