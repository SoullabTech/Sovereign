/**
 * GET/POST/PATCH /api/practice/worlds/practitioner
 *
 * Manage which worlds a practitioner has enabled
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getPractitionerWorlds,
  enableWorldForPractitioner,
  disableWorldForPractitioner,
  updatePractitionerWorld,
  incrementWorldUsage
} from '@/lib/practice/WorldsStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(req.url);
    const practitionerId = searchParams.get('practitionerId');
    const enabledOnly = searchParams.get('enabledOnly') !== 'false';

    if (!practitionerId) {
      return NextResponse.json(
        { success: false, error: 'practitionerId required' },
        { status: 400 }
      );
    }

    const worlds = await getPractitionerWorlds(practitionerId, { enabledOnly });

    // Calculate proficiency distribution
    const proficiencyStats = worlds.reduce<Record<string, number>>((acc, pw) => {
      acc[pw.proficiency_level] = (acc[pw.proficiency_level] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      worlds,
      stats: {
        totalEnabled: worlds.filter(w => w.is_enabled).length,
        proficiency: proficiencyStats
      }
    });
  } catch (error) {
    console.error('[practice/worlds/practitioner] GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get practitioner worlds' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { practitionerId, worldId, proficiencyLevel, action } = body;

    if (!practitionerId || !worldId) {
      return NextResponse.json(
        { success: false, error: 'practitionerId and worldId required' },
        { status: 400 }
      );
    }

    // Handle different actions
    if (action === 'disable') {
      const result = await disableWorldForPractitioner(practitionerId, worldId);
      return NextResponse.json({
        success: true,
        world: result,
        message: 'World disabled'
      });
    }

    if (action === 'increment_usage') {
      await incrementWorldUsage(practitionerId, worldId);
      return NextResponse.json({
        success: true,
        message: 'Usage incremented'
      });
    }

    // Default: enable world
    const result = await enableWorldForPractitioner({
      practitionerId,
      worldId,
      proficiencyLevel
    });

    return NextResponse.json({
      success: true,
      world: result,
      message: 'World enabled'
    });
  } catch (error) {
    console.error('[practice/worlds/practitioner] POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update practitioner world' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { practitionerId, worldId, proficiencyLevel, autoSuggest, learningNotes } = body;

    if (!practitionerId || !worldId) {
      return NextResponse.json(
        { success: false, error: 'practitionerId and worldId required' },
        { status: 400 }
      );
    }

    const result = await updatePractitionerWorld(practitionerId, worldId, {
      proficiency_level: proficiencyLevel,
      auto_suggest: autoSuggest,
      learning_notes: learningNotes
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Practitioner world not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      world: result
    });
  } catch (error) {
    console.error('[practice/worlds/practitioner] PATCH Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update practitioner world' },
      { status: 500 }
    );
  }
}
