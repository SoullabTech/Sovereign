import { NextRequest, NextResponse } from 'next/server';

import { query } from '@/lib/db/postgres';
import { isBetaFeedbackSignal } from '@/lib/writersStudio/betaFeedback';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
import { isTrustedPilotWrite, verifiedPilotWriterActor } from '@/lib/writersStudio/pilotWriteSecurity';

export const dynamic = 'force-dynamic';
const privateHeaders = { 'Cache-Control': 'private, no-store' };
const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: privateHeaders });

const MODES = new Set(['home', 'write', 'develop', 'review']);
const CONTEXT_KEYS = new Set([
  'developField', 'developmentalMovement', 'sectionId',
  'attentionReturn', 'reviewFinding', 'lineageCandidate',
]);

export async function POST(req: NextRequest) {
  // Cookie-authenticated feedback is a state change, even though optional.
  // Do not allow cross-site requests to submit someone else's narrative.
  if (!isTrustedPilotWrite(req)) return reply({ refusal: 'untrusted_origin' }, 403);
  let memberId: string;
  try {
    const actor = await verifiedPilotWriterActor(req);
    if (!actor) return reply({ error: 'unauthenticated' }, 401);
    memberId = actor.memberId;
  } catch {
    return reply({ refusal: 'pilot_access_unavailable' }, 503);
  }
  try {
    const access = await writersStudioBetaAccess(memberId);
    if (!access.eligible) return reply({ refusal: 'not_in_beta_pilot' }, 403);
  } catch {
    // A failed R20 or database check must not admit a CRM-only writer.
    return reply({ refusal: 'pilot_access_unavailable' }, 503);
  }
  const raw = await req.json().catch(() => null);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return reply({ refusal: 'malformed' }, 400);
  }
  const body = raw as Record<string, unknown>;
  const allowed = new Set(['manuscriptId', 'signal', 'studioMode', 'orientationContext', 'note']);
  if (Object.keys(body).some((key) => !allowed.has(key)) || !isBetaFeedbackSignal(body.signal)) {
    return reply({ refusal: 'malformed' }, 400);
  }
  const manuscriptId = typeof body.manuscriptId === 'string' ? body.manuscriptId : null;
  const studioMode = typeof body.studioMode === 'string' && MODES.has(body.studioMode)
    ? body.studioMode : null;
  const note = typeof body.note === 'string' ? body.note.trim() : '';
  if (note.length > 2000) return reply({ refusal: 'note_too_long' }, 413);

  const contextRaw = body.orientationContext;
  if (!contextRaw || typeof contextRaw !== 'object' || Array.isArray(contextRaw)) {
    return reply({ refusal: 'malformed_context' }, 400);
  }
  const context: Record<string, string> = {};
  for (const [key, value] of Object.entries(contextRaw as Record<string, unknown>)) {
    if (!CONTEXT_KEYS.has(key) || typeof value !== 'string' || value.length > 200) {
      return reply({ refusal: 'malformed_context' }, 400);
    }
    if (value) context[key] = value;
  }

  if (manuscriptId) {
    const owned = await query(
      'SELECT 1 FROM member_manuscripts WHERE id = $1 AND member_id = $2',
      [manuscriptId, memberId],
    );
    if (owned.rows.length !== 1) return reply({ refusal: 'not_found' }, 404);
  }

  try {
    await query(
      `INSERT INTO writer_studio_beta_feedback
         (member_id, manuscript_id, signal, studio_mode, orientation_context, note)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6)`,
      [memberId, manuscriptId, body.signal, studioMode, JSON.stringify(context), note || null],
    );
  } catch (error) {
    if ((error as { code?: string })?.code === '42P01') {
      return reply({ refusal: 'beta_feedback_not_ready' }, 503);
    }
    throw error;
  }
  return reply({ ok: true });
}
