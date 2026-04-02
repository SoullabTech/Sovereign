export const dynamic = 'force-dynamic';

/**
 * Sacred Learning — Daily Encounter API
 * GET /api/sacred-learning/daily
 *
 * Returns today's passage with commentary layers, practices, and reflection prompt.
 * Governed by docs/sacred-learning/SACRED_SOURCE_INTEGRITY_POLICY.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { getDailyEncounter, upsertFormationState } from '@/lib/sacred-learning/sacredLearningService';
import type { EncounterMode } from '@/lib/sacred-learning/types';

const VALID_MODES = new Set<EncounterMode>(['study', 'contemplation', 'practice']);
const DEFAULT_MODE: EncounterMode = 'contemplation';

/**
 * Resolve encounter mode from request.
 * Centralizes validation, defaulting, and future profile/flag overrides.
 */
function resolveEncounterMode(requested: string | null): EncounterMode {
  if (requested && VALID_MODES.has(requested as EncounterMode)) {
    return requested as EncounterMode;
  }
  return DEFAULT_MODE;
}

export async function GET(request: NextRequest) {
  try {
    // Auth: session required
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mode = resolveEncounterMode(request.nextUrl.searchParams.get('mode'));

    const encounter = await getDailyEncounter(session.memberId);
    if (!encounter) {
      return NextResponse.json(
        { error: 'No passages available', message: 'The sacred learning corpus has not been seeded yet.' },
        { status: 404 }
      );
    }

    // Apply mode defaults to the encounter
    const modeDefaults = ENCOUNTER_MODE_DEFAULTS[mode];

    // Fire-and-forget: advance formation state
    const nextDay = (encounter.passage.dayNumber ?? 1) + 1;
    upsertFormationState(session.memberId, { currentDayNumber: nextDay });

    return NextResponse.json({
      ...encounter,
      resolvedMode: mode,
      modeDefaults,
    });
  } catch (error) {
    console.error('[Sacred] Daily encounter error:', error);
    return NextResponse.json(
      { error: 'Failed to load daily encounter' },
      { status: 500 }
    );
  }
}

/**
 * Mode defaults control UI behavior without changing what data is returned.
 * All layers are always available — modes just change what's expanded by default.
 */
const ENCOUNTER_MODE_DEFAULTS: Record<EncounterMode, {
  commentaryExpanded: boolean;
  practiceExpanded: boolean;
  contextExpanded: boolean;
  description: string;
}> = {
  study: {
    commentaryExpanded: true,
    practiceExpanded: false,
    contextExpanded: true,
    description: 'Emphasis on source text, context, and scholarly commentary.',
  },
  contemplation: {
    commentaryExpanded: true,
    practiceExpanded: true,
    contextExpanded: false,
    description: 'Balanced encounter — text, reflection, and practice.',
  },
  practice: {
    commentaryExpanded: false,
    practiceExpanded: true,
    contextExpanded: false,
    description: 'Emphasis on embodied practice and reflection prompt.',
  },
};
