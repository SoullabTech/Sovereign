# Astrology calculator census — 2026-11-07

**Status:** DISCOVERED findings. Read-only census plus three numeric probes. No lane opened; nothing here authorizes a fix beyond the two calendar commits already made (`98f6ac85c`, `bd520201f`).

**Trigger:** Owen Trahant's workbench showed Galactic Kan / Kin 163 / Haab 3 Sip for 3 Sep 2003. Independent arithmetic gives Dreamspell Kin 193 (Red Spectral Skywalker) and, traditionally (GMT 584283), 13 Akbal, 11 Mol, Long Count 12.19.10.10.3.

## Evidence classes used

- **RUN** — executed against an independent computation made in this session.
- **READ** — what the code says; not what it does at runtime.
- **SELF-DECLARED** — the code's own comments state a limitation.
- **NONE** — no independent check found.

## Calculators

| Calculator | Method (READ) | Evidence | Finding |
|---|---|---|---|
| Sun, Moon, planets | `astronomy-engine` | RUN (Sun) | Sun 10.59° Virgo for 2003-09-03 12:15 UT equals independent Meeus ch. 25 (10.59°). Moon and other planets not independently checked. |
| Ascendant, MC | spherical formula | RUN | ASC 2.40° Libra, MC 2.79° Cancer equal an independent calculation (2.404°, 2.795°). |
| Chiron | Keplerian, Chiron anchored to its 2018 Aries ingress | SELF-DECLARED ~0.5° over ±100 y | Not independently checked. |
| Ceres | Keplerian, epoch back-derived from a Wikipedia value | SELF-DECLARED | Not independently checked. |
| **Pallas, Juno, Vesta** | Keplerian, `M0` copied from earlier "linear stubs" | **SELF-DECLARED "potentially 20–60° off"** | `ephemerisCalculator.ts` ~line 452. Shown to members as positions. Highest-risk item found. |
| North Node | mean node | SELF-DECLARED | Labelled approximate; true node not computed. |
| **Placidus (Free)** | falls back to Porphyry | READ + RUN | A request for `placidus` returns Porphyry cusps (cusps spaced 30.13° apart). `koch` also falls back (`TODO`). The birth-chart route advertises `placidus` and Koch. |
| Placidus, Koch (Pro) | iterative solve in `proEphemerisCalculator.ts` | READ | Implemented; not independently checked. |
| `houseSystems.ts` Placidus | fixed 0.35/0.7 fractions of each quadrant | SELF-DECLARED "simplified" | Not true Placidus. Check whether anything calls it. |
| Ayanamsa (Lahiri) | linear: 23.85° + 0.01397°/yr | RUN vs recalled references | Within about 0.003–0.005° (10–20 arcsec) in 2003 and 2026. References are from memory, not a source I opened. Described in the Pro note as "provisional". |
| Vimshottari dasha | from Moon sidereal longitude | NONE | Inherits the ayanamsa and Moon accuracy. |
| Chinese year | now Chinese New Year table | RUN | Fixed in `bd520201f`; 30/30 recalled published dates. |
| Chinese Da Yun / four pillars | month looked up by calendar month with `approximateDay` per solar term | READ | Solar terms need the exact moment of each 15° of solar longitude; a calendar-month lookup is wrong near term boundaries. Not tested. |
| Dreamspell Kin | epoch and leap-day count | RUN | Fixed in `98f6ac85c`. |
| Traditional Tzolk'in / Haab / Long Count | GMT 584283 | RUN | New; checked on 2003-09-03 and 2012-12-21. |
| Dreamspell "path of life" | Dreamspell Kin at birth ±180 days | READ | Not a traditional K'iche' calculation; presented as one. Shifts with the Kin fix. |
| Transit exact dates and applying/separating | "simplified — would need velocity", `applying: true // TODO` | SELF-DECLARED | `transitCalculator.ts` lines ~212–223. Phase shown to members may always read "applying". |
| Station dates | pre-computed approximate list | SELF-DECLARED | `celestialEvents.ts`. |
| Aspects, decans, gochara, ashtakavarga, synastry, life cycles | various | NONE | Not examined. |

## Test suite honesty

Existing astrology tests (`astrology-pro-*.test.ts`) check structure, access rules and agreement between Free and Pro paths. At least one (`astrology-pro-systems.test.ts`) compared the Mayan result to the same function, so it could not detect the 30-Kin error. No test used an external reference value before today's `astrology-calendar-reference.test.ts` and `mayan-dreamspell-kin.test.ts`.

## Proposed order (for a founder decision; not started)

1. Pallas / Juno / Vesta: either source real J2000 elements and verify, or withhold them from display. Withholding is the smaller reversible step.
2. Free Placidus and Koch: either implement (Pro already has them) or stop offering them by name.
3. Transit applying/separating from daily motion.
4. Da Yun: exact solar-term moments from solar longitude.
5. Reference vectors from Swiss Ephemeris or JPL Horizons for Moon and planets, with a deliberately wrong version of each calculation that the tests must reject.
6. Ayanamsa: use the standard Lahiri value at date rather than the linear fit, and name which one is used.
7. Relabel or replace the Dreamspell path of life.

## Not examined

Aspects/orbs, decans, ashtakavarga, gochara, synastry, life-cycle returns, Western house-system output beyond Owen's chart, any member-visible wording around these.
