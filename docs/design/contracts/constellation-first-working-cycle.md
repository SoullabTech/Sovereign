---
room: Constellation — First Working Cycle
human_activity: entering the founder workspace through a usable sign-in boundary and reviewing a concrete pilot invitation rather than administering scattered technical artifacts
surfaces:
  - app/founder/layout.tsx
  - app/founder/constellation/layout.tsx
  - app/founder/constellation/pilot/**
  - app/founder/constellation/work/GrowthWork.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE — the working room must actually be reachable through its inherited layout
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — a visible shell grants no data authority and a copied draft grants no release authority
  - SOULLAB_THEME — generous writing, restrained claims and additional detail only when opened
reference_surfaces:
  - docs/design/contracts/constellation-growth-work.md
  - docs/design/contracts/constellation-learning.md
  - docs/design/contracts/writers-studio-doorway.md
shared_with_house: one founder workspace, server-verified identity, preserved authorship, clear limits on what has been witnessed
distinct_to_room: a reviewable invitation, first-session guide and explicit release requirements. This is not a live campaign, an enrollment form, a sending tool or an agent chat.
screenshot_desktop: docs/design/contracts/screenshots/constellation-pilot-packet-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/constellation-pilot-packet-mobile.png
experience_verification: C8 local verification on 2026-10-03. The actual packet component was rendered at 1440x1100 and 390x844 through a labeled temporary development wrapper; copied text retained the not-approved-to-send label and matched the visible text. The actual signed-out founder route was separately checked through its inherited shell with the legacy feature flag default off; the sign-in action remained visible after hydration and no private controls or report rows were disclosed. Initial sign-in text inherited an unreadable dark-on-dark combination; an explicit contrasting card corrected it and both final screenshots were inspected. The public wisdom-carrier doorway reached the real signup page with its nested return context intact; no email was entered, code sent, account created or manuscript touched. None of these checks establishes authenticated founder use or an end-to-end new-member writing result.
---

# Read the invitation first

The first useful act is to review actual language intended for the first audience. The packet opens on an unsent draft for experienced healers, clinicians and teachers carrying existing writing. It names the product's aim, not guaranteed performance. It proposes up to five adult volunteers without claiming that anyone is enrolled or that access is free.

The copy action preserves a prominent **FOUNDER REVIEW DRAFT — NOT APPROVED TO SEND** label. There is no sending transport, recipient collection, approval checkbox, budget, or public-use permission in the page.

The first-session guide starts with a small piece of real work plus its place in the larger chapter or book. It protects meaning and author choice; a rejected edit or retained original can be useful. Optional feedback remains separate and cannot activate until its real collection boundary is ready.

The Elemental Alchemy demonstration is an explicit unfilled source requirement. The page does not invent a passage, an author decision, publication consent, or a success score. Deeper commercial terms and release checks are collapsed by default so the first invitation remains primary.

## Founder access correction

Previously `/founder/layout.tsx` hid every child in the browser when `founderConsole` was off. That defeated the new work route even though its component previews were successful. The presentation exception now matches only the Constellation subtree; unrelated founder tools keep their previous flag behavior. The subtree itself has a new server-side founder layout guard, in addition to existing page/API guards. A path name cannot create a verified identity.

The focused sidebar contains Growth & AI work, Pilot packet and Doorway learning. It does not route the founder into unrelated flag-off content tools. The work page links to the packet rather than the unverified legacy Content drafts route.

## Evidence classes

`founderWorkspaceShell.test.ts` renders the actual inherited shell in a browser-like environment with the flag off and verifies both narrow access and unrelated-route refusal. It also exercises the server subtree guard with mocked authorization results. Browser tests use the real anonymous route and real public signup navigation; the packet screenshots alone use a temporary wrapper and mocked clipboard. These classes are explicitly not combined into an authenticated-production claim.

The final signed-out screenshots are `constellation-real-signedout-desktop.png` and `constellation-real-signedout-mobile.png`. The temporary packet wrapper is removed before commit. Kelly's normal local URL uses the existing configured founder allowlist; no session is forged and no allowlist entry is added.
