/**
 * STELLIUM CLIENT MANAGEMENT
 *
 * Server-side functions for managing practitioner clients
 */

import { query } from '@/lib/db/postgres';
import {
  PractitionerClient,
  CreateClientInput,
  UpdateClientInput,
} from './types';

// ============================================
// CLIENT CRUD
// ============================================

/**
 * Get all clients for a practitioner
 */
export async function getClients(
  practitionerId: string,
  options?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'name' | 'last_session' | 'created_at';
    sortOrder?: 'asc' | 'desc';
  }
): Promise<{ clients: PractitionerClient[]; total: number }> {
  const {
    status,
    search,
    limit = 50,
    offset = 0,
    sortBy = 'name',
    sortOrder = 'asc',
  } = options || {};

  let whereClause = 'WHERE practitioner_id = $1';
  const params: any[] = [practitionerId];
  let paramIndex = 2;

  if (status) {
    whereClause += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (search) {
    whereClause += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR preferred_name ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total FROM practitioner_clients ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0]?.total || '0', 10);

  // Get clients
  const validSortColumns = ['name', 'last_session', 'created_at', 'first_session', 'total_sessions'];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'name';
  const order = sortOrder === 'desc' ? 'DESC' : 'ASC';

  const result = await query(
    `SELECT * FROM practitioner_clients
     ${whereClause}
     ORDER BY ${sortColumn} ${order} NULLS LAST
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  return {
    clients: result.rows as PractitionerClient[],
    total,
  };
}

/**
 * Get a single client by ID
 */
export async function getClient(
  practitionerId: string,
  clientId: string
): Promise<PractitionerClient | null> {
  const result = await query(
    `SELECT * FROM practitioner_clients
     WHERE id = $1 AND practitioner_id = $2`,
    [clientId, practitionerId]
  );

  return result.rows[0] as PractitionerClient | null;
}

/**
 * Create a new client
 */
export async function createClient(
  practitionerId: string,
  input: CreateClientInput
): Promise<PractitionerClient> {
  const {
    name,
    email,
    phone,
    preferred_name,
    pronouns,
    birth_date,
    birth_time,
    birth_location,
    birth_timezone,
    intake_data,
    private_notes,
    tags,
    status = 'active',
  } = input;

  const result = await query(
    `INSERT INTO practitioner_clients (
      practitioner_id, name, email, phone, preferred_name, pronouns,
      birth_date, birth_time, birth_location, birth_timezone,
      intake_data, private_notes, tags, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *`,
    [
      practitionerId,
      name,
      email || null,
      phone || null,
      preferred_name || null,
      pronouns || null,
      birth_date || null,
      birth_time || null,
      birth_location || null,
      birth_timezone || null,
      intake_data ? JSON.stringify(intake_data) : '{}',
      private_notes || null,
      tags || [],
      status,
    ]
  );

  return result.rows[0] as PractitionerClient;
}

/**
 * Update a client
 */
export async function updateClient(
  practitionerId: string,
  clientId: string,
  input: UpdateClientInput
): Promise<PractitionerClient | null> {
  // Build dynamic update query
  const updates: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  const fields: (keyof UpdateClientInput)[] = [
    'name', 'email', 'phone', 'preferred_name', 'pronouns',
    'birth_date', 'birth_time', 'birth_location', 'birth_timezone',
    'intake_data', 'private_notes', 'tags', 'status', 'themes',
  ];

  for (const field of fields) {
    if (input[field] !== undefined) {
      if (field === 'intake_data') {
        updates.push(`${field} = $${paramIndex}`);
        params.push(JSON.stringify(input[field]));
      } else {
        updates.push(`${field} = $${paramIndex}`);
        params.push(input[field]);
      }
      paramIndex++;
    }
  }

  if (updates.length === 0) {
    return getClient(practitionerId, clientId);
  }

  params.push(clientId, practitionerId);

  const result = await query(
    `UPDATE practitioner_clients
     SET ${updates.join(', ')}
     WHERE id = $${paramIndex} AND practitioner_id = $${paramIndex + 1}
     RETURNING *`,
    params
  );

  return result.rows[0] as PractitionerClient | null;
}

/**
 * Delete a client (soft delete - archive)
 */
export async function archiveClient(
  practitionerId: string,
  clientId: string
): Promise<boolean> {
  const result = await query(
    `UPDATE practitioner_clients
     SET status = 'archived'
     WHERE id = $1 AND practitioner_id = $2
     RETURNING id`,
    [clientId, practitionerId]
  );

  return result.rowCount > 0;
}

/**
 * Permanently delete a client
 */
export async function deleteClient(
  practitionerId: string,
  clientId: string
): Promise<boolean> {
  const result = await query(
    `DELETE FROM practitioner_clients
     WHERE id = $1 AND practitioner_id = $2
     RETURNING id`,
    [clientId, practitionerId]
  );

  return result.rowCount > 0;
}

// ============================================
// CLIENT TIMELINE
// ============================================

/**
 * Get client timeline with sessions and themes
 */
export async function getClientTimeline(
  practitionerId: string,
  clientId: string
): Promise<{
  client: PractitionerClient;
  sessions: any[];
  themes_over_time: { date: string; themes: string[] }[];
} | null> {
  const client = await getClient(practitionerId, clientId);
  if (!client) return null;

  // Get all sessions for this client
  const sessionsResult = await query(
    `SELECT * FROM practitioner_sessions
     WHERE client_id = $1 AND practitioner_id = $2
     ORDER BY scheduled_at DESC`,
    [clientId, practitionerId]
  );

  // Extract themes over time
  const themes_over_time = sessionsResult.rows
    .filter(s => s.themes && s.themes.length > 0)
    .map(s => ({
      date: s.scheduled_at || s.created_at,
      themes: s.themes,
    }));

  return {
    client,
    sessions: sessionsResult.rows,
    themes_over_time,
  };
}

// ============================================
// CLIENT STATISTICS
// ============================================

/**
 * Get statistics for a practitioner's clients
 */
export async function getClientStats(practitionerId: string): Promise<{
  total: number;
  active: number;
  inactive: number;
  archived: number;
  waitlist: number;
  new_this_month: number;
}> {
  const result = await query(
    `SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'active') as active,
      COUNT(*) FILTER (WHERE status = 'inactive') as inactive,
      COUNT(*) FILTER (WHERE status = 'archived') as archived,
      COUNT(*) FILTER (WHERE status = 'waitlist') as waitlist,
      COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW())) as new_this_month
    FROM practitioner_clients
    WHERE practitioner_id = $1`,
    [practitionerId]
  );

  const row = result.rows[0] || {};
  return {
    total: parseInt(row.total || '0', 10),
    active: parseInt(row.active || '0', 10),
    inactive: parseInt(row.inactive || '0', 10),
    archived: parseInt(row.archived || '0', 10),
    waitlist: parseInt(row.waitlist || '0', 10),
    new_this_month: parseInt(row.new_this_month || '0', 10),
  };
}

// ============================================
// BIRTH CHART INTEGRATION
// ============================================

/**
 * Update client birth data and chart status
 */
export async function updateClientBirthData(
  practitionerId: string,
  clientId: string,
  birthData: {
    birth_date: string;
    birth_time?: string;
    birth_location?: string;
    birth_latitude?: number;
    birth_longitude?: number;
    birth_timezone?: string;
  }
): Promise<PractitionerClient | null> {
  const result = await query(
    `UPDATE practitioner_clients
     SET
       birth_date = $1,
       birth_time = $2,
       birth_location = $3,
       birth_latitude = $4,
       birth_longitude = $5,
       birth_timezone = $6,
       has_chart = true
     WHERE id = $7 AND practitioner_id = $8
     RETURNING *`,
    [
      birthData.birth_date,
      birthData.birth_time || null,
      birthData.birth_location || null,
      birthData.birth_latitude || null,
      birthData.birth_longitude || null,
      birthData.birth_timezone || null,
      clientId,
      practitionerId,
    ]
  );

  return result.rows[0] as PractitionerClient | null;
}

/**
 * Get clients with birth charts (for astrology)
 */
export async function getClientsWithCharts(
  practitionerId: string
): Promise<PractitionerClient[]> {
  const result = await query(
    `SELECT * FROM practitioner_clients
     WHERE practitioner_id = $1 AND has_chart = true
     ORDER BY name ASC`,
    [practitionerId]
  );

  return result.rows as PractitionerClient[];
}
