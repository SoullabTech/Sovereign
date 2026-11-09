/** WS-DEVELOP-STUDIO · M4 — the writer edits their plan: a step's wording, its status, or removing it. Never an anchor, never the manuscript. */
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import type { StepEdit } from '@/lib/writersStudio/developmentPlan';
import { deletePlan, editSteps } from '@/lib/writersStudio/developmentPlanStore';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; planId: string }> }) {
  const { id, planId } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!UUID.test(id) || !UUID.test(planId)) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  let b: { edits?: unknown };
  try { b = (await req.json()) as { edits?: unknown }; } catch { return NextResponse.json({ refusal: 'malformed' }, { status: 400 }); }
  if (!b || typeof b !== 'object' || !Array.isArray(b.edits)) return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  const edits: StepEdit[] = (b.edits as StepEdit[]).filter((e) => e && typeof e.id === 'string');
  const saved = await editSteps(memberId, id, planId, edits);
  return saved ? NextResponse.json({ plan: saved }) : NextResponse.json({ refusal: 'not_found' }, { status: 404 });
}

/** The writer deletes the plan: it, its earlier versions and its links to applied changes go. The manuscript is not touched. */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; planId: string }> }) {
  const { id, planId } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!UUID.test(id) || !UUID.test(planId)) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  return (await deletePlan(memberId, id, planId)) ? NextResponse.json({ deleted: true }) : NextResponse.json({ refusal: 'not_found' }, { status: 404 });
}
