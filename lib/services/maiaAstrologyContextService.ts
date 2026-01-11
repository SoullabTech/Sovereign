// @ts-nocheck
/**
 * MAIA Astrology Context Service
 *
 * Provides birth chart and current transit context for MAIA conversations.
 * Enables MAIA to reference astrological patterns naturally in dialogue.
 *
 * Example: If user mentions communication issues with partner and Mercury is retrograde
 * with Chiron in their 7th house, MAIA can reference these dynamics.
 */

import { query } from '@/lib/db/postgres';
import {
  calculateBirthChart,
  calculateTransits,
  type BirthData,
  type BirthChart,
  type PlanetPosition,
} from '@/lib/astrology/ephemerisCalculator';

// ==================== TYPES ====================

export interface MemberBirthData {
  date: string;        // YYYY-MM-DD
  time: string | null; // HH:MM (may be unknown)
  location: {
    lat: number;
    lng: number;
    name: string;
    timezone: string;
  } | null;
}

export interface CurrentTransit {
  planet: string;
  sign: string;
  degree: number;
  retrograde: boolean;
  significantAspects?: string[];
}

export interface TransitHighlight {
  description: string;
  relevance: 'high' | 'medium' | 'low';
  theme: string;
}

export interface AstrologyContext {
  hasBirthData: boolean;
  birthChart: BirthChart | null;
  currentTransits: CurrentTransit[];
  transitHighlights: TransitHighlight[];
  relevantPatterns: string[];
  formattedContext: string;
}

// ==================== TRANSIT SIGNIFICANCE ====================

const RETROGRADE_MEANINGS: Record<string, string> = {
  mercury: 'communication challenges, technology glitches, revisiting past conversations',
  venus: 'relationship reflection, reconsidering values, past lovers may resurface',
  mars: 'action blocks, redirected energy, simmering frustration needing patience',
  jupiter: 'internal growth focus, philosophical reassessment',
  saturn: 'restructuring responsibilities, karma review',
};

const PLANET_HOUSE_THEMES: Record<number, string> = {
  1: 'identity, self-expression, physical body',
  2: 'resources, values, self-worth, money',
  3: 'communication, siblings, local travel, learning',
  4: 'home, family, roots, emotional foundation',
  5: 'creativity, romance, children, joy, play',
  6: 'health, daily routine, service, work',
  7: 'partnerships, marriage, open enemies, projection',
  8: 'transformation, shared resources, intimacy, death/rebirth',
  9: 'higher learning, travel, philosophy, meaning',
  10: 'career, public image, authority, achievement',
  11: 'community, friends, hopes, collective causes',
  12: 'unconscious, spirituality, isolation, hidden patterns',
};

const CHIRON_HOUSE_WOUNDS: Record<number, string> = {
  1: 'wound around identity and being seen',
  2: 'wound around self-worth and resources',
  3: 'wound around communication and being heard',
  4: 'wound around family and belonging',
  5: 'wound around creativity and being valued',
  6: 'wound around health and service',
  7: 'wound around relationships and partnership',
  8: 'wound around intimacy and trust',
  9: 'wound around meaning and truth',
  10: 'wound around achievement and recognition',
  11: 'wound around community and acceptance',
  12: 'wound around spirituality and connection to source',
};

// ==================== MAIN SERVICE ====================

/**
 * Get complete astrology context for a user
 */
export async function getAstrologyContextForUser(memberId: string): Promise<AstrologyContext | null> {
  try {
    // Fetch birth data from members table
    const result = await query(
      `SELECT birth_date, birth_time, birth_location_lat, birth_location_lng,
              birth_location_name, birth_timezone
       FROM members WHERE id = $1`,
      [memberId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const member = result.rows[0];
    const hasBirthData = !!member.birth_date;

    let birthChart: BirthChart | null = null;
    let relevantPatterns: string[] = [];

    // Calculate birth chart if we have the data
    if (hasBirthData && member.birth_location_lat && member.birth_location_lng) {
      try {
        const birthData: BirthData = {
          date: member.birth_date,
          time: member.birth_time || '12:00', // Noon if unknown
          location: {
            lat: parseFloat(member.birth_location_lat),
            lng: parseFloat(member.birth_location_lng),
            timezone: member.birth_timezone || 'America/Los_Angeles',
          },
        };

        birthChart = await calculateBirthChart(birthData);
        relevantPatterns = extractRelevantPatterns(birthChart);
      } catch (chartError) {
        console.warn('[AstrologyContext] Birth chart calculation failed:', chartError);
      }
    }

    // Get current transits (works even without birth data)
    const currentTransits = await getCurrentTransitPositions();
    const transitHighlights = generateTransitHighlights(currentTransits, birthChart);

    // Format the context for MAIA
    const formattedContext = formatAstrologyContextForMAIA(
      birthChart,
      currentTransits,
      transitHighlights,
      relevantPatterns,
      !member.birth_time // Flag if birth time is unknown
    );

    return {
      hasBirthData,
      birthChart,
      currentTransits,
      transitHighlights,
      relevantPatterns,
      formattedContext,
    };
  } catch (error) {
    console.error('[AstrologyContext] Error fetching context:', error);
    return null;
  }
}

/**
 * Get current planetary positions
 */
async function getCurrentTransitPositions(): Promise<CurrentTransit[]> {
  try {
    const transitsMap = await calculateTransits(new Date());
    // Convert from Record<string, PlanetPosition> to CurrentTransit[]
    return Object.entries(transitsMap).map(([planet, pos]) => ({
      planet: planet.charAt(0).toUpperCase() + planet.slice(1), // Capitalize planet name
      sign: pos.sign,
      degree: pos.degree,
      retrograde: pos.retrograde,
    }));
  } catch (error) {
    console.warn('[AstrologyContext] Transit calculation failed, using fallback:', error);
    // Fallback: return basic current sky info
    return getSimplifiedCurrentTransits();
  }
}

/**
 * Simplified transit calculation fallback
 */
function getSimplifiedCurrentTransits(): CurrentTransit[] {
  const now = new Date();
  const month = now.getMonth();
  const day = now.getDate();

  // Approximate Sun position based on date
  const sunSigns = [
    'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini',
    'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn'
  ];

  // Simplified sun sign calculation
  let sunSignIndex = month;
  if (day >= 20) sunSignIndex = (month + 1) % 12;

  return [
    { planet: 'Sun', sign: sunSigns[sunSignIndex], degree: day, retrograde: false },
    // Note: For accurate transits, the full ephemeris calculation should be used
  ];
}

/**
 * Extract psychologically relevant patterns from birth chart
 */
function extractRelevantPatterns(chart: BirthChart): string[] {
  const patterns: string[] = [];

  // Sun-Moon relationship (core identity vs emotional needs)
  if (chart.sun && chart.moon) {
    const sunElement = getElement(chart.sun.sign);
    const moonElement = getElement(chart.moon.sign);
    if (sunElement !== moonElement) {
      patterns.push(`Sun in ${chart.sun.sign} (${sunElement}) and Moon in ${chart.moon.sign} (${moonElement}) suggest a creative tension between identity expression and emotional needs`);
    }
  }

  // Chiron placement (core wound)
  if (chart.chiron) {
    const chironWound = CHIRON_HOUSE_WOUNDS[chart.chiron.house];
    if (chironWound) {
      patterns.push(`Chiron in ${chart.chiron.sign} in the ${chart.chiron.house}th house indicates a ${chironWound}`);
    }
  }

  // Venus placement (relationships, values)
  if (chart.venus) {
    patterns.push(`Venus in ${chart.venus.sign} (House ${chart.venus.house}) colors how they give and receive love, and what they value`);
  }

  // Saturn placement (challenges, structure)
  if (chart.saturn) {
    patterns.push(`Saturn in ${chart.saturn.sign} (House ${chart.saturn.house}) shows where they face growth through challenge and responsibility`);
  }

  return patterns;
}

/**
 * Generate transit highlights relevant to common conversation themes
 */
function generateTransitHighlights(
  transits: CurrentTransit[],
  birthChart: BirthChart | null
): TransitHighlight[] {
  const highlights: TransitHighlight[] = [];

  // Check for Mercury retrograde
  const mercury = transits.find(t => t.planet === 'Mercury');
  if (mercury?.retrograde) {
    highlights.push({
      description: 'Mercury is currently retrograde - a natural time for miscommunications, technology issues, and revisiting past conversations',
      relevance: 'high',
      theme: 'communication',
    });
  }

  // Check for Venus retrograde
  const venus = transits.find(t => t.planet === 'Venus');
  if (venus?.retrograde) {
    highlights.push({
      description: 'Venus retrograde period - relationships and values are being reconsidered, past connections may resurface',
      relevance: 'high',
      theme: 'relationships',
    });
  }

  // Check for Mars retrograde
  const mars = transits.find(t => t.planet === 'Mars');
  if (mars?.retrograde) {
    highlights.push({
      description: 'Mars retrograde - energy may feel blocked or redirected, patience with action is favored',
      relevance: 'medium',
      theme: 'action',
    });
  }

  // If we have birth chart, check for significant transits to natal planets
  if (birthChart) {
    // Check if current Saturn is aspecting natal Sun, Moon, or Saturn
    const saturn = transits.find(t => t.planet === 'Saturn');
    if (saturn) {
      const saturnDegree = getAbsoluteDegree(saturn.sign, saturn.degree);
      const sunDegree = getAbsoluteDegree(birthChart.sun.sign, birthChart.sun.degree);

      if (isWithinOrb(saturnDegree, sunDegree, 5)) {
        highlights.push({
          description: 'Saturn is currently aspecting your natal Sun - a time of maturation, responsibility, and defining who you truly are',
          relevance: 'high',
          theme: 'identity',
        });
      }
    }
  }

  return highlights;
}

/**
 * Format astrology context as a section for MAIA's system prompt
 */
function formatAstrologyContextForMAIA(
  birthChart: BirthChart | null,
  currentTransits: CurrentTransit[],
  transitHighlights: TransitHighlight[],
  relevantPatterns: string[],
  birthTimeUnknown: boolean
): string {
  let context = '\n# Astrological Context (IMPLICIT - use naturally, never lecture)\n\n';

  // Current sky (always available)
  context += '## Current Cosmic Weather\n';

  const retrogradePlanets = currentTransits.filter(t => t.retrograde);
  if (retrogradePlanets.length > 0) {
    context += `**Currently Retrograde:** ${retrogradePlanets.map(p => p.planet).join(', ')}\n`;
  }

  transitHighlights.forEach(h => {
    if (h.relevance === 'high') {
      context += `- ${h.description}\n`;
    }
  });
  context += '\n';

  // Birth chart (if available)
  if (birthChart) {
    context += '## This Person\'s Birth Chart\n';
    if (birthTimeUnknown) {
      context += '*Note: Birth time unknown, house placements are approximate*\n\n';
    }

    context += `**Core Placements:**\n`;
    context += `- Sun: ${birthChart.sun.sign} (House ${birthChart.sun.house}) - Core identity\n`;
    context += `- Moon: ${birthChart.moon.sign} (House ${birthChart.moon.house}) - Emotional nature\n`;
    context += `- Rising: ${birthChart.ascendant.sign} - How they meet the world\n`;
    context += `- Mercury: ${birthChart.mercury.sign} (House ${birthChart.mercury.house}) - Communication style\n`;
    context += `- Venus: ${birthChart.venus.sign} (House ${birthChart.venus.house}) - Love & values\n`;
    context += `- Mars: ${birthChart.mars.sign} (House ${birthChart.mars.house}) - Action & desire\n`;
    context += `- Chiron: ${birthChart.chiron.sign} (House ${birthChart.chiron.house}) - Core wound & healing gift\n\n`;

    if (relevantPatterns.length > 0) {
      context += '**Relevant Patterns:**\n';
      relevantPatterns.forEach(p => {
        context += `- ${p}\n`;
      });
      context += '\n';
    }
  } else {
    context += '*No birth data available for this person - use general cosmic weather only*\n\n';
  }

  context += `## How to Use This (IMPORTANT)
- Reference astrological patterns ONLY when contextually relevant to what they're sharing
- If they mention relationship struggles and have Chiron in 7th house, you might note this pattern
- If Mercury is retrograde and they mention communication issues, you can acknowledge the cosmic timing
- NEVER lecture about astrology or bring it up randomly
- Weave insights naturally: "This is such a Mercury retrograde kind of moment..." or "There's something about having Venus in Scorpio that..."
- If they don't have birth data, stick to general cosmic weather observations only
- Always prioritize their lived experience over astrological interpretations

`;

  return context;
}

// ==================== HELPERS ====================

function getElement(sign: string): string {
  const fireSign = ['Aries', 'Leo', 'Sagittarius'];
  const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
  const airSigns = ['Gemini', 'Libra', 'Aquarius'];
  const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];

  if (fireSign.includes(sign)) return 'fire';
  if (earthSigns.includes(sign)) return 'earth';
  if (airSigns.includes(sign)) return 'air';
  if (waterSigns.includes(sign)) return 'water';
  return 'unknown';
}

function getAbsoluteDegree(sign: string, degree: number): number {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const signIndex = signs.indexOf(sign);
  return signIndex * 30 + degree;
}

function isWithinOrb(degree1: number, degree2: number, orb: number): boolean {
  const diff = Math.abs(degree1 - degree2);
  // Handle wraparound (0° and 359° are close)
  const normalizedDiff = diff > 180 ? 360 - diff : diff;
  return normalizedDiff <= orb;
}

/**
 * Check if a topic in the user's message might be astrologically relevant
 * Used to decide whether to emphasize certain patterns
 */
export function detectAstrologicalRelevance(
  message: string,
  context: AstrologyContext
): string[] {
  const relevantInsights: string[] = [];
  const lowerMessage = message.toLowerCase();

  // Communication themes + Mercury retrograde
  if (
    (lowerMessage.includes('communication') ||
      lowerMessage.includes('misunderstand') ||
      lowerMessage.includes("can't explain") ||
      lowerMessage.includes('technology') ||
      lowerMessage.includes('phone') ||
      lowerMessage.includes('computer')) &&
    context.currentTransits.some(t => t.planet === 'Mercury' && t.retrograde)
  ) {
    relevantInsights.push('Mercury is retrograde, which may be amplifying communication challenges');
  }

  // Relationship themes + Venus patterns
  if (
    (lowerMessage.includes('relationship') ||
      lowerMessage.includes('partner') ||
      lowerMessage.includes('love') ||
      lowerMessage.includes('marriage') ||
      lowerMessage.includes('dating')) &&
    context.birthChart
  ) {
    const venus = context.birthChart.venus;
    if (venus.house === 7) {
      relevantInsights.push(`Their Venus in the 7th house suggests relationships are a central theme of their life's work`);
    }
    if (context.birthChart.chiron?.house === 7) {
      relevantInsights.push(`Chiron in their 7th house indicates a core wound around partnership - this is likely a tender area`);
    }
  }

  // Career/achievement themes + Saturn/10th house
  if (
    (lowerMessage.includes('career') ||
      lowerMessage.includes('work') ||
      lowerMessage.includes('job') ||
      lowerMessage.includes('achievement') ||
      lowerMessage.includes('success')) &&
    context.birthChart
  ) {
    if (context.birthChart.saturn?.house === 10) {
      relevantInsights.push('Saturn in their 10th house suggests career is an area of significant growth through challenge');
    }
  }

  return relevantInsights;
}
