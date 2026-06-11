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
    const toNumber = this.normalizePhoneNumber(payload.to);
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
          errorMessage: sent.error_message || `Twilio rejected the message (error ${sent.error_code})`,
          rawResponse: result,
        };
      }

      // Twilio statuses: queued, sending, sent, delivered, failed
      const isQueued = ['queued', 'sending', 'sent'].includes(sent.status);

      return {
        success: isQueued,
        status: isQueued ? 'queued' : 'failed',
        externalId: sent.sid,
        // When Twilio accepts the request (HTTP 2xx) but the message is not in a
        // queued/sending/sent state, surface a truthful reason. Previously this
        // branch left errorMessage undefined, which collapsed to a generic
        // "Failed to send SMS" with no diagnostic value.
        ...(isQueued
          ? {}
          : {
              errorCode: sent.error_code ? String(sent.error_code) : 'TWILIO_NOT_QUEUED',
              errorMessage:
                sent.error_message ||
                `Twilio returned status "${sent.status || 'unknown'}" instead of queued${sent.error_code ? ` (error ${sent.error_code})` : ''}`,
            }),
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
   * Twilio uses X-Twilio-Signature header with HMAC-SHA1
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    if (!secret) {
      console.warn('[TwilioProvider] No auth token for signature verification');
      return true; // Dev mode
    }

    try {
      // Twilio signature is HMAC-SHA1 of URL + sorted params
      // For simplicity, we're doing basic verification here
      // Full implementation would include URL in signature calculation

      const hmac = crypto.createHmac('sha1', secret);
      hmac.update(payload);
      const calculatedSignature = hmac.digest('base64');

      return signature === calculatedSignature;
    } catch {
      return false;
    }
  }

  /**
   * Normalize phone number to E.164 format
   */
  private normalizePhoneNumber(phone: string): string | null {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');

    // Handle US numbers
    if (digits.length === 10) {
      return `+1${digits}`;
    }

    // Already has country code
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }

    // International number
    if (digits.length >= 10 && digits.length <= 15) {
      return `+${digits}`;
    }

    return null;
  }
}
