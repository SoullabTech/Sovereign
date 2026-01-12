/**
 * Expansion Event Service
 *
 * Detects and persists moments of user growth/expansion.
 * These are explicit events (insights, breakthroughs, integrations)
 * that complement the computed expansion_score from telemetry.
 *
 * Detection sources:
 * 1. Text pattern analysis (system_detected)
 * 2. User-reported insights (user_reported)
 * 3. Memory recall integrations (memory_surfaced)
 *
 * Usage:
 *   import { detectAndPersistExpansion } from './expansionEventService';
 *   await detectAndPersistExpansion({
 *     sessionId,
 *     turnId,
 *     userText,
 *     maiaText,
 *     userId,
 *   });
 */

import { query, queryOne } from '../db/postgres';

// ============================================================
// TYPES
// ============================================================

export type ExpansionEventType =
  | 'insight'        // new understanding emerges
  | 'breakthrough'   // significant shift in perspective
  | 'integration'    // connecting previously separate ideas
  | 'reframe'        // seeing situation differently
  | 'completion'     // emotional/relational closure
  | 'recognition'    // seeing self/pattern clearly
  | 'boundary'       // healthy limit expressed/held
  | 'other';

export type ExpansionSource =
  | 'system_detected'    // MAIA identified expansion markers
  | 'user_reported'      // user flagged as insight
  | 'practitioner_noted' // practitioner marked in supervision
  | 'memory_surfaced';   // emerged from memory recall

export interface ExpansionEventInput {
  sessionId: string;
  turnId?: number;
  userId?: string;
  memberId?: string;
  eventType: ExpansionEventType;
  source: ExpansionSource;
  content?: string;
  contextBefore?: string;
  maiaResponse?: string;
  confidence?: number;
  significance?: number;
  markers?: string[];
  decisionId?: string;
  memoryId?: string;
  episodeId?: string;
  meta?: Record<string, unknown>;
}

export interface ExpansionDetectionInput {
  sessionId: string;
  turnId?: number;
  userText: string;
  maiaText?: string;
  userId?: string;
  memberId?: string;
  memoryWasUsed?: boolean;
  memoryId?: string;
  decisionId?: string;
}

interface DetectedExpansion {
  eventType: ExpansionEventType;
  markers: string[];
  confidence: number;
  significance: number;
  matchedPatterns: string[];
}

// ============================================================
// EXPANSION DETECTION PATTERNS
// ============================================================

interface PatternDefinition {
  pattern: RegExp;
  eventType: ExpansionEventType;
  marker: string;
  significance: number;
}

const EXPANSION_PATTERNS: PatternDefinition[] = [
  // Insight patterns
  {
    pattern: /\b(?:i (?:just )?real[iz]+ed?|now i (?:see|understand)|it hit me|i get it now)\b/i,
    eventType: 'insight',
    marker: 'realization_language',
    significance: 0.8,
  },
  {
    pattern: /\b(?:i never (?:thought|saw|noticed)|for the first time|suddenly|all of a sudden)\b/i,
    eventType: 'insight',
    marker: 'novelty_language',
    significance: 0.7,
  },
  {
    pattern: /\b(?:that makes sense now|i can see now|it's clear to me|the fog (?:lifted|cleared))\b/i,
    eventType: 'insight',
    marker: 'clarity_language',
    significance: 0.75,
  },

  // Breakthrough patterns
  {
    pattern: /\b(?:breakthrough|everything changed|shifted|transformation)\b/i,
    eventType: 'breakthrough',
    marker: 'breakthrough_language',
    significance: 0.9,
  },
  {
    pattern: /\b(?:i('ve| have) been (?:wrong|blind|stuck)|all along)\b/i,
    eventType: 'breakthrough',
    marker: 'paradigm_shift',
    significance: 0.85,
  },

  // Integration patterns
  {
    pattern: /\b(?:connects? (?:to|with)|this (?:relates|ties) to|now i see how|it all (?:makes sense|fits))\b/i,
    eventType: 'integration',
    marker: 'connection_language',
    significance: 0.7,
  },
  {
    pattern: /\b(?:pattern|theme|thread|through line)\b/i,
    eventType: 'integration',
    marker: 'pattern_recognition',
    significance: 0.65,
  },

  // Reframe patterns
  {
    pattern: /\b(?:different perspective|new way (?:of|to) (?:see|look|think)|another angle|flip side)\b/i,
    eventType: 'reframe',
    marker: 'perspective_shift',
    significance: 0.7,
  },
  {
    pattern: /\b(?:maybe it's not|what if (?:instead|it's)|perhaps|could be that)\b.*\b(?:but|rather|actually)\b/i,
    eventType: 'reframe',
    marker: 'cognitive_reframe',
    significance: 0.65,
  },

  // Completion patterns
  {
    pattern: /\b(?:let(?:ting)? go|release[d]?|closure|finally|at peace|moved on)\b/i,
    eventType: 'completion',
    marker: 'completion_language',
    significance: 0.75,
  },
  {
    pattern: /\b(?:forgive|accept(?:ance|ed)?|come to terms|reconcile[d]?)\b/i,
    eventType: 'completion',
    marker: 'acceptance_language',
    significance: 0.7,
  },

  // Recognition patterns
  {
    pattern: /\b(?:i see myself|i recognize|that's me|my pattern|i do this|i always)\b/i,
    eventType: 'recognition',
    marker: 'self_recognition',
    significance: 0.75,
  },
  {
    pattern: /\b(?:honest with myself|truth is|really|deep down|if i'm being honest)\b/i,
    eventType: 'recognition',
    marker: 'honesty_language',
    significance: 0.7,
  },

  // Boundary patterns
  {
    pattern: /\b(?:i need to|i have to|it's time to|i won't|i can't keep|no more)\b/i,
    eventType: 'boundary',
    marker: 'boundary_language',
    significance: 0.65,
  },
  {
    pattern: /\b(?:protect myself|self.?care|healthy for me|my needs|stand up for)\b/i,
    eventType: 'boundary',
    marker: 'self_protection',
    significance: 0.7,
  },

  // Emotional shift markers (boost significance)
  {
    pattern: /\b(?:feel(?:s|ing)?|felt) (?:different|lighter|relieved|free|hopeful|stronger)\b/i,
    eventType: 'insight',
    marker: 'emotional_shift',
    significance: 0.6,
  },

  // New language markers (indicates growth)
  {
    pattern: /\b(?:i('ve| have) never (?:said|thought|felt)|first time (?:saying|admitting))\b/i,
    eventType: 'insight',
    marker: 'new_language',
    significance: 0.75,
  },
];

// ============================================================
// DETECTION LOGIC
// ============================================================

/**
 * Analyze text for expansion markers
 */
export function detectExpansion(text: string): DetectedExpansion | null {
  if (!text || text.length < 10) {
    return null;
  }

  const matchedPatterns: string[] = [];
  const markers: string[] = [];
  let totalSignificance = 0;
  const eventTypeCounts: Record<ExpansionEventType, number> = {
    insight: 0,
    breakthrough: 0,
    integration: 0,
    reframe: 0,
    completion: 0,
    recognition: 0,
    boundary: 0,
    other: 0,
  };

  for (const def of EXPANSION_PATTERNS) {
    if (def.pattern.test(text)) {
      matchedPatterns.push(def.pattern.source);
      markers.push(def.marker);
      totalSignificance += def.significance;
      eventTypeCounts[def.eventType]++;
    }
  }

  // No patterns matched
  if (matchedPatterns.length === 0) {
    return null;
  }

  // Determine dominant event type
  const dominantType = (Object.entries(eventTypeCounts) as [ExpansionEventType, number][])
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'insight';

  // Calculate confidence based on pattern density
  const confidence = Math.min(1.0, matchedPatterns.length * 0.25);

  // Normalize significance
  const significance = Math.min(1.0, totalSignificance / matchedPatterns.length);

  return {
    eventType: dominantType,
    markers: [...new Set(markers)], // dedupe
    confidence,
    significance,
    matchedPatterns,
  };
}

// ============================================================
// PERSISTENCE
// ============================================================

/**
 * Persist an expansion event to the database
 */
export async function persistExpansionEvent(
  input: ExpansionEventInput
): Promise<string | null> {
  try {
    const result = await queryOne<{ id: string }>(
      `INSERT INTO expansion_events (
        session_id,
        turn_id,
        user_id,
        member_id,
        event_type,
        source,
        content,
        context_before,
        maia_response,
        confidence,
        significance,
        markers,
        decision_id,
        memory_id,
        episode_id,
        meta
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id`,
      [
        input.sessionId,
        input.turnId ?? null,
        input.userId ?? null,
        input.memberId ?? null,
        input.eventType,
        input.source,
        input.content ?? null,
        input.contextBefore ?? null,
        input.maiaResponse ?? null,
        input.confidence ?? null,
        input.significance ?? null,
        JSON.stringify(input.markers ?? []),
        input.decisionId ?? null,
        input.memoryId ?? null,
        input.episodeId ?? null,
        JSON.stringify(input.meta ?? {}),
      ]
    );

    if (result?.id) {
      console.log(
        `[Expansion] Persisted | id=${result.id.slice(0, 8)}... | ` +
        `type=${input.eventType} | source=${input.source} | ` +
        `confidence=${input.confidence?.toFixed(2) ?? 'N/A'}`
      );
      return result.id;
    }

    return null;
  } catch (error) {
    console.error('[Expansion] Failed to persist:', error);
    return null;
  }
}

/**
 * Detect expansion in user text and persist if found
 *
 * Call this after each user message to capture growth moments.
 */
export async function detectAndPersistExpansion(
  input: ExpansionDetectionInput
): Promise<string | null> {
  const detection = detectExpansion(input.userText);

  if (!detection) {
    return null;
  }

  // Minimum confidence threshold
  if (detection.confidence < 0.25) {
    return null;
  }

  // Boost significance if memory was involved
  let adjustedSignificance = detection.significance;
  let source: ExpansionSource = 'system_detected';

  if (input.memoryWasUsed) {
    adjustedSignificance = Math.min(1.0, detection.significance + 0.15);
    source = 'memory_surfaced';
    detection.markers.push('memory_integration');
  }

  return persistExpansionEvent({
    sessionId: input.sessionId,
    turnId: input.turnId,
    userId: input.userId,
    memberId: input.memberId,
    eventType: detection.eventType,
    source,
    content: input.userText.slice(0, 2000), // truncate for storage
    maiaResponse: input.maiaText?.slice(0, 2000),
    confidence: detection.confidence,
    significance: adjustedSignificance,
    markers: detection.markers,
    decisionId: input.decisionId,
    memoryId: input.memoryId,
  });
}

// ============================================================
// VALIDATION / FEEDBACK
// ============================================================

/**
 * Record user validation of an expansion event
 */
export async function validateExpansionEvent(
  eventId: string,
  validated: boolean,
  feedbackScore?: number,
  feedbackText?: string
): Promise<void> {
  try {
    await query(
      `UPDATE expansion_events
       SET validated = $1, feedback_score = $2, feedback_text = $3
       WHERE id = $4`,
      [validated, feedbackScore ?? null, feedbackText ?? null, eventId]
    );

    console.log(
      `[Expansion] Validated | id=${eventId.slice(0, 8)}... | validated=${validated}`
    );
  } catch (error) {
    console.error('[Expansion] Failed to validate:', error);
  }
}

// ============================================================
// QUERIES
// ============================================================

/**
 * Get expansion events for a session
 */
export async function getSessionExpansions(
  sessionId: string
): Promise<Array<{
  id: string;
  eventType: ExpansionEventType;
  source: ExpansionSource;
  content: string | null;
  confidence: number | null;
  significance: number | null;
  markers: string[];
  createdAt: Date;
  validated: boolean | null;
}>> {
  const result = await query<any>(
    `SELECT id, event_type, source, content, confidence, significance, markers, created_at, validated
     FROM expansion_events
     WHERE session_id = $1
     ORDER BY created_at ASC`,
    [sessionId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    eventType: row.event_type,
    source: row.source,
    content: row.content,
    confidence: row.confidence,
    significance: row.significance,
    markers: row.markers || [],
    createdAt: row.created_at,
    validated: row.validated,
  }));
}

/**
 * Get user's expansion journey summary
 */
export async function getUserExpansionSummary(
  userId: string
): Promise<{
  totalExpansions: number;
  expansionTypes: Record<ExpansionEventType, number>;
  sessionsWithExpansion: number;
  avgConfidence: number;
  avgSignificance: number;
  validatedCount: number;
  avgFeedbackScore: number | null;
  firstExpansion: Date | null;
  lastExpansion: Date | null;
} | null> {
  const result = await queryOne<any>(
    `SELECT
      COUNT(*) as total,
      COUNT(DISTINCT session_id) as sessions,
      AVG(COALESCE(confidence, 0)) as avg_confidence,
      AVG(COALESCE(significance, 0)) as avg_significance,
      SUM(CASE WHEN validated = true THEN 1 ELSE 0 END) as validated_count,
      AVG(feedback_score) as avg_feedback_score,
      MIN(created_at) as first_expansion,
      MAX(created_at) as last_expansion
    FROM expansion_events
    WHERE user_id = $1`,
    [userId]
  );

  if (!result || parseInt(result.total) === 0) {
    return null;
  }

  // Get type breakdown
  const typeResult = await query<any>(
    `SELECT event_type, COUNT(*) as count
     FROM expansion_events
     WHERE user_id = $1
     GROUP BY event_type`,
    [userId]
  );

  const expansionTypes: Record<ExpansionEventType, number> = {
    insight: 0,
    breakthrough: 0,
    integration: 0,
    reframe: 0,
    completion: 0,
    recognition: 0,
    boundary: 0,
    other: 0,
  };

  for (const row of typeResult.rows) {
    expansionTypes[row.event_type as ExpansionEventType] = parseInt(row.count);
  }

  return {
    totalExpansions: parseInt(result.total),
    expansionTypes,
    sessionsWithExpansion: parseInt(result.sessions),
    avgConfidence: parseFloat(result.avg_confidence),
    avgSignificance: parseFloat(result.avg_significance),
    validatedCount: parseInt(result.validated_count),
    avgFeedbackScore: result.avg_feedback_score ? parseFloat(result.avg_feedback_score) : null,
    firstExpansion: result.first_expansion,
    lastExpansion: result.last_expansion,
  };
}
