/**
 * SESSION PREP
 *
 * The "Before They Walk In" summary for practitioners.
 * Everything you need to know before a session, surfaced clearly.
 *
 * This is what makes Soullab different from generic SaaS —
 * we optimize for the relationship, not the billing.
 */

import { query } from '@/lib/db/postgres';
import type { PractitionerClient, PractitionerSession } from '@/lib/stellium/types';
import type { MessageDigest, ClientMessage } from '@/lib/practitioner/messages';
import { getMessageDigest } from '@/lib/practitioner/messages';
import { decryptJoinedClientFields, resolveClientDisplayName } from '@/lib/stellium/clients';
import {
  encryptEmergencyInfoPatch,
  decryptEmergencyInfoRow,
  sanitizeEmergencyInfoRow,
} from '@/lib/security/phiAccessors/emergencyInfo';

// SQL fragment for selecting encrypted client name columns in JOINs
// client_display_name is the canonical plaintext fallback (COALESCE)
const CLIENT_NAME_JOIN_COLUMNS = `
  c.name as client_name,
  c.preferred_name as client_preferred_name,
  COALESCE(c.preferred_name, c.name) as client_display_name,
  c.name_enc as client_name_enc,
  c.name_enc_meta as client_name_enc_meta,
  c.preferred_name_enc as client_preferred_name_enc,
  c.preferred_name_enc_meta as client_preferred_name_enc_meta
`;

// ============================================
// TYPES
// ============================================

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  is_primary?: boolean;
}

export interface CrisisResource {
  name: string;
  phone: string;
  type: 'hotline' | 'hospital' | 'police' | 'other';
}

export interface ClientEmergencyInfo {
  id: string;
  client_id: string;
  emergency_contacts: EmergencyContact[];
  safety_plan?: string;
  medications?: string;
  medical_conditions?: string;
  risk_notes?: string;
  crisis_resources: CrisisResource[];
  has_safety_plan: boolean;
  has_risk_factors: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionPrepData {
  client: PractitionerClient;

  // Last session summary
  last_session: {
    date: string;
    type: string;
    notes?: string;
    themes?: string[];
    insights?: string[];
    days_ago: number;
  } | null;

  // The arc of your work together
  journey: {
    total_sessions: number;
    first_session?: string;
    months_together: number;
    recurring_themes: string[];
    stated_goals?: string;
    intake_highlights?: Record<string, any>;
  };

  // Flags and alerts
  flags: {
    has_emergency_info: boolean;
    has_safety_plan: boolean;
    has_risk_factors: boolean;
    upcoming_life_events?: string[];
  };

  // Quick links
  links: {
    emergency_kit: string;
    full_history: string;
    progress_arc: string;
  };

  // Recent sessions (last 3 for context)
  recent_sessions: Array<{
    id: string;
    date: string;
    type: string;
    themes?: string[];
  }>;

  // Between-session messages (since last session)
  message_digest?: MessageDigest | null;

  // Sliding scale rate (if client has active award)
  sliding_scale_rate_cents?: number | null;
}

export interface CreateEmergencyInfoInput {
  emergency_contacts?: EmergencyContact[];
  safety_plan?: string;
  medications?: string;
  medical_conditions?: string;
  risk_notes?: string;
  crisis_resources?: CrisisResource[];
}

// ============================================
// SESSION PREP FUNCTIONS
// ============================================

/**
 * Get complete session prep data for a client
 * This is the "before they walk in" summary
 */
export async function getSessionPrep(
  practitionerId: string,
  clientId: string
): Promise<SessionPrepData | null> {
  // Get client info
  const clientResult = await query(
    `SELECT * FROM practitioner_clients
     WHERE id = $1 AND practitioner_id = $2`,
    [clientId, practitionerId]
  );

  if (!clientResult.rows[0]) {
    return null;
  }

  const client = clientResult.rows[0] as PractitionerClient;

  // Get recent sessions (last 3, completed)
  const sessionsResult = await query(
    `SELECT id, session_type, scheduled_at, session_notes, themes, insights, status
     FROM practitioner_sessions
     WHERE client_id = $1 AND practitioner_id = $2
       AND status = 'completed'
     ORDER BY scheduled_at DESC NULLS LAST
     LIMIT 3`,
    [clientId, practitionerId]
  );

  const recentSessions = sessionsResult.rows;
  const lastSession = recentSessions[0];

  // Get all themes across sessions
  const themesResult = await query(
    `SELECT unnest(themes) as theme, COUNT(*) as count
     FROM practitioner_sessions
     WHERE client_id = $1 AND practitioner_id = $2 AND themes IS NOT NULL
     GROUP BY theme
     ORDER BY count DESC
     LIMIT 8`,
    [clientId, practitionerId]
  );

  const recurringThemes = themesResult.rows.map(r => r.theme);

  // Check for emergency info
  const emergencyResult = await query(
    `SELECT has_safety_plan, has_risk_factors
     FROM client_emergency_info
     WHERE client_id = $1`,
    [clientId]
  );

  const emergencyInfo = emergencyResult.rows[0];

  // Calculate journey stats from practitioner_sessions (not client columns)
  const journeyResult = await query(
    `SELECT COUNT(*) as total_sessions,
            MIN(scheduled_at) as first_session_date
     FROM practitioner_sessions
     WHERE client_id = $1 AND practitioner_id = $2
       AND status = 'completed'`,
    [clientId, practitionerId]
  );
  const totalSessions = parseInt(journeyResult.rows[0]?.total_sessions || '0', 10);
  const firstSessionDate = journeyResult.rows[0]?.first_session_date
    ? new Date(journeyResult.rows[0].first_session_date)
    : null;
  const monthsTogether = firstSessionDate
    ? Math.floor((Date.now() - firstSessionDate.getTime()) / (30 * 24 * 60 * 60 * 1000))
    : 0;

  // Calculate days since last session
  const lastSessionDate = lastSession?.scheduled_at ? new Date(lastSession.scheduled_at) : null;
  const daysAgo = lastSessionDate
    ? Math.floor((Date.now() - lastSessionDate.getTime()) / (24 * 60 * 60 * 1000))
    : 0;

  // Extract stated goals from intake responses
  const intakeData = (client as any).intake_responses || {};
  const statedGoals = intakeData.goals ||
    intakeData.what_brings_you_here ||
    intakeData.intentions ||
    null;

  // Extract intake highlights (meaningful fields)
  const intakeHighlights: Record<string, any> = {};
  const highlightFields = [
    'what_brings_you_here',
    'previous_experience',
    'what_good_looks_like',
    'how_you_work',
    'important_to_know'
  ];
  for (const field of highlightFields) {
    if (intakeData[field]) {
      intakeHighlights[field] = intakeData[field];
    }
  }

  // Build upcoming life events from recent session insights
  const upcomingLifeEvents: string[] = [];
  for (const session of recentSessions) {
    if (session.insights) {
      for (const insight of session.insights) {
        if (insight.toLowerCase().includes('upcoming') ||
            insight.toLowerCase().includes('life event') ||
            insight.toLowerCase().includes('transition')) {
          upcomingLifeEvents.push(insight);
        }
      }
    }
  }

  // Get message digest (messages since last session)
  let messageDigest: MessageDigest | null = null;
  try {
    messageDigest = await getMessageDigest(practitionerId, clientId);
  } catch (err) {
    // If message digest fails, don't break the prep
    console.error('Failed to fetch message digest:', err);
  }

  // Get sliding scale rate if client has an active award
  let slidingScaleRateCents: number | null = null;
  try {
    const awardResult = await query(
      `SELECT rate_cents FROM sliding_scale_awards
       WHERE client_id = $1 AND practitioner_id = $2 AND status = 'active'
       LIMIT 1`,
      [clientId, practitionerId]
    );
    if (awardResult.rows[0]) {
      slidingScaleRateCents = awardResult.rows[0].rate_cents;
    }
  } catch (err) {
    // If sliding scale query fails, don't break the prep
    console.error('Failed to fetch sliding scale award:', err);
  }

  return {
    client,

    last_session: lastSession ? {
      date: lastSession.scheduled_at,
      type: lastSession.session_type,
      notes: lastSession.session_notes,
      themes: lastSession.themes,
      insights: lastSession.insights,
      days_ago: daysAgo,
    } : null,

    journey: {
      total_sessions: totalSessions,
      first_session: firstSessionDate?.toISOString(),
      months_together: monthsTogether,
      recurring_themes: recurringThemes,
      stated_goals: statedGoals,
      intake_highlights: Object.keys(intakeHighlights).length > 0 ? intakeHighlights : undefined,
    },

    flags: {
      has_emergency_info: !!emergencyInfo,
      has_safety_plan: emergencyInfo?.has_safety_plan || false,
      has_risk_factors: emergencyInfo?.has_risk_factors || false,
      upcoming_life_events: upcomingLifeEvents.length > 0 ? upcomingLifeEvents : undefined,
    },

    links: {
      emergency_kit: `/stellium/clients/${clientId}/emergency`,
      full_history: `/stellium/clients/${clientId}`,
      progress_arc: `/stellium/clients/${clientId}/arc`,
    },

    recent_sessions: recentSessions.map(s => ({
      id: s.id,
      date: s.scheduled_at,
      type: s.session_type,
      themes: s.themes,
    })),

    message_digest: messageDigest,

    sliding_scale_rate_cents: slidingScaleRateCents,
  };
}

// ============================================
// EMERGENCY KIT FUNCTIONS
// ============================================

/**
 * Get emergency info for a client
 */
export async function getEmergencyInfo(
  practitionerId: string,
  clientId: string
): Promise<ClientEmergencyInfo | null> {
  // First verify the client belongs to this practitioner
  const clientCheck = await query(
    `SELECT id FROM practitioner_clients
     WHERE id = $1 AND practitioner_id = $2`,
    [clientId, practitionerId]
  );

  if (!clientCheck.rows[0]) {
    return null;
  }

  const result = await query(
    `SELECT * FROM client_emergency_info
     WHERE client_id = $1`,
    [clientId]
  );

  if (!result.rows[0]) {
    return null;
  }

  const row = result.rows[0];
  const emergencyInfo = {
    ...row,
    emergency_contacts: row.emergency_contacts || [],
    crisis_resources: row.crisis_resources || [],
  } as ClientEmergencyInfo;

  // SECURITY: Stage B - Decrypt from _enc columns, then strip them
  const decrypted = decryptEmergencyInfoRow(
    emergencyInfo,
    { rowId: row.id, practitionerId },
    { preferEncrypted: true }
  );
  return sanitizeEmergencyInfoRow(decrypted);
}

/**
 * Create or update emergency info for a client
 */
export async function upsertEmergencyInfo(
  practitionerId: string,
  clientId: string,
  input: CreateEmergencyInfoInput
): Promise<ClientEmergencyInfo> {
  // Verify client belongs to practitioner
  const clientCheck = await query(
    `SELECT id FROM practitioner_clients
     WHERE id = $1 AND practitioner_id = $2`,
    [clientId, practitionerId]
  );

  if (!clientCheck.rows[0]) {
    throw new Error('Client not found or access denied');
  }

  const {
    emergency_contacts = [],
    safety_plan,
    medications,
    medical_conditions,
    risk_notes,
    crisis_resources = [],
  } = input;

  const hasSafetyPlan = !!safety_plan && safety_plan.trim().length > 0;
  const hasRiskFactors = !!risk_notes && risk_notes.trim().length > 0;

  // SECURITY: Phase 2B - Encryption is unconditional
  const encryptedColumns = encryptEmergencyInfoPatch(
    { safety_plan, medications, medical_conditions, risk_notes },
    { rowId: clientId, practitionerId }
  );

  const result = await query(
    `INSERT INTO client_emergency_info (
      client_id,
      emergency_contacts,
      safety_plan,
      medications,
      medical_conditions,
      risk_notes,
      crisis_resources,
      has_safety_plan,
      has_risk_factors,
      safety_plan_enc,
      safety_plan_enc_meta,
      medications_enc,
      medications_enc_meta,
      medical_conditions_enc,
      medical_conditions_enc_meta,
      risk_notes_enc,
      risk_notes_enc_meta
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    ON CONFLICT (client_id)
    DO UPDATE SET
      emergency_contacts = EXCLUDED.emergency_contacts,
      safety_plan = EXCLUDED.safety_plan,
      medications = EXCLUDED.medications,
      medical_conditions = EXCLUDED.medical_conditions,
      risk_notes = EXCLUDED.risk_notes,
      crisis_resources = EXCLUDED.crisis_resources,
      has_safety_plan = EXCLUDED.has_safety_plan,
      has_risk_factors = EXCLUDED.has_risk_factors,
      safety_plan_enc = EXCLUDED.safety_plan_enc,
      safety_plan_enc_meta = EXCLUDED.safety_plan_enc_meta,
      medications_enc = EXCLUDED.medications_enc,
      medications_enc_meta = EXCLUDED.medications_enc_meta,
      medical_conditions_enc = EXCLUDED.medical_conditions_enc,
      medical_conditions_enc_meta = EXCLUDED.medical_conditions_enc_meta,
      risk_notes_enc = EXCLUDED.risk_notes_enc,
      risk_notes_enc_meta = EXCLUDED.risk_notes_enc_meta,
      updated_at = NOW()
    RETURNING *`,
    [
      clientId,
      JSON.stringify(emergency_contacts),
      safety_plan || null,
      medications || null,
      medical_conditions || null,
      risk_notes || null,
      JSON.stringify(crisis_resources),
      hasSafetyPlan,
      hasRiskFactors,
      encryptedColumns.safety_plan_enc || null,
      encryptedColumns.safety_plan_enc_meta || null,
      encryptedColumns.medications_enc || null,
      encryptedColumns.medications_enc_meta || null,
      encryptedColumns.medical_conditions_enc || null,
      encryptedColumns.medical_conditions_enc_meta || null,
      encryptedColumns.risk_notes_enc || null,
      encryptedColumns.risk_notes_enc_meta || null,
    ]
  );

  const row = result.rows[0];
  const emergencyInfo = {
    ...row,
    emergency_contacts: row.emergency_contacts || [],
    crisis_resources: row.crisis_resources || [],
  } as ClientEmergencyInfo;

  // SECURITY: Stage B - Decrypt from _enc columns, then strip them
  const decrypted = decryptEmergencyInfoRow(
    emergencyInfo,
    { rowId: row.id, practitionerId },
    { preferEncrypted: true }
  );
  return sanitizeEmergencyInfoRow(decrypted);
}

/**
 * Delete emergency info for a client
 */
export async function deleteEmergencyInfo(
  practitionerId: string,
  clientId: string
): Promise<boolean> {
  // Verify client belongs to practitioner
  const clientCheck = await query(
    `SELECT id FROM practitioner_clients
     WHERE id = $1 AND practitioner_id = $2`,
    [clientId, practitionerId]
  );

  if (!clientCheck.rows[0]) {
    return false;
  }

  const result = await query(
    `DELETE FROM client_emergency_info WHERE client_id = $1 RETURNING id`,
    [clientId]
  );

  return (result.rowCount ?? 0) > 0;
}

// ============================================
// UPCOMING SESSIONS WITH PREP
// ============================================

/**
 * Get upcoming sessions with prep data
 * For the dashboard "today's sessions" view
 */
export async function getUpcomingSessionsWithPrep(
  practitionerId: string,
  days: number = 7
): Promise<Array<{
  session: PractitionerSession & { client: PractitionerClient };
  prep_status: 'ready' | 'needs_prep' | 'no_history';
  has_flags: boolean;
}>> {
  const result = await query(
    `SELECT
      s.*,
      ${CLIENT_NAME_JOIN_COLUMNS},
      c.email as client_email,
      c.phone as client_phone,
      c.total_sessions as client_total_sessions,
      c.themes as client_themes,
      c.has_chart as client_has_chart,
      e.has_safety_plan,
      e.has_risk_factors
    FROM practitioner_sessions s
    LEFT JOIN practitioner_clients c ON s.client_id = c.id
    LEFT JOIN client_emergency_info e ON c.id = e.client_id
    WHERE s.practitioner_id = $1
      AND s.status IN ('scheduled', 'confirmed')
      AND s.scheduled_at >= NOW()
      AND s.scheduled_at <= NOW() + INTERVAL '${days} days'
    ORDER BY s.scheduled_at ASC`,
    [practitionerId]
  );

  return result.rows.map(row => {
    // Decrypt client name fields
    const decrypted = decryptJoinedClientFields(row, practitionerId);

    const session = {
      ...row,
      client: {
        id: row.client_id,
        name: decrypted.client_name || row.client_name,
        preferred_name: resolveClientDisplayName(row, decrypted),
        email: row.client_email,
        phone: row.client_phone,
        total_sessions: row.client_total_sessions,
        themes: row.client_themes,
        has_chart: row.client_has_chart,
      },
    } as PractitionerSession & { client: PractitionerClient };

    // Determine prep status
    let prepStatus: 'ready' | 'needs_prep' | 'no_history';
    if (row.client_total_sessions === 0) {
      prepStatus = 'no_history';
    } else if (row.maia_prep && Object.keys(row.maia_prep).length > 0) {
      prepStatus = 'ready';
    } else {
      prepStatus = 'needs_prep';
    }

    const hasFlags = row.has_safety_plan || row.has_risk_factors;

    return {
      session,
      prep_status: prepStatus,
      has_flags: hasFlags,
    };
  });
}

// ============================================
// DEFAULT CRISIS RESOURCES
// ============================================

/**
 * Get default crisis resources (can be customized per region)
 */
export function getDefaultCrisisResources(): CrisisResource[] {
  return [
    { name: '988 Suicide & Crisis Lifeline', phone: '988', type: 'hotline' },
    { name: 'Crisis Text Line', phone: 'Text HOME to 741741', type: 'hotline' },
    { name: 'National Domestic Violence Hotline', phone: '1-800-799-7233', type: 'hotline' },
    { name: 'SAMHSA Helpline', phone: '1-800-662-4357', type: 'hotline' },
  ];
}
