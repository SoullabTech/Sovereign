/**
 * WISDOM CONTEXT BUILDER
 *
 * Builds personalized wisdom context for a member based on their preferences.
 * This context informs wisdom translation and interpretation.
 */

import { pool } from '@/lib/db/postgres';

interface WisdomPreferences {
  preferredSystems: string[];
  culturalLens: string | null;
  linguisticStyle: string | null;
}

/**
 * Build wisdom context string for a member.
 * Returns null if no preferences set.
 */
export async function buildWisdomContext(memberId: string): Promise<string | null> {
  try {
    if (!pool) return null;
    // Check if wisdom_preferences table exists and has data
    const result = await pool.query(
      `SELECT preferred_systems, cultural_lens, linguistic_style
       FROM wisdom_preferences
       WHERE member_id = $1`,
      [memberId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const prefs: WisdomPreferences = {
      preferredSystems: result.rows[0].preferred_systems || [],
      culturalLens: result.rows[0].cultural_lens,
      linguisticStyle: result.rows[0].linguistic_style,
    };

    const contextParts: string[] = [];

    if (prefs.preferredSystems.length > 0) {
      contextParts.push(`Preferred wisdom systems: ${prefs.preferredSystems.join(', ')}`);
    }

    if (prefs.culturalLens) {
      contextParts.push(`Cultural lens: ${prefs.culturalLens}`);
    }

    if (prefs.linguisticStyle) {
      contextParts.push(`Linguistic style preference: ${prefs.linguisticStyle}`);
    }

    return contextParts.length > 0 ? contextParts.join('\n') : null;
  } catch (error) {
    // Table might not exist yet - that's fine
    console.warn('[WisdomContextBuilder] Could not fetch wisdom preferences:', error);
    return null;
  }
}

/**
 * Get default wisdom systems available in MAIA.
 */
export function getAvailableWisdomSystems(): string[] {
  return [
    'astrology',
    'alchemy',
    'psychology',
    'spiral',
    'somatic',
    'mythology',
    'energy',
    'archetypal',
  ];
}
