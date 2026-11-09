/** WS-DEVELOP-STUDIO · M4 — the writer edits their plan: a step's wording, its status, or removing it. Never an anchor, never the manuscript. */
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { applyStepEdits, type StepEdit } from '@/lib/writersStudio/developmentPlan';
import { getPlan, saveSteps } from '@/lib/writersStudio/developmentPlanStore';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; planId: string }> }) {
  const { id, planId } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!UUID.test(id) || !UUID.test(planId)) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  let b: { edits?: unknown };
  try { b = (await req.json()) as { edits?: unknown }; } catch { return NextResponse.json({ refusal: 'malformed' }, { status: 400 }); }
  if (!Array.isArray(b.edits)) return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  const plan = await getPlan(memberId, planId);
  if (!plan) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  const edits: StepEdit[] = (b.edits as StepEdit[]).filter((e) => e && typeof e.id === 'string');
  const saved = await saveSteps(memberId, planId, applyStepEdits(plan.steps, edits));
  return saved ? NextResponse.json({ plan: saved }) : NextResponse.json({ refusal: 'not_found' }, { status: 404 });
}
