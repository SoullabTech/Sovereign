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

import { ResendProvider } from '@/lib/email/providers';
import { classifyProviderError } from '@/lib/email/sendEmail';
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
// MANAGED (PLATFORM) PROVIDER
// ============================================================================

/**
 * The platform's own provider instance. Practitioner bring-your-own keys get
 * their own instance of the SAME adapter (see sendViaBYO) — a practitioner's
 * credential must never be able to change WHICH vendor code path runs, only
 * which account it bills to.
 */
let managedProvider: ResendProvider | null = null;

function getManagedProvider(): ResendProvider | null {
  if (!managedProvider) managedProvider = new ResendProvider();
  if (!managedProvider.isConfigured()) {
    console.warn('[EmailRouter] managed email provider is not configured');
    return null;
  }
  return managedProvider;
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
    const provider = new ResendProvider(config.apiKey);

    // Build from address
    const from = config.fromName
      ? `${config.fromName} <${config.fromEmail}>`
      : config.fromEmail;

    try {
      const result = await provider.send({
        from,
        to: payload.toName ? `${payload.toName} <${payload.to}>` : payload.to,
        subject: payload.subject,
        html: payload.bodyHtml,
        text: payload.bodyText,
        replyTo: payload.replyTo || config.replyTo,
        tags: payload.tags,
      });

      if (!result.accepted) {
        const { message } = classifyProviderError(result.rawError);
        // Update status to error
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

      // Update status to connected (in case it was in error state)
      await updateIntegrationStatus(this.practitionerId, 'email', 'connected');

      return {
        success: true,
        id: result.providerMessageId,
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
    const provider = getManagedProvider();
    if (!provider) {
      return {
        success: false,
        error: 'Email service not configured',
        provider: 'managed',
      };
    }

    const from = `${defaults.fromName} <${defaults.fromEmail}>`;

    try {
      const result = await provider.send({
        from,
        to: payload.toName ? `${payload.toName} <${payload.to}>` : payload.to,
        subject: payload.subject,
        html: payload.bodyHtml,
        text: payload.bodyText,
        replyTo: payload.replyTo || defaults.replyTo,
        tags: payload.tags,
      });

      if (!result.accepted) {
        const { message } = classifyProviderError(result.rawError);
        return {
          success: false,
          error: message,
          provider: 'managed',
        };
      }

      return {
        success: true,
        id: result.providerMessageId,
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
