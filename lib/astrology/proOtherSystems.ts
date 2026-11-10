/**
 * ASTRO-PRO-SYSTEMS-01 — Vedic, Chinese and Mayan views of a Pro chart.
 *
 * Reuses the calculators Free Astrology already runs (`/astrology/vedic`,
 * `/astrology/chinese`, `/astrology/mayan`); nothing here is a second
 * calculator. Only calculated facts and the libraries' fixed reference text
 * are returned: the Free pages' generated readings (Spiralogic integration,
 * life guidance, life-cycle insight) are deliberately left out of Pro.
 *
 * The result carries no birth date, time or place.
 */
import { calculateBirthChart, type BirthData } from './ephemerisCalculator';
import { convertToVedicChart } from './vedicChartFromTropical';
import { calculateVimshottariDasha } from './vimshottariDasha';
import { generateSpiralogicIntegration } from './vedicAstrology';
import {
  getChineseElement, getChineseZodiacAnimal, getSexagenaryPosition, getYinYang,
} from './chineseAstrology';
import { calculateCompleteMayanProfile } from './mayanAstrology';
import { chineseYearForIsoDate } from './chineseNewYear';
import { traditionalMaya, type TraditionalMaya } from './proTraditionalMaya';
import { calculateFourPillars, type DayStart, type FourPillars } from './proFourPillars';
import { buildChineseReading, type ChineseReadingData } from './chineseReading';
import { daYunByDirection, type DaYunByDirection } from './proDaYun';
import type {
  AyanamsaType, CompleteVedicProfile, GrahaName, NakshatraInfo, VimshottariDashaProfile,
} from './types/vedic';
import type { SavedChartBirth } from './proSavedCharts';

export const PRO_SYSTEMS_AYANAMSAS: AyanamsaType[] = ['lahiri', 'true_chitra', 'krishnamurti'];

export interface ProVedicGraha {
  graha: GrahaName;
  rashi: string;
  degree: number;
  nakshatra: string;
  pada: number;
  house: number;
  retrograde: boolean;
  dignity: string;
}

export interface ProOtherSystems {
  vedic: {
    ayanamsa: AyanamsaType;
    ayanamsaLabel: string;
    ayanamsaValue: number;
    lagna: { rashi: string; degree: number; nakshatra: string };
    grahas: ProVedicGraha[];
    birthNakshatra: NakshatraInfo;
    moonPada: 1 | 2 | 3 | 4;
    dasha: VimshottariDashaProfile;
    /**
     * What the Free Vedic page's profile and planets views need beyond the above:
     * the full sidereal chart and the three signs. The room joins it with `dasha`
     * and `birthNakshatra` (kept once, not repeated here). No birth detail in it.
     */
    profile: Omit<CompleteVedicProfile, 'dasha' | 'birthNakshatra'>;
    method: string;
  };
  chinese: {
    animal: string;
    chineseName: string;
    symbol: string;
    element: string;
    elementChineseName: string;
    yinYang: 'yin' | 'yang';
    cyclePosition: number;
    archetype: string;
    characteristics: string[];
    compatibility: string[];
    incompatible: string[];
    fourPillars: FourPillars;
    /** The full zodiac reading (animal, element, strengths, compatibility, holistic profile). A function of the Chinese year only. */
    reading: ChineseReadingData;
    /** Ten-year luck cycles for both directions, with no birth details in them. */
    daYun: DaYunByDirection;
    method: string;
  };
  mayan: {
    /** The traditional day count (K'iche' / Yucatec), Haab and Long Count. */
    traditional: TraditionalMaya;
    /** The rest is the Dreamspell count, a modern system, labelled as such. */
    galacticSignature: string;
    daySign: { name: string; glyph: string; archetype: string; meaning: string };
    tone: { number: number; name: string; meaning: string };
    tzolkinNumber: number;
    wavespell: string;
    haab: string;
    direction: string;
    pathOfLife: Array<{ stage: 'youth' | 'adulthood' | 'future'; signature: string }>;
    method: string;
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

// The first dasha begins at the birth instant. Boundaries are kept to the day
// (dasha timing is provisional in the Free calculator too), so the birth time
// is never returned; the birth date stays visible as the first boundary.
const toDay = (d: Date | string) => {
  const t = new Date(d);
  return new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()));
};
function dashaToDay<T extends { startDate: Date; endDate: Date; subPeriods?: T[] }>(p: T): T {
  return { ...p, startDate: toDay(p.startDate), endDate: toDay(p.endDate), subPeriods: p.subPeriods?.map(dashaToDay) };
}
function dashaProfileToDay(d: VimshottariDashaProfile): VimshottariDashaProfile {
  return {
    ...d,
    mahadashas: d.mahadashas.map(dashaToDay),
    currentMahadasha: dashaToDay(d.currentMahadasha),
    currentAntardasha: d.currentAntardasha ? dashaToDay(d.currentAntardasha) : null,
    previousMahadasha: d.previousMahadasha ? dashaToDay(d.previousMahadasha) : null,
    nextMahadasha: d.nextMahadasha ? dashaToDay(d.nextMahadasha) : null,
  };
}

/**
 * @param birth       the subject's local birth date, time and place (server only)
 * @param verifiedUtc the birth instant already admitted by `admitProCalculation`
 */
export async function calculateProOtherSystems(
  birth: SavedChartBirth, verifiedUtc: string, ayanamsa: AyanamsaType, dayStart: DayStart = 'midnight',
): Promise<ProOtherSystems> {
  const instant = new Date(verifiedUtc);
  const iso = instant.toISOString();
  // Same construction as the Free Vedic route: the engine receives the
  // admitted UTC civil fields, so it cannot reinterpret the wall clock.
  const birthData: BirthData = {
    date: iso.slice(0, 10),
    time: iso.slice(11, 16),
    location: { lat: birth.location.lat, lng: birth.location.lng, timezone: 'UTC' },
    houseSystem: 'whole-sign',
  };
  const tropical = await calculateBirthChart(birthData);
  const chart = convertToVedicChart(tropical, instant, ayanamsa);
  const moon = chart.grahas.Chandra;
  const dasha = calculateVimshottariDasha(instant, moon.longitude);

  // Chinese and Mayan count the local civil birth date, as the Free pages do.
  // The Chinese year turns at Chinese New Year, not 1 January.
  const year = chineseYearForIsoDate(birth.date).chineseYear;
  const animal = getChineseZodiacAnimal(year);
  const element = getChineseElement(year);
  const mayan = calculateCompleteMayanProfile(new Date(birth.date + 'T12:00:00.000Z'));

  return {
    vedic: {
      ayanamsa,
      ayanamsaLabel: chart.ayanamsa.label,
      ayanamsaValue: round2(chart.ayanamsaValue),
      lagna: {
        rashi: chart.ascendant.rashi.name,
        degree: round2(chart.ascendant.rashiDegree),
        nakshatra: chart.ascendant.nakshatra.name,
      },
      grahas: (Object.keys(chart.grahas) as GrahaName[]).map((graha) => {
        const p = chart.grahas[graha];
        return {
          graha,
          rashi: p.rashi.name,
          degree: round2(p.rashiDegree),
          nakshatra: p.nakshatra.name,
          pada: p.nakshatraPada,
          house: p.house,
          retrograde: p.retrograde,
          dignity: p.dignity,
        };
      }),
      birthNakshatra: moon.nakshatra,
      moonPada: moon.nakshatraPada,
      dasha: dashaProfileToDay(dasha),
      profile: {
        chart,
        moonSign: chart.grahas.Chandra.rashi,
        sunSign: chart.grahas.Surya.rashi,
        ascendantSign: chart.ascendant.rashi,
        spiralogicIntegration: generateSpiralogicIntegration(chart.grahas.Chandra.rashi, moon.nakshatra),
      },
      method: 'Sidereal positions from the Free Vedic calculator: Soullab provisional ayanamsa approximation, whole-sign houses from the Lagna, Vimshottari dasha from the Moon, dates to the day. Not yet checked against a reference ephemeris.',
    },
    chinese: {
      animal: animal.name,
      chineseName: animal.chineseName,
      symbol: animal.symbol,
      element: element.name,
      elementChineseName: element.chineseName,
      yinYang: getYinYang(year),
      cyclePosition: getSexagenaryPosition(year),
      archetype: animal.archetype,
      characteristics: animal.characteristics,
      compatibility: animal.compatibility,
      incompatible: animal.incompatible,
      fourPillars: calculateFourPillars(instant, birth.date, birth.time.slice(0, 5), dayStart),
      reading: buildChineseReading(year),
      daYun: daYunByDirection(instant, civilOffsetMinutes(instant, birth.date, birth.time), birth.time.slice(0, 5)),
      method: 'Year sign from the Free Chinese calculator. The year turns at Chinese New Year (China Standard Time, 1900–2100 table from astronomical new moons and the December solstice), so a January or early-February birth can belong to the previous year’s sign. The calendar date is used, not the birth hour.',
    },
    mayan: {
      traditional: traditionalMaya(birth.date),
      galacticSignature: mayan.tzolkin.galacticSignature,
      daySign: {
        name: mayan.tzolkin.daySign.name,
        glyph: mayan.tzolkin.daySign.glyph,
        archetype: mayan.tzolkin.daySign.archetype,
        meaning: mayan.tzolkin.daySign.meaning,
      },
      tone: {
        number: mayan.tzolkin.tone.number,
        name: mayan.tzolkin.tone.name,
        meaning: mayan.tzolkin.tone.meaning,
      },
      tzolkinNumber: mayan.tzolkin.tzolkinNumber,
      wavespell: mayan.tzolkin.wavespell,
      haab: mayan.haab.fullDate,
      direction: mayan.cardinalDirection.direction,
      pathOfLife: (['youth', 'adulthood', 'future'] as const).map((stage) => ({
        stage, signature: mayan.pathOfLife[stage].galacticSignature,
      })),
      method: 'Galactic signature, Kin and wavespell use the modern Dreamspell count (26 July 1987 = Kin 34, 29 February skipped). Haab and the traditional date use the Goodman–Martínez–Thompson correlation (584283). The Dreamspell is not the traditional Maya or K’iche’ day count.',
    },
  };
}

/** Local offset from UTC at birth, in minutes, from the instant and the local civil date and time. */
function civilOffsetMinutes(instant: Date, localDate: string, localTime: string): number {
  const [y, m, d] = localDate.split('-').map(Number);
  const [hh, mm] = localTime.split(':').map(Number);
  return Math.round((Date.UTC(y, m - 1, d, hh, mm) - instant.getTime()) / 60_000);
}
