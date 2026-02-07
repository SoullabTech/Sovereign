export const dynamic = 'force-dynamic';

/**
 * PRE-SESSION BRIEFING API
 *
 * GET: Generate a briefing for an upcoming session based on client history
 *
 * Returns structured intelligence:
 * - Last session themes
 * - Emotional tone
 * - Follow-up items
 * - Emerging patterns
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { generateWithClaude } from '@/lib/ai/claudeClient';

async function getPractitionerId(): Promise<string | null> {
  const result = await db.query(
    'SELECT id FROM practitioners WHERE slug = $1',
    ['stellium']
  );
  return result.rows[0]?.id || null;
}

interface SessionHistory {
  id: string;
  scheduled_start: string;
  status: string;
  notes: string | null;
  practitioner_notes: string | null;
  service_name: string | null;
}

interface VoiceNoteHistory {
  session_id: string;
  transcript: string | null;
  created_at: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const memberId = await getMemberIdFromRequest(req);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerId();
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found' }, { status: 404 });
    }

    // Get the current session and its client
    const sessionResult = await db.query(
      `SELECT s.id, s.client_id, s.scheduled_start, c.name as client_name
       FROM sessions s
       LEFT JOIN practitioner_clients c ON s.client_id = c.id
       WHERE s.id = $1 AND s.practitioner_id = $2`,
      [sessionId, practitionerId]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    const currentSession = sessionResult.rows[0];
    const clientId = currentSession.client_id;
    const clientName = currentSession.client_name || 'Client';

    if (!clientId) {
      return NextResponse.json({
        success: true,
        briefing: {
          hasHistory: false,
          clientName,
          message: 'No previous sessions with this client.',
        },
      });
    }

    // Get previous sessions with this client (completed, most recent first)
    const historyResult = await db.query<SessionHistory>(
      `SELECT s.id, s.scheduled_start, s.status, s.notes, s.practitioner_notes,
              svc.name as service_name
       FROM sessions s
       LEFT JOIN services svc ON s.service_id = svc.id
       WHERE s.client_id = $1
         AND s.practitioner_id = $2
         AND s.id != $3
         AND s.status IN ('completed', 'confirmed', 'scheduled')
       ORDER BY s.scheduled_start DESC
       LIMIT 5`,
      [clientId, practitionerId, sessionId]
    );

    if (historyResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        briefing: {
          hasHistory: false,
          clientName,
          message: 'First session with this client.',
        },
      });
    }

    // Get voice note transcripts from previous sessions
    const sessionIds = historyResult.rows.map(s => s.id);
    const voiceNotesResult = await db.query<VoiceNoteHistory>(
      `SELECT session_id, transcript, created_at
       FROM voice_notes
       WHERE session_id = ANY($1) AND practitioner_id = $2
         AND transcription_status = 'completed'
       ORDER BY created_at DESC`,
      [sessionIds, practitionerId]
    );

    // Build context for Claude
    const sessionSummaries = historyResult.rows.map((session, i) => {
      const date = new Date(session.scheduled_start).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const voiceNotes = voiceNotesResult.rows
        .filter(vn => vn.session_id === session.id)
        .map(vn => vn.transcript)
        .filter(Boolean)
        .join('\n');

      return `
Session ${i + 1} (${date}):
- Service: ${session.service_name || 'Session'}
- Status: ${session.status}
${session.notes ? `- Client notes: ${session.notes}` : ''}
${session.practitioner_notes ? `- Practitioner notes: ${session.practitioner_notes}` : ''}
${voiceNotes ? `- Voice note transcript: ${voiceNotes}` : ''}
`.trim();
    }).join('\n\n');

    // Generate briefing with Claude
    const briefingPrompt = `You are a practitioner's assistant helping prepare for an upcoming session.

Based on the session history below, create a brief, actionable pre-session briefing.

CLIENT: ${clientName}
UPCOMING SESSION: ${new Date(currentSession.scheduled_start).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}

PREVIOUS SESSIONS:
${sessionSummaries}

Create a briefing with these sections (keep each section to 1-2 sentences max):

1. LAST SESSION FOCUS: What was the main theme or topic?
2. EMOTIONAL TONE: How was the client's emotional state?
3. FOLLOW-UP: What was discussed that needs follow-up?
4. EMERGING PATTERN: Any recurring theme across sessions?

Format as JSON:
{
  "lastFocus": "...",
  "emotionalTone": "...",
  "followUp": "...",
  "pattern": "..." or null if not enough data
}

Be concise and actionable. Speak directly to the practitioner.`;

    const result = await generateWithClaude({
      systemPrompt: 'You are a precise assistant that outputs only valid JSON. No markdown, no explanation, just the JSON object.',
      userInput: briefingPrompt,
      meta: { reasoningMode: 'analysis' },
    });

    // Parse the JSON response
    let briefingData;
    try {
      // Handle potential markdown code blocks
      let jsonText = result.text.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
      }
      briefingData = JSON.parse(jsonText);
    } catch {
      console.error('[BRIEFING] Failed to parse Claude response:', result.text);
      briefingData = {
        lastFocus: 'Unable to generate summary',
        emotionalTone: 'Review notes manually',
        followUp: 'Check previous session notes',
        pattern: null,
      };
    }

    return NextResponse.json({
      success: true,
      briefing: {
        hasHistory: true,
        clientName,
        sessionCount: historyResult.rows.length,
        lastSessionDate: historyResult.rows[0].scheduled_start,
        ...briefingData,
      },
    });
  } catch (error) {
    console.error('[Studio Briefing] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate briefing' },
      { status: 500 }
    );
  }
}
