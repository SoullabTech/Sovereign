export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';
export const maxDuration = 90;

import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import { buildSessionReviewPrompt, getCompletedSessionData, formatSessionForDisplay } from '@/lib/scribe/sessionReviewMode';
import {
  getMemberIdFromRequest,
  verifySessionOwnership,
  isValidUUID,
  type ScribeSession,
} from '@/lib/scribe/scribeAuth';
import { logAudit } from '@/lib/security/auditLog';

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
): Promise<AuthzResult> {
  const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

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

    const authz = await authorizeTranscriptReview(req, reviewedSessionId, 'review-session:POST');
    if (!authz.ok) return authz.response;

    // Logged only after authorization — the id no longer appears in logs for
    // unauthenticated probes (the audit log records those instead).
    console.log(`🔍 Session Review: ${reviewedSessionId} | Q${questionNumber || 1} | lens=${lens || 'core'} | member=${authz.memberId.slice(0, 8)}…`);

    // Phase 1 — load the session content. A failure here means the data could not be
    // loaded (session missing / transcript lookup failed), distinct from a model failure.
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

    // Phase 2 — generate the review. A failure here is a model/provider failure; the
    // session data already loaded, so the UI must not claim it "couldn't load the data".
    let responseText: string;
    try {
      const llmResponse = await getLLMProvider().generateSimple({
        tier: 'core',
        // Session Review is a long-context clinical/practitioner synthesis (often
        // hundreds of turns). The local core model is too slow (~197s on a 373-turn
        // review) and too shallow for this surface, so this route opts out of
        // LOCAL_TIER_ENABLED and uses Claude. Ordinary core/fast routes stay local-first.
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
