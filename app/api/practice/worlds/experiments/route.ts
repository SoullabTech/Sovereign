/**
 * GET /api/practice/worlds/experiments
 *
 * Get micro-practice experiments from worlds
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getWorldExperiments,
  getExperimentsForPractitioner
} from '@/lib/practice/WorldsStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const worldId = searchParams.get('worldId');
    const practitionerId = searchParams.get('practitionerId');
    const difficultyLevel = searchParams.get('difficulty') as 'accessible' | 'intermediate' | 'advanced' | null;

    // Get experiments for a specific world
    if (worldId) {
      const experiments = await getWorldExperiments(worldId, {
        difficultyLevel: difficultyLevel || undefined
      });

      return NextResponse.json({
        success: true,
        experiments
      });
    }

    // Get all experiments appropriate for a practitioner (based on their enabled worlds + proficiency)
    if (practitionerId) {
      const experiments = await getExperimentsForPractitioner(practitionerId, {
        maxDifficulty: difficultyLevel || undefined
      });

      // Group by world
      const byWorld = experiments.reduce<Record<string, typeof experiments>>((acc, exp) => {
        if (!acc[exp.world_code]) acc[exp.world_code] = [];
        acc[exp.world_code].push(exp);
        return acc;
      }, {});

      return NextResponse.json({
        success: true,
        experiments,
        byWorld
      });
    }

    return NextResponse.json(
      { success: false, error: 'worldId or practitionerId required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[practice/worlds/experiments] GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get experiments' },
      { status: 500 }
    );
  }
}
