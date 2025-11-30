/**
 * Birth Chart Context Service
 *
 * Loads and formats user's birth chart data for MAIA's conversation context
 * Integrates ephemeris calculations with Spiralogic framework
 */

import { prisma } from '../../../../../lib/db/prisma';

export interface BirthChartContext {
  hasBirthChart: boolean;
  birthData?: {
    date: string;
    time: string;
    location: string;
  };
  planets?: {
    sun: { sign: string; degree: number; house: number };
    moon: { sign: string; degree: number; house: number };
    mercury: { sign: string; degree: number; house: number };
    venus: { sign: string; degree: number; house: number };
    mars: { sign: string; degree: number; house: number };
    jupiter: { sign: string; degree: number; house: number };
    saturn: { sign: string; degree: number; house: number };
    uranus: { sign: string; degree: number; house: number };
    neptune: { sign: string; degree: number; house: number };
    pluto: { sign: string; degree: number; house: number };
  };
  ascendant?: { sign: string; degree: number };
  midheaven?: { sign: string; degree: number };
  majorAspects?: Array<{
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
    exact: boolean;
  }>;
  spiralogicMapping?: {
    emphasis: string[];
    dominantElements: string[];
  };
}

/**
 * Fetch birth chart for a user and format it for MAIA's context
 */
export async function getBirthChartContext(userId: string): Promise<BirthChartContext> {
  try {
    const birthChart = await prisma.birthChart.findUnique({
      where: { userId },
    });

    if (!birthChart) {
      return { hasBirthChart: false };
    }

    // Parse JSON fields
    const planets = birthChart.planets as any;
    const ascendant = birthChart.ascendant as any;
    const midheaven = birthChart.midheaven as any;
    const aspects = birthChart.aspects as any[];

    // Filter for major aspects (exact or tight orb)
    const majorAspects = aspects
      .filter(aspect => aspect.orb < 3 || aspect.exact)
      .map(aspect => ({
        planet1: aspect.planet1,
        planet2: aspect.planet2,
        type: aspect.type,
        orb: aspect.orb,
        exact: aspect.exact || false,
      }));

    // Calculate Spiralogic mapping
    const spiralogicMapping = calculateSpiralogicMapping(planets, birthChart.houseCusps);

    return {
      hasBirthChart: true,
      birthData: {
        date: birthChart.birthDate,
        time: birthChart.birthTime,
        location: birthChart.locationName,
      },
      planets: {
        sun: planets.sun,
        moon: planets.moon,
        mercury: planets.mercury,
        venus: planets.venus,
        mars: planets.mars,
        jupiter: planets.jupiter,
        saturn: planets.saturn,
        uranus: planets.uranus,
        neptune: planets.neptune,
        pluto: planets.pluto,
      },
      ascendant,
      midheaven,
      majorAspects,
      spiralogicMapping,
    };
  } catch (error) {
    console.error('Error fetching birth chart context:', error);
    return { hasBirthChart: false };
  }
}

/**
 * Calculate which Spiralogic Focus States are emphasized by natal chart
 * Maps houses to Focus States and identifies dominant elements
 */
function calculateSpiralogicMapping(planets: any, houseCusps: number[]): {
  emphasis: string[];
  dominantElements: string[];
} {
  // Map houses to Spiralogic Focus States (from previous work)
  const houseFocusStates = [
    'I-Am-Presence',           // House 1 (Aries)
    'Resource-Anchoring',      // House 2 (Taurus)
    'Expression-Weaving',      // House 3 (Gemini)
    'Soul-Nesting',            // House 4 (Cancer)
    'Creative-Fire',           // House 5 (Leo)
    'Sacred-Service',          // House 6 (Virgo)
    'Relational-Field',        // House 7 (Libra)
    'Shadow-Diving',           // House 8 (Scorpio)
    'Vision-Questing',         // House 9 (Sagittarius)
    'Legacy-Building',         // House 10 (Capricorn)
    'Collective-Weaving',      // House 11 (Aquarius)
    'Soul-Dissolving'          // House 12 (Pisces)
  ];

  // Count planetary emphasis by house
  const houseCounts: Record<number, number> = {};
  const allPlanets = [
    planets.sun,
    planets.moon,
    planets.mercury,
    planets.venus,
    planets.mars,
    planets.jupiter,
    planets.saturn,
    planets.uranus,
    planets.neptune,
    planets.pluto,
  ];

  allPlanets.forEach(planet => {
    const house = planet.house;
    houseCounts[house] = (houseCounts[house] || 0) + 1;
  });

  // Find emphasized Focus States (houses with 2+ planets)
  const emphasis: string[] = [];
  Object.entries(houseCounts).forEach(([house, count]) => {
    if (count >= 2) {
      const houseIndex = parseInt(house) - 1;
      emphasis.push(houseFocusStates[houseIndex]);
    }
  });

  // Calculate dominant elements from signs
  const elementCounts: Record<string, number> = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0,
  };

  const fireSign = ['Aries', 'Leo', 'Sagittarius'];
  const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
  const airSigns = ['Gemini', 'Libra', 'Aquarius'];
  const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];

  allPlanets.forEach(planet => {
    if (fireSign.includes(planet.sign)) elementCounts.Fire++;
    else if (earthSigns.includes(planet.sign)) elementCounts.Earth++;
    else if (airSigns.includes(planet.sign)) elementCounts.Air++;
    else if (waterSigns.includes(planet.sign)) elementCounts.Water++;
  });

  // Find dominant elements (> 3 planets)
  const dominantElements = Object.entries(elementCounts)
    .filter(([_, count]) => count > 3)
    .map(([element]) => element);

  return {
    emphasis: emphasis.length > 0 ? emphasis : ['Balanced across houses'],
    dominantElements: dominantElements.length > 0 ? dominantElements : ['Balanced elements'],
  };
}

/**
 * Format birth chart context for MAIA's system prompt
 */
export function formatBirthChartForPrompt(context: BirthChartContext): string {
  if (!context.hasBirthChart) {
    return '';
  }

  const parts: string[] = [];

  parts.push(`## User's Birth Chart (Time Passages-level precision)`);
  parts.push(`Birth: ${context.birthData?.date} at ${context.birthData?.time}, ${context.birthData?.location}`);
  parts.push('');

  // Core placements
  parts.push(`**Core Identity:**`);
  parts.push(`- Sun in ${context.planets?.sun.sign} ${context.planets?.sun.degree.toFixed(1)}° (House ${context.planets?.sun.house})`);
  parts.push(`- Moon in ${context.planets?.moon.sign} ${context.planets?.moon.degree.toFixed(1)}° (House ${context.planets?.moon.house})`);
  parts.push(`- Ascendant in ${context.ascendant?.sign} ${context.ascendant?.degree.toFixed(1)}°`);
  parts.push('');

  // Personal planets
  parts.push(`**Personal Expression:**`);
  parts.push(`- Mercury in ${context.planets?.mercury.sign} (House ${context.planets?.mercury.house}) - Mind/Communication`);
  parts.push(`- Venus in ${context.planets?.venus.sign} (House ${context.planets?.venus.house}) - Values/Love`);
  parts.push(`- Mars in ${context.planets?.mars.sign} (House ${context.planets?.mars.house}) - Action/Drive`);
  parts.push('');

  // Outer planets
  parts.push(`**Generational Wisdom:**`);
  parts.push(`- Jupiter in ${context.planets?.jupiter.sign} (House ${context.planets?.jupiter.house})`);
  parts.push(`- Saturn in ${context.planets?.saturn.sign} (House ${context.planets?.saturn.house})`);
  parts.push('');

  // Major aspects
  if (context.majorAspects && context.majorAspects.length > 0) {
    parts.push(`**Major Aspects:**`);
    context.majorAspects.slice(0, 5).forEach(aspect => {
      const exactMarker = aspect.exact ? ' ⚡EXACT' : '';
      parts.push(`- ${aspect.planet1} ${aspect.type} ${aspect.planet2} (${aspect.orb.toFixed(1)}°)${exactMarker}`);
    });
    parts.push('');
  }

  // Spiralogic mapping
  if (context.spiralogicMapping) {
    parts.push(`**Spiralogic Mapping:**`);
    parts.push(`- Emphasized Focus States: ${context.spiralogicMapping.emphasis.join(', ')}`);
    parts.push(`- Dominant Elements: ${context.spiralogicMapping.dominantElements.join(', ')}`);
    parts.push('');
  }

  parts.push(`*Use this birth chart context to:*`);
  parts.push(`- Understand the user's archetypal patterns (Greene, Tarnas, Hillman)`);
  parts.push(`- Reference specific placements when relevant to conversation`);
  parts.push(`- Connect astrological insights to Spiralogic developmental framework`);
  parts.push(`- Translate technical astrology to everyday language`);

  return parts.join('\n');
}
