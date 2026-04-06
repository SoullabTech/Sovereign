export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { listContacts, createContact } from '@/lib/founder/queries';
import type { CreateContactInput } from '@/lib/founder/types';

export async function GET(req: NextRequest) {
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
