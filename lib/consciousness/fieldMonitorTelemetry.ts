/**
 * Field Monitor Telemetry — Turn-level observability for MAIA's consciousness systems.
 *
 * ACTIVATES DORMANT SYSTEMS (previously built but never wired):
 *   1. therapeuticFrameworkTracker — Which therapeutic frameworks MAIA expressed
 *   2. ainResponseShape — AIN response shape (mirror/bridge/permission/nextStep)
 *   3. talkModeFieldIntelligence — Real-time field intelligence detection
 *   4. wisdomFieldMoves — Wisdom field selection
 *   5. response-quality-metrics — Response quality scoring
 *
 * Also captures:
 *   - Which memory layers contributed
 *   - Diversity scoring and mono-modal collapse detection
 *   - PFI mind state (when enabled via env flags)
 *
 * Architecture: Fire-and-forget (Bridge D pattern)
 *   - Returns void, not Promise — prevents accidental await
 *   - All DB writes wrapped in .catch() — never blocks oracle
 *   - Graceful degradation if table doesn't exist
 *
 * Philosophy: "We don't store what she said. We observe how she's thinking."
 *
 * Table: field_monitor_turns (see migrations/025_field_monitor_turns.sql)
 */

import { query } from '@/lib/db/postgres';
import { analyzeTherapeuticFrameworks } from '@/lib/consciousness/therapeuticFrameworkTracker';
import { assessAINResponseShape } from '@/lib/ai/quality/ainResponseShape';
import { analyzeFieldIntelligence } from '@/lib/maia/talkModeFieldIntelligence';
import { selectWisdomField } from '@/lib/maia/wisdomFieldMoves';
import { getQualityMonitor } from '@/lib/maia/response-quality-metrics';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface FieldMonitorParams {
  memberId: string;
  sessionId?: string;
  route: 'oracle' | 'stream';
  responseText: string;
  userMessage: string;
  element?: string;
  phase?: number;
  motion?: string;
  voiceMode?: string;
  relationalStance?: string;
  processingPath?: string;
  memoryContext?: any;           // from memoryPalaceOrchestrator
  activeFrameworks?: string[];   // already computed in oracle route
  conversationHistory?: any[];   // for field intelligence analysis
  pfiMindState?: any;            // PFI mind state when enabled
}

/**
 * What the Memory Palace contributed to this turn — or an explicit statement
 * that it did not run.
 *
 * M1.5: the five flags describe MemoryPalaceOrchestrator. Routes that never
 * invoke it (voice/stream-conversation uses MemoryBundleService instead) were
 * previously reported as five `false` values, which read as five observations
 * about memory. They were not observations at all: `detectMemoryLayerHits`
 * short-circuits when no palace context is supplied, so `false` was structurally
 * guaranteed and carried no information. The `not_run` variant says the true
 * thing instead — the question was not asked on this route.
 */
export type MemoryLayerHits =
  | { palace: 'not_run'; reason: string }
  | {
      palace: 'ran';
      episodic: boolean;
      somatic: boolean;
      morphic: boolean;
      semantic: boolean;
      session: boolean;
    };

// ═══════════════════════════════════════════════════════════════
// 1. Fire-and-Forget Entry Point
// ═══════════════════════════════════════════════════════════════

/**
 * Record field monitor telemetry for this turn.
 *
 * Returns void (not Promise) to prevent accidental await.
 * Like spiralStatePersistence.upsertSpiralState: NEVER blocks oracle response.
 */
export function fireAndForgetFieldMonitor(params: FieldMonitorParams): void {
  // Run analysis and insert in the background
  _processAndInsert(params).catch((error) => {
    // Swallow — field monitor should never break oracle response
    console.warn('[field-monitor] Telemetry failed (non-critical):', {
      memberId: params.memberId,
      route: params.route,
      error: error instanceof Error ? error.message : String(error),
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// 2. Internal Processing
// ═══════════════════════════════════════════════════════════════

async function _processAndInsert(params: FieldMonitorParams): Promise<void> {
  const {
    memberId,
    sessionId,
    route,
    responseText,
    userMessage,
    element,
    phase,
    motion,
    voiceMode,
    relationalStance,
    processingPath,
    memoryContext,
  } = params;

  // Skip if no response text to analyze
  if (!responseText || responseText.trim().length < 10) {
    return;
  }

  // ─── Therapeutic Framework Analysis (activates DORMANT tracker) ───
  let frameworkAnalysis;
  try {
    frameworkAnalysis = analyzeTherapeuticFrameworks(responseText, userMessage);
  } catch (err) {
    console.warn('[field-monitor] Framework analysis failed:', err instanceof Error ? err.message : err);
    frameworkAnalysis = null;
  }

  // ─── AIN Response Shape Evaluation (activates DORMANT evaluator) ───
  let ainShape;
  try {
    ainShape = assessAINResponseShape(userMessage, responseText);
  } catch (err) {
    console.warn('[field-monitor] AIN shape evaluation failed:', err instanceof Error ? err.message : err);
    ainShape = null;
  }

  // ─── Memory Layer Hits ───
  const memoryLayerHits = detectMemoryLayerHits(memoryContext);
  // Counted explicitly, NOT via Object.values(...).filter(Boolean): the
  // `not_run` variant's own fields are truthy strings, and counting them would
  // manufacture layer hits out of a statement that no layer was consulted.
  const memoryLayerCount = countMemoryLayerHits(memoryLayerHits);

  // ─── Framework metrics ───
  const frameworksDetected = frameworkAnalysis?.frameworks
    ?.filter((f) => f.confidence >= 0.3)
    ?.map((f) => ({ framework: f.framework, confidence: f.confidence })) ?? [];
  const primaryFramework = frameworkAnalysis?.primaryFramework ?? null;
  const frameworkCount = frameworksDetected.length;
  const integrationScore = frameworkAnalysis?.integrationScore ?? null;

  // ─── Diversity Score ───
  // unique frameworks detected / 15 possible, weighted by avg confidence
  const diversityScore = computeDiversityScore(frameworksDetected);

  // ─── Mono-modal Collapse Detection ───
  const monoModalAlert = await checkMonoModalCollapse(memberId, primaryFramework);

  // ─── Field Intelligence (activates DORMANT talkModeFieldIntelligence) ───
  let fieldIntelligence: any = null;
  let wisdomField: string | null = null;
  let userState: string | null = null;
  let spiralScale: string | null = null;
  try {
    fieldIntelligence = analyzeFieldIntelligence(userMessage, params.conversationHistory);
    userState = fieldIntelligence?.userState ?? null;
    spiralScale = fieldIntelligence?.spiralScale ?? null;

    // Use field intelligence to select wisdom field (activates DORMANT wisdomFieldMoves)
    wisdomField = selectWisdomField({
      element: fieldIntelligence?.element ?? element,
      phase: fieldIntelligence?.phase,
      userState: fieldIntelligence?.userState,
      complexity: fieldIntelligence?.complexity,
    });
  } catch (err) {
    console.warn('[field-monitor] Field intelligence failed:', err instanceof Error ? err.message : err);
  }

  // ─── Response Quality Metrics (activates DORMANT response-quality-metrics) ───
  let qualityScore: number | null = null;
  try {
    const monitor = getQualityMonitor();
    const metrics = monitor.recordInteraction(
      userMessage,
      responseText,
      memberId,
      sessionId ?? 'unknown',
      0, // We don't have exact response time here; telemetry runs post-hoc
    );
    // Quality scores are nested under metrics.quality
    const qBrief = metrics?.quality?.briefnessScore;
    const qEnergy = metrics?.quality?.energyMatch;
    qualityScore = typeof qBrief === 'number' && typeof qEnergy === 'number'
      ? (qBrief + qEnergy) / 2
      : qBrief ?? qEnergy ?? null;
  } catch (err) {
    console.warn('[field-monitor] Quality metrics failed:', err instanceof Error ? err.message : err);
  }

  // ─── PFI Mind State (when enabled via MAIA_PFI_MIND env flag) ───
  const pfi = params.pfiMindState;
  const pfiRealm = pfi?.realm ?? null;
  const pfiCoherence = pfi?.coherenceLevel ?? null;
  const pfiFieldWorkSafe = pfi?.fieldWorkSafe ?? null;

  // ─── INSERT ───
  const sql = `
    INSERT INTO field_monitor_turns (
      member_id, session_id, route,
      element, phase, motion,
      frameworks_detected, primary_framework, framework_count, integration_score,
      ain_pass, ain_score, ain_mirror, ain_bridge, ain_permission, ain_next_step,
      memory_layers_hit, memory_layer_count,
      voice_mode, relational_stance, processing_path,
      diversity_score, mono_modal_alert,
      field_intelligence, wisdom_field, user_state, spiral_scale,
      quality_score,
      pfi_realm, pfi_coherence, pfi_field_work_safe, pfi_signals
    ) VALUES (
      $1, $2, $3,
      $4, $5, $6,
      $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16,
      $17, $18,
      $19, $20, $21,
      $22, $23,
      $24, $25, $26, $27,
      $28,
      $29, $30, $31, $32
    )
  `;

  const values = [
    memberId,
    sessionId ?? null,
    route,
    element ?? null,
    phase ?? null,
    motion ?? null,
    JSON.stringify(frameworksDetected),
    primaryFramework,
    frameworkCount,
    integrationScore,
    ainShape?.pass ?? null,
    ainShape?.score ?? null,
    ainShape?.flags?.mirror ?? null,
    ainShape?.flags?.bridge ?? null,
    ainShape?.flags?.permission ?? null,
    ainShape?.flags?.nextStep ?? null,
    JSON.stringify(memoryLayerHits),
    memoryLayerCount,
    voiceMode ?? null,
    relationalStance ?? null,
    processingPath ?? null,
    diversityScore,
    monoModalAlert,
    fieldIntelligence ? JSON.stringify(fieldIntelligence) : null,
    wisdomField,
    userState,
    spiralScale,
    qualityScore,
    pfiRealm,
    pfiCoherence,
    pfiFieldWorkSafe,
    pfi ? JSON.stringify(pfi) : null,
  ];

  await query(sql, values);

  // Observability log (structured, not verbose)
  console.info('[field-monitor]', {
    memberId: memberId.slice(0, 8) + '...',
    route,
    frameworks: frameworkCount,
    primary: primaryFramework,
    ainPass: ainShape?.pass,
    ainScore: ainShape?.score,
    memoryLayers: memoryLayerCount,
    palace: memoryLayerHits.palace,
    diversity: diversityScore,
    alert: monoModalAlert,
    wisdomField,
    userState,
    pfiRealm,
    qualityScore,
  });
}

// ═══════════════════════════════════════════════════════════════
// 3. Helper Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Detect which of the 5 memory palace layers contributed to this turn.
 * Inspects the memoryContext object returned by MemoryPalaceOrchestrator.
 */
export function detectMemoryLayerHits(memoryContext: any): MemoryLayerHits {
  if (!memoryContext) {
    // No palace context reached this call, so no palace layer was consulted.
    // Reporting five `false` flags here would state five findings we never made.
    return { palace: 'not_run', reason: 'route_does_not_invoke_palace' };
  }

  return {
    palace: 'ran',
    episodic: Boolean(
      memoryContext.significantEpisodes &&
      (Array.isArray(memoryContext.significantEpisodes) ? memoryContext.significantEpisodes.length > 0 : true)
    ),
    somatic: Boolean(
      memoryContext.somaticPatterns &&
      (Array.isArray(memoryContext.somaticPatterns) ? memoryContext.somaticPatterns.length > 0 : true)
    ),
    morphic: Boolean(
      memoryContext.activePatterns &&
      (Array.isArray(memoryContext.activePatterns) ? memoryContext.activePatterns.length > 0 : true)
    ),
    semantic: Boolean(
      memoryContext.evolutionStatus && memoryContext.evolutionStatus !== null
    ),
    session: Boolean(
      memoryContext.sessionMemory && memoryContext.sessionMemory !== null
    ),
  };
}

/**
 * Number of palace layers that actually contributed.
 *
 * Returns 0 for `not_run`. The DB column is `integer NOT NULL DEFAULT 0`
 * (verified against production 2026-08-28), so NULL cannot distinguish
 * "not applicable" from "none hit" — and no migration is authorized in this
 * cut. The disambiguation therefore lives in `memory_layers_hit.palace`, which
 * must be read alongside this count. Recorded as a known residual ambiguity.
 */
export function countMemoryLayerHits(hits: MemoryLayerHits): number {
  if (hits.palace === 'not_run') return 0;
  return [hits.episodic, hits.somatic, hits.morphic, hits.semantic, hits.session]
    .filter(Boolean).length;
}

/**
 * Compute framework diversity score.
 * Range: 0.00 (no frameworks) to 1.00 (all 15 active with high confidence).
 */
function computeDiversityScore(
  frameworks: Array<{ framework: string; confidence: number }>
): number {
  if (frameworks.length === 0) return 0;

  const TOTAL_POSSIBLE = 15;
  const uniqueCount = new Set(frameworks.map((f) => f.framework)).size;
  const avgConfidence =
    frameworks.reduce((sum, f) => sum + f.confidence, 0) / frameworks.length;

  // Weighted: 70% breadth (how many unique frameworks), 30% depth (avg confidence)
  const breadth = uniqueCount / TOTAL_POSSIBLE;
  const score = breadth * 0.7 + avgConfidence * 0.3;

  return Math.round(score * 100) / 100; // 2 decimal places
}

/**
 * Check if MAIA is stuck in mono-modal collapse.
 * Returns true if the same primary_framework appeared in the last 3 turns.
 */
async function checkMonoModalCollapse(
  memberId: string,
  currentPrimary: string | null
): Promise<boolean> {
  if (!currentPrimary) return false;

  try {
    const result = await query<{ primary_framework: string }>(
      `SELECT primary_framework
       FROM field_monitor_turns
       WHERE member_id = $1 AND primary_framework IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 2`,
      [memberId]
    );

    if (result.rows.length < 2) return false;

    // All 3 turns (2 previous + current) have same primary framework
    return result.rows.every((row) => row.primary_framework === currentPrimary);
  } catch {
    // Graceful fallback — don't block on collapse detection
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// 4. Query Helpers (for Admin API)
// ═══════════════════════════════════════════════════════════════

export interface FieldMonitorTurn {
  id: number;
  created_at: string;
  member_id: string;
  session_id: string | null;
  route: string;
  element: string | null;
  phase: number | null;
  motion: string | null;
  frameworks_detected: Array<{ framework: string; confidence: number }>;
  primary_framework: string | null;
  framework_count: number;
  integration_score: number | null;
  ain_pass: boolean | null;
  ain_score: number | null;
  ain_mirror: boolean | null;
  ain_bridge: boolean | null;
  ain_permission: boolean | null;
  ain_next_step: boolean | null;
  memory_layers_hit: MemoryLayerHits;
  memory_layer_count: number;
  voice_mode: string | null;
  relational_stance: string | null;
  processing_path: string | null;
  diversity_score: number | null;
  mono_modal_alert: boolean;
}

/**
 * Get recent field monitor turns for the admin dashboard.
 */
export async function getRecentFieldMonitorTurns(options: {
  limit?: number;
  memberId?: string;
  alertsOnly?: boolean;
}): Promise<FieldMonitorTurn[]> {
  const { limit = 50, memberId, alertsOnly = false } = options;
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (memberId) {
    conditions.push(`member_id = $${paramIndex}`);
    params.push(memberId);
    paramIndex++;
  }

  if (alertsOnly) {
    conditions.push('mono_modal_alert = true');
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await query<FieldMonitorTurn>(
    `SELECT * FROM field_monitor_turns ${where} ORDER BY created_at DESC LIMIT $${paramIndex}`,
    [...params, limit]
  );

  return result.rows;
}

/**
 * Get summary stats for the admin dashboard.
 */
export async function getFieldMonitorSummary(options: {
  sinceDays?: number;
}): Promise<{
  totalTurns: number;
  frameworkDistribution: Record<string, number>;
  ainPassRate: number;
  avgDiversity: number;
  alertCount: number;
  memoryLayerCoverage: Record<string, number>;
  avgAinScore: number;
}> {
  const { sinceDays = 7 } = options;

  try {
    // Total turns and averages
    const statsResult = await query<{
      total: number;
      pass_count: number;
      avg_diversity: number;
      alert_count: number;
      avg_ain_score: number;
    }>(
      `SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE ain_pass = true)::int as pass_count,
        COALESCE(AVG(diversity_score), 0)::numeric(3,2) as avg_diversity,
        COUNT(*) FILTER (WHERE mono_modal_alert = true)::int as alert_count,
        COALESCE(AVG(ain_score), 0)::numeric(3,2) as avg_ain_score
      FROM field_monitor_turns
      WHERE created_at > now() - interval '1 day' * $1`,
      [sinceDays]
    );

    const stats = statsResult.rows[0] || {
      total: 0,
      pass_count: 0,
      avg_diversity: 0,
      alert_count: 0,
      avg_ain_score: 0,
    };

    // Framework distribution
    const fwResult = await query<{ framework: string; count: number }>(
      `SELECT
        f->>'framework' as framework,
        COUNT(*)::int as count
      FROM field_monitor_turns,
        jsonb_array_elements(frameworks_detected) as f
      WHERE created_at > now() - interval '1 day' * $1
      GROUP BY f->>'framework'
      ORDER BY count DESC`,
      [sinceDays]
    );

    const frameworkDistribution: Record<string, number> = {};
    for (const row of fwResult.rows) {
      frameworkDistribution[row.framework] = row.count;
    }

    // Memory layer coverage
    const mlResult = await query<{
      episodic: number;
      somatic: number;
      morphic: number;
      semantic: number;
      session: number;
    }>(
      `SELECT
        COUNT(*) FILTER (WHERE (memory_layers_hit->>'episodic')::boolean = true)::int as episodic,
        COUNT(*) FILTER (WHERE (memory_layers_hit->>'somatic')::boolean = true)::int as somatic,
        COUNT(*) FILTER (WHERE (memory_layers_hit->>'morphic')::boolean = true)::int as morphic,
        COUNT(*) FILTER (WHERE (memory_layers_hit->>'semantic')::boolean = true)::int as semantic,
        COUNT(*) FILTER (WHERE (memory_layers_hit->>'session')::boolean = true)::int as session
      FROM field_monitor_turns
      WHERE created_at > now() - interval '1 day' * $1`,
      [sinceDays]
    );

    const ml = mlResult.rows[0] || { episodic: 0, somatic: 0, morphic: 0, semantic: 0, session: 0 };

    return {
      totalTurns: Number(stats.total),
      frameworkDistribution,
      ainPassRate: stats.total > 0 ? Number(stats.pass_count) / Number(stats.total) : 0,
      avgDiversity: Number(stats.avg_diversity),
      alertCount: Number(stats.alert_count),
      memoryLayerCoverage: {
        episodic: Number(ml.episodic),
        somatic: Number(ml.somatic),
        morphic: Number(ml.morphic),
        semantic: Number(ml.semantic),
        session: Number(ml.session),
      },
      avgAinScore: Number(stats.avg_ain_score),
    };
  } catch (error) {
    console.error('[field-monitor] Summary query failed:', error);
    return {
      totalTurns: 0,
      frameworkDistribution: {},
      ainPassRate: 0,
      avgDiversity: 0,
      alertCount: 0,
      memoryLayerCoverage: {},
      avgAinScore: 0,
    };
  }
}
