/**
 * Tropical natal chart -> sidereal (Vedic) chart: grahas, nakshatras and
 * whole-sign houses from the Lagna. Shared by the Free Vedic route and the
 * Pro "Other systems" view so both read the same calculation.
 */
import type { BirthChart } from './ephemerisCalculator';
import { calculateAyanamsa, tropicalToSidereal } from './ayanamsaCalculator';
import { calculateSiderealPosition, calculateGrahaPosition } from './vedicAstrology';
import { AYANAMSA_CONFIGS, type AyanamsaType, type GrahaName, type GrahaPosition, type VedicChart } from './types/vedic';

// Map Western planet names to Vedic Graha names
const PLANET_TO_GRAHA: Record<string, GrahaName> = {
  sun: 'Surya',
  moon: 'Chandra',
  mars: 'Mangala',
  mercury: 'Budha',
  jupiter: 'Guru',
  venus: 'Shukra',
  saturn: 'Shani',
  northNode: 'Rahu',
  southNode: 'Ketu',
};

// Signs in order (tropical)
const SIGNS_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

/**
 * Convert tropical sign+degree to absolute longitude
 */
function signDegreeToLongitude(sign: string, degree: number): number {
  const signIndex = SIGNS_ORDER.findIndex(s => s.toLowerCase() === sign.toLowerCase());
  if (signIndex === -1) return 0;
  return signIndex * 30 + degree;
}

/**
 * Convert tropical chart to Vedic chart
 */
export function convertToVedicChart(
  tropicalChart: BirthChart,
  birthDate: Date,
  ayanamsaType: AyanamsaType
): VedicChart {
  const ayanamsaValue = calculateAyanamsa(birthDate, ayanamsaType);
  const ayanamsaConfig = AYANAMSA_CONFIGS[ayanamsaType];

  // Convert ascendant
  const ascLongitude = signDegreeToLongitude(
    tropicalChart.ascendant.sign,
    tropicalChart.ascendant.degree
  );
  const ascendant = calculateSiderealPosition(ascLongitude, ayanamsaValue);

  // Convert Sun first (needed for combustion checks)
  const sunTropicalLong = signDegreeToLongitude(
    tropicalChart.sun.sign,
    tropicalChart.sun.degree
  );
  const sunSiderealLong = tropicalToSidereal(sunTropicalLong, ayanamsaValue);

  // Calculate house for each planet based on whole sign houses from Lagna
  const lagnaSignIndex = Math.floor(ascendant.longitude / 30);

  function getHouse(siderealLongitude: number): number {
    const planetSignIndex = Math.floor(siderealLongitude / 30);
    let house = (planetSignIndex - lagnaSignIndex + 12) % 12 + 1;
    return house;
  }

  // Convert all grahas
  const grahas: Record<GrahaName, GrahaPosition> = {} as Record<GrahaName, GrahaPosition>;

  const planetMappings: Array<{ key: keyof BirthChart; graha: GrahaName }> = [
    { key: 'sun', graha: 'Surya' },
    { key: 'moon', graha: 'Chandra' },
    { key: 'mars', graha: 'Mangala' },
    { key: 'mercury', graha: 'Budha' },
    { key: 'jupiter', graha: 'Guru' },
    { key: 'venus', graha: 'Shukra' },
    { key: 'saturn', graha: 'Shani' },
    { key: 'northNode', graha: 'Rahu' },
    { key: 'southNode', graha: 'Ketu' },
  ];

  for (const { key, graha } of planetMappings) {
    const planet = tropicalChart[key] as { sign: string; degree: number; retrograde?: boolean };
    const tropicalLong = signDegreeToLongitude(planet.sign, planet.degree);

    const position = calculateGrahaPosition(
      graha,
      tropicalLong,
      ayanamsaValue,
      planet.retrograde || (graha === 'Rahu' || graha === 'Ketu'), // Nodes always retrograde
      sunSiderealLong,
      getHouse(tropicalToSidereal(tropicalLong, ayanamsaValue))
    );

    grahas[graha] = position;
  }

  // Convert house cusps to sidereal (using whole sign houses)
  const houses: number[] = [];
  for (let i = 0; i < 12; i++) {
    const signIndex = (lagnaSignIndex + i) % 12;
    houses.push(signIndex * 30);
  }

  return {
    ascendant,
    grahas,
    houses,
    ayanamsa: ayanamsaConfig,
    ayanamsaValue,
  };
}
