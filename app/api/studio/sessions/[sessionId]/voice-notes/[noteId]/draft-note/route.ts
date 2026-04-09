export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * DRAFT SESSION NOTE FROM VOICE TRANSCRIPT
 *
 * Takes a transcribed voice note and generates a structured session note
 * via Claude. The practitioner reviews/edits before saving.
 *
 * Table: voice_notes
 * Sovereignty: Uses Anthropic API (Claude) — the only external AI call
 * permitted per CLAUDE.md. No OpenAI, no cloud transcription.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getPractitionerIdForMember } from '@/lib/studio/getPractitionerIdForMember';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import { writebackStudioSession, extractThemesFromNote } from '@/lib/practitioner/studioWriteback';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; noteId: string }> }
) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found for member' }, { status: 404 });
    }

    const { sessionId, noteId } = await params;

    // Load voice note from voice_notes
    const noteResult = await db.query(
      `SELECT id, transcript, transcription_status
       FROM voice_notes
       WHERE id = $1 AND session_id = $2 AND practitioner_id = $3`,
      [noteId, sessionId, practitionerId]
    );

    if (noteResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Voice note not found' },
        { status: 404 }
      );
    }

    const voiceNote = noteResult.rows[0];

    if (!voiceNote.transcript || voiceNote.transcription_status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Voice note has not been transcribed yet' },
        { status: 400 }
      );
    }

    // Load session context (client name, service, date, duration)
    const sessionResult = await db.query(
      `SELECT s.scheduled_start, s.scheduled_end, s.notes,
              s.client_id, s.location_type,
              c.name AS client_name,
              svc.name AS service_name
       FROM sessions s
       LEFT JOIN practitioner_clients c ON c.id = s.client_id
       LEFT JOIN services svc ON svc.id = s.service_id
       WHERE s.id = $1 AND s.practitioner_id = $2`,
      [sessionId, practitionerId]
    );

    const session = sessionResult.rows[0];
    const clientName = session?.client_name || 'Client';
    const serviceName = session?.service_name || 'Session';
    const sessionDate = session?.scheduled_start
      ? new Date(session.scheduled_start).toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
        })
      : 'Unknown date';
    const durationMinutes = session?.scheduled_start && session?.scheduled_end
      ? Math.round((new Date(session.scheduled_end).getTime() - new Date(session.scheduled_start).getTime()) / 60000)
      : null;

    console.log('[DRAFT-NOTE] Generating for session:', sessionId, 'client:', clientName);

    // Build prompt
    const prompt = `You are a clinical session note assistant for a practitioner.

Given the following voice transcript recorded after a session, draft a concise, structured session note.

**Session context:**
- Client: ${clientName}
- Date: ${sessionDate}
- Service: ${serviceName}${durationMinutes ? ` (${durationMinutes} min)` : ''}

**Voice transcript:**
${voiceNote.transcript}

**Instructions:**
- Draft a structured note with these sections: **Key Themes**, **Client Presentation**, **Observations**, **Next Steps**
- Be concise and professional
- Do not add information not present in the transcript
- Use third person for the client
- If the transcript is sparse, keep the note brief rather than embellishing
- Format with markdown headers`;

    // Call Claude
    const llmResponse = await getLLMProvider().generateSimple({
      tier: 'core',
      systemPrompt: '',
      messages: [
        { role: 'user', content: prompt },
      ],
      maxTokens: 2000,
      temperature: 0.3,
    });

    const draftedNote = llmResponse.text;

    // Save drafted note back to voice_notes
    await db.query(
      `UPDATE voice_notes SET drafted_note = $1, updated_at = NOW() WHERE id = $2`,
      [draftedNote, noteId]
    );

    console.log('[DRAFT-NOTE] Generated:', draftedNote.length, 'chars');

    // Write back to practitioner_sessions so the briefing engine can see this
    // session's data next time. Non-fatal — don't block the response.
    if (session?.client_id && session?.scheduled_start && session?.scheduled_end) {
      try {
        const themes = extractThemesFromNote(draftedNote);
        await writebackStudioSession({
          studioSessionId: sessionId,
          practitionerId,
          clientId: session.client_id,
          scheduledStart: session.scheduled_start,
          scheduledEnd: session.scheduled_end,
          locationType: session.location_type || 'video',
          sessionNotes: draftedNote,
          themes,
          serviceName: serviceName || undefined,
        });
      } catch (writebackErr: any) {
        console.error('[DRAFT-NOTE] Write-back failed (non-fatal):', writebackErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      draftedNote,
      voiceNoteId: noteId,
    });
  } catch (error: any) {
    console.error('[DRAFT-NOTE] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to draft session note' },
      { status: 500 }
    );
  }
}
