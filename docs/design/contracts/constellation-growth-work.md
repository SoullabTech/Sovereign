---
room: Constellation — Growth and AI Work
human_activity: opening one accessible founder workspace, choosing an outcome, preparing a bounded brief with the AI team, and returning to evidence and human decisions
surfaces:
  - app/founder/constellation/work/**
  - app/admin/page.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE — one outcome and one working brief, not an expanding inventory of dashboards
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — the founder's brief is orientation and never a substitute for a governed execution grant
  - SOULLAB_THEME — quiet hierarchy, clear language, evidence and machinery underneath
reference_surfaces:
  - docs/design/contracts/constellation-learning.md
  - docs/design/contracts/constellation-participation-preview.md
  - jarvis-desktop/src/founder-workspace-renderer.js
shared_with_house: JARVIS remains the operator, Kelly remains the decision authority, MAIA remains the member-facing guide
distinct_to_room: a browser entry for founder growth work with a real copyable brief and direct access to reports, participation design and content drafts. It is not an automated agent console or a second evidence store.
screenshot_desktop: docs/design/contracts/screenshots/constellation-growth-work-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/constellation-growth-work-mobile.png
experience_verification: The actual GrowthWork component was rendered in a temporary development wrapper on 2026-10-03 at 1440x1100 and 390x844. Both screenshots were visually inspected. No horizontal overflow; all three navigation destinations matched; an empty outcome disabled copying; choosing a task changed the brief; the copy action and exact visible brief agreed using a mocked clipboard sink that did not change the operating-system clipboard. The real signed-out founder page did not mount work controls. This is local component and unauthenticated-route evidence, not a production login or a connected AI-worker demonstration. The temporary wrapper was removed before commit.
---

# Growth & AI work

## Arrival

**One outcome. One working brief. Your team carries the preparation; you keep the decisions.**

The browser entrance is **Admin → Growth & AI work**. The admin header and a visible main-page card both link to `/founder/constellation/work`, including at mobile widths. The founder sidebar names the same destination. Doorway learning, the participation preview, and content drafts are ordinary links from that page. No duplicate analytics source is created.

## Working process

The founder states an outcome and selects one next piece of work. The first three choices are preparing the Writer's Studio pilot, developing one audience invitation, and reviewing admitted evidence. The generated brief carries the approved one-experience/30-day scope, the source record paths, the requested work, and the distinction between a brief and execution authority.

The **Copy working brief for the AI team** button actually copies the displayed text. Failure is shown honestly with a manual-copy alternative. Nothing is sent to a model or worker by this act; the founder takes the brief into JARVIS Work or an authorized AI conversation. Do not describe this as automatic delegation, a shared agent chat, or a live worker panel.

The repeatable cycle is choose outcome → team preparation → inspect and decide → learn. Publishing, sending, spending and production remain explicit decisions at their existing authority boundaries.

## Access and limits

`requireFounder()` runs on the server before the work component is mounted. The link on the legacy admin page supplies no authority. This act does not validate or extend the admin page's older local user-management implementation. The new work page inherits the existing web-only `/founder/constellation` boundary.

The approval block is labeled **Decision recorded · 3 October 2026**. It records build approval, not real-time worker progress or production activation. No status polling, browser storage, model call, or hidden member-data export is part of this UI.

## Existing participation preview

Its footer now acknowledges that the scope is approved. The preview remains a preview: it neither enrolls someone nor submits to the new storage candidate. The original C7B1 screenshots remain historical evidence at their recorded source hashes; the approval text changed in this later act.
