/**
 * Scribe Auth Helpers
 *
 * Shared authentication utilities for scribe API routes.
 * Handles both cookie-based sessions (web) and header-based auth (Safari/iOS).
 */

import { NextRequest } from 'next/server';
import { getCurrentSession, validateSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';

// Scribe session interface for type safety
export interface ScribeSession {
  id: string;
  member_id: string;
  container: 'solo' | 'witness' | 'practitioner';
  title: string | null;
  started_at: Date;
  ended_at: Date | null;
  is_active: boolean;
  consent_status: 'pending' | 'confirmed' | 'declined';
  consent_confirmed_at: Date | null;
  consent_method: 'voice' | 'tap' | 'both' | null;
  participants: Array<{ label: string; role: string }>;
  memory_policy: 'sealed' | 'learning';
  transcript_enabled: boolean;
  summary: Record<string, unknown> | null;
}

/**
 * Get member ID from request
 *
 * Tries in order:
 * 1. Session cookie (via getCurrentSession)
 * 2. x-session-token header (Safari/iOS header-based auth)
 *
 * Returns null if no valid auth found.
 */
export async function getMemberIdFromRequest(request: NextRequest): Promise<string | null> {
  // Try 1: Cookie-based session (standard web)
  const session = await getCurrentSession();
  if (session?.memberId) {
    return session.memberId;
  }

  // Try 2: Header-based session token (Safari/iOS)
  const sessionToken = request.headers.get('x-session-token');
  if (sessionToken) {
    const headerSession = await validateSession(sessionToken);
    if (headerSession?.memberId) {
      return headerSession.memberId;
    }
  }

  return null;
}

/**
 * Verify member owns the scribe session
 *
 * Returns the session if valid and owned by member, null otherwise.
 */
export async function verifySessionOwnership(
  sessionId: string,
  memberId: string
): Promise<ScribeSession | null> {
  try {
    const result = await query(
      `SELECT * FROM scribe_sessions WHERE id = $1 AND member_id = $2`,
      [sessionId, memberId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      member_id: row.member_id,
      container: row.container,
      title: row.title,
      started_at: new Date(row.started_at),
      ended_at: row.ended_at ? new Date(row.ended_at) : null,
      is_active: row.is_active,
      consent_status: row.consent_status,
      consent_confirmed_at: row.consent_confirmed_at ? new Date(row.consent_confirmed_at) : null,
      consent_method: row.consent_method,
      participants: row.participants || [],
      memory_policy: row.memory_policy,
      transcript_enabled: row.transcript_enabled,
      summary: row.summary,
    };
  } catch (error) {
    console.error('[ScribeAuth] Failed to verify session ownership:', error);
    return null;
  }
}

/**
 * Marker types allowed for each container type
 *
 * Validates that marker types are appropriate for the session's container.
 */
export const MARKER_TYPES: Record<'solo' | 'witness' | 'practitioner', string[]> = {
  solo: [
    'insight',
    'resistance',
    'opening',
    'integration',
    'question',
    'pause',
    'resume',
  ],
  practitioner: [
    'turning_point',
    'somatic_shift',
    'avoidance',
    'repair_attempt',
    'breakthrough',
    'pause',
    'resume',
  ],
  witness: [
    'escalation',
    'softening',
    'miss',
    'need_named',
    'repair',
    'appreciation',
    'pause',
    'resume',
  ],
};

/**
 * Validate marker type for container
 *
 * Returns true if the marker type is valid for the container,
 * or if no marker type is provided (generic mark).
 */
export function isValidMarkerType(
  container: 'solo' | 'witness' | 'practitioner',
  markerType: string | undefined
): boolean {
  if (!markerType) return true; // Generic mark allowed
  return MARKER_TYPES[container].includes(markerType);
}

/**
 * UUID validation helper
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}
