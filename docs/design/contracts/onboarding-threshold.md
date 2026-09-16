---
room: Onboarding Threshold
human_activity: presenting an invitation and learning whether it grants entry without disclosing another person's identity
surfaces:
  - components/onboarding/SacredSoulInduction.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE_STANDARD — a threshold must make the human activity legible without turning data structures into the room
  - SOULLAB_THEME — threshold hierarchy and restraint belong to the shared House language
reference_surfaces:
  - app/signin/page.tsx — canonical authentication surface; the legacy /test-elemental route explicitly redirects here
  - docs/design/contracts/house-return.md — consulted for House/Room distinction and threshold restraint
shared_with_house: quiet hierarchy, explicit entry gesture, Soullab wordmark, and privacy-preserving refusal language
distinct_to_room: this room is a threshold rather than a destination; it asks for one invitation key and either admits or refuses without exposing account identity
screenshot_desktop: docs/design/contracts/screenshots/onboarding-threshold-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/onboarding-threshold-mobile.png
experience_verification: final integration build served locally and walked in system Chrome at 1440x1000 and 390x844; after the entrance animation the same threshold, passkey field, Enter gesture, recovery link and sign-in path were visible on both. A synthetic format-shaped key was refused by both recognition and member-check endpoints, with no-store responses and no identity data returned.
---

# Onboarding Threshold — Experience Contract

## What this room is for

A person arrives holding an invitation or wondering whether they already belong. The threshold answers only that question and routes them onward. Possession of a legacy key is not authority to learn someone else's name, username, inviter, or account state beyond what entry requires.

## Arrival

> **We've Been Expecting You**

The threshold says where the person is, asks for the key they already hold, and keeps Sign in and recovery visible as alternate paths.
## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| present invitation | `Enter` | names the human act without claiming that format alone grants authority |
| existing account | `Sign in` | moves identity-bearing recovery to the authentication boundary |
| lost invitation | `Forgot passkey?` | offers recovery without exposing account data |

## Forbidden here

- returning a member's name or username merely because a passkey matched;
- treating `SOULLAB-*`, `MAIA-*`, or another prefix as authorization;
- shipping contact rosters or credential corpora to the browser;
- turning a backend failure into local/fallback admission.

## The two brand tests

**Same house?** Yes. The threshold uses the same restrained hierarchy, relational language and explicit gestures as the House references, while keeping security mechanics out of the prose.

**Distinct room?** Yes. This is the moment of entry: one invitation, one decision, then onward. It is not the Conversation Room, House return, or account settings.