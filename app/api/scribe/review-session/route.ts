export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';
// Long sessions run as a background job (see stagedReview); the POST itself
// returns fast (cached / processing / failed), so this bound only needs to
// cover the SIMPLE single-call path for sub-threshold sessions. Modestly
// raised from 90 as immediate stabilization — it is not the architectural fix.
export const maxDuration = 120;

import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import {
  buildSessionReviewPrompt,
  getCompletedSessionData,
  formatSessionForDisplay,
  loadReviewTurns,
} from '@/lib/scribe/sessionReviewMode';
import {
  getOrStartReview,
  hashTranscript,
  isLongSession,
  type ReviewMode,
  type StagedInput,
} from '@/lib/scribe/stagedReview';
import {
  getMemberIdFromRequest,
  verifySessionOwnership,
  isValidUUID,
  type ScribeSession,
} from '@/lib/scribe/scribeAuth';
import { logAudit } from '@/lib/security/auditLog';

function clientMeta(req: NextRequest) {
  return {
    ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
  };
}

/**
 * Write a single transcript-access GRANT row. Kept separate from
 * authorizeTranscriptReview so the staged path can log exactly ONE grant per
 * review (at job start) rather than one per poll.
 */
async function logReviewGrant(
  req: NextRequest,
  sessionId: string,
  endpoint: 'review-session:POST' | 'review-session:GET',
  memberId: string,
): Promise<void> {
  const { ipAddress, userAgent } = clientMeta(req);
  await logAudit({
    timestamp: new Date(),
    userId: memberId,
    action: 'access',
    resource: 'scribe_transcript',
    resourceId: sessionId,
    ipAddress,
    userAgent,
    result: 'success',
    metadata: { endpoint },
  }).catch(() => {});
}

/** Map the practitioner's request to a staged review view. */
function deriveReviewMode(question: string): ReviewMode {
  const q = question.toLowerCase();
  if (/overview/.test(q)) return 'overview';
  if (/elemental|psychological/.test(q)) return 'elemental';
  if (/organizational|practitioner view|follow-through|carry forward/.test(q)) return 'organizational';
  return 'question';
}

// ─── AUTHORIZATION (security patch, 2026-07-17) ──────────────────────────────
// This route returns client-session transcript content. Before this patch it
// performed NO authentication: possession of a session UUID was sufficient to
// read any session's transcript. Every sibling /api/scribe/* route already
// gates on getMemberIdFromRequest + verifySessionOwnership; this route was the
// outlier. Authorization is now:
//   - server-side only (session cookie / x-session-token → auth_sessions);
//     possession of a session id is never sufficient
//   - owner-only: scribe_sessions.member_id must equal the authenticated
//     member (member_id is NOT NULL — no anonymous/guest sessions exist)
//   - consent-aware: a session whose consent_status is 'declined' is not
//     reviewable even by its owner
//   - non-revealing: unauthorized and nonexistent sessions return an
//     identical 404 body, so the response never confirms a session exists
// Denials are audit-logged (identifiers only — never transcript contents).

const NOT_FOUND_BODY = { success: false, error: 'Not found' } as const;

type AuthzResult =
  | { ok: true; memberId: string; session: ScribeSession }
  | { ok: false; response: NextResponse };

async function authorizeTranscriptReview(
  req: NextRequest,
  sessionId: string,
  endpoint: 'review-session:POST' | 'review-session:GET',
  opts?: { auditSuccess?: boolean },
): Promise<AuthzResult> {
  const { ipAddress, userAgent } = clientMeta(req);

  const deny = async (
    memberId: string | null,
    reason: string,
    response: NextResponse,
  ): Promise<AuthzResult> => {
    // Audit metadata only: caller, session id, result, reason, timestamp.
    // Never transcript contents.
    await logAudit({
      timestamp: new Date(),
      userId: memberId || 'anonymous',
      action: 'access',
      resource: 'scribe_transcript',
      resourceId: sessionId,
      ipAddress,
      userAgent,
      result: 'failure',
      reason,
      metadata: { endpoint },
    }).catch(() => {}); // audit failure must not mask the denial
    return { ok: false, response };
  };

  // Malformed identifiers are denied before any DB work, with the same
  // non-revealing shape as an unauthorized id.
  if (!isValidUUID(sessionId)) {
    return deny(null, 'malformed_session_id', NextResponse.json(NOT_FOUND_BODY, { status: 404 }));
  }

  // Server-side identity: session cookie or x-session-token validated against
  // auth_sessions. Expired/revoked tokens resolve to null here.
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) {
    return deny(
      null,
      'unauthenticated',
      NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 }),
    );
  }

  // Ownership: WHERE id = $1 AND member_id = $2. A session owned by someone
  // else and a session that does not exist are indistinguishable to the caller.
  const session = await verifySessionOwnership(sessionId, memberId);
  if (!session) {
    return deny(memberId, 'not_owner_or_nonexistent', NextResponse.json(NOT_FOUND_BODY, { status: 404 }));
  }

  // Consent — DENY BY DEFAULT, allowlist of affirmative states only.
  // Transcript review is permitted solely when consent_status === 'confirmed':
  // the same allowlist the sibling transcript/mark/partial-summary/action-items
  // routes enforce, and the state every transcript-bearing session necessarily
  // holds (transcript WRITES are themselves gated on 'confirmed', so a session
  // with reviewable content has passed affirmative consent). 'pending',
  // 'declined', and any absent/legacy/unknown value are all denied. Verified
  // against production 2026-07-17: every existing session is 'confirmed', so
  // this tightening blocks no legitimate review. The caller is the verified
  // owner here, so the neutral copy leaks nothing to outsiders (they never
  // reach this branch).
  if (session.consent_status !== 'confirmed') {
    return deny(
      memberId,
      'consent_not_confirmed',
      NextResponse.json(
        { success: false, error: 'Review is not available for this session' },
        { status: 403 },
      ),
    );
  }

  if (opts?.auditSuccess !== false) {
    await logAudit({
      timestamp: new Date(),
      userId: memberId,
      action: 'access',
      resource: 'scribe_transcript',
      resourceId: sessionId,
      ipAddress,
      userAgent,
      result: 'success',
      metadata: { endpoint },
    }).catch(() => {});
  }

  return { ok: true, memberId, session };
}

export async function POST(req: NextRequest) {
  try {
    const {
      reviewedSessionId,
      currentSessionId,
      question,
      questionNumber,
      lens,
      clientName,
    } = await req.json();

    if (!reviewedSessionId || !question) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: reviewedSessionId and question' },
        { status: 400 }
      );
    }

    // Authorize + ownership (+ audit DENIALS). Success audit is deferred: the
    // staged path logs exactly one grant at job start, so polling never inflates
    // the audit trail. The simple path logs its grant explicitly below.
    const authz = await authorizeTranscriptReview(req, reviewedSessionId, 'review-session:POST', {
      auditSuccess: false,
    });
    if (!authz.ok) return authz.response;

    console.log(`🔍 Session Review: ${reviewedSessionId} | Q${questionNumber || 1} | lens=${lens || 'core'} | member=${authz.memberId.slice(0, 8)}…`);

    // Load the full transcript once. A failure here is a load failure (session
    // missing / transcript lookup failed), distinct from a model failure.
    let loaded: Awaited<ReturnType<typeof loadReviewTurns>>;
    try {
      loaded = await loadReviewTurns(reviewedSessionId);
    } catch (loadError: any) {
      console.error('❌ Session review load error:', loadError);
      return NextResponse.json(
        { success: false, phase: 'load', error: loadError.message || 'Failed to load session data' },
        { status: 500 }
      );
    }

    const turnCount = loaded.turns.length;

    // ── LONG SESSION → staged map-reduce, run as a background job ────────────
    // Preserves the whole encounter (no sampling away the middle) and never
    // blocks a single HTTP request on the full generation.
    if (isLongSession(turnCount)) {
      const transcriptHash = hashTranscript(loaded.turns);
      const stagedInput: StagedInput = {
        sessionId: reviewedSessionId,
        turns: loaded.turns,
        markersText: loaded.markersText,
        mode: deriveReviewMode(question),
        question,
        lens: lens || 'core',
        clientName: clientName || null,
        sessionMeta: {
          container: loaded.session.container,
          durationMin: loaded.session.durationMin,
          startedAt: loaded.session.startedAt,
          title: loaded.session.title,
        },
      };

      const status = getOrStartReview(stagedInput, transcriptHash);

      // One grant per generation: only when THIS request started the job.
      if (status.started) {
        await logReviewGrant(req, reviewedSessionId, 'review-session:POST', authz.memberId);
        console.log(`[SessionReview] staged job started: ${turnCount} turns, ${status.status === 'processing' ? status.progress.total : '?'} segments`);
      }

      if (status.status === 'processing') {
        return NextResponse.json(
          {
            success: false,
            status: 'processing',
            stage: 'reviewing',
            progress: status.progress,
            _meta: { staged: true, totalSegments: turnCount },
          },
          { status: 202 }
        );
      }
      if (status.status === 'failed') {
        return NextResponse.json(
          {
            success: false,
            status: 'failed',
            stage: status.stage,
            error: status.reason,
            _meta: { staged: true, totalSegments: turnCount, failedChunks: status.failedChunks },
          },
          { status: 503 }
        );
      }
      // complete
      return NextResponse.json({
        success: true,
        response: status.result,
        reviewedSessionId,
        questionNumber: questionNumber || 1,
        _meta: { staged: true, segmentCount: turnCount, chunks: status.chunks },
      });
    }

    // ── SIMPLE SESSION → single-call path (unchanged behavior) ───────────────
    await logReviewGrant(req, reviewedSessionId, 'review-session:POST', authz.memberId);

    let prompt: string;
    let meta: Awaited<ReturnType<typeof buildSessionReviewPrompt>>['meta'];
    try {
      ({ prompt, meta } = await buildSessionReviewPrompt(
        {
          reviewedSessionId,
          currentSessionId: currentSessionId || 'review-session',
          questionNumber: questionNumber || 1,
          lens: lens || 'core',
          clientName: clientName || undefined,
        },
        question
      ));
    } catch (loadError: any) {
      console.error('❌ Session review load error:', loadError);
      return NextResponse.json(
        { success: false, phase: 'load', error: loadError.message || 'Failed to load session data' },
        { status: 500 }
      );
    }

    console.log(`[SessionReview] ${meta.segmentCount} segments, sampled=${meta.segmentsSampled}, phantom=${meta.phantomPrefixRemoved ? 'stripped' : 'none'}`);

    let responseText: string;
    try {
      const llmResponse = await getLLMProvider().generateSimple({
        tier: 'core',
        forceClaude: true,
        systemPrompt: '', // prompt is self-contained
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 3000,
        temperature: 0.7,
      });
      responseText = llmResponse.text;
    } catch (genError: any) {
      console.error('❌ Session review generation error:', genError);
      return NextResponse.json(
        { success: false, phase: 'generation', error: genError.message || 'Failed to generate the review' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      response: responseText,
      reviewedSessionId,
      questionNumber: questionNumber || 1,
      _meta: meta,
    });
  } catch (error: any) {
    console.error('❌ Session review error:', error);

    // Return success:false so the client can show a user-friendly message
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process review question',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // Same gate as POST — this handler returns the full formatted transcript.
    const authz = await authorizeTranscriptReview(req, sessionId, 'review-session:GET');
    if (!authz.ok) return authz.response;

    const sessionData = await getCompletedSessionData(sessionId);
    return NextResponse.json({
      sessionId: sessionData.sessionId,
      startTime: sessionData.startTime,
      duration: sessionData.duration,
      displayText: formatSessionForDisplay(sessionData),
    });
  } catch (error: any) {
    console.error('❌ Session review GET error:', error);
    return NextResponse.json({ error: 'Failed to load session' }, { status: 500 });
  }
}
