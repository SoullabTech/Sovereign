---
room: Practitioner booking return
human_activity: confirming or managing an existing session through a member-held booking link
surfaces:
  - app/book/[slug]/confirmation/page.tsx
  - app/portal/manage/[token]/page.tsx
change_class: structural
principles:
  - docs/canon/INHABITABLE_ARCHITECTURE_STANDARD.md — a room protects the specific human activity rather than turning into a data table.
  - docs/canon/SOULLAB_THEME.md — preserve readable gestures and House continuity.
  - docs/design/contracts/README.md — a genuinely structural change must preserve room character and state its limited rationale.
reference_surfaces:
  - docs/design/contracts/practitioner-portal-route-readiness.md
  - docs/design/contracts/house-return.md
shared_with_house: session identity is supplied by verified route context and member-owned intent.
distinct_to_room: booking confirmation and the limited management of one specific session.
structural_rationale: Missing Next route parameters now fail as empty identifiers instead of dereferencing null. No booking, cancellation, payment, confirmation wording, action order or layout changed.
---

# R82 Practitioner booking return — structural Experience Contract

## Authoritative scope

The exact surface filenames above are the ONLY paths admitted by this R82 compatibility contract. It does not license additional layout, consent, interpretation or navigation changes in those rooms. Existing room-specific Experience Contracts remain authoritative for experience design.

## Evidence and preservation

These changes belong solely to the 69-file typed shipping compatibility correction from the isolated, SHA-256-pinned R78 B1–B9 source. R82 keeps the original room composition and actions. The full tsconfig.ship.json check passed with 0 diagnostics, and the R81 real fictional Writer/browser workflow and owner/cross-member security tests remained green. The next real device canary still owes direct experience verification for all declared exhaustive-label variants.

## Forbidden promotion

Do not construe this TypeScript/route-state compatibility correction as founder approval of a redesigned room, new authorization, consent, or capability. The production build and actual member beta are still release-held.
