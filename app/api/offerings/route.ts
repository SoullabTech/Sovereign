// Offerings v0 — member-gated (not practitioner-gated). See CLAUDE.md /
// lib/offerings/offeringService.ts for constitutional constraints.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedMember } from '@/lib/practitioner/auth';
import { createOffering, listOwnOfferings } from '@/lib/offerings/offeringService';

export async function GET(request: NextRequest) {
  const member = await getAuthenticatedMember(request);
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const offerings = await listOwnOfferings(member.id);
  return NextResponse.json({ offerings });
}

export async function POST(request: NextRequest) {
  const member = await getAuthenticatedMember(request);
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.title !== 'string' || body.title.trim().length === 0) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const offering = await createOffering(member.id, {
    title: body.title.trim(),
    description: typeof body.description === 'string' ? body.description : undefined,
    availability: body.availability,
    visibility: body.visibility,
    exchange: body.exchange,
  });

  return NextResponse.json({ offering });
}
