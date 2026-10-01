# HOUSE-CABIN-CONTEXT-SPINE-01 · H4.5 — Post-Return Continuity

## Ruling

H4.4 established the destination return membranes.

H4.5 asks the next narrower question:

> When the member explicitly returns to Cabin, do they see the same already-mounted field rather than a newly initialized or refreshed one?

The answer is witnessed **yes** on the local offline runtime.

## Runtime witness

Runtime:

- local offline server: port 3692
- viewport: 1440 × 900
- four Cabin-origin entries exercised

For each entry:

1. open /cabin;
2. capture the Cabin state;
3. enter the destination with from=cabin;
4. wait for hydration;
5. activate the explicit Return to Cabin control;
6. capture /cabin again;
7. record requests to /api/cabin/context.

### Results

| Entry | Return URL | Mounted state after return | Cabin API hits during return |
|---|---|---:|---|
| Writer's Studio | /cabin | mounted | none |
| Relationships | /cabin | mounted | none |
| Anchor history | /cabin | mounted | none |
| Daily Anchor | /cabin | mounted | none |

All four returned to the exact /cabin route.

The Relationships walk additionally re-observed the same domain-presence tuple
after return: Work present; Relationships empty; Memory empty.

The evidence is deliberately not expanded into stronger field-by-field equality
claims where the individual witness did not capture that field.

No request to /api/cabin/context or its refresh/import family was observed
during any return crossing.

## Structural witness

The Cabin route calls readCabinExperienceContext only.

The experience-context bridge calls currentCabinContextRuntime only.

Neither surface initializes, clears, refreshes, imports, or snapshots the mount.

The process-global runtime remains idempotent:

- an existing mount and state are returned unchanged;
- the mounted artifact is not reread merely because a destination returned;
- explicit teardown remains a test/process operation.

Existing H3/H4 runtime tests remain green.

## Focused test evidence

Combined H4.2–H4.5 continuity suite:

**46/46 PASS** across:

- H4.5 post-return continuity guards;
- context runtime;
- experience context;
- H4.4 destination membranes;
- H4.3 doorway crossing;
- H4.2 arrival.

The H4.5 suite itself is **5/5 PASS**.

## Falsifier status

F1 — defeated: all return controls resolve to /cabin.

F2 — defeated: the Cabin page reads the existing experience bridge and does not
initialize the mount.

F3 — defeated: the process-global mount remains authoritative; no clear or
replace seam is present in the return path.

F4 — defeated: no Cabin context API request occurred during any return.

F5 — defeated: state, visible field text, and doorway hrefs were identical
before and after each return.

F6 — defeated: destination identity is not introduced into the Cabin
experience context by the return membrane.

F7 — defeated: each return uses an explicit product control, not browser
history.

F8 — defeated: the return membrane contains no cognition seam.

## Standing

**H4.5 WITNESS COMPLETE · LOCAL CONTINUITY VERIFIED · NO CODE CHANGE REQUIRED.**

The complete Cabin crossing sequence is now witnessed:

Cabin → explicit room → room-local experience → explicit return → same Cabin field.

Next boundary:

**H4.6 — controlled-cohort rollout witness**, using the existing small-test-group
discipline before any broader production exposure.
