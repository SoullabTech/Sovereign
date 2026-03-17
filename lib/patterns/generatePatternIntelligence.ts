/**
 * Pattern Intelligence Generator
 *
 * Event-driven, single-write generation of humane pattern descriptions
 * and transformational invitations.
 *
 * Called fire-and-forget after a pattern crosses the threshold:
 *   confidence >= 0.6 AND recurrence_count >= 2
 *
 * Design:
 * - Row-level lock prevents concurrent generation
 * - Single write, never re-generates (stability = trust)
 * - Inline fallback: safe to call on fetch if description is missing
 * - Fails silently — never blocks oracle or UI
 *
 * Language principles (from spiral-patterns-spec.md):
 * - Provisional: "this movement has been appearing"
 * - Contextual: "this seems to arise especially when..."
 * - Developmental: tied to phase/context, not identity
 * - Never diagnostic: no "you are someone who..."
 */

import Anthropic from '@anthropic-ai/sdk';
import { query, queryOne } from '@/lib/db/postgres';

const GENERATION_THRESHOLD_CONFIDENCE = 0.6;
const GENERATION_THRESHOLD_RECURRENCE = 2;

const SCOPE_LABELS: Record<string, string> = {
  relationship:      'relationships and connection',
  work:              'work and vocation',
  somatic:           'body and nervous system',
  spiritual:         'spiritual life',
  recurring_trigger: 'recurring situations',
  theme:             'inner life',
};

interface PatternRow {
  id: string;
  statement: string;
  scope: string;
  confidence: number;
  recurrence_count: number;
  first_seen_at: Date;
  last_evidence_at: Date;
}

// ═══════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════

/**
 * Fire-and-forget trigger. Call after pattern upsert — never await.
 * Only proceeds if pattern meets threshold and lacks a description.
 */
export function schedulePatternGeneration(patternId: string): void {
  _generate(patternId).catch((err) => {
    console.error('[PatternGen] failed for', patternId, err?.message ?? err);
  });
}

/**
 * Inline fallback. Call when fetching a pattern that has no description
 * but already meets threshold. Awaitable but safe to fire-and-forget.
 */
export async function generateIfMissing(patternId: string): Promise<void> {
  try {
    await _generate(patternId);
  } catch (err) {
    console.error('[PatternGen] inline fallback failed for', patternId, err);
  }
}

// ═══════════════════════════════════════════════════════════════
// Core
// ═══════════════════════════════════════════════════════════════

async function _generate(patternId: string): Promise<void> {
  // Acquire row-level lock — prevents concurrent generation
  const locked = await queryOne<{ id: string }>(
    `UPDATE pattern_ledger
     SET generation_lock = true, generation_status = 'generating'
     WHERE id = $1
       AND (generation_lock IS NULL OR generation_lock = false)
       AND description IS NULL
       AND confidence >= $2
       AND recurrence_count >= $3
     RETURNING id`,
    [patternId, GENERATION_THRESHOLD_CONFIDENCE, GENERATION_THRESHOLD_RECURRENCE]
  );

  if (!locked) return; // Already generating, already has description, or below threshold

  const pattern = await queryOne<PatternRow>(
    `SELECT id, statement, scope, confidence, recurrence_count, first_seen_at, last_evidence_at
     FROM pattern_ledger WHERE id = $1`,
    [patternId]
  );

  if (!pattern) {
    await _releaseLock(patternId, 'failed');
    return;
  }

  try {
    const { description, invitation } = await _callMaia(pattern);

    await query(
      `UPDATE pattern_ledger
       SET description        = $1,
           integration_prompt = $2,
           generation_status  = 'complete',
           generation_lock    = false,
           generated_at       = now()
       WHERE id = $3`,
      [description, invitation, patternId]
    );

    console.log('[PatternGen] complete for', patternId);
  } catch (err) {
    await _releaseLock(patternId, 'failed');
    throw err;
  }
}

async function _releaseLock(patternId: string, status: 'failed' | 'pending'): Promise<void> {
  await query(
    `UPDATE pattern_ledger SET generation_status = $1, generation_lock = false WHERE id = $2`,
    [status, patternId]
  ).catch(() => {});
}

// ═══════════════════════════════════════════════════════════════
// MAIA generation call
// ═══════════════════════════════════════════════════════════════

async function _callMaia(
  pattern: PatternRow
): Promise<{ description: string; invitation: string }> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' });

  const scopeLabel = SCOPE_LABELS[pattern.scope] ?? pattern.scope;
  const dateWindow = _formatDateWindow(pattern.first_seen_at, pattern.last_evidence_at);

  const prompt = `You are MAIA — a consciousness companion grounded in Spiralogic. You witness recurring movements in people's lives without diagnosing or defining them.

A recurring movement has appeared for someone you've been in conversation with. Write exactly two things, in this order:

1. DESCRIPTION (Air — clarity)
One or two sentences. Specific. Grounded in observable reality. Temporally anchored — mention that this has appeared more than once, over time. Must be immediately recognizable without requiring interpretation. A tired person should understand it in 5 seconds.

Good example: "This movement has appeared several times recently — a pull to take on more at the moment when you're already stretched, often when saying no would create tension with someone else."
Bad example: "A pattern of overextension is emerging through relational dynamics." (abstract, useless)

Never: "you are," "your pattern," diagnostic labels, mystical language, or cognitive abstraction.

2. INVITATION (Earth — activation)
One question. Answerable in the body, not just the mind. Grounded in a real moment or choice point. Not theory. Not advice in disguise. Creates a slight shift in behavior or awareness when held.

Good example: "The next time you feel that pull, can you notice what your body does just before you agree?"
Bad example: "How might you establish healthier boundaries?" (abstract instruction disguised as a question)

The question must relate to lived experience, not concept.

Pattern data:
- Movement: "${pattern.statement}"
- Life domain: ${scopeLabel}
- Instances: ${pattern.recurrence_count} over ${dateWindow}

Respond with JSON only — no other text:
{"description": "...", "invitation": "..."}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '{}';

  // Strip markdown code fences if model wraps JSON
  const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  const parsed = JSON.parse(clean) as { description?: string; invitation?: string };

  if (!parsed.description || !parsed.invitation) {
    throw new Error('[PatternGen] incomplete response from model');
  }

  return { description: parsed.description, invitation: parsed.invitation };
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function _formatDateWindow(first: Date, last: Date): string {
  const days = Math.round((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 2) return 'recent sessions';
  if (days < 14) return `${days} days`;
  return `${Math.round(days / 7)} weeks`;
}
