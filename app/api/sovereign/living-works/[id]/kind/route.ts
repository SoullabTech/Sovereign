/** WS-DEVELOP-STUDIO — the writer declares (or clears) what kind of Work this is. GET returns it. Never inferred. */
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { livingWorkKind, WORK_KINDS, type WorkKind } from '@/lib/writersStudio/workKind';
import { declareWorkKind } from '@/lib/writersStudio/workKindWrite';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!UUID.test(id)) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  return NextResponse.json({ kind: await livingWorkKind(memberId, id) });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!UUID.test(id)) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  let b: Record<string, unknown>;
  try { b = (await req.json()) as Record<string, unknown>; } catch { return NextResponse.json({ refusal: 'malformed' }, { status: 400 }); }
  const kind = b.kind === null ? null : (WORK_KINDS as readonly unknown[]).includes(b.kind) ? (b.kind as WorkKind) : undefined;
  if (kind === undefined) return NextResponse.json({ refusal: 'malformed', detail: 'kind must be fiction, nonfiction, practitioner or null' }, { status: 400 });
  return (await declareWorkKind(memberId, id, kind)) ? NextResponse.json({ kind }) : NextResponse.json({ refusal: 'not_found' }, { status: 404 });
}
