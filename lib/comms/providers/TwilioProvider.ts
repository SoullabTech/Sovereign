/**
 * TWILIO PROVIDER
 *
 * SMS delivery via Twilio
 * Sovereign-hosted, privacy-first SMS delivery
 */

import crypto from 'crypto';
import type {
  CommsProvider,
  DeliveryPayload,
  DeliveryResult,
  DeliveryStatusUpdate,
  ProviderType,
  DeliveryChannel,
} from './types';

interface TwilioCredentials {
  account_sid: string;
  auth_token: string;
  from_number: string;  // E.164 format: +1234567890
  messaging_service_sid?: string;  // A2P 10DLC Messaging Service SID (MG...)
}

interface TwilioSendResponse {
  sid: string;
  status: string;
  to: string;
  from: string;
  body: string;
  date_created: string;
  error_code?: number;
  error_message?: string;
}

interface TwilioErrorResponse {
  code: number;
  message: string;
  more_info: string;
  status: number;
}

interface TwilioWebhookEvent {
  MessageSid: string;
  MessageStatus: string;
  To: string;
  From: string;
  ErrorCode?: string;
  ErrorMessage?: string;
}

export class TwilioProvider implements CommsProvider {
  readonly provider: ProviderType = 'twilio';
  readonly channel: DeliveryChannel = 'sms';

  private readonly apiUrl = 'https://api.twilio.com/2010-04-01';

  /**
   * Verify Twilio credentials by checking account info
   */
  async verifyCredentials(credentials: Record<string, string>): Promise<boolean> {
    const { account_sid, auth_token } = credentials as unknown as TwilioCredentials;

    if (!account_sid || !auth_token) {
      return false;
    }

    try {
      const response = await fetch(`${this.apiUrl}/Accounts/${account_sid}.json`, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${account_sid}:${auth_token}`).toString('base64'),
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Send an SMS via Twilio
   */
  async send(
    payload: DeliveryPayload,
    credentials: Record<string, string>
  ): Promise<DeliveryResult> {
    const { account_sid, auth_token, from_number, messaging_service_sid } = credentials as unknown as TwilioCredentials;

    if (!account_sid || !auth_token) {
      return {
        success: false,
        status: 'failed',
        errorCode: 'MISSING_CREDENTIALS',
        errorMessage: 'Twilio account SID and auth token are required',
      };
    }

    if (!from_number && !messaging_service_sid) {
      return {
        success: false,
        status: 'failed',
        errorCode: 'MISSING_FROM_NUMBER',
        errorMessage: 'Twilio from number or messaging service SID is required',
      };
    }

    // Normalize phone number to E.164
    const toNumber = TwilioProvider.normalizePhoneNumber(payload.to);
    if (!toNumber) {
      return {
        success: false,
        status: 'failed',
        errorCode: 'INVALID_TO_NUMBER',
        errorMessage: 'Invalid recipient phone number',
      };
    }

    try {
      // Twilio uses form-urlencoded for the Messages API
      // Prefer MessagingServiceSid (A2P 10DLC compliant) over From number
      const body = new URLSearchParams({
        To: toNumber,
        Body: payload.bodyText,
      });

      if (messaging_service_sid) {
        body.append('MessagingServiceSid', messaging_service_sid);
      } else {
        body.append('From', from_number);
      }

      // Optional: Add status callback URL
      // body.append('StatusCallback', `${process.env.BASE_URL}/api/webhooks/twilio`);

      const response = await fetch(
        `${this.apiUrl}/Accounts/${account_sid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${account_sid}:${auth_token}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        const error = result as TwilioErrorResponse;
        return {
          success: false,
          status: 'failed',
          errorCode: String(error.code) || 'TWILIO_ERROR',
          errorMessage: error.message || 'Failed to send SMS',
          rawResponse: result,
        };
      }

      const sent = result as TwilioSendResponse;

      // Check for Twilio-reported error
      if (sent.error_code) {
        return {
          success: false,
          status: 'failed',
          externalId: sent.sid,
          errorCode: String(sent.error_code),
          errorMessage: sent.error_message,
          rawResponse: result,
        };
      }

      // Twilio statuses: queued, sending, sent, delivered, failed
      const isQueued = ['queued', 'sending', 'sent'].includes(sent.status);

      return {
        success: isQueued,
        status: isQueued ? 'queued' : 'failed',
        externalId: sent.sid,
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
   * Parse Twilio webhook event into standard format
   *
   * Twilio sends status callbacks as form-urlencoded POST
   */
  parseWebhook(payload: unknown): DeliveryStatusUpdate | null {
    try {
      const event = payload as TwilioWebhookEvent;

      if (!event?.MessageSid || !event?.MessageStatus) {
        return null;
      }

      let status: DeliveryStatusUpdate['status'];

      switch (event.MessageStatus.toLowerCase()) {
        case 'delivered':
          status = 'delivered';
          break;
        case 'undelivered':
        case 'failed':
          status = 'failed';
          break;
        default:
          // 'queued', 'sending', 'sent' - not final statuses
          return null;
      }

      return {
        externalId: event.MessageSid,
        status,
        timestamp: new Date(),
        errorCode: event.ErrorCode,
        errorMessage: event.ErrorMessage,
        rawEvent: event,
      };
    } catch {
      return null;
    }
  }

  /**
   * Verify Twilio webhook signature
   *
   * Twilio signs webhooks with HMAC-SHA1 of:
   *   webhookUrl + sorted POST param keys concatenated as key=value (no separator)
   *
   * @param url - The full webhook URL Twilio sent the request to
   * @param params - Parsed POST parameters (key-value pairs)
   * @param signature - X-Twilio-Signature header value
   * @param authToken - Twilio auth token (HMAC key)
   */
  static verifyWebhookSignature(
    url: string,
    params: Record<string, string>,
    signature: string,
    authToken: string
  ): boolean {
    if (!authToken) {
      console.warn('[TwilioProvider] No auth token for signature verification');
      return process.env.NODE_ENV !== 'production';
    }

    try {
      // Twilio spec: URL + sorted keys with values concatenated (no separators)
      const sortedKeys = Object.keys(params).sort();
      let data = url;
      for (const key of sortedKeys) {
        data += key + params[key];
      }

      const hmac = crypto.createHmac('sha1', authToken);
      hmac.update(data);
      const calculated = hmac.digest('base64');

      // Timing-safe comparison to prevent timing attacks
      if (calculated.length !== signature.length) return false;
      return crypto.timingSafeEqual(
        Buffer.from(calculated),
        Buffer.from(signature)
      );
    } catch {
      return false;
    }
  }

  /**
   * Normalize phone number to E.164 format
   * Public static for shared use across comms services
   */
  static normalizePhoneNumber(phone: string): string | null {
    const digits = phone.replace(/\D/g, '');

    // US 10-digit
    if (digits.length === 10) {
      return `+1${digits}`;
    }

    // US with country code
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }

    // International (10-15 digits)
    if (digits.length >= 10 && digits.length <= 15) {
      return `+${digits}`;
    }

    return null;
  }
}
