export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { listContacts, createContact } from '@/lib/founder/queries';
import type { CreateContactInput } from '@/lib/founder/types';
import { requireFounder } from '@/lib/founder/founderAuth';

export async function GET(req: NextRequest) {
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
    const url = new URL(req.url);
    const contacts = await listContacts({
      contact_type: url.searchParams.get('contact_type') || undefined,
      pipeline_stage: url.searchParams.get('pipeline_stage') || undefined,
      limit: Number(url.searchParams.get('limit')) || 100,
    });
    return NextResponse.json({ contacts });
  } catch (err) {
    console.error('[founder/contacts] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
    const body = await req.json() as CreateContactInput;
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    const contact = await createContact(body);
    return NextResponse.json({ contact }, { status: 201 });
  } catch (err) {
    console.error('[founder/contacts] POST error:', err);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}
