/** AUTH-RETURN-01 — the narrow, durable managed SMTP send boundary. */

import { transaction } from '@/lib/db/postgres';

export const MANAGED_AUTH_MAILBOX = 'noreply@soullab.life' as const;
export const MANAGED_AUTH_PURPOSE = 'auth:email-code' as const;

// Local conservative budgets, not a claim about the provider's account quota.
// A reservation counts even when SMTP refuses or its response is lost. These
// limits are shared by all processes because admission is serialized in PG.
export const MANAGED_AUTH_CAPACITY = { perMinute: 30, perDay: 500 } as const;

export function extractMailbox(value: string): string | null {
  if (typeof value !== 'string' || /[\r\n]/.test(value)) return null;
  const trimmed = value.trim();
  const wrapped = trimmed.match(/^[^<>]*<([^<>]+)>$/);
  const mailbox = wrapped ? wrapped[1] : trimmed;
  return /^[^<>\s@;,]+@[^<>\s@;,]+$/.test(mailbox) ? mailbox.toLowerCase() : null;
}

export function senderMatchesMailbox(from: string, mailbox: string): boolean {
  const extracted = extractMailbox(from);
  return extracted !== null && extracted === mailbox.trim().toLowerCase();
}

export interface ManagedAuthSendRequest {
  purpose: string;
  from: string;
  to: string | string[];
  correlationId?: string;
  idempotencyKey?: string;
}

export type ManagedAuthSendAdmission =
  | { admitted: true }
  | {
      admitted: false;
      kind: 'provider_config' | 'rate_limited' | 'provider_error';
      code: string;
      detail: string;
    };

/**
 * Reserve capacity before contacting managed SMTP. This is separate from the
 * best-effort delivery ledger: a missing table/connection cannot allow a send.
 * The caller's challenge must still be pending, unexpired and for this exact
 * recipient. Its single durable reservation prevents duplicate provider calls.
 */
export async function reserveManagedAuthSend(
  request: ManagedAuthSendRequest,
): Promise<ManagedAuthSendAdmission> {
  const recipients = Array.isArray(request.to) ? request.to : [request.to];
  const challengeId = request.correlationId;
  if (
    request.purpose !== MANAGED_AUTH_PURPOSE ||
    !senderMatchesMailbox(request.from, MANAGED_AUTH_MAILBOX) ||
    recipients.length !== 1 ||
    !extractMailbox(recipients[0]) ||
    recipients[0].trim().toLowerCase() !== extractMailbox(recipients[0]) ||
    !challengeId ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(challengeId) ||
    request.idempotencyKey !== `AUTH_CODE:${challengeId}`
  ) {
    return {
      admitted: false, kind: 'provider_config', code: 'smtp_scope_refused',
      detail: 'Managed SMTP is restricted to one pending email-code challenge and the approved sender.',
    };
  }

  try {
    return await transaction<ManagedAuthSendAdmission>(async (client) => {
      // A fixed, distinct two-int namespace serializes only this sender budget.
      await client.query('SELECT pg_advisory_xact_lock(1179796564, 1)');
      const pending = await client.query<{ id: string }>(
        `SELECT id FROM auth_email_challenges
          WHERE id = $1 AND email = $2 AND purpose = 'authenticate'
            AND status = 'pending' AND smtp_reserved_at IS NULL
            AND expires_at > clock_timestamp()
          FOR UPDATE`,
        [challengeId, recipients[0].trim().toLowerCase()],
      );
      if (pending.rows.length !== 1) {
        return {
          admitted: false, kind: 'provider_error', code: 'smtp_challenge_not_sendable',
          detail: 'The email-code challenge is not eligible for a new SMTP attempt.',
        };
      }

      const usage = await client.query<{ minute_count: string; day_count: string }>(
        `SELECT
           COUNT(*) FILTER (WHERE smtp_reserved_at > clock_timestamp() - INTERVAL '1 minute')::text AS minute_count,
           COUNT(*)::text AS day_count
         FROM auth_email_challenges
         WHERE smtp_reserved_at > clock_timestamp() - INTERVAL '24 hours'`,
      );
      const minuteCount = Number(usage.rows[0]?.minute_count);
      const dayCount = Number(usage.rows[0]?.day_count);
      if (!Number.isSafeInteger(minuteCount) || minuteCount < 0 ||
          !Number.isSafeInteger(dayCount) || dayCount < 0) {
        throw new Error('Managed SMTP capacity could not be determined');
      }
      if (minuteCount >= MANAGED_AUTH_CAPACITY.perMinute || dayCount >= MANAGED_AUTH_CAPACITY.perDay) {
        return {
          admitted: false, kind: 'rate_limited', code: 'smtp_sender_capacity',
          detail: 'The managed authentication sender has reached its bounded send capacity.',
        };
      }

      const reserved = await client.query<{ id: string }>(
        `UPDATE auth_email_challenges SET smtp_reserved_at = clock_timestamp()
          WHERE id = $1 AND smtp_reserved_at IS NULL RETURNING id`,
        [challengeId],
      );
      if (reserved.rows.length !== 1) throw new Error('Managed SMTP reservation failed');
      return { admitted: true };
    });
  } catch {
    return {
      admitted: false, kind: 'provider_config', code: 'smtp_capacity_unavailable',
      detail: 'Managed SMTP capacity could not be reserved. No provider call was made.',
    };
  }
}
