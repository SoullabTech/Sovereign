# Pro Astrology · Other systems (Vedic, Chinese, Mayan)

Status: local only. Not pushed, not deployed. Behind the existing Pro access gate
(`ASTRO_PRO_PREVIEW_ENABLED` + founder-only access phase).

## Census of what Free Astrology already had

| System | Free page | Calculator | Input it needs | Calculation | Generated or reference text |
|---|---|---|---|---|---|
| Vedic | `app/astrology/vedic/page.tsx` → `POST /api/astrology/vedic/list` | tropical chart (`ephemerisCalculator`) → `ayanamsaCalculator` + `vedicAstrology` (rashi, nakshatra, pada, dignity, whole-sign houses) → `vimshottariDasha` | date, time, place, timezone | grahas, Lagna, nakshatras, dasha periods | Spiralogic integration (generated); nakshatra and dasha library text |
| Chinese | `app/astrology/chinese/page.tsx` (in the browser) | `chineseAstrology` (animal, element, yin/yang, 60-year position) | birth year only | year sign | the page builds template "readings" (personality, career, health); animal library text |
| Chinese · Four Pillars / Da Yun | same page → `POST /api/astrology/da-yun` | `daYunCalculator` → `fourPillarsService` | date, time, **gender** | pillars, 10-year luck cycles | — |
| Mayan | `app/astrology/mayan/page.tsx` (in the browser) | `mayanAstrology` (Dreamspell Tzolk'in, Haab, path of life, direction) | birth date only | kin, tone, day sign, Haab | life-cycle insight (generated); day-sign library text |

## What Pro now shows

A panel "Other systems" in the chart workbench (after Astro map), for whichever chart is
open: the member's own chart or a saved chart. Tabs: Vedic · Chinese · Mayan; ayanamsa
choice (Lahiri, True Chitra, KP) for Vedic.

- Route `POST /api/astrology/pro/systems` `{ subject: 'own' | <saved chart id>, ayanamsa? }`.
  Owner, consent and saved-chart scoping are the same as the other Pro routes
  (`resolveProOwner`, `loadSubjectBirth`, `admitProCalculation`, recheck after work).
- The Free Vedic conversion was moved, unchanged, from the Free route into
  `lib/astrology/vedicChartFromTropical.ts`; both routes import it. No second calculator.
- Only calculated facts and library reference text are returned. The Free pages' generated
  readings are left out. Each tab shows its method boundary.
- No birth time, place or timezone is returned. Dasha boundaries are kept to the day, so the
  birth date is visible as the start of the first dasha (as ages are on the Free page).

## Not included, for a founder decision

- **Four Pillars and Da Yun.** The Free calculator is a self-described simplified demo
  (month pillar not from solar terms, approximate day pillar) and Da Yun needs a gender
  that saved charts do not hold. Bringing them into a professional view needs a solar-term
  calendar first.
- **Chinese New Year boundary.** The year sign counts the Gregorian year, as the Free page
  does; the method note says so.
- **Mayan count.** Dreamspell, not the traditional K'iche' count; labelled.
- The reused dasha card carries the Free component's library text (themes, health focus,
  Spiralogic connection).

Screenshots (fictional chart: 15 June 1990, 14:30, New York):
`screenshots/pro-systems-{vedic,dasha,chinese,mayan}-desktop.jpg`, `pro-systems-vedic-mobile.jpg`.
