# WRITERS-STUDIO-CONVERGENCE-01 · H1-R3 — Studio → House Return Census

## Gate question

When a member entered Writer's Studio from the House, can the Studio offer a
lawful way back to the orienting Home without creating a return-memory object,
new crossing vocabulary, or hidden Work state?

## Existing law

1. `?from=house` is entry provenance, not Work identity.
2. H1-R1/F7 drops `work=` at the Studio landing.
3. The canonical House threshold already exists:
   - `components/house/HouseEntryThreshold.tsx`
   - it appears only when `from=house`
   - it delegates to `HouseRoomThreshold`
   - the canonical return target is `/home`, not the legacy `/house`.
4. `HouseRoomThreshold` is already the established visual language for a
   room entered from the House.
5. Writer's Studio has an outer layout:
   `app/writers-studio/layout.tsx`.
6. The Studio layout currently provides atmosphere only and has no House
   threshold.
7. No new crossing registry entry is required. This is navigation from an
   orienting whole into a room and back, not a place→place facet crossing.
8. No database write is appropriate. Returning is navigation, not an artifact.

## Candidate considered

**New Studio-specific return component / new crossing / stored return token**

Rejected.

Reason: it duplicates an existing House threshold contract and turns a
navigation relationship into a second state system.

## Chosen seam

Reuse `HouseEntryThreshold` in the Writer's Studio outer layout:

```
Studio layout
  ├─ Studio atmosphere
  ├─ HouseEntryThreshold (only when from=house)
  └─ canonical Writer's Studio
```

The threshold is therefore:
- present only when the member explicitly entered from House;
- independent of Work/manuscript identity;
- independent of Studio mode;
- absent for direct Studio entry;
- linked to canonical `/home`;
- non-persistent.

## Acceptance

A browser witness must prove all of:

1. House → Studio arrival exposes the threshold.
2. The threshold says the member is in Writer's Studio and offers Return Home.
3. Clicking Return Home lands at `/home`.
4. Direct Writer's Studio entry without `from=house` exposes no threshold.
5. The Work/manuscript carried by H1-R1 is not altered by the return control.
6. No database row is written merely by entering or returning.

## Witness

A real Chromium walk against the local Next app exercised the new boundary.

Observed after House → Writer's Studio:
- the threshold rendered in the DOM with visible computed styles and a
  non-zero bounding box;
- its return target was exactly `/home`;
- clicking it landed at `/home`;
- a direct `/writers-studio` entry without `from=house` exposed no
  Return Home threshold.

The same browser walk also preserved the H1-R1 landing contract: the Studio
arrival retained the member-selected manuscript and did not reintroduce the
transient `work=` parameter.

## Verification

- Writer's Studio test population: **78 suites / 805 tests PASS**.
- Focused H1-R2 + H1-R3 suites: **19 tests PASS**.
- Project `npm run typecheck`: **FAIL at the existing global regression
  gate**, with one unrelated new diagnostic in `lib/stripe/config.ts:23`
  (Stripe API version type mismatch). The H1-R3 files are not implicated.
- `next-env.d.ts` was already modified in the worktree before H1-R3 and was
  left untouched.

**Stop boundary:** no new persistence, no new crossing vocabulary, no Work
memory, no MAIA input.
