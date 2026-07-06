// Offerings v0 — member-gated (not practitioner-gated). See CLAUDE.md /
// lib/offerings/offeringService.ts for constitutional constraints.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedMember } from '@/lib/practitioner/auth';
import { updateOffering, deleteOffering } from '@/lib/offerings/offeringService';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const member = await getAuthenticatedMember(request);
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const offering = await updateOffering(member.id, id, {
    title: typeof body.title === 'string' ? body.title.trim() : undefined,
    description: typeof body.description === 'string' ? body.description : undefined,
    availability: body.availability,
    visibility: body.visibility,
    exchange: body.exchange,
  });

  if (!offering) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ offering });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const member = await getAuthenticatedMember(request);
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteOffering(member.id, id);

  if (!deleted) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
