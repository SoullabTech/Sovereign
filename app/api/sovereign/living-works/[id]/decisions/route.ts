/**
 * WS-DECISION-CONTINUITY — the writer's own gestures: settle a decision (their words) or withdraw one; GET lists what is
 * currently settled. ⛔ Nothing here is created by the system. ⛔ Fails closed in Sanctuary: a settle must state sanctuary:false.
 */
import { keepGate } from '@/lib/sanctuary/keepGate';
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { listActiveDecisions, type DecisionRoom, type DecisionSubjectKind } from '@/lib/writersStudio/decisionRecord';
import { settleDecision, withdrawDecision } from '@/lib/writersStudio/decisionRecordWrite';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ROOMS: readonly DecisionRoom[] = ['work_conversation', 'passage_desk', 'develop'];
const KINDS: readonly DecisionSubjectKind[] = ['note', 'observation', 'wording', 'proposal'];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!UUID.test(id)) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  const decisions = await listActiveDecisions(memberId, id);
  return NextResponse.json({ decisions: decisions.map((d) => ({ id: d.id, room: d.room, saidIn: d.saidIn })) });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!UUID.test(id)) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  let b: Record<string, unknown>;
  try { b = (await req.json()) as Record<string, unknown>; } catch { return NextResponse.json({ refusal: 'malformed' }, { status: 400 }); }

  if (b.action === 'withdraw' && typeof b.targetId === 'string' && UUID.test(b.targetId)) {
    const ok = await withdrawDecision({ memberId, livingWorkId: id, targetId: b.targetId });
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  }
  if (b.action === 'settle' && typeof b.saidIn === 'string') {
    /* A decision is kept: Sanctuary or an undeclared posture refuses (founder ruling 2026-11-09; account default when the device has none). */
    { const refused = await keepGate(memberId, b); if (refused) return refused; }
    const room = ROOMS.includes(b.room as DecisionRoom) ? (b.room as DecisionRoom) : 'work_conversation';
    const kind = KINDS.includes(b.subjectKind as DecisionSubjectKind) ? (b.subjectKind as DecisionSubjectKind) : 'note';
    const settledId = await settleDecision({
      memberId, livingWorkId: id, room, subjectKind: kind,
      subjectRef: typeof b.subjectRef === 'string' ? b.subjectRef : null, saidIn: b.saidIn,
      versionRef: typeof b.versionRef === 'string' ? b.versionRef : null,
    });
    return settledId ? NextResponse.json({ id: settledId }) : NextResponse.json({ refusal: 'not_found_or_invalid' }, { status: 404 });
  }
  return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
}
