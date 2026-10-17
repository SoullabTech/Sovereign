---
room: Soullab — Verified member sign-in
human_activity: enter Soullab with a verified authenticated session, and recover from incorrect credentials or incomplete session issuance
surfaces:
  - components/auth/UnifiedAuth.tsx
change_class: experiential
principles:
  - MAIA_OATH — never mistake a display profile for confirmed member authority
  - INHABITABLE_ARCHITECTURE_STANDARD — a successful Sign in action must actually produce the session it promises
  - SOULLAB_THEME — clear, calm type hierarchy, readable touch controls and consistent House materials
  - RF01 R1-D — MAIA arrival requires a genuine verified member-owned session
reference_surfaces:
  - docs/design/contracts/rf01-new-conversation.md — authenticated arrival and separate privacy choice
  - docs/design/contracts/quick-settings-privacy.md — remembrance is never a cached preference
  - components/auth/UnifiedAuth.tsx — password, email-code and recovery affordances
  - app/api/members/signin/route.ts — server-issued session truth
shared_with_house: accurate success and refusal feedback, without ever misrepresenting a partial result as completion
distinct_to_room: password verification and session issuance precede MAIA; memory and external processing permission are not sign-in side effects
screenshot_desktop: docs/design/contracts/screenshots/rf01-r1e-signin-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/rf01-r1e-signin-mobile.png
experience_verification: >
  2026-10-17 real Next.js 16.3.8 sign-in view at 1280x800 Chromium and
  390x844 mobile WebKit with one fictional member in disposable PostgreSQL16.
  Incorrect password showed generic feedback, no session cookie and visible
  recovery. Captures were taken after the unrelated two-second audio-unlock
  toast cleared. The complete fictional sign-in-to-MAIA journey separately
  passed desktop Chrome, desktop WebKit and mobile WebKit: real HttpOnly
  session cookie, MAIA Arrival, Sanctuary Send refusal, separate PostgreSQL
  New Conversation, old writing preserved and failed creation nonmutation.
  Unrelated APIs mocked and all external/model requests blocked.
  No physical iPhone or real member credentials were tested.
---

# Soullab — Verified member sign-in

A correct password alone is not proof that the member has entered Soullab.
The UI may enter the House only after the server has created a valid session,
prepared the bearer and access cookies on the actual response, and returned
a verified session receipt.

## Member experience

- Invalid username or password receives a generic, usable message without
  issuing access cookies or revealing account existence.
- Session creation and cookie preparation must finish before success is
  returned. On failure, the server returns a clean 503 and attempts to
  revoke an unusable bearer.
- The password UI refuses any superficially successful response missing
  a valid member identity, success marker or bearer token.
- Recovery remains reachable through email sign-in and the Can't get in?
  affordance, without requiring the member to know their enrollment method.
- Sign-in never implicitly grants memory formation or cloud model consent.

## Evidence and limits

The screenshots show the actual form after an incorrect fictional password;
both screen sizes keep the generic error and recovery affordance legible.
The global first-touch audio unlock banner may temporarily cover part of
mobile recovery for about two seconds; it is a separate existing UI issue.
The visual witnesses were taken after it disappeared.

The full fictional password-to-MAIA journey passed three browser
engine/layouts and emitted zero external/model calls. No physical device,
live credentials, email delivery, or paid providers were accessed.

## Forbidden

- Success if session issuance, required cookies or verified token is missing.
- Returning partially issued cookies after a preparation failure.
- Logging user-supplied credentials or echoing database errors.
- Treating a stored display name or earlier privacy preference as authority.
- Automatic remembrance or external processing permission on sign-in.

**Same House:** truthful member feedback and unambiguous recovery.

**Distinct room:** Sign-in establishes identity; MAIA Arrival and consent
remain separate deliberate member actions.
