/**
 * THE DIALECTICAL SCAFFOLD - COGNITIVE EVENTS LOGGING SERVICE
 *
 * Longitudinal tracking of Bloom's Taxonomy cognitive levels
 * across all MAIA conversations.
 *
 * Fire-and-forget pattern: DB failures never block MAIA responses.
 *
 * Created: December 14, 2025
 * Part of: Phase 1 Foundation Implementation
 */

import { insertOne, query } from '../db/postgres';

// =====================================================================
// FEATURE FLAG - Gate until table exists in production
// =====================================================================
const COGNITIVE_EVENTS_ENABLED = process.env.MAIA_ENABLE_COGNITIVE_TURN_EVENTS === '1';

// =====================================================================
// TYPE DEFINITIONS
// =====================================================================

export type BloomBypassingFlags = {
  spiritual?: boolean;      // High transpersonal + low cognition
  intellectual?: boolean;   // High analytical + low somatic/emotional
};

export type BloomDetection = {
  level: number;              // Numeric level (1-6) - deprecated, use numericLevel
  numericLevel?: number;      // Preferred: 1-6
  score: number;              // 0.00–1.00 confidence
  label: string;              // 'REMEMBER', 'UNDERSTAND', etc.
  scaffoldingPrompt?: string; // Socratic question for next level
  bypassing?: BloomBypassingFlags;
  element?: string;           // 'FIRE', 'WATER', 'EARTH', 'AIR', 'VOID'
  facet?: string;             // 'FIRE_1', 'WATER_2', etc.
  archetype?: string;         // 'MYSTIC', 'MENTOR', 'HEALER', etc.
};

type LogTurnArgs = {
  userId: string;
  sessionId?: string;
  turnIndex?: number;
  bloom: BloomDetection;
  scaffoldingUsed: boolean;   // Was scaffolding injected into MAIA prompt?
};

// =====================================================================
// LOGGING FUNCTION
// =====================================================================

/**
 * Log a single cognitive turn event to Postgres
 *
 * Fire-and-forget: Never throws, never blocks MAIA response.
 * Logs errors to console but continues execution.
 *
 * @param userId - User's UUID from auth system
 * @param sessionId - Conversation session identifier
 * @param turnIndex - Turn number within session (optional)
 * @param bloom - Bloom's Taxonomy detection result
 * @param scaffoldingUsed - Whether scaffolding was injected into MAIA's prompt
 */
export async function logCognitiveTurn({
  userId,
  sessionId,
  turnIndex,
  bloom,
  scaffoldingUsed,
}: LogTurnArgs): Promise<void> {
  // Gate: skip if table doesn't exist yet (fail-open for telemetry)
  if (!COGNITIVE_EVENTS_ENABLED) {
    return;
  }

  try {
    // Prepare insert payload
    const payload = {
      user_id: userId,
      session_id: sessionId ?? null,
      turn_index: turnIndex ?? null,

      // Bloom's Taxonomy detection
      bloom_level: bloom.numericLevel ?? bloom.level,
      bloom_label: bloom.label,
      bloom_score: bloom.score,

      // Bypassing detection
      bypassing_spiritual: bloom.bypassing?.spiritual ?? false,
      bypassing_intellectual: bloom.bypassing?.intellectual ?? false,

      // Scaffolding system
      scaffolding_prompt: bloom.scaffoldingPrompt ?? null,
      scaffolding_used: scaffoldingUsed,

      // Consciousness context (from elemental/mythic layers)
      element: bloom.element ?? null,
      facet: bloom.facet ?? null,
      archetype: bloom.archetype ?? null,
    };

    // Insert into Postgres (local sovereignty-compliant database)
    await insertOne('cognitive_turn_events', payload);
    console.log(`🧠 [Dialectical Scaffold] Cognitive turn logged: Level ${bloom.numericLevel ?? bloom.level} (${bloom.label})`);
  } catch (err) {
    // Catch-all: Never crash, just log error
    console.error('[Dialectical Scaffold] Unexpected error logging cognitive turn:', err);
  }
}

// =====================================================================
// HELPER FUNCTIONS (FUTURE ENHANCEMENTS)
// =====================================================================

/**
 * Retrieve recent cognitive progression for a user
 * (For dashboards, analytics, Learning System integration)
 */
export async function getUserCognitiveProgression(
  userId: string,
  limit: number = 20
): Promise<BloomDetection[] | null> {
  // Gate: return null if table doesn't exist
  if (!COGNITIVE_EVENTS_ENABLED) {
    return null;
  }

  try {
    // Query Postgres (local sovereignty-compliant database)
    const sql = `
      SELECT *
      FROM cognitive_turn_events
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await query(sql, [userId, limit]);

    // Transform DB rows back to BloomDetection objects
    return (result.rows || []).map((row: any) => ({
      level: row.bloom_level,
      numericLevel: row.bloom_level,
      score: parseFloat(row.bloom_score),
      label: row.bloom_label,
      scaffoldingPrompt: row.scaffolding_prompt,
      bypassing: {
        spiritual: row.bypassing_spiritual,
        intellectual: row.bypassing_intellectual,
      },
      element: row.element,
      facet: row.facet,
      archetype: row.archetype,
    }));
  } catch (err) {
    console.error('[Dialectical Scaffold] Unexpected error retrieving progression:', err);
    return null;
  }
}

/**
 * Calculate average cognitive level over last N turns
 * (For Community Commons quality gates, badge systems)
 */
export async function getAverageCognitiveLevel(
  userId: string,
  lastNTurns: number = 20
): Promise<number | null> {
  try {
    const progression = await getUserCognitiveProgression(userId, lastNTurns);
    if (!progression || progression.length === 0) return null;

    const sum = progression.reduce((acc, turn) => acc + (turn.numericLevel ?? turn.level), 0);
    return sum / progression.length;
  } catch (err) {
    console.error('[Dialectical Scaffold] Error calculating average cognitive level:', err);
    return null;
  }
}
