/**
 * POST-IMPORT ACTIONS SERVICE
 *
 * After a successful import, practitioners can optionally:
 * 1. Tag imported clients (merge, trim, dedupe)
 * 2. Create a cohort group and assign clients
 * 3. Queue report generation (stub — pending job table)
 *
 * Each action is independent. Failures in one do not block others.
 */

import { query } from '@/lib/db/postgres';
import crypto from 'crypto';

// ============================================================================
// Types
// ============================================================================

export interface ImportActionsRequest {
  clientIds: string[];
  actions: {
    tags?: string[];
    cohortName?: string;
    queueSpiralogicReport?: boolean;
  };
}

export interface ImportActionsResult {
  tagged: number;
  cohortCreated?: {
    id: string;
    name: string;
    clientCount: number;
  };
  reportsQueued: number;
}

// ============================================================================
// Tag Application
// ============================================================================

/**
 * Merge tags into clients' existing tag arrays.
 * Trims whitespace, lowercases, deduplicates.
 */
export async function applyTagsToClients(
  practitionerId: string,
  clientIds: string[],
  tags: string[]
): Promise<number> {
  if (clientIds.length === 0 || tags.length === 0) return 0;

  // Normalize tags: trim, lowercase, remove empties, dedupe
  const normalizedTags = [...new Set(
    tags.map(t => t.trim().toLowerCase()).filter(Boolean)
  )];

  if (normalizedTags.length === 0) return 0;

  // Use array_cat + array_distinct pattern to merge without overwriting
  // array_cat combines arrays; we then dedupe via unnest + DISTINCT
  const result = await query(
    `UPDATE practitioner_clients
     SET tags = (
       SELECT ARRAY(
         SELECT DISTINCT unnest(
           array_cat(COALESCE(tags, '{}'), $3::text[])
         )
       )
     ),
     updated_at = NOW()
     WHERE id = ANY($1::uuid[])
       AND practitioner_id = $2
     RETURNING id`,
    [clientIds, practitionerId, normalizedTags]
  );

  return result.rowCount ?? 0;
}

// ============================================================================
// Cohort Creation
// ============================================================================

/**
 * Create a cohort group and assign the given clients to it.
 * Uses existing client_groups + client_group_members tables.
 */
export async function createCohortForClients(
  practitionerId: string,
  clientIds: string[],
  cohortName: string
): Promise<{ id: string; name: string; clientCount: number }> {
  const groupId = crypto.randomUUID();
  const trimmedName = cohortName.trim();

  // Create the group
  await query(
    `INSERT INTO client_groups (
      id, practitioner_id, name, group_type, status, created_at, updated_at
    ) VALUES ($1, $2, $3, 'cohort', 'active', NOW(), NOW())`,
    [groupId, practitionerId, trimmedName]
  );

  // Add members (skip duplicates via ON CONFLICT)
  let added = 0;
  for (const clientId of clientIds) {
    try {
      await query(
        `INSERT INTO client_group_members (id, group_id, client_id, joined_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT DO NOTHING`,
        [crypto.randomUUID(), groupId, clientId]
      );
      added++;
    } catch {
      // Skip individual failures silently
    }
  }

  return { id: groupId, name: trimmedName, clientCount: added };
}

// ============================================================================
// Report Queue (Stub)
// ============================================================================

/**
 * Queue report generation for clients.
 * Currently a stub — creates tag markers so reports can be generated later.
 * When a report_jobs table exists, this will insert proper queue entries.
 */
export async function queueReportsForClients(
  practitionerId: string,
  clientIds: string[],
  reportType: string
): Promise<number> {
  if (clientIds.length === 0) return 0;

  // Stub: tag clients with a report-pending marker
  // This gives practitioners a way to find clients needing reports
  const reportTag = `report-pending:${reportType}`;

  return applyTagsToClients(practitionerId, clientIds, [reportTag]);
}
