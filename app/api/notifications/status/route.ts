export const dynamic = 'force-dynamic';

/**
 * MESSAGING PROVIDER STATUS
 *
 * Reports whether each outbound provider is usable by the caller — WITHOUT
 * sending anything.
 *
 * WHY THIS EXISTS: the settings page previously inferred configuration by
 * POSTing a real message (`{ to: 'test', message: 'test' }`) on page load and
 * inspecting the error string. That was wrong three ways:
 *
 *   1. It attempted a real send — and under the session-derived delivery
 *      authority, every settings page load wrote an audit entry.
 *   2. It string-matched `'not configured'`, so an authorization refusal
 *      ("Authentication required") did NOT match, and the UI concluded the
 *      provider WAS configured. An authorization refusal was rendered as a
 *      configuration fact.
 *   3. Configuration and authorization are different questions. A caller who
 *      may not use a provider learns nothing true about whether it is set up.
 *
 * The contract is the `state` field. Status codes and structured values are the
 * discriminator; error strings are never parsed by the client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { resolveSendAuthority } from '@/lib/notifications/sendAuthority';

/** The only four things a provider can be, from the caller's point of view. */
export type ProviderState =
  | 'unauthorized'    // caller may not use this provider — says nothing about setup
  | 'not_configured'  // no usable credentials exist
  | 'connected'       // usable credentials exist
  | 'disconnected';   // credentials exist but are unusable/incomplete

type Provider = 'sms' | 'telegram' | 'whatsapp';

const ENV_CREDENTIALS: Record<Provider, () => boolean> = {
  sms: () =>
    Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN &&
      (process.env.TWILIO_FROM_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID)),
  telegram: () => Boolean(process.env.TELEGRAM_BOT_TOKEN),
  whatsapp: () =>
    Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_WHATSAPP_FROM),
};

/** Does this practitioner have their own connected integration for `type`? */
async function practitionerConnected(practitionerId: string, type: Provider): Promise<boolean> {
  try {
    const result = await query<{ config_encrypted: unknown }>(
      `SELECT config_encrypted
         FROM practitioner_integrations
        WHERE practitioner_id = $1
          AND integration_type = $2
          AND status = 'connected'`,
      [practitionerId, type],
    );
    return result.rows.length > 0 && Boolean(result.rows[0].config_encrypted);
  } catch {
    // A lookup failure is not evidence of absence — report it as unusable
    // rather than asserting "not configured", which would be a claim we
    // cannot support.
    return false;
  }
}

export async function GET(request: NextRequest) {
  // Authorization first. If the caller may not use these providers, we report
  // exactly that and disclose nothing about whether they are set up.
  const auth = await resolveSendAuthority(request);
  if (!auth.ok) {
    return NextResponse.json(
      {
        providers: {
          sms: { state: 'unauthorized' as ProviderState },
          telegram: { state: 'unauthorized' as ProviderState },
          whatsapp: { state: 'unauthorized' as ProviderState },
        },
      },
      { status: auth.status },
    );
  }

  const providers: Record<Provider, { state: ProviderState }> = {
    sms: { state: 'not_configured' },
    telegram: { state: 'not_configured' },
    whatsapp: { state: 'not_configured' },
  };

  for (const p of ['sms', 'telegram', 'whatsapp'] as Provider[]) {
    const own = await practitionerConnected(auth.practitionerId, p);
    providers[p] = { state: own || ENV_CREDENTIALS[p]() ? 'connected' : 'not_configured' };
  }

  return NextResponse.json({ providers });
}
