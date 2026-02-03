/**
 * EMAIL ROUTER
 * ============
 * Routes practitioner emails through managed (Soullab) or BYO Resend
 *
 * Usage:
 *   const router = new EmailRouter(practitionerId);
 *   await router.send({ to, subject, bodyHtml, bodyText });
 *
 * Provider selection:
 *   1. Check practitioner_integrations for email config
 *   2. If 'resend' provider with valid config → use BYO key
 *   3. Otherwise → use platform RESEND_API_KEY (managed)
 */

import { Resend } from 'resend';
import {
  getEmailIntegration,
  updateIntegrationStatus,
  type ResendEmailConfig,
} from '@/lib/practitioner/integrations';

// ============================================================================
// TYPES
// ============================================================================

export interface EmailPayload {
  to: string;
  toName?: string;
  subject: string;
  bodyHtml?: string;
  bodyText: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
  provider: 'managed' | 'resend';
}

// ============================================================================
// MANAGED (PLATFORM) RESEND CLIENT
// ============================================================================

let managedResend: Resend | null = null;

function getManagedResend(): Resend | null {
  if (!managedResend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('[EmailRouter] RESEND_API_KEY not configured');
      return null;
    }
    managedResend = new Resend(apiKey);
  }
  return managedResend;
}

// ============================================================================
// EMAIL ROUTER
// ============================================================================

export class EmailRouter {
  private practitionerId: string;

  constructor(practitionerId: string) {
    this.practitionerId = practitionerId;
  }

  /**
   * Send email through practitioner's configured provider
   *
   * @param payload Email content
   * @param defaults Default sender info (used when practitioner doesn't have BYO config)
   */
  async send(
    payload: EmailPayload,
    defaults: {
      fromEmail: string;
      fromName: string;
      replyTo?: string;
    }
  ): Promise<EmailResult> {
    // Get practitioner's email integration config
    const integration = await getEmailIntegration(this.practitionerId);

    // Route based on provider
    if (
      integration.provider === 'resend' &&
      integration.config &&
      integration.config.mode === 'resend'
    ) {
      return this.sendViaBYO(payload, integration.config as ResendEmailConfig);
    }

    // Default: managed (platform Resend)
    return this.sendViaManaged(payload, defaults);
  }

  /**
   * Send via practitioner's BYO Resend key
   */
  private async sendViaBYO(
    payload: EmailPayload,
    config: ResendEmailConfig
  ): Promise<EmailResult> {
    const resend = new Resend(config.apiKey);

    // Build from address
    const from = config.fromName
      ? `${config.fromName} <${config.fromEmail}>`
      : config.fromEmail;

    try {
      const result = await resend.emails.send({
        from,
        to: payload.toName ? `${payload.toName} <${payload.to}>` : payload.to,
        subject: payload.subject,
        html: payload.bodyHtml,
        text: payload.bodyText,
        replyTo: payload.replyTo || config.replyTo,
        tags: payload.tags,
      });

      if (result.error) {
        // Update status to error
        await updateIntegrationStatus(
          this.practitionerId,
          'email',
          'error',
          result.error.message
        );
        return {
          success: false,
          error: result.error.message,
          provider: 'resend',
        };
      }

      // Update status to connected (in case it was in error state)
      await updateIntegrationStatus(this.practitionerId, 'email', 'connected');

      return {
        success: true,
        id: result.data?.id,
        provider: 'resend',
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[EmailRouter] BYO send failed:', message);

      // Update status
      await updateIntegrationStatus(
        this.practitionerId,
        'email',
        'error',
        message
      );

      return {
        success: false,
        error: message,
        provider: 'resend',
      };
    }
  }

  /**
   * Send via managed (platform) Resend
   */
  private async sendViaManaged(
    payload: EmailPayload,
    defaults: {
      fromEmail: string;
      fromName: string;
      replyTo?: string;
    }
  ): Promise<EmailResult> {
    const resend = getManagedResend();
    if (!resend) {
      return {
        success: false,
        error: 'Email service not configured',
        provider: 'managed',
      };
    }

    const from = `${defaults.fromName} <${defaults.fromEmail}>`;

    try {
      const result = await resend.emails.send({
        from,
        to: payload.toName ? `${payload.toName} <${payload.to}>` : payload.to,
        subject: payload.subject,
        html: payload.bodyHtml,
        text: payload.bodyText,
        replyTo: payload.replyTo || defaults.replyTo,
        tags: payload.tags,
      });

      if (result.error) {
        return {
          success: false,
          error: result.error.message,
          provider: 'managed',
        };
      }

      return {
        success: true,
        id: result.data?.id,
        provider: 'managed',
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[EmailRouter] Managed send failed:', message);
      return {
        success: false,
        error: message,
        provider: 'managed',
      };
    }
  }
}

// ============================================================================
// CONVENIENCE FUNCTION
// ============================================================================

/**
 * Send an email through practitioner's configured provider
 * Convenience wrapper around EmailRouter
 */
export async function sendPractitionerEmail(
  practitionerId: string,
  payload: EmailPayload,
  defaults: {
    fromEmail: string;
    fromName: string;
    replyTo?: string;
  }
): Promise<EmailResult> {
  const router = new EmailRouter(practitionerId);
  return router.send(payload, defaults);
}
