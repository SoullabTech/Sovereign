/**
 * MAIL-R1 / Soul Portrait P2 SMTP reservation.
 * Separate from P0 email-code reservation. No bypass, process-local quota or
 * raw recipient persistence. Counts attempts, even if SMTP outcome is unknown.
 * Requires an existing portrait owned by the authenticated caller, current
 * recorded consent, and a fresh recipient-specific sharing attestation.
 */
import { transaction } from '@/lib/db/postgres';
import { fingerprintRecipient } from '@/lib/email/ledger/fingerprint';
import { MANAGED_AUTH_MAILBOX, senderMatchesMailbox } from '@/lib/email/senderCapacity';

export const PORTRAIT_MAIL_PURPOSE = 'soul-portrait:delivery' as const;
export const PORTRAIT_MAIL_BUDGET = {
  perMinute: 3,
  perDay: 30,
  perActorDay: 10,
  perRecipientDay: 5,
} as const;

export interface PortraitDeliveryProof {
  portraitId: string;
  ownerMemberId: string;
  recipientConsentAttested: boolean;
  subjectShareAttested: boolean;
  consentSource: 'verbal' | 'written';
}
export type PortraitReservation =
  | { admitted: true }
  | { admitted: false; kind: 'provider_config' | 'rate_limited' | 'provider_error'; code: string; detail: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const deny = (kind: 'provider_config' | 'rate_limited' | 'provider_error', code: string): PortraitReservation =>
  ({ admitted: false, kind, code, detail: 'Soul Portrait email could not be authorized for delivery.' });

export async function reserveManagedPortraitSend(input: {
  purpose: string;
  from: string;
  to: string | string[];
  proof?: PortraitDeliveryProof;
}): Promise<PortraitReservation> {
  const { proof } = input;
  if (process.env.SOUL_PORTRAIT_SMTP_ENABLED !== 'true') {
    return deny('provider_config', 'portrait_delivery_disabled');
  }
  const recipients = Array.isArray(input.to) ? input.to : [input.to];
  const address = recipients[0]?.trim().toLowerCase() ?? '';
  if (input.purpose !== PORTRAIT_MAIL_PURPOSE ||
      !senderMatchesMailbox(input.from, MANAGED_AUTH_MAILBOX) ||
      recipients.length !== 1 ||
      !/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(address) ||
      address !== recipients[0] ||
      !proof ||
      !UUID.test(proof.portraitId) || !UUID.test(proof.ownerMemberId) ||
      proof.recipientConsentAttested !== true || proof.subjectShareAttested !== true ||
      (proof.consentSource !== 'verbal' && proof.consentSource !== 'written')
  ) return deny('provider_config', 'portrait_scope_refused');

  const fingerprint = fingerprintRecipient(address);
  if (!fingerprint) return deny('provider_config', 'portrait_fingerprint_unavailable');

  try {
    return await transaction<PortraitReservation>(async (client) => {
      // Separate P2 namespace: never spend an auth-code P0 slot.
      await client.query('SELECT pg_advisory_xact_lock(1179796564, 2)');
      const owned = await client.query<{ id: string }>(
        `SELECT id FROM soul_portraits
           WHERE id = $1 AND owner_member_id = $2 AND subject_is_minor = FALSE
             AND consent_state = 'active'
           FOR UPDATE`,
        [proof.portraitId, proof.ownerMemberId],
      );
      if (owned.rows.length !== 1) return deny('provider_error', 'portrait_not_sendable');

      // A denormalized active flag alone is insufficient: consult the latest
      // governing subject-consent event for this agreement version as well.
      const governing = await client.query<{ action: string }>(
        `SELECT action FROM soul_portrait_consents
          WHERE portrait_id = $1 AND actor_type = 'subject'
            AND agreement_version = 'path-b-v1'
            AND action IN ('set', 'accept', 'refuse', 'revoke')
          ORDER BY created_at DESC, id DESC LIMIT 1`,
        [proof.portraitId],
      );
      if (!['set', 'accept'].includes(governing.rows[0]?.action ?? '')) {
        return deny('provider_error', 'portrait_consent_not_live');
      }

      const counts = await client.query<{
        minute: string; day: string; actor_day: string; recipient_day: string
      }>(
        `SELECT
          COUNT(*) FILTER (WHERE recorded_at > clock_timestamp() - INTERVAL '1 minute')::text AS minute,
          COUNT(*)::text AS day,
          COUNT(*) FILTER (WHERE actor_member_id = $1)::text AS actor_day,
          COUNT(*) FILTER (WHERE recipient_fingerprint = $2)::text AS recipient_day
         FROM soul_portrait_delivery_attestations
         WHERE recorded_at > clock_timestamp() - INTERVAL '24 hours'`,
        [proof.ownerMemberId, fingerprint.fingerprint],
      );
      const n = counts.rows[0];
      if (!n || [n.minute, n.day, n.actor_day, n.recipient_day]
        .some(v => !Number.isSafeInteger(Number(v)) || Number(v) < 0)) {
        throw new Error('Portrait sender budget unknown');
      }
      if (Number(n.minute) >= PORTRAIT_MAIL_BUDGET.perMinute ||
          Number(n.day) >= PORTRAIT_MAIL_BUDGET.perDay ||
          Number(n.actor_day) >= PORTRAIT_MAIL_BUDGET.perActorDay ||
          Number(n.recipient_day) >= PORTRAIT_MAIL_BUDGET.perRecipientDay) {
        return deny('rate_limited', 'portrait_capacity_exhausted');
      }
      const reservation = await client.query<{ id: string }>(
        `INSERT INTO soul_portrait_delivery_attestations
          (portrait_id, actor_member_id, recipient_fingerprint, recipient_key_version,
           consent_source, recipient_consent_attested, subject_share_attested)
         VALUES ($1, $2, $3, $4, $5, TRUE, TRUE) RETURNING id`,
        [proof.portraitId, proof.ownerMemberId, fingerprint.fingerprint,
         fingerprint.keyVersion, proof.consentSource],
      );
      if (reservation.rows.length !== 1) throw new Error('Portrait reservation was not stored');
      return { admitted: true };
    });
  } catch {
    return deny('provider_config', 'portrait_capacity_unavailable');
  }
}
