/**
 * Session Data Loader — loads session content for follow-up generation
 *
 * Extracts session transcript, markers, and metadata from the database.
 * Uses the same tables as buildSessionReviewPrompt but returns structured data
 * suitable for the follow-up prompt builder.
 */

import { query } from '@/lib/db/postgres';
import { cleanTranscriptTexts } from '@/lib/scribe/transcriptCleaner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SessionData {
  sessionId: string;
  container: string;
  title: string | null;
  startedAt: Date;
  endedAt: Date | null;
  durationMinutes: number;
  transcript: Array<{ speaker: string; text: string; startMs: number }>;
  markers: Array<{ markerType: string; note: string | null; tsMs: number }>;
  reviewableContentExists: boolean;
  assembledTurnCount: number;
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export async function loadSessionData(opts: {
  sessionId: string;
  caseId: string | null;
}): Promise<SessionData | null> {
  const { sessionId } = opts;

  // 1. Load scribe session
  const sessionResult = await query(
    `SELECT id, container, title, started_at, ended_at, is_active
     FROM scribe_sessions WHERE id = $1`,
    [sessionId],
  );

  if (sessionResult.rows.length === 0) return null;
  const session = sessionResult.rows[0];

  const startedAt = new Date(session.started_at);
  const endedAt = session.ended_at ? new Date(session.ended_at) : null;
  const durationMinutes = endedAt
    ? Math.round((endedAt.getTime() - startedAt.getTime()) / 60000)
    : 0;

  // 2. Try assembled turns first (highest quality)
  let transcript: Array<{ speaker: string; text: string; startMs: number }> = [];
  let assembledTurnCount = 0;

  // Find supervision session linked to this scribe session
  const supervisionResult = await query(
    `SELECT id FROM supervision_sessions
     WHERE metadata->>'scribeSessionId' = $1
     LIMIT 1`,
    [sessionId],
  );

  if (supervisionResult.rows.length > 0) {
    const supSessionId = supervisionResult.rows[0].id;

    // Try assembled turns
    const assembledResult = await query(
      `SELECT speaker, text, start_ms, end_ms
       FROM supervision_assembled_turns
       WHERE session_id = $1
       ORDER BY chunk_index_start ASC, start_ms ASC`,
      [supSessionId],
    );

    if (assembledResult.rows.length > 0) {
      assembledTurnCount = assembledResult.rows.length;
      transcript = assembledResult.rows.map((r: any) => ({
        speaker: r.speaker || 'unknown',
        text: r.text || '',
        startMs: r.start_ms || 0,
      }));
    } else {
      // Fall back to raw segments
      const segmentResult = await query(
        `SELECT speaker, text, start_ms
         FROM supervision_transcript_segments
         WHERE session_id = $1 AND is_final = true AND text IS NOT NULL AND text != ''
         ORDER BY chunk_index ASC, end_ms ASC`,
        [supSessionId],
      );

      transcript = segmentResult.rows.map((r: any) => ({
        speaker: r.speaker || 'unknown',
        text: r.text || '',
        startMs: r.start_ms || 0,
      }));
    }
  }

  // 3. If no supervision transcript, try scribe_transcript_entries
  if (transcript.length === 0) {
    const entriesResult = await query(
      `SELECT speaker, content, spoken_at
       FROM scribe_transcript_entries
       WHERE session_id = $1
       ORDER BY spoken_at ASC`,
      [sessionId],
    );

    transcript = entriesResult.rows.map((r: any) => ({
      speaker: r.speaker || 'unknown',
      text: r.content || '',
      startMs: r.spoken_at ? new Date(r.spoken_at).getTime() - startedAt.getTime() : 0,
    }));
  }

  // 4. Clean transcript (remove phantom prefixes)
  if (transcript.length > 0) {
    const rawTexts = transcript.map((t) => t.text);
    const cleaned = cleanTranscriptTexts(rawTexts);
    transcript = transcript.map((t, i) => ({
      ...t,
      text: cleaned.texts[i] || t.text,
    }));
    // Remove empty entries after cleaning
    transcript = transcript.filter((t) => t.text.trim().length > 0);
  }

  // 5. Load markers
  const markersResult = await query(
    `SELECT marker_type, note, created_at
     FROM scribe_markers
     WHERE session_id = $1
     ORDER BY created_at ASC`,
    [sessionId],
  );

  const markers = markersResult.rows.map((r: any) => ({
    markerType: r.marker_type,
    note: r.note || null,
    tsMs: r.created_at ? new Date(r.created_at).getTime() - startedAt.getTime() : 0,
  }));

  // 6. Sample long transcripts (head + middle + tail)
  if (transcript.length > 200) {
    const head = transcript.slice(0, 50);
    const tail = transcript.slice(-30);
    const middle = transcript.slice(50, -30);
    const step = Math.max(1, Math.floor(middle.length / 120));
    const sampled = middle.filter((_, i) => i % step === 0);
    transcript = [...head, ...sampled, ...tail];
  }

  return {
    sessionId,
    container: session.container || 'solo',
    title: session.title,
    startedAt,
    endedAt,
    durationMinutes,
    transcript,
    markers,
    reviewableContentExists: transcript.length > 0 || assembledTurnCount > 0,
    assembledTurnCount,
  };
}
