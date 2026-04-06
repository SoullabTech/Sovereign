export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getContact, updateContact } from '@/lib/founder/queries';
import type { UpdateContactInput } from '@/lib/founder/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
