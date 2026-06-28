export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

type Params = { params: Promise<{ sessionId: string }> };

const client = new Anthropic();

function formatElapsed(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export async function POST(req: NextRequest, { params }: Params) {
  const facilitatorId = await getMemberIdFromRequest(req);
  if (!facilitatorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sessionId } = await params;

  const [sessionResult, eventsResult] = await Promise.all([
    query(`SELECT * FROM with_me_sessions WHERE id = $1 AND facilitator_id = $2`, [sessionId, facilitatorId]),
    query(
      `SELECT * FROM session_events WHERE session_id = $1 ORDER BY created_at ASC`,
      [sessionId],
    ),
  ]);

  const session = sessionResult.rows[0];
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const events = eventsResult.rows;

  // Separate manual bookmarks from spoken markers
  const manualBookmarks = events
    .filter(e => e.event_type === 'facilitator_bookmark' && e.payload?.trigger === 'manual')
    .map(e => ({
      elapsed: formatElapsed(e.payload?.timestamp_seconds ?? 0),
      timestamp_seconds: e.payload?.timestamp_seconds ?? 0,
    }));

  const spokenMarkers = events
    .filter(e => e.event_type === 'facilitator_bookmark' && e.payload?.trigger === 'spoken_marker')
    .map(e => ({
      phrase: e.payload?.phrase ?? '',
      context: e.payload?.context ?? '',
      elapsed: formatElapsed(e.payload?.timestamp_seconds ?? 0),
    }));

  const sessionDurationSecs = session.closed_at
    ? Math.round((new Date(session.closed_at).getTime() - new Date(session.created_at).getTime()) / 1000)
    : null;

  const bookmarkBlock = manualBookmarks.length > 0
    ? manualBookmarks.map((b, i) => `Bookmark ${i + 1}: ${b.elapsed}`).join('\n')
    : '(no manual bookmarks)';

  const spokenBlock = spokenMarkers.length > 0
    ? spokenMarkers.map((m, i) =>
        `Spoken marker ${i + 1}: "${m.phrase}" at ${m.elapsed}\n  Context: "...${m.context}..."`
      ).join('\n')
    : '(none)';

  const prompt = `You are reviewing a facilitation session to propose developmental memory candidates.

The facilitator did not classify events during the session. Instead, they marked moments using a single bookmark signal — a felt sense that something significant was happening. Your task is to interpret those marks, and to independently notice threshold signals in the transcript.

SESSION CONTEXT
Participant: ${session.member_name || '(unnamed)'}
Intention: ${session.intention || '(not stated)'}
Duration: ${sessionDurationSecs ? formatElapsed(sessionDurationSecs) : '(unknown)'}

FACILITATOR BOOKMARKS (manual — felt moment, no classification)
${bookmarkBlock}

SPOKEN MARKERS (detected in transcript — facilitator said these aloud)
${spokenBlock}

FACILITATOR NOTES
${session.facilitator_notes || '(none)'}

TRANSCRIPT
${session.transcript || '(none)'}

CLOSING REFLECTION
${session.closing_reflection || '(none)'}

---

TASK

Step 1 — Interpret each facilitator bookmark:
For each bookmark timestamp, examine the transcript content near that elapsed time (estimate by proportional position if no timestamps are embedded). Propose what the developmental significance may have been. Use the following categories:
- observer_capacity_shift: a shift from identification with experience to witnessing it ("I am fear" → "part of me is afraid")
- movement_recognized: a pattern, part, or inner figure named and seen
- orientation_restored: the person regains grounding or directional sense
- protector_named: a defensive pattern surfaced and recognized
- closing_commitment: a stated intention or direction the person chose
- memory_candidate: something worth carrying into the next session without a more specific type

Step 2 — Scan independently for threshold signals not bookmarked:
Look for:
- Pronoun shifts: "I am..." → "part of me..." / "something in me..."
- Sudden insight language: "wait...", "I just realized", "oh...", "I've never said that out loud"
- Subject inversions: person stops talking about others, begins talking about self
- Threshold phrases: "that's exactly what...", "I don't know why but..."
Mark these as source_type: "autonomous" — the facilitator did not bookmark them.

Step 3 — For each spoken marker, examine the context excerpt. Propose what the moment likely represented.

CONSTRAINTS
- Do not propose candidates for moments with no supporting evidence in transcript or notes
- Do not synthesize across sessions or infer history beyond this conversation
- Be honest about uncertainty — low confidence is better than false precision
- Write content as a plain observation, not clinical language

Respond with a JSON object:
{
  "candidates": [
    {
      "id": "c1",
      "category": "observer_capacity_shift" | "movement_recognized" | "orientation_restored" | "protector_named" | "closing_commitment" | "memory_candidate",
      "elemental_phase": "<element if inferable from context, else null>",
      "spiral_position": "<position if stated, else null>",
      "content": "<the developmental observation, written as plain fact>",
      "basis": "<what in the session grounds this — direct quote, bookmark timing, or autonomous signal>",
      "confidence": <0.0–1.0>,
      "bookmark_timestamp": "<e.g. '4:23' if linked to a bookmark, else null>",
      "source_type": "bookmark" | "spoken_marker" | "autonomous"
    }
  ],
  "synthesis_note": "<one honest sentence about what this session's developmental significance appears to be>"
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: 'Synthesis failed to produce structured output' }, { status: 500 });
  }

  let synthesis: unknown;
  try {
    synthesis = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json({ error: 'Failed to parse synthesis output' }, { status: 500 });
  }

  // Store synthesis — human reviews before anything enters developmental memory
  await query(
    `UPDATE with_me_sessions
     SET synthesis = $1, status = 'synthesized', synthesized_at = NOW()
     WHERE id = $2`,
    [JSON.stringify(synthesis), sessionId],
  );

  return NextResponse.json({ synthesis });
}
