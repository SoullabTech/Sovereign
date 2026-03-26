/**
 * MAIA Practitioner Prep Generator
 *
 * Generates a short preparation brief from client intake fields.
 * Called once per session (on first detail load), then persisted.
 *
 * Constraints:
 * - summary: ≤ 2 sentences
 * - tone: 2-4 words
 * - stance: 1 actionable sentence
 * - No symbolic overinterpretation
 * - Support, not replacement
 */

import Anthropic from '@anthropic-ai/sdk';
import db from '@/lib/db/postgres';

interface IntakeData {
  presentingIssue: string | null;
  focusArea: string | null;
  desiredOutcome: string | null;
}

interface PractitionerPrep {
  summary: string;
  tone: string;
  stance: string;
  keywords: string[];
}

const PREP_PROMPT = `You are a clinical preparation assistant supporting a practitioner before a session.

Given the client's intake, generate a brief preparation note.

Rules:
- summary: 1-2 sentences max. Describe what the client is bringing and what seems most alive.
- tone: 2-4 words describing the emotional quality you sense (e.g., "anxious but open", "guarded, searching", "emotionally activated").
- stance: 1 sentence. A concrete suggestion for how the practitioner might begin (e.g., "Begin by helping them name what feels unstable." or "Let them speak first—listen for emotional pattern before intervention.").
- keywords: 3-5 single words capturing the core themes.

Do NOT:
- Over-interpret or psychoanalyze
- Use spiritual or symbolic language
- Generate long narratives
- Try to be wise or profound

This is preparation, not oracle. Be direct and useful.

Respond in valid JSON only. No markdown, no explanation.`;

export async function generatePractitionerPrep(
  sessionId: string,
  intake: IntakeData
): Promise<PractitionerPrep | null> {
  // Don't generate if there's nothing to work with
  if (!intake.presentingIssue && !intake.focusArea && !intake.desiredOutcome) {
    return null;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('[PractitionerPrep] ANTHROPIC_API_KEY not configured');
    return null;
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const userMessage = [
      intake.presentingIssue && `What brings them here: ${intake.presentingIssue}`,
      intake.focusArea && `Primary focus area: ${intake.focusArea}`,
      intake.desiredOutcome && `What they hope to gain: ${intake.desiredOutcome}`,
    ].filter(Boolean).join('\n');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: PREP_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';

    // Parse JSON response
    const prep: PractitionerPrep = JSON.parse(text.trim());

    // Validate shape
    if (!prep.summary || !prep.tone || !prep.stance) {
      console.warn('[PractitionerPrep] Invalid response shape:', text);
      return null;
    }

    // Persist to session (fire-and-forget)
    db.query(
      `UPDATE sessions SET practitioner_prep = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(prep), sessionId]
    ).catch(err => console.error('[PractitionerPrep] Failed to persist:', err));

    return prep;
  } catch (error) {
    console.error('[PractitionerPrep] Generation failed:', error);
    return null;
  }
}
