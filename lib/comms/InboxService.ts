/**
 * COMMS SPINE: Inbox Service
 *
 * Unified inbox across clinical, ops, and community domains.
 * Powers the practitioner's communication cockpit.
 *
 * @module lib/comms/InboxService
 */

import { query, queryOne } from '../db/postgres';
import type {
  CommsDomain,
  InboxQueryOptions,
  InboxResponse,
  InboxThreadItem,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// INBOX QUERIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get unified inbox for a practitioner.
 *
 * Returns threads sorted by:
 * 1. Safety concerns (crisis > red > yellow)
 * 2. Unread count (descending)
 * 3. Latest message time (descending)
 */
export async function getInbox(
  practitionerId: string,
  options: InboxQueryOptions = {}
): Promise<InboxResponse> {
  const {
    domain = 'all',
    filter = 'all',
    limit = 50,
    offset = 0,
  } = options;

  // Build domain filter
  const domainFilter = domain === 'all' ? '' : `AND t.domain = $2`;
  const domainParam = domain === 'all' ? [] : [domain];

  // Build filter conditions
  let filterCondition = '';
  if (filter === 'unread') {
    filterCondition = 'AND thread_stats.unread_count > 0';
  } else if (filter === 'safety') {
    filterCondition = 'AND thread_stats.safety_count > 0';
  } else if (filter === 'unanswered') {
    filterCondition = `AND thread_stats.unread_count > 0
      AND thread_stats.latest_sender_type = 'client'`;
  }

  // Main inbox query with aggregations
  const threadsResult = await query<InboxThreadItem>(
    `WITH thread_stats AS (
      SELECT
        t.id as thread_id,
        t.domain,
        t.thread_type,
        t.client_id,
        t.last_message_at,
        -- Unread count (messages from client, not yet read)
        COUNT(*) FILTER (
          WHERE m.sender_type = 'client'
          AND m.delivery_status IN ('sent', 'delivered')
        ) as unread_count,
        -- Safety count (unacknowledged safety flags)
        COUNT(DISTINCT sf.id) FILTER (
          WHERE sf.acknowledged_at IS NULL
        ) as safety_count,
        -- Has unacknowledged safety
        EXISTS (
          SELECT 1 FROM comms_safety_flags sf2
          WHERE sf2.thread_id = t.id AND sf2.acknowledged_at IS NULL
        ) as has_unacknowledged_safety,
        -- Latest message info
        (
          SELECT m2.body
          FROM comms_messages m2
          WHERE m2.thread_id = t.id
          ORDER BY m2.created_at DESC
          LIMIT 1
        ) as latest_message_preview,
        (
          SELECT m2.message_type
          FROM comms_messages m2
          WHERE m2.thread_id = t.id
          ORDER BY m2.created_at DESC
          LIMIT 1
        ) as latest_message_type,
        (
          SELECT m2.urgency
          FROM comms_messages m2
          WHERE m2.thread_id = t.id
          ORDER BY m2.created_at DESC
          LIMIT 1
        ) as latest_urgency,
        (
          SELECT m2.sender_type
          FROM comms_messages m2
          WHERE m2.thread_id = t.id
          ORDER BY m2.created_at DESC
          LIMIT 1
        ) as latest_sender_type
      FROM comms_threads t
      LEFT JOIN comms_messages m ON m.thread_id = t.id
      LEFT JOIN comms_safety_flags sf ON sf.thread_id = t.id
      WHERE t.practitioner_id = $1
        AND t.status = 'active'
        ${domainFilter}
      GROUP BY t.id
    )
    SELECT
      ts.thread_id,
      ts.domain,
      ts.thread_type,
      ts.client_id,
      pc.name as client_name,
      pc.preferred_name as client_preferred_name,
      ts.unread_count::int,
      ts.safety_count::int,
      ts.has_unacknowledged_safety,
      ts.last_message_at as latest_message_at,
      LEFT(ts.latest_message_preview, 150) as latest_message_preview,
      ts.latest_message_type,
      COALESCE(ts.latest_urgency, 'normal') as latest_urgency
    FROM thread_stats ts
    LEFT JOIN practitioner_clients pc ON pc.id = ts.client_id
    WHERE 1=1 ${filterCondition}
    ORDER BY
      -- Safety first (crisis > red > yellow)
      CASE
        WHEN EXISTS (
          SELECT 1 FROM comms_safety_flags sf
          WHERE sf.thread_id = ts.thread_id
          AND sf.acknowledged_at IS NULL
          AND sf.severity = 'crisis'
        ) THEN 0
        WHEN EXISTS (
          SELECT 1 FROM comms_safety_flags sf
          WHERE sf.thread_id = ts.thread_id
          AND sf.acknowledged_at IS NULL
          AND sf.severity = 'red'
        ) THEN 1
        WHEN ts.safety_count > 0 THEN 2
        ELSE 3
      END,
      -- Then by unread
      ts.unread_count DESC,
      -- Then by recency
      ts.last_message_at DESC NULLS LAST
    LIMIT ${limit}
    OFFSET ${offset}`,
    [practitionerId, ...domainParam]
  );

  // Get summary counts
  const summaryResult = await query<{
    domain: CommsDomain;
    unread: number;
    safety: number;
  }>(
    `SELECT
      t.domain,
      COUNT(*) FILTER (
        WHERE m.sender_type = 'client'
        AND m.delivery_status IN ('sent', 'delivered')
      )::int as unread,
      COUNT(DISTINCT sf.id) FILTER (
        WHERE sf.acknowledged_at IS NULL
      )::int as safety
    FROM comms_threads t
    LEFT JOIN comms_messages m ON m.thread_id = t.id
    LEFT JOIN comms_safety_flags sf ON sf.thread_id = t.id
    WHERE t.practitioner_id = $1
      AND t.status = 'active'
    GROUP BY t.domain`,
    [practitionerId]
  );

  // Build summary
  const byDomain = {
    clinical: { unread: 0, safety: 0 },
    ops: { unread: 0, safety: 0 },
    community: { unread: 0, safety: 0 },
  };

  let totalUnread = 0;
  let totalSafety = 0;

  for (const row of summaryResult.rows) {
    if (row.domain in byDomain) {
      byDomain[row.domain as CommsDomain] = {
        unread: row.unread,
        safety: row.safety,
      };
      totalUnread += row.unread;
      totalSafety += row.safety;
    }
  }

  return {
    threads: threadsResult.rows,
    summary: {
      total_unread: totalUnread,
      total_safety_concerns: totalSafety,
      by_domain: byDomain,
    },
  };
}

/**
 * Get unread counts only (for badges/notifications).
 */
export async function getUnreadCounts(practitionerId: string): Promise<{
  total: number;
  safety: number;
  by_domain: Record<CommsDomain, { unread: number; safety: number }>;
}> {
  const result = await query<{
    domain: CommsDomain;
    unread: number;
    safety: number;
  }>(
    `SELECT
      t.domain,
      COUNT(*) FILTER (
        WHERE m.sender_type = 'client'
        AND m.delivery_status IN ('sent', 'delivered')
      )::int as unread,
      COUNT(DISTINCT sf.id) FILTER (
        WHERE sf.acknowledged_at IS NULL
      )::int as safety
    FROM comms_threads t
    LEFT JOIN comms_messages m ON m.thread_id = t.id
    LEFT JOIN comms_safety_flags sf ON sf.thread_id = t.id
    WHERE t.practitioner_id = $1
      AND t.status = 'active'
    GROUP BY t.domain`,
    [practitionerId]
  );

  const byDomain: Record<CommsDomain, { unread: number; safety: number }> = {
    clinical: { unread: 0, safety: 0 },
    ops: { unread: 0, safety: 0 },
    community: { unread: 0, safety: 0 },
  };

  let total = 0;
  let safety = 0;

  for (const row of result.rows) {
    if (row.domain in byDomain) {
      byDomain[row.domain] = { unread: row.unread, safety: row.safety };
      total += row.unread;
      safety += row.safety;
    }
  }

  return { total, safety, by_domain: byDomain };
}

/**
 * Check if practitioner has any unacknowledged safety concerns.
 * Used for the safety ribbon.
 */
export async function hasSafetyConcerns(practitionerId: string): Promise<{
  has_concerns: boolean;
  crisis_count: number;
  red_count: number;
  yellow_count: number;
}> {
  const result = await queryOne<{
    crisis_count: number;
    red_count: number;
    yellow_count: number;
  }>(
    `SELECT
      COUNT(*) FILTER (WHERE sf.severity = 'crisis')::int as crisis_count,
      COUNT(*) FILTER (WHERE sf.severity = 'red')::int as red_count,
      COUNT(*) FILTER (WHERE sf.severity = 'yellow')::int as yellow_count
    FROM comms_safety_flags sf
    JOIN comms_threads t ON t.id = sf.thread_id
    WHERE t.practitioner_id = $1
      AND sf.acknowledged_at IS NULL`,
    [practitionerId]
  );

  if (!result) {
    return { has_concerns: false, crisis_count: 0, red_count: 0, yellow_count: 0 };
  }

  return {
    has_concerns: result.crisis_count + result.red_count + result.yellow_count > 0,
    crisis_count: result.crisis_count,
    red_count: result.red_count,
    yellow_count: result.yellow_count,
  };
}
