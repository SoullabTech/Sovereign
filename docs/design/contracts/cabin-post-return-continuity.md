---
room: Cabin Post-Return Continuity
human_activity: leaving Cabin for a chosen room, doing nothing to Cabin while away, and returning to the same already-mounted field
surfaces:
  - /cabin
  - Writer's Studio
  - Relationships
  - Daily Anchor
  - Anchor history
change_class: structural
principles:
  - SAME_MOUNT — return reads the existing process-local Cabin mount
  - NO_REINITIALIZATION — return does not create or replace a Cabin mount
  - NO_REFRESH — return does not call a Cabin refresh or context-import path
  - SAME_FIELD — the member-visible Cabin field remains semantically identical across the crossing
  - EXPLICIT_RETURN — the member chooses the return; browser history is not the product contract
  - DESTINATION_INDEPENDENCE — destination activity does not become Cabin mutation
  - NO_SECOND_SOURCE — return does not fetch a second continuity source
reference_surfaces:
  - docs/design/contracts/cabin-destination-membranes.md
  - docs/design/contracts/cabin-arrival-mounted-context.md
  - lib/cabin/contextRuntime.ts
  - lib/cabin/experienceContext.ts
  - app/cabin/page.tsx
shared_with_house: continuity across a voluntary room crossing without hidden reinitialization
distinct_to_room: Cabin is restored as the already-mounted field; the destination does not become part of Cabin state
screenshot_desktop: docs/design/contracts/screenshots/cabin-h4-5-post-return-mounted-desktop.png
---

# Cabin Post-Return Continuity — Experience Contract

## Law

> Leaving the Cabin does not leave the field. Returning to the Cabin does not create a new field.

The return crossing is a navigation act only.

The Cabin page reads the current process-local mounted context through the
experience-context bridge. It does not initialize, refresh, import, or clear
the mount.

## Runtime evidence

2026-10-01 local offline browser witness on port 3692 exercised all four
H4.4 destination crossings. Each explicit return resolved to `/cabin`, the
returned Cabin route reported `data-state="mounted"`, and no request to
`/api/cabin/context` or its refresh/import family occurred during the return.
The Relationships walk additionally re-observed Work present with
Relationships and Memory empty after return.

## Acceptance

H4.5 is accepted when:

1. each H4.4 destination can return explicitly to /cabin;
2. the return resolves to /cabin;
3. the Cabin state before and after the crossing is identical;
4. the member-visible door set is identical;
5. no Cabin context API is requested during the return;
6. no refresh/import endpoint is requested during the return;
7. the destination does not mutate Cabin state;
8. existing process-global mount semantics remain authoritative.

## Falsifiers

F1 — return reaches any route other than /cabin.

F2 — return initializes a new Cabin context mount.

F3 — return clears or replaces the existing Cabin mount.

F4 — return calls /api/cabin/context, /api/cabin/context/refresh, or an
import endpoint merely to reconstruct the field.

F5 — the Cabin state differs before and after the crossing without an explicit
Cabin mutation.

F6 — the Work, Relationship, Memory, member, or session identity from the
destination becomes part of Cabin context.

F7 — browser history is required to produce the correct return.

F8 — the return creates MAIA cognition or another hidden semantic handoff.

## Stop boundary

This contract does not add:
- semantic object carry;
- memory recall;
- relationship interpretation;
- Work selection;
- synchronization;
- automatic return;
- JARVIS authority;
- production deployment.

The next boundary is the controlled rollout witness for the complete Cabin
crossing sequence.
