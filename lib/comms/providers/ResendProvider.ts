/**
 * RESEND PROVIDER
 *
 * Email delivery via Resend (https://resend.com)
 * Sovereign-hosted, privacy-first email delivery
 */

import type {
  CommsProvider,
  DeliveryPayload,
  DeliveryResult,
  DeliveryStatusUpdate,
  ProviderType,
  DeliveryChannel,
} from './types';

interface ResendCredentials {
  api_key: string;
  from_domain?: string;
}

interface ResendSendResponse {
  id: string;
  from: string;
  to: string[];
  created_at: string;
}

interface ResendErrorResponse {
  statusCode: number;
  message: string;
  name: string;
}

interface ResendWebhookEvent {
  type: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    // Bounce/complaint details
    bounce?: {
      message: string;
      type: string;
    };
    complaint?: {
      message: string;
    };
  };
  created_at: string;
}

export class ResendProvider implements CommsProvider {
  readonly provider: ProviderType = 'resend';
  readonly channel: DeliveryChannel = 'email';

  private readonly apiUrl = 'https://api.resend.com';

  /**
   * Verify API key is valid by making a test request
   */
  async verifyCredentials(credentials: Record<string, string>): Promise<boolean> {
    const { api_key } = credentials as ResendCredentials;

    if (!api_key) {
      return false;
    }

    try {
      // Use domains list as a lightweight verification
      const response = await fetch(`${this.apiUrl}/domains`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${api_key}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Send an email via Resend
   */
  async send(
    payload: DeliveryPayload,
    credentials: Record<string, string>
  ): Promise<DeliveryResult> {
    const { api_key, from_domain } = credentials as ResendCredentials;

    if (!api_key) {
      return {
        success: false,
        status: 'failed',
        errorCode: 'MISSING_API_KEY',
        errorMessage: 'Resend API key is required',
      };
    }

    // Build from address
    const from = payload.from
      ? payload.fromName
        ? `${payload.fromName} <${payload.from}>`
        : payload.from
      : from_domain
        ? `noreply@${from_domain}`
        : null;

    if (!from) {
      return {
        success: false,
        status: 'failed',
        errorCode: 'MISSING_FROM',
        errorMessage: 'From address or domain is required',
      };
    }

    try {
      const body: Record<string, unknown> = {
        from,
        to: [payload.to],
        subject: payload.subject || 'Message from your practitioner',
        text: payload.bodyText,
      };

      if (payload.bodyHtml) {
        body.html = payload.bodyHtml;
      }

      if (payload.replyTo) {
        body.reply_to = payload.replyTo;
      }

      // Add tracking tags
      if (payload.tags) {
        body.tags = Object.entries(payload.tags).map(([name, value]) => ({
          name,
          value,
        }));
      }

      const response = await fetch(`${this.apiUrl}/emails`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        const error = result as ResendErrorResponse;
        return {
          success: false,
          status: 'failed',
          errorCode: error.name || 'RESEND_ERROR',
          errorMessage: error.message || 'Failed to send email',
          rawResponse: result,
        };
      }

      const sent = result as ResendSendResponse;
      return {
        success: true,
        status: 'sent',
        externalId: sent.id,
        rawResponse: result,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        status: 'failed',
        errorCode: 'NETWORK_ERROR',
        errorMessage: message,
      };
    }
  }

  /**
   * Parse Resend webhook event into standard format
   */
  parseWebhook(payload: unknown): DeliveryStatusUpdate | null {
    try {
      const event = payload as ResendWebhookEvent;

      if (!event?.type || !event?.data?.email_id) {
        return null;
      }

      let status: DeliveryStatusUpdate['status'];
      let errorCode: string | undefined;
      let errorMessage: string | undefined;

      switch (event.type) {
        case 'email.delivered':
          status = 'delivered';
          break;
        case 'email.bounced':
          status = 'bounced';
          errorCode = event.data.bounce?.type || 'BOUNCE';
          errorMessage = event.data.bounce?.message;
          break;
        case 'email.complained':
          status = 'complained';
          errorMessage = event.data.complaint?.message;
          break;
        case 'email.delivery_delayed':
          // Not a final status, skip
          return null;
        default:
          return null;
      }

      return {
        externalId: event.data.email_id,
        status,
        timestamp: new Date(event.created_at),
        errorCode,
        errorMessage,
        rawEvent: event,
      };
    } catch {
      return null;
    }
  }

  /**
   * Verify Resend webhook signature
   *
   * Resend uses svix for webhooks, signature is in svix-signature header
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // Resend uses Svix for webhooks
    // For now, implement basic verification
    // In production, use @svix/webhook package
    try {
      // Basic check - signature header format: "v1,timestamp,signature"
      if (!signature.startsWith('v1,')) {
        return false;
      }

      // If webhook secret is configured, verify
      // This is a simplified check - full implementation would use HMAC
      if (!secret) {
        // No secret configured = accept all (dev mode)
        console.warn('[ResendProvider] No webhook secret configured');
        return true;
      }

      // TODO: Implement proper HMAC verification with @svix/webhook
      // For now, just check signature format
      const parts = signature.split(',');
      return parts.length === 3;
    } catch {
      return false;
    }
  }
}
