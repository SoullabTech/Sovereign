/**
 * STUDIO → PRACTITIONER SESSION WRITE-BACK
 *
 * When a voice note is drafted in Studio, this function creates or updates
 * a corresponding practitioner_sessions row so the prep engine (getSessionPrep)
 * can surface it in the pre-session briefing card.
 *
 * This closes the memory loop:
 *   Voice Note → Transcript → Draft Note → practitioner_sessions → Next Briefing
 */

import { query } from '@/lib/db/postgres';

interface WritebackInput {
  studioSessionId: string;
  practitionerId: string;
  clientId: string;
  scheduledStart: string;
  scheduledEnd: string;
  locationType: string;
  sessionNotes: string;
  themes?: string[];
  serviceName?: string;
}

/**
 * Extract theme keywords from a drafted session note.
 * Simple heuristic: looks for the "Key Themes" section header
 * and extracts bullet points. Falls back to empty array.
 */
export function extractThemesFromNote(draftedNote: string): string[] {
  const themes: string[] = [];

  // Look for "Key Themes" or "Themes" section
  const themesMatch = draftedNote.match(
    /(?:##?\s*(?:Key\s+)?Themes?)\s*\n([\s\S]*?)(?=\n##?\s|\n\*\*[A-Z]|\n---|\Z)/i
  );

  if (themesMatch) {
    const section = themesMatch[1];
    // Extract bullet points (- or * or numbered)
    const bullets = section.match(/^[\s]*[-*•]\s*\**(.+?)\**\s*$/gm);
    if (bullets) {
      for (const bullet of bullets) {
        const cleaned = bullet
          .replace(/^[\s]*[-*•]\s*\**/, '')
          .replace(/\**\s*$/, '')
          .replace(/:\s.*$/, '') // Take only the theme label, not description
          .trim();
        if (cleaned && cleaned.length < 60) {
          themes.push(cleaned);
        }
      }
    }
  }

  return themes.slice(0, 8); // Cap at 8 themes
}

/**
 * Write back a Studio session into practitioner_sessions.
 * Uses studio_session_id for idempotent upsert — safe to call multiple times.
 */
export async function writebackStudioSession(input: WritebackInput): Promise<string> {
  const {
    studioSessionId,
    practitionerId,
    clientId,
    scheduledStart,
    scheduledEnd,
    locationType,
    sessionNotes,
    themes = [],
    serviceName,
  } = input;

  // Calculate duration
  const start = new Date(scheduledStart);
  const end = new Date(scheduledEnd);
  const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

  // Determine session type from service name or default
  const sessionType = serviceName?.toLowerCase() || 'session';

  const result = await query(
    `INSERT INTO practitioner_sessions (
      practitioner_id,
      client_id,
      studio_session_id,
      session_type,
      scheduled_at,
      duration_minutes,
      status,
      location_type,
      session_notes,
      themes,
      completed_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, 'completed', $7, $8, $9, NOW(), NOW())
    ON CONFLICT (studio_session_id) DO UPDATE SET
      session_notes = EXCLUDED.session_notes,
      themes = EXCLUDED.themes,
      status = 'completed',
      completed_at = COALESCE(practitioner_sessions.completed_at, NOW()),
      updated_at = NOW()
    RETURNING id`,
    [
      practitionerId,
      clientId,
      studioSessionId,
      sessionType,
      scheduledStart,
      durationMinutes,
      locationType || 'video',
      sessionNotes,
      themes.length > 0 ? themes : null,
    ]
  );

  const id = result.rows[0]?.id;
  console.log('[studio-writeback] Upserted practitioner_session:', id, 'for studio session:', studioSessionId);

  // Update client stats
  try {
    await query(
      `UPDATE practitioner_clients SET
        total_sessions = (
          SELECT COUNT(*) FROM practitioner_sessions
          WHERE client_id = $1 AND status = 'completed'
        ),
        last_session = NOW(),
        updated_at = NOW()
      WHERE id = $1`,
      [clientId]
    );
  } catch (err) {
    // Non-fatal — don't break the write-back over stats
    console.error('[studio-writeback] Failed to update client stats:', err);
  }

  return id;
}
