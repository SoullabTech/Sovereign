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
    // Fetch recent decisions for this client
    const decisionsResult = await db.query(
      `SELECT
        id, title, status, consulted_at, created_at,
        council_result->'tensions' as tensions
      FROM studio_decisions
      WHERE practitioner_id = $1
        AND client_id = $2
        AND status != 'archived'
      ORDER BY created_at DESC
      LIMIT 5`,
      [practitionerId, clientId]
    );

    const recentDecisions = decisionsResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      date: (row.consulted_at || row.created_at)?.toISOString(),
      status: row.status,
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
