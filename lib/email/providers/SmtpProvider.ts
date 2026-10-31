/**
 * SMTP PROVIDER — the managed identity transport.
 *
 * SMTP is the only registered production transport for AUTH-RETURN-01. The
 * adapter distinguishes explicit refusal from unknown delivery. STARTTLS is
 * mandatory on submission ports; unknown acceptance must never trigger a retry.
 */

import type { EmailProvider, ProviderEmailMessage, ProviderSendResult } from './types';
import { resolveManagedSmtpConfig } from '../protonTransport';
import { MANAGED_AUTH_MAILBOX, MANAGED_AUTH_PURPOSE, senderMatchesMailbox } from '../senderCapacity';

type Transporter = {
  sendMail(opts: Record<string, unknown>): Promise<{
    messageId?: string;
    accepted?: Array<string | { address: string }>;
    rejected?: Array<string | { address: string }>;
    response?: string;
  }>;
};

export interface SmtpProviderConfig {
  host?: string;
  user?: string;
  password?: string;
  port?: number;
  secure?: boolean;
  managedMailbox?: string;
}

interface ResolvedConfig {
  host: string;
  user: string;
  pass: string;
  port: number;
  secure: boolean;
  managedMailbox: string;
}

function readConfig(config?: SmtpProviderConfig): ResolvedConfig | null {
  if (config !== undefined) {
    const host = config.host?.trim();
    const user = config.user?.trim().toLowerCase();
    const pass = config.password;
    const port = config.port ?? 587;
    const managedMailbox = (config.managedMailbox ?? MANAGED_AUTH_MAILBOX).trim().toLowerCase();
    if (!host || !user || !pass) return null;
    if (user !== MANAGED_AUTH_MAILBOX || managedMailbox !== MANAGED_AUTH_MAILBOX) {
      throw new Error('SMTP authenticated user must equal the managed sender mailbox');
    }
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('SMTP_PORT is invalid');
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Explicit SMTP credentials are only available to isolated non-production fixtures');
    }
    return { host, user, pass, port, secure: config.secure ?? port === 465, managedMailbox };
  }

  const managed = resolveManagedSmtpConfig();
  if (!managed) return null;
  return {
    host: managed.host,
    user: managed.user,
    pass: managed.password,
    port: managed.port,
    secure: managed.secure,
    managedMailbox: managed.managedMailbox,
  };
}

export class SmtpProvider implements EmailProvider {
  readonly name = 'smtp';
  private transporter: Transporter | null = null;

  constructor(private readonly config?: SmtpProviderConfig) {}

  isConfigured(): boolean {
    try {
      return readConfig(this.config) !== null;
    } catch {
      return false;
    }
  }

  private resolved(): ResolvedConfig {
    const config = readConfig(this.config);
    if (!config) {
      throw new Error('[MAIA/email] SMTP is not configured');
    }
    return config;
  }

  private getTransporter(config: ResolvedConfig): Transporter {
    if (this.transporter) return this.transporter;

    // Required lazily so importing this module never pulls the SMTP client into
    // a bundle that will not use it.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodemailer = require('nodemailer');
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
      requireTLS: !config.secure,
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
    let config: ResolvedConfig;
    try {
      config = this.resolved();
    } catch (rawError) {
      return { accepted: false, rawError };
    }

    if (message.purpose !== MANAGED_AUTH_PURPOSE ||
        !senderMatchesMailbox(message.from, config.managedMailbox)) {
      return {
        accepted: false,
        rawError: {
          name: 'smtp_sender_or_purpose_mismatch',
          message: `managed SMTP mail must use ${config.managedMailbox} for ${MANAGED_AUTH_PURPOSE}`,
        },
      };
    }

    const recipients = Array.isArray(message.to) ? message.to : [message.to];
    if (recipients.length !== 1) {
      return { accepted: false, rawError: { name: 'smtp_recipient_count', message: 'Managed SMTP requires one recipient' } };
    }
    let info;
    try {
      info = await this.getTransporter(config).sendMail({
        from: message.from,
        to: recipients,
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo: message.replyTo,
        headers: {
          ...(message.headers ?? {}),
          ...Object.fromEntries(
            (message.tags ?? []).map((tag) => [`X-Soullab-${tag.name}`, tag.value]),
          ),
        },
      });
    } catch (rawError) {
      const error = rawError as { code?: unknown; responseCode?: unknown } | null;
      const responseCode = typeof error?.responseCode === 'number' ? error.responseCode : undefined;
      // An explicit negative SMTP response is a refusal. A lost connection or
      // response gives no such evidence: the server may already have accepted.
      if (error?.code === 'EAUTH' || (responseCode !== undefined && responseCode >= 400 && responseCode < 600)) {
        return { accepted: false, rawError };
      }
      throw rawError;
    }

    const address = (recipient: string | { address: string }) =>
      typeof recipient === 'string' ? recipient : recipient.address;
    const rejected = (info.rejected ?? []).map(address);
    const accepted = (info.accepted ?? []).map(address);

    if (rejected.length > 0 && accepted.length === 0) {
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
    if (!info.messageId || rejected.length > 0 || accepted.length !== 1 ||
        accepted[0].trim().toLowerCase() !== recipients[0].trim().toLowerCase()) {
      throw Object.assign(new Error('SMTP acceptance could not be verified for the exact recipient'), {
        name: 'smtp_acceptance_unknown',
      });
    }

    return { accepted: true, providerMessageId: info.messageId };
  }
}
