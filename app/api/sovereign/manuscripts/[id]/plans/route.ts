/**
 * WS-DEVELOP-STUDIO · M4 — the writer asks MAIA for a development plan; GET returns the latest plan with stale flags.
 *
 * Reading follows the same law as the Work conversation: the writer's standing, revocable permission ("my saved work"), one receipt per chapter minted BEFORE any text
 * is loaded, Sanctuary stated and OFF, grant re-read after minting. A plan never changes the manuscript. ⛔ Not part of the Ask route's graph.
 */
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { livingWorkIdForManuscript } from '@/lib/manuscript/ask/workOfManuscript';
import { loadSectionHeads } from '@/lib/manuscript/ask/frozenReading';
import { selectSections, MAX_READ_SECTIONS } from '@/lib/manuscript/ask/workReadScope';
import { loadActiveGrant, loadSectionSizes, loadSuppliedSections } from '@/lib/disclosure/workReadScopeRead';
import { establishDisclosureBoundary, mayCrossBoundary } from '@/lib/disclosure/disclosureBoundary';
import { confirmDisclosureCrossed } from '@/lib/disclosure/contextDisclosureReceipt';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { decisionContextForWork } from '@/lib/writersStudio/decisionRecord';
import { loadThread } from '@/lib/manuscript/ask/threadStore';
import { draftPlan } from '@/lib/manuscript/ask/planReader';
import { groundSteps, digestOfText, staleStepIds, stepStanding } from '@/lib/writersStudio/developmentPlan';
import { createPlan, latestPlan } from '@/lib/writersStudio/developmentPlanStore';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!UUID.test(id)) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  const plan = await latestPlan(memberId, id);
  if (!plan) return NextResponse.json({ plan: null });
  const ids = [...new Set(plan.steps.map((s) => s.chapterId))];
  const now = new Map((await loadSuppliedSections(id, memberId, ids)).map((s) => [s.id, s.digest]));
  return NextResponse.json({ plan, staleStepIds: staleStepIds(plan.steps, plan.basis, now),
    unverifiedStepIds: plan.steps.filter((s) => stepStanding(s, plan.basis, now) === 'unverified').map((s) => s.id) });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!UUID.test(id)) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  const workId = await livingWorkIdForManuscript(id, memberId);
  if (!workId) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  let b: Record<string, unknown>;
  try { b = (await req.json()) as Record<string, unknown>; } catch { return NextResponse.json({ refusal: 'malformed' }, { status: 400 }); }
  const ask = typeof b.ask === 'string' ? b.ask.trim().slice(0, 1000) : '';
  if (!ask) return NextResponse.json({ refusal: 'malformed', detail: 'say, in your own words, what the plan is for' }, { status: 400 });
  if (b.sanctuary !== false) return NextResponse.json({ refusal: 'sanctuary_unresolved', detail: 'A plan reads your saved work, so it needs Sanctuary to be known to be off.' }, { status: 409 });

  const grant = await loadActiveGrant(memberId, workId);
  if (!grant || grant.level !== 'work') {
    return NextResponse.json({ refusal: 'permission_required', detail: 'A plan across chapters needs your permission for MAIA to read your saved work.' }, { status: 409 });
  }
  const heads = await loadSectionHeads(id, memberId);
  const sizes = await loadSectionSizes(id, memberId);
  const picked = selectSections({ level: 'work', question: 'the whole book', locusId: null, sections: heads, sizes });
  const ids = picked.ids.slice(0, MAX_READ_SECTIONS);
  if (ids.length === 0) return NextResponse.json({ refusal: 'nothing_to_read' }, { status: 409 });

  const posture = TurnPosture.resolve({ sanctuary: false });
  const requestId = randomUUID(); const minted: string[] = [];
  for (const sid of ids) {
    const o = await establishDisclosureBoundary({
      requestId, posture, memberId, sessionId: null,
      disclosure: { disclosureId: randomUUID(), boundary: 'writers_studio.work_conversation->maia_cognition', sourceClass: 'work', participationBasis: 'standing_authorization',
        sourceRef: id, scopeKind: 'section', sectionRef: sid, gesture: 'standing_read_scope', scopeEventId: grant.id },
    });
    if (!mayCrossBoundary(o)) return NextResponse.json({ refusal: 'receipt_unavailable', detail: 'Nothing was read.' }, { status: 409 });
    minted.push(o.disclosureId);
  }
  if ((await loadActiveGrant(memberId, workId))?.id !== grant.id) return NextResponse.json({ refusal: 'permission_required', detail: 'Your permission changed. Nothing was read.' }, { status: 409 });

  const supplied = await loadSuppliedSections(id, memberId, ids);
  const chapters = supplied.map((s) => ({ id: s.id, heading: s.label, text: s.body }));
  const thread = typeof b.threadId === 'string' && UUID.test(b.threadId) ? await loadThread(b.threadId, memberId) : null;
  const history = (thread?.turns ?? []).slice(-8).map((t) => ({ speaker: t.speaker, body: t.body }));
  const settled = await decisionContextForWork(memberId, workId, id);

  const drafted = await draftPlan({ ask, chapters, settled, history });
  for (const d of minted) { try { await confirmDisclosureCrossed(d); } catch { console.error('[PLAN] receipt confirmation threw'); } }
  if (!drafted.ok) return NextResponse.json({ refusal: 'plan_unavailable', detail: 'MAIA could not make a plan just now. Nothing was changed.' }, { status: 502 });

  const grounded = groundSteps(drafted.steps, chapters, randomUUID);
  const plan = await createPlan({ memberId, livingWorkId: workId, manuscriptId: id, ask, summary: drafted.summary, steps: grounded.steps,
    basis: supplied.map((s) => ({ sectionId: s.id, digest: s.digest || digestOfText(s.body) })) });
  if (!plan) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  return NextResponse.json({ plan, staleStepIds: [], unverifiedStepIds: [], dropped: grounded.dropped.length, read: supplied.map((s) => ({ sectionId: s.id, label: s.label })) });
}
