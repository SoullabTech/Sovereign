/**
 * Auth Event Audit Logger
 * Logs authentication events to audit_logs table for login insight
 */

import { query } from '@/lib/db/postgres';
import { NextRequest } from 'next/server';

export type AuthAction =
  | 'signin_success'
  | 'signin_failed'
  | 'passcode_valid'
  | 'passcode_invalid'
  | 'register_success'
  | 'register_failed'
  | 'signout';

export interface AuthAuditEntry {
  action: AuthAction;
  memberId?: string | null;      // UUID - stored in resource_id
  resourceType?: string;
  identifier?: string | null;    // Non-UUID string identifier (passcode, username) - stored in session_id
  result: 'success' | 'failure';
  errorMessage?: string;
}

function extractRequestInfo(request: NextRequest): { ip: string; userAgent: string } {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return { ip, userAgent };
}

export async function logAuthEvent(
  entry: AuthAuditEntry,
  request: NextRequest
): Promise<void> {
  try {
    const { ip, userAgent } = extractRequestInfo(request);

    // Note: user_id is NULL because it FKs to users table, not members
    // We store member_id in resource_id instead
    await query(
      `INSERT INTO audit_logs (
        user_id,
        action_type,
        resource_type,
        resource_id,
        ip_address,
        user_agent,
        action_result,
        error_message,
        phi_accessed,
        consent_verified
      ) VALUES (
        NULL,
        $1,
        $2,
        $3,
        $4::inet,
        $5,
        $6,
        $7,
        false,
        true
      )`,
      [
        entry.action,
        entry.resourceType || 'member',
        entry.resourceId || entry.memberId || null,
        ip === 'unknown' ? null : ip,
        userAgent,
        entry.result,
        entry.errorMessage || null,
      ]
    );
  } catch (error) {
    // Log but don't fail the auth operation
    console.error('[AUTH_AUDIT] Failed to log auth event:', error);
  }
}
