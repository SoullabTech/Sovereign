# LIVING-FIELD-R2-MOUNT-01 · Rendered mount witness

**Date:** 2026-09-30
**Branch:** `feature/living-field-r2-mount-01-20260930`
**Canonical base at final rebase:** `008963af1`
**Route:** `/maia/living-field?from=house`
**Runtime:** local Next development server, port 3148, local Postgres only
**Identity:** two disposable synthetic local members; one explicitly admitted to R2, one control
**Production:** untouched; no cohort environment variables changed

## Standing

**FUNCTIONAL / VISUAL MOUNT WITNESS PASS · PRODUCTION COHORT ENABLEMENT HOLD**

The HOLD is narrow: the R2 room renders and circulates correctly, but the development runtime emits
26 React lifecycle warnings from Drei `<Html>` label roots when the R2 Three scene mounts. A clean
server restart reproduces the same count before any semantic navigation. No warning is introduced by
Grief depth traversal itself. The approved visual language depends on these HTML labels, so they are
not replaced by materially different native-Three text in this lane.

A production-runtime walk is required before `LIVING_FIELD_R2_ENABLED=true` is set for any production
member. The PR remains fail-closed by default and can be admitted to canonical custody without
exposing R2.

## Witness matrix

| Case | Viewport | Expected | Result |
|---|---:|---|---|
| admitted synthetic member | 1600×1000 | complete R2 shell | PASS |
| admitted member → Grief | 1600×1000 | governed Water → Relationship → Grief depth | PASS |
| Grief → Wider | 1600×1000 | one containing level outward | PASS |
| Wider → Whole | 1600×1000 | whole ecology restored | PASS |
| House `Return Home →` | 1600×1000 | `/home` | PASS |
| non-R2 control member | 1600×1000 | canonical Living Field, no R2 shell | PASS |
| admitted member | 390×844 | canonical Living Field, no R2 shell | PASS |

Observed machine assertions from the final walk:

```text
desktopR2 = 1
houseThreshold = 1
R2 admission HTTP = 200
griefVisible > 0
widerButtons = 1
returnUrl = /home
controlR2 = 0
controlCanonical = 1
mobileR2 = 0
mobileCanonical = 1
```

## Findings repaired during witness

### W1 · mounted shell exceeded the viewport

The admitted R2 shell originally retained standalone `h-screen` while mounted below the House
threshold. Its bottom scale/navigation instrument fell below the 1600×1000 witness viewport.

Repair: `LivingFieldGrokkerShell` now accepts `belowHouseThreshold`; only the mounted composition uses
`h-[calc(100dvh-80px)] min-h-[640px]`. Standalone R2 visual authority retains its original `h-screen`
/ `min-h-[720px]` geometry.

### W2 · presentation was initially chosen in two asynchronous steps

R2 admission and viewport hooks initially defaulted to false, which allowed the canonical dashboard
to mount before the R2 answer arrived. Both gates now expose explicit `resolved` state. The dashboard
waits in a neutral gathering state until both decisions are known, then chooses R2 or canonical once.
This preserves fail-closed behavior and avoids a canonical→R2 presentation flash.

### W3 · Fire inspection is not a spatial crossing

Search → Fire correctly illuminates Fire but does not enter it: R2E2 has no rendered spatial
navigation plan for the Fire field itself. The system refuses to invent one. Grief was used for the
depth witness because it has a governed rendered path through Water → Relationship → Grief.

## Development-runtime warning

On a clean Next development server, before depth navigation:

```text
Attempted to synchronously unmount a root while React was already rendering...
count = 26
```

The count corresponds to the R2 scene's Drei `<Html>` label population. The warnings reproduce after
a clean restart and are not caused by Fast Refresh or by the cohort presentation swap. Functional
navigation remains intact, but production standing is intentionally not inferred from that fact.

A local production build was attempted after the functional witness. Webpack stopped while writing
its cache with `ENOSPC`; the machine had approximately 26 GiB free after the failed build cleaned up.
This is recorded as local build-environment evidence, not as a code failure. GitHub's production build
gate remains authoritative for the PR; a production-runtime browser walk is still owed before cohort
enablement.

## Screenshot custody

- `docs/design/contracts/screenshots/living-field-r2-mount-desktop-whole.png`
- `docs/design/contracts/screenshots/living-field-r2-mount-desktop-depth-grief.png`
- `docs/design/contracts/screenshots/living-field-r2-mount-desktop-wider.png`
- `docs/design/contracts/screenshots/living-field-r2-mount-desktop-return-whole.png`
- `docs/design/contracts/screenshots/living-field-r2-mount-control-desktop.png`
- `docs/design/contracts/screenshots/living-field-r2-mount-admitted-mobile-fallback.png`

The final screenshot pass hides only the Next development-overlay host after the warning count was
recorded separately. No Soullab application element is hidden.

## Release law after this witness

1. PR may proceed through CI and merge consideration while the R2 switch remains false/unset.
2. Merge does not authorize production cohort exposure.
3. After deployment with the switch closed, run the same production browser witness.
4. Only if production runtime is clean may the founder name the first R2 cohort and set the switch.
5. Any return failure, fallback drift, provenance/consent drift, or runtime label-root instability
   keeps cohort enablement on HOLD.
6. R2F remains outside this lane.
