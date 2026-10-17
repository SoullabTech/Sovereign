---
room: Soullab Mobile-to-Web Handoff
human_activity: choosing whether to continue a specific web-only activity from the mobile companion without losing the selected destination or exposing a credential
surfaces:
  - app/open-in-web/page.tsx
  - app/open-web/page.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE_STANDARD — transitions must preserve a recognizable place, clear human intent, and truthful authority
  - SOULLAB_THEME — quiet dark field and restrained interaction hierarchy connect the handoff to the House
  - MAIA_OATH — never imply an authorization, route or continuation that was not established
reference_surfaces:
  - docs/design/contracts/mobile-companion-route-identity.md
  - docs/design/contracts/soullab-entry.md
  - docs/design/contracts/writers-studio-rebuild.md
  - components/mobile/MobileRouteGuard.tsx
  - app/studio-on-mobile/page.tsx
shared_with_house: Soullab identity, deliberate member action, preserved destination meaning, the honest difference between entry and being admitted to a private Room
distinct_to_room: this threshold offers a browser continuation or explicit homepage only; it does not create Studio membership, grant mobile entitlement, restore a session or act as the target room
screenshot_desktop: docs/design/contracts/screenshots/mobile-web-handoff-r61-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/mobile-web-handoff-r61-mobile.png
experience_verification: R61 2026-10-17 — actual local Next.js WebKit pages at 1280x800 and 390x844, 15/15 route/UI/launch/overflow/cleanup checks; exact reviewed deep link preserved, null and unsafe paths offered the homepage; zero external requests and zero member API calls. Consent and live Safari iPhone not claimed.
---

# Soullab Mobile-to-Web Handoff — Experience Contract

## Why a member comes here

A person in the phone companion chooses a tool or room which lives in the fuller
web Studio. This crossing exists to orient them and let them choose to open their
browser. It is not an account screen and not permission to access the
destination. The web Studio independently verifies whatever membership and
current session a protected room requires.

If the exact destination is known, name the continuation plainly: **Open in Web
Studio** or **Open in Browser**. If route identity is missing or untrusted, do
not quietly keep the last destination, redirect automatically, or imply that
the requested Studio room is available. Say what happened and offer **Open
Soullab homepage** as an explicit new choice.

## The gestures and their boundaries

| Member action | Experience law |
|---|---|
| Arrive with a verified web-only route | Show the correct web destination and one deliberate browser-opening action |
| Arrive while Next search parameters are unresolved | Show a quiet homepage option; never reuse earlier protected Work or route |
| Arrive with a protocol-relative, external, traversing or credential-bearing URL | Do not echo or navigate to the unsafe value; invite the member to the homepage |
| Open in browser | Use only the verified same-origin destination; keep noopener/noreferrer |
| Go back | Leave through the existing navigation gesture without creating or changing Studio consent |

The member's account, writing, Work identity and app-native entitlements are
not inferred from the query string. A safe destination address is never an
editor permission or a granted session.

## House and particular crossing

**Same House:** The presentation retains restrained dark background,
legible ordinary language and one clear action. It continues the companion
shell's honest route identity and the general Soullab entry threshold instead
of constructing another account chooser.

**Distinct Room:** It is a very small threshold, not Studio itself. It may
name and point to a route, but it cannot show another writer's manuscript,
invent an approved Living Work, skip a beta invitation or offer an encrypted
edit it cannot perform. If the path is unknown, ambiguity is visible rather
than silently resolved.

## Reviewed UI evidence and limits

Desktop 1280x800 actual Next.js/WebKit:
docs/design/contracts/screenshots/mobile-web-handoff-r61-desktop.png.

Mobile 390x844 actual Next.js/WebKit:
docs/design/contracts/screenshots/mobile-web-handoff-r61-mobile.png.

The desktop screenshot shows a verified Studio link; the mobile screenshot
shows a verified Marketing continuation. The same isolated browser witness
also exercised the homepage fallback and click-time browser URL interception.
No outbound web request was made. The previews are generic, fictional
navigation; they contain no member profile, tokens or private manuscripts.

The isolated open-web screenshot also showed an unrelated first-interaction
global Audio enabled toast. That is a separate House-wide audio experience
to review, not a control introduced or approved by this handoff.

This contract establishes the current visual/interaction decision. It does
NOT witness a real iPhone Safari/Capacitor browser launch, authenticated
Writer's Studio session, encrypted Source/Draft/Apply/Undo, provider
transaction, offsite restore or production release.

**Member experience accepted as an isolated threshold candidate; protected
Writer beta admission and production cutover remain HOLD.**
