---
room: Soullab Entry
human_activity: arriving at Soullab, understanding the field, and choosing whether to enter as a member

surfaces:
  - app/home/**
  - components/landing/**
  - components/auth/UnifiedAuth.tsx
  - components/auth/SignInCard.tsx
  - app/onboarding/page.tsx
  - app/faq/page.tsx
  - app/resume/page.tsx
  - app/oauth-success/page.tsx
  - app/enter/page.tsx
  - app/welcome-back/page.tsx

change_class: experiential

principles:
  - INHABITABLE_ARCHITECTURE_STANDARD — the member enters a place, not a feature index
  - SOULLAB_PLATFORM_IDENTITY_CANON_2026-09-28 — Soullab is the platform; Home is the entrance; MAIA is a destination
  - SOULLAB_THEME — preserve the House field language and restrained accent hierarchy

reference_surfaces:
  - app/house/page.tsx
  - app/house/house.module.css
  - components/landing/HeroSection.tsx

shared_with_house: deep navy field, Soullab identity, quiet spatial hierarchy, human language, and the sense of arriving somewhere rather than opening a dashboard
distinct_to_room: signed-out visitors receive orientation and invitation only; personal data, living works, and active rooms remain behind authenticated Home

screenshot_desktop: docs/design/contracts/screenshots/soullab-landing-reconciled-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/soullab-landing-reconciled-mobile.png
experience_verification: Headless Chromium walked the reconciled public landing at desktop and mobile and verified the simplified section order, Enter Soullab → /home, and the surfaced capability standing. Separate threshold witnesses at docs/design/contracts/screenshots/soullab-home-threshold-desktop.png and soullab-home-threshold-mobile.png verified signed-out /home shows the Soullab threshold, the eight current field destinations, Join Soullab and Sign in; neither entered /maia or exposed member data.
---

# Soullab Entry — Experience Contract

## What this room is for

This is the threshold between the public Soullab site and the member's Home. It lets a first-time or signed-out visitor understand the place they are being invited into before authentication. An authenticated member does not stop here; they arrive directly at Home.

## Arrival

> **A place to meet your life more fully.**

The visitor meets Soullab first, then the field, then the choice to join or sign in. MAIA appears as one destination in that field, not as the name of the whole platform.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| Primary entry | Join Soullab | Names membership in the whole platform, not entry into one AI surface |
| Returning member | I already belong here / Sign in | Distinguishes return from registration |
| Public-site primary CTA | Enter Soullab | The public threshold points to Home, never directly to MAIA |

## Forbidden here

- presenting MAIA as the platform itself
- routing the public primary CTA directly to `/maia`
- showing private member objects before authentication
- presenting inaccessible facets as if they were usable demos
- generic SaaS dashboard language or feature-card overload

## The two brand tests

**Same house?** Yes. The threshold carries the current House's navy field, restrained typography, spatial quiet, and Soullab identity.

**Distinct room?** Yes. It is intentionally sparse and invitational; authenticated Home becomes personal, populated, and actionable.
