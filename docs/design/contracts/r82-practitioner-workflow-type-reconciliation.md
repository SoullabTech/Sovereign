---
room: Practitioner care workflow
human_activity: reviewing clients, sessions, tasks, agreements and billing under practitioner authority
surfaces:
  - app/practitioner/agreements/page.tsx
  - app/practitioner/billing/page.tsx
  - app/practitioner/clients/[clientId]/spiralogic-report/page.tsx
  - app/practitioner/sessions/[sessionId]/page.tsx
  - app/practitioner/sessions/new/page.tsx
  - app/practitioner/tasks/[taskId]/page.tsx
  - app/practitioner/tasks/new/page.tsx
change_class: structural
principles:
  - docs/canon/INHABITABLE_ARCHITECTURE_STANDARD.md — a room protects the specific human activity rather than turning into a data table.
  - docs/canon/SOULLAB_THEME.md — preserve readable gestures and House continuity.
  - docs/design/contracts/README.md — a genuinely structural change must preserve room character and state its limited rationale.
reference_surfaces:
  - docs/design/contracts/practitioner-portal-route-readiness.md
  - docs/design/contracts/practitioner-messages-structural.md
shared_with_house: professional obligations and explicit role boundaries.
distinct_to_room: client work and financial responsibilities do not blend into Commons or Journal.
structural_rationale: Nullable route/search values are resolved without inventing session or client IDs. The existing booking, care, billing and task UI/authority is unchanged.
---

# R82 Practitioner care workflow — structural Experience Contract

## Authoritative scope

The exact surface filenames above are the ONLY paths admitted by this R82 compatibility contract. It does not license additional layout, consent, interpretation or navigation changes in those rooms. Existing room-specific Experience Contracts remain authoritative for experience design.

## Evidence and preservation

These changes belong solely to the 69-file typed shipping compatibility correction from the isolated, SHA-256-pinned R78 B1–B9 source. R82 keeps the original room composition and actions. The full tsconfig.ship.json check passed with 0 diagnostics, and the R81 real fictional Writer/browser workflow and owner/cross-member security tests remained green. The next real device canary still owes direct experience verification for all declared exhaustive-label variants.

## Forbidden promotion

Do not construe this TypeScript/route-state compatibility correction as founder approval of a redesigned room, new authorization, consent, or capability. The production build and actual member beta are still release-held.
