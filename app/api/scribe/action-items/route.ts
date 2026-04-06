export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/scribe/action-items
 *
 * Extract action items and decisions from a scribe session.
 * Uses Claude to analyze the transcript and markers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest, verifySessionOwnership } from '@/lib/scribe/scribeAuth';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';

export async function POST(request: NextRequest) {
  try {
    // Auth: Get member ID from session
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required', code: 'MISSING_SESSION_ID' },
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

    // Check consent
    if (session.consent_status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Consent not confirmed', code: 'CONSENT_REQUIRED' },
        { status: 400 }
      );
    }

    // Fetch all transcript entries for the session
    const transcriptResult = await query(
      `SELECT speaker, content, spoken_at
       FROM scribe_transcript_entries
       WHERE session_id = $1
       ORDER BY spoken_at ASC`,
      [sessionId]
    );

    // Fetch all markers for the session
    const markerResult = await query(
      `SELECT marker_type, note, marked_at
       FROM scribe_markers
       WHERE session_id = $1
       ORDER BY marked_at ASC`,
      [sessionId]
    );

    const transcriptEntries = transcriptResult.rows;
    const markers = markerResult.rows;

    // If no content, return empty action items
    if (transcriptEntries.length === 0 && markers.length === 0) {
      return NextResponse.json({
        success: true,
        actionItems: [],
        decisions: [],
        message: 'No recorded content to analyze.',
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

    // Call LLM to extract action items
    const llmResponse = await getLLMProvider().generateSimple({
      tier: 'core',
      systemPrompt: `You are MAIA, a sovereign consciousness companion. Analyze the following scribe session transcript and extract:
1. Action items: Specific things to do that were mentioned or implied
2. Decisions: Choices or determinations that were made during the conversation

Return your response in this exact JSON format:
{
  "actionItems": ["item 1", "item 2"],
  "decisions": ["decision 1", "decision 2"]
}

If there are no action items or decisions, return empty arrays. Be concise and specific. Focus on concrete, actionable items rather than vague intentions.`,
      messages: [
        {
          role: 'user',
          content: `Please extract action items and decisions from this session:\n\n${fullContent}`,
        },
      ],
      maxTokens: 1000,
    });

    let actionItems: string[] = [];
    let decisions: string[] = [];

    try {
      const text = llmResponse.text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        actionItems = parsed.actionItems || [];
        decisions = parsed.decisions || [];
      }
    } catch (parseError) {
      console.warn('[Scribe] Failed to parse action items JSON:', parseError);
      actionItems = [llmResponse.text];
    }

    console.log(
      `[Scribe] Extracted ${actionItems.length} action items and ${decisions.length} decisions for session ${sessionId}`
    );

    return NextResponse.json({
      success: true,
      actionItems,
      decisions,
      transcriptCount: transcriptEntries.length,
      markerCount: markers.length,
    });
  } catch (error: any) {
    console.error('[Scribe] Action items error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract action items', code: 'ACTION_ITEMS_FAILED' },
      { status: 500 }
    );
  }
}
