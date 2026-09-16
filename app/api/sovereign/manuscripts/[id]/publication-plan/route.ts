import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  assignPublicationRole,
  clearPublicationRole,
  readPublicationPlan,
  type PublicationPlanResult,
} from '@/lib/manuscript/publicationPlan/store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function responseFor(result: PublicationPlanResult): NextResponse {
  if (result.status === 'ok') return NextResponse.json(result);
  if (result.refusal === 'not_found') return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (result.refusal === 'section_not_current'
      || result.refusal === 'non_contiguous'
      || result.refusal === 'section_already_assigned') {
    return NextResponse.json(result, { status: 409 });
  }
  return NextResponse.json(result, { status: 400 });
}

async function memberAndId(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) } as const;
  const { id } = await ctx.params;
  return { memberId, id } as const;
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await memberAndId(request, ctx);
  if ('error' in auth) return auth.error;
  return responseFor(await readPublicationPlan(auth.id, auth.memberId));
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await memberAndId(request, ctx);
  if ('error' in auth) return auth.error;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const role = (body as { role?: unknown })?.role;
  const sectionIds = (body as { sectionIds?: unknown })?.sectionIds;
  if (typeof role !== 'string' || !Array.isArray(sectionIds) || !sectionIds.every((id) => typeof id === 'string')) {
    return NextResponse.json({ error: 'role and sectionIds are required' }, { status: 400 });
  }
  return responseFor(await assignPublicationRole(auth.id, auth.memberId, role, sectionIds));
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await memberAndId(request, ctx);
  if ('error' in auth) return auth.error;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const role = (body as { role?: unknown })?.role;
  if (typeof role !== 'string') return NextResponse.json({ error: 'role is required' }, { status: 400 });
  return responseFor(await clearPublicationRole(auth.id, auth.memberId, role));
}
