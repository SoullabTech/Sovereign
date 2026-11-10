/**
 * WS-DEVELOP-STUDIO · M4c — link a change the writer applied in the passage desk to the plan step that led there.
 * The browser names an authorization; the server verifies it against the desk's own records (member, accepted, manuscript,
 * the step's section, after the plan) or refuses. Nothing here marks a step resolved: resolution is the writer's decision.
 */
import { keepGate } from '@/lib/sanctuary/keepGate';
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { linkStepApplication } from '@/lib/writersStudio/developmentPlanStore';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; planId: string }> }) {
  const { id, planId } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!UUID.test(id) || !UUID.test(planId)) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  let b: Record<string, unknown>;
  try { b = (await req.json()) as Record<string, unknown>; } catch { return NextResponse.json({ refusal: 'malformed' }, { status: 400 }); }
  /* Sanctuary closure (founder ruling 2026-11-09): this records something MAIA keeps, so it needs a declared ordinary posture. */
  { const refused = await keepGate(memberId, b); if (refused) return refused; }
  if (!b || typeof b.stepId !== 'string' || b.stepId.length === 0 || b.stepId.length > 100 || typeof b.authorizationId !== 'string' || !UUID.test(b.authorizationId)
      || Object.keys(b).some((k) => k !== 'stepId' && k !== 'authorizationId')) return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  const outcome = await linkStepApplication(memberId, id, planId, b.stepId, b.authorizationId);
  return NextResponse.json({ outcome }, { status: outcome === 'refused' ? 409 : 200 });
}
