/**
 * MEANING TRACE DIGEST
 *
 * AIN's first collective intelligence layer.
 * Aggregates translation outcomes to learn "what helps when"
 * without storing private content.
 *
 * This is learning by application: the system learns from
 * how wisdom lands, not from what people say.
 */

import { query } from '../db/postgres';

// ==================== TYPES ====================

export interface SystemStyleStats {
  system: string;
  style: string;
  total: number;
  helpfulYes: number;
  helpfulNo: number;
  helpfulRate: number;
  copiedCount: number;
}

export interface ContextTagStats {
  tag: string;
  total: number;
  helpfulYes: number;
  helpfulRate: number;
  topSystem: string | null;
  topStyle: string | null;
}

export interface CalibratorCorrelation {
  directness: string | null;
  authority: string | null;
  time: string | null;
  community: string | null;
  total: number;
  helpfulRate: number;
}

export interface MeaningTraceDigest {
  generatedAt: string;
  period: {
    start: string;
    end: string;
    days: number;
  };
  summary: {
    totalTranslations: number;
    totalWithOutcome: number;
    overallHelpfulRate: number;
  };
  topHelpfulCombos: SystemStyleStats[];
  contextInsights: ContextTagStats[];
  calibratorPatterns: CalibratorCorrelation[];
}

// ==================== QUERIES ====================

/**
 * Query 1: Top helpful system + style combinations
 * "What doorways are working best?"
 */
async function getTopHelpfulCombos(
  daysBack: number = 30,
  minSamples: number = 3
): Promise<SystemStyleStats[]> {
  const result = await query<{
    system: string;
    style: string;
    total: string;
    helpful_yes: string;
    helpful_no: string;
    helpful_rate: string;
    copied_count: string;
  }>(
    `
    SELECT
      meta->>'toSystem' AS system,
      meta->>'style' AS style,
      COUNT(*) AS total,
      SUM(CASE WHEN (meta->'meaningTrace'->'outcome'->>'helpful')::boolean = true THEN 1 ELSE 0 END) AS helpful_yes,
      SUM(CASE WHEN (meta->'meaningTrace'->'outcome'->>'helpful')::boolean = false THEN 1 ELSE 0 END) AS helpful_no,
      ROUND(
        AVG(CASE WHEN (meta->'meaningTrace'->'outcome'->>'helpful')::boolean = true THEN 1.0
                 WHEN (meta->'meaningTrace'->'outcome'->>'helpful')::boolean = false THEN 0.0
                 ELSE NULL END)::numeric,
        2
      ) AS helpful_rate,
      SUM(CASE WHEN (meta->'meaningTrace'->'outcome'->>'copied')::boolean = true THEN 1 ELSE 0 END) AS copied_count
    FROM conversation_turns
    WHERE meta->>'kind' = 'translation'
      AND created_at > NOW() - INTERVAL '1 day' * $1
      AND meta->'meaningTrace'->'outcome' ? 'helpful'
    GROUP BY 1, 2
    HAVING COUNT(*) >= $2
    ORDER BY helpful_rate DESC NULLS LAST, total DESC
    LIMIT 20
    `,
    [daysBack, minSamples]
  );

  return (result.rows ?? []).map(row => ({
    system: row.system,
    style: row.style,
    total: parseInt(row.total, 10),
    helpfulYes: parseInt(row.helpful_yes, 10),
    helpfulNo: parseInt(row.helpful_no, 10),
    helpfulRate: parseFloat(row.helpful_rate) || 0,
    copiedCount: parseInt(row.copied_count, 10),
  }));
}

/**
 * Query 2: Context tag insights
 * "What's helpful when people feel [overwhelmed/grieving/etc]?"
 */
async function getContextTagInsights(
  daysBack: number = 30,
  minSamples: number = 2
): Promise<ContextTagStats[]> {
  const result = await query<{
    tag: string;
    total: string;
    helpful_yes: string;
    helpful_rate: string;
    top_system: string | null;
    top_style: string | null;
  }>(
    `
    WITH tag_outcomes AS (
      SELECT
        jsonb_array_elements_text(meta->'meaningTrace'->'contextTags') AS tag,
        meta->>'toSystem' AS system,
        meta->>'style' AS style,
        (meta->'meaningTrace'->'outcome'->>'helpful')::boolean AS helpful
      FROM conversation_turns
      WHERE meta->>'kind' = 'translation'
        AND created_at > NOW() - INTERVAL '1 day' * $1
        AND meta->'meaningTrace'->'contextTags' IS NOT NULL
        AND jsonb_array_length(meta->'meaningTrace'->'contextTags') > 0
    ),
    tag_stats AS (
      SELECT
        tag,
        COUNT(*) AS total,
        SUM(CASE WHEN helpful = true THEN 1 ELSE 0 END) AS helpful_yes,
        ROUND(AVG(CASE WHEN helpful = true THEN 1.0 WHEN helpful = false THEN 0.0 ELSE NULL END)::numeric, 2) AS helpful_rate
      FROM tag_outcomes
      GROUP BY tag
      HAVING COUNT(*) >= $2
    ),
    top_combos AS (
      SELECT DISTINCT ON (tag)
        tag,
        system AS top_system,
        style AS top_style
      FROM tag_outcomes
      WHERE helpful = true
      GROUP BY tag, system, style
      ORDER BY tag, COUNT(*) DESC
    )
    SELECT
      ts.tag,
      ts.total,
      ts.helpful_yes,
      ts.helpful_rate,
      tc.top_system,
      tc.top_style
    FROM tag_stats ts
    LEFT JOIN top_combos tc ON ts.tag = tc.tag
    ORDER BY ts.helpful_rate DESC NULLS LAST, ts.total DESC
    `,
    [daysBack, minSamples]
  );

  return (result.rows ?? []).map(row => ({
    tag: row.tag,
    total: parseInt(row.total, 10),
    helpfulYes: parseInt(row.helpful_yes, 10),
    helpfulRate: parseFloat(row.helpful_rate) || 0,
    topSystem: row.top_system,
    topStyle: row.top_style,
  }));
}

/**
 * Query 3: Calibrator correlations
 * "Which delivery preferences correlate with helpful outcomes?"
 */
async function getCalibratorPatterns(
  daysBack: number = 30,
  minSamples: number = 3
): Promise<CalibratorCorrelation[]> {
  const result = await query<{
    directness: string | null;
    authority: string | null;
    time_orientation: string | null;
    community: string | null;
    total: string;
    helpful_rate: string;
  }>(
    `
    SELECT
      meta->'meaningTrace'->'calibrators'->>'directness' AS directness,
      meta->'meaningTrace'->'calibrators'->>'authority' AS authority,
      meta->'meaningTrace'->'calibrators'->>'time' AS time_orientation,
      meta->'meaningTrace'->'calibrators'->>'community' AS community,
      COUNT(*) AS total,
      ROUND(
        AVG(CASE WHEN (meta->'meaningTrace'->'outcome'->>'helpful')::boolean = true THEN 1.0
                 WHEN (meta->'meaningTrace'->'outcome'->>'helpful')::boolean = false THEN 0.0
                 ELSE NULL END)::numeric,
        2
      ) AS helpful_rate
    FROM conversation_turns
    WHERE meta->>'kind' = 'translation'
      AND created_at > NOW() - INTERVAL '1 day' * $1
      AND meta->'meaningTrace'->'outcome' ? 'helpful'
      AND meta->'meaningTrace'->'calibrators' IS NOT NULL
    GROUP BY 1, 2, 3, 4
    HAVING COUNT(*) >= $2
    ORDER BY helpful_rate DESC NULLS LAST, total DESC
    LIMIT 15
    `,
    [daysBack, minSamples]
  );

  return (result.rows ?? []).map(row => ({
    directness: row.directness,
    authority: row.authority,
    time: row.time_orientation,
    community: row.community,
    total: parseInt(row.total, 10),
    helpfulRate: parseFloat(row.helpful_rate) || 0,
  }));
}

/**
 * Query 4: Summary stats
 */
async function getSummaryStats(daysBack: number = 30): Promise<{
  totalTranslations: number;
  totalWithOutcome: number;
  overallHelpfulRate: number;
}> {
  const result = await query<{
    total: string;
    with_outcome: string;
    helpful_rate: string;
  }>(
    `
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN meta->'meaningTrace'->'outcome' ? 'helpful' THEN 1 ELSE 0 END) AS with_outcome,
      ROUND(
        AVG(CASE WHEN (meta->'meaningTrace'->'outcome'->>'helpful')::boolean = true THEN 1.0
                 WHEN (meta->'meaningTrace'->'outcome'->>'helpful')::boolean = false THEN 0.0
                 ELSE NULL END)::numeric,
        2
      ) AS helpful_rate
    FROM conversation_turns
    WHERE meta->>'kind' = 'translation'
      AND created_at > NOW() - INTERVAL '1 day' * $1
    `,
    [daysBack]
  );

  const row = result.rows?.[0];
  return {
    totalTranslations: parseInt(row?.total ?? '0', 10),
    totalWithOutcome: parseInt(row?.with_outcome ?? '0', 10),
    overallHelpfulRate: parseFloat(row?.helpful_rate ?? '0') || 0,
  };
}

// ==================== MAIN FUNCTION ====================

/**
 * Generate a Meaning Trace Digest for the Community Commons
 *
 * This is AIN's first collective intelligence output:
 * aggregated patterns of "what helps when" without private content.
 */
export async function generateMeaningTraceDigest(
  daysBack: number = 30,
  minSamples: number = 3
): Promise<MeaningTraceDigest> {
  const now = new Date();
  const start = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

  const [summary, topCombos, contextInsights, calibratorPatterns] = await Promise.all([
    getSummaryStats(daysBack),
    getTopHelpfulCombos(daysBack, minSamples),
    getContextTagInsights(daysBack, Math.max(2, minSamples - 1)), // Lower threshold for tags
    getCalibratorPatterns(daysBack, minSamples),
  ]);

  return {
    generatedAt: now.toISOString(),
    period: {
      start: start.toISOString(),
      end: now.toISOString(),
      days: daysBack,
    },
    summary,
    topHelpfulCombos: topCombos,
    contextInsights,
    calibratorPatterns,
  };
}
