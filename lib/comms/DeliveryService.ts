/**
 * COMMS DELIVERY SERVICE
 *
 * Handles queueing and delivering messages via email/SMS providers
 * Manages credentials, retries, and status tracking
 */

import { query } from '@/lib/db/postgres';
import {
  getProvider,
  getDefaultProviderForChannel,
  type DeliveryChannel,
  type DeliveryPayload,
  type DeliveryResult,
  type ProviderType,
} from './providers';

// AES-256-GCM encryption for credentials
// SECURITY: No fallbacks - fail fast if env vars missing
import crypto from 'crypto';

interface EncryptedCredentials {
  iv: string;
  encrypted: string;
  authTag: string;
}

/**
 * Get derived encryption key (fail-fast if env vars missing)
 */
function getDerivedKey(): Buffer {
  const ENCRYPTION_KEY = process.env.COMMS_ENCRYPTION_KEY;
  const ENCRYPTION_SALT = process.env.COMMS_ENCRYPTION_SALT;

  if (!ENCRYPTION_KEY) {
    throw new Error(
      'COMMS_ENCRYPTION_KEY is required. Generate with: openssl rand -hex 32'
    );
  }
  if (!ENCRYPTION_SALT) {
    throw new Error(
      'COMMS_ENCRYPTION_SALT is required. Generate with: openssl rand -hex 16'
    );
  }

  return crypto.scryptSync(ENCRYPTION_KEY, ENCRYPTION_SALT, 32);
}

/**
 * Encrypt credentials for storage
 * Returns object (not string) for clean JSONB storage
 */
function encryptCredentials(credentials: Record<string, string>): EncryptedCredentials {
  const key = getDerivedKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    encrypted,
    authTag: authTag.toString('hex'),
  };
}

/**
 * Decrypt credentials from storage
 * Handles both object and string input (legacy support)
 */
function decryptCredentials(encryptedData: EncryptedCredentials | string): Record<string, string> {
  const data: EncryptedCredentials =
    typeof encryptedData === 'string' ? JSON.parse(encryptedData) : encryptedData;

  const { iv, encrypted, authTag } = data;
  const key = getDerivedKey();

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
}

export interface QueuedMessage {
  messageId: string;
  practitionerId: string;
  channelType: DeliveryChannel;
  recipientAddress: string;
  recipientName?: string;
  subject?: string;
  bodyHtml?: string;
  bodyText: string;
  scheduledFor?: Date;
}

export interface DeliveryQueueItem {
  id: string;
  messageId: string;
  practitionerId: string;
  channelType: string;
  provider: string;
  recipientAddress: string;
  recipientName: string | null;
  subject: string | null;
  bodyHtml: string | null;
  bodyText: string;
  status: string;
  retryCount: number;
  maxRetries: number;
  scheduledFor: Date;
  createdAt: Date;
}

/**
 * DeliveryService - Main interface for message delivery
 */
export class DeliveryService {
  /**
   * Queue a message for delivery
   */
  async queueMessage(message: QueuedMessage): Promise<string> {
    const provider = getDefaultProviderForChannel(message.channelType);

    const result = await query<{ id: string }>(
      `INSERT INTO comms_delivery_queue
       (message_id, practitioner_id, channel_type, provider,
        recipient_address, recipient_name, subject, body_html, body_text,
        scheduled_for, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'queued')
       RETURNING id`,
      [
        message.messageId,
        message.practitionerId,
        message.channelType,
        provider,
        message.recipientAddress,
        message.recipientName || null,
        message.subject || null,
        message.bodyHtml || null,
        message.bodyText,
        message.scheduledFor || new Date(),
      ]
    );

    return result.rows[0].id;
  }

  /**
   * Get practitioner's credentials for a provider
   */
  async getCredentials(
    practitionerId: string,
    provider: ProviderType
  ): Promise<Record<string, string> | null> {
    const result = await query<{ credentials_encrypted: string }>(
      `SELECT credentials_encrypted
       FROM practitioner_comms_credentials
       WHERE practitioner_id = $1 AND provider = $2 AND status = 'active'`,
      [practitionerId, provider]
    );

    if (result.rows.length === 0) {
      return null;
    }

    try {
      // decryptCredentials handles both object (JSONB) and string formats
      return decryptCredentials(result.rows[0].credentials_encrypted);
    } catch (error) {
      console.error('[DeliveryService] Failed to decrypt credentials:', error);
      return null;
    }
  }

  /**
   * Store credentials for a practitioner
   */
  async storeCredentials(
    practitionerId: string,
    provider: ProviderType,
    credentials: Record<string, string>
  ): Promise<void> {
    const encrypted = encryptCredentials(credentials);

    await query(
      `INSERT INTO practitioner_comms_credentials
       (practitioner_id, provider, credentials_encrypted, status)
       VALUES ($1, $2, $3::jsonb, 'active')
       ON CONFLICT (practitioner_id, provider) DO UPDATE SET
         credentials_encrypted = EXCLUDED.credentials_encrypted,
         updated_at = NOW()`,
      [practitionerId, provider, encrypted]
    );
  }

  /**
   * Verify and store credentials
   */
  async verifyAndStoreCredentials(
    practitionerId: string,
    provider: ProviderType,
    credentials: Record<string, string>
  ): Promise<{ valid: boolean; error?: string }> {
    const providerInstance = getProvider(provider);

    const valid = await providerInstance.verifyCredentials(credentials);

    if (!valid) {
      return {
        valid: false,
        error: 'Invalid credentials. Please check your API key and try again.',
      };
    }

    await this.storeCredentials(practitionerId, provider, credentials);

    // Mark as verified
    await query(
      `UPDATE practitioner_comms_credentials
       SET verified = true, verified_at = NOW()
       WHERE practitioner_id = $1 AND provider = $2`,
      [practitionerId, provider]
    );

    return { valid: true };
  }

  /**
   * Get next batch of messages to deliver
   */
  async getNextBatch(
    batchSize: number = 10,
    workerId: string
  ): Promise<DeliveryQueueItem[]> {
    // Lock messages for processing
    const result = await query<DeliveryQueueItem>(
      `UPDATE comms_delivery_queue
       SET status = 'processing', worker_id = $1, locked_at = NOW(), processing_at = NOW()
       WHERE id IN (
         SELECT id FROM comms_delivery_queue
         WHERE status = 'queued'
           AND scheduled_for <= NOW()
           AND (locked_at IS NULL OR locked_at < NOW() - INTERVAL '5 minutes')
         ORDER BY scheduled_for
         LIMIT $2
         FOR UPDATE SKIP LOCKED
       )
       RETURNING *`,
      [workerId, batchSize]
    );

    return result.rows;
  }

  /**
   * Deliver a single queued message
   */
  async deliverMessage(item: DeliveryQueueItem): Promise<DeliveryResult> {
    const credentials = await this.getCredentials(
      item.practitionerId,
      item.provider as ProviderType
    );

    if (!credentials) {
      // No credentials configured
      await this.markDeliveryFailed(
        item.id,
        'NO_CREDENTIALS',
        'Provider credentials not configured'
      );
      return {
        success: false,
        status: 'failed',
        errorCode: 'NO_CREDENTIALS',
        errorMessage: 'Provider credentials not configured',
      };
    }

    const provider = getProvider(item.provider as ProviderType);

    const payload: DeliveryPayload = {
      to: item.recipientAddress,
      toName: item.recipientName || undefined,
      subject: item.subject || undefined,
      bodyHtml: item.bodyHtml || undefined,
      bodyText: item.bodyText,
      messageId: item.messageId,
      practitionerId: item.practitionerId,
      tags: {
        message_id: item.messageId,
        queue_id: item.id,
      },
    };

    // Get sender info from comms settings
    const settingsResult = await query<{
      default_email: string | null;
      default_phone: string | null;
      email_from_name: string | null;
    }>(
      `SELECT default_email, default_phone, email_from_name
       FROM practitioner_comms_settings
       WHERE practitioner_id = $1`,
      [item.practitionerId]
    );

    if (settingsResult.rows.length > 0) {
      const settings = settingsResult.rows[0];
      if (item.channelType === 'email' && settings.default_email) {
        payload.from = settings.default_email;
        payload.fromName = settings.email_from_name || undefined;
      }
    }

    try {
      const result = await provider.send(payload, credentials);

      if (result.success) {
        await this.markDeliverySent(item.id, result.externalId || null);
      } else {
        // Check if we should retry
        if (item.retryCount < item.maxRetries) {
          await this.markDeliveryForRetry(
            item.id,
            result.errorCode || 'UNKNOWN',
            result.errorMessage || 'Unknown error'
          );
        } else {
          await this.markDeliveryFailed(
            item.id,
            result.errorCode || 'UNKNOWN',
            result.errorMessage || 'Unknown error'
          );
        }
      }

      // Update credential last_used_at
      await query(
        `UPDATE practitioner_comms_credentials
         SET last_used_at = NOW()
         WHERE practitioner_id = $1 AND provider = $2`,
        [item.practitionerId, item.provider]
      );

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await this.markDeliveryFailed(item.id, 'EXCEPTION', message);
      return {
        success: false,
        status: 'failed',
        errorCode: 'EXCEPTION',
        errorMessage: message,
      };
    }
  }

  /**
   * Mark delivery as sent
   */
  private async markDeliverySent(queueId: string, externalId: string | null): Promise<void> {
    await query(
      `UPDATE comms_delivery_queue
       SET status = 'sent', external_id = $1, sent_at = NOW()
       WHERE id = $2`,
      [externalId, queueId]
    );

    // Also update the original message status
    await query(
      `UPDATE comms_messages
       SET delivery_status = 'sent'
       WHERE id = (SELECT message_id FROM comms_delivery_queue WHERE id = $1)`,
      [queueId]
    );
  }

  /**
   * Mark delivery for retry
   */
  private async markDeliveryForRetry(
    queueId: string,
    errorCode: string,
    errorMessage: string
  ): Promise<void> {
    // Exponential backoff: 1min, 5min, 30min
    const backoffMinutes = [1, 5, 30];

    await query(
      `UPDATE comms_delivery_queue
       SET status = 'queued',
           retry_count = retry_count + 1,
           error_code = $1,
           error_message = $2,
           locked_at = NULL,
           worker_id = NULL,
           scheduled_for = NOW() + ($3 || ' minutes')::interval
       WHERE id = $4`,
      [
        errorCode,
        errorMessage,
        backoffMinutes[Math.min(2, (await this.getRetryCount(queueId)))],
        queueId,
      ]
    );
  }

  /**
   * Get current retry count for a queue item
   */
  private async getRetryCount(queueId: string): Promise<number> {
    const result = await query<{ retry_count: number }>(
      'SELECT retry_count FROM comms_delivery_queue WHERE id = $1',
      [queueId]
    );
    return result.rows[0]?.retry_count || 0;
  }

  /**
   * Mark delivery as permanently failed
   */
  private async markDeliveryFailed(
    queueId: string,
    errorCode: string,
    errorMessage: string
  ): Promise<void> {
    await query(
      `UPDATE comms_delivery_queue
       SET status = 'failed', error_code = $1, error_message = $2, failed_at = NOW()
       WHERE id = $3`,
      [errorCode, errorMessage, queueId]
    );

    // Also update the original message status
    await query(
      `UPDATE comms_messages
       SET delivery_status = 'failed'
       WHERE id = (SELECT message_id FROM comms_delivery_queue WHERE id = $1)`,
      [queueId]
    );
  }

  /**
   * Process delivery status update from webhook
   */
  async processStatusUpdate(
    provider: ProviderType,
    externalId: string,
    status: 'delivered' | 'bounced' | 'failed' | 'complained',
    errorCode?: string,
    errorMessage?: string
  ): Promise<void> {
    let dbStatus: string;
    switch (status) {
      case 'delivered':
        dbStatus = 'delivered';
        break;
      case 'bounced':
        dbStatus = 'bounced';
        break;
      default:
        dbStatus = 'failed';
    }

    // Update delivery queue
    await query(
      `UPDATE comms_delivery_queue
       SET status = $1,
           delivered_at = CASE WHEN $1 = 'delivered' THEN NOW() ELSE delivered_at END,
           failed_at = CASE WHEN $1 IN ('failed', 'bounced') THEN NOW() ELSE failed_at END,
           error_code = COALESCE($2, error_code),
           error_message = COALESCE($3, error_message)
       WHERE external_id = $4 AND provider = $5`,
      [dbStatus, errorCode || null, errorMessage || null, externalId, provider]
    );

    // Update original message
    await query(
      `UPDATE comms_messages
       SET delivery_status = $1
       WHERE id = (
         SELECT message_id FROM comms_delivery_queue
         WHERE external_id = $2 AND provider = $3
       )`,
      [dbStatus, externalId, provider]
    );

    // If bounced, update the identity bounce count
    if (status === 'bounced') {
      await query(
        `UPDATE comms_identities
         SET bounce_count = bounce_count + 1, last_bounce_at = NOW()
         WHERE address = (
           SELECT recipient_address FROM comms_delivery_queue
           WHERE external_id = $1 AND provider = $2
         )`,
        [externalId, provider]
      );
    }
  }
}

// Singleton instance
export const deliveryService = new DeliveryService();
