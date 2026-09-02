export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';
import {
  generateThreadReflection,
  type ThreadBlockSummary,
} from '@/lib/team/maiaThreadReflection';
import {
  runRecognition,
  getRecentRecognitionEvents,
  storeRecognitionEvent,
  type RecognitionOutcome,
} from '@/lib/maia/decisionChangeRecognition';
import {
  serverStageContext,
  emitStage,
  stage,
} from '@/lib/ideas/faultLocalization';

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
  // T1 fault localization. Observational only: the context is minted here,
  // every seam below is bracketed with entered/completed/failed, and nothing
  // in this instrument touches the response, the prompt, or control flow.
  // The client may propose an attempt_id via header; request_id is minted
  // server-side and is not influenceable from the request.
  const { ctx: t1, attemptIdRejected } = serverStageContext(request.headers);

  // The auth seam is bracketed by hand rather than via stage() so the
  // single `entered` event can carry the attempt_id verdict. A rejected
  // client-proposed id is recorded, not silently treated as absent.
  emitStage(t1, 'server.auth', 'entered', { attempt_id_rejected: attemptIdRejected });

  try {
    let resolvedSession: Awaited<ReturnType<typeof getCurrentSession>>;
    try {
      resolvedSession = await getCurrentSession();
    } catch (authError) {
      emitStage(t1, 'server.auth', 'failed', {
        reason: 'session_lookup_threw',
        error_name: authError instanceof Error ? authError.name : 'unknown',
      });
      throw authError;
    }
    if (!resolvedSession?.memberId) {
      emitStage(t1, 'server.auth', 'failed', { reason: 'unauthorized', status: 401 });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    emitStage(t1, 'server.auth', 'completed', { member_present: true });
    // Re-bound as a const so the narrowing survives into the closures below.
    const session = resolvedSession;

    const { id: ideaId } = await params;
    emitStage(t1, 'server.validate', 'entered');
    if (!UUID_RE.test(ideaId)) {
      emitStage(t1, 'server.validate', 'failed', { reason: 'invalid_idea_id', status: 400 });
      return NextResponse.json({ error: 'Invalid idea id' }, { status: 400 });
    }
    emitStage(t1, 'server.validate', 'completed');

    // Ownership + idea context in one fetch
    const ideaResult = await stage(
      t1,
      'server.idea_fetch',
      () =>
        query<IdeaRow>(
          `SELECT id, title, framing
         FROM member_ideas
        WHERE id = $1 AND member_id = $2`,
          [ideaId, session.memberId]
        ),
      (r) => ({ row_count: r.rows.length })
    );
    if (ideaResult.rows.length === 0) {
      emitStage(t1, 'server.idea_fetch', 'failed', { reason: 'idea_not_found', status: 404 });
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }
    const idea = ideaResult.rows[0];

    // Context assembly is one seam: three reads plus the shaping that turns
    // them into the primitive's input. A fault anywhere inside it is a
    // context-assembly fault, distinguishable from a fetch or a model fault.
    const assembled = await stage(
      t1,
      'server.context_assemble',
      async () => {
        // Last 4 member-authored blocks (exclude prior maia_reflection blocks
        // so we don't recursively reflect on reflections).
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

        return { recentBlocks, lastDecision, priorMaiaReflections, summaries };
      },
      (a) => ({
        block_count: a.summaries.length,
        prior_reflection_count: a.priorMaiaReflections.length,
        last_decision_present: a.lastDecision !== null,
        framing_present: idea.framing !== null,
      })
    );
    const { recentBlocks, lastDecision, priorMaiaReflections, summaries } = assembled;

    // Generate — single-shot, no streaming, bounded output
    const reflection = await stage(
      t1,
      'server.model_call',
      () =>
        generateThreadReflection({
          ideaTitle: idea.title,
          ideaFraming: idea.framing,
          lastDecision,
          recentBlocks: summaries,
          priorMaiaReflections,
        }),
      (text) => ({ reflection_len: typeof text === 'string' ? text.length : -1 })
    );

    // ── Decision/Change recognition (flag-gated, post-response) ──────────────
    // Invariant: this runs AFTER the reflection is generated. It does not
    // touch the prompt or steer MAIA's voice. It only names a moment and
    // attaches an invitation affordance when the spec allows.
    let recognition: RecognitionOutcome | null = null;
    if (isRecognitionEnabled(session.memberId) && recentBlocks.length > 0) {
      recognition = await stage(
        t1,
        'server.recognition',
        async () => {
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

          return runRecognition({
            userText,
            priorTurnCount: Math.max(0, recentBlocks.length - 1),
            sanctuaryMode,
            recentEvents,
            memberBlocksSinceLastNaming,
          });
        },
        (r) => ({
          naming_fired: Boolean(r?.namingLine),
          recognition_kind: r?.signal.kind ?? null,
          recognition_strength: r?.signal.strength ?? null,
          invitation_offered: Boolean(r?.offerInvitation),
        })
      );
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
    const insertResult = await stage(
      t1,
      'server.persist',
      () =>
        query<BlockRow>(
          `INSERT INTO member_idea_blocks (idea_id, member_id, block_type, content, metadata)
       VALUES ($1, $2, 'maia_reflection', $3, $4)
       RETURNING id, block_type, content, metadata, created_at`,
          [ideaId, session.memberId, reflectionContent, JSON.stringify(metadata)]
        ),
      (r) => ({ block_present: r.rows.length > 0 })
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
    await stage(t1, 'server.touch', () =>
      query(`UPDATE member_ideas SET last_entered_at = NOW() WHERE id = $1`, [ideaId])
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
