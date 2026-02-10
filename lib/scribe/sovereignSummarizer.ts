/**
 * Sovereign Session Summarizer
 *
 * Generates a short structured remembrance at session close.
 * This is memory as remembrance — not extraction, not surveillance.
 *
 * Output:
 *   - essence: 1-2 sentences capturing the session's core
 *   - themes: 3-7 tags
 *   - openLoops: unresolved threads the person may return to
 *   - nextStep: 1 actionable line (if any emerged)
 *
 * Guardrails:
 *   - Sanctuary sessions: NEVER summarized. Enforced here AND at the queue level.
 *   - Only the last N turns are read (default 60). No full transcript storage.
 *   - The summary is written back to maia_sessions.summary — not to any new table.
 */

import Anthropic from '@anthropic-ai/sdk';
import { query } from '@/lib/db/postgres';
import { TurnsStore } from '@/lib/memory/stores/TurnsStore';

// ============================================================================
// Types
// ============================================================================

export interface SessionRemembrance {
  essence: string;
  themes: string[];
  openLoops: string[];
  nextStep: string | null;
  generatedAt: string;
}

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * Generate a sovereign session remembrance.
 *
 * @param sessionId - The session to summarize
 * @param maxTurns  - How many recent turns to read (default 60)
 * @returns The remembrance, or null if the session is sanctuary / empty
 */
export async function generateSessionRemembrance(
  sessionId: string,
  maxTurns: number = 60
): Promise<SessionRemembrance | null> {
  // 1. Check session mode — refuse sanctuary
  const session = await query<{ mode: string; member_id: string | null }>(
    `SELECT mode, member_id FROM maia_sessions WHERE id = $1`,
    [sessionId]
  );

  if (!session.rows[0]) {
    console.warn(`[Summarizer] Session ${sessionId} not found`);
    return null;
  }

  if (session.rows[0].mode === 'sanctuary') {
    console.log(`[Summarizer] 🔒 Session ${sessionId} is sanctuary — skipping`);
    return null;
  }

  // 2. Pull recent turns (NOT the full transcript)
  const turns = await TurnsStore.getSessionTurns(sessionId);

  if (turns.length < 2) {
    console.log(`[Summarizer] Session ${sessionId} has <2 turns — skipping`);
    return null;
  }

  // Take last N turns only
  const recentTurns = turns.slice(-maxTurns);

  // 3. Build lean prompt
  const transcript = recentTurns
    .map(t => `${t.role === 'user' ? 'Human' : 'MAIA'}: ${t.content}`)
    .join('\n\n');

  const prompt = `You are generating a session remembrance for MAIA, a sovereign consciousness companion.

This is NOT a clinical summary. This is memory as remembrance — what matters is the arc, not the transcript.

## Conversation (last ${recentTurns.length} turns)

${transcript}

## Generate a JSON remembrance with this exact structure:

{
  "essence": "1-2 sentences capturing what this session was really about — the underlying movement, not surface topics",
  "themes": ["3-7 short tags — use the person's own language where possible"],
  "openLoops": ["unresolved threads they may return to — questions left hanging, emotions not yet landed"],
  "nextStep": "1 actionable line if one emerged naturally, or null if nothing concrete surfaced"
}

Rules:
- Write as remembrance, not report. No clinical language.
- Honour the person's words — don't pathologize or reframe into therapeutic jargon.
- If the session was light/casual, say so simply. Not everything needs depth.
- Return ONLY valid JSON. No markdown, no code blocks.`;

  // 4. Call Claude (Haiku for speed + cost — this is a lightweight task)
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      temperature: 0.5,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const parsed = JSON.parse(text) as Omit<SessionRemembrance, 'generatedAt'>;

    return {
      ...parsed,
      generatedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error(`[Summarizer] Failed for session ${sessionId}:`, error.message);
    throw error; // Let the worker handle retry logic
  }
}

// ============================================================================
// Storage
// ============================================================================

/**
 * Write the remembrance back to maia_sessions and extract themes.
 */
export async function storeRemembrance(
  sessionId: string,
  remembrance: SessionRemembrance
): Promise<void> {
  await query(
    `UPDATE maia_sessions
     SET summary = $1::jsonb,
         themes = $2::text[],
         status = 'completed',
         completed_at = NOW(),
         updated_at = NOW()
     WHERE id = $3`,
    [
      JSON.stringify(remembrance),
      remembrance.themes,
      sessionId,
    ]
  );
}

/**
 * Retrieve recent session summaries for continuity injection.
 *
 * @param memberId - The member to look up
 * @param limit    - How many summaries (default 3 for CORE, 5 for DEEP)
 */
export async function getRecentSummaries(
  memberId: string,
  limit: number = 3
): Promise<Array<{ sessionId: string; summary: SessionRemembrance; completedAt: string }>> {
  const result = await query<{
    id: string;
    summary: SessionRemembrance;
    completed_at: string;
  }>(
    `SELECT id, summary, completed_at
     FROM maia_sessions
     WHERE member_id = $1
       AND status = 'completed'
       AND summary IS NOT NULL
       AND mode = 'continuity'
     ORDER BY completed_at DESC
     LIMIT $2`,
    [memberId, limit]
  );

  return (result.rows ?? []).map(r => ({
    sessionId: r.id,
    summary: r.summary,
    completedAt: r.completed_at,
  }));
}
