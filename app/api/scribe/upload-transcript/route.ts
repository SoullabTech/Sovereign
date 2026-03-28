export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';

/**
 * POST /api/scribe/upload-transcript
 *
 * Create a scribe session from a pasted/uploaded transcript.
 * Splits the text into entries, stores them, marks the session as complete,
 * and returns the session ID so the client can open SessionReviewChat.
 *
 * Body:
 *   transcript: string       — the raw transcript text
 *   container: string        — 'solo' | 'witness' | 'practitioner'
 *   title?: string           — optional session title
 *   memoryPolicy?: string    — 'sealed' | 'learning' (default: 'sealed')
 */

import { NextRequest, NextResponse } from 'next/server';
import { insertOne, query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ParsedEntry {
  speaker: string;
  content: string;
  spokenAt: Date;
}

/**
 * Split raw transcript text into individual entries.
 * Supports common formats:
 *   [00:05] Speaker: text
 *   Speaker: text
 *   Plain paragraphs (treated as single-speaker entries)
 */
function parseTranscript(rawText: string, sessionStart: Date): ParsedEntry[] {
  const lines = rawText.split('\n').filter(l => l.trim().length > 0);
  const entries: ParsedEntry[] = [];

  // Detect format: timestamped, speaker-labelled, or plain
  const timestampPattern = /^\[?(\d{1,2}):(\d{2})(?::(\d{2}))?\]?\s*/;
  const speakerPattern = /^([A-Za-z][A-Za-z0-9 ._'-]{0,40}):\s+/;

  let cumulativeMs = 0;
  const entrySpacingMs = 5000; // 5s between entries when no timestamps

  for (const line of lines) {
    let offsetMs = cumulativeMs;
    let remaining = line.trim();
    let speaker = 'self';

    // Try to extract timestamp
    const tsMatch = remaining.match(timestampPattern);
    if (tsMatch) {
      const hours = tsMatch[3] !== undefined ? parseInt(tsMatch[1]) : 0;
      const minutes = tsMatch[3] !== undefined ? parseInt(tsMatch[2]) : parseInt(tsMatch[1]);
      const seconds = tsMatch[3] !== undefined ? parseInt(tsMatch[3]) : parseInt(tsMatch[2]);
      offsetMs = ((hours * 60 + minutes) * 60 + seconds) * 1000;
      remaining = remaining.slice(tsMatch[0].length);
    }

    // Try to extract speaker label
    const spkMatch = remaining.match(speakerPattern);
    if (spkMatch) {
      const label = spkMatch[1].trim().toLowerCase();
      // Map common labels to schema values
      if (['maia', 'maya', 'assistant', 'ai'].includes(label)) {
        speaker = 'maia';
      } else if (['self', 'me', 'i'].includes(label)) {
        speaker = 'self';
      } else {
        speaker = 'other';
      }
      remaining = remaining.slice(spkMatch[0].length);
    }

    if (remaining.trim().length === 0) continue;

    entries.push({
      speaker,
      content: remaining.trim(),
      spokenAt: new Date(sessionStart.getTime() + offsetMs),
    });

    cumulativeMs = offsetMs + entrySpacingMs;
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

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
    const { transcript, container = 'solo', title, memoryPolicy = 'sealed' } = body;

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Transcript text is required', code: 'MISSING_TRANSCRIPT' },
        { status: 400 }
      );
    }

    if (!['solo', 'witness', 'practitioner'].includes(container)) {
      return NextResponse.json(
        { error: 'Invalid container type', code: 'INVALID_CONTAINER' },
        { status: 400 }
      );
    }

    const sessionStart = new Date();
    const entries = parseTranscript(transcript, sessionStart);

    if (entries.length === 0) {
      return NextResponse.json(
        { error: 'Could not parse any entries from transcript', code: 'PARSE_FAILED' },
        { status: 400 }
      );
    }

    // Estimate duration from last entry
    const lastEntryTime = entries[entries.length - 1].spokenAt;
    const durationMs = lastEntryTime.getTime() - sessionStart.getTime();
    const endedAt = new Date(sessionStart.getTime() + Math.max(durationMs, 60000));

    // 1. Create scribe session (already closed)
    const session = await insertOne('scribe_sessions', {
      member_id: memberId,
      container,
      title: title?.trim() || `Uploaded transcript — ${new Date().toLocaleDateString()}`,
      started_at: sessionStart.toISOString(),
      ended_at: endedAt.toISOString(),
      is_active: false,
      consent_status: 'confirmed',
      memory_policy: memoryPolicy,
      transcript_enabled: true,
    });

    // 2. Bulk insert transcript entries
    if (entries.length > 0) {
      const values: string[] = [];
      const params: any[] = [];
      let paramIdx = 1;

      for (const entry of entries) {
        values.push(`($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2}, $${paramIdx + 3})`);
        params.push(session.id, entry.speaker, entry.content, entry.spokenAt.toISOString());
        paramIdx += 4;
      }

      await query(
        `INSERT INTO scribe_transcript_entries (session_id, speaker, content, spoken_at)
         VALUES ${values.join(', ')}`,
        params
      );
    }

    console.log(`[Scribe] Uploaded transcript: ${session.id} | ${entries.length} entries | ${container} | member ${memberId}`);

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        container: session.container,
        title: session.title,
        entryCount: entries.length,
        durationSeconds: Math.round((endedAt.getTime() - sessionStart.getTime()) / 1000),
      },
    });
  } catch (error: any) {
    console.error('[Scribe] Upload transcript error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload transcript', code: 'UPLOAD_FAILED' },
      { status: 500 }
    );
  }
}
