export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';

/**
 * POST /api/scribe/import-transcript
 *
 * Session Room threshold (Step 1) — "Add a transcript" threshold path.
 * Spec: docs/architecture/SESSION_ROOM_THRESHOLD_2026-07-19.md
 *
 * Creates an UNASSIGNED, completed scribe session from pasted or .txt
 * transcript text and stores its turns, so the material enters the same
 * review surface as live-captured sessions.
 *
 * Safeguards (spec, non-negotiable):
 * - Consent before processing: the request must carry explicit confirmations
 *   of authority over the material and permission for AI processing. Nothing
 *   is parsed or stored without them.
 * - Unassigned-first: NO client, relationship record, or rl_session is
 *   created or accepted here. Association is an explicit later action.
 *   (Extends the Parent Update no-synthetic-rl_session ruling.)
 * - Never invent attribution: document-supplied labels are preserved in
 *   participant_label; speaker is always 'unknown' until the Step 2
 *   speaker-confirmation screen maps identities.
 *
 * Body: {
 *   text: string,                 // transcript content (paste or .txt)
 *   method?: 'paste' | 'txt',    // provenance of the text
 *   title?: string,
 *   container?: 'solo' | 'witness' | 'practitioner',
 *   memoryPolicy?: 'sealed' | 'learning',   // default 'sealed'
 *   sessionDate?: string,        // ISO date the session took place (optional)
 *   confirmAuthority: true,      // "I have authority to bring this material"
 *   allowAiProcessing: true,     // "MAIA may process this material"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, insertOne } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';
import { parseTranscript, estimateDurationMs, assignOffsets, MAX_IMPORT_CHARS } from '@/lib/scribe/transcriptImport';

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
    const {
      text,
      method = 'paste',
      title,
      container = 'practitioner',
      memoryPolicy = 'sealed',
      sessionDate,
      confirmAuthority,
      allowAiProcessing,
    } = body ?? {};

    // Consent threshold (minimal Step 1 form). Refusal explains itself.
    if (confirmAuthority !== true || allowAiProcessing !== true) {
      return NextResponse.json(
        {
          error:
            'Import requires two explicit confirmations before any processing: that you have authority to bring this material, and that MAIA may process it. Neither is inferred.',
          code: 'CONSENT_REQUIRED',
        },
        { status: 400 }
      );
    }

    if (typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'No transcript text provided', code: 'EMPTY_TRANSCRIPT' },
        { status: 400 }
      );
    }
    if (text.length > MAX_IMPORT_CHARS) {
      return NextResponse.json(
        { error: `Transcript exceeds the ${MAX_IMPORT_CHARS.toLocaleString()}-character import limit`, code: 'TOO_LARGE' },
        { status: 400 }
      );
    }
    if (!['solo', 'witness', 'practitioner'].includes(container)) {
      return NextResponse.json(
        { error: 'Invalid container type', code: 'INVALID_CONTAINER' },
        { status: 400 }
      );
    }
    if (!['sealed', 'learning'].includes(memoryPolicy)) {
      return NextResponse.json(
        { error: 'Invalid memory policy', code: 'INVALID_MEMORY_POLICY' },
        { status: 400 }
      );
    }
    if (!['paste', 'txt'].includes(method)) {
      return NextResponse.json(
        { error: 'Invalid import method', code: 'INVALID_METHOD' },
        { status: 400 }
      );
    }

    const parsed = parseTranscript(text);
    if (parsed.turns.length === 0) {
      return NextResponse.json(
        { error: 'No readable turns found in the transcript', code: 'NO_TURNS' },
        { status: 400 }
      );
    }

    // Timeline: strictly monotonic offsets preserving document order —
    // supplied timestamps where the document has them, small synthetic steps
    // where it doesn't. Duration without timestamps is a word-count ESTIMATE,
    // recorded as such in provenance, never presented as a measured length.
    const durationEstimated = !parsed.timestampsSupplied;
    const fallbackStep = parsed.timestampsSupplied
      ? 2_000
      : Math.max(1_000, Math.floor(estimateDurationMs(parsed.turns) / parsed.turns.length));
    const offsets = assignOffsets(parsed.turns, fallbackStep);
    const durationMs = Math.max(offsets[offsets.length - 1], 60_000);

    const startedAt = sessionDate ? new Date(sessionDate) : new Date(Date.now() - durationMs);
    if (isNaN(startedAt.getTime())) {
      return NextResponse.json(
        { error: 'Invalid sessionDate', code: 'INVALID_DATE' },
        { status: 400 }
      );
    }
    const endedAt = new Date(startedAt.getTime() + durationMs);

    // UNASSIGNED session: member-owned, completed, no client/case/booking link.
    const session = await insertOne('scribe_sessions', {
      member_id: memberId,
      container,
      title: (typeof title === 'string' && title.trim()) || 'Imported transcript',
      participants: JSON.stringify([]),
      memory_policy: memoryPolicy,
      consent_status: 'confirmed',
      consent_method: 'tap',
      consent_confirmed_at: new Date(),
      is_active: false,
      transcript_enabled: true,
      started_at: startedAt,
      ended_at: endedAt,
      summary: JSON.stringify({
        imported: {
          method,
          importedAt: new Date().toISOString(),
          timestampsSupplied: parsed.timestampsSupplied,
          durationEstimated,
          speakerLabelsSupplied: parsed.speakerLabels.length > 0,
          speakerLabels: parsed.speakerLabels,
          turnCount: parsed.turns.length,
        },
      }),
    });

    // Batched insert of turns. speaker='unknown' always — identity mapping is
    // Step 2; the document's own labels ride in participant_label.
    const CHUNK = 500;
    for (let offset = 0; offset < parsed.turns.length; offset += CHUNK) {
      const chunk = parsed.turns.slice(offset, offset + CHUNK);
      const values: string[] = [];
      const params: unknown[] = [];
      chunk.forEach((t, i) => {
        const idx = offset + i;
        const spokenAt = new Date(startedAt.getTime() + offsets[idx]);
        const p = params.length;
        values.push(`(gen_random_uuid(), $${p + 1}, 'unknown', $${p + 2}, $${p + 3}, $${p + 4})`);
        params.push(session.id, t.label, t.text, spokenAt);
      });
      await query(
        `INSERT INTO scribe_transcript_entries (id, session_id, speaker, participant_label, content, spoken_at)
         VALUES ${values.join(', ')}`,
        params
      );
    }

    console.log(
      `[Scribe] Imported transcript session ${String(session.id).slice(0, 8)} for member ${memberId.slice(0, 8)}: ` +
        `${parsed.turns.length} turns, labels=${parsed.speakerLabels.length}, timestamps=${parsed.timestampsSupplied}, method=${method}`
    );

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        title: session.title,
        container,
        segmentCount: parsed.turns.length,
        durationSeconds: Math.round(durationMs / 1000),
        durationEstimated,
        speakerLabels: parsed.speakerLabels,
        timestampsSupplied: parsed.timestampsSupplied,
      },
    });
  } catch (err: any) {
    console.error('[POST /api/scribe/import-transcript]', err);
    return NextResponse.json({ error: err.message || 'Import failed' }, { status: 500 });
  }
}
