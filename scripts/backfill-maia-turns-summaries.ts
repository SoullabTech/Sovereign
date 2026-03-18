#!/usr/bin/env ts-node
/**
 * Backfill Session Summaries from maia_turns
 *
 * maia_turns is the legacy active conversation store (168k rows, 121 sessions).
 * The new summary pipeline reads from conversation_turns, so these sessions
 * have never been summarized — MAIA has amnesia about everything before the pipeline.
 *
 * This script:
 *   1. Finds sessions in maia_turns that have a member_id and no summary
 *   2. Creates maia_sessions rows for any that are missing
 *   3. Generates a session remembrance directly from the maia_turns transcript
 *   4. Stores the summary back to maia_sessions
 *
 * Design notes:
 *   - Reads maia_turns directly (not via TurnsStore — different schema)
 *   - maia_turns has paired rows: user_text + maia_text in one row
 *   - Sanctuary check: any session with mode='sanctuary' is skipped
 *   - Dry run mode: --dry-run flag shows what would be processed without writing
 *   - Rate limited: 1 summary per 2 seconds (Claude Haiku)
 *
 * Usage:
 *   npx ts-node scripts/backfill-maia-turns-summaries.ts
 *   npx ts-node scripts/backfill-maia-turns-summaries.ts --dry-run
 *   npx ts-node scripts/backfill-maia-turns-summaries.ts --limit 10
 *
 * Sovereignty invariant:
 *   Sanctuary sessions NEVER summarized.
 *   Anonymous sessions (no member_id) NEVER summarized — no context to attach to.
 */

import Anthropic from '@anthropic-ai/sdk';
import { query } from '../lib/db/postgres';
import { storeRemembrance, type SessionRemembrance } from '../lib/scribe/sovereignSummarizer';
import { assertCorrectDb } from '../lib/scripts/dbSafetyGuard';

// ============================================================================
// Config
// ============================================================================

const MAX_TURNS_PER_SESSION = 60;
const RATE_LIMIT_MS = 2000;
const DRY_RUN = process.argv.includes('--dry-run');

const limitArg = process.argv.find(a => a.startsWith('--limit='));
const MAX_SESSIONS = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

// ============================================================================
// Types
// ============================================================================

interface MaiaTurn {
  session_id: string;
  turn_index: number;
  user_text: string;
  maia_text: string;
  created_at: string;
}

interface SessionCandidate {
  session_id: string;
  member_id: string;
  turn_count: number;
  first_turn: string;
  last_turn: string;
  has_maia_sessions_row: boolean;
}

// ============================================================================
// Discovery
// ============================================================================

async function findUnsummarizedSessions(): Promise<SessionCandidate[]> {
  // Find sessions in maia_turns with member_id, >= 2 turns, no summary yet
  const result = await query<{
    session_id: string;
    member_id: string;
    turn_count: string;
    first_turn: string;
    last_turn: string;
    has_maia_sessions_row: boolean;
    is_sanctuary: boolean;
  }>(
    `
    SELECT
      mt.session_id,
      ms.member_id,
      COUNT(mt.id)::text as turn_count,
      MIN(mt.created_at)::text as first_turn,
      MAX(mt.created_at)::text as last_turn,
      (ms.id IS NOT NULL) as has_maia_sessions_row,
      (ms.mode = 'sanctuary') as is_sanctuary
    FROM maia_turns mt
    JOIN maia_sessions ms ON ms.id = mt.session_id
    WHERE ms.member_id IS NOT NULL
      AND (ms.summary IS NULL OR ms.summary = 'null'::jsonb)
      AND (ms.mode IS NULL OR ms.mode != 'sanctuary')
      AND ms.status NOT IN ('closing', 'completed')
    GROUP BY mt.session_id, ms.id, ms.member_id, ms.mode
    HAVING COUNT(mt.id) >= 2
    ORDER BY MIN(mt.created_at) DESC
    `,
    []
  );

  return (result.rows ?? []).map(r => ({
    session_id: r.session_id,
    member_id: r.member_id,
    turn_count: parseInt(r.turn_count, 10),
    first_turn: r.first_turn,
    last_turn: r.last_turn,
    has_maia_sessions_row: r.has_maia_sessions_row,
  }));
}

// ============================================================================
// Transcript builder (maia_turns format → text)
// ============================================================================

async function buildTranscriptFromMaiaTurns(
  sessionId: string,
  maxTurns: number
): Promise<string> {
  const result = await query<MaiaTurn>(
    `
    SELECT session_id, turn_index, user_text, maia_text, created_at
    FROM maia_turns
    WHERE session_id = $1
    ORDER BY turn_index ASC
    LIMIT $2
    `,
    [sessionId, maxTurns]
  );

  const turns = result.rows ?? [];
  if (turns.length === 0) return '';

  // maia_turns has paired rows — each row is one exchange
  return turns
    .map(t => `Human: ${t.user_text}\n\nMAIA: ${t.maia_text}`)
    .join('\n\n');
}

// ============================================================================
// Summary generation (inline — reads from transcript string directly)
// ============================================================================

async function generateRemembranceFromTranscript(
  transcript: string,
  turnCount: number
): Promise<SessionRemembrance | null> {
  if (!transcript.trim()) return null;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `You are generating a session remembrance for MAIA, a sovereign consciousness companion.

This is NOT a clinical summary. This is memory as remembrance — what matters is the arc, not the transcript.

## Conversation (${turnCount} exchanges)

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

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    temperature: 0.5,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '';
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  const parsed = JSON.parse(text) as Omit<SessionRemembrance, 'generatedAt'>;

  return { ...parsed, generatedAt: new Date().toISOString() };
}

// ============================================================================
// Session row upsert
// ============================================================================

async function ensureMaiaSessionRow(
  sessionId: string,
  memberId: string,
  firstTurn: string,
  lastTurn: string
): Promise<void> {
  await query(
    `
    INSERT INTO maia_sessions (id, member_id, mode, status, started_at, last_activity_at, created_at, updated_at)
    VALUES ($1, $2, 'continuity', 'active', $3::timestamptz, $4::timestamptz, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING
    `,
    [sessionId, memberId, firstTurn, lastTurn]
  );
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  await assertCorrectDb();

  console.log(`\n[Backfill] ${DRY_RUN ? '🔍 DRY RUN — ' : ''}Starting maia_turns backfill`);
  console.log(`[Backfill] Max sessions: ${MAX_SESSIONS === Infinity ? 'unlimited' : MAX_SESSIONS}`);

  const candidates = await findUnsummarizedSessions();

  if (candidates.length === 0) {
    console.log('[Backfill] ✅ No sessions to backfill. All caught up.');
    process.exit(0);
  }

  const toProcess = candidates.slice(0, MAX_SESSIONS === Infinity ? undefined : MAX_SESSIONS);
  console.log(`[Backfill] Found ${candidates.length} sessions to process. Working on ${toProcess.length}.`);

  let succeeded = 0;
  let skipped = 0;
  let failed = 0;

  for (const session of toProcess) {
    console.log(`\n[Backfill] → ${session.session_id}`);
    console.log(`           member: ${session.member_id.slice(0, 8)}... | turns: ${session.turn_count} | from: ${session.first_turn.slice(0, 10)}`);

    if (DRY_RUN) {
      console.log('           [DRY RUN] Would process this session');
      skipped++;
      continue;
    }

    try {
      // Ensure maia_sessions row exists
      if (!session.has_maia_sessions_row) {
        await ensureMaiaSessionRow(
          session.session_id,
          session.member_id,
          session.first_turn,
          session.last_turn
        );
      }

      // Build transcript
      const transcript = await buildTranscriptFromMaiaTurns(
        session.session_id,
        MAX_TURNS_PER_SESSION
      );

      if (!transcript) {
        console.log('           ⏭️  Empty transcript — skipping');
        skipped++;
        continue;
      }

      // Generate remembrance
      const remembrance = await generateRemembranceFromTranscript(
        transcript,
        Math.min(session.turn_count, MAX_TURNS_PER_SESSION)
      );

      if (!remembrance) {
        console.log('           ⏭️  No remembrance generated — skipping');
        skipped++;
        continue;
      }

      // Store
      await storeRemembrance(session.session_id, remembrance);

      console.log(`           ✅ "${remembrance.essence.slice(0, 80)}..."`);
      succeeded++;

      // Rate limit
      await new Promise(r => setTimeout(r, RATE_LIMIT_MS));

    } catch (err: any) {
      console.error(`           ❌ Failed: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n[Backfill] Done. succeeded=${succeeded} skipped=${skipped} failed=${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('[Backfill] Fatal:', err);
  process.exit(1);
});
