export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireCohort, isGateResponse } from '@/lib/beta-testers/requireCohort';

/**
 * Tester Observation Stream — SEALED.
 *
 * Reads and writes ONLY beta_observations. It is intentionally NOT connected to
 * atoms, recall, semantic memory, or any conversation context. Member Memory ≠
 * Beta Observation ≠ Platform Learning. Do not add a memory write here.
 *
 * Submissions default to visibility='admin_review' (eligible for curation). A
 * tester may keep an observation 'private' — those are never shown to admins.
 */

const VALID_PROMPT_TYPES = ['helped_notice', 'missed', 'clearer_later', 'confused_when', 'returned_later'];
const VALID_ELEMENTS = ['fire', 'water', 'earth', 'air', 'aether'];

/** GET — a tester's OWN observations only (supports the "Return Later" practice). */
export async function GET(request: NextRequest) {
  const gate = await requireCohort(request);
  if (isGateResponse(gate)) return gate;

  try {
    const result = await query(
      `SELECT id, prompt_type, observation_text, elemental_lens, visibility, created_at
         FROM beta_observations
        WHERE member_id = $1
        ORDER BY created_at DESC
        LIMIT 50`,
      [gate.memberId]
    );
    return NextResponse.json({ observations: result.rows });
  } catch (error) {
    console.error('[beta-testers/observations] GET error:', error);
    return NextResponse.json({ observations: [] });
  }
}

/** POST — leave a new observation (own member only). */
export async function POST(request: NextRequest) {
  const gate = await requireCohort(request);
  if (isGateResponse(gate)) return gate;

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const promptType = String(payload?.promptType ?? '');
  const text = typeof payload?.observationText === 'string' ? payload.observationText.trim() : '';
  const lens = payload?.elementalLens ? String(payload.elementalLens) : null;
  const relatedChallengeId = payload?.relatedChallengeId ? String(payload.relatedChallengeId) : null;
  const relatedExperimentId = payload?.relatedExperimentId ? String(payload.relatedExperimentId) : null;
  const visibility = payload?.keepPrivate ? 'private' : 'admin_review';

  if (!VALID_PROMPT_TYPES.includes(promptType)) {
    return NextResponse.json({ error: 'Invalid promptType' }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json({ error: 'Observation is empty' }, { status: 400 });
  }
  if (lens && !VALID_ELEMENTS.includes(lens)) {
    return NextResponse.json({ error: 'Invalid elementalLens' }, { status: 400 });
  }

  try {
    const result = await query(
      `INSERT INTO beta_observations
        (member_id, prompt_type, observation_text, elemental_lens, related_challenge_id, related_experiment_id, visibility)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, prompt_type, observation_text, elemental_lens, visibility, created_at`,
      [gate.memberId, promptType, text, lens, relatedChallengeId, relatedExperimentId, visibility]
    );
    return NextResponse.json({ observation: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('[beta-testers/observations] POST error:', error);
    return NextResponse.json({ error: 'Failed to save observation' }, { status: 500 });
  }
}
