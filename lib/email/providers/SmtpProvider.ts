/**
 * SMTP PROVIDER — the transport that answers to no vendor account.
 * ================================================================
 *
 * Speaks SMTP, so it works against ANY server that does: a commodity relay
 * today, Soullab's own MTA tomorrow. Moving between them is configuration, not
 * code — which is the whole point. An email API company can suspend an account
 * and take P0 identity mail down with it; SMTP is a protocol and cannot be
 * revoked.
 *
 * This is the same adapter for both ends of MAIL-10:
 *
 *     emergency escape from a locked vendor account   (relay credentials)
 *     the sovereign endpoint                          (Soullab MTA)
 *
 * WHAT THIS FILE DOES NOT DO
 * ==========================
 * Nothing above the provider boundary. No classification, no retries, no
 * metering, no policy about what a member is told — those live in
 * lib/email/sendEmail.ts so that swapping transports cannot silently change
 * what a failure MEANS. See ./types.ts.
 *
 * THE ACCEPTANCE RULE, IN SMTP TERMS
 * ==================================
 * `accepted: true` means the server took responsibility AND issued an id.
 * SMTP makes this sharper than an HTTP API does: a server can accept a message
 * for some recipients and reject others in the same transaction. nodemailer
 * reports that as `accepted[]` / `rejected[]`.
 *
 * A partial acceptance is NOT an acceptance. Reporting one as a send would tell
 * a member their sign-in code is on its way when the server refused their
 * address — precisely the 2026-08-24 defect, one layer down.
 */

import type { EmailProvider, ProviderEmailMessage, ProviderSendResult } from './types';

type Transporter = {
  sendMail(opts: Record<string, unknown>): Promise<{
    messageId?: string;
    accepted?: Array<string | { address: string }>;
    rejected?: Array<string | { address: string }>;
    response?: string;
  }>;
};

function readConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD ?? process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT ?? 587);

  // Explicit opt-out only. Defaulting to plaintext because a variable is unset
  // would send credentials and member mail in the clear.
  const secure =
    process.env.SMTP_SECURE === 'true' ? true :
    process.env.SMTP_SECURE === 'false' ? false :
    port === 465;

  return { host, user, pass, port: Number.isFinite(port) ? port : 587, secure };
}

export class SmtpProvider implements EmailProvider {
  readonly name = 'smtp';
  private transporter: Transporter | null = null;

  isConfigured(): boolean {
    const { host, user, pass } = readConfig();
    // A host alone is not enough: an unauthenticated relay that happens to
    // accept mail is not a transport we should be reporting as configured.
    return Boolean(host && user && pass);
  }

  private getTransporter(): Transporter {
    if (this.transporter) return this.transporter;

    const { host, user, pass, port, secure } = readConfig();
    if (!host || !user || !pass) {
      throw new Error('[MAIA/email] SmtpProvider is not configured (SMTP_HOST, SMTP_USER, SMTP_PASSWORD)');
    }

    // Required lazily so importing this module never pulls the SMTP client into
    // a bundle that will not use it.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodemailer = require('nodemailer');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      // STARTTLS is mandatory on the submission port. A relay that cannot
      // upgrade is refused rather than silently downgraded to plaintext.
      requireTLS: !secure,
      tls: { minVersion: 'TLSv1.2' },
      pool: true,
      maxConnections: 3,
      connectionTimeout: 15_000,
      greetingTimeout: 10_000,
      socketTimeout: 30_000,
    }) as Transporter;

    return this.transporter;
  }

  async send(message: ProviderEmailMessage): Promise<ProviderSendResult> {
    const recipients = Array.isArray(message.to) ? message.to : [message.to];

    let info;
    try {
      info = await this.getTransporter().sendMail({
        from: message.from,
        to: recipients,
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo: message.replyTo,
        headers: {
          ...(message.headers ?? {}),
          // Tags have no SMTP equivalent, so they travel as headers — keeping
          // purpose/lane/correlation segmentable the way vendor tags were.
          ...Object.fromEntries(
            (message.tags ?? []).map((t) => [`X-Soullab-${t.name}`, t.value])
          ),
        },
      });
    } catch (rawError) {
      // Connection, TLS, auth and timeout faults arrive here. The boundary
      // contract permits throwing on transport faults, but returning the error
      // lets the shared classifier read it — a thrown auth failure and a
      // returned one should not be classified differently.
      return { accepted: false, rawError };
    }

    const addr = (r: string | { address: string }) => (typeof r === 'string' ? r : r.address);
    const rejected = (info.rejected ?? []).map(addr);
    const accepted = (info.accepted ?? []).map(addr);

    if (rejected.length > 0) {
      return {
        accepted: false,
        rawError: {
          name: 'smtp_rejected_recipients',
          message: `server rejected ${rejected.length} recipient(s)`,
          rejected,
          response: info.response,
        },
      };
    }

    if (!info.messageId || accepted.length === 0) {
      // No id, or nobody accepted: an unidentifiable send is not a send.
      return {
        accepted: false,
        rawError: {
          name: 'smtp_no_message_id',
          message: 'server returned no message id or accepted no recipient',
          response: info.response,
        },
      };
    }

    return { accepted: true, providerMessageId: info.messageId };
  }
}
