/**
 * Wu Xing Enhanced I Ching Casting
 *
 * Extends the standard I Ching casting with:
 * - Wu Xing element tags computed from trigrams
 * - Persistence to divination_iching_readings table
 * - Integration with BaZi profile for personalized guidance
 */

import { query as dbQuery } from '@/lib/db/postgres';
import {
  IChingReading,
  LineValue,
  WuXingElement,
  Hexagram,
  TrigramKey
} from '../core/types';
import {
  castAllLines,
  findHexagramFromLines,
  castIChing as baseCastIChing
} from './casting';
import { TRIGRAMS } from './trigrams';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface WuXingInfluence {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface EnhancedIChingReading extends IChingReading {
  /** Wu Xing element weights derived from trigrams */
  wuxingInfluence: WuXingInfluence;

  /** Theme keywords extracted from hexagram */
  themeKeywords: string[];

  /** Reading ID (if persisted) */
  readingId?: string;

  /** Whether reading was persisted */
  persisted: boolean;

  /** Member's constitutional context (if BaZi available) */
  constitutionalContext?: {
    dayMasterElement: WuXingElement;
    alignment: 'supportive' | 'challenging' | 'neutral';
    advice: string;
  };
}

export interface CastingOptions {
  /** User ID for persistence */
  userId?: string;

  /** Session ID for context */
  sessionId?: string;

  /** Cast method */
  method?: 'yarrow' | 'coins' | 'rng';

  /** Whether to persist to database */
  persist?: boolean;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// WU XING CALCULATION FROM TRIGRAMS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate Wu Xing influence from a hexagram's trigrams
 *
 * Each trigram has an associated Wu Xing element:
 * - Heaven (Qian): Metal
 * - Earth (Kun): Earth
 * - Thunder (Zhen): Wood
 * - Water (Kan): Water
 * - Mountain (Gen): Earth
 * - Wind (Xun): Wood
 * - Fire (Li): Fire
 * - Lake (Dui): Metal
 *
 * Upper trigram represents Heaven/outer, lower represents Earth/inner.
 * The combination creates the Wu Xing profile of the hexagram.
 */
export function computeWuXingFromTrigrams(
  upperTrigram: TrigramKey,
  lowerTrigram: TrigramKey
): WuXingInfluence {
  const influence: WuXingInfluence = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0
  };

  // Get elements from trigrams
  const upperElement = TRIGRAMS[upperTrigram].element;
  const lowerElement = TRIGRAMS[lowerTrigram].element;

  // Upper trigram (Heaven position) gets weight 2
  influence[upperElement] += 2;

  // Lower trigram (Earth position) gets weight 2
  influence[lowerElement] += 2;

  // Add 1 for generation relationship (if upper generates lower or vice versa)
  const generationCycle: Record<WuXingElement, WuXingElement> = {
    wood: 'fire',
    fire: 'earth',
    earth: 'metal',
    metal: 'water',
    water: 'wood'
  };

  if (generationCycle[lowerElement] === upperElement) {
    // Lower generates upper - harmonious flow
    influence[lowerElement] += 1;
    influence[upperElement] += 1;
  } else if (generationCycle[upperElement] === lowerElement) {
    // Upper generates lower - descending nourishment
    influence[upperElement] += 1;
    influence[lowerElement] += 1;
  }

  return influence;
}

/**
 * Get Wu Xing influence from a hexagram
 */
export function getHexagramWuXingInfluence(hexagram: Hexagram): WuXingInfluence {
  return computeWuXingFromTrigrams(
    hexagram.trigrams.upper,
    hexagram.trigrams.lower
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// THEME EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract theme keywords from hexagram
 */
function extractThemeKeywords(hexagram: Hexagram): string[] {
  const keywords: string[] = [];

  // Add primary keyword
  keywords.push(hexagram.keyword);

  // Add trigram keywords (first 2 from each)
  const upperTrigram = TRIGRAMS[hexagram.trigrams.upper];
  const lowerTrigram = TRIGRAMS[hexagram.trigrams.lower];

  keywords.push(...upperTrigram.keywords.slice(0, 2));
  keywords.push(...lowerTrigram.keywords.slice(0, 2));

  // Add archetype
  if (hexagram.archetypeCorrespondence) {
    keywords.push(hexagram.archetypeCorrespondence);
  }

  // Dedupe and return
  return [...new Set(keywords)];
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTITUTIONAL CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analyze how hexagram relates to member's BaZi constitution
 */
async function getConstitutionalContext(
  userId: string,
  hexagramWuxing: WuXingInfluence
): Promise<EnhancedIChingReading['constitutionalContext'] | undefined> {
  try {
    const result = await dbQuery(
      `SELECT day_master_element, dominant_elements, deficient_elements
       FROM member_bazi_profile WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return undefined;
    }

    const profile = result.rows[0];
    const dayMaster = profile.day_master_element as WuXingElement;
    const dominant = profile.dominant_elements as WuXingElement[];
    const deficient = profile.deficient_elements as WuXingElement[];

    // Find hexagram's dominant element
    let hexagramDominant: WuXingElement = 'earth';
    let maxInfluence = 0;
    for (const [element, weight] of Object.entries(hexagramWuxing)) {
      if (weight > maxInfluence) {
        maxInfluence = weight;
        hexagramDominant = element as WuXingElement;
      }
    }

    // Determine alignment
    let alignment: 'supportive' | 'challenging' | 'neutral' = 'neutral';
    let advice = '';

    // Generation cycle: Wood→Fire→Earth→Metal→Water→Wood
    const generationCycle: Record<WuXingElement, WuXingElement> = {
      wood: 'fire',
      fire: 'earth',
      earth: 'metal',
      metal: 'water',
      water: 'wood'
    };

    // Control cycle: Wood→Earth→Water→Fire→Metal→Wood
    const controlCycle: Record<WuXingElement, WuXingElement> = {
      wood: 'earth',
      earth: 'water',
      water: 'fire',
      fire: 'metal',
      metal: 'wood'
    };

    // Check if hexagram supports deficient elements
    if (deficient.includes(hexagramDominant)) {
      alignment = 'supportive';
      advice = `This hexagram's ${hexagramDominant} energy may help nourish your constitutional ${hexagramDominant} deficiency.`;
    }
    // Check if hexagram challenges day master
    else if (controlCycle[hexagramDominant] === dayMaster) {
      alignment = 'challenging';
      advice = `This hexagram's ${hexagramDominant} energy may challenge your ${dayMaster} day master. Proceed with awareness and groundedness.`;
    }
    // Check if hexagram supports day master
    else if (generationCycle[hexagramDominant] === dayMaster || hexagramDominant === dayMaster) {
      alignment = 'supportive';
      advice = `This hexagram's ${hexagramDominant} energy resonates with your ${dayMaster} nature. Trust this guidance.`;
    }
    else {
      advice = `This hexagram offers ${hexagramDominant} energy. Consider how it balances your natural ${dayMaster} constitution.`;
    }

    return {
      dayMasterElement: dayMaster,
      alignment,
      advice
    };
  } catch (err) {
    console.warn('[I Ching] Could not fetch constitutional context:', err);
    return undefined;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERSISTENCE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Persist I Ching reading to database
 */
async function persistReading(
  reading: IChingReading,
  wuxingInfluence: WuXingInfluence,
  themeKeywords: string[],
  options: CastingOptions
): Promise<string | null> {
  if (!options.userId || options.persist === false) {
    return null;
  }

  try {
    const hexagram = reading.primaryHexagram;

    const result = await dbQuery(
      `INSERT INTO divination_iching_readings (
        user_id, session_id, cast_method, question,
        primary_hex, primary_hex_name, line_values, changing_lines,
        relating_hex, relating_hex_name,
        lower_trigram, upper_trigram,
        wuxing_influence_json, theme_keywords,
        interpretation_text, guidance_text, metadata_json
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      ) RETURNING id`,
      [
        options.userId,
        options.sessionId || null,
        options.method || 'coins',
        reading.query,
        hexagram.number,
        hexagram.name,
        reading.castLines,
        reading.changingLines,
        reading.transformedHexagram?.number || null,
        reading.transformedHexagram?.name || null,
        hexagram.trigrams.lower,
        hexagram.trigrams.upper,
        JSON.stringify(wuxingInfluence),
        themeKeywords,
        reading.insight,
        reading.soulGuidance,
        JSON.stringify(options.metadata || {})
      ]
    );

    return result.rows[0]?.id || null;
  } catch (err) {
    console.error('[I Ching] Failed to persist reading:', err);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ENHANCED CASTING FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Cast an enhanced I Ching reading with Wu Xing integration
 */
export async function castEnhancedIChing(
  query: string,
  options: CastingOptions = {}
): Promise<EnhancedIChingReading> {
  // Use base casting
  const baseReading = baseCastIChing(query, options.method === 'yarrow' ? 'yarrow' : 'coins');

  // Compute Wu Xing influence
  const wuxingInfluence = getHexagramWuXingInfluence(baseReading.primaryHexagram);

  // Extract theme keywords
  const themeKeywords = extractThemeKeywords(baseReading.primaryHexagram);

  // Get constitutional context if user ID provided
  let constitutionalContext: EnhancedIChingReading['constitutionalContext'] | undefined;
  if (options.userId) {
    constitutionalContext = await getConstitutionalContext(options.userId, wuxingInfluence);
  }

  // Persist if requested
  const readingId = await persistReading(baseReading, wuxingInfluence, themeKeywords, options);

  return {
    ...baseReading,
    wuxingInfluence,
    themeKeywords,
    readingId: readingId || undefined,
    persisted: !!readingId,
    constitutionalContext
  };
}

/**
 * Fetch recent I Ching readings for a user
 */
export async function fetchRecentReadings(
  userId: string,
  limit: number = 5
): Promise<Array<{
  id: string;
  question: string;
  hexagramNumber: number;
  hexagramName: string;
  wuxingInfluence: WuXingInfluence;
  createdAt: Date;
}>> {
  try {
    const result = await dbQuery(
      `SELECT id, question, primary_hex, primary_hex_name, wuxing_influence_json, created_at
       FROM divination_iching_readings
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map(row => ({
      id: row.id,
      question: row.question,
      hexagramNumber: row.primary_hex,
      hexagramName: row.primary_hex_name,
      wuxingInfluence: row.wuxing_influence_json,
      createdAt: new Date(row.created_at)
    }));
  } catch (err) {
    console.warn('[I Ching] Could not fetch recent readings:', err);
    return [];
  }
}

/**
 * Get pattern analysis from reading history
 */
export async function analyzeReadingPatterns(
  userId: string
): Promise<{
  totalReadings: number;
  dominantHexagrams: Array<{ number: number; name: string; count: number }>;
  wuxingTendency: WuXingInfluence;
  themeCloud: Array<{ keyword: string; count: number }>;
} | null> {
  try {
    const result = await dbQuery(
      `SELECT
         primary_hex,
         primary_hex_name,
         wuxing_influence_json,
         theme_keywords
       FROM divination_iching_readings
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Count hexagrams
    const hexagramCounts: Record<number, { name: string; count: number }> = {};
    for (const row of result.rows) {
      const num = row.primary_hex;
      if (!hexagramCounts[num]) {
        hexagramCounts[num] = { name: row.primary_hex_name, count: 0 };
      }
      hexagramCounts[num].count++;
    }

    // Sort by count
    const dominantHexagrams = Object.entries(hexagramCounts)
      .map(([num, data]) => ({ number: parseInt(num), ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Aggregate Wu Xing tendency
    const wuxingTendency: WuXingInfluence = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    for (const row of result.rows) {
      const influence = row.wuxing_influence_json as WuXingInfluence;
      for (const [el, val] of Object.entries(influence)) {
        wuxingTendency[el as keyof WuXingInfluence] += val;
      }
    }

    // Count themes
    const themeCounts: Record<string, number> = {};
    for (const row of result.rows) {
      const keywords = row.theme_keywords as string[];
      for (const kw of keywords) {
        themeCounts[kw] = (themeCounts[kw] || 0) + 1;
      }
    }

    const themeCloud = Object.entries(themeCounts)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalReadings: result.rows.length,
      dominantHexagrams,
      wuxingTendency,
      themeCloud
    };
  } catch (err) {
    console.warn('[I Ching] Could not analyze patterns:', err);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  castEnhancedIChing,
  computeWuXingFromTrigrams,
  getHexagramWuXingInfluence,
  fetchRecentReadings,
  analyzeReadingPatterns
};
