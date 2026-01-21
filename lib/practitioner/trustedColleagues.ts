/**
 * TRUSTED COLLEAGUES - WARM HANDOFF SYSTEM
 *
 * "Not a social network. A guild layer with dignity and containment."
 *
 * Invariants enforced:
 * 1. Private by default - is_listed = false until explicit opt-in
 * 2. No client exposure - name/contact only with explicit consent
 * 3. Mutual trust - connections require both parties to accept
 * 4. Notes are private - requester_note only to requester, recipient_note only to recipient
 * 5. Colleagues only - referrals can only be sent to accepted connections
 */

import { query } from '@/lib/db/postgres';

// ============================================
// TYPES
// ============================================

export interface DirectoryProfile {
  practitioner_id: string;
  is_listed: boolean;
  accepting_referrals: boolean;
  display_name: string | null;
  location: string | null;
  bio: string | null;
  modalities: string[];
  tags: string[];
  languages: string[];
  accepts_sliding_scale: boolean;
  created_at: string;
  updated_at: string;
}

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  requested_at: string;
  responded_at: string | null;
  created_at: string;
}

export interface ConnectionWithProfile extends Connection {
  colleague_profile: DirectoryProfile | null;
  colleague_name: string;
}

export interface ReferralRequest {
  id: string;
  from_practitioner_id: string;
  to_practitioner_id: string;
  connection_id: string;
  status: 'draft' | 'sent' | 'received' | 'accepted' | 'declined' | 'closed';

  // De-identified descriptors
  client_age_range: string | null;
  client_pronouns: string | null;
  presenting_themes: string[];
  urgency: 'routine' | 'soon' | 'time_sensitive';
  constraints: string[];

  // Private notes (filtered by viewer)
  requester_note: string;
  recipient_note: string | null;

  // Consent state
  client_consent_given: boolean;
  client_name_shared: boolean;
  client_name: string | null;
  client_contact: string | null;
  consent_recorded_at: string | null;

  // Timestamps
  created_at: string;
  sent_at: string | null;
  viewed_at: string | null;
  responded_at: string | null;
}

// View of referral filtered for the viewer (enforces note privacy)
export interface ReferralView extends Omit<ReferralRequest, 'requester_note' | 'recipient_note'> {
  my_note: string | null;        // The note I can see/edit
  their_note_exists: boolean;    // Whether the other party added a note (but not its content)
}

// ============================================
// DIRECTORY PROFILE OPERATIONS
// ============================================

/**
 * Get own directory profile (creates default if none exists)
 */
export async function getDirectoryProfile(
  practitionerId: string
): Promise<DirectoryProfile> {
  const result = await query(
    `INSERT INTO practitioner_directory_profiles (practitioner_id)
     VALUES ($1)
     ON CONFLICT (practitioner_id) DO UPDATE SET updated_at = NOW()
     RETURNING *`,
    [practitionerId]
  );

  const row = result.rows[0];
  return {
    ...row,
    modalities: row.modalities || [],
    tags: row.tags || [],
    languages: row.languages || [],
  };
}

/**
 * Update directory profile
 */
export async function updateDirectoryProfile(
  practitionerId: string,
  input: Partial<Omit<DirectoryProfile, 'practitioner_id' | 'created_at' | 'updated_at'>>
): Promise<DirectoryProfile> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  // Build dynamic update
  const allowedFields = [
    'is_listed',
    'accepting_referrals',
    'display_name',
    'location',
    'bio',
    'modalities',
    'tags',
    'languages',
    'accepts_sliding_scale',
  ];

  for (const field of allowedFields) {
    if (field in input) {
      fields.push(`${field} = $${paramIndex}`);
      values.push((input as any)[field]);
      paramIndex++;
    }
  }

  if (fields.length === 0) {
    return getDirectoryProfile(practitionerId);
  }

  fields.push('updated_at = NOW()');
  values.push(practitionerId);

  const result = await query(
    `UPDATE practitioner_directory_profiles
     SET ${fields.join(', ')}
     WHERE practitioner_id = $${paramIndex}
     RETURNING *`,
    values
  );

  if (!result.rows[0]) {
    // Create if doesn't exist
    return getDirectoryProfile(practitionerId);
  }

  const row = result.rows[0];
  return {
    ...row,
    modalities: row.modalities || [],
    tags: row.tags || [],
    languages: row.languages || [],
  };
}

/**
 * Search directory (only listed + accepting referrals)
 */
export async function searchDirectory(
  practitionerId: string,
  filters?: {
    modalities?: string[];
    tags?: string[];
    location?: string;
    accepts_sliding_scale?: boolean;
  }
): Promise<DirectoryProfile[]> {
  let whereClause = `is_listed = true AND accepting_referrals = true AND practitioner_id != $1`;
  const values: any[] = [practitionerId];
  let paramIndex = 2;

  if (filters?.modalities && filters.modalities.length > 0) {
    whereClause += ` AND modalities && $${paramIndex}`;
    values.push(filters.modalities);
    paramIndex++;
  }

  if (filters?.tags && filters.tags.length > 0) {
    whereClause += ` AND tags && $${paramIndex}`;
    values.push(filters.tags);
    paramIndex++;
  }

  if (filters?.location) {
    whereClause += ` AND location ILIKE $${paramIndex}`;
    values.push(`%${filters.location}%`);
    paramIndex++;
  }

  if (filters?.accepts_sliding_scale === true) {
    whereClause += ` AND accepts_sliding_scale = true`;
  }

  const result = await query(
    `SELECT * FROM practitioner_directory_profiles
     WHERE ${whereClause}
     ORDER BY updated_at DESC
     LIMIT 50`,
    values
  );

  return result.rows.map((row) => ({
    ...row,
    modalities: row.modalities || [],
    tags: row.tags || [],
    languages: row.languages || [],
  }));
}

// ============================================
// CONNECTION OPERATIONS
// ============================================

/**
 * Get all connections for a practitioner
 */
export async function getConnections(
  practitionerId: string,
  status?: 'pending' | 'accepted' | 'declined' | 'blocked'
): Promise<ConnectionWithProfile[]> {
  let statusFilter = '';
  const values: any[] = [practitionerId, practitionerId];

  if (status) {
    statusFilter = 'AND c.status = $3';
    values.push(status);
  }

  const result = await query(
    `SELECT
      c.*,
      CASE
        WHEN c.requester_id = $1 THEN c.recipient_id
        ELSE c.requester_id
      END as colleague_id,
      m.name as colleague_name,
      p.*
     FROM practitioner_connections c
     LEFT JOIN members m ON m.id = CASE
       WHEN c.requester_id = $1 THEN c.recipient_id
       ELSE c.requester_id
     END
     LEFT JOIN practitioner_directory_profiles p ON p.practitioner_id = CASE
       WHEN c.requester_id = $1 THEN c.recipient_id
       ELSE c.requester_id
     END
     WHERE (c.requester_id = $1 OR c.recipient_id = $2)
     ${statusFilter}
     ORDER BY c.created_at DESC`,
    values
  );

  return result.rows.map((row) => ({
    id: row.id,
    requester_id: row.requester_id,
    recipient_id: row.recipient_id,
    status: row.status,
    requested_at: row.requested_at,
    responded_at: row.responded_at,
    created_at: row.created_at,
    colleague_name: row.colleague_name || 'Unknown',
    colleague_profile: row.practitioner_id
      ? {
          practitioner_id: row.practitioner_id,
          is_listed: row.is_listed,
          accepting_referrals: row.accepting_referrals,
          display_name: row.display_name,
          location: row.location,
          bio: row.bio,
          modalities: row.modalities || [],
          tags: row.tags || [],
          languages: row.languages || [],
          accepts_sliding_scale: row.accepts_sliding_scale,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }
      : null,
  }));
}

/**
 * Check if two practitioners are connected (accepted)
 */
export async function areColleagues(
  practitionerA: string,
  practitionerB: string
): Promise<boolean> {
  const result = await query(
    `SELECT 1 FROM practitioner_connections
     WHERE status = 'accepted'
       AND (
         (requester_id = $1 AND recipient_id = $2)
         OR (requester_id = $2 AND recipient_id = $1)
       )
     LIMIT 1`,
    [practitionerA, practitionerB]
  );

  return result.rows.length > 0;
}

/**
 * Get connection between two practitioners
 */
export async function getConnection(
  practitionerA: string,
  practitionerB: string
): Promise<Connection | null> {
  const result = await query(
    `SELECT * FROM practitioner_connections
     WHERE (requester_id = $1 AND recipient_id = $2)
        OR (requester_id = $2 AND recipient_id = $1)
     LIMIT 1`,
    [practitionerA, practitionerB]
  );

  return result.rows[0] || null;
}

/**
 * Request a connection (INVARIANT #3: requires acceptance)
 */
export async function requestConnection(
  requesterId: string,
  recipientId: string
): Promise<Connection> {
  // Prevent self-connection (check first, before DB query)
  if (requesterId === recipientId) {
    throw new Error('CANNOT_CONNECT_TO_SELF');
  }

  // Check if connection already exists
  const existing = await getConnection(requesterId, recipientId);

  if (existing) {
    if (existing.status === 'accepted') {
      throw new Error('ALREADY_CONNECTED');
    }
    if (existing.status === 'pending') {
      throw new Error('REQUEST_PENDING');
    }
    if (existing.status === 'blocked') {
      throw new Error('CONNECTION_BLOCKED');
    }
    // If declined, allow re-request
  }

  const result = await query(
    `INSERT INTO practitioner_connections (requester_id, recipient_id, status)
     VALUES ($1, $2, 'pending')
     ON CONFLICT (requester_id, recipient_id)
     DO UPDATE SET status = 'pending', requested_at = NOW(), responded_at = NULL
     RETURNING *`,
    [requesterId, recipientId]
  );

  return result.rows[0];
}

/**
 * Respond to a connection request (accept/decline/block)
 */
export async function respondToConnection(
  connectionId: string,
  recipientId: string,
  response: 'accepted' | 'declined' | 'blocked'
): Promise<Connection> {
  // Get connection and verify recipient
  const result = await query(
    `UPDATE practitioner_connections
     SET status = $1, responded_at = NOW()
     WHERE id = $2 AND recipient_id = $3 AND status = 'pending'
     RETURNING *`,
    [response, connectionId, recipientId]
  );

  if (!result.rows[0]) {
    throw new Error('CONNECTION_NOT_FOUND');
  }

  return result.rows[0];
}

/**
 * Remove a connection
 */
export async function removeConnection(
  connectionId: string,
  practitionerId: string
): Promise<void> {
  const result = await query(
    `DELETE FROM practitioner_connections
     WHERE id = $1 AND (requester_id = $2 OR recipient_id = $2)
     RETURNING id`,
    [connectionId, practitionerId]
  );

  if (!result.rows[0]) {
    throw new Error('CONNECTION_NOT_FOUND');
  }
}

// ============================================
// REFERRAL REQUEST OPERATIONS
// ============================================

/**
 * Create a referral draft (INVARIANT #5: colleagues only)
 */
export async function createReferralDraft(
  fromPractitionerId: string,
  toPractitionerId: string,
  input: {
    client_age_range?: string;
    client_pronouns?: string;
    presenting_themes?: string[];
    urgency?: 'routine' | 'soon' | 'time_sensitive';
    constraints?: string[];
    requester_note: string;
  }
): Promise<ReferralRequest> {
  // INVARIANT #5: Verify colleagues
  const connection = await getConnection(fromPractitionerId, toPractitionerId);

  if (!connection || connection.status !== 'accepted') {
    throw new Error('NOT_COLLEAGUES');
  }

  const result = await query(
    `INSERT INTO referral_requests (
      from_practitioner_id,
      to_practitioner_id,
      connection_id,
      status,
      client_age_range,
      client_pronouns,
      presenting_themes,
      urgency,
      constraints,
      requester_note
    ) VALUES ($1, $2, $3, 'draft', $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      fromPractitionerId,
      toPractitionerId,
      connection.id,
      input.client_age_range || null,
      input.client_pronouns || null,
      input.presenting_themes || [],
      input.urgency || 'routine',
      input.constraints || [],
      input.requester_note,
    ]
  );

  return formatReferral(result.rows[0]);
}

/**
 * Send a referral (moves from draft to sent)
 */
export async function sendReferral(
  referralId: string,
  fromPractitionerId: string
): Promise<ReferralRequest> {
  const result = await query(
    `UPDATE referral_requests
     SET status = 'sent', sent_at = NOW()
     WHERE id = $1 AND from_practitioner_id = $2 AND status = 'draft'
     RETURNING *`,
    [referralId, fromPractitionerId]
  );

  if (!result.rows[0]) {
    throw new Error('REFERRAL_NOT_FOUND');
  }

  return formatReferral(result.rows[0]);
}

/**
 * Record consent and optionally share identity
 * (INVARIANT #2: explicit consent required)
 */
export async function recordConsent(
  referralId: string,
  fromPractitionerId: string,
  input: {
    client_consent_given: boolean;
    client_name_shared?: boolean;
    client_name?: string;
    client_contact?: string;
  }
): Promise<ReferralRequest> {
  // If not giving consent, clear everything
  if (!input.client_consent_given) {
    const result = await query(
      `UPDATE referral_requests
       SET client_consent_given = false,
           client_name_shared = false,
           client_name = NULL,
           client_contact = NULL,
           consent_recorded_at = NULL
       WHERE id = $1 AND from_practitioner_id = $2
       RETURNING *`,
      [referralId, fromPractitionerId]
    );

    if (!result.rows[0]) {
      throw new Error('REFERRAL_NOT_FOUND');
    }

    return formatReferral(result.rows[0]);
  }

  // Consent given - optionally share name
  const shareInfo = input.client_name_shared === true;

  // INVARIANT #2: name/contact only if both consent AND share are true
  const clientName = shareInfo ? input.client_name || null : null;
  const clientContact = shareInfo ? input.client_contact || null : null;

  const result = await query(
    `UPDATE referral_requests
     SET client_consent_given = true,
         client_name_shared = $3,
         client_name = $4,
         client_contact = $5,
         consent_recorded_at = NOW()
     WHERE id = $1 AND from_practitioner_id = $2
     RETURNING *`,
    [referralId, fromPractitionerId, shareInfo, clientName, clientContact]
  );

  if (!result.rows[0]) {
    throw new Error('REFERRAL_NOT_FOUND');
  }

  return formatReferral(result.rows[0]);
}

/**
 * Get referrals (inbox or sent)
 */
export async function getReferrals(
  practitionerId: string,
  type: 'inbox' | 'sent'
): Promise<ReferralView[]> {
  const field = type === 'inbox' ? 'to_practitioner_id' : 'from_practitioner_id';

  const result = await query(
    `SELECT r.*,
            m_from.name as from_name,
            m_to.name as to_name
     FROM referral_requests r
     LEFT JOIN members m_from ON m_from.id = r.from_practitioner_id
     LEFT JOIN members m_to ON m_to.id = r.to_practitioner_id
     WHERE r.${field} = $1
     ORDER BY r.created_at DESC`,
    [practitionerId]
  );

  return result.rows.map((row) => formatReferralView(row, practitionerId));
}

/**
 * Get single referral (with note privacy enforced)
 */
export async function getReferral(
  referralId: string,
  practitionerId: string
): Promise<ReferralView | null> {
  const result = await query(
    `SELECT r.*,
            m_from.name as from_name,
            m_to.name as to_name
     FROM referral_requests r
     LEFT JOIN members m_from ON m_from.id = r.from_practitioner_id
     LEFT JOIN members m_to ON m_to.id = r.to_practitioner_id
     WHERE r.id = $1
       AND (r.from_practitioner_id = $2 OR r.to_practitioner_id = $2)`,
    [referralId, practitionerId]
  );

  if (!result.rows[0]) {
    return null;
  }

  // Mark as viewed if recipient
  if (result.rows[0].to_practitioner_id === practitionerId && !result.rows[0].viewed_at) {
    await query(
      `UPDATE referral_requests SET viewed_at = NOW(), status = 'received'
       WHERE id = $1 AND status = 'sent'`,
      [referralId]
    );
  }

  return formatReferralView(result.rows[0], practitionerId);
}

/**
 * Update recipient note (INVARIANT #4: only recipient can write)
 */
export async function updateRecipientNote(
  referralId: string,
  recipientId: string,
  note: string
): Promise<ReferralView> {
  const result = await query(
    `UPDATE referral_requests
     SET recipient_note = $3
     WHERE id = $1 AND to_practitioner_id = $2
     RETURNING *`,
    [referralId, recipientId, note]
  );

  if (!result.rows[0]) {
    throw new Error('REFERRAL_NOT_FOUND');
  }

  return formatReferralView(result.rows[0], recipientId);
}

/**
 * Respond to referral (accept/decline)
 */
export async function respondToReferral(
  referralId: string,
  recipientId: string,
  response: 'accepted' | 'declined',
  recipientNote?: string
): Promise<ReferralView> {
  const result = await query(
    `UPDATE referral_requests
     SET status = $3, responded_at = NOW(), recipient_note = COALESCE($4, recipient_note)
     WHERE id = $1 AND to_practitioner_id = $2 AND status IN ('sent', 'received')
     RETURNING *`,
    [referralId, recipientId, response, recipientNote || null]
  );

  if (!result.rows[0]) {
    throw new Error('REFERRAL_NOT_FOUND');
  }

  return formatReferralView(result.rows[0], recipientId);
}

/**
 * Close a referral
 */
export async function closeReferral(
  referralId: string,
  practitionerId: string
): Promise<ReferralView> {
  const result = await query(
    `UPDATE referral_requests
     SET status = 'closed'
     WHERE id = $1 AND (from_practitioner_id = $2 OR to_practitioner_id = $2)
     RETURNING *`,
    [referralId, practitionerId]
  );

  if (!result.rows[0]) {
    throw new Error('REFERRAL_NOT_FOUND');
  }

  return formatReferralView(result.rows[0], practitionerId);
}

// ============================================
// HELPERS
// ============================================

function formatReferral(row: any): ReferralRequest {
  return {
    ...row,
    presenting_themes: row.presenting_themes || [],
    constraints: row.constraints || [],
  };
}

/**
 * Format referral for viewing (INVARIANT #4: note privacy)
 */
function formatReferralView(row: any, viewerId: string): ReferralView {
  const isRequester = row.from_practitioner_id === viewerId;

  return {
    id: row.id,
    from_practitioner_id: row.from_practitioner_id,
    to_practitioner_id: row.to_practitioner_id,
    connection_id: row.connection_id,
    status: row.status,
    client_age_range: row.client_age_range,
    client_pronouns: row.client_pronouns,
    presenting_themes: row.presenting_themes || [],
    urgency: row.urgency,
    constraints: row.constraints || [],
    client_consent_given: row.client_consent_given,
    client_name_shared: row.client_name_shared,
    client_name: row.client_name,
    client_contact: row.client_contact,
    consent_recorded_at: row.consent_recorded_at,
    created_at: row.created_at,
    sent_at: row.sent_at,
    viewed_at: row.viewed_at,
    responded_at: row.responded_at,
    // INVARIANT #4: Only show note to its owner
    my_note: isRequester ? row.requester_note : row.recipient_note,
    their_note_exists: isRequester ? !!row.recipient_note : !!row.requester_note,
  };
}
