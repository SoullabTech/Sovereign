/**
 * Birth Chart Context Service
 *
 * Provides birth chart data as subtle context for MAIA.
 * No constraints, no protocols - just information available if relevant.
 *
 * Includes access to the complete Spiralogic Archetypal Library:
 * - Mythological correlations
 * - Jungian archetypes
 * - Developmental psychology (Erikson, Maslow, etc.)
 * - Cultural heroes and figures
 * - Hero's Journey stages
 */

import { createClient } from '@supabase/supabase-js';
import { getZodiacArchetype, generateArchetypalDescription } from '@/lib/astrology/archetypeLibrary';
import { getSpiralogicFacet } from '@/lib/astrology/spiralogicMapping';
import { synthesizeAspect, findRelevantAspect, extractAspectsFromChart, type AspectType } from '@/lib/astrology/aspectSynthesis';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
 * HARDCODED BIRTH CHARTS
 * For users whose IDs don't match database UUID format
 * TODO: Remove this once proper user authentication is implemented
 */
const HARDCODED_CHARTS: Record<string, any> = {
  'user_1760278086001': {
    // Kelly Nezat's Chart - Dec 9, 1966, 10:29 PM CST, Baton Rouge, LA
    sun: { sign: 'Sagittarius', degree: 17.23, house: 4, element: 'fire' },
    moon: { sign: 'Pisces', degree: 23.45, house: 7, element: 'water' },
    ascendant: { sign: 'Leo', degree: 28.12, element: 'fire' },
    mercury: { sign: 'Sagittarius', degree: 9.34, house: 4, element: 'fire' },
    venus: { sign: 'Capricorn', degree: 2.56, house: 5, element: 'earth' },
    mars: { sign: 'Libra', degree: 19.87, house: 2, element: 'air' },
    jupiter: { sign: 'Cancer', degree: 26.43, house: 11, element: 'water' },
    saturn: { sign: 'Pisces', degree: 23.12, house: 7, element: 'water' },
    uranus: { sign: 'Virgo', degree: 23.67, house: 1, element: 'earth' },
    neptune: { sign: 'Scorpio', degree: 22.89, house: 3, element: 'water' },
    pluto: { sign: 'Virgo', degree: 20.45, house: 1, element: 'earth' },
    elementalBalance: { fire: 30, water: 35, earth: 25, air: 10 },
    aspects: [
      { planet1: 'sun', planet2: 'saturn', type: 'square', orb: 5.89, applying: false },
      { planet1: 'moon', planet2: 'saturn', type: 'conjunction', orb: 0.33, applying: true },
      { planet1: 'sun', planet2: 'jupiter', type: 'quincunx', orb: 9.2, applying: false },
      { planet1: 'moon', planet2: 'neptune', type: 'trine', orb: 0.56, applying: true },
      { planet1: 'venus', planet2: 'mars', type: 'square', orb: 7.31, applying: false },
      { planet1: 'uranus', planet2: 'pluto', type: 'conjunction', orb: 3.22, applying: true },
      { planet1: 'sun', planet2: 'uranus', type: 'square', orb: 6.44, applying: false }
    ]
  }
};

/**
 * Fetch RAW birth chart data (for aspect synthesis)
 * Returns the full chart object with aspects, planets, etc.
 */
export async function getRawBirthChartData(userId: string): Promise<any | null> {
  try {
    console.log('📊 [getRawBirthChartData] Fetching chart for user:', userId);

    // Check hardcoded charts first (for non-UUID userIds)
    if (HARDCODED_CHARTS[userId]) {
      console.log('   ✅ Found HARDCODED chart for user:', userId);
      return HARDCODED_CHARTS[userId];
    }

    // ⚡ PERFORMANCE: Skip database query for invalid UUID formats
    // This prevents wasted time querying with user_1761386267477 style IDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.log('   ⏭️  Skipping DB query - userId is not a valid UUID format');
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: profile, error } = await supabase
      .from('oracle_user_profiles')
      .select('birth_chart_data, birth_chart_calculated')
      .eq('user_id', userId)
      .single();

    console.log('   Query result:', {
      hasData: !!profile,
      hasError: !!error,
      errorMsg: error?.message,
      hasChartData: !!profile?.birth_chart_data,
      isCalculated: profile?.birth_chart_calculated
    });

    if (error) {
      console.log('   ❌ Supabase error:', error);
      return null;
    }

    if (!profile?.birth_chart_calculated) {
      console.log('   ⚠️ Chart not calculated for this user');
      return null;
    }

    if (!profile?.birth_chart_data) {
      console.log('   ⚠️ birth_chart_data is null/undefined');
      return null;
    }

    console.log('   ✅ Found chart data:', Object.keys(profile.birth_chart_data));
    return profile.birth_chart_data;
  } catch (error) {
    console.error('   ❌ Exception in getRawBirthChartData:', error);
    return null;
  }
}

/**
 * Fetch birth chart data for a user (if it exists)
 * Returns null if no chart available - MAIA continues without it
 */
export async function getBirthChartContext(userId: string): Promise<BirthChartContext | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if user has birth chart data
    const { data: profile, error } = await supabase
      .from('oracle_user_profiles')
      .select('birth_chart_data, birth_chart_calculated')
      .eq('user_id', userId)
      .single();

    if (error || !profile?.birth_chart_calculated || !profile?.birth_chart_data) {
      return null; // No chart available - that's fine!
    }

    const chartData = profile.birth_chart_data;

    // Extract the essentials in simple language
    return {
      hasChart: true,
      sun: chartData.sun ? `${chartData.sun.sign} ${chartData.sun.degree}° (House ${chartData.sun.house})` : undefined,
      moon: chartData.moon ? `${chartData.moon.sign} ${chartData.moon.degree}° (House ${chartData.moon.house})` : undefined,
      rising: chartData.ascendant ? `${chartData.ascendant.sign} ${chartData.ascendant.degree}°` : undefined,
      elementalBalance: chartData.elementalBalance,
      significantPlacements: extractSignificantPlacements(chartData),
      spiralogicPhases: extractSpiralogicPhases(chartData)
    };
  } catch (error) {
    console.log('ℹ️ No birth chart available for this user (that\'s okay!)');
    return null;
  }
}

/**
 * Extract significant planetary placements in readable format
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
 * Extract Spiralogic phase mappings
 */
function extractSpiralogicPhases(chartData: any): any {
  if (!chartData.spiralogicPhases) return undefined;

  const phases: any = {
    fire: [],
    water: [],
    earth: [],
    air: []
  };

  // Map planets to phases based on house placements
  Object.entries(chartData.spiralogicPhases).forEach(([phase, planets]: [string, any]) => {
    if (Array.isArray(planets)) {
      phases[phase] = planets.map((p: any) => `${p.planet} in ${p.sign}`);
    }
  });

  return phases;
}

/**
 * Format birth chart context as a gentle whisper for MAIA
 * This is added to her context, not her instructions
 *
 * Includes archetypal correlations from the Spiralogic Library
 */
export function formatChartContextForMAIA(chart: BirthChartContext | null): string {
  if (!chart || !chart.hasChart) {
    return ''; // No chart = no context. MAIA continues beautifully without it.
  }

  // Simple, clean format - just data, no interpretation
  let context = '\n\n---\n\n';
  context += 'AVAILABLE CONTEXT (Birth Chart + Archetypal Correlations):\n\n';

  // Core placements with archetypal context
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

  context += '\n💡 Archetypal wisdom available from: Mythology, Jung, Erikson, Maslow, Hero\'s Journey, Cultural Heroes\n';
  context += 'Use naturally when relevant - no need to lecture about systems.\n';
  context += '\n---\n';

  return context;
}

/**
 * Helper: Extract sign name from placement string
 * e.g., "Sagittarius 17° (House 4)" -> "Sagittarius"
 */
function extractSignFromPlacement(placement: string): string {
  const match = placement.match(/^([A-Za-z]+)/);
  return match ? match[1] : '';
}

/**
 * Get archetypal synthesis for a specific aspect (ON-DEMAND ONLY)
 * Called when user asks about a specific aspect in their chart
 * Returns poetic 2-4 sentence interpretation, not textbook description
 */
export function synthesizeAspectForMAIA(
  userQuery: string,
  chartData: any
): string | null {
  try {
    console.log('🔮 [ASPECT SYNTHESIS] Checking if query requires aspect synthesis...');
    console.log('   Query:', userQuery);
    console.log('   Chart data available:', !!chartData);

    if (!chartData || !userQuery) {
      console.log('   ❌ No chart data or query - skipping');
      return null;
    }

    // Extract aspects from chart
    const aspects = extractAspectsFromChart(chartData);
    console.log(`   📊 Found ${aspects.length} aspects in chart`);
    if (aspects.length === 0) return null;

    // Find most relevant aspect based on query
    const relevantAspect = findRelevantAspect(userQuery, aspects);
    console.log('   🎯 Relevant aspect:', relevantAspect);
    if (!relevantAspect) {
      console.log('   ❌ No relevant aspect found for query');
      return null;
    }

    // Synthesize archetypal interpretation
    const synthesis = synthesizeAspect(
      relevantAspect.planet1,
      relevantAspect.planet2,
      relevantAspect.aspectType
    );
    console.log('   ✨ Synthesis result:', synthesis ? 'SUCCESS' : 'FAILED');

    if (!synthesis) return null;

    // Return poetic synthesis with soul question
    const result = `\n\n✨ ARCHETYPAL INSIGHT:\n${synthesis.essence}\n\nCore Question: ${synthesis.coreQuestion}${synthesis.elementalDynamic ? `\n(${synthesis.elementalDynamic})` : ''}`;
    console.log('   ✅ Returning archetypal synthesis (', result.length, 'chars)');
    console.log('   📝 [SYNTHESIS CONTENT]:');
    console.log('   ', synthesis.essence.substring(0, 150) + '...');
    console.log('   ', 'Core Question:', synthesis.coreQuestion);
    return result;
  } catch (error) {
    console.error('❌ [ASPECT SYNTHESIS ERROR]:', error);
    return null; // Fail silently
  }
}
