/**
 * STELLIUM CLIENT API - Single Client
 *
 * Operations on a single client
 */

export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

import { NextRequest, NextResponse } from 'next/server';
import {
  getClient,
  updateClient,
  archiveClient,
  deleteClient,
  getClientTimeline,
  updateClientBirthData,
} from '@/lib/stellium/clients';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/stellium/clients/[id]
 * Get a single client with optional timeline
 *
 * Query params:
 * - practitionerId: required
 * - timeline: if 'true', include full session history
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { id: clientId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const practitionerId = searchParams.get('practitionerId');

    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Practitioner ID required' },
        { status: 400 }
      );
    }

    // Return full timeline if requested
    if (searchParams.get('timeline') === 'true') {
      const timeline = await getClientTimeline(practitionerId, clientId);
      if (!timeline) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }
      return NextResponse.json(timeline);
    }

    const client = await getClient(practitionerId, clientId);

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error('[Stellium Client API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/stellium/clients/[id]
 * Update a client
 *
 * Body can include:
 * - practitionerId: required
 * - birthData: special handling for astrology birth data
 * - ...other client fields
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: clientId } = await params;
    const body = await request.json();
    const { practitionerId, birthData, ...updateData } = body;

    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Practitioner ID required' },
        { status: 400 }
      );
    }

    // Special handling for birth data updates
    if (birthData) {
      const client = await updateClientBirthData(practitionerId, clientId, birthData);
      if (!client) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, client });
    }

    // Regular update
    const client = await updateClient(practitionerId, clientId, updateData);

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, client });
  } catch (error) {
    console.error('[Stellium Client API] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/stellium/clients/[id]
 * Archive or permanently delete a client
 *
 * Query params:
 * - practitionerId: required
 * - permanent: if 'true', permanently delete (default: archive)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: clientId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const practitionerId = searchParams.get('practitionerId');
    const permanent = searchParams.get('permanent') === 'true';

    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Practitioner ID required' },
        { status: 400 }
      );
    }

    const success = permanent
      ? await deleteClient(practitionerId, clientId)
      : await archiveClient(practitionerId, clientId);

    if (!success) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      action: permanent ? 'deleted' : 'archived',
    });
  } catch (error) {
    console.error('[Stellium Client API] Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
