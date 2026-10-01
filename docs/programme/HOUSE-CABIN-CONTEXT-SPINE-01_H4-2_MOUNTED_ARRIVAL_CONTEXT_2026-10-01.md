# HOUSE-CABIN-CONTEXT-SPINE-01 · H4.2 — Mounted Arrival Context

## Ruling

H4.1 visual authority was founder-ratified before this implementation.

H4.2 now binds the already-governed mounted Cabin context to that visual
authority. The arrival is a real member-facing local Cabin surface, but it
does not interpret the mounted field.

## Implementation

Implemented as:

- app/cabin/page.tsx
- app/cabin/CabinArrival.tsx
- app/cabin/cabin.module.css
- app/cabin/__tests__/arrival.test.ts
- docs/design/contracts/cabin-arrival-mounted-context.md

The page is dynamic and offline-only.

Its only context source is readCabinExperienceContext().

## Domain behavior

Work / Relationships / Memory receive presence treatment only from the
corresponding mounted domain availability.

No domain object is selected.

No Work id, Relationship id, or Memory id is passed into a doorway.

MAIA is a fixed explicit threshold and receives no ambient cognition.

## Important infrastructure correction

While exercising the real route, two architectural defects were exposed.

### 1. Next.js route-handler dependency injection

The original H3.7/H3.8/H3.9 handlers used their second argument as test
dependency injection. Next.js supplies its route context as that second
argument in production.

The handlers now distinguish:

- real Next.js route context;
- test dependency injection.

Production uses the canonical dependencies; tests may still inject doubles.

Regression witnesses were added for all three routes.

### 2. Runtime mount bundle boundary

The H3.9 refresh route and the H4.2 page can execute through independently
bundled server consumers. Module-local mount state was therefore insufficient:
the refresh could report mounted while the arrival process saw unavailable.

The runtime mount/state carrier is now process-global through a named global
carrier. It remains ephemeral and local to the Cabin process; no persistence
or synchronization mechanism was introduced.

This preserves:

    explicit refresh
         ↓
    mounted runtime
         ↓
    experience read

without allowing experience read to activate the runtime.

## Evidence

Focused H3.7–H3.9 route regression + H3.2 runtime + H4.2 arrival:

**58/58 PASS**

Additional mounted experience tests remain green.

Real local runtime witness:

- offline Cabin server;
- explicit refresh returned HTTP 200;
- refresh reported mounted context;
- /cabin rendered "What you carried is here.";
- mounted Work presence = true;
- mounted Relationships presence = false;
- mounted Memory presence = false;
- desktop scroll width = viewport width;
- mobile scroll width = 390, viewport width = 390;
- desktop and mobile screenshots captured.

Empty-state runtime witness:

- context artifact removed;
- explicit refresh returned HTTP 200;
- refresh reported empty context;
- /cabin rendered "Begin where you are.".

Unavailable-state witness was established before explicit refresh:

- /cabin returned HTTP 200;
- /cabin rendered "The field is quiet.".

## Stop boundary

H4.2 does not add:

- automatic refresh;
- automatic placement;
- automatic download;
- synchronization;
- JARVIS authority;
- memory recall;
- relationship interpretation;
- Work selection;
- MAIA cognition;
- production deployment.

## Standing

**H4.2 IMPLEMENTATION COMPLETE · REAL RUNTIME WITNESSED · PR PENDING.**
