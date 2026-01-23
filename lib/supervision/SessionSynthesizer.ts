/**
 * Session Synthesizer
 *
 * Generates Fathom-like session essence from supervision transcripts.
 * Uses LOCAL LLM for all processing - no external APIs (HIPAA safe).
 *
 * Called on session end to produce the "Scribe Note" - the canonical record.
 * Supports healers, astrologers, counselors, coaches, couples, and therapists.
 */

import { query, queryOne } from '@/lib/db/postgres';
import { safeGenerateWithLocalModel } from '@/lib/ai/safe-local-model';
import type { TranscriptSegment, SupervisionInsight } from './SupervisionStore';

export interface EssenceSummary {
  title: string;
  coreInsight: string;
  themes: string[];
  goldLines: Array<{
    speaker: string;
    text: string;
    timestampMs?: number;
  }>;
  turningPoints: Array<{
    timestampMs: number;
    whatShifted: string;
  }>;
  spiralMovement: string;
  elementalSignature: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  nextSteps: string[];
  practices: string[];
  supervisionFocus: {
    ruptureRepair: string | null;
    countertransference: string | null;
    interventions: string[];
    consultQuestions: string[];
  };
  synthesizedAt: string;
  version: number;
}

// Prompt for local model essence extraction
const ESSENCE_EXTRACTION_PROMPT = `You are MAIA, a consciousness companion synthesizing the essence of a session.

Analyze this session transcript and extract its core essence. This could be:
- A therapy or counseling session
- A healing or energy work session
- An astrological reading
- A coaching conversation
- A couples dialogue
- A peer consultation

Focus on what MATTERED, not just what was said.

TRANSCRIPT:
{{TRANSCRIPT}}

Return ONLY valid JSON matching this structure:
{
  "title": "Evocative 3-7 word title capturing the session's spirit",
  "coreInsight": "The central breakthrough, realization, or theme in 2-3 sentences",
  "themes": ["Theme 1", "Theme 2", "Theme 3"],
  "goldLines": [
    { "speaker": "who said it", "text": "Verbatim quote that landed deeply" }
  ],
  "turningPoints": [
    { "description": "What shifted at this moment" }
  ],
  "spiralMovement": "Which elemental energies were present (fire/water/earth/air/aether) and how they moved",
  "elementalSignature": {
    "fire": 0.0-1.0,
    "water": 0.0-1.0,
    "earth": 0.0-1.0,
    "air": 0.0-1.0,
    "aether": 0.0-1.0
  },
  "nextSteps": ["Action or intention that emerged"],
  "practices": ["Practice or exercise to continue"],
  "tldr": "One sentence capturing the session in plain language"
}

Guidelines:
- Capture the SPIRIT, not just content
- Preserve the person's own language in gold lines
- Name patterns softly, with warmth (no pathology)
- Honor decisions and commitments made
- Keep it human and meaningful`;

/**
 * Extract essence using local LLM (HIPAA safe, no external APIs)
 */
async function extractEssenceWithLocalModel(conversationText: string): Promise<{
  title?: string;
  coreInsight?: string;
  themes?: string[];
  goldLines?: Array<{ speaker?: string; text: string }>;
  turningPoints?: Array<{ description: string }>;
  spiralMovement?: string;
  elementalSignature?: { fire: number; water: number; earth: number; air: number; aether: number };
  nextSteps?: string[];
  practices?: string[];
  tldr?: string;
} | null> {
  try {
    const prompt = ESSENCE_EXTRACTION_PROMPT.replace('{{TRANSCRIPT}}', conversationText);

    const result = await safeGenerateWithLocalModel({
      systemPrompt: 'You are MAIA, a consciousness companion. Return only valid JSON.',
      userInput: prompt,
      fallbackToSimple: false
    });

    if (!result.successful || result.source === 'emergency-fallback') {
      return null;
    }

    // Parse JSON from response
    let jsonStr = result.content.trim();

    // Strip DeepSeek thinking blocks (they use <think>...</think>)
    jsonStr = jsonStr.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // Handle markdown code blocks
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    // Find JSON object
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      jsonStr = objectMatch[0];
    }

    return JSON.parse(jsonStr);
  } catch (e) {
    console.warn('[SessionSynthesizer] Local model essence extraction failed:', e);
    return null;
  }
}

/**
 * Generate session essence from transcript + insights
 */
export async function synthesizeSession(
  sessionId: string,
  transcript: TranscriptSegment[],
  insights: SupervisionInsight[]
): Promise<EssenceSummary> {
  // Convert transcript to conversation format
  const conversationText = transcript
    .sort((a, b) => a.start_ms - b.start_ms)
    .map(seg => `[${seg.speaker}]: ${seg.text}`)
    .join('\n');

  // Run essence extraction with local model
  const essenceResult = await extractEssenceWithLocalModel(conversationText);

  // Extract supervision-specific insights
  const ruptureInsights = insights.filter(i => i.insight_type === 'rupture' || i.insight_type === 'stuck_point');
  const countertransferenceInsights = insights.filter(i => i.insight_type === 'countertransference');
  const interventionInsights = insights.filter(i => i.insight_type === 'intervention');
  const attunementInsights = insights.filter(i => i.insight_type === 'attunement');
  const patternInsights = insights.filter(i => i.insight_type === 'pattern');

  // Build gold lines from transcript (find substantial moments)
  const goldLines = transcript
    .filter(seg => seg.text.length > 50)
    .slice(0, 5)
    .map(seg => ({
      speaker: seg.speaker,
      text: seg.text.slice(0, 200),
      timestampMs: seg.start_ms
    }));

  // Merge with extracted gold lines if available
  if (essenceResult?.goldLines) {
    essenceResult.goldLines.forEach(gl => {
      if (!goldLines.find(g => g.text === gl.text)) {
        goldLines.push({
          speaker: gl.speaker || 'unknown',
          text: gl.text,
          timestampMs: undefined
        });
      }
    });
  }

  // Build turning points from extracted data
  const turningPoints = (essenceResult?.turningPoints || []).map((tp, idx) => ({
    timestampMs: Math.floor((idx + 1) * (transcript[transcript.length - 1]?.end_ms || 0) / 3),
    whatShifted: tp.description
  }));

  // Build themes from extracted themes only (patterns are in supervisionFocus)
  const themes = (essenceResult?.themes || [])
    .filter(t => typeof t === 'string' && t.length < 50) // Filter out leaked content
    .slice(0, 5);

  // Build the essence summary
  const essence: EssenceSummary = {
    title: essenceResult?.title || 'Session Reflection',
    coreInsight: essenceResult?.coreInsight || '',
    themes,
    goldLines: goldLines.slice(0, 5),
    turningPoints,
    spiralMovement: essenceResult?.spiralMovement || '',
    elementalSignature: essenceResult?.elementalSignature || {
      fire: 0.2,
      water: 0.2,
      earth: 0.2,
      air: 0.2,
      aether: 0.2
    },
    nextSteps: essenceResult?.nextSteps || [],
    practices: essenceResult?.practices || [],
    supervisionFocus: {
      ruptureRepair: ruptureInsights.length > 0
        ? ruptureInsights[0].content.slice(0, 500)
        : null,
      countertransference: countertransferenceInsights.length > 0
        ? countertransferenceInsights[0].content.slice(0, 500)
        : null,
      interventions: interventionInsights.slice(0, 2).map(i => i.content.slice(0, 300)),
      consultQuestions: attunementInsights
        .filter(i => i.content.includes('?'))
        .slice(0, 3)
        .map(i => i.content.slice(0, 200))
    },
    synthesizedAt: new Date().toISOString(),
    version: 1
  };

  return essence;
}

/**
 * Save essence summary to supervision_sessions table
 */
export async function saveEssenceSummary(
  sessionId: string,
  essence: EssenceSummary
): Promise<void> {
  await query(`
    UPDATE supervision_sessions
    SET
      essence_summary = $1::jsonb,
      essence_finalized_at = NOW()
    WHERE id = $2
  `, [JSON.stringify(essence), sessionId]);

  console.log(`📝 [SessionSynthesizer] Saved essence for session ${sessionId}`);
}

/**
 * Get essence summary for a session
 */
export async function getEssenceSummary(
  sessionId: string
): Promise<EssenceSummary | null> {
  const result = await queryOne<{ essence_summary: EssenceSummary | null }>(`
    SELECT essence_summary FROM supervision_sessions WHERE id = $1
  `, [sessionId]);

  return result?.essence_summary || null;
}

/**
 * Full synthesis pipeline - call this from session stop
 */
export async function runSessionSynthesis(sessionId: string): Promise<EssenceSummary | null> {
  try {
    // Get transcript
    const transcriptResult = await query<TranscriptSegment>(`
      SELECT * FROM supervision_transcript_segments
      WHERE session_id = $1
      ORDER BY start_ms ASC
    `, [sessionId]);

    const transcript = transcriptResult.rows;

    if (transcript.length === 0) {
      console.log(`[SessionSynthesizer] No transcript for session ${sessionId}`);
      return null;
    }

    // Get insights
    const insightsResult = await query<SupervisionInsight>(`
      SELECT * FROM supervision_insights
      WHERE session_id = $1
      ORDER BY created_at ASC
    `, [sessionId]);

    const insights = insightsResult.rows;

    // Synthesize
    const essence = await synthesizeSession(sessionId, transcript, insights);

    // Save
    await saveEssenceSummary(sessionId, essence);

    return essence;

  } catch (error) {
    console.error(`[SessionSynthesizer] Error synthesizing session ${sessionId}:`, error);
    return null;
  }
}
