---
room: Security
human_activity: seeing plainly how I can sign in and what protects my account, and changing it without squinting or guessing

# Deliberately narrow, like settings.md: this binds the Security page only, NOT the account area.
surfaces:
  - app/account/security/page.tsx

change_class: experiential

principles:
  - SOULLAB_READABILITY_STANDARD — text must be readable against its surface; an undefined colour token that silently drops all text styling is a readability failure, not a taste question
  - INHABITABLE_ARCHITECTURE_STANDARD — every visible element serves the person's current moment
  - SOULLAB_THEME — only tokens defined in the theme are used, so the surface stays coherent with the House

reference_surfaces:
  - tailwind.config.js — the maia colour tokens (navy, ink, spice); maia-cream is NOT defined there, which was the defect
  - docs/design/contracts/settings.md — the neighbouring account surface and its deliberately narrow binding
  - docs/canon/SOULLAB_READABILITY_STANDARD.md

shared_with_house: the dark navy field, the gold accent for actions, and the plain provenance voice (the page states what is not set up, such as "Passkey not set" and "Email unverified")
distinct_to_room: Security is operational rather than contemplative. The member arrives to check or change how they sign in, so labels are plain and every control is a single named action

screenshot_desktop: docs/design/contracts/screenshots/security-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/security-mobile.png
experience_verification: Walked the page in a throwaway local stack as a fictional signed-in member (not production, no real member). Desktop 1280px and mobile 390px. Looked for text that disappears into the background, wrapping, and horizontal overflow. Headings render rgb(248,250,252) on rgb(10,22,40) (about 17:1); description text is the same colour at 60% alpha (readable, about 7:1 by calculation); mobile wraps cleanly with 0px horizontal overflow. NOT checked here, by this contract: the passkey, trusted-device and session tabs' behaviour, the Capacitor/iOS shell, and a real member's account data.
---

# Security — Experience Contract

## What this room is for

Showing a member how they can sign in (passkey, password, connected accounts), which devices and sessions are trusted, and giving them
plain controls to change it. It is a check-and-change surface, not a place to dwell.

## Why this contract exists

The page used the text colour `maia-cream-100` 54 times, but no such token exists in the Tailwind theme. An undefined colour class
generates no CSS, so the text inherited the default dark colour on the dark navy page and was nearly unreadable. The fix replaces it
with the defined `maia-ink-100` and is guarded by `app/account/__tests__/securityPageColors.test.ts`, which fails if any `maia-*`
colour class on the page is not in the resolved theme.

## Forbidden here

- colour classes that are not defined in the theme (the test enforces this for this page)
- hint text fainter than 60% of the primary text colour on the navy field
