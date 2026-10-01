# JARVIS-ASTROLOGY-SOUL-JOURNEY-01 — T0 truth census + T1 "What is alive now"

**Date:** 2026-10-01 · **Branch:** `claude/exciting-euler-w49hze` · **Status:** CANDIDATE: built and tested here, ⛔ not merged, ⛔ not deployed

## Governing idea

Astrology as sacred mirror. Calculated celestial reality is held separately from symbolic tradition, from whole-chart synthesis, from lived expression, and from the member's own meaning. The current sky becomes a *temporal aperture on the natal field*: an activation, never a destiny and never a daily horoscope.

## Custody note

The lane was opened in a Mac Studio session (worktree `astrology-transits-01-20261001`, JARVIS unit `astrology-soul-journey-01-transits-r1`, session `s-a671a308`), where JARVIS was holding it behind two stale claims. The founder then directed the work to continue in a cloud session. **This cloud session cannot reach the Mac Studio's JARVIS home, so the stale claims `s-a607c8b9` and `s-f182f5aa` were NOT recovered here.** Their release, and the reconciliation of `s-a671a308` against this branch, remain a Mac Studio act.

## T0: transit truth census (findings carried as law)

| Surface | Finding | Disposition |
|---|---|---|
| `POST /api/astrology/current-transits` applying/separating | `applying = diff < angle`. This ignores the direction of motion, so it is wrong whenever the body moves away from exact from the inside, and in all retrograde cases | Not reused. A falsifier test (`transitField.test.ts`) shows the legacy rule calling a separating contact "applying" |
| `lib/astrology/transitCalculator.ts:223` | `applying: true` is hard-coded | Not reused |
| Chiron, Ceres, Pallas, Juno and Vesta in `current-transits` | Linear mean motion from a single epoch, which can be off by many degrees | **Not admitted** as transiting bodies or natal targets; the surface says so |
| Lilith and the nodes | Mean points | Held out until a true-point calculation is admitted |
| Sun through Pluto | astronomy-engine, true ecliptic of date, the same frame as the natal engine | **Admitted** |
| `SacredHouseWheel` `transitAspects` prop | Already supported, but the page never passed it | Now fed with verified activations |

## T1–T5 delivered in this slice

- **Engine:** `lib/astrology/transitField.ts`
  - Admits the 10 bodies against the natal Sun–Pluto, Ascendant and Midheaven.
  - Uses the five Ptolemaic aspects with an explicit orb table.
  - Derives applying/separating from the actual change in deviation, which handles retrograde motion.
  - Finds activation windows by sampling the ephemeris and bisecting the edges to the hour.
  - Finds exact passes by golden-section refinement. It reports passes that **station short without perfecting** as such. It reports open-ended windows as open-ended, never with an invented date.
  - Ordering rule, stated on the surface: *slower bodies first, then closest to exact; no importance score.*
  - **Scale:** major = Jupiter–Pluto; minor = Sun–Mars and the Moon.
- **API:** `POST /api/astrology/transit-field` calculates only. The natal points are neither stored nor logged.
- **Surface:** `components/astrology/WhatIsAliveNow.tsx`
  - Light paper material, placed after *Your chart at first glance* and before *Current lens*.
  - Shows the strongest 4 activations, then the Major / Minor / Whole-field lenses.
  - **Deepening:** layers of CALCULATED (geometry, motion, window, every pass, timeline), WHY THIS IS SURFACED (the reasons), SYMBOLIC TRADITION (labelled as a lens, phrased as possibility) and YOUR MEANING.
  - **One instrument:** *Show on the House Wheel* turns on the wheel's transit layer, focused on that contact. The wheel button is renamed *Transits on chart*.
  - **MAIA:** *Bring this activation to MAIA* opens MAIA only on an explicit gesture. It reuses the existing `injectedMessage` carrier, and nothing is sent before that.

## Evidence

- `lib/astrology/__tests__/transitField.test.ts`: **13/13 passed**. It was run here with jest + ts-jest from a scratchpad toolchain, because there is no project `node_modules`, so ⚠️ the founder's run is the evidence of record. Independent witnesses:
  - Exact times are compared with `Astronomy.SearchSunLongitude` and agree to within 5 minutes, in both the future and the past.
  - Every perfecting pass is re-checked against the raw ephemeris (≤ 1′).
  - Applying/separating is checked against the derivative of deviation.
  - Window edges are checked against the orb, to the hour.
  - The ordering rule is checked.
  - The legacy-rule falsifier is included.
- **Isolated strict typecheck** of the engine, route and component is clean, apart from an unresolvable `@capacitor/core` reference inside the existing `apiBase.ts`. ⚠️ `npm run typecheck`, the full gate, was not run in this container.
- **Browser render** (Chromium, using a real computed sky for 2026-10-01 and a synthetic chart) produced 0 console errors and no horizontal scroll at 390px.
- `check:no-supabase` passes.

## Not yet done / next

- **T3 remaining:** the *Within your whole chart* and *Possible human expression* layers. These are deliberately absent rather than shown as empty shells.
- **T4:** a multi-transit horizontal timeline across the whole field. Today there is only a per-activation timeline.
- **T5:** clicking a transit *on the wheel* does not yet open its field, so only one direction of the link exists.
- **T6:** the transit-level *Keep this as a Reflection*, carrying transit context. It is gated on deciding what metadata the reflection may carry.
- Next in the programme: Western natal depth, then Chinese, Vedic and Mayan, each as its own tradition-native architecture.
- ⛔ No merge. ⛔ No deploy. Production is untouched.
