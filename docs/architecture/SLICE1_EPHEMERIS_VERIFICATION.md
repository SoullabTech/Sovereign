# Slice 1 — Ephemeris Engine Verification (Kelly's chart vs Astrograph)

> **Status:** verification complete, 2026-06-22. Slice 1's real shape changed on
> contact with the codebase: a production-grade ephemeris engine **already exists**
> and is wired to 6 live routes. Slice 1 is therefore **verify + fill the gaps**,
> not build-from-scratch.

## What already exists
- **`lib/astrology/ephemerisCalculator.ts → calculateBirthChart()`** — computes the
  full chart using **`astronomy-engine`** (JPL-grade, self-hosted, **no external API**).
- Live behind `POST /api/astrology/birth-chart` (+ 5 other routes: vedic/dasha,
  vedic/ashtakavarga, synastry, stellium, between/chat).
- Real multi-tradition layers already present: `vedicAstrology.ts` (sidereal +
  nakshatras), `ayanamsaCalculator.ts`, `vimshottariDasha.ts`, `chineseAstrology.ts`,
  `decanCalculator.ts`, `gocharaTransits.ts`. (Maps directly onto Kelly's
  "Chinese / Sidereal / Mayan" ask — most of it is already real computation.)

## The acceptance test (existing engine vs verified oracle)
Oracle = `sweph` (Swiss Ephemeris, Moshier), **proven exact against Kelly's
Astrograph report** (planets to the arcminute; Asc/MC confirmed by aspect orbs).

| Body | Existing engine | Oracle (Astrograph-exact) | Δ° |
|------|-----------------|---------------------------|-----|
| Sun | Sagittarius 17.66° h4 | Sag 17°40' h4 | **0.00** |
| Moon | Scorpio 22.55° h4 | Sco 22°33' **h3** | 0.00 · ✗ house |
| Mercury | Scorpio 28.09° h4 | Sco 28°05' h4 | **0.00** |
| Venus | Sagittarius 25.31° h4 | Sag 25°18' h4 | **0.00** |
| Mars | Libra 3.26° h2 | Lib 3°16' h2 | **0.00** |
| Jupiter | Leo 3.90° h12 | Leo 3°54' h12 | 0.01 |
| Saturn | Pisces 23.08° h7 | Pis 23°05' h7 | **0.00** |
| Uranus | Virgo 24.23° h1 | Vir 24°14' h1 | **0.00** |
| Neptune | Scorpio 22.84° h4 | Sco 22°50' **h3** | 0.00 · ✗ house |
| Pluto | Virgo 20.60° h1 | Vir 20°36' h1 | **0.00** |
| North Node | Taurus 14.48° h9 | Tau 15°59' h9 | **1.50 ⚠** |
| **Ascendant** | **Leo 29.42°** | **Leo 29°25'** | **0.00** |
| **Midheaven** | **Taurus 26.85°** | **Tau 26°51'** | **0.00** |

**Headline: planets and angles are exact** (Δ ≤ 0.01°). The "simplified" ascendant
formula and astronomy-engine are, in fact, arcminute-accurate for this chart.

## The four discrepancies (all specific, all fixable)
1. **North Node — 1.5° off.** Engine computes the **mean** node; Astrograph uses the
   **true** node. Cosmetic for most charts; matters when the node sits near a sign/house
   cusp. Fix: use the true node.
2. **House rule — non-standard "angular orb."** `calculateHouse()` snaps any planet
   within **5° before** an angle (Asc/IC/Desc/MC) **into** that angular house. This is
   what pushes Moon (4.3° before IC) and Neptune (4.0° before IC) into the 4th where
   Astrograph (standard assignment) places them in the 3rd. Fix: standard assignment
   (no snap) for portrait-grade output.
3. **Placidus is stubbed to Porphyry.** `calculatePlacidusHouses()` literally returns
   `calculatePorphyryHouses()`. The four **angles are identical** in both systems (so
   Kelly's Asc/MC are still exact), but **intermediate cusps differ** — latent house
   errors for other charts. Fix: implement real Placidus, or label the option honestly.
4. **Timezone is estimated from longitude, not the tz string.** `Math.round(lng/15)`.
   Correct for Kelly by luck (−91.15/15 → −6 = CST). **Breaks** on DST births, political
   tz boundaries, and half-hour zones. Fix: resolve the IANA tz + historical offset.

## The gap (new work, not a fix)
No **chart-shape / leading-planet** detection exists (`aspectPatternDetector.ts` does
stelliums + T-squares + grand trines, but not bowl/bucket/leading-planet, nor a clean
element/modal **balance** structure). The portraits lean on exactly these "dominant
signatures" (e.g. Kelly = **bucket**, Jupiter **leading**, Saturn the **handle/focal**,
**Water** dominant, **Scorpio** stellium). This is the generator-facing signature layer.

## Recommendation
Do **not** fork or destabilize the live engine. Add a thin **portrait-grade chart
adapter** that calls `calculateBirthChart()` (exact planets/angles) and normalizes for
our use: true node, standard house assignment, + the **signature layer** (chart shape,
leading planet, element/modal balance, angular emphasis, tightest aspects). The four
live-engine fixes become **optional upstream** improvements Kelly can authorize
separately (they change behavior for existing astrology-route users).
