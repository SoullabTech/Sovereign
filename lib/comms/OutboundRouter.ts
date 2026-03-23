/**
 * OUTBOUND ROUTER
 * ================
 * Dispatches outbound messages to the correct channel provider.
 *
 * Called fire-and-forget after ThreadService.sendMessage() inserts the DB row.
 * Never blocks the reply API — runs detached.
 *
 * Flow:
 *   sendMessage() → DB insert → return to UI → routeOutbound() runs async
 *
 * Consent enforcement:
 *   Before sending via external channel (SMS/email), checks comms_consent.
 *   If no consent record exists, blocks send and marks message as blocked.
 */

import { query, queryOne } from '@/lib/db/postgres';
import { TwilioProvider } from './providers/TwilioProvider';
import { getSmsIntegration } from '@/lib/practitioner/integrations';
import type { CommsChannelType } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface OutboundResult {
  delivered: boolean;
  blocked: boolean;
  reason?: string;
  externalId?: string;
  error?: string;
}

// ============================================================================
// CONSENT CHECK
// ============================================================================

/**
 * Check if a client identity has consented to receive messages on a channel.
 * Returns true if consent exists and is active (not withdrawn).
 */
async function hasConsent(
  identityId: string,
  channelType: CommsChannelType
): Promise<boolean> {
  const consent = await queryOne<{ consented: boolean }>(
    `SELECT consented
     FROM comms_consent
     WHERE identity_id = $1
       AND channel_type = $2
       AND consented = true
       AND withdrawn_at IS NULL
     LIMIT 1`,
    [identityId, channelType]
  );

  return !!consent;
}

// ============================================================================
// OUTBOUND ROUTING
// ============================================================================

/**
 * Route an outbound message to the correct channel provider.
 *
 * This function is designed to be called fire-and-forget:
 *   routeOutbound(messageId, practitionerId).catch(console.error)
 *
 * @param messageId - ID of the already-inserted comms_messages row
 * @param practitionerId - Practitioner who sent the message
 */
export async function routeOutbound(
  messageId: string,
  practitionerId: string
): Promise<OutboundResult> {
  // Load the message + thread + recipient identity
  const message = await queryOne<{
    id: string;
    thread_id: string;
    channel_type: CommsChannelType;
    body: string;
    sender_type: string;
  }>(
    `SELECT id, thread_id, channel_type, body, sender_type
     FROM comms_messages WHERE id = $1`,
    [messageId]
  );

  if (!message) {
    return { delivered: false, blocked: false, error: 'Message not found' };
  }

  // In-app messages need no external delivery
  if (message.channel_type === 'in_app') {
    await updateDeliveryStatus(messageId, 'delivered');
    return { delivered: true, blocked: false };
  }

  // Find the recipient's identity (client in this thread)
  const thread = await queryOne<{ client_id: string | null }>(
    `SELECT client_id FROM comms_threads WHERE id = $1`,
    [message.thread_id]
  );

  if (!thread?.client_id) {
    return { delivered: false, blocked: false, error: 'No client in thread' };
  }

  // Find the client's identity for this channel
  const recipientIdentity = await queryOne<{ id: string; address: string }>(
    `SELECT id, address
     FROM comms_identities
     WHERE owner_id = $1
       AND channel_type = $2
       AND status = 'active'
       AND is_primary = true
     LIMIT 1`,
    [thread.client_id, message.channel_type === 'voice' ? 'sms' : message.channel_type]
  );

  if (!recipientIdentity) {
    await updateDeliveryStatus(messageId, 'failed');
    return { delivered: false, blocked: false, error: `No ${message.channel_type} address for client` };
  }

  // ── Consent check ────────────────────────────────────────────────
  if (message.channel_type === 'sms' || message.channel_type === 'email') {
    const consented = await hasConsent(recipientIdentity.id, message.channel_type);
    if (!consented) {
      await updateDeliveryStatus(messageId, 'failed');
      // Log blocked event
      query(
        `INSERT INTO comms_events (event_type, thread_id, message_id, identity_id, actor_type, data)
         VALUES ('message.failed', $1, $2, $3, 'system', $4::jsonb)`,
        [
          message.thread_id,
          messageId,
          recipientIdentity.id,
          JSON.stringify({ reason: 'no_consent', channel: message.channel_type }),
        ]
      ).catch(() => {});

      return { delivered: false, blocked: true, reason: 'no_consent' };
    }
  }

  // ── Route to provider ────────────────────────────────────────────
  try {
    switch (message.channel_type) {
      case 'sms':
        return await sendViaTwilio(messageId, message.body, recipientIdentity.address, practitionerId, message.thread_id);

      case 'email':
        // Phase 2 — email outbound via EmailRouter
        // For now, mark as queued
        await updateDeliveryStatus(messageId, 'queued');
        return { delivered: false, blocked: false, error: 'Email outbound not yet wired' };

      default:
        return { delivered: false, blocked: false, error: `Unsupported channel: ${message.channel_type}` };
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[OutboundRouter] Delivery failed for message ${messageId}:`, errorMsg);
    await updateDeliveryStatus(messageId, 'failed');
    return { delivered: false, blocked: false, error: errorMsg };
  }
}

// ============================================================================
// CHANNEL IMPLEMENTATIONS
// ============================================================================

async function sendViaTwilio(
  messageId: string,
  body: string,
  toNumber: string,
  practitionerId: string,
  threadId: string
): Promise<OutboundResult> {
  // Load Twilio credentials
  const integration = await getSmsIntegration(practitionerId);

  // Try integration config first, fall back to env vars
  let credentials: Record<string, string>;

  if (integration.config) {
    credentials = {
      account_sid: integration.config.accountSid,
      auth_token: integration.config.authToken,
      from_number: integration.config.fromNumber,
      messaging_service_sid: integration.config.messagingServiceSid || '',
    };
  } else if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    credentials = {
      account_sid: process.env.TWILIO_ACCOUNT_SID,
      auth_token: process.env.TWILIO_AUTH_TOKEN,
      from_number: process.env.TWILIO_FROM_NUMBER || '',
      messaging_service_sid: process.env.TWILIO_MESSAGING_SERVICE_SID || '',
    };
  } else {
    await updateDeliveryStatus(messageId, 'failed');
    return { delivered: false, blocked: false, error: 'No Twilio credentials configured' };
  }

  const provider = new TwilioProvider();
  const result = await provider.send(
    { to: toNumber, bodyText: body },
    credentials
  );

  if (result.success) {
    await updateDeliveryStatus(messageId, 'sent', result.externalId);

    // Audit event
    query(
      `INSERT INTO comms_events (event_type, thread_id, message_id, actor_type, actor_id, data)
       VALUES ('message.sent', $1, $2, 'practitioner', $3, $4::jsonb)`,
      [threadId, messageId, practitionerId, JSON.stringify({
        channel: 'sms',
        externalId: result.externalId,
        provider: 'twilio',
      })]
    ).catch(() => {});

    return { delivered: true, blocked: false, externalId: result.externalId };
  } else {
    await updateDeliveryStatus(messageId, 'failed');
    return { delivered: false, blocked: false, error: result.errorMessage };
  }
}

// ============================================================================
// HELPERS
// ============================================================================

async function updateDeliveryStatus(
  messageId: string,
  status: string,
  externalId?: string
): Promise<void> {
  if (externalId) {
    await query(
      `UPDATE comms_messages
       SET delivery_status = $2,
           sent_at = CASE WHEN $2 = 'sent' THEN NOW() ELSE sent_at END,
           delivered_at = CASE WHEN $2 = 'delivered' THEN NOW() ELSE delivered_at END,
           external_message_id = $3,
           updated_at = NOW()
       WHERE id = $1`,
      [messageId, status, externalId]
    );
  } else {
    await query(
      `UPDATE comms_messages
       SET delivery_status = $2, updated_at = NOW()
       WHERE id = $1`,
      [messageId, status]
    );
  }
}

/**
 * Get the suggested reply channel for a thread.
 * Returns the channel_type of the most recent inbound message from the client.
 */
export async function getSuggestedReplyChannel(
  threadId: string
): Promise<CommsChannelType | null> {
  const result = await queryOne<{ channel_type: CommsChannelType }>(
    `SELECT channel_type
     FROM comms_messages
     WHERE thread_id = $1
       AND sender_type = 'client'
     ORDER BY created_at DESC
     LIMIT 1`,
    [threadId]
  );

  return result?.channel_type || null;
}
