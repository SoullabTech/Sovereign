/**
 * GET /api/guidance/insight?featureKey=studio.field
 *
 * Guide Whisper — dynamic, member-centric contextual insight.
 *
 * 1. Computes a context snapshot for this member + feature:
 *    - recent process items (type, title, age)
 *    - field captures count
 *    - guidance signal history (how often they've opened this trigger)
 *
 * 2. Generates a 1-2 sentence "whisper" via Haiku (fast).
 *
 * 3. Falls back to static tooltip if no context or AI unavailable.
 *
 * Privacy: No conversation content is read. Only structural counts
 * and process item titles are used. Sanctuary sessions are excluded
 * from signal queries.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import type { GuideInsightResponse, GuideWhisper, WhisperAction } from '@/lib/guidance/types';

export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

// ---------------------------------------------------------------------------
// Context snapshot queries
// ---------------------------------------------------------------------------

interface ContextSnapshot {
  /** Recent active process items (max 5) */
  processItems: Array<{
    type: string;
    title: string;
    days_ago: number;
    element: string | null;
  }>;
  /** Counts by process item type */
  typeCounts: Record<string, number>;
  /** How many field captures total */
  captureCount: number;
  /** How many times this member opened this feature's trigger (last 30d) */
  triggerOpens: number;
  /** Days since last trigger open, or null if never */
  daysSinceLastOpen: number | null;
  /** How many process items are "ripening" (>14 days old, still active) */
  ripeningCount: number;
}

async function buildContextSnapshot(
  memberId: string,
  featureKey: string,
): Promise<ContextSnapshot> {
  // Run queries in parallel
  const [processResult, captureResult, signalResult] = await Promise.all([
    // Recent active process items
    query(
      `SELECT type, title, element,
         EXTRACT(DAY FROM NOW() - created_at)::int AS days_ago
       FROM process_items
       WHERE member_id = $1
         AND state NOT IN ('composted', 'integrated', 'grounded', 'answered_for_now')
       ORDER BY created_at DESC
       LIMIT 5`,
      [memberId],
    ),
    // Field captures count
    query(
      `SELECT COUNT(*)::int AS count FROM field_records WHERE user_id = $1`,
      [memberId],
    ),
    // Trigger open signals for this feature (last 30d)
    query(
      `SELECT
         COUNT(*)::int AS opens,
         EXTRACT(DAY FROM NOW() - MAX(created_at))::int AS days_since_last
       FROM guidance_signals
       WHERE member_id = $1
         AND feature_key = $2
         AND signal_type IN ('tooltip_open', 'whisper_served')
         AND created_at >= NOW() - INTERVAL '30 days'`,
      [memberId, featureKey],
    ),
  ]);

  const processItems = processResult.rows.map((r: any) => ({
    type: r.type,
    title: r.title,
    days_ago: r.days_ago ?? 0,
    element: r.element,
  }));

  // Count by type
  const typeCounts: Record<string, number> = {};
  for (const item of processItems) {
    typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
  }

  // Items older than 14 days that are still active = "ripening"
  const ripeningCount = processItems.filter((i) => i.days_ago >= 14).length;

  return {
    processItems,
    typeCounts,
    captureCount: captureResult.rows[0]?.count ?? 0,
    triggerOpens: signalResult.rows[0]?.opens ?? 0,
    daysSinceLastOpen: signalResult.rows[0]?.days_since_last ?? null,
    ripeningCount,
  };
}

// ---------------------------------------------------------------------------
// Whisper generation
// ---------------------------------------------------------------------------

/** Feature-specific context descriptions for the system prompt */
const FEATURE_CONTEXT: Record<string, string> = {
  'studio.field': 'The Field is their living orientation space — where they see what is alive, what moved, and what wants attention. They can Capture raw experiences or Name what is emerging (as a challenge, change, decision, breakthrough, question, or next edge).',
  'oracle.iching': 'The Changes space uses I Ching wisdom to help navigate life transitions. Members cast hexagrams and receive guidance about shifting conditions.',
  'maia.sanctuary': 'Sanctuary Mode makes the current session present-tense only — nothing stored, no memory formed. It exists so people can speak freely without their words entering the system.',
};

function buildWhisperPrompt(
  featureKey: string,
  ctx: ContextSnapshot,
): string {
  const featureDesc = FEATURE_CONTEXT[featureKey] || `This feature (${featureKey}) is part of the Soullab platform.`;

  const lines: string[] = [];

  // Process items summary
  if (ctx.processItems.length > 0) {
    lines.push('Active process items:');
    for (const item of ctx.processItems) {
      lines.push(`  - ${item.type}: "${item.title}" (${item.days_ago}d ago${item.element ? `, ${item.element}` : ''})`);
    }
  } else {
    lines.push('No active process items.');
  }

  lines.push(`Field captures: ${ctx.captureCount}`);
  lines.push(`Times this trigger opened (30d): ${ctx.triggerOpens}`);
  if (ctx.ripeningCount > 0) {
    lines.push(`Ripening items (>14d active): ${ctx.ripeningCount}`);
  }

  return lines.join('\n');
}

const WHISPER_SYSTEM = `You are a gentle guide presence within a sovereignty-centered platform called Soullab. You generate brief, contextual whispers — never instructions, never analysis, never diagnosis.

Your whisper is shown inside a small tooltip next to a feature the member just tapped. It should:
- Be 1-2 sentences, max 25 words
- Reflect what you notice about their movement (returns, avoidances, ripening questions, unnamed things)
- Offer a gentle observation or question, not a command
- Never reference "data", "patterns", "analytics", or system internals
- Never use the word "journey" — say "path", "thread", or nothing
- Always end by leaving space — a question, an opening, or quiet acknowledgment

You must also suggest 1-3 simple actions from this list:
- Capture: log a raw experience
- Name it: give something a type and title
- Explore with MAIA: open a conversation seeded with this context
- Leave it: close and move on

Respond ONLY as JSON:
{
  "whisper": "Your 1-2 sentence insight",
  "actions": [{"label": "Action name", "intent": "action_key"}],
  "contextSummary": "Brief structural label like '3 visits, 1 question ripening'"
}

Valid intents: capture, name, explore_maia, leave_it`;

async function generateWhisper(
  featureKey: string,
  ctx: ContextSnapshot,
): Promise<GuideWhisper | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  // Don't generate if there's nothing to work with
  const hasContext =
    ctx.processItems.length > 0 ||
    ctx.captureCount > 0 ||
    ctx.triggerOpens > 1;

  if (!hasContext) return null;

  const featureDesc = FEATURE_CONTEXT[featureKey] || '';
  const contextData = buildWhisperPrompt(featureKey, ctx);

  try {
    const client = new Anthropic({ apiKey, timeout: 6000 });

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      temperature: 0.7,
      system: WHISPER_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Feature: ${featureKey}\n${featureDesc}\n\nMember context:\n${contextData}\n\nGenerate a whisper.`,
        },
      ],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    const parsed = JSON.parse(text);

    return {
      whisper: parsed.whisper || '',
      actions: Array.isArray(parsed.actions) ? parsed.actions.slice(0, 3) : [],
      contextSummary: parsed.contextSummary || undefined,
    };
  } catch (err) {
    console.error('[Guidance] Whisper generation failed:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const featureKey = searchParams.get('featureKey');
  if (!featureKey) {
    return NextResponse.json({ error: 'Missing featureKey' }, { status: 400 });
  }

  // Always fetch the static tooltip (fallback)
  const tooltipResult = await query(
    `SELECT title, summary
     FROM guidance_content
     WHERE feature_key = $1
       AND is_enabled = true
       AND depth = 'tooltip'
     ORDER BY sort_rank ASC
     LIMIT 1`,
    [featureKey],
  );

  const fallback = tooltipResult.rows[0];

  // Build context snapshot + generate whisper
  let whisper: GuideWhisper | null = null;
  try {
    const ctx = await buildContextSnapshot(memberId, featureKey);
    whisper = await generateWhisper(featureKey, ctx);
  } catch (err) {
    console.error('[Guidance] Context snapshot failed:', err);
  }

  // Log whisper_served signal (structural only)
  if (whisper) {
    try {
      await query(
        `INSERT INTO guidance_signals (member_id, feature_key, signal_type, context)
         VALUES ($1, $2, 'whisper_served', $3)`,
        [memberId, featureKey, whisper.contextSummary || null],
      );
    } catch {
      // Non-critical — don't fail the request
    }
  }

  const result: GuideInsightResponse = {
    featureKey,
    whisper,
    fallbackTitle: fallback?.title || undefined,
    fallbackSummary: fallback?.summary || undefined,
  };

  return NextResponse.json(result);
}
