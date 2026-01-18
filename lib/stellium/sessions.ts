/**
 * STELLIUM SESSION MANAGEMENT
 *
 * Not just appointments — containers for the ongoing work.
 * Each session is a node in the client's journey.
 *
 * The practitioner-client relationship is sacred.
 * Sessions are where that relationship deepens.
 */

import { query } from '@/lib/db/postgres';
import {
  PractitionerSession,
  CreateSessionInput,
  UpdateSessionInput,
  MaiaSessionPrep,
  SessionStatus,
} from './types';

// ============================================
// SESSION CRUD
// ============================================

/**
 * Get all sessions for a practitioner
 */
export async function getSessions(
  practitionerId: string,
  options?: {
    clientId?: string;
    status?: SessionStatus | SessionStatus[];
    fromDate?: string;
    toDate?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ sessions: PractitionerSession[]; total: number }> {
  const { clientId, status, fromDate, toDate, limit = 50, offset = 0 } = options || {};

  let whereClause = 'WHERE s.practitioner_id = $1';
  const params: any[] = [practitionerId];
  let paramIndex = 2;

  if (clientId) {
    whereClause += ` AND s.client_id = $${paramIndex}`;
    params.push(clientId);
    paramIndex++;
  }

  if (status) {
    if (Array.isArray(status)) {
      whereClause += ` AND s.status = ANY($${paramIndex})`;
      params.push(status);
    } else {
      whereClause += ` AND s.status = $${paramIndex}`;
      params.push(status);
    }
    paramIndex++;
  }

  if (fromDate) {
    whereClause += ` AND s.scheduled_at >= $${paramIndex}`;
    params.push(fromDate);
    paramIndex++;
  }

  if (toDate) {
    whereClause += ` AND s.scheduled_at <= $${paramIndex}`;
    params.push(toDate);
    paramIndex++;
  }

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total FROM practitioner_sessions s ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0]?.total || '0', 10);

  // Get sessions with client info
  const result = await query(
    `SELECT
      s.*,
      c.name as client_name,
      c.preferred_name as client_preferred_name,
      c.email as client_email,
      c.has_chart as client_has_chart
    FROM practitioner_sessions s
    LEFT JOIN practitioner_clients c ON s.client_id = c.id
    ${whereClause}
    ORDER BY s.scheduled_at DESC NULLS LAST
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  // Transform to include nested client
  const sessions = result.rows.map(row => ({
    ...row,
    client: row.client_name ? {
      id: row.client_id,
      name: row.client_name,
      preferred_name: row.client_preferred_name,
      email: row.client_email,
      has_chart: row.client_has_chart,
    } : undefined,
  }));

  return { sessions: sessions as PractitionerSession[], total };
}

/**
 * Get upcoming sessions (next 7 days by default)
 */
export async function getUpcomingSessions(
  practitionerId: string,
  days: number = 7
): Promise<PractitionerSession[]> {
  const result = await query(
    `SELECT
      s.*,
      c.name as client_name,
      c.preferred_name as client_preferred_name,
      c.has_chart as client_has_chart
    FROM practitioner_sessions s
    LEFT JOIN practitioner_clients c ON s.client_id = c.id
    WHERE s.practitioner_id = $1
      AND s.status IN ('scheduled', 'confirmed')
      AND s.scheduled_at >= NOW()
      AND s.scheduled_at <= NOW() + INTERVAL '${days} days'
    ORDER BY s.scheduled_at ASC`,
    [practitionerId]
  );

  return result.rows.map(row => ({
    ...row,
    client: row.client_name ? {
      id: row.client_id,
      name: row.client_name,
      preferred_name: row.client_preferred_name,
      has_chart: row.client_has_chart,
    } : undefined,
  })) as PractitionerSession[];
}

/**
 * Get a single session
 */
export async function getSession(
  practitionerId: string,
  sessionId: string
): Promise<PractitionerSession | null> {
  const result = await query(
    `SELECT
      s.*,
      c.name as client_name,
      c.preferred_name as client_preferred_name,
      c.email as client_email,
      c.phone as client_phone,
      c.has_chart as client_has_chart,
      c.themes as client_themes,
      c.private_notes as client_notes
    FROM practitioner_sessions s
    LEFT JOIN practitioner_clients c ON s.client_id = c.id
    WHERE s.id = $1 AND s.practitioner_id = $2`,
    [sessionId, practitionerId]
  );

  if (!result.rows[0]) return null;

  const row = result.rows[0];
  return {
    ...row,
    client: row.client_name ? {
      id: row.client_id,
      name: row.client_name,
      preferred_name: row.client_preferred_name,
      email: row.client_email,
      phone: row.client_phone,
      has_chart: row.client_has_chart,
      themes: row.client_themes,
      private_notes: row.client_notes,
    } : undefined,
  } as PractitionerSession;
}

/**
 * Create a new session
 */
export async function createSession(
  practitionerId: string,
  input: CreateSessionInput
): Promise<PractitionerSession> {
  const {
    client_id,
    session_type,
    modality,
    scheduled_at,
    duration_minutes = 60,
    location_type = 'video',
    location_details,
    fee,
  } = input;

  const result = await query(
    `INSERT INTO practitioner_sessions (
      practitioner_id, client_id, session_type, modality,
      scheduled_at, duration_minutes, location_type, location_details, fee
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      practitionerId,
      client_id,
      session_type,
      modality || null,
      scheduled_at || null,
      duration_minutes,
      location_type,
      location_details || null,
      fee || null,
    ]
  );

  return result.rows[0] as PractitionerSession;
}

/**
 * Update a session
 */
export async function updateSession(
  practitionerId: string,
  sessionId: string,
  input: UpdateSessionInput
): Promise<PractitionerSession | null> {
  const updates: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  const fields: (keyof UpdateSessionInput)[] = [
    'session_type', 'scheduled_at', 'duration_minutes', 'status',
    'location_type', 'location_details', 'prep_notes', 'session_notes',
    'follow_up_notes', 'themes', 'insights', 'fee', 'paid', 'payment_method',
  ];

  for (const field of fields) {
    if (input[field] !== undefined) {
      updates.push(`${field} = $${paramIndex}`);
      params.push(input[field]);
      paramIndex++;
    }
  }

  // Handle status changes
  if (input.status === 'completed') {
    updates.push(`completed_at = NOW()`);
  }

  if (updates.length === 0) {
    return getSession(practitionerId, sessionId);
  }

  params.push(sessionId, practitionerId);

  const result = await query(
    `UPDATE practitioner_sessions
     SET ${updates.join(', ')}
     WHERE id = $${paramIndex} AND practitioner_id = $${paramIndex + 1}
     RETURNING *`,
    params
  );

  // Update client's last_session and total_sessions if completed
  if (input.status === 'completed' && result.rows[0]) {
    await query(
      `UPDATE practitioner_clients
       SET last_session = NOW(),
           total_sessions = total_sessions + 1,
           first_session = COALESCE(first_session, NOW())
       WHERE id = $1 AND practitioner_id = $2`,
      [result.rows[0].client_id, practitionerId]
    );
  }

  return result.rows[0] as PractitionerSession | null;
}

/**
 * Cancel a session
 */
export async function cancelSession(
  practitionerId: string,
  sessionId: string,
  reason?: string
): Promise<boolean> {
  const result = await query(
    `UPDATE practitioner_sessions
     SET status = 'cancelled',
         follow_up_notes = COALESCE(follow_up_notes, '') || $3
     WHERE id = $1 AND practitioner_id = $2
     RETURNING id`,
    [sessionId, practitionerId, reason ? `\n\nCancellation reason: ${reason}` : '']
  );

  return result.rowCount > 0;
}

// ============================================
// SESSION PREPARATION (MAIA Integration)
// ============================================

/**
 * Store MAIA's session preparation
 */
export async function storeMaiaPrep(
  practitionerId: string,
  sessionId: string,
  prep: MaiaSessionPrep
): Promise<void> {
  await query(
    `UPDATE practitioner_sessions
     SET maia_prep = $1, prep_generated_at = NOW()
     WHERE id = $2 AND practitioner_id = $3`,
    [JSON.stringify(prep), sessionId, practitionerId]
  );
}

/**
 * Get context for MAIA to prepare session
 * Returns rich context about the client and their journey
 */
export async function getSessionContext(
  practitionerId: string,
  sessionId: string
): Promise<{
  session: PractitionerSession | null;
  client_history: {
    total_sessions: number;
    recent_sessions: PractitionerSession[];
    recurring_themes: string[];
    last_session_notes?: string;
    open_threads?: string[];
  };
}> {
  const session = await getSession(practitionerId, sessionId);
  if (!session) {
    return { session: null, client_history: { total_sessions: 0, recent_sessions: [], recurring_themes: [] } };
  }

  // Get recent sessions for this client
  const recentResult = await query(
    `SELECT * FROM practitioner_sessions
     WHERE client_id = $1 AND practitioner_id = $2 AND id != $3
     ORDER BY scheduled_at DESC
     LIMIT 5`,
    [session.client_id, practitionerId, sessionId]
  );

  // Get all themes across sessions
  const themesResult = await query(
    `SELECT unnest(themes) as theme, COUNT(*) as count
     FROM practitioner_sessions
     WHERE client_id = $1 AND practitioner_id = $2 AND themes IS NOT NULL
     GROUP BY theme
     ORDER BY count DESC
     LIMIT 10`,
    [session.client_id, practitionerId]
  );

  const lastSession = recentResult.rows[0];

  return {
    session,
    client_history: {
      total_sessions: session.client?.total_sessions || recentResult.rows.length,
      recent_sessions: recentResult.rows as PractitionerSession[],
      recurring_themes: themesResult.rows.map(r => r.theme),
      last_session_notes: lastSession?.session_notes,
      open_threads: lastSession?.insights,
    },
  };
}

// ============================================
// FOLLOW-UP & ENGAGEMENT
// ============================================

/**
 * Mark follow-up as sent
 */
export async function markFollowUpSent(
  practitionerId: string,
  sessionId: string
): Promise<void> {
  await query(
    `UPDATE practitioner_sessions
     SET follow_up_sent = true, follow_up_sent_at = NOW()
     WHERE id = $1 AND practitioner_id = $2`,
    [sessionId, practitionerId]
  );
}

/**
 * Get sessions needing follow-up
 */
export async function getSessionsNeedingFollowUp(
  practitionerId: string
): Promise<PractitionerSession[]> {
  const result = await query(
    `SELECT
      s.*,
      c.name as client_name,
      c.preferred_name as client_preferred_name,
      c.email as client_email
    FROM practitioner_sessions s
    LEFT JOIN practitioner_clients c ON s.client_id = c.id
    WHERE s.practitioner_id = $1
      AND s.status = 'completed'
      AND s.follow_up_sent = false
      AND s.completed_at <= NOW() - INTERVAL '1 day'
    ORDER BY s.completed_at ASC`,
    [practitionerId]
  );

  return result.rows.map(row => ({
    ...row,
    client: row.client_name ? {
      id: row.client_id,
      name: row.client_name,
      preferred_name: row.client_preferred_name,
      email: row.client_email,
    } : undefined,
  })) as PractitionerSession[];
}

// ============================================
// SESSION STATISTICS
// ============================================

/**
 * Get session statistics
 */
export async function getSessionStats(practitionerId: string): Promise<{
  total: number;
  this_week: number;
  this_month: number;
  completed_this_month: number;
  upcoming: number;
  revenue_this_month: number;
  average_session_duration: number;
  completion_rate: number;
}> {
  const result = await query(
    `SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE scheduled_at >= date_trunc('week', NOW())) as this_week,
      COUNT(*) FILTER (WHERE scheduled_at >= date_trunc('month', NOW())) as this_month,
      COUNT(*) FILTER (WHERE status = 'completed' AND completed_at >= date_trunc('month', NOW())) as completed_this_month,
      COUNT(*) FILTER (WHERE status IN ('scheduled', 'confirmed') AND scheduled_at >= NOW()) as upcoming,
      COALESCE(SUM(fee) FILTER (WHERE paid = true AND completed_at >= date_trunc('month', NOW())), 0) as revenue_this_month,
      COALESCE(AVG(duration_minutes), 60) as avg_duration,
      CASE
        WHEN COUNT(*) FILTER (WHERE status IN ('completed', 'cancelled', 'no_show')) > 0
        THEN (COUNT(*) FILTER (WHERE status = 'completed')::float / COUNT(*) FILTER (WHERE status IN ('completed', 'cancelled', 'no_show'))::float) * 100
        ELSE 0
      END as completion_rate
    FROM practitioner_sessions
    WHERE practitioner_id = $1`,
    [practitionerId]
  );

  const row = result.rows[0] || {};
  return {
    total: parseInt(row.total || '0', 10),
    this_week: parseInt(row.this_week || '0', 10),
    this_month: parseInt(row.this_month || '0', 10),
    completed_this_month: parseInt(row.completed_this_month || '0', 10),
    upcoming: parseInt(row.upcoming || '0', 10),
    revenue_this_month: parseFloat(row.revenue_this_month || '0'),
    average_session_duration: parseFloat(row.avg_duration || '60'),
    completion_rate: parseFloat(row.completion_rate || '0'),
  };
}

// ============================================
// JOURNEY CONTINUITY
// ============================================

/**
 * Get the full journey for a client
 * This is the relational timeline — the story of working together
 */
export async function getClientJourney(
  practitionerId: string,
  clientId: string
): Promise<{
  timeline: Array<{
    date: string;
    type: 'session' | 'milestone' | 'note';
    title: string;
    content?: string;
    themes?: string[];
    insights?: string[];
  }>;
  journey_summary: {
    total_sessions: number;
    first_session: string | null;
    last_session: string | null;
    total_duration_hours: number;
    primary_themes: string[];
    growth_areas: string[];
  };
}> {
  // Get all sessions
  const sessionsResult = await query(
    `SELECT * FROM practitioner_sessions
     WHERE client_id = $1 AND practitioner_id = $2
     ORDER BY scheduled_at ASC`,
    [clientId, practitionerId]
  );

  const sessions = sessionsResult.rows;

  // Build timeline
  const timeline = sessions.map(s => ({
    date: s.scheduled_at || s.created_at,
    type: 'session' as const,
    title: s.session_type,
    content: s.session_notes,
    themes: s.themes,
    insights: s.insights,
  }));

  // Calculate summary
  const allThemes = sessions.flatMap(s => s.themes || []);
  const themeCounts: Record<string, number> = {};
  for (const theme of allThemes) {
    themeCounts[theme] = (themeCounts[theme] || 0) + 1;
  }
  const primaryThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme]) => theme);

  const allInsights = sessions.flatMap(s => s.insights || []);
  const growthAreas = [...new Set(allInsights)].slice(0, 5);

  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 60), 0);

  return {
    timeline,
    journey_summary: {
      total_sessions: sessions.length,
      first_session: sessions[0]?.scheduled_at || null,
      last_session: sessions[sessions.length - 1]?.scheduled_at || null,
      total_duration_hours: Math.round(totalMinutes / 60 * 10) / 10,
      primary_themes: primaryThemes,
      growth_areas: growthAreas,
    },
  };
}
