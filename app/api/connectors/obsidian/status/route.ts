/**
 * OBSIDIAN CONNECTOR STATUS
 *
 * Check if a member has configured their Obsidian vault connection.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getConnector } from '@/lib/connectors/connectorDb';

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ connected: false });
  }

  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const connector = await getConnector(userId, 'obsidian');

    if (!connector || connector.status !== 'connected') {
      return NextResponse.json({
        connected: false,
        config: null,
      });
    }

    return NextResponse.json({
      connected: true,
      config: connector.config,
      lastUsedAt: connector.lastUsedAt,
      metadata: connector.metadata,
    });
  } catch (err: any) {
    console.error('[Obsidian] status error:', err.message);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}
