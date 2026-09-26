import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  clearRelationshipReturn, readRelationshipReturn, writeRelationshipReturn,
} from '@/lib/writers-studio/returnState';

export const dynamic = 'force-dynamic';

function scope(req: NextRequest) {
  const livingWorkId = req.nextUrl.searchParams.get('livingWorkId')?.trim() ?? '';
  const manuscriptId = req.nextUrl.searchParams.get('manuscriptId')?.trim() ?? '';
  return livingWorkId && manuscriptId ? { livingWorkId, manuscriptId } : null;
}

export async function GET(req: NextRequest) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const s = scope(req);
  if (!s) return NextResponse.json({ error: 'malformed' }, { status: 400 });
  const relationshipId = await readRelationshipReturn({ memberId, ...s });
  return NextResponse.json({ relationshipId });
}

export async function PUT(req: NextRequest) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'malformed' }, { status: 400 });
  const livingWorkId = typeof body.livingWorkId === 'string' ? body.livingWorkId.trim() : '';
  const manuscriptId = typeof body.manuscriptId === 'string' ? body.manuscriptId.trim() : '';
  const relationshipId = typeof body.relationshipId === 'string' ? body.relationshipId.trim() : '';
  if (!livingWorkId || !manuscriptId || !relationshipId) return NextResponse.json({ error: 'malformed' }, { status: 400 });
  const out = await writeRelationshipReturn({ memberId, livingWorkId, manuscriptId, relationshipId });
  if (!out.ok) return NextResponse.json({ error: out.reason }, { status: out.reason === 'relationship_unavailable' ? 404 : 409 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const s = scope(req);
  if (!s) return NextResponse.json({ error: 'malformed' }, { status: 400 });
  const out = await clearRelationshipReturn({ memberId, ...s });
  if (!out.ok) return NextResponse.json({ error: out.reason }, { status: 409 });
  return NextResponse.json({ ok: true });
}
