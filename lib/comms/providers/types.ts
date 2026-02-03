/**
 * COMMS PROVIDER TYPES
 *
 * Common types for email/SMS delivery providers
 */

export type ProviderType = 'resend' | 'twilio' | 'sendgrid' | 'postmark';

export type DeliveryChannel = 'email' | 'sms';

export interface ProviderCredentials {
  provider: ProviderType;
  // Credentials vary by provider - stored encrypted
  credentials: Record<string, string>;
}

export interface DeliveryPayload {
  // Recipient
  to: string;
  toName?: string;

  // Sender (for email)
  from?: string;
  fromName?: string;
  replyTo?: string;

  // Content
  subject?: string;
  bodyHtml?: string;
  bodyText: string;

  // Metadata
  messageId: string;
  practitionerId: string;
  threadId?: string;

  // Tags for tracking
  tags?: Record<string, string>;
}

export interface DeliveryResult {
  success: boolean;

  // Provider's external ID for tracking
  externalId?: string;

  // Status from provider
  status: 'sent' | 'queued' | 'failed';

  // Error details if failed
  errorCode?: string;
  errorMessage?: string;

  // Raw response from provider
  rawResponse?: unknown;
}

export interface DeliveryStatusUpdate {
  externalId: string;
  status: 'delivered' | 'bounced' | 'failed' | 'complained';
  timestamp: Date;
  errorCode?: string;
  errorMessage?: string;
  rawEvent?: unknown;
}

export interface ProviderConfig {
  provider: ProviderType;
  channel: DeliveryChannel;
  isDefault?: boolean;
}

/**
 * Base interface all providers must implement
 */
export interface CommsProvider {
  readonly provider: ProviderType;
  readonly channel: DeliveryChannel;

  /**
   * Verify credentials are valid
   */
  verifyCredentials(credentials: Record<string, string>): Promise<boolean>;

  /**
   * Send a message
   */
  send(payload: DeliveryPayload, credentials: Record<string, string>): Promise<DeliveryResult>;

  /**
   * Parse a webhook payload into a status update
   */
  parseWebhook(payload: unknown): DeliveryStatusUpdate | null;

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean;
}
