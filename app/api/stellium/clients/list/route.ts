/**
 * STELLIUM CLIENT API
 *
 * Practitioner client management
 * Each client belongs to a practitioner - data isolation is enforced
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getClients,
  createClient,
  getClientStats,
} from '@/lib/stellium/clients';

/**
 * GET /api/stellium/clients
 * List all clients for a practitioner
 *
 * Query params:
 * - practitionerId: required
 * - status: filter by status
 * - search: search name/email
 * - limit: pagination (default 50)
 * - offset: pagination
 * - sortBy: name | last_session | created_at
 * - sortOrder: asc | desc
 * - stats: if 'true', return stats instead of list
 */
export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const searchParams = request.nextUrl.searchParams;
    const practitionerId = searchParams.get('practitionerId');

    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Practitioner ID required' },
        { status: 400 }
      );
    }

    // Return stats if requested
    if (searchParams.get('stats') === 'true') {
      const stats = await getClientStats(practitionerId);
      return NextResponse.json({ stats });
    }

    // Get client list with filters
    const result = await getClients(practitionerId, {
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      limit: parseInt(searchParams.get('limit') || '50', 10),
      offset: parseInt(searchParams.get('offset') || '0', 10),
      sortBy: (searchParams.get('sortBy') as 'name' | 'last_session' | 'created_at') || 'name',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Stellium Clients API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stellium/clients
 * Create a new client
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { practitionerId, ...clientData } = body;

    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Practitioner ID required' },
        { status: 400 }
      );
    }

    if (!clientData.name) {
      return NextResponse.json(
        { error: 'Client name required' },
        { status: 400 }
      );
    }

    const client = await createClient(practitionerId, clientData);

    return NextResponse.json({
      success: true,
      client,
    });
  } catch (error) {
    console.error('[Stellium Clients API] Create error:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
