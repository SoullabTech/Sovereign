/**
 * Pattern Reflection Service
 *
 * Analyzes patterns across sessions and generates natural language insights
 * like "You often explore X when Y"
 *
 * Aggregates from:
 * - ConversationPatternAnalyzer recurring themes
 * - Bardic memory episode links
 * - Memory links (supports, contradicts, evolves)
 * - Developmental memories
 */

import { pool } from '@/lib/db/postgres';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export type PatternType =
  | 'recurring_theme' // "You often explore X"
  | 'conditional' // "You tend to X when Y"
  | 'evolution' // "Your relationship with X has shifted"
  | 'integration' // "X and Y seem connected for you"
  | 'contrast' // "You approach X differently than Y"
  | 'emergence'; // "A new pattern is forming around X"

export interface PatternReflection {
  id: string;
  userId: string;
  patternType: PatternType;
  insightText: string;
  sourcePatterns: string[];
  confidence: number;
  evidence: {
    memoryIds?: string[];
    episodeIds?: string[];
    occurrenceCount?: number;
    firstSeen?: string;
    lastSeen?: string;
  };
  userResponse?: 'resonates' | 'partially' | 'not_me' | 'skip';
  userNotes?: string;
  surfacedCount: number;
  createdAt: Date;
}

export interface PatternInsightRequest {
  userId: string;
  limit?: number;
  includeResponded?: boolean;
  types?: PatternType[];
}

export interface GeneratedInsight {
  patternType: PatternType;
  insightText: string;
  confidence: number;
  sourcePatterns: string[];
  evidence: PatternReflection['evidence'];
}

// ═══════════════════════════════════════════════════════════════════════════════
// Insight Generation Templates
// ═══════════════════════════════════════════════════════════════════════════════

const INSIGHT_TEMPLATES = {
  recurring_theme: [
    'You often explore themes of {theme}',
    '{theme} keeps appearing in your reflections',
    'There seems to be a thread of {theme} running through your journey',
    'You return again and again to {theme}',
  ],
  conditional: [
    'You tend to explore {themeA} when {condition}',
    'When {condition}, you often turn to {themeA}',
    '{condition} seems to bring up {themeA} for you',
    'There appears to be a connection between {condition} and {themeA}',
  ],
  evolution: [
    'Your relationship with {theme} has shifted over time',
    'How you approach {theme} has evolved',
    'You seem to be moving through something with {theme}',
    'There has been a transformation in how you hold {theme}',
  ],
  integration: [
    '{themeA} and {themeB} seem connected for you',
    'You often bring {themeA} and {themeB} together',
    'There appears to be a bridge between {themeA} and {themeB} in your experience',
  ],
  contrast: [
    'You approach {themeA} differently than {themeB}',
    '{themeA} and {themeB} seem to live in different parts of you',
    'There is an interesting tension between how you hold {themeA} and {themeB}',
  ],
  emergence: [
    'A new pattern seems to be forming around {theme}',
    'Something new is emerging in how you relate to {theme}',
    '{theme} appears to be becoming more significant',
  ],
};

function selectTemplate(type: PatternType): string {
  const templates = INSIGHT_TEMPLATES[type];
  return templates[Math.floor(Math.random() * templates.length)];
}

function fillTemplate(
  template: string,
  vars: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern Analysis
// ═══════════════════════════════════════════════════════════════════════════════

interface ThemeOccurrence {
  theme: string;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
  contexts: string[];
  emotionalTones: string[];
}

async function analyzeRecurringThemes(userId: string): Promise<ThemeOccurrence[]> {
  if (!pool) return [];

  try {
    // Get themes from developmental memories
    const result = await pool.query(
      `SELECT
        metadata->>'theme' as theme,
        COUNT(*) as count,
        MIN(formed_at) as first_seen,
        MAX(formed_at) as last_seen,
        array_agg(DISTINCT metadata->>'context') FILTER (WHERE metadata->>'context' IS NOT NULL) as contexts,
        array_agg(DISTINCT metadata->>'emotional_tone') FILTER (WHERE metadata->>'emotional_tone' IS NOT NULL) as emotional_tones
      FROM developmental_memories
      WHERE user_id = $1
        AND metadata->>'theme' IS NOT NULL
      GROUP BY metadata->>'theme'
      HAVING COUNT(*) >= 3
      ORDER BY count DESC
      LIMIT 20`,
      [userId]
    );

    return result.rows.map((row) => ({
      theme: row.theme,
      count: parseInt(row.count),
      firstSeen: row.first_seen,
      lastSeen: row.last_seen,
      contexts: row.contexts || [],
      emotionalTones: row.emotional_tones || [],
    }));
  } catch (error) {
    console.error('[PatternReflection] Error analyzing themes:', error);
    return [];
  }
}

interface LinkPattern {
  linkType: string;
  sourceTheme: string;
  targetTheme: string;
  count: number;
}

async function analyzeMemoryLinks(userId: string): Promise<LinkPattern[]> {
  if (!pool) return [];

  try {
    const result = await pool.query(
      `SELECT
        ml.link_type,
        src.metadata->>'theme' as source_theme,
        tgt.metadata->>'theme' as target_theme,
        COUNT(*) as count
      FROM memory_links ml
      JOIN developmental_memories src ON ml.source_memory_id = src.id
      JOIN developmental_memories tgt ON ml.target_memory_id = tgt.id
      WHERE ml.user_id = $1
        AND src.metadata->>'theme' IS NOT NULL
        AND tgt.metadata->>'theme' IS NOT NULL
      GROUP BY ml.link_type, src.metadata->>'theme', tgt.metadata->>'theme'
      HAVING COUNT(*) >= 2
      ORDER BY count DESC
      LIMIT 20`,
      [userId]
    );

    return result.rows.map((row) => ({
      linkType: row.link_type,
      sourceTheme: row.source_theme,
      targetTheme: row.target_theme,
      count: parseInt(row.count),
    }));
  } catch (error) {
    console.error('[PatternReflection] Error analyzing links:', error);
    return [];
  }
}

interface TemporalPattern {
  theme: string;
  timeContext: string; // 'morning', 'evening', 'weekend', etc.
  count: number;
}

async function analyzeTemporalPatterns(userId: string): Promise<TemporalPattern[]> {
  if (!pool) return [];

  try {
    const result = await pool.query(
      `SELECT
        metadata->>'theme' as theme,
        CASE
          WHEN EXTRACT(hour FROM formed_at) BETWEEN 5 AND 11 THEN 'morning'
          WHEN EXTRACT(hour FROM formed_at) BETWEEN 12 AND 17 THEN 'afternoon'
          WHEN EXTRACT(hour FROM formed_at) BETWEEN 18 AND 21 THEN 'evening'
          ELSE 'night'
        END as time_context,
        COUNT(*) as count
      FROM developmental_memories
      WHERE user_id = $1
        AND metadata->>'theme' IS NOT NULL
      GROUP BY metadata->>'theme', time_context
      HAVING COUNT(*) >= 3
      ORDER BY count DESC
      LIMIT 20`,
      [userId]
    );

    return result.rows.map((row) => ({
      theme: row.theme,
      timeContext: row.time_context,
      count: parseInt(row.count),
    }));
  } catch (error) {
    console.error('[PatternReflection] Error analyzing temporal patterns:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Insight Generation
// ═══════════════════════════════════════════════════════════════════════════════

async function generateInsights(userId: string): Promise<GeneratedInsight[]> {
  const insights: GeneratedInsight[] = [];

  // 1. Recurring themes
  const themes = await analyzeRecurringThemes(userId);
  for (const theme of themes.slice(0, 5)) {
    if (theme.count >= 5) {
      insights.push({
        patternType: 'recurring_theme',
        insightText: fillTemplate(selectTemplate('recurring_theme'), {
          theme: theme.theme,
        }),
        confidence: Math.min(0.9, 0.5 + theme.count * 0.05),
        sourcePatterns: [`recurring:${theme.theme}`],
        evidence: {
          occurrenceCount: theme.count,
          firstSeen: theme.firstSeen.toISOString(),
          lastSeen: theme.lastSeen.toISOString(),
        },
      });
    }
  }

  // 2. Conditional patterns (temporal)
  const temporal = await analyzeTemporalPatterns(userId);
  for (const pattern of temporal.slice(0, 3)) {
    if (pattern.count >= 4) {
      const condition =
        pattern.timeContext === 'morning'
          ? "it's morning"
          : pattern.timeContext === 'evening'
            ? "it's evening"
            : pattern.timeContext === 'night'
              ? "you're up late"
              : "it's afternoon";

      insights.push({
        patternType: 'conditional',
        insightText: fillTemplate(selectTemplate('conditional'), {
          themeA: pattern.theme,
          condition,
        }),
        confidence: Math.min(0.8, 0.4 + pattern.count * 0.05),
        sourcePatterns: [`temporal:${pattern.theme}:${pattern.timeContext}`],
        evidence: {
          occurrenceCount: pattern.count,
        },
      });
    }
  }

  // 3. Integration patterns (linked themes)
  const links = await analyzeMemoryLinks(userId);
  for (const link of links.slice(0, 3)) {
    if (link.linkType === 'supports' || link.linkType === 'derives_from') {
      insights.push({
        patternType: 'integration',
        insightText: fillTemplate(selectTemplate('integration'), {
          themeA: link.sourceTheme,
          themeB: link.targetTheme,
        }),
        confidence: Math.min(0.75, 0.4 + link.count * 0.1),
        sourcePatterns: [`link:${link.linkType}:${link.sourceTheme}:${link.targetTheme}`],
        evidence: {
          occurrenceCount: link.count,
        },
      });
    } else if (link.linkType === 'contradicts') {
      insights.push({
        patternType: 'contrast',
        insightText: fillTemplate(selectTemplate('contrast'), {
          themeA: link.sourceTheme,
          themeB: link.targetTheme,
        }),
        confidence: Math.min(0.7, 0.35 + link.count * 0.1),
        sourcePatterns: [`link:${link.linkType}:${link.sourceTheme}:${link.targetTheme}`],
        evidence: {
          occurrenceCount: link.count,
        },
      });
    } else if (link.linkType === 'evolves') {
      insights.push({
        patternType: 'evolution',
        insightText: fillTemplate(selectTemplate('evolution'), {
          theme: link.sourceTheme,
        }),
        confidence: Math.min(0.8, 0.45 + link.count * 0.1),
        sourcePatterns: [`link:${link.linkType}:${link.sourceTheme}:${link.targetTheme}`],
        evidence: {
          occurrenceCount: link.count,
        },
      });
    }
  }

  // 4. Emergence patterns (recent themes with increasing frequency)
  const recentThemes = themes.filter((t) => {
    const daysSinceFirst = (Date.now() - t.firstSeen.getTime()) / (1000 * 60 * 60 * 24);
    const daysSinceLast = (Date.now() - t.lastSeen.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceFirst < 30 && daysSinceLast < 7 && t.count >= 3;
  });

  for (const theme of recentThemes.slice(0, 2)) {
    insights.push({
      patternType: 'emergence',
      insightText: fillTemplate(selectTemplate('emergence'), {
        theme: theme.theme,
      }),
      confidence: Math.min(0.7, 0.4 + theme.count * 0.05),
      sourcePatterns: [`emergence:${theme.theme}`],
      evidence: {
        occurrenceCount: theme.count,
        firstSeen: theme.firstSeen.toISOString(),
        lastSeen: theme.lastSeen.toISOString(),
      },
    });
  }

  return insights;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate new pattern reflections for a user
 */
export async function generatePatternReflections(
  userId: string
): Promise<PatternReflection[]> {
  if (!pool) {
    console.warn('[PatternReflection] Database not available');
    return [];
  }

  try {
    // Generate insights
    const insights = await generateInsights(userId);

    if (insights.length === 0) {
      return [];
    }

    // Check which insights are truly new (not already stored)
    const existingResult = await pool.query(
      `SELECT insight_text FROM pattern_reflections
       WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'`,
      [userId]
    );
    const existingInsights = new Set(existingResult.rows.map((r) => r.insight_text));

    // Filter to new insights only
    const newInsights = insights.filter((i) => !existingInsights.has(i.insightText));

    // Store new insights
    const stored: PatternReflection[] = [];
    for (const insight of newInsights) {
      const result = await pool.query(
        `INSERT INTO pattern_reflections (
          user_id, pattern_type, insight_text, source_patterns, confidence, evidence
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
          userId,
          insight.patternType,
          insight.insightText,
          JSON.stringify(insight.sourcePatterns),
          insight.confidence,
          JSON.stringify(insight.evidence),
        ]
      );

      stored.push(rowToReflection(result.rows[0]));
    }

    return stored;
  } catch (error) {
    console.error('[PatternReflection] Error generating reflections:', error);
    return [];
  }
}

/**
 * Get pattern reflections for a user
 */
export async function getPatternReflections(
  request: PatternInsightRequest
): Promise<PatternReflection[]> {
  if (!pool) {
    return [];
  }

  try {
    const { userId, limit = 10, includeResponded = false, types } = request;

    let query = `
      SELECT * FROM pattern_reflections
      WHERE user_id = $1
    `;
    const params: (string | number | string[])[] = [userId];

    if (!includeResponded) {
      query += ' AND user_response IS NULL';
    }

    if (types && types.length > 0) {
      params.push(types);
      query += ` AND pattern_type = ANY($${params.length})`;
    }

    query += ' ORDER BY confidence DESC, created_at DESC';

    params.push(limit);
    query += ` LIMIT $${params.length}`;

    const result = await pool.query(query, params);
    return result.rows.map(rowToReflection);
  } catch (error) {
    console.error('[PatternReflection] Error fetching reflections:', error);
    return [];
  }
}

/**
 * Record user response to a pattern reflection
 */
export async function respondToReflection(
  reflectionId: string,
  userId: string,
  response: 'resonates' | 'partially' | 'not_me' | 'skip',
  notes?: string
): Promise<boolean> {
  if (!pool) {
    return false;
  }

  try {
    const result = await pool.query(
      `UPDATE pattern_reflections
       SET user_response = $1,
           user_notes = $2,
           responded_at = NOW(),
           updated_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING id`,
      [response, notes || null, reflectionId, userId]
    );

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('[PatternReflection] Error recording response:', error);
    return false;
  }
}

/**
 * Mark reflection as surfaced (shown to user)
 */
export async function markAsSurfaced(
  reflectionId: string,
  userId: string
): Promise<boolean> {
  if (!pool) {
    return false;
  }

  try {
    const result = await pool.query(
      `UPDATE pattern_reflections
       SET surfaced_count = surfaced_count + 1,
           last_surfaced_at = NOW(),
           updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [reflectionId, userId]
    );

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('[PatternReflection] Error marking as surfaced:', error);
    return false;
  }
}

/**
 * Get resonant patterns (user confirmed they resonate)
 */
export async function getResonantPatterns(userId: string): Promise<PatternReflection[]> {
  if (!pool) {
    return [];
  }

  try {
    const result = await pool.query(
      `SELECT * FROM pattern_reflections
       WHERE user_id = $1 AND user_response = 'resonates'
       ORDER BY responded_at DESC
       LIMIT 20`,
      [userId]
    );

    return result.rows.map(rowToReflection);
  } catch (error) {
    console.error('[PatternReflection] Error fetching resonant patterns:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════

function rowToReflection(row: Record<string, unknown>): PatternReflection {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    patternType: row.pattern_type as PatternType,
    insightText: row.insight_text as string,
    sourcePatterns: (row.source_patterns as string[]) || [],
    confidence: row.confidence as number,
    evidence: (row.evidence as PatternReflection['evidence']) || {},
    userResponse: row.user_response as PatternReflection['userResponse'],
    userNotes: row.user_notes as string | undefined,
    surfacedCount: row.surfaced_count as number,
    createdAt: row.created_at as Date,
  };
}
