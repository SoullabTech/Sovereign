export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getContact, updateContact } from '@/lib/founder/queries';
import type { UpdateContactInput } from '@/lib/founder/types';
import { requireFounder } from '@/lib/founder/founderAuth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Founder authorization is enforced HERE, not only in middleware. Middleware is
  // routing/UX defence; this handler must reject an unauthorized caller reached
  // directly. See lib/founder/founderAuth (verified session + server-held allowlist,
  // fails closed when FOUNDER_MEMBER_IDS is unset).
  const __auth = await requireFounder();
  if (!__auth.ok) {
    return NextResponse.json({ error: __auth.error }, { status: __auth.status });
  }
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  try {
    const { id } = await params;
    const contact = await getContact(id);
    if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ contact });
  } catch (err) {
    console.error('[founder/contacts/[id]] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Founder authorization is enforced HERE, not only in middleware. Middleware is
  // routing/UX defence; this handler must reject an unauthorized caller reached
  // directly. See lib/founder/founderAuth (verified session + server-held allowlist,
  // fails closed when FOUNDER_MEMBER_IDS is unset).
  const __auth = await requireFounder();
  if (!__auth.ok) {
    return NextResponse.json({ error: __auth.error }, { status: __auth.status });
  }
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  try {
    const { id } = await params;
    const body = await req.json() as UpdateContactInput;
    const contact = await updateContact(id, body);
    if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ contact });
  } catch (err) {
    console.error('[founder/contacts/[id]] PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }
}
