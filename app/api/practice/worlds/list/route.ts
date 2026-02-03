/**
 * GET /api/practice/worlds/list
 *
 * Get all available practice worlds (interpretive lenses)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllWorlds, getWorld, getWorldByCode } from '@/lib/practice/WorldsStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(req.url);
    const worldId = searchParams.get('worldId');
    const worldCode = searchParams.get('code');
    const domain = searchParams.get('domain') || undefined;
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    // Single world lookup by ID
    if (worldId) {
      const world = await getWorld(worldId);
      if (!world) {
        return NextResponse.json(
          { success: false, error: 'World not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, world });
    }

    // Single world lookup by code
    if (worldCode) {
      const world = await getWorldByCode(worldCode);
      if (!world) {
        return NextResponse.json(
          { success: false, error: 'World not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, world });
    }

    // List all worlds
    const worlds = await getAllWorlds({ domain, activeOnly });

    // Group by domain for UI
    const byDomain = worlds.reduce<Record<string, typeof worlds>>((acc, world) => {
      if (!acc[world.domain]) acc[world.domain] = [];
      acc[world.domain].push(world);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      worlds,
      byDomain,
      domains: ['body', 'mind', 'relational', 'creative', 'spiritual', 'integrative']
    });
  } catch (error) {
    console.error('[practice/worlds] GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get worlds' },
      { status: 500 }
    );
  }
}
