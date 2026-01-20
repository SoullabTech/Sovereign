export const dynamic = 'force-dynamic';

/**
 * MARKETING CONTACTS API
 *
 * Lead and prospect management
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getContacts,
  createContact,
  type ContactStatus,
  type ContactSource,
} from '@/lib/stellium/marketing';

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(request.url);
    const practitionerId = searchParams.get('practitionerId');

    if (!practitionerId) {
      return NextResponse.json(
        { error: 'practitionerId is required' },
        { status: 400 }
      );
    }

    const options = {
      status: searchParams.get('status') as ContactStatus | undefined,
      source: searchParams.get('source') as ContactSource | undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean),
      search: searchParams.get('search') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
      sortBy: (searchParams.get('sortBy') as 'name' | 'created_at' | 'lead_score' | 'last_email_at') || 'created_at',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    const result = await getContacts(practitionerId, options);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get contacts:', error);
    return NextResponse.json(
      { error: 'Failed to get contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { practitionerId, ...data } = body;

    if (!practitionerId || !data.email) {
      return NextResponse.json(
        { error: 'practitionerId and email are required' },
        { status: 400 }
      );
    }

    const contact = await createContact(practitionerId, data);

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    console.error('Failed to create contact:', error);

    // Handle duplicate email
    if (error instanceof Error && error.message.includes('duplicate')) {
      return NextResponse.json(
        { error: 'A contact with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}
