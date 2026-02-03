/**
 * InsightGenerator - MAIA Practice Supervision Insight Engine
 *
 * Generates world-specific insights from session transcripts using local LLM.
 * HIPAA-compliant: uses only local Ollama/DeepSeek, never external APIs.
 */

import { query } from '@/lib/db/postgres';
import { safeGenerateWithLocalModel, SafeLocalModelResult } from '@/lib/ai/safe-local-model';
import { getSession, getTranscriptSegments } from './PracticeStore';
import { getWorld, getWorldByCode } from './WorldsStore';
import { buildWorldInsightPrompt, getWorldPrompts, type WorldPromptModule } from './worlds';

export interface GeneratedInsight {
  id: string;
  session_id: string;
  world_id: string;
  world_code: string;
  insight_type: string;
  content: string;
  segment_refs: string[];
  significance: number;
  model_used: string;
  source: 'local-model' | 'consciousness-engine' | 'emergency-fallback';
  processing_time_ms: number;
  created_at: Date;
}

export interface InsightGenerationParams {
  sessionId: string;
  worldCode: string;
  insightType: string;
  practitionerContext?: string;
  segmentRange?: {
    startMs?: number;
    endMs?: number;
  };
}

export interface InsightGenerationResult {
  success: boolean;
  insight?: GeneratedInsight;
  error?: string;
  modelInfo?: {
    source: string;
    processingTimeMs: number;
  };
}

/**
 * Generate a world-specific insight from session transcript
 */
export async function generateInsight(
  params: InsightGenerationParams
): Promise<InsightGenerationResult> {
  const startTime = Date.now();

  try {
    // 1. Get session
    const session = await getSession(params.sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    // 2. Get world (by code)
    const world = await getWorldByCode(params.worldCode);
    if (!world) {
      return { success: false, error: `World not found: ${params.worldCode}` };
    }

    // 3. Get world prompt module
    const worldPrompts = getWorldPrompts(params.worldCode);
    if (!worldPrompts) {
      return {
        success: false,
        error: `World prompts not implemented for: ${params.worldCode}. Available: somatic, parts_ifs, jungian, attachment`
      };
    }

    // 4. Verify insight type exists for this world
    const insightPrompt = worldPrompts.insightPrompts[params.insightType];
    if (!insightPrompt) {
      const availableTypes = Object.keys(worldPrompts.insightPrompts);
      return {
        success: false,
        error: `Insight type '${params.insightType}' not found for ${params.worldCode}. Available: ${availableTypes.join(', ')}`
      };
    }

    // 5. Get transcript segments
    const segments = await getTranscriptSegments(params.sessionId, {
      limit: 100,
      afterMs: params.segmentRange?.startMs,
    });

    if (segments.length === 0) {
      return { success: false, error: 'No transcript segments found for session' };
    }

    // Filter by endMs if specified
    const filteredSegments = params.segmentRange?.endMs
      ? segments.filter(s => s.start_ms <= params.segmentRange!.endMs!)
      : segments;

    // 6. Build transcript text
    const transcriptText = filteredSegments
      .map(s => `[${formatTime(s.start_ms)}] ${s.speaker}: ${s.text}`)
      .join('\n');

    // 7. Build the full prompt using world module
    const fullPrompt = buildWorldInsightPrompt({
      worldCode: params.worldCode,
      insightType: params.insightType,
      transcript: transcriptText,
      practitionerContext: params.practitionerContext
    });

    if (!fullPrompt) {
      return { success: false, error: 'Failed to build insight prompt' };
    }

    // 8. Generate insight using local model (HIPAA-compliant - never external)
    const modelResult = await safeGenerateWithLocalModel({
      systemPrompt: buildMentorSystemPrompt(worldPrompts, params.insightType),
      userInput: fullPrompt,
      meta: {
        sessionId: params.sessionId,
        worldCode: params.worldCode,
        insightType: params.insightType
      }
    });

    // 9. Extract segment references (timestamps mentioned in response)
    const segmentRefs = extractSegmentReferences(modelResult.content, filteredSegments);

    // 10. Calculate significance (heuristic based on content)
    const significance = calculateSignificance(modelResult.content, insightPrompt);

    // 11. Store the insight
    const storedInsight = await storeInsight({
      sessionId: params.sessionId,
      worldId: world.id,
      worldCode: world.code,
      insightType: params.insightType,
      content: modelResult.content,
      segmentRefs,
      significance,
      modelUsed: `${modelResult.source}:${modelResult.metadata.provider || 'unknown'}`,
      processingTimeMs: Date.now() - startTime
    });

    return {
      success: true,
      insight: storedInsight,
      modelInfo: {
        source: modelResult.source,
        processingTimeMs: modelResult.metadata.processingTime
      }
    };

  } catch (error) {
    console.error('[InsightGenerator] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error generating insight'
    };
  }
}

/**
 * Generate all available insights for a world
 */
export async function generateAllInsightsForWorld(
  sessionId: string,
  worldCode: string,
  practitionerContext?: string
): Promise<{
  success: boolean;
  insights: GeneratedInsight[];
  errors: string[];
}> {
  const worldPrompts = getWorldPrompts(worldCode);
  if (!worldPrompts) {
    return { success: false, insights: [], errors: [`World not found: ${worldCode}`] };
  }

  const insightTypes = Object.keys(worldPrompts.insightPrompts);
  const insights: GeneratedInsight[] = [];
  const errors: string[] = [];

  for (const insightType of insightTypes) {
    const result = await generateInsight({
      sessionId,
      worldCode,
      insightType,
      practitionerContext
    });

    if (result.success && result.insight) {
      insights.push(result.insight);
    } else if (result.error) {
      errors.push(`${insightType}: ${result.error}`);
    }
  }

  return {
    success: insights.length > 0,
    insights,
    errors
  };
}

/**
 * Get existing insights for a session
 */
export async function getSessionInsights(
  sessionId: string,
  opts?: { worldCode?: string; insightType?: string }
): Promise<GeneratedInsight[]> {
  let whereClause = 'WHERE pi.session_id = $1';
  const values: unknown[] = [sessionId];
  let paramIndex = 2;

  if (opts?.worldCode) {
    whereClause += ` AND w.code = $${paramIndex++}`;
    values.push(opts.worldCode);
  }

  if (opts?.insightType) {
    whereClause += ` AND pi.insight_type = $${paramIndex++}`;
    values.push(opts.insightType);
  }

  const result = await query<GeneratedInsight & { code: string }>(`
    SELECT pi.*, w.code as world_code
    FROM practice_insights pi
    JOIN practice_worlds w ON w.id = pi.world_id
    ${whereClause}
    ORDER BY pi.created_at DESC
  `, values);

  return result.rows.map(row => ({
    ...row,
    world_code: row.code
  }));
}

// ============ HELPER FUNCTIONS ============

function buildMentorSystemPrompt(world: WorldPromptModule, insightType: string): string {
  const insightPrompt = world.insightPrompts[insightType];

  return `You are MAIA, a clinical supervisor and mentor for practitioners.

${world.voice.introduction}

Your task is to provide ONE specific, helpful insight based on the transcript provided.

Guidelines:
- Speak directly to the practitioner as a supportive mentor
- Reference specific moments from the transcript (with timestamps when helpful)
- Be concrete and actionable, not abstract
- Use "${world.voice.noticing}" to frame observations
- End with "${world.voice.invitation}" energy - invite curiosity, not prescription
- Keep your response focused - 2-4 paragraphs maximum
- Write as if speaking to a colleague you respect

${insightPrompt.systemContext}

Example of the tone and depth we want:
${insightPrompt.exampleOutput}`;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function extractSegmentReferences(
  content: string,
  segments: Array<{ id: string; start_ms: number }>
): string[] {
  const refs: string[] = [];
  const timePattern = /(\d+):(\d{2})/g;
  let match;

  while ((match = timePattern.exec(content)) !== null) {
    const mentionedMs = (parseInt(match[1]) * 60 + parseInt(match[2])) * 1000;

    // Find closest segment
    const closest = segments.reduce((prev, curr) => {
      return Math.abs(curr.start_ms - mentionedMs) < Math.abs(prev.start_ms - mentionedMs)
        ? curr
        : prev;
    });

    if (Math.abs(closest.start_ms - mentionedMs) < 30000) { // Within 30 seconds
      if (!refs.includes(closest.id)) {
        refs.push(closest.id);
      }
    }
  }

  return refs;
}

function calculateSignificance(content: string, insightPrompt: { exampleOutput: string }): number {
  // Heuristic: longer, more detailed insights are more significant
  const lengthScore = Math.min(content.length / 500, 0.4); // Up to 0.4 for length

  // Check for specific elements
  const hasTimestamp = /\d+:\d{2}/.test(content);
  const hasQuote = content.includes('"');
  const hasQuestion = content.includes('?');
  const hasInvitation = /what if|might|could|consider|wonder/i.test(content);

  let score = 0.3; // Base score
  score += lengthScore;
  score += hasTimestamp ? 0.1 : 0;
  score += hasQuote ? 0.1 : 0;
  score += hasQuestion ? 0.05 : 0;
  score += hasInvitation ? 0.05 : 0;

  return Math.min(Math.round(score * 100) / 100, 1.0);
}

async function storeInsight(params: {
  sessionId: string;
  worldId: string;
  worldCode: string;
  insightType: string;
  content: string;
  segmentRefs: string[];
  significance: number;
  modelUsed: string;
  processingTimeMs: number;
}): Promise<GeneratedInsight> {
  const result = await query<GeneratedInsight>(`
    INSERT INTO practice_insights (
      session_id, world_id, insight_type, content,
      segment_refs, significance, model_used, processing_time_ms
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [
    params.sessionId,
    params.worldId,
    params.insightType,
    params.content,
    params.segmentRefs,
    params.significance,
    params.modelUsed,
    params.processingTimeMs
  ]);

  return {
    ...result.rows[0],
    world_code: params.worldCode,
    source: params.modelUsed.split(':')[0] as GeneratedInsight['source']
  };
}
