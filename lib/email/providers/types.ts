/**
 * PROVIDER BOUNDARY — the contract every email vendor is reduced to.
 * ==================================================================
 *
 * Application code never imports a vendor SDK. It calls `sendEmail`, which
 * calls one of these. A provider's job is narrow on purpose:
 *
 *     take a normalised message → hand it to the vendor → report, honestly,
 *     what the vendor said
 *
 * A provider does NOT classify failures, log, retry, meter, or decide what a
 * member is told. Those are Soullab's policy and live above this boundary in
 * lib/email/sendEmail.ts — so that swapping a vendor cannot silently change
 * what a failure means.
 *
 * The single rule a provider must never break:
 *
 *     accepted: true  MEANS the vendor took responsibility for the message
 *                     AND issued an id for it.
 *
 * Anything ambiguous — no id, an empty response, a shape we do not recognise —
 * is `accepted: false`. An unidentifiable send is not a send.
 */

/** A message after Soullab policy, before vendor serialisation. */
export interface ProviderEmailMessage {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  headers?: Record<string, string>;
  /** Vendor-neutral key/value labels. Providers map these to their own tagging. */
  tags?: Array<{ name: string; value: string }>;
}

/**
 * What a provider reports back.
 *
 * `rawError` is passed up UNCHANGED so the shared classifier
 * (classifyProviderError) can read the vendor's own error name — the fact that
 * identified the 2026-08-24 boundary was the literal string
 * `monthly_quota_exceeded`, and flattening it here would discard it again.
 */
export type ProviderSendResult =
  | { accepted: true; providerMessageId: string }
  | { accepted: false; rawError: unknown };

export interface EmailProvider {
  /** Stable identifier recorded on every send: 'resend' | 'ses' | 'postmark' | 'memory'. */
  readonly name: string;

  /**
   * True when this provider has the configuration it needs to send at all.
   * Checked before a send so "no API key" is reported as a configuration
   * failure rather than surfacing as a vendor exception.
   */
  isConfigured(): boolean;

  /** Never throws for vendor-level refusals; MAY throw on transport faults. */
  send(message: ProviderEmailMessage): Promise<ProviderSendResult>;
}
