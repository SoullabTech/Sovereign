/**
 * Birth Chart Context Service
 *
 * Provides birth chart data as subtle context for MAIA.
 * No constraints, no protocols - just information available if relevant.
 *
 * Storage (canonical):
 *   - members.birth_*               birth data inputs
 *   - members.natal_chart_json      computed chart (BirthChart shape from
 *                                   lib/astrology/ephemerisCalculator.ts)
 *   - members.natal_chart_computed_at  staleness timestamp
 *
 * Includes access to the complete Spiralogic Archetypal Library:
 * - Mythological correlations
 * - Jungian archetypes
 * - Developmental psychology (Erikson, Maslow, etc.)
 * - Cultural heroes and figures
 * - Hero's Journey stages
 */

import { query } from '@/lib/db/postgres';
import { getZodiacArchetype, generateArchetypalDescription } from '@/lib/astrology/archetypeLibrary';
import { getSpiralogicFacet } from '@/lib/astrology/spiralogicMapping';
import { synthesizeAspect, findRelevantAspect, extractAspectsFromChart, type AspectType } from '@/lib/astrology/aspectSynthesis';

export interface BirthChartContext {
  hasChart: boolean;
  sun?: string;
  moon?: string;
  rising?: string;
  elementalBalance?: {
    fire: number;
    water: number;
    earth: number;
    air: number;
  };
  significantPlacements?: string[];
  spiralogicPhases?: {
    fire: string[];
    water: string[];
    earth: string[];
    air: string[];
  };
}

/**
 * Fetch RAW birth chart data (for aspect synthesis).
 * Returns the full chart object — or null if no chart available.
 *
 * Reads members.natal_chart_json. Returns null gracefully when:
 *   - member doesn't exist
 *   - chart hasn't been computed yet (natal_chart_json IS NULL)
 *   - userId isn't a valid UUID format
 */
export async function getRawBirthChartData(userId: string): Promise<any | null> {
  if (!userId) return null;

  try {
    const result = await query<{ natal_chart_json: any }>(
      `SELECT natal_chart_json
         FROM members
        WHERE id = $1::uuid
          AND natal_chart_json IS NOT NULL`,
      [userId]
    );

    if (result.rows.length === 0) return null;
    return result.rows[0].natal_chart_json;
  } catch {
    // Invalid UUID cast or other query error → no chart context, continue gracefully
    return null;
  }
}

/**
 * Fetch birth chart context for MAIA (simplified, MAIA-facing shape).
 * Returns null if no chart available — MAIA continues without it.
 */
export async function getBirthChartContext(userId: string): Promise<BirthChartContext | null> {
  const chartData = await getRawBirthChartData(userId);
  if (!chartData) return null;

  return {
    hasChart: true,
    sun: chartData.sun ? `${chartData.sun.sign} ${chartData.sun.degree}° (House ${chartData.sun.house})` : undefined,
    moon: chartData.moon ? `${chartData.moon.sign} ${chartData.moon.degree}° (House ${chartData.moon.house})` : undefined,
    rising: chartData.ascendant ? `${chartData.ascendant.sign} ${chartData.ascendant.degree}°` : undefined,
    elementalBalance: chartData.elementalBalance,
    significantPlacements: extractSignificantPlacements(chartData),
    spiralogicPhases: extractSpiralogicPhases(chartData),
  };
}

/**
 * Extract significant planetary placements in readable format.
 */
function extractSignificantPlacements(chartData: any): string[] {
  const placements: string[] = [];
  const planets = ['mercury', 'venus', 'mars', 'jupiter', 'saturn'];

  for (const planet of planets) {
    if (chartData[planet]) {
      const p = chartData[planet];
      placements.push(`${planet.charAt(0).toUpperCase() + planet.slice(1)} in ${p.sign} (House ${p.house})`);
    }
  }

  return placements;
}

/**
 * Extract Spiralogic phase mappings (if present on the chart).
 */
function extractSpiralogicPhases(chartData: any): BirthChartContext['spiralogicPhases'] | undefined {
  if (!chartData.spiralogicPhases) return undefined;

  const phases = { fire: [], water: [], earth: [], air: [] } as {
    fire: string[]; water: string[]; earth: string[]; air: string[];
  };

  Object.entries(chartData.spiralogicPhases).forEach(([phase, planets]: [string, any]) => {
    if (Array.isArray(planets) && phase in phases) {
      (phases as any)[phase] = planets.map((p: any) => `${p.planet} in ${p.sign}`);
    }
  });

  return phases;
}

/**
 * Format birth chart context as a gentle whisper for MAIA.
 * This is added to her context, not her instructions.
 *
 * Includes archetypal correlations from the Spiralogic Library.
 */
export function formatChartContextForMAIA(chart: BirthChartContext | null): string {
  if (!chart || !chart.hasChart) {
    return ''; // No chart = no context. MAIA continues beautifully without it.
  }

  let context = '\n\n---\n\n';
  context += 'AVAILABLE CONTEXT (Birth Chart + Archetypal Correlations):\n\n';

  if (chart.sun) {
    context += `Sun: ${chart.sun}\n`;
    const sunSign = extractSignFromPlacement(chart.sun);
    const sunArchetype = getZodiacArchetype(sunSign);
    if (sunArchetype) {
      context += `  → Archetypes: ${sunArchetype.archetypes.jungian?.slice(0, 2).join(', ') || 'N/A'}\n`;
      context += `  → Mythological: ${sunArchetype.archetypes.mythological?.slice(0, 2).join(', ') || 'N/A'}\n`;
    }
  }

  if (chart.moon) {
    context += `\nMoon: ${chart.moon}\n`;
    const moonSign = extractSignFromPlacement(chart.moon);
    const moonArchetype = getZodiacArchetype(moonSign);
    if (moonArchetype) {
      context += `  → Archetypes: ${moonArchetype.archetypes.jungian?.slice(0, 2).join(', ') || 'N/A'}\n`;
    }
  }

  if (chart.rising) {
    context += `\nRising: ${chart.rising}\n`;
  }

  if (chart.elementalBalance) {
    context += `\nElemental Balance: Fire ${chart.elementalBalance.fire}%, Water ${chart.elementalBalance.water}%, Earth ${chart.elementalBalance.earth}%, Air ${chart.elementalBalance.air}%\n`;
  }

  if (chart.significantPlacements && chart.significantPlacements.length > 0) {
    context += `\nOther Placements:\n${chart.significantPlacements.map(p => `- ${p}`).join('\n')}\n`;
  }

  context += '\nArchetypal wisdom available from: Mythology, Jung, Erikson, Maslow, Hero\'s Journey, Cultural Heroes\n';
  context += 'Use naturally when relevant - no need to lecture about systems.\n';
  context += '\n---\n';

  return context;
}

/**
 * Helper: Extract sign name from placement string.
 * e.g., "Sagittarius 17° (House 4)" -> "Sagittarius"
 */
function extractSignFromPlacement(placement: string): string {
  const match = placement.match(/^([A-Za-z]+)/);
  return match ? match[1] : '';
}

/**
 * Get archetypal synthesis for a specific aspect (ON-DEMAND ONLY).
 * Called when user asks about a specific aspect in their chart.
 * Returns poetic 2-4 sentence interpretation, not textbook description.
 */
export function synthesizeAspectForMAIA(
  userQuery: string,
  chartData: any
): string | null {
  try {
    if (!chartData || !userQuery) return null;

    const aspects = extractAspectsFromChart(chartData);
    if (aspects.length === 0) return null;

    const relevantAspect = findRelevantAspect(userQuery, aspects);
    if (!relevantAspect) return null;

    const synthesis = synthesizeAspect(
      relevantAspect.planet1,
      relevantAspect.planet2,
      relevantAspect.aspectType
    );

    if (!synthesis) return null;

    return `\n\nARCHETYPAL INSIGHT:\n${synthesis.essence}\n\nCore Question: ${synthesis.coreQuestion}${synthesis.elementalDynamic ? `\n(${synthesis.elementalDynamic})` : ''}`;
  } catch {
    return null;
  }
}
