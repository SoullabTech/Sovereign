export const dynamic = 'force-static';
export async function generateStaticParams() { return []; }

/**
 * SINGLE CONTACT API
 *
 * Individual contact operations
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getContact,
  updateContact,
  addContactTags,
  removeContactTags,
  convertContactToClient,
} from '@/lib/stellium/marketing';
import { query } from '@/lib/db/postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contact = await getContact(id);

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Failed to get contact:', error);
    return NextResponse.json(
      { error: 'Failed to get contact' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, ...data } = body;

    let contact;

    switch (action) {
      case 'add_tags':
        if (!data.tags || !Array.isArray(data.tags)) {
          return NextResponse.json(
            { error: 'tags array is required' },
            { status: 400 }
          );
        }
        contact = await addContactTags(id, data.tags);
        break;

      case 'remove_tags':
        if (!data.tags || !Array.isArray(data.tags)) {
          return NextResponse.json(
            { error: 'tags array is required' },
            { status: 400 }
          );
        }
        contact = await removeContactTags(id, data.tags);
        break;

      case 'convert':
        if (!data.clientId) {
          return NextResponse.json(
            { error: 'clientId is required' },
            { status: 400 }
          );
        }
        contact = await convertContactToClient(id, data.clientId, data.conversionValue);
        break;

      default:
        contact = await updateContact(id, data);
    }

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Failed to update contact:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await query('DELETE FROM marketing_contacts WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
