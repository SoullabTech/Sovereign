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

---

## Addendum — later the same day (2026-11-07): what was done and what stands

**Fixed and committed** (each with a reference test whose expected values come from outside the code under test; all on `feature/astro-pro-systems-20261105`, unpushed):

| Commit | Fix | Evidence |
|---|---|---|
| `98f6ac85c` | Dreamspell Kin epoch (Kin 34, not 0), 29 Feb skipped, wavespell sign | 26 Jul 1987 = Kin 34; 21 Dec 2012 = Kin 207; 3 Sep 2003 = Kin 193 |
| `bd520201f` | Chinese year turns at Chinese New Year (1900–2100 table); traditional Tzolk'in / Haab / Long Count (GMT 584283) | 30 of 30 recalled published New Year dates; 3 Sep 2003 = 13 Akbal, 11 Mol, 12.19.10.10.3 |
| `c597e5be0` | Pallas, Juno, Vesta withheld (`INCLUDE_UNVERIFIED_ASTEROIDS = false`) | SELF-DECLARED "20–60° off" |
| `2d9684b55` | Free Placidus and Koch are real; visible Porphyry fallback at polar latitudes (`houseSystemApplied`) | independent Placidus/Koch at 3 places, within 0.003° |
| `ce4bed8ef` | Transit applying/separating from real motion; no invented exact dates | Sun and retrograde Saturn cases |
| `f8620b775` | Four Pillars and Da Yun from exact solar terms | 2000-01-01 and Mao Zedong's published chart |
| `3dd0128b1` | Free chart retrograde flags (were always false) | 112 of 112 states vs independent apparent motion; positions within 0.02° (Jupiter/Saturn 0.15°) |
| `a6722e51a` | Ayanamsa from definitions (Lahiri, Krishnamurti, True Chitra), with nutation | 1956 CRC value; J2000 23°51'11"; KP gap 5'48" |
| `a4ac224c3` | Free Chinese page crashed on an undeclared `setDaYunProfile` (pre-existing on this branch) | browser: 10 Feb 2015 now Wood Horse (2014) |
| `b569c55d8` | Black Moon Lilith was the perigee, 180° off | 60 real apogees: Moon 3° from corrected point, 177° from old |

**Checked and found sound:** Sun, Moon, Ascendant and MC (Owen's chart); mean node (rate and epoch; named `calculateTrueNode` but is the mean node); aspect geometry (separation folding, orb from exact angle).

**Still open — founder decisions or unverified:**

1. **Dreamspell "path of life"** — Youth/Future are Dreamspell Kin ±180 days, which is exactly nine day-sign cycles, so the sign matches the birth sign except across a skipped 29 February; text such as "moving from Space toward Space" results. Not a traditional K'iche' calculation. Relabel, replace or remove?
2. **Four Pillars day boundary** — implemented as 00:00 local with 23:00–24:00 as late Zi of the same day; many schools change the day at 23:00. No true solar time.
3. **"Provisional approximation" wording** (Vedic page, Pro note, zodiac toggle) — left unchanged; evidence is stronger but loosening member-facing claim wording is a founder act under the claim-state canon.
4. **Decan table (`decanSystem.ts`)** — rulers follow the Chaldean order for 34 of 36 decans. Aries 3rd lists Jupiter (Chaldean: Venus) and Scorpio 3rd lists Moon (Chaldean: Venus); both match the triplicity system instead, so the table mixes systems. The Aries 3rd entry also carries text apparently pasted from a Scorpio decan ("phoenix" gifts, a November ritual date). Interpretive content: needs authorship, not a calculation fix.
5. **Chiron and Ceres** — Keplerian, anchored to single epochs; not independently verified.
6. **Pallas / Juno / Vesta** — withheld until JPL elements are sourced and checked.
7. **Exact transit dates and active windows** — unavailable (`null`), not computed.
8. **MAIA list route** — infers gender from pronouns by regex for Da Yun and parses time zones as whole hours (+5:30 loses its minutes). Not changed.
9. **Stored Bazi profiles** — any saved earlier were computed with the old Four Pillars; where they are stored was not checked.
10. **Not examined:** gochara, ashtakavarga, synastry, life-cycle returns, the Pro chart panel and Free chart page in a browser.

**Evidence limits:** no Swiss Ephemeris or JPL data file was available here; reference values are independent offline implementations (JPL approximate-element tables, Meeus series, definitional ayanamsa) and recalled published values. A cross-check against real Swiss Ephemeris output remains worthwhile.

---

## Addendum — 2026-11-08: Pro rooms, and a correction

**Built (stacked PRs, each Class C, each with an external-reference test):** #2184 Chinese room (pillars and year sign, zodiac reading, Da Yun with direction) · #2185 Vedic room (profile, dasha, planets) · #2186 Mayan room (traditional count, path of life, galactic signature, today's energy).

**Correction to an earlier hand-off note.** The Free chart page's wheel and transits were listed as "not yet in Pro". That was wrong. Pro already has `CelestialChartWheel`, `ProTransitPanel`, `ProEphemerisPanel`, `ProAspectGrid`, sidereal and harmonic views (`ProChartViews`). Nothing to port there.

**What the Free chart page has that Pro does not (READ, by file search):**

| Free-page feature | In Pro? | Note |
|---|---|---|
| `SacredHouseWheel` (3,470 lines, Spiralogic house meanings, aspect synthesis text) | No | Interpretive content; Pro's stated posture is that claims about astrological effects are not established. Porting is a product decision, not a calculation fix. |
| Lunar nodes "evolutionary lens" text | No (node positions only) | Interpretive. |
| "What do you recognize here?" reflection capture | No | Member-meaning feature; has consent and storage implications. |
| Archetype descriptions per sign/planet | Partly (`ProSystemsPanel`) | |
| Alien patterns | No | |

**Ask MAIA.** `proAskMaia.ts` exists only for astrologer-shared links, off by default per link, with the ruled limits (chart-only context, nothing remembered, crisis message). A member-facing Ask MAIA inside Pro is not covered by that ruling, and the Pro preview states that MAIA chart transmission is disabled. Not built; needs a founder ruling on what MAIA may see and whether anything is kept.
