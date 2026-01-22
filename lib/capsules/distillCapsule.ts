/**
 * Distillation Engine
 *
 * Converts a text window (from chat, voice, journal) into a Capsule draft.
 * Uses Claude to distill the "spirit" of the conversation.
 *
 * Philosophy: MAIA witnesses experience and remembers what mattered.
 * The distillation captures essence, not raw history.
 */

import { generateWithClaude } from '@/lib/ai/claudeClient';
import type { CapsuleDraft, ChatMessage, Signals } from './types';

// =============================================================================
// DISTILLATION PROMPT
// =============================================================================

const DISTILLATION_SYSTEM_PROMPT = `You are MAIA, a consciousness companion helping distill the spirit of a conversation.

Your task is to create a "Reflection Capsule" - a distilled artifact that captures what mattered in this exchange.

PHILOSOPHY:
- Capture the spirit, not the transcript
- Preserve verbatim gold lines - the moments that landed
- Name patterns softly, with warmth (no pathology, no diagnosis)
- Honor decisions and commitments made
- Note practices that emerged naturally

OUTPUT FORMAT:
Return ONLY valid JSON matching this exact structure:
{
  "title": "Brief, evocative title (3-7 words)",
  "summary": "The essence of what mattered - 2-5 sentences that capture the spirit",
  "goldLines": [
    { "text": "Exact quote that landed", "speaker": "user" },
    { "text": "Another meaningful moment", "speaker": "maia" }
  ],
  "decisions": [
    { "text": "A decision that was made" }
  ],
  "nextSteps": [
    { "text": "Something they committed to", "due": "optional timeframe" }
  ],
  "practices": [
    { "name": "A practice that emerged", "steps": ["Step 1", "Step 2"] }
  ],
  "patterns": [
    { "name": "A pattern noticed", "description": "Soft description" }
  ],
  "signals": {
    "element": "fire|water|earth|air|aether",
    "tone": "emotional tone of the exchange",
    "archetype": "optional archetype if relevant"
  },
  "tags": ["relevant", "tags"]
}

GUIDELINES:
- goldLines: Select 1-3 verbatim quotes that were moments of clarity, breakthrough, or deep feeling
- decisions: Extract explicit decisions made ("I decided...", "I'm going to...")
- nextSteps: Concrete actions committed to (not just ideas mentioned)
- practices: Only include if a specific practice was discussed or agreed upon
- patterns: Name softly - "A tendency toward...", "A recurring theme of..." (never "You always..." or clinical terms)
- signals.element: Choose based on energy (fire=action/passion, water=emotion/flow, earth=grounding/structure, air=thought/clarity, aether=transcendence/integration)
- tags: 2-5 relevant tags, lowercase

IMPORTANT:
- If arrays would be empty, use empty arrays []
- Do not include fields that aren't present
- Keep the summary warm and non-clinical
- Preserve the person's own language in gold lines
- Return ONLY the JSON, no commentary before or after`;

// =============================================================================
// DISTILLATION FUNCTION
// =============================================================================

export interface DistillContext {
  sourceType?: string;
  existingTags?: string[];
  memberName?: string;
}

/**
 * Distill a text window into a Capsule draft using Claude
 */
export async function distillCapsuleFromText(
  text: string,
  context?: DistillContext
): Promise<CapsuleDraft> {
  // If text is very short, create a simple heuristic draft
  if (text.length < 100) {
    return createHeuristicDraft(text, context);
  }

  try {
    const result = await generateWithClaude({
      systemPrompt: DISTILLATION_SYSTEM_PROMPT,
      userInput: `Distill the spirit of this ${context?.sourceType || 'conversation'}:\n\n${text}`,
      meta: {
        mode: 'distill',
        reasoningMode: 'analysis', // Use Opus for analysis tasks
      },
    });

    // Parse JSON response
    const parsed = parseDistillationResponse(result.text);

    // Validate and normalize
    return normalizeDistillationOutput(parsed);
  } catch (error) {
    console.error('[distillCapsule] Claude distillation failed:', error);

    // Fallback to heuristic draft
    return createHeuristicDraft(text, context);
  }
}

/**
 * Distill from chat messages (converts to text window first)
 */
export async function distillCapsuleFromChatWindow(
  messages: ChatMessage[],
  windowSize: number = 16,
  context?: DistillContext
): Promise<CapsuleDraft> {
  // Take last N messages
  const window = messages.slice(-windowSize);

  // Convert to readable text
  const text = window
    .map((m) => {
      const speaker = m.role === 'user' ? 'You' : 'MAIA';
      return `${speaker}: ${m.content}`;
    })
    .join('\n\n');

  return distillCapsuleFromText(text, {
    ...context,
    sourceType: 'chat',
  });
}

// =============================================================================
// PARSING & VALIDATION
// =============================================================================

/**
 * Parse Claude's response, handling potential JSON issues
 */
function parseDistillationResponse(response: string): Partial<CapsuleDraft> {
  // Try to extract JSON from response
  let jsonStr = response.trim();

  // Handle markdown code blocks
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  // Try to find JSON object
  const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    jsonStr = objectMatch[0];
  }

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.warn('[distillCapsule] JSON parse failed, attempting repair...');

    // Attempt basic repair: escape unescaped newlines in strings
    try {
      const repaired = jsonStr.replace(/(?<!\\)\\n/g, '\\n');
      return JSON.parse(repaired);
    } catch {
      throw new Error('Failed to parse distillation response');
    }
  }
}

/**
 * Normalize and validate distillation output
 */
function normalizeDistillationOutput(parsed: Partial<CapsuleDraft>): CapsuleDraft {
  return {
    title: parsed.title || 'Untitled Reflection',
    summary: parsed.summary || 'A moment worth remembering.',
    goldLines: Array.isArray(parsed.goldLines) ? parsed.goldLines : [],
    decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
    nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
    practices: Array.isArray(parsed.practices) ? parsed.practices : [],
    patterns: Array.isArray(parsed.patterns) ? parsed.patterns : [],
    signals: parsed.signals || undefined,
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
  };
}

// =============================================================================
// HEURISTIC FALLBACK
// =============================================================================

/**
 * Create a simple draft without LLM (fallback or for short text)
 */
function createHeuristicDraft(text: string, context?: DistillContext): CapsuleDraft {
  const lines = text.split('\n').filter((l) => l.trim());

  // Extract potential gold line (first substantive line)
  const firstLine = lines.find((l) => l.length > 20) || lines[0] || text.slice(0, 100);

  // Create title from first words
  const titleWords = text.split(/\s+/).slice(0, 5).join(' ');
  const title = titleWords.length > 30 ? titleWords.slice(0, 27) + '...' : titleWords;

  // Simple summary
  const summary = text.length > 200
    ? text.slice(0, 197) + '...'
    : text;

  // Detect potential decisions
  const decisions = lines
    .filter((l) => /\b(i decided|i'm going to|i will|i've decided)\b/i.test(l))
    .map((l) => ({ text: l.trim() }))
    .slice(0, 3);

  // Detect potential next steps
  const nextSteps = lines
    .filter((l) => /\b(i'll try|i will do|next step|going to try)\b/i.test(l))
    .map((l) => ({ text: l.trim() }))
    .slice(0, 3);

  return {
    title: title || 'Untitled',
    summary,
    goldLines: firstLine ? [{ text: firstLine.slice(0, 200) }] : [],
    decisions,
    nextSteps,
    practices: [],
    patterns: [],
    tags: context?.existingTags || [],
  };
}

// =============================================================================
// GENERATE SOURCE EXCERPT
// =============================================================================

/**
 * Create a collapsed source excerpt from messages
 */
export function generateSourceExcerpt(
  messages: ChatMessage[],
  maxLength: number = 1000
): string {
  const text = messages
    .map((m) => {
      const speaker = m.role === 'user' ? 'You' : 'MAIA';
      return `${speaker}: ${m.content}`;
    })
    .join('\n\n');

  if (text.length <= maxLength) {
    return text;
  }

  // Truncate in the middle, keeping start and end
  const halfLength = Math.floor((maxLength - 30) / 2);
  return `${text.slice(0, halfLength)}\n\n[...]\n\n${text.slice(-halfLength)}`;
}
