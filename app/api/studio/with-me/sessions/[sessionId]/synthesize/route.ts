export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

type Params = { params: Promise<{ sessionId: string }> };

const client = new Anthropic();

export async function POST(req: NextRequest, { params }: Params) {
  const facilitatorId = await getMemberIdFromRequest(req);
  if (!facilitatorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sessionId } = await params;

  const [sessionResult, eventsResult] = await Promise.all([
    query(`SELECT * FROM with_me_sessions WHERE id = $1 AND facilitator_id = $2`, [sessionId, facilitatorId]),
    query(`SELECT * FROM session_events WHERE session_id = $1 ORDER BY created_at ASC`, [sessionId]),
  ]);

  const session = sessionResult.rows[0];
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const events = eventsResult.rows;

  const eventTimeline = events.map((e, i) => {
    const ts = new Date(e.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const payload = e.payload && Object.keys(e.payload).length > 0
      ? `\n  payload: ${JSON.stringify(e.payload)}`
      : '';
    return `${i + 1}. [${ts}] ${e.event_type}${e.elemental_phase ? ` (${e.elemental_phase}${e.spiral_position ? ' / ' + e.spiral_position : ''})` : ''}${payload}`;
  }).join('\n');

  const prompt = `You are reviewing a developmental session to propose memory candidates.

Your role is to identify what is genuinely worth carrying forward into the member's long-term developmental record — not to interpret, analyze, or add meaning beyond what the session itself demonstrated.

SESSION CONTEXT
Intention: ${session.intention || '(not stated)'}
Elemental phase: ${session.elemental_phase || '(not tracked)'}
Spiral position: ${session.spiral_position || '(not tracked)'}
Participant: ${session.member_name || '(unnamed)'}

EVENT TIMELINE
${eventTimeline || '(no events recorded)'}

FACILITATOR NOTES
${session.facilitator_notes || '(none)'}

TRANSCRIPT
${session.transcript || '(none)'}

CLOSING REFLECTION
${session.closing_reflection || '(none)'}

---

Based on what actually happened in this session, propose 3–6 developmental memory candidates.

Each candidate should capture something that would genuinely help the NEXT session begin with deeper continuity — a specific movement recognized, a capacity demonstrated, a commitment made, or a threshold crossed.

Candidates should be:
- Grounded in what was observed, not inferred
- Brief enough to surface in a future session without overwhelming it
- Specific enough to be meaningful (not generic developmental language)
- Honest about uncertainty where it exists

Do NOT propose candidates for anything that wasn't directly demonstrated or stated.
Do NOT synthesize patterns across what might be multiple sessions.
Do NOT write in clinical or diagnostic language.

Respond with a JSON object:
{
  "candidates": [
    {
      "id": "c1",
      "category": "movement_recognized" | "capacity_demonstrated" | "commitment_made" | "threshold_crossed" | "orientation_note",
      "elemental_phase": "<element if relevant>",
      "spiral_position": "<position if relevant>",
      "content": "<the memory, written as a plain observation>",
      "basis": "<what in the session grounds this — direct quote or event reference>",
      "confidence": <0.0–1.0>
    }
  ],
  "synthesis_note": "<one honest sentence about what this session's developmental significance appears to be>"
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
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

  // Store synthesis on the session but do NOT write memory candidates yet — human reviews first
  await query(
    `UPDATE with_me_sessions
     SET synthesis = $1, status = 'synthesized', synthesized_at = NOW()
     WHERE id = $2`,
    [JSON.stringify(synthesis), sessionId],
  );

  return NextResponse.json({ synthesis });
}
