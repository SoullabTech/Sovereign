export const dynamic = 'force-dynamic';

/**
 * Extract candidate moments from the encounter transcript using Claude.
 *
 * Returns candidates ONLY — does not persist them.
 * The client reviews and saves individually via POST /moments.
 *
 * All candidates are marked artifact_type='ai_candidate' and explicitly provisional.
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

const EXTRACT_SYSTEM = `You are MAIA — a sovereignty-oriented companion for practitioners.

Your task: read the provided session transcript and identify CANDIDATE moments worth the practitioner's attention.

MOMENT TYPES you may identify:
- emotional_shift: a visible or audible shift in emotional tone or state
- insight: a moment of apparent realization or new understanding
- resistance: hesitation, deflection, or avoidance around a topic
- aliveness: heightened engagement, energy, or presence
- unresolved_question: a question or theme left open that may carry forward
- intervention: a practitioner action (question, reflection, reframe) that shifted the conversation
- self_recognition: a moment where the client seemed to recognize something about themselves

EPISTEMIC DISCIPLINE — NON-NEGOTIABLE:
Every candidate you return is PROVISIONAL. You are reading text, not observing the session. You may be wrong. The practitioner is the authority on what was actually happening. Mark your confidence honestly (0.0–1.0). A score of 0.7+ should be rare.

OUTPUT FORMAT — respond with a JSON array ONLY, no surrounding text:
[
  {
    "moment_type": "insight",
    "title": "Brief descriptive title (max 60 chars)",
    "start_ms": 0,
    "end_ms": 0,
    "excerpt": "Exact or near-exact quote from the transcript",
    "candidate_interpretation": "What this moment may represent — held tentatively",
    "confidence": 0.5
  }
]

- start_ms / end_ms: estimate in milliseconds if turn timing is available; otherwise use 0
- Return 3-8 candidates. Quality over quantity.
- Do not invent moments not supported by the transcript text.`;

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { practitionerId } = identity;
    const { id: encounterId } = await params;

    const encounterRes = await db.query(
      `SELECT id, title, transcription_status FROM encounters WHERE id = $1 AND practitioner_id = $2`,
      [encounterId, practitionerId]
    );
    if (encounterRes.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const encounter = encounterRes.rows[0];
    if (encounter.transcription_status !== 'complete') {
      return NextResponse.json({ error: 'Transcript not yet available' }, { status: 400 });
    }

    const tRes = await db.query(
      `SELECT * FROM encounter_transcripts WHERE encounter_id = $1`,
      [encounterId]
    );
    if (tRes.rows.length === 0) {
      return NextResponse.json({ error: 'No transcript found' }, { status: 400 });
    }

    const transcript = decryptTranscriptRow(tRes.rows[0], encounterId);
    const turnsRes = await db.query(
      `SELECT * FROM transcript_turns WHERE transcript_id = $1 ORDER BY turn_index`,
      [tRes.rows[0].id]
    );
    const turns = decryptTurnRows(turnsRes.rows, encounterId);

    const turnsText = turns
      .map((t: { turn_index: number; speaker?: string; text?: string; start_ms?: number; end_ms?: number }) =>
        `[Turn ${t.turn_index}${t.start_ms != null ? ` @${t.start_ms}ms` : ''}] ${t.speaker ?? 'Unknown'}: ${t.text ?? ''}`
      )
      .join('\n');

    const userContent = `ENCOUNTER: ${encounter.title}\n\nTRANSCRIPT:\n${turnsText || (transcript.raw_text ?? '[No text available]')}`;

    const llm = getLLMProvider();
    const response = await llm.generateSimple({
      tier: 'deep',
      systemPrompt: EXTRACT_SYSTEM,
      messages: [{ role: 'user', content: userContent }],
      maxTokens: 3000,
    });

    let candidates: unknown[] = [];
    try {
      const raw = response.text.trim();
      // Strip markdown code fences if present
      const jsonText = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      candidates = JSON.parse(jsonText);
      if (!Array.isArray(candidates)) throw new Error('Expected array');
    } catch {
      console.error('[Moments Extract] Failed to parse LLM response:', response.text.slice(0, 200));
      return NextResponse.json({ error: 'Extraction failed — malformed response' }, { status: 502 });
    }

    // Normalize and tag all candidates
    const normalized = candidates.map((c: unknown) => {
      const m = c as Record<string, unknown>;
      return {
        moment_type: m.moment_type ?? 'insight',
        title: String(m.title ?? '').slice(0, 255),
        start_ms: typeof m.start_ms === 'number' ? m.start_ms : 0,
        end_ms: typeof m.end_ms === 'number' ? m.end_ms : 0,
        excerpt: m.excerpt ?? null,
        candidate_interpretation: m.candidate_interpretation ?? null,
        confidence: typeof m.confidence === 'number'
          ? Math.max(0, Math.min(1, m.confidence))
          : 0.4,
        artifact_type: 'ai_candidate',
        status: 'candidate',
      };
    });

    return NextResponse.json({ candidates: normalized });
  } catch (error) {
    console.error('[Moments Extract] POST error:', error);
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 });
  }
}
