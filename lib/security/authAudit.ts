/**
 * Auth Event Audit Logger
 * Logs authentication events to audit_logs table for login insight
 *
 * SECURITY: Never store plaintext credentials. Use hashes + redacted hints.
 */

import { query } from '@/lib/db/postgres';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

export type AuthAction =
  | 'signin_success'
  | 'signin_failed'
  | 'password_signin'
  | 'passcode_valid'
  | 'passcode_invalid'
  | 'register_success'
  | 'register_failed'
  | 'signout'
  | 'webauthn_authenticate'
  | 'webauthn_register'
  | 'webauthn_step_up'
  | 'session_revoked'
  | 'member_disabled'
  | 'member_archived'
  | 'member_reactivated'
  | 'member_hard_deleted';

export interface AuthAuditEntry {
  action: AuthAction;
  memberId?: string | null;      // UUID - stored in resource_id
  resourceType?: string;
  result: 'success' | 'failure';
  errorMessage?: string;
  metadata?: Record<string, unknown>;  // Structured context (hashes, hints, reasons)
}

// UUID v4 pattern validator
function isUuid(v?: string | null): boolean {
  if (!v) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

function extractRequestInfo(request: NextRequest): { ip: string; userAgent: string } {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return { ip, userAgent };
}

/**
 * Hash a credential for audit logging (one-way, no reversal)
 */
export function hashCredential(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 16);
}

/**
 * Redact a passcode for human-readable hint (keeps prefix + last 4)
 * e.g., SOULLAB-TRAVIS -> SOULLAB-****AVIS
 */
export function redactPasscode(passcode: string): string {
  const clean = passcode.trim();
  if (clean.length <= 4) return '****';
  const last4 = clean.slice(-4);
  if (clean.startsWith('SOULLAB-')) {
    return `SOULLAB-****${last4}`;
  }
  return `****${last4}`;
}

export async function logAuthEvent(
  entry: AuthAuditEntry,
  request: NextRequest
): Promise<void> {
  try {
    const { ip, userAgent } = extractRequestInfo(request);

    // Only pass UUID to resource_id column
    const resourceIdUuid = isUuid(entry.memberId) ? entry.memberId : null;

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
        metadata,
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
        $8,
        false,
        true
      )`,
      [
        entry.action,
        entry.resourceType || 'member',
        resourceIdUuid,
        ip === 'unknown' ? null : ip,
        userAgent,
        entry.result,
        entry.errorMessage || null,
        entry.metadata ? JSON.stringify(entry.metadata) : '{}',
      ]
    );
  } catch (error) {
    // Log but don't fail the auth operation
    console.error('[AUTH_AUDIT] Failed to log auth event:', error);
  }
}
