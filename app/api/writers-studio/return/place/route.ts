import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { clearPlaceReturn, readPlaceReturn, writePlaceReturn } from '@/lib/writers-studio/returnState';

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
  const sectionId = await readPlaceReturn({ memberId, ...s });
  return NextResponse.json({ sectionId });
}

export async function PUT(req: NextRequest) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'malformed' }, { status: 400 });
  const livingWorkId = typeof body.livingWorkId === 'string' ? body.livingWorkId.trim() : '';
  const manuscriptId = typeof body.manuscriptId === 'string' ? body.manuscriptId.trim() : '';
  const draftSectionId = typeof body.draftSectionId === 'string' ? body.draftSectionId.trim() : '';
  if (!livingWorkId || !manuscriptId || !draftSectionId) return NextResponse.json({ error: 'malformed' }, { status: 400 });
  const out = await writePlaceReturn({ memberId, livingWorkId, manuscriptId, draftSectionId });
  if (!out.ok) return NextResponse.json({ error: out.reason }, { status: out.reason === 'place_unavailable' ? 404 : 409 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const s = scope(req);
  if (!s) return NextResponse.json({ error: 'malformed' }, { status: 400 });
  const out = await clearPlaceReturn({ memberId, ...s });
  if (!out.ok) return NextResponse.json({ error: out.reason }, { status: 409 });
  return NextResponse.json({ ok: true });
}
