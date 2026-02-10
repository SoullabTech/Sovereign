/**
 * Leadership Briefing Context
 *
 * Extends the standard session briefing with leadership-specific
 * intelligence: recent decisions, pressure signals, recurring themes.
 *
 * Called by the session briefing API when the client has a leadership profile.
 */

import db from '@/lib/db/postgres';
import type { LeadershipBriefingContext } from './types';

/**
 * Get leadership-specific briefing context for a client.
 * Returns null if client has no leadership data to surface.
 */
export async function getLeadershipBriefingContext(
  practitionerId: string,
  clientId: string
): Promise<LeadershipBriefingContext | null> {
  try {
    // Fetch recent decisions for this client (with iteration context)
    const decisionsResult = await db.query(
      `SELECT
        d.id, d.title, d.status, d.consulted_at, d.created_at,
        d.iteration_count,
        d.council_result->'tensions' as tensions,
        d.council_result->'recommendation' as recommendation,
        (SELECT di.session_notes
         FROM decision_iterations di
         WHERE di.decision_id = d.id
         ORDER BY di.iteration_number DESC
         LIMIT 1
        ) as latest_session_notes
      FROM studio_decisions d
      WHERE d.practitioner_id = $1
        AND d.client_id = $2
        AND d.status != 'archived'
      ORDER BY d.created_at DESC
      LIMIT 5`,
      [practitionerId, clientId]
    );

    const recentDecisions = decisionsResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      date: (row.consulted_at || row.created_at)?.toISOString(),
      status: row.status,
      iterationCount: row.iteration_count || 0,
      keyTensions: Array.isArray(row.tensions) ? row.tensions.slice(0, 3) : undefined,
    }));

    // Fetch recurring themes from recent sessions
    const themesResult = await db.query(
      `SELECT themes
      FROM practitioner_sessions
      WHERE client_id = $1
        AND status = 'completed'
        AND themes IS NOT NULL
      ORDER BY scheduled_at DESC
      LIMIT 10`,
      [clientId]
    );

    // Count theme frequency across sessions
    const themeCounts: Record<string, number> = {};
    for (const row of themesResult.rows) {
      const themes = Array.isArray(row.themes) ? row.themes : [];
      for (const theme of themes) {
        if (typeof theme === 'string') {
          themeCounts[theme] = (themeCounts[theme] || 0) + 1;
        }
      }
    }

    const recurringThemes = Object.entries(themeCounts)
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([theme]) => theme)
      .slice(0, 5);

    // Build pressure signals from decision context
    const pressureSignals: string[] = [];
    for (const d of decisionsResult.rows) {
      if (d.status === 'draft') {
        pressureSignals.push(`Open decision: "${d.title}"`);
      } else if (d.status === 'active' && d.iteration_count > 1) {
        const roundLabel = d.iteration_count === 2 ? '2nd round' : `${d.iteration_count} rounds`;
        let signal = `Active decision (${roundLabel}): "${d.title}"`;
        if (d.latest_session_notes) {
          // Include a brief excerpt of the latest session notes
          const excerpt = d.latest_session_notes.length > 120
            ? d.latest_session_notes.slice(0, 120) + '...'
            : d.latest_session_notes;
          signal += ` — last update: ${excerpt}`;
        }
        pressureSignals.push(signal);
      }
    }

    // Only return if there's meaningful leadership context
    if (recentDecisions.length === 0 && recurringThemes.length === 0) {
      return null;
    }

    return {
      recentDecisions,
      pressureSignals,
      recurringThemes,
    };
  } catch (error) {
    console.error('[Leadership Briefing] Error:', error);
    return null;
  }
}
