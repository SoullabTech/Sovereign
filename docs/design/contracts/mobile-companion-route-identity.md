---
room: iPhone Companion Shell
human_activity: moving between permitted iPhone destinations without an invented or misdirected route
surfaces:
  - components/mobile/MobileRouteGuard.tsx
change_class: structural
principles:
  - INHABITABLE_ARCHITECTURE_STANDARD — a destination's authority is not inferred from a missing location
  - MAIA_OATH — no surface should claim access or navigation it has not established
  - SOULLAB_LIVING_ORIENTATION_SYSTEM — crossing is governed and rooted in an actual destination rather than guessed continuity
reference_surfaces:
  - lib/mobile/mobileAllowlist.ts
  - docs/design/contracts/settings.md
  - docs/design/contracts/soullab-shell.md
  - docs/design/contracts/cabin-destination-membranes.md
shared_with_house: explicit destination identity, honest thresholds, restrained navigational authority and preservation of the member's chosen place
distinct_to_room: native iPhone routing enforces the companion allowlist; web remains a pass-through and Studio's broader rooms do not become natively entitled when route identity is unavailable
structural_rationale: >-
  This correction changes no established destination, layout, copy, button,
  route definition, entitlement policy, member gesture, or URL for a real known
  route. It tightens only the unresolved Next.js pathname/null branch: before
  a native route identity exists, render neither previously allowed content nor
  a fabricated Web Studio handoff. It restores the existing trust boundary
  rather than introducing a room or a new member experience. The observable
  exceptional result is a quiet blocked transition instead of an invalid or
  stale route; the native/web render distinction and no-invented-route rule
  are exercised in 14 focused SSR/pure tests. No screenshot can truthfully
  depict an established destination while the pathname is null; the contract
  does not claim a physical iPhone experience witness.
---

# iPhone Companion Shell — Resolved Route Identity

This contract governs only the native-path readiness decision in
`components/mobile/MobileRouteGuard.tsx`. It does **not** govern House,
MAIA, Studio, or the appearance of any destination room.

A Capacitor shell may classify an established `/enter`, `/maia` or other
absolute, allowed route under existing entitlement rules. A transient null
pathname cannot stand in for any of them, cannot open a guessed browser URL,
and cannot inherit the previous route's allowed rendering.

The non-native web application continues to render its children without a
native route gate, including while its router is hydrating. This is a shared
platform shell distinction, not a silent extension of Studio access.

The source fixture `components/mobile/__tests__/MobileRouteGuard.pathname.test.ts`
checks native unresolved-route refusal, web hydration pass-through, valid
path classifications and the render-time refusal preceding all inherited
`allow`/`web-only` states. Full iPhone on-device approval remains a separate
acceptance gate; this contract alone does not authorize beta release.
