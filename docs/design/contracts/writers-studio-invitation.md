---
room: Writer's Studio — Invitation Threshold
human_activity: an individually invited writer verifies their one-use link, sets a private password, and enters the existing-member door without public enrollment
surfaces:
  - app/writers-studio/invite/page.tsx
change_class: experiential
principles:
  - WRITERS-STUDIO-BETA-SUCCESS-LAW-01 — remove admission friction without widening the audience
  - SOULLAB_PLATFORM_IDENTITY_CANON_2026-09-28 — Soullab is the platform; Studio is a specific writing room
reference_surfaces:
  - docs/design/contracts/soullab-entry.md
  - docs/design/contracts/writers-studio-small-beta.md
shared_with_house: calm entry, recognizable Soullab identity, invitation as a personal human act rather than a marketing funnel
distinct_to_room: no signup, no unsolicited reset emails, no multiple-password gateway; links are consumed once and authority remains server-side
screenshot_desktop: docs/design/contracts/screenshots/writers-studio-small-beta/desktop.png
screenshot_mobile: docs/design/contracts/screenshots/writers-studio-small-beta/mobile.png
experience_verification: The referenced screenshots establish the existing Studio color and typographic vocabulary, not acceptance of this new invitation view. Initial acceptance is server-side token, admission and proxy testing; exact-source Chrome and Safari visual/functionality checks on a built candidate remain required before real invites are issued.
---

# Writer's Studio invitation — experience contract

The invitation is a single narrow arrival gesture. A writer receives a personal, expiring link and chooses their own password. The next action is ordinary Writer's Studio sign-in, with no extra browser authentication popup. Signing in as an invited writer then leads to an explicit, individual beta participation decision. Password setup is **not** consent and does **not** unlock Studio or MAIA.

The setup page shows only the invitation's status, two password fields, and one action. It does not display the person's email, ask for a roster code, expose other writers, or offer public signup.

**Authority:** The front-end never grants membership. The invitation's 256-bit bearer token is stored only as a SHA-256 digest. The server checks the token's expiry and one-use state, the active member-linked beta contact, and the exact member allowlist. An atomic claim updates the password and consumes the token. The sign-in route still independently refuses nonmembers.

**Failure:** Invalid, expired, consumed, or revoked invitations all show one neutral unavailable state. Provider/infrastructure faults do not create accounts or sessions. No member manuscript, provider credential, or production record is copied to establish the new account.

**Scope:** This is for the separate restricted-beta runtime only. The production Soullab registration and password recovery routes remain unchanged. The feature is disabled unless all beta-specific server flags are explicitly enabled.
