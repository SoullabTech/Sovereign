---
room: Practice Field Invitation Acceptance
human_activity: an invited client accepting a practitioner's invitation into a shared relationship space by signing in with an existing member account
surfaces:
  - app/join/[token]/page.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE_STANDARD — a surface must not offer a gesture the system will always refuse; a dead path is surface area with no benefit (founder ruling 2026-10-01)
  - MAIA_OATH — the page may not imply it can create an account it cannot create
reference_surfaces:
  - docs/design/contracts/invitations-threshold.md — sibling invitation surface; consulted for handoff and refusal semantics
  - docs/design/contracts/onboarding-threshold.md — admission boundary (passkey) that account creation must pass
shared_with_house: stone-950 field, restrained hierarchy, relationship-framed invitation copy, server-side admission
distinct_to_room: the practitioner's name and welcome message lead; the member is accepting a person's invitation, not signing up for software
screenshot_desktop: docs/design/contracts/screenshots/join-invitation-signin-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/join-invitation-signin-mobile.png
experience_verification: Local dev server, token validation response mocked at the network layer (no database write) with already_member=false, the case that previously rendered the always-failing create-account form. Walked at 1280×900 and 390×844. Saw the invitation header, the welcome message, the sign-in form and the line "Accepting needs an existing Soullab account. If you don't have one yet, let Jondi know." No create-account text or gesture is present at either width.
---

# Practice Field Invitation Acceptance — Experience Contract

This contract covers one reduction only: removing the create-account branch from `/join/[token]`.

That branch posted to `/api/members/register` without a passkey. Passkey admission (`lib/auth/passkeyAdmission.ts`) refuses every such request with a 400, so the branch could never succeed. Production `relationship_spaces` had 0 rows when the change was made, so no invite had been sent and none accepted. The founder ruled (2026-10-01) to keep the sign-in branch and remove the dead one.

This contract does **not** design a client account-creation path. Any future one must carry a passkey and the 18+ confirmation (`lib/members/adultConfirmation.ts`), and its own contract reopens this room.

## What this room is for

A person invited by a practitioner arrives from the invitation email. They see who invited them, sign in, and are linked into the shared space.

## Arrival

> **{practitioner} has invited you into a shared space.**

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| primary | "Sign In & Continue" | accepting the invitation requires an existing account |
| no-account guidance | "Accepting needs an existing Soullab account. If you don't have one yet, let {practitioner} know." | says honestly what is possible; offers no path the system will refuse |

## Forbidden here

- An account-creation form or link that posts to `/api/members/register` without a passkey and the 18+ confirmation
- Platform-signup framing

## The two brand tests

**Same house?** Yes. It uses the same stone field and quiet hierarchy as the invitation surfaces named above.

**Distinct room?** Yes. The practitioner's name and words lead, which no generic sign-in page does.
