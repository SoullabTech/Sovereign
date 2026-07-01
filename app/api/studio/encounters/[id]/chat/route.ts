export const dynamic = 'force-dynamic';

/**
 * Encounter-grounded MAIA chat.
 * Loads the decrypted transcript, builds a scoped system prompt,
 * and returns a non-streaming JSON response with optional cited turn indices.
 *
 * AI responses are candidate interpretations, not authoritative facts —
 * this constraint is enforced in the system prompt.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import {
  decryptTranscriptRow,
  decryptTurnRows,
} from '@/lib/security/phiAccessors/encounterTranscripts';

type Params = { params: Promise<{ id: string }> };

const ENCOUNTER_CHAT_SYSTEM = `You are MAIA — a sovereignty-oriented companion for practitioners engaging with session material.

You are reflecting on a specific encounter transcript. Your role:
- Help the practitioner notice patterns, themes, and moments they may have missed
- Surface questions rather than conclusions wherever possible
- Cite specific transcript moments (by turn index) when your observations are grounded in them
- Never diagnose, prescribe, or claim interpretive authority over the client's process or the practitioner's judgment

EPISTEMIC DISCIPLINE — NON-NEGOTIABLE:
Every observation you offer is a CANDIDATE INTERPRETATION, not a fact. The transcript is a partial record. You cannot know what was happening internally for either participant. You may propose; you may not conclude. Always hold your interpretations lightly and say so when appropriate.

When citing transcript turns, include their index numbers in your response so they can be referenced.
Format cited turns as: [Turn N] or [Turns N, M]

Respond warmly but concisely. 2-5 sentences unless more depth is explicitly requested.`;

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { practitionerId } = identity;
    const { id: encounterId } = await params;

    const encounterRes = await db.query(
      `SELECT e.*, array_agg(ep.display_name || ' (' || ep.role || ')') FILTER (WHERE ep.id IS NOT NULL) AS participant_labels
       FROM encounters e
       LEFT JOIN encounter_participants ep ON ep.encounter_id = e.id
       WHERE e.id = $1 AND e.practitioner_id = $2
       GROUP BY e.id`,
      [encounterId, practitionerId]
    );
    if (encounterRes.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const encounter = encounterRes.rows[0];

    if (encounter.transcription_status !== 'complete') {
      return NextResponse.json({ error: 'Transcript not yet available' }, { status: 400 });
    }

    const body = await request.json();
    const { message } = body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    // Load transcript + turns
    const tRes = await db.query(
      `SELECT * FROM encounter_transcripts WHERE encounter_id = $1`,
      [encounterId]
    );
    const transcript = tRes.rows[0] ? decryptTranscriptRow(tRes.rows[0], encounterId) : null;

    let turnsText = '';
    const turnIndices: number[] = [];
    if (tRes.rows[0]) {
      const turnsRes = await db.query(
        `SELECT * FROM transcript_turns WHERE transcript_id = $1 ORDER BY turn_index`,
        [tRes.rows[0].id]
      );
      const turns = decryptTurnRows(turnsRes.rows, encounterId);
      turnsText = turns
        .map((t: { turn_index: number; speaker?: string; text?: string }) => {
          turnIndices.push(t.turn_index);
          return `[Turn ${t.turn_index}] ${t.speaker ?? 'Unknown'}: ${t.text ?? ''}`;
        })
        .join('\n');
    }

    const participantContext = Array.isArray(encounter.participant_labels)
      ? encounter.participant_labels.filter(Boolean).join(', ')
      : '';

    const contextBlock = [
      `ENCOUNTER: ${encounter.title}`,
      participantContext ? `PARTICIPANTS: ${participantContext}` : '',
      transcript ? `WORD COUNT: ${transcript.word_count ?? 'unknown'}` : '',
      '',
      'TRANSCRIPT:',
      turnsText || '[No turns available]',
    ]
      .filter((l) => l !== null)
      .join('\n');

    const systemPrompt = `${ENCOUNTER_CHAT_SYSTEM}\n\n---\n\n${contextBlock}`;

    const llm = getLLMProvider();
    const response = await llm.generateSimple({
      tier: 'core',
      systemPrompt,
      messages: [{ role: 'user', content: message.trim() }],
      maxTokens: 1200,
    });

    // Extract cited turn indices from response text
    const citedTurns: number[] = [];
    const citationRegex = /\[Turn[s]?\s+([\d,\s]+)\]/gi;
    let match;
    while ((match = citationRegex.exec(response.text)) !== null) {
      const nums = match[1].split(',').map((n: string) => parseInt(n.trim())).filter((n: number) => !isNaN(n));
      citedTurns.push(...nums);
    }

    return NextResponse.json({
      reply: response.text,
      cited_turns: citedTurns.length > 0 ? [...new Set(citedTurns)] : undefined,
    });
  } catch (error) {
    console.error('[Encounter Chat] POST error:', error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
