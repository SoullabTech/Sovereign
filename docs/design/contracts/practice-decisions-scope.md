---
room: Practice Decisions
human_activity: holding practitioner decisions in a professional context while preserving a strict membrane from a member's Personal Decisions.
surfaces:
  - app/studio/decisions/page.tsx
  - app/studio/layout.tsx
  - components/studio/DecisionChain.tsx
  - components/studio/ExperienceTimeline.tsx
  - components/studio/MentorPanel.tsx
change_class: experiential
principles:
  - DECISIONS-UX-01 — Personal Decisions and Practice Decisions are legitimately different contexts and must not silently collapse into one another
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — professional decision support may structure evidence and perspective but does not make the decision
  - INHABITABLE_ARCHITECTURE_STANDARD — route and scope membranes must be legible rather than hidden plumbing when they alter the member's destination
  - MAIA_OATH — mentor/council perspective remains support rather than authority
reference_surfaces:
  - docs/design/contracts/personal-decisions-room.md
  - docs/design/contracts/facet-crossings.md
  - app/studio/decisions/[id]/page.tsx
  - app/studio/decisions/new/page.tsx
shared_with_house: explicit room identity, readable navigation, preserved member/practitioner scope, and no hidden cross-context data carry.
distinct_to_room: Practice Decisions remains the practitioner decision-support surface. The shared DecisionChain, ExperienceTimeline and MentorPanel accept explicit scope/base-path inputs so the Personal Decisions experience can reuse substrate without Practice inheriting personal semantics or Personal inheriting professional/client semantics.
screenshot_desktop: docs/design/contracts/screenshots/canonical-practice-decisions-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/canonical-practice-decisions-mobile.png
experience_verification: 2026-09-27 authenticated reconciliation witness on isolated localhost:3705 with a temporary practitioner/member. /studio/decisions rendered the practitioner Decision Council at desktop and mobile while the personal route remained /decisions. The scope-support changes in DecisionChain, ExperienceTimeline and MentorPanel are the same frozen-candidate changes already exercised by the complete Personal Decisions authenticated witness; Practice defaults remain practice. CANONICAL-RECONCILIATION-01 adds contract coverage only.
---

# Practice Decisions — Scope Membrane Contract

## Personal / practice separation

Personal Decisions and Practice Decisions may share durable decision infrastructure. They may not share implicit meaning.

Practice defaults remain:

- practice-scoped endpoints;
- professional language;
- practitioner routing;
- practitioner-owned context.

Personal scope must be explicitly requested by the Personal Decisions host.

## Shared components

DecisionChain receives an explicit base path. ExperienceTimeline and MentorPanel receive an explicit scope. Their defaults preserve existing Practice behavior.

## Studio navigation

Studio may route the Decisions module to /decisions only in personal mode. Practice mode continues to use /studio/decisions.

## Reconciliation standing

This contract assigns the historical scope-membrane work to its proper experience boundary. No Studio or Decisions UI is changed by this act.