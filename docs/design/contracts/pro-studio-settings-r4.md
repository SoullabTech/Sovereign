---
room: Pro Studio — Professional Settings
human_activity: a professional identifying which account and practice preferences are genuinely available, making authorized changes, and knowing whether those changes were saved
surfaces:
  - app/studio/settings/page.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE — a control promises a human act only if it performs that act
  - MAIA_OATH — availability and completion are represented truthfully rather than guessed
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — practitioner and member meaning and authority are never inferred from UI state
  - MAIA_SANCTUARY_ECONOMY — commercial access cannot weaken core MAIA relational standing
  - RIGHT_TO_REMAIN_UNPOSSESSED — confidentiality, restraint, and ownership are native obligations
reference_surfaces:
  - docs/design/contracts/settings.md — account-settings truthful-controls contract
  - docs/design/contracts/studio-home.md — guided arrival and explicit actions in a specialist Studio
  - docs/design/contracts/studio-maia.md — practitioner space and MAIA boundary
  - docs/canon/MAIA_SANCTUARY_ECONOMY.md
  - docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md
shared_with_house: readable typography and interaction hierarchy, truthful error and completion language, no counterfeit capability, no authority promotion from an appearance
distinct_to_room: professional settings carry special responsibility because a falsely confirmed privacy, password, messaging, export, or deletion control can have client and practitioner consequences
screenshot_desktop: docs/design/contracts/screenshots/pro-studio-settings-r4-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/pro-studio-settings-r4-mobile.png
experience_verification: >-
  SYNTHETIC AUTHENTICATED REACT COMPONENT + BACKEND WALK, 2026-10-12.
  Real app/studio/settings/page.tsx compiled with Tailwind utility styling and
  inspected using Chromium. Real code for Studio settings API, verified session
  lookup, and practitioner-scoped query ran against a fresh temporary PostgreSQL
  cluster with two entirely fictional practitioners. 26 of 26 browser assertions
  passed. Desktop 1280x900 and mobile 390x844 screenshot captures are included,
  with a refusal state visible; mobile width 320 and 390 had zero horizontal overflow.
  No external browser requests were observed. The test harness omitted the
  full Next.js shell, deployment middleware, real auth UI, real provider services,
  real client data, and production configuration; none is claimed as verified.
---

# Professional Settings — R4 Experience Contract (candidate)

## What this room is for

A practitioner comes here to understand how Studio works in the present moment, change the few preferences this Studio can actually save, and see precisely what remains unavailable. This is a professional responsibility room, not a showroom. Every visible status is either backed by evidence from a trusted service or explicitly called unverified.

## Arrival and orientation

On desktop, a persistent left rail names the available Settings sections. On phones, the rail becomes a single **Section: [name]** button which discloses an accessible two-column section chooser. Choosing a section closes the chooser. The page content remains within the viewport without clipped inputs or forced horizontal scrolling.

## Gestures and promises

| Gesture | Actual meaning | Evidence limit |
| --- | --- | --- |
| Change section | Opens named local settings section, closes mobile chooser | Synthetic Chromium and component walk |
| Save video room | Validated HTTPS URL is written only to session-verified practitioner's settings, and success is acknowledged only after HTTP success | Synthetic PG14, not production |
| Invalid save | Displays an explicit error; no saved state | Synthetic Chromium HTTP 400/503 |
| Load video room failed | Names unavailable evidence; an empty field is not asserted to be unset | Source contract and browser mock |
| Calendar privacy | Example displayed, disabled; no unverified saved privacy preference implied | UI source and browser evidence |
| Notification / time / agent / appearance controls | Preview-only local state, visibly labelled not saved | Source and browser evidence |
| Security preferences | Disabled examples; no phantom account-security control | Source and browser evidence |
| Export / delete / password | Informational copy only, no inert buttons | AST scan and browser check |
| Messaging status | Unauthorized/unknown is not represented as not configured | Synthetic 403 provider-status response |
| Email / Camo | Status expressly not verified by this page | Source and screenshot evidence |

## Specific UX corrections

The prior layout used a non-shrinking 256px sidebar plus padded content and could exceed a 390px viewport by 158px. The R4 candidate uses a mobile navigation threshold, a shrinkable content surface, and a stacked video-link form.

Four inert buttons were found by a JSX AST audit: **Update Password**, **Export All**, **Clear**, and a generic **Save Changes**. They no longer appear as active unimplemented actions. The specialized Profile/Modules and video-room save mechanisms are preserved.

The prior screen incorrectly called Email (Resend) *Configured/Active* without a verified status check; Camo was described as *Ready* without a readiness check. Those claims have been replaced by explicit uncertainty. WhatsApp and Telegram now distinguish 403 Unauthorized and transport error from *not configured*, matching the existing SMS safeguard.

## Constitutional refusal

The Studio may not represent unsaved state as account policy, a hypothetical integration as connected, or unverified deletion as completed. Professional records are never read or modified to create screenshot evidence. Neither access to this room nor practitioner role automatically grants paid entitlement or client-record authority.

## Visual evidence and exceptions

- Desktop PNG SHA256: `8ec7552aabe2f59ecfe50e05055b7099a393ac421978a12d922e7ded59f4bf6f`
- Mobile PNG SHA256: `1c9426897141e4662b3c5a305acd908481c6e767872d708dccd225e0f59c45a1`
- Both screenshots use entirely fictional values and the simulated invalid-save state.
- Chromium test performed at desktop 1280×900, mobile 390×844, and compact 320×720.
- This is not a founder visual acceptance, not clinical compliance verification, and not a complete production-app walk.

## Remaining release gates

A dependency-complete commit must pass revision-local sovereignty checks and this Experience Contract gate. An independently reviewed application build must be exercised with the real Next.js shell, deployment proxy, verified route protection and realistic (but fictional) data, including keyboard/focus and touch accessibility. Production container digest, real-vault backup/restore, reviewed legacy-settings migration, and explicit founder adjudication remain independent requirements.

**Disposition:** Candidate R4 UX contract, no merge or deployment authority.
