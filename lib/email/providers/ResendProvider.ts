/**
 * RESEND ADAPTER — one of the two files in the system allowed to import `resend`.
 * ============================================================================
 *
 * Resend is not the architecture; it is the current vendor. This file exists so
 * that fact is reversible: everything Resend-shaped stops here.
 *
 * The load-bearing behaviour it preserves: Resend RESOLVES rather than throws
 * when the API rejects a send (429 quota, unverified sender, bad key, bad
 * recipient). `{ data: null, error }` is a refusal. It is reported as
 * `accepted: false` with the vendor error passed up verbatim.
 */

import { Resend } from 'resend';
import type { EmailProvider, ProviderEmailMessage, ProviderSendResult } from './types';

/**
 * Resend-backed provider.
 *
 * `apiKey` is optional so the managed (environment-configured) client and a
 * practitioner's own bring-your-own key can share one adapter — the practitioner
 * router in lib/comms/emailRouter.ts needs the second form.
 */
export class ResendProvider implements EmailProvider {
  readonly name = 'resend';

  private client: InstanceType<typeof Resend> | null = null;
  private readonly explicitKey?: string;

  constructor(apiKey?: string) {
    this.explicitKey = apiKey;
  }

  private key(): string | undefined {
    return this.explicitKey ?? process.env.RESEND_API_KEY;
  }

  isConfigured(): boolean {
    return Boolean(this.key());
  }

  private getClient(): InstanceType<typeof Resend> | null {
    if (this.client) return this.client;
    const apiKey = this.key();
    if (!apiKey) return null;
    this.client = new Resend(apiKey);
    return this.client;
  }

  async send(message: ProviderEmailMessage): Promise<ProviderSendResult> {
    const client = this.getClient();
    if (!client) {
      return { accepted: false, rawError: { name: 'not_configured', message: 'RESEND_API_KEY not configured' } };
    }

    // Resend's own CreateEmailOptions is a RequireAtLeastOne<html|text|react>
    // union, and the repo carries a `declare module 'resend'` stub that erases
    // it in some configs. Build the payload structurally and cast at the call
    // site: this adapter should not be coupled to the vendor's type shape.
    const payload = {
      from: message.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      replyTo: message.replyTo,
      headers: {
        ...message.headers,
        // Resend's own duplicate-send protection (retained ~24h). Sent as a
        // header rather than an SDK option so it does not depend on the
        // installed SDK version typing it — the vendor-specific half of the
        // boundary's vendor-neutral `idempotencyKey`.
        ...(message.idempotencyKey ? { 'Idempotency-Key': message.idempotencyKey } : {}),
      },
      tags: message.tags,
    };

    const { data, error } = await client.emails.send(payload as Parameters<typeof client.emails.send>[0]);

    // A resolved refusal. Passed up UNCHANGED — the classifier above reads the
    // vendor's own error name, and flattening it here would discard the only
    // fact that distinguishes "top up the account" from "fix the payload".
    if (error) return { accepted: false, rawError: error };

    // No error AND no id: the vendor did not take responsibility for this
    // message. An unidentifiable send is not a send.
    if (!data?.id) {
      return { accepted: false, rawError: { name: 'no_message_id', message: 'Provider returned no message id' } };
    }

    return { accepted: true, providerMessageId: data.id };
  }
}
