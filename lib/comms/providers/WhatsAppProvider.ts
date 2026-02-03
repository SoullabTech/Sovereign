/**
 * WHATSAPP PROVIDER
 *
 * Sends WhatsApp messages via Twilio's WhatsApp API
 * Uses the same Twilio credentials as SMS but with WhatsApp-enabled numbers
 *
 * Setup:
 * 1. Enable WhatsApp in Twilio console
 * 2. Use WhatsApp-enabled number (whatsapp:+1234567890 format)
 * 3. For templates, use pre-approved message templates
 */

import type {
  CommsProvider,
  ProviderType,
  DeliveryChannel,
  DeliveryPayload,
  DeliveryResult,
  DeliveryStatusUpdate,
} from './types';

export class WhatsAppProvider implements CommsProvider {
  readonly provider: ProviderType = 'twilio'; // Uses Twilio infrastructure
  readonly channel: DeliveryChannel = 'sms'; // Twilio treats WhatsApp as messaging

  async verifyCredentials(credentials: Record<string, string>): Promise<boolean> {
    const { account_sid, auth_token, whatsapp_number } = credentials;

    if (!account_sid || !auth_token || !whatsapp_number) {
      return false;
    }

    try {
      // Verify Twilio account
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${account_sid}.json`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${account_sid}:${auth_token}`).toString('base64')}`,
          },
        }
      );

      return response.ok;
    } catch (error) {
      console.error('[WhatsAppProvider] Credential verification failed:', error);
      return false;
    }
  }

  async send(
    payload: DeliveryPayload,
    credentials: Record<string, string>
  ): Promise<DeliveryResult> {
    const { account_sid, auth_token, whatsapp_number } = credentials;

    if (!account_sid || !auth_token || !whatsapp_number) {
      return {
        success: false,
        status: 'failed',
        errorCode: 'MISSING_CREDENTIALS',
        errorMessage: 'WhatsApp credentials not configured',
      };
    }

    try {
      // Format numbers for WhatsApp
      const toNumber = payload.to.startsWith('whatsapp:')
        ? payload.to
        : `whatsapp:${payload.to}`;

      const fromNumber = whatsapp_number.startsWith('whatsapp:')
        ? whatsapp_number
        : `whatsapp:${whatsapp_number}`;

      const formData = new URLSearchParams();
      formData.append('To', toNumber);
      formData.append('From', fromNumber);
      formData.append('Body', payload.bodyText);

      // Add media URL if present in tags
      if (payload.tags?.mediaUrl) {
        formData.append('MediaUrl', payload.tags.mediaUrl);
      }

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${account_sid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${account_sid}:${auth_token}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          status: 'failed',
          errorCode: data.code?.toString() || 'SEND_FAILED',
          errorMessage: data.message || 'Failed to send WhatsApp message',
          rawResponse: data,
        };
      }

      return {
        success: true,
        externalId: data.sid,
        status: data.status === 'queued' ? 'queued' : 'sent',
        rawResponse: data,
      };
    } catch (error) {
      console.error('[WhatsAppProvider] Send error:', error);
      return {
        success: false,
        status: 'failed',
        errorCode: 'NETWORK_ERROR',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  parseWebhook(payload: unknown): DeliveryStatusUpdate | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const data = payload as Record<string, unknown>;
    const messageStatus = data.MessageStatus as string;
    const messageSid = data.MessageSid as string;

    if (!messageSid || !messageStatus) {
      return null;
    }

    const statusMap: Record<string, DeliveryStatusUpdate['status']> = {
      delivered: 'delivered',
      read: 'delivered',
      failed: 'failed',
      undelivered: 'failed',
    };

    const status = statusMap[messageStatus];
    if (!status) {
      return null;
    }

    return {
      externalId: messageSid,
      status,
      timestamp: new Date(),
      errorCode: data.ErrorCode as string | undefined,
      errorMessage: data.ErrorMessage as string | undefined,
      rawEvent: payload,
    };
  }

  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // Twilio webhook signature verification
    // Uses X-Twilio-Signature header
    const crypto = require('crypto');

    const expectedSignature = crypto
      .createHmac('sha1', secret)
      .update(payload)
      .digest('base64');

    return signature === expectedSignature;
  }
}
