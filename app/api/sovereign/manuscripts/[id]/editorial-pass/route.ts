/**
 * WS-RELATIONAL-ARCHITECTURE step 4 — the editorial pass as a server run (founder ruling 2026-11-11: "Let it run on its own").
 *   GET     the run's true state ("5 of 9 readings done"), and it continues an unfinished run on the server (never doubled)
 *   POST    the writer starts (or resumes) a run. Keep gate first: nothing is started in Sanctuary.
 *   DELETE  the writer cancels the run; it reads nothing more.
 * The run itself advances on the server after this response; closing the page does not stop it.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { keepGate } from '@/lib/sanctuary/keepGate';
import { advanceRun, cancelRun, startRun, viewRun } from '@/lib/writersStudio/studio/passRun';
import { WHOLE_WORK_REFUSAL } from '@/lib/writersStudio/wholeWorkAccess';
import { meteredRoute, bindMaiaMeter } from '@/lib/writersStudio/maiaMeter';

export const dynamic = 'force-dynamic';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FINAL = new Set(['done', 'failed', 'stopped', 'cancelled']);

async function member(req: NextRequest, params: Promise<{ id: string }>) {
  const memberId = await getMemberIdFromRequest(req);
  const { id } = await params;
  return { memberId, id };
}

async function getHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { memberId, id } = await member(req, params);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!UUID.test(id)) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  // A GET carries no turn posture: a pass it resumes is not recorded (Sanctuary closure; re-review R2-2). The POST that
  // started a pass passed keepGate, and the readings it runs are recorded in its own scope.
  bindMaiaMeter(memberId, { sanctuary: true });
  const run = await viewRun(memberId, id);
  /* An unfinished run whose server process stopped (a restart) carries on when anyone asks about it. advanceRun never doubles. */
  if (run && !FINAL.has(run.state)) void advanceRun(memberId, id).catch(() => undefined);
  return NextResponse.json({ run });
}

export const GET = meteredRoute('editorial_pass', getHandler);

async function postHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { memberId, id } = await member(req, params);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!UUID.test(id)) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const gate = await keepGate(memberId, body);
  if (gate) return gate;
  bindMaiaMeter(memberId, { sanctuary: false });
  const out = await startRun(memberId, id);
  if (!out.ok) {
    const status = out.refusal === 'daily_limit' ? 429 : out.refusal === WHOLE_WORK_REFUSAL ? 403 : 409;
    return NextResponse.json({ refusal: out.refusal }, { status });
  }
  void advanceRun(memberId, id).catch(() => undefined);
  return NextResponse.json({ runId: out.runId, resumed: out.resumed, run: await viewRun(memberId, id) }, { status: 202 });
}

export const POST = meteredRoute('editorial_pass', postHandler);

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { memberId, id } = await member(req, params);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!UUID.test(id)) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  return NextResponse.json({ cancelled: await cancelRun(memberId, id) });
}
