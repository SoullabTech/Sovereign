export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';
import {
  generateThreadReflection,
  type ThreadBlockSummary,
} from '@/lib/team/maiaThreadReflection';
import { isIdeaStance, type IdeaStance } from '@/lib/maia/ideaStances';
import {
  runRecognition,
  getRecentRecognitionEvents,
  storeRecognitionEvent,
  type RecognitionOutcome,
} from '@/lib/maia/decisionChangeRecognition';

// Server-side enablement gate for MAIA Decision/Change recognition.
//
// The feature requires BOTH:
//   1. FEATURE_MAIA_IDEAS_DECISION_RECOGNITION === 'true' (global toggle)
//   2. member_id present in FEATURE_MAIA_IDEAS_DECISION_RECOGNITION_MEMBER_IDS
//      (comma-separated UUID allowlist)
//
// Default-safe: if the allowlist env is missing, empty, or whitespace-only,
// the feature is OFF for everyone. This prevents accidental global rollout
// when the global toggle is flipped in production.
function isRecognitionEnabled(memberId: string): boolean {
  if (process.env.FEATURE_MAIA_IDEAS_DECISION_RECOGNITION !== 'true') return false;
  const raw = process.env.FEATURE_MAIA_IDEAS_DECISION_RECOGNITION_MEMBER_IDS ?? '';
  const allowlist = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (allowlist.length === 0) return false;
  return allowlist.includes(memberId);
}

// Sanctuary mode is not yet wired to Ideas threads. When it is, update this
// helper to check the member's current session state. For v1 this is a
// placeholder that keeps the absolute-gate invariant honored-by-default.
function isSanctuaryModeActive(_memberId: string, _ideaId: string): boolean {
  return false;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// User-facing block labels — kept here so the server composes context with
// the same labels the UI renders. Must stay in sync with BLOCK_LABELS in
// app/maia/ideas/[id]/page.tsx.
const BLOCK_LABELS: Record<'note' | 'decision' | 'change', string> = {
  note: 'Reflection',
  decision: 'Decision',
  change: 'Shift',
};

const OUTCOME_LABELS: Record<string, string> = {
  worked: 'Worked',
  partly: 'Partly worked',
  didnt: "Didn't work",
  unsure: 'Not sure',
};

interface IdeaRow {
  id: string;
  title: string;
  framing: string | null;
}

interface BlockRow {
  id: string;
  block_type: 'note' | 'decision' | 'change' | 'maia_reflection';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * POST /api/ideas/[id]/ask-maia
 *
 * Server-composed, single-shot MAIA reflection persisted in-thread as a
 * `maia_reflection` block. No body required — the user does not author the
 * prompt. The server gathers a bounded context slice (title + framing +
 * last decision + last 3–4 blocks) and calls the Haiku-backed primitive.
 *
 * Returns: { success: true, block: <the new maia_reflection block> }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: ideaId } = await params;
    if (!UUID_RE.test(ideaId)) {
      return NextResponse.json({ error: 'Invalid idea id' }, { status: 400 });
    }

    // Ownership + idea context in one fetch
    const ideaResult = await query<IdeaRow>(
      `SELECT id, title, framing
         FROM member_ideas
        WHERE id = $1 AND member_id = $2`,
      [ideaId, session.memberId]
    );
    if (ideaResult.rows.length === 0) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }
    const idea = ideaResult.rows[0];

    // Optional relational stance for THIS turn (Cut 2). The body may be absent
    // entirely — plain "Ask MAIA" posts no body and keeps the prior behavior.
    // An unrecognized stance is rejected rather than silently ignored, so a
    // member never gets a different relation than the one they chose.
    let stance: IdeaStance | undefined;
    try {
      const raw = await request.text();
      if (raw.trim().length > 0) {
        const body = JSON.parse(raw) as { stance?: unknown };
        if (body.stance !== undefined && body.stance !== null) {
          if (!isIdeaStance(body.stance)) {
            return NextResponse.json({ error: 'Unknown stance' }, { status: 400 });
          }
          stance = body.stance;
        }
      }
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Last 4 member-authored blocks (exclude prior maia_reflection blocks so
    // we don't recursively reflect on reflections).
    const recentResult = await query<BlockRow>(
      `SELECT id, block_type, content, metadata, created_at
         FROM member_idea_blocks
        WHERE idea_id = $1
          AND block_type IN ('note', 'decision', 'change')
        ORDER BY created_at DESC
        LIMIT 4`,
      [ideaId]
    );
    // Re-order oldest-first so the primitive sees chronological flow
    const recentBlocks = [...recentResult.rows].reverse();

    // Most recent decision (may or may not be in the 4-block slice)
    const decisionResult = await query<{ content: string }>(
      `SELECT content
         FROM member_idea_blocks
        WHERE idea_id = $1 AND block_type = 'decision'
        ORDER BY created_at DESC
        LIMIT 1`,
      [ideaId]
    );
    const lastDecision =
      decisionResult.rows.length > 0 ? decisionResult.rows[0].content : null;

    // Last 2 prior MAIA reflections — for progression heuristic + anti-
    // repetition. Fetched DESC, reversed to oldest-first for prompt shape.
    const priorReflectionsResult = await query<{ content: string }>(
      `SELECT content
         FROM member_idea_blocks
        WHERE idea_id = $1 AND block_type = 'maia_reflection'
        ORDER BY created_at DESC
        LIMIT 2`,
      [ideaId]
    );
    const priorMaiaReflections = [...priorReflectionsResult.rows]
      .reverse()
      .map((r) => r.content);

    // TOTAL reflection count drives the progression stage. Counting the
    // sampled slice instead of the thread was part of why threads looped:
    // a thread twelve reflections deep looked, to the model, like a thread
    // two reflections deep.
    const reflectionCountResult = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
         FROM member_idea_blocks
        WHERE idea_id = $1 AND block_type = 'maia_reflection'`,
      [ideaId]
    );
    const reflectionCount = parseInt(reflectionCountResult.rows[0]?.count ?? '0', 10);

    // Shape the context for the primitive
    const summaries: ThreadBlockSummary[] = recentBlocks.map((b) => {
      const rawOutcome =
        b.block_type === 'change' && typeof b.metadata?.outcome === 'string'
          ? (b.metadata.outcome as string)
          : undefined;
      return {
        type: b.block_type as 'note' | 'decision' | 'change',
        label: BLOCK_LABELS[b.block_type as 'note' | 'decision' | 'change'],
        content: b.content,
        outcome: rawOutcome ? OUTCOME_LABELS[rawOutcome] ?? rawOutcome : undefined,
      };
    });

    // Generate — single-shot, no streaming, bounded output
    const reflection = await generateThreadReflection({
      ideaTitle: idea.title,
      ideaFraming: idea.framing,
      lastDecision,
      recentBlocks: summaries,
      priorMaiaReflections,
      reflectionCount,
      stance,
    });

    // ── Decision/Change recognition (flag-gated, post-response) ──────────────
    // Invariant: this runs AFTER the reflection is generated. It does not
    // touch the prompt or steer MAIA's voice. It only names a moment and
    // attaches an invitation affordance when the spec allows.
    let recognition: RecognitionOutcome | null = null;
    if (isRecognitionEnabled(session.memberId) && recentBlocks.length > 0) {
      const latestUserBlock = recentBlocks[recentBlocks.length - 1];
      const userText = latestUserBlock.content ?? '';
      const sanctuaryMode = isSanctuaryModeActive(session.memberId, ideaId);
      const recentEvents = await getRecentRecognitionEvents(ideaId);

      // Count member blocks created AFTER the most recent naming_fired event.
      // This drives the cooldown rule (released once N new member blocks exist
      // since the last naming) and replaces the old event-index logic that
      // created a circular permanent-cooldown bug.
      const lastNamingFired = recentEvents.find(
        (e) => e.event_type === 'naming_fired'
      );
      const memberBlocksSinceLastNaming = lastNamingFired
        ? recentBlocks.filter(
            (b) =>
              new Date(b.created_at).getTime() >
              new Date(lastNamingFired.fired_at).getTime()
          ).length
        : undefined;

      recognition = runRecognition({
        userText,
        priorTurnCount: Math.max(0, recentBlocks.length - 1),
        sanctuaryMode,
        recentEvents,
        memberBlocksSinceLastNaming,
      });
    }

    // Reflection body stays pure. The naming line, when recognition fires,
    // lives only in metadata.recognition.naming_line and is rendered by the
    // UI as a visually distinct element above the body (Option B — keeps
    // layers separate: body = MAIA's content response, metadata = recognition
    // state observed by the system).
    const reflectionContent = reflection;

    // Persist atomically as a maia_reflection block. The trust boundary
    // lives here: only this endpoint writes this block_type.
    const metadata: Record<string, unknown> = {
      source: 'maia',
      invoked_from: 'idea_thread',
      // Recorded so a thread can be read back later with the relation visible:
      // what kind of company was asked for at this moment. Per-turn only —
      // nothing here makes the stance sticky for the next call.
      ...(stance ? { stance } : {}),
    };
    if (recognition && recognition.namingLine) {
      metadata.recognition = {
        kind: recognition.signal.kind,
        strength: recognition.signal.strength,
        naming_line: recognition.namingLine,
        offer_invitation: recognition.offerInvitation,
        ...(recognition.signal.kind === 'change' && recognition.signal.xy
          ? { xy: recognition.signal.xy }
          : {}),
      };
    }
    const insertResult = await query<BlockRow>(
      `INSERT INTO member_idea_blocks (idea_id, member_id, block_type, content, metadata)
       VALUES ($1, $2, 'maia_reflection', $3, $4)
       RETURNING id, block_type, content, metadata, created_at`,
      [ideaId, session.memberId, reflectionContent, JSON.stringify(metadata)]
    );

    // Fire-and-forget event logging. Recorded after the reflection is
    // successfully persisted so block_id can be referenced in future analysis.
    // Narrowing: namingLine is only set for medium/strong signals (see
    // runRecognition() — weak returns null early).
    if (
      recognition &&
      recognition.namingLine &&
      (recognition.signal.strength === 'medium' || recognition.signal.strength === 'strong')
    ) {
      const reflectionBlockId = insertResult.rows[0]?.id;
      const signalStrength = recognition.signal.strength;
      storeRecognitionEvent({
        threadId: ideaId,
        memberId: session.memberId,
        eventType: 'naming_fired',
        signalKind: recognition.signal.kind,
        signalStrength,
        meta: {
          source: 'ask_maia_route',
          reflection_block_id: reflectionBlockId,
          ...(recognition.signal.kind === 'change' && recognition.signal.xy
            ? { x_text: recognition.signal.xy.x, y_text: recognition.signal.xy.y }
            : {}),
        },
      });
      if (recognition.offerInvitation) {
        storeRecognitionEvent({
          threadId: ideaId,
          memberId: session.memberId,
          eventType: 'invitation_offered',
          signalKind: recognition.signal.kind,
          signalStrength,
          meta: {
            source: 'ask_maia_route',
            reflection_block_id: reflectionBlockId,
          },
        });
      }
    }

    // Touch last_entered_at so the idea bubbles up
    await query(
      `UPDATE member_ideas SET last_entered_at = NOW() WHERE id = $1`,
      [ideaId]
    );

    return NextResponse.json(
      { success: true, block: insertResult.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('[ideas/ask-maia] failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate reflection' },
      { status: 500 }
    );
  }
}
