/**
 * GET /api/maia/field-state?memberId=...
 *
 * Returns lightweight field continuity data for the /maia home surface.
 * Assembles from three proven sources:
 *   1. Spiral state (dominant_element, phase, motion)
 *   2. Recurring theme signals (participatory reality)
 *   3. Recent session summaries
 *
 * No new tables. No AI calls. Just reads existing data.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { loadSpiralState } from '@/lib/consciousness/spiralStatePersistence';
import { getRecentThemes, findRecurringThemes } from '@/lib/consciousness/participatoryRealityHelper';
import { query } from '@/lib/db/postgres';

export async function GET(request: NextRequest) {
  const memberId = request.nextUrl.searchParams.get('memberId');

  if (!memberId) {
    return NextResponse.json({ ok: false, error: 'memberId required' }, { status: 400 });
  }

  try {
    // Fire all reads in parallel — graceful fallback on each
    const [spiralState, rawThemes, sessionsResult] = await Promise.all([
      loadSpiralState(memberId).catch(() => null),
      getRecentThemes(memberId, 20, 30).catch(() => []),
      query(
        `SELECT session_id, summary, mode, started_at
         FROM member_sessions
         WHERE member_id = $1
           AND mode = 'continuity'
           AND summary IS NOT NULL
         ORDER BY started_at DESC
         LIMIT 3`,
        [memberId]
      ).catch(() => ({ rows: [] })),
    ]);

    const recurringThemes = findRecurringThemes(rawThemes);

    // Build continuity threads (1-3 items for display)
    const threads: Array<{
      type: 'spiral' | 'theme' | 'session';
      text: string;
      detail?: string;
    }> = [];

    // Thread from spiral state
    if (spiralState) {
      const motionText: Record<string, string> = {
        ascending: 'Something is opening',
        stuck: 'Something is asking for patience',
        breakthrough: 'Something is breaking through',
      };
      const elementText: Record<string, string> = {
        fire: 'energy and direction',
        water: 'feeling and depth',
        earth: 'grounding and form',
        air: 'thought and perspective',
        aether: 'meaning and integration',
      };

      const motion = spiralState.motion
        ? motionText[spiralState.motion] || 'Something is in motion'
        : 'Something is in motion';
      const element = spiralState.dominant_element
        ? elementText[spiralState.dominant_element] || ''
        : '';

      threads.push({
        type: 'spiral',
        text: motion,
        detail: element ? `in the area of ${element}` : undefined,
      });
    }

    // Thread from recurring themes (highest recurrence first)
    if (recurringThemes.length > 0) {
      const top = recurringThemes[0];
      const themeLabels: Record<string, string> = {
        field_awareness: 'awareness of the larger field',
        pattern_recurrence: 'a pattern that keeps returning',
        embodied_coherence: 'something the body is holding',
        adaptive_unfolding: 'a process of finding its own shape',
        wise_acceptance: 'an edge of acceptance',
        ripeness: 'something reaching its moment',
      };
      const label = themeLabels[top.theme] || top.theme;
      threads.push({
        type: 'theme',
        text: `This has been recurring`,
        detail: label,
      });
    }

    // Thread from recent session
    const sessions = sessionsResult.rows;
    if (sessions.length > 0) {
      const latest = sessions[0];
      // summary can be string or JSON object
      let summaryText = '';
      if (typeof latest.summary === 'string') {
        summaryText = latest.summary;
      } else if (latest.summary && typeof latest.summary === 'object') {
        // SessionRemembrance format: { essence, openThreads, ... }
        const s = latest.summary as any;
        if (s.openThreads && Array.isArray(s.openThreads) && s.openThreads.length > 0) {
          summaryText = s.openThreads[0];
        } else if (s.essence) {
          summaryText = s.essence;
        }
      }

      if (summaryText) {
        // Truncate to ~80 chars for display
        const truncated = summaryText.length > 80
          ? summaryText.slice(0, 77) + '...'
          : summaryText;
        threads.push({
          type: 'session',
          text: 'Something here isn\'t finished yet',
          detail: truncated,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      threads,
      spiralState: spiralState
        ? {
            element: spiralState.dominant_element,
            phase: spiralState.phase,
            motion: spiralState.motion,
            relationalPhase: spiralState.relational_phase,
          }
        : null,
      hasHistory: sessions.length > 0 || rawThemes.length > 0,
    });
  } catch (err: any) {
    console.error('[field-state] Error:', err);
    // Graceful degradation — return empty field rather than error
    return NextResponse.json({
      ok: true,
      threads: [],
      spiralState: null,
      hasHistory: false,
    });
  }
}
