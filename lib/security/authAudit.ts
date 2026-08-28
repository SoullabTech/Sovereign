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
  | 'passcode_valid'
  | 'passcode_invalid'
  | 'register_success'
  | 'register_failed'
  | 'signout'
  | 'webauthn_authenticate'
  | 'webauthn_register'
  // Revocation was recorded as 'webauthn_register' with a metadata step. While
  // the insert always failed that was a latent mislabel; once the table exists
  // it becomes a durable record of a registration that never happened.
  | 'webauthn_revoke'
  | 'webauthn_step_up'
  | 'session_revoked';

export interface AuthAuditEntry {
  action: AuthAction;
  memberId?: string | null;      // UUID - stored in resource_id (the object acted upon)
  resourceType?: string;
  result: 'success' | 'failure';
  errorMessage?: string;
  metadata?: Record<string, unknown>;  // Structured context (hashes, hints, reasons)

  /**
   * The ACTOR, when the caller has actually established who they are — a
   * verified session, a completed ceremony. Stored in `user_id`.
   *
   * Distinct from `memberId`, which names the object acted upon. On a sign-in
   * attempt those differ: nobody is established yet, so `actorId` is absent
   * while `memberId` may name the account being attempted. Do NOT pass
   * `memberId` here to fill the column — a synthesized attribution is worse
   * than an absent one.
   */
  actorId?: string | null;

  /**
   * Tri-state, and deliberately not defaulted:
   *   true      a defined consent check occurred and passed
   *   false     a defined consent check occurred and failed
   *   undefined this path did not establish consent status → stored NULL
   *
   * Every insert previously hardcoded `true`, so every row asserted a check
   * nothing had performed. Unknown must never become true, and must not become
   * false either.
   */
  consentVerified?: boolean;
}

export interface AuthAuditResult {
  /**
   * Whether the row reached the database. `false` is a real answer, not an
   * error: the auth operation continues either way. What must never happen is
   * a failed write being indistinguishable from a successful one.
   */
  persisted: boolean;
}

/** Stable, greppable marker. Do not reword — dashboards and log queries key on it. */
export const AUDIT_PERSIST_FAILED_MARKER = '[AUTH_AUDIT] persist_failed';

/**
 * Process-local count of audit writes that did not persist, since boot.
 *
 * Deliberately in-process rather than a database row: the failure this counts
 * is most often the database being unreachable, and an observability channel
 * that shares the failure mode of the thing it observes reports nothing exactly
 * when it matters. Cheap, non-recursive, and survives the case it exists for.
 */
let auditPersistFailures = 0;
export function getAuditPersistFailureCount(): number {
  return auditPersistFailures;
}
export function __resetAuditPersistFailureCount(): void {
  auditPersistFailures = 0;
}

/**
 * Reduce a thrown value to a coarse category safe to log.
 *
 * Raw database errors carry SQL text, parameter values and constraint details.
 * None of that may reach a log line that exists to describe a failure to record
 * an authentication event.
 */
function failureCategory(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;
  if (typeof code === 'string' && /^[0-9A-Z]{5}$/.test(code)) {
    if (code === '42P01') return 'undefined_table';
    if (code === '42703') return 'undefined_column';
    if (code === '23505') return 'unique_violation';
    if (code.startsWith('08')) return 'connection_error';
    if (code.startsWith('53')) return 'insufficient_resources';
    return `sqlstate_${code}`;
  }
  return 'unknown';
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
): Promise<AuthAuditResult> {
  try {
    const { ip, userAgent } = extractRequestInfo(request);

    // Only pass UUID to resource_id column
    const resourceIdUuid = isUuid(entry.memberId) ? entry.memberId : null;
    // The actor is populated only where the caller established it. Never
    // backfilled from resourceIdUuid — see AuthAuditEntry.actorId.
    const actorIdUuid = isUuid(entry.actorId) ? entry.actorId : null;

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
        $9,
        $1,
        $2,
        $3,
        $4::inet,
        $5,
        $6,
        $7,
        $8,
        false,
        $10
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
        actorIdUuid,
        // undefined → NULL. Unknown consent status stays unknown.
        entry.consentVerified === undefined ? null : entry.consentVerified,
      ]
    );
    return { persisted: true };
  } catch (error) {
    // The audit write failed. The AUTH OPERATION MUST STILL SUCCEED — audit
    // durability and authentication availability have different failure
    // semantics, and turning one into the other to make it visible would trade
    // a silent gap for an outage. What changes here is that the failure is no
    // longer silent: it is counted, it emits a stable marker, and the caller
    // receives `persisted: false` instead of a resolved promise that looks
    // exactly like success.
    auditPersistFailures += 1;
    console.error(
      `${AUDIT_PERSIST_FAILED_MARKER} action=${entry.action} resource_type=${entry.resourceType || 'member'} category=${failureCategory(error)} failures_since_boot=${auditPersistFailures}`
    );
    return { persisted: false };
  }
}
