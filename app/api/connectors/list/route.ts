/**
 * LIST ALL CONNECTORS
 *
 * Returns all service_connectors rows for a member,
 * merged with static definitions from the registry.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getConnectors } from '@/lib/connectors/connectorDb';
import { CONNECTOR_DEFINITIONS } from '@/lib/connectors/registry';

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ connectors: [], definitions: [] });
  }

  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const connectors = await getConnectors(userId);
    return NextResponse.json({
      connectors,
      definitions: CONNECTOR_DEFINITIONS,
    });
  } catch (err: any) {
    console.error('[Connectors] list error:', err.message);
    return NextResponse.json({ error: 'Failed to load connectors' }, { status: 500 });
  }
}
