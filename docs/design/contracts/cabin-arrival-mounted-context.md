---
room: Cabin Arrival — Mounted Context Binding
human_activity: arriving in the sovereign Cabin and sensing which continuity domains are actually present before choosing a doorway

surfaces:
  - app/cabin/page.tsx
  - app/cabin/CabinArrival.tsx
  - app/cabin/cabin.module.css

change_class: experiential

principles:
  - RATIFIED_VISUAL_AUTHORITY — H4.2 implements the founder-ratified H4.1 visual grammar
  - MOUNTED_CONTEXT_ONLY — the arrival consumes only the already mounted Cabin experience context
  - NO_HIDDEN_ACTIVATION — viewing arrival never initializes, refreshes, or clears the mount
  - TRUTHFUL_STATE — unavailable, empty, and mounted remain distinct
  - DOMAIN_PRESENCE_ONLY — arrival exposes presence, never domain contents
  - NO_GUESSING — no Work, Relationship, or Memory id is selected on arrival
  - EXPLICIT_DOORWAY — entering a domain is a member action
  - MAIA_AS_THRESHOLD — MAIA is available to enter and does not speak on arrival
  - LOCAL_ONLY — the route is admitted only when Cabin is explicitly in offline mode
  - NO_SECOND_SOURCE — no database, browser storage, network fetch, or House catalog is consulted for context
reference_surfaces:
  - docs/design/contracts/cabin-arrival-experience.md
  - docs/design/contracts/cabin-arrival-visual-authority.md
  - docs/design/contracts/cabin-mounted-experience-context.md
  - lib/cabin/experienceContext.ts
  - lib/cabin/contextRuntime.ts
screenshot_desktop: docs/design/contracts/screenshots/cabin-h4-2-arrival-mounted-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/cabin-h4-2-arrival-mounted-mobile.png
experience_verification: 2026-10-01 local offline Cabin witness. Explicit context refresh returned HTTP 200 and mounted state; /cabin rendered the real mounted state, showed Work presence only, kept Relationships and Memory visually empty, and rendered no domain content or ids. Desktop 1440x900 and mobile 390x844 were captured. Mobile scrollWidth equaled viewport width (390). Empty and unavailable states were separately witnessed before and after explicit refresh. Focused H3.2/H3.7-H3.9/H4.2 regression suite passed 58/58. Full typecheck remains blocked by one pre-existing/new unrelated Stripe API-version diagnostic in lib/stripe/config.ts:23; it was not absorbed into the baseline.
shared_with_house: full-field composition, editorial hierarchy, quiet bronze/gold wayfinding, restrained House threshold language, member-owned continuity, explicit choice, and MAIA as an invited threshold rather than an ambient speaker.
distinct_to_room: Cabin is the sovereign arrival threshold for continuity already mounted into the local Cabin runtime. It exposes only domain presence and lets the member choose a doorway; it does not become a dashboard, memory browser, relationship interpreter, Work selector, or MAIA conversation before entry.
---

## Context law

The arrival consumes only the existing readCabinExperienceContext() seam.

The arrival does not call:

- cabinContextSnapshot();
- initializeCabinContextMount();
- clearCabinContextMount();
- cabinStore();
- a browser storage API;
- a network endpoint;
- a House catalog;
- a second memory source.

## State law

- unavailable → calm field, no continuity presence treatment;
- empty → calm field, no continuity presence treatment;
- mounted → the field acknowledges that carried context is present.

Within mounted, each doorway independently uses only its domain availability:

- Work → present | empty;
- Relationships → present | empty;
- Memory → present | empty.

A mounted package with an empty domain does not acquire a false presence signal.

## Doorway law

Work opens the existing Writer's Studio arrival without carrying a Work id.
This preserves multiple-Work truth and lets the destination perform any
explicit Work selection.

Relationships opens the existing Relationships surface without carrying a
relationship id.

Memory opens the existing Anchor history surface without carrying a memory id
or memory body.

MAIA opens the existing Anchor surface only after the member explicitly enters
the MAIA threshold.

The arrival never decides which object is current, important, recent, or
relevant.

## Copy law

Allowed arrival language:

- Welcome home.
- What you carried is here.
- Begin where you are.
- The field is quiet.
- Work
- Relationships
- Memory
- Meet MAIA
- Enter

Forbidden member-facing language:

- mounted state;
- context package;
- local authority;
- runtime;
- synchronization;
- projection;
- memory atom;
- source assembly;
- refresh;
- database;
- provider.

## Activation law

The page is dynamic because the mounted field is process-global runtime state,
but reading it is strictly non-initializing.

The route itself is offline-only. Connected mode receives no Cabin arrival.

No timer, watcher, browser storage, IPC, or automatic refresh is permitted.

## Visual witness

H4.2-R1 captures the real mounted context binding at:

- 1440×900 desktop;
- 390×844 mobile.

Witness requirements:

- Work presence visible only because the mounted fixture package contains Work;
- Relationships remain visually empty;
- Memory remains visually empty;
- no object title or body appears;
- no id appears in any doorway URL;
- mobile has no horizontal overflow;
- MAIA remains silent until explicit entry.

## Falsifiers

F1 — arrival initializes the mount;
F2 — arrival refreshes or clears the mount;
F3 — a second source supplies domain presence;
F4 — one Work is selected implicitly;
F5 — relationship or memory content leaks onto arrival;
F6 — a domain shows presence when its mounted availability is empty;
F7 — a member/session/id enters a doorway URL;
F8 — MAIA speaks or generates cognition on arrival;
F9 — connected mode exposes the Cabin arrival;
F10 — mobile horizontal overflow or hierarchy collapse;
F11 — technical custody vocabulary reaches member-facing copy.

## Acceptance

H4.2 is accepted only when:

1. the real route is reachable in offline Cabin mode;
2. the route remains unavailable outside offline Cabin mode;
3. mounted, empty, and unavailable behavior is witnessed;
4. the real mounted package changes domain presence truthfully;
5. the existing H3.7–H3.9 transport/activation boundaries remain intact;
6. focused and combined tests pass;
7. visual witnesses show desktop/mobile conformance.

The next boundary is not another transport mechanism. It is the explicit
experience contract for each doorway after the member chooses to enter it.
