export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * POST /api/studio/scribe/live-prompts
 *
 * Mid-session MAIA prompt: practitioner asks a question during a live recording.
 * MAIA responds with brief, evidence-based observations (3 bullets max).
 * Stores the Q&A for post-session review.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, insertOne } from '@/lib/db/postgres';
import { getMemberIdFromRequest, verifySessionOwnership } from '@/lib/scribe/scribeAuth';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId, prompt, tsMs } = body;

    if (!sessionId || !prompt || tsMs == null) {
      return NextResponse.json(
        { error: 'sessionId, prompt, and tsMs are required', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    // Verify ownership
    const session = await verifySessionOwnership(sessionId, memberId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or not owned by member', code: 'SESSION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Consent gate: witness/practitioner sessions require confirmed consent
    if (session.container !== 'solo' && session.consent_status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Consent not confirmed for this session', code: 'CONSENT_REQUIRED' },
        { status: 403 }
      );
    }

    // Gather context: last 5 minutes of transcript
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const transcriptResult = await query(
      `SELECT speaker, content, spoken_at
       FROM scribe_transcript_entries
       WHERE session_id = $1 AND spoken_at >= $2
       ORDER BY spoken_at ASC
       LIMIT 50`,
      [sessionId, fiveMinAgo.toISOString()]
    );

    // Last 5 markers
    const markersResult = await query(
      `SELECT marker_type, note, ts_ms, created_at
       FROM studio_session_markers
       WHERE session_id = $1
       ORDER BY created_at DESC
       LIMIT 5`,
      [sessionId]
    );

    // Last 3 live prompts (for conversation continuity)
    const priorPromptsResult = await query(
      `SELECT prompt, response, created_at
       FROM studio_session_live_prompts
       WHERE session_id = $1
       ORDER BY created_at DESC
       LIMIT 3`,
      [sessionId]
    );

    // Build context string
    const transcriptText = transcriptResult.rows.length > 0
      ? transcriptResult.rows
          .map((r: any) => `[${new Date(r.spoken_at).toLocaleTimeString()}] ${r.speaker}: ${r.content}`)
          .join('\n')
      : '(No transcript available yet)';

    const markersText = markersResult.rows.length > 0
      ? markersResult.rows
          .map((r: any) => `- ${r.marker_type}${r.note ? `: ${r.note}` : ''}`)
          .join('\n')
      : '(No markers yet)';

    const priorText = priorPromptsResult.rows.length > 0
      ? priorPromptsResult.rows
          .reverse()
          .map((r: any) => `Q: ${r.prompt}\nA: ${r.response}`)
          .join('\n\n')
      : '';

    const containerLabel = session.container === 'solo' ? 'solo session'
      : session.container === 'witness' ? 'couples/group witness session'
      : 'practitioner client session';

    const userContent = [
      `Container: ${containerLabel}`,
      '',
      `Recent transcript (last 5 min):`,
      transcriptText,
      '',
      `Recent markers:`,
      markersText,
      priorText ? `\nPrior mid-session exchanges:\n${priorText}` : '',
      '',
      `Practitioner question: ${prompt}`,
    ].join('\n');

    // Call Claude — use Haiku for speed
    const llmResponse = await getLLMProvider().generateSimple({
      tier: 'fast',
      systemPrompt: `You are MAIA in mid-session witness mode. A practitioner is asking you a question during a live session with a client. Be brief and useful:

- 3 bullets maximum
- Format: What I notice / What to ask next / What to watch
- Reference specific things from the transcript when possible
- No certainty language ("it seems" not "it is")
- No long monologues or psychospiritual performances
- If you don't have enough context, say so in one line`,
      messages: [
        { role: 'user', content: userContent },
      ],
      maxTokens: 300,
    });

    const responseText = llmResponse.text || 'Unable to generate response.';

    // Store the exchange
    const stored = await insertOne('studio_session_live_prompts', {
      session_id: sessionId,
      ts_ms: tsMs,
      prompt,
      response: responseText,
      model: 'claude-haiku-4-5-20251001',
      created_by: memberId,
    });

    console.log(`[Studio Scribe] Live prompt at ${tsMs}ms in session ${sessionId}`);

    return NextResponse.json({
      success: true,
      id: stored.id,
      response: responseText,
      createdAt: stored.created_at,
    });
  } catch (error: any) {
    console.error('[Studio Scribe] Live prompt error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process prompt', code: 'PROMPT_FAILED' },
      { status: 500 }
    );
  }
}
