/**
 * STELLIUM CLIENT MANAGEMENT
 *
 * Server-side functions for managing practitioner clients
 *
 * PHI ENCRYPTION: Client names are encrypted at rest using AES-256-GCM.
 * - Dual-write: Both plaintext (name) and encrypted (name_enc) columns are written
 * - Read: Decrypts from name_enc when available, falls back to plaintext
 * - Migration: Backfill script encrypts existing plaintext records
 */

import { query } from '@/lib/db/postgres';
import {
  PractitionerClient,
  CreateClientInput,
  UpdateClientInput,
} from './types';
import { PHIEncryption, PHIContext, PHIEncryptionMeta } from '@/lib/security/phiEncryption';

// ============================================
// ENCRYPTION HELPERS
// ============================================

/**
 * Get practitioner's encryption key salt from database
 * Falls back to a default salt if practitioner doesn't have one yet
 */
async function getPractitionerEncryptionSalt(practitionerId: string): Promise<string | null> {
  try {
    const result = await query(
      `SELECT encryption_key_salt FROM practitioners WHERE member_id = $1`,
      [practitionerId]
    );
    return result.rows[0]?.encryption_key_salt || null;
  } catch {
    // Practitioners table may not have this column yet
    return null;
  }
}

/**
 * Build PHI context for client name encryption
 */
function buildClientNameContext(clientId: string, practitionerId: string): PHIContext {
  return {
    table: 'practitioner_clients',
    column: 'name',
    rowId: clientId,
    ownerId: practitionerId,
  };
}

/**
 * Encrypt a client name for storage
 * Returns null if encryption is not configured
 */
function encryptClientName(
  name: string,
  clientId: string,
  practitionerId: string
): { ciphertext: string; meta: PHIEncryptionMeta } | null {
  try {
    // Check if encryption key is configured
    if (!process.env.PHI_ENCRYPTION_KEY) {
      return null;
    }
    const context = buildClientNameContext(clientId, practitionerId);
    return PHIEncryption.encryptForDB(name, context);
  } catch (error) {
    console.warn('[Stellium] Client name encryption failed, continuing with plaintext:', error);
    return null;
  }
}

/**
 * Decrypt a client name from storage
 * Falls back to plaintext if decryption fails
 */
function decryptClientName(
  ciphertext: string | null,
  meta: PHIEncryptionMeta | null,
  clientId: string,
  practitionerId: string,
  plaintextFallback: string
): string {
  if (!ciphertext || !meta) {
    return plaintextFallback;
  }
  try {
    const context = buildClientNameContext(clientId, practitionerId);
    return PHIEncryption.decryptFromDB(ciphertext, meta, context);
  } catch (error) {
    console.warn('[Stellium] Client name decryption failed, using plaintext:', error);
    return plaintextFallback;
  }
}

/**
 * Process a client row to decrypt name fields
 * SECURITY: Strips encrypted columns from output to prevent PHI leakage
 */
function decryptClientRow(row: any, practitionerId: string): PractitionerClient {
  if (!row) return row;

  // Decrypt name if encrypted version exists
  if (row.name_enc && row.name_enc_meta) {
    row.name = decryptClientName(
      row.name_enc,
      row.name_enc_meta,
      row.id,
      practitionerId,
      row.name
    );
  }

  // Decrypt preferred_name if encrypted version exists
  if (row.preferred_name_enc && row.preferred_name_enc_meta) {
    row.preferred_name = decryptClientName(
      row.preferred_name_enc,
      row.preferred_name_enc_meta,
      row.id,
      practitionerId,
      row.preferred_name
    );
  }

  // SECURITY: Strip encrypted columns - they must never leave the data layer
  // See: docs/security/phi-columns.md
  delete row.name_enc;
  delete row.name_enc_meta;
  delete row.preferred_name_enc;
  delete row.preferred_name_enc_meta;

  return row as PractitionerClient;
}

/**
 * Decrypt client name fields from a joined row
 *
 * Use this when you have a row from a JOIN query that includes client fields
 * with prefixes like 'client_name', 'client_name_enc', etc.
 *
 * @param row - The joined row with client fields
 * @param clientId - The client ID (usually row.client_id)
 * @param practitionerId - The practitioner ID
 * @returns Object with decrypted client_name and client_preferred_name
 */
// SECURITY CRITICAL:
// This function exists to prevent side-route PHI leakage.
// If you bypass it, you are creating a data breach.
// See: docs/security/phi-columns.md
export function decryptJoinedClientFields(
  row: {
    client_id?: string;
    client_name?: string;
    client_name_enc?: string;
    client_name_enc_meta?: any;
    client_preferred_name?: string;
    client_preferred_name_enc?: string;
    client_preferred_name_enc_meta?: any;
  },
  practitionerId: string
): { client_name: string | null; client_preferred_name: string | null } {
  if (!row || !row.client_id) {
    return { client_name: null, client_preferred_name: null };
  }

  const clientId = row.client_id;

  // Decrypt name
  let clientName = row.client_name || null;
  if (row.client_name_enc && row.client_name_enc_meta) {
    const meta = typeof row.client_name_enc_meta === 'string'
      ? JSON.parse(row.client_name_enc_meta)
      : row.client_name_enc_meta;
    clientName = decryptClientName(
      row.client_name_enc,
      meta,
      clientId,
      practitionerId,
      row.client_name || ''
    );
  }

  // Decrypt preferred_name
  let clientPreferredName = row.client_preferred_name || null;
  if (row.client_preferred_name_enc && row.client_preferred_name_enc_meta) {
    const meta = typeof row.client_preferred_name_enc_meta === 'string'
      ? JSON.parse(row.client_preferred_name_enc_meta)
      : row.client_preferred_name_enc_meta;
    clientPreferredName = decryptClientName(
      row.client_preferred_name_enc,
      meta,
      clientId,
      practitionerId,
      row.client_preferred_name || ''
    );
  }

  return { client_name: clientName, client_preferred_name: clientPreferredName };
}

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

  // Decrypt names in results
  const clients = result.rows.map(row => decryptClientRow(row, practitionerId));

  return {
    clients,
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

  if (!result.rows[0]) return null;
  return decryptClientRow(result.rows[0], practitionerId);
}

/**
 * Create a new client
 *
 * DUAL-WRITE: Writes both plaintext name and encrypted name_enc.
 * During migration, plaintext is kept for backward compatibility.
 * Once backfill is complete, plaintext column will be removed.
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

  // Step 1: Insert client with plaintext name (we need the ID for encryption context)
  const insertResult = await query(
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

  const client = insertResult.rows[0];
  const clientId = client.id;

  // Step 2: Encrypt name and preferred_name, then update
  const nameEncrypted = encryptClientName(name, clientId, practitionerId);
  const preferredNameEncrypted = preferred_name
    ? encryptClientName(preferred_name, clientId, practitionerId)
    : null;

  // Only update if we successfully encrypted
  if (nameEncrypted || preferredNameEncrypted) {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (nameEncrypted) {
      updates.push(`name_enc = $${paramIndex}, name_enc_meta = $${paramIndex + 1}`);
      params.push(nameEncrypted.ciphertext, JSON.stringify(nameEncrypted.meta));
      paramIndex += 2;
    }

    if (preferredNameEncrypted) {
      updates.push(`preferred_name_enc = $${paramIndex}, preferred_name_enc_meta = $${paramIndex + 1}`);
      params.push(preferredNameEncrypted.ciphertext, JSON.stringify(preferredNameEncrypted.meta));
      paramIndex += 2;
    }

    params.push(clientId);

    await query(
      `UPDATE practitioner_clients SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      params
    );
  }

  return client as PractitionerClient;
}

/**
 * Update a client
 *
 * DUAL-WRITE: When name or preferred_name is updated, also updates encrypted columns.
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

      // DUAL-WRITE: Also encrypt name fields
      if (field === 'name') {
        const encrypted = encryptClientName(input.name as string, clientId, practitionerId);
        if (encrypted) {
          updates.push(`name_enc = $${paramIndex}, name_enc_meta = $${paramIndex + 1}`);
          params.push(encrypted.ciphertext, JSON.stringify(encrypted.meta));
          paramIndex += 2;
        }
      }

      if (field === 'preferred_name') {
        const encrypted = encryptClientName(input.preferred_name as string, clientId, practitionerId);
        if (encrypted) {
          updates.push(`preferred_name_enc = $${paramIndex}, preferred_name_enc_meta = $${paramIndex + 1}`);
          params.push(encrypted.ciphertext, JSON.stringify(encrypted.meta));
          paramIndex += 2;
        }
      }
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

  if (!result.rows[0]) return null;
  return decryptClientRow(result.rows[0], practitionerId);
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

  return result.rows.map(row => decryptClientRow(row, practitionerId));
}
