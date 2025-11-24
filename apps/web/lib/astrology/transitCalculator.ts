/**
 * TRANSIT CALCULATOR - Archetypal Weather System
 *
 * Calculates current planetary positions and their aspects to natal chart
 * Uses weather metaphor instead of traditional astrological language
 *
 * Philosophy:
 * - Transits are WEATHER affecting the journey, not fate
 * - As-if epistemology: these are archetypal terrains, not prescriptions
 * - Weather serves the soul's process, doesn't determine it
 */

import * as Astronomy from 'astronomy-engine';
import { BirthChart, PlanetPosition } from './ephemerisCalculator';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type WeatherType =
  | 'tailwind'        // Trine, sextile - supportive flow
  | 'headwind'        // Opposition - resistance requiring integration
  | 'crosswind'       // Square - perpendicular force requiring adjustment
  | 'storm'           // Pluto, Saturn hard aspects - intense transformation
  | 'clearing'        // Jupiter, Venus harmonics - opening, expansion
  | 'fog'             // Neptune aspects - dissolution, uncertainty
  | 'lightning'       // Uranus aspects - sudden awakening, disruption
  | 'pressure-system' // Saturn aspects - compression, testing
  | 'heat-wave'       // Mars aspects - intensity, urgency
  | 'cold-front';     // Saturn, Pluto - slowing, deepening

export type AspectType = 'conjunction' | 'opposition' | 'square' | 'trine' | 'sextile' | 'quincunx';

export type PlanetName = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' |
                         'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto';

export interface TransitPositions {
  date: Date;
  sun: number;
  moon: number;
  mercury: number;
  venus: number;
  mars: number;
  jupiter: number;
  saturn: number;
  uranus: number;
  neptune: number;
  pluto: number;
}

export interface AspectPattern {
  // The astronomical aspect
  transitPlanet: PlanetName;
  transitLongitude: number;
  natalPlanet: PlanetName;
  natalLongitude: number;
  natalHouse: number;

  // Aspect details
  aspectType: AspectType;
  orb: number; // How many degrees off exact
  applying: boolean; // Getting closer (true) or separating (false)
  exactDate: Date; // When aspect becomes exact

  // Timeline
  activeFrom: Date; // When aspect enters orb
  activeTo: Date; // When aspect leaves orb
}

export interface WeatherCondition {
  // The aspect pattern
  aspect: AspectPattern;

  // Weather metaphor
  weatherType: WeatherType;
  intensity: 'light' | 'moderate' | 'intense' | 'extreme';

  // Archetypal terrain (as-if, not interpretation)
  archetypalTerrain: {
    transitPrinciple: string; // e.g., "Awakening/freedom (Uranus)"
    natalPrinciple: string; // e.g., "Emotional foundation (Moon)"
    dynamic: string; // e.g., "Polar tension requiring integration"
    phenomenology: string[]; // How souls report experiencing this
    culturalForms: string[]; // Different cultural/metaphorical expressions
    questions: string[]; // Invitations for exploration
  };

  // Process impact (how it affects spiral phases)
  processImpact: {
    impactType: 'accelerant' | 'inhibitor' | 'redirector' | 'amplifier' | 'dissolver' | 'stabilizer';
    description: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSIT CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate current planetary positions (transits)
 */
export async function calculateCurrentTransits(date: Date = new Date()): Promise<TransitPositions> {
  const time = Astronomy.MakeTime(date);

  // Calculate geocentric positions for all planets
  const sunVec = Astronomy.GeoVector(Astronomy.Body.Sun, time, true);
  const moonVec = Astronomy.GeoVector(Astronomy.Body.Moon, time, true);
  const mercuryVec = Astronomy.GeoVector(Astronomy.Body.Mercury, time, true);
  const venusVec = Astronomy.GeoVector(Astronomy.Body.Venus, time, true);
  const marsVec = Astronomy.GeoVector(Astronomy.Body.Mars, time, true);
  const jupiterVec = Astronomy.GeoVector(Astronomy.Body.Jupiter, time, true);
  const saturnVec = Astronomy.GeoVector(Astronomy.Body.Saturn, time, true);
  const uranusVec = Astronomy.GeoVector(Astronomy.Body.Uranus, time, true);
  const neptuneVec = Astronomy.GeoVector(Astronomy.Body.Neptune, time, true);
  const plutoVec = Astronomy.GeoVector(Astronomy.Body.Pluto, time, true);

  // Convert to ecliptic longitude
  const sunEcl = Astronomy.Ecliptic(sunVec);
  const moonEcl = Astronomy.Ecliptic(moonVec);
  const mercuryEcl = Astronomy.Ecliptic(mercuryVec);
  const venusEcl = Astronomy.Ecliptic(venusVec);
  const marsEcl = Astronomy.Ecliptic(marsVec);
  const jupiterEcl = Astronomy.Ecliptic(jupiterVec);
  const saturnEcl = Astronomy.Ecliptic(saturnVec);
  const uranusEcl = Astronomy.Ecliptic(uranusVec);
  const neptuneEcl = Astronomy.Ecliptic(neptuneVec);
  const plutoEcl = Astronomy.Ecliptic(plutoVec);

  return {
    date,
    sun: sunEcl.elon,
    moon: moonEcl.elon,
    mercury: mercuryEcl.elon,
    venus: venusEcl.elon,
    mars: marsEcl.elon,
    jupiter: jupiterEcl.elon,
    saturn: saturnEcl.elon,
    uranus: uranusEcl.elon,
    neptune: neptuneEcl.elon,
    pluto: plutoEcl.elon,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ASPECT DETECTION
// ═══════════════════════════════════════════════════════════════════════════

const ASPECT_DEFINITIONS = [
  { type: 'conjunction' as AspectType, angle: 0, orb: 8 },
  { type: 'opposition' as AspectType, angle: 180, orb: 8 },
  { type: 'trine' as AspectType, angle: 120, orb: 8 },
  { type: 'square' as AspectType, angle: 90, orb: 8 },
  { type: 'sextile' as AspectType, angle: 60, orb: 6 },
  { type: 'quincunx' as AspectType, angle: 150, orb: 3 },
];

/**
 * Find all aspects between current transits and natal chart
 */
export function findTransitAspects(
  transits: TransitPositions,
  birthChart: BirthChart
): AspectPattern[] {
  const aspects: AspectPattern[] = [];

  // Planets to check in natal chart
  const natalPlanets: [PlanetName, PlanetPosition][] = [
    ['Sun', birthChart.sun],
    ['Moon', birthChart.moon],
    ['Mercury', birthChart.mercury],
    ['Venus', birthChart.venus],
    ['Mars', birthChart.mars],
    ['Jupiter', birthChart.jupiter],
    ['Saturn', birthChart.saturn],
    ['Uranus', birthChart.uranus],
    ['Neptune', birthChart.neptune],
    ['Pluto', birthChart.pluto],
  ];

  // Planets to check in transits
  const transitPlanets: [PlanetName, number][] = [
    ['Sun', transits.sun],
    ['Moon', transits.moon],
    ['Mercury', transits.mercury],
    ['Venus', transits.venus],
    ['Mars', transits.mars],
    ['Jupiter', transits.jupiter],
    ['Saturn', transits.saturn],
    ['Uranus', transits.uranus],
    ['Neptune', transits.neptune],
    ['Pluto', transits.pluto],
  ];

  // Check each transit planet against each natal planet
  for (const [transitName, transitLon] of transitPlanets) {
    for (const [natalName, natalData] of natalPlanets) {
      // Get natal longitude (sign index * 30 + degree)
      const signIndex = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
                        .indexOf(natalData.sign);
      const natalLon = (signIndex * 30) + natalData.degree;

      // Calculate separation
      let separation = Math.abs(transitLon - natalLon);
      if (separation > 180) separation = 360 - separation;

      // Check each aspect type
      for (const aspectDef of ASPECT_DEFINITIONS) {
        const orbDiff = Math.abs(separation - aspectDef.angle);

        if (orbDiff <= aspectDef.orb) {
          // Calculate exact date (simplified - would need velocity for precision)
          const exactDate = new Date(transits.date);

          aspects.push({
            transitPlanet: transitName,
            transitLongitude: transitLon,
            natalPlanet: natalName,
            natalLongitude: natalLon,
            natalHouse: natalData.house,
            aspectType: aspectDef.type,
            orb: orbDiff,
            applying: true, // TODO: Calculate based on planetary velocities
            exactDate,
            activeFrom: new Date(transits.date.getTime() - (aspectDef.orb * 24 * 60 * 60 * 1000)),
            activeTo: new Date(transits.date.getTime() + (aspectDef.orb * 24 * 60 * 60 * 1000)),
          });
        }
      }
    }
  }

  return aspects;
}

// ═══════════════════════════════════════════════════════════════════════════
// WEATHER CLASSIFICATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Determine weather type based on aspect and planets involved
 */
function determineWeatherType(aspect: AspectPattern): WeatherType {
  const { transitPlanet, aspectType } = aspect;

  // Uranus always brings lightning (awakening/disruption)
  if (transitPlanet === 'Uranus') return 'lightning';

  // Neptune brings fog (dissolution/uncertainty)
  if (transitPlanet === 'Neptune') return 'fog';

  // Pluto + hard aspect = storm (intense transformation)
  if (transitPlanet === 'Pluto' && (aspectType === 'square' || aspectType === 'opposition')) {
    return 'storm';
  }

  // Saturn = pressure system (testing/compression)
  if (transitPlanet === 'Saturn') {
    return aspectType === 'square' || aspectType === 'opposition'
      ? 'pressure-system'
      : 'cold-front';
  }

  // Mars = heat wave (intensity/urgency)
  if (transitPlanet === 'Mars' && (aspectType === 'square' || aspectType === 'opposition')) {
    return 'heat-wave';
  }

  // Harmonious aspects (trine, sextile)
  if (aspectType === 'trine' || aspectType === 'sextile') {
    return transitPlanet === 'Jupiter' || transitPlanet === 'Venus'
      ? 'clearing'
      : 'tailwind';
  }

  // Challenging aspects
  if (aspectType === 'opposition') return 'headwind';
  if (aspectType === 'square') return 'crosswind';

  return 'tailwind'; // Default
}

/**
 * Calculate intensity based on orb tightness and planetary strength
 */
function calculateIntensity(aspect: AspectPattern): 'light' | 'moderate' | 'intense' | 'extreme' {
  const { orb, transitPlanet, aspectType } = aspect;

  // Outer planets (slower) = more intense
  const outerPlanets: PlanetName[] = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const isOuter = outerPlanets.includes(transitPlanet);

  // Hard aspects = more intense
  const isHard = aspectType === 'square' || aspectType === 'opposition';

  // Very tight orb (< 1°) = extreme
  if (orb < 1 && isOuter && isHard) return 'extreme';
  if (orb < 1 && isOuter) return 'intense';
  if (orb < 1) return 'moderate';

  // Tight orb (< 3°)
  if (orb < 3 && isOuter && isHard) return 'intense';
  if (orb < 3 && isOuter) return 'moderate';
  if (orb < 3) return 'light';

  // Medium orb (< 5°)
  if (orb < 5 && isOuter) return 'moderate';

  return 'light';
}

/**
 * Convert aspect patterns to weather conditions with archetypal terrain
 */
export async function calculateArchetypalWeather(
  birthChart: BirthChart,
  date: Date = new Date()
): Promise<WeatherCondition[]> {
  // Calculate current transits
  const transits = await calculateCurrentTransits(date);

  // Find all aspects
  const aspects = findTransitAspects(transits, birthChart);

  // Convert to weather conditions
  const weatherConditions = aspects.map(aspect => {
    const weatherType = determineWeatherType(aspect);
    const intensity = calculateIntensity(aspect);
    const archetypalTerrain = getArchetypalTerrain(aspect);
    const processImpact = getProcessImpact(weatherType, aspect);

    return {
      aspect,
      weatherType,
      intensity,
      archetypalTerrain,
      processImpact,
    };
  });

  // Filter to significant conditions (not too weak)
  return weatherConditions.filter(w => w.intensity !== 'light');
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCHETYPAL TERRAIN (As-If Descriptions)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get archetypal terrain for an aspect
 * Uses as-if language, not interpretive prescription
 */
function getArchetypalTerrain(aspect: AspectPattern) {
  // This will grow over time - starting with key patterns
  const { transitPlanet, natalPlanet, aspectType } = aspect;

  // Get principles for each planet
  const transitPrinciple = getPlanetPrinciple(transitPlanet);
  const natalPrinciple = getPlanetPrinciple(natalPlanet);
  const dynamic = getAspectDynamic(aspectType);

  return {
    transitPrinciple,
    natalPrinciple,
    dynamic,
    phenomenology: getPhenomenology(transitPlanet, natalPlanet, aspectType),
    culturalForms: getCulturalForms(transitPlanet),
    questions: getQuestions(transitPlanet, natalPlanet, aspectType),
  };
}

function getPlanetPrinciple(planet: PlanetName): string {
  const principles: Record<PlanetName, string> = {
    Sun: 'Identity/vitality/purpose',
    Moon: 'Emotional foundation/nurture/safety',
    Mercury: 'Communication/intelligence/connection',
    Venus: 'Love/value/beauty/harmony',
    Mars: 'Will/assertion/desire/action',
    Jupiter: 'Expansion/abundance/meaning/growth',
    Saturn: 'Structure/limitation/time/testing',
    Uranus: 'Awakening/freedom/rebellion/innovation',
    Neptune: 'Dissolution/transcendence/spirituality/mystery',
    Pluto: 'Death-rebirth/transformation/power/evolution',
  };
  return principles[planet];
}

function getAspectDynamic(aspectType: AspectType): string {
  const dynamics: Record<AspectType, string> = {
    conjunction: 'Fused energy - merging of principles',
    opposition: 'Polar tension - integration of opposites',
    square: 'Creative friction - growth through challenge',
    trine: 'Harmonious flow - effortless expression',
    sextile: 'Supportive opportunity - available pathways',
    quincunx: 'Adjustment required - bridging incongruent energies',
  };
  return dynamics[aspectType];
}

function getPhenomenology(transit: PlanetName, natal: PlanetName, aspect: AspectType): string[] {
  // Simplified - will expand based on observed patterns
  return [
    'This is how some souls report experiencing this pattern',
    'Not prescription, but possibilities',
    'Your experience may be entirely different',
  ];
}

function getCulturalForms(planet: PlanetName): string[] {
  // Will expand with multiple cultural perspectives
  return ['Greek/Roman mythology', 'Vedic tradition', 'Modern metaphor', 'Nature imagery'];
}

function getQuestions(transit: PlanetName, natal: PlanetName, aspect: AspectType): string[] {
  // Invitations for exploration, not answers
  return [
    'What is this pattern inviting you to see?',
    'How does this show up in your actual experience?',
    'What wants to shift or emerge?',
  ];
}

function getProcessImpact(weatherType: WeatherType, aspect: AspectPattern) {
  const impactTypes: Record<WeatherType, 'accelerant' | 'inhibitor' | 'redirector' | 'amplifier' | 'dissolver' | 'stabilizer'> = {
    tailwind: 'accelerant',
    clearing: 'accelerant',
    headwind: 'inhibitor',
    crosswind: 'redirector',
    storm: 'amplifier',
    lightning: 'redirector',
    fog: 'dissolver',
    'pressure-system': 'inhibitor',
    'heat-wave': 'amplifier',
    'cold-front': 'stabilizer',
  };

  return {
    impactType: impactTypes[weatherType],
    description: `This weather pattern acts as ${impactTypes[weatherType]} for your process`,
  };
}
