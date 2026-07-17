export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/scribe/partial-summary
 *
 * Generate a summary of the last N minutes of a scribe session.
 * Uses Claude to summarize the transcript entries.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest, verifySessionOwnership, isValidUUID } from '@/lib/scribe/scribeAuth';
import { logAudit } from '@/lib/security/auditLog';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';

// This route returns transcript-derived content (summary of scribe_transcript_entries
// + scribe_markers). Identity + ownership gating was already in place; the
// 2026-07-17 security pass (sibling of PR #622) added audit logging on
// grant/denial and a UUID pre-check. Audit entries carry identifiers only —
// never transcript contents. The not-found body is identical for nonexistent
// and unowned sessions, so the response never confirms a session exists.

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { sessionId, minutes = 5 } = body;

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'Session ID required', code: 'MISSING_SESSION_ID' },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const audit = (userId: string, result: 'success' | 'failure', reason?: string) =>
      logAudit({
        timestamp: new Date(),
        userId,
        action: 'access',
        resource: 'scribe_transcript',
        resourceId: sessionId,
        ipAddress,
        userAgent,
        result,
        ...(reason ? { reason } : {}),
        metadata: { endpoint: 'partial-summary:POST' },
      }).catch(() => {}); // audit failure must not mask the denial

    // Auth: Get member ID from session
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      await audit('anonymous', 'failure', 'unauthenticated');
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Malformed ids are denied before any DB work, same shape as unauthorized.
    if (!isValidUUID(sessionId)) {
      await audit(memberId, 'failure', 'malformed_session_id');
      return NextResponse.json(
        { error: 'Session not found or not owned by member', code: 'SESSION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Verify ownership
    const session = await verifySessionOwnership(sessionId, memberId);
    if (!session) {
      await audit(memberId, 'failure', 'not_owner_or_nonexistent');
      return NextResponse.json(
        { error: 'Session not found or not owned by member', code: 'SESSION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check consent — the caller is the verified owner here, so naming the
    // condition leaks nothing to outsiders (they never reach this branch).
    if (session.consent_status !== 'confirmed') {
      await audit(memberId, 'failure', 'consent_not_confirmed');
      return NextResponse.json(
        { error: 'Consent not confirmed', code: 'CONSENT_REQUIRED' },
        { status: 400 }
      );
    }

    await audit(memberId, 'success');

    // Calculate the time window
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);

    // Fetch transcript entries from the last N minutes
    const transcriptResult = await query(
      `SELECT speaker, content, spoken_at
       FROM scribe_transcript_entries
       WHERE session_id = $1 AND spoken_at >= $2
       ORDER BY spoken_at ASC`,
      [sessionId, cutoffTime.toISOString()]
    );

    // Fetch markers from the last N minutes
    const markerResult = await query(
      `SELECT marker_type, note, marked_at
       FROM scribe_markers
       WHERE session_id = $1 AND marked_at >= $2
       ORDER BY marked_at ASC`,
      [sessionId, cutoffTime.toISOString()]
    );

    const transcriptEntries = transcriptResult.rows;
    const markers = markerResult.rows;

    // If no content, return empty summary
    if (transcriptEntries.length === 0 && markers.length === 0) {
      return NextResponse.json({
        success: true,
        summary: `No recorded content in the last ${minutes} minute${minutes === 1 ? '' : 's'}.`,
        minutes,
        entryCount: 0,
        markerCount: 0,
      });
    }

    // Build the transcript text
    const transcriptText = transcriptEntries
      .map((entry: any) => {
        const time = new Date(entry.spoken_at).toLocaleTimeString();
        const speaker = entry.speaker === 'self' ? 'You' : entry.speaker === 'maia' ? 'MAIA' : entry.speaker;
        return `[${time}] ${speaker}: ${entry.content}`;
      })
      .join('\n');

    const markerText = markers
      .map((m: any) => {
        const time = new Date(m.marked_at).toLocaleTimeString();
        return `[${time}] Marker: ${m.marker_type}${m.note ? ` - ${m.note}` : ''}`;
      })
      .join('\n');

    const fullContent = [
      transcriptText,
      markerText ? `\nMarkers:\n${markerText}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    // Call LLM to summarize
    const llmResponse = await getLLMProvider().generateSimple({
      tier: 'core',
      systemPrompt: `You are MAIA, a sovereign consciousness companion. Summarize the following conversation segment from the last ${minutes} minutes of a scribe session. Be concise, warm, and focus on the essence of what was discussed. Highlight any marked moments. Keep your summary to 2-3 sentences.`,
      messages: [
        {
          role: 'user',
          content: `Please summarize this portion of our session:\n\n${fullContent}`,
        },
      ],
      maxTokens: 500,
    });

    const summary = llmResponse.text || 'Unable to generate summary.';

    console.log(`[Scribe] Generated partial summary for session ${sessionId} (last ${minutes} min)`);

    return NextResponse.json({
      success: true,
      summary,
      minutes,
      entryCount: transcriptEntries.length,
      markerCount: markers.length,
    });
  } catch (error: any) {
    console.error('[Scribe] Partial summary error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate summary', code: 'SUMMARY_FAILED' },
      { status: 500 }
    );
  }
}
