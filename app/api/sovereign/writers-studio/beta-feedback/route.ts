import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { isBetaFeedbackSignal } from '@/lib/writersStudio/betaFeedback';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';

export const dynamic = 'force-dynamic';

const MODES = new Set(['home', 'write', 'develop', 'review', 'listen']);
const CONTEXT_KEYS = new Set([
  'developField', 'developmentalMovement', 'sectionId',
  'attentionReturn', 'reviewFinding', 'lineageCandidate',
]);

export async function POST(req: NextRequest) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const access = await writersStudioBetaAccess(memberId);
  if (!access.eligible) return NextResponse.json({ refusal: 'not_in_beta_pilot' }, { status: 403 });
  const raw = await req.json().catch(() => null);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  }
  const body = raw as Record<string, unknown>;
  const allowed = new Set(['manuscriptId', 'signal', 'studioMode', 'orientationContext', 'note']);
  if (Object.keys(body).some((key) => !allowed.has(key)) || !isBetaFeedbackSignal(body.signal)) {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  }
  const manuscriptId = typeof body.manuscriptId === 'string' ? body.manuscriptId : null;
  const studioMode = typeof body.studioMode === 'string' && MODES.has(body.studioMode)
    ? body.studioMode : null;
  const note = typeof body.note === 'string' ? body.note.trim() : '';
  if (note.length > 2000) return NextResponse.json({ refusal: 'note_too_long' }, { status: 413 });

  const contextRaw = body.orientationContext;
  if (!contextRaw || typeof contextRaw !== 'object' || Array.isArray(contextRaw)) {
    return NextResponse.json({ refusal: 'malformed_context' }, { status: 400 });
  }
  const context: Record<string, string> = {};
  for (const [key, value] of Object.entries(contextRaw as Record<string, unknown>)) {
    if (!CONTEXT_KEYS.has(key) || typeof value !== 'string' || value.length > 200) {
      return NextResponse.json({ refusal: 'malformed_context' }, { status: 400 });
    }
    if (value) context[key] = value;
  }

  if (manuscriptId) {
    const owned = await query(
      'SELECT 1 FROM member_manuscripts WHERE id = $1 AND member_id = $2',
      [manuscriptId, memberId],
    );
    if (owned.rows.length !== 1) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
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
      return NextResponse.json({ refusal: 'beta_feedback_not_ready' }, { status: 503 });
    }
    throw error;
  }
  return NextResponse.json({ ok: true });
}
