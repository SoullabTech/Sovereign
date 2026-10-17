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
import { evaluateSummaryEligibility, summaryProviderFixtureEnabled, summaryReadFixtureEnabled } from '@/lib/sanctuary/sessionSummaryEligibility';

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
// JSON Extraction Utility
// ============================================================================

/**
 * Extract the first complete JSON object from a string.
 *
 * More robust than regex fence-stripping:
 *   - Finds the first `{`
 *   - Tracks brace depth (skips braces inside strings)
 *   - Returns the slice from `{` to the matching `}`
 *   - Handles code fences, leading commentary, trailing text
 *
 * Returns null if no valid JSON object is found.
 */
function extractFirstJsonObject(text: string): string | null {
  const start = text.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }

  return null; // Unbalanced braces
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
  // Continuity is not a grant to use an external summarization provider.
  // No production/background approval has been ratified; direct callers hold.
  if (!summaryProviderFixtureEnabled()) return null;
  const session = await query<{ member_id: string | null }>(
    'SELECT member_id FROM maia_sessions WHERE id=$1',[sessionId],
  );
  const memberId = session.rows[0]?.member_id;
  if (!memberId) return null;
  const eligibility = await evaluateSummaryEligibility({
    sessionId, memberId, minimumTurns: 2, requireClosed: true,
  });
  if (!eligibility.ok) return null;

  // 2. Session-only turns require the stored, server-owned member identity.
  // Guest/null and historical unknown owner sessions cannot enter the member
  // remembrance pathway. No session-ID-only recall is permitted.
  const verifiedOwner = session.rows[0].member_id;
  if (!verifiedOwner) return null;
  const turns = await TurnsStore.getSessionTurns(sessionId, verifiedOwner);

  if (turns.length < 2) {
    console.log(`[Summarizer] Session ${sessionId} has <2 turns — skipping`);
    return null;
  }

  // Recheck after the content read and BEFORE building a cloud prompt.
  const beforeProvider = await evaluateSummaryEligibility({
    sessionId, memberId, minimumTurns: 2, requireClosed: true,
  });
  if (!beforeProvider.ok) return null;

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

    const raw = message.content[0].type === 'text' ? message.content[0].text : '';
    // Extract the first complete JSON object from the response.
    // Handles: bare JSON, ```json fences, extra commentary before/after.
    const text = extractFirstJsonObject(raw);
    if (!text) {
      throw new Error('SUMMARY_MODEL_RESULT_UNPARSEABLE');
    }
    const parsed = JSON.parse(text) as Omit<SessionRemembrance, 'generatedAt'>;

    return {
      ...parsed,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    // Vendor errors may echo member content. Do not log or propagate them.
    throw new Error('SUMMARY_PROVIDER_UNAVAILABLE');
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
  if (!summaryProviderFixtureEnabled()) throw new Error('SUMMARY_STORAGE_HELD');
  const owner = await query<{member_id:string|null}>(
    'SELECT member_id FROM maia_sessions WHERE id=$1',[sessionId],
  );
  const memberId=owner.rows[0]?.member_id;
  if (!memberId) throw new Error('SUMMARY_STORAGE_INELIGIBLE');
  const eligible=await evaluateSummaryEligibility({
    sessionId,memberId,minimumTurns:2,requireClosed:true,
  });
  if (!eligible.ok) throw new Error('SUMMARY_STORAGE_INELIGIBLE');
  const stored = await query<{id:string}>(
    `UPDATE maia_sessions
     SET summary = $1::jsonb,
         themes = $2::text[],
         status = 'completed',
         completed_at = NOW(),
         updated_at = NOW()
     WHERE id = $3 AND member_id=$4 AND mode='continuity'
       AND status IN ('closing','completed')
       AND NOT EXISTS (
         SELECT 1 FROM runtime_consent_state c
         WHERE c.session_id=$3 AND c.posture='sanctuary'
       )
     RETURNING id`,
    [
      JSON.stringify(remembrance),
      remembrance.themes,
      sessionId,
      memberId,
    ]
  );
  if (!stored.rows[0]) throw new Error('SUMMARY_STORAGE_GUARD_REFUSED');
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
  if (!summaryReadFixtureEnabled()) return [];
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
