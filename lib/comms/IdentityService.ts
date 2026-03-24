/**
 * IDENTITY SERVICE
 * ================
 * Resolves phone numbers and email addresses to client identities.
 * The keystone of the practice comms hub — determines whether inbound
 * messages land in the right thread or become orphaned contacts.
 *
 * Design decisions:
 * - 1 thread per client (not per topic)
 * - Unknown contacts flagged for practitioner review
 * - Phone normalization to E.164 before all lookups
 * - Email normalization: lowercase + trim
 */

import { query, queryOne } from '@/lib/db/postgres';
import type { CommsChannelType, CommsIdentity } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface ResolvedIdentity {
  identityId: string;
  clientId: string | null;
  clientName: string | null;
  isKnown: boolean;
  isUnresolved: boolean;
  ownerType: 'member' | 'client' | 'contact';
}

// ============================================================================
// NORMALIZATION
// ============================================================================

/**
 * Normalize phone number to E.164 format
 * Extracted from TwilioProvider for shared use
 */
export function normalizePhone(phone: string): string | null {
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

/**
 * Normalize email address: lowercase + trim
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Normalize an address based on channel type
 */
function normalizeAddress(channelType: CommsChannelType, address: string): string | null {
  if (channelType === 'sms' || channelType === 'voice') {
    return normalizePhone(address);
  }
  if (channelType === 'email') {
    return normalizeEmail(address);
  }
  return address;
}

// ============================================================================
// RESOLUTION
// ============================================================================

/**
 * Resolve a phone number or email to a client identity.
 *
 * Lookup chain:
 * 1. Query comms_identities by (channel_type, normalized_address)
 * 2. If found → join to practitioner_clients for name
 * 3. If not found → create unresolved contact identity
 *
 * @param channelType - 'sms', 'email', or 'voice'
 * @param address - raw phone number or email address
 * @param practitionerId - scope to this practitioner's clients
 */
export async function resolveByAddress(
  channelType: CommsChannelType,
  address: string,
  practitionerId: string
): Promise<ResolvedIdentity> {
  const normalized = normalizeAddress(channelType, address);
  if (!normalized) {
    // Invalid address — create unresolved identity with raw address
    return createUnresolvedIdentity(channelType, address, practitionerId);
  }

  // Look up existing identity + client info
  const existing = await queryOne<{
    identity_id: string;
    owner_type: string;
    owner_id: string;
    client_name: string | null;
    preferred_name: string | null;
  }>(
    `SELECT
       ci.id AS identity_id,
       ci.owner_type,
       ci.owner_id,
       pc.name AS client_name,
       pc.preferred_name
     FROM comms_identities ci
     LEFT JOIN practitioner_clients pc
       ON ci.owner_type = 'client'
       AND ci.owner_id = pc.id
     WHERE ci.channel_type = $1
       AND ci.address = $2
       AND ci.status = 'active'
     LIMIT 1`,
    [channelType === 'voice' ? 'sms' : channelType, normalized]
  );

  if (existing) {
    const isClient = existing.owner_type === 'client';
    return {
      identityId: existing.identity_id,
      clientId: isClient ? existing.owner_id : null,
      clientName: existing.preferred_name || existing.client_name || null,
      isKnown: isClient,
      isUnresolved: false,
      ownerType: existing.owner_type as 'member' | 'client' | 'contact',
    };
  }

  // No match — create unresolved contact
  return createUnresolvedIdentity(channelType, normalized, practitionerId);
}

/**
 * Create an unresolved contact identity for an unknown sender.
 * Practitioner will see this in their inbox and can link it to an existing client.
 */
async function createUnresolvedIdentity(
  channelType: CommsChannelType,
  address: string,
  _practitionerId: string
): Promise<ResolvedIdentity> {
  // Use the address's channel type for storage (voice uses sms identity)
  const storageChannelType = channelType === 'voice' ? 'sms' : channelType;

  const identity = await queryOne<CommsIdentity>(
    `INSERT INTO comms_identities (
       owner_type, owner_id,
       channel_type, address,
       verified, is_primary, status,
       metadata
     ) VALUES (
       'contact', gen_random_uuid(),
       $1, $2,
       false, true, 'active',
       '{"is_unresolved": true, "needs_identity_resolution": true}'::jsonb
     )
     ON CONFLICT (channel_type, address)
       WHERE status = 'active'
     DO UPDATE SET updated_at = NOW()
     RETURNING *`,
    [storageChannelType, address]
  );

  if (!identity) {
    throw new Error(`[IdentityService] Failed to create identity for ${storageChannelType}:${address}`);
  }

  return {
    identityId: identity.id,
    clientId: null,
    clientName: null,
    isKnown: false,
    isUnresolved: true,
    ownerType: 'contact',
  };
}

// ============================================================================
// PRACTITIONER NUMBER RESOLUTION
// ============================================================================

/**
 * Find which practitioner owns a given phone number.
 * Used by inbound SMS/voice webhooks to route messages.
 *
 * Checks practitioner_integrations for SMS config containing the number.
 *
 * Returns practitionerId as members.id (not practitioners.id) so it is
 * compatible with comms_threads.practitioner_id.
 */
export async function resolvePractitionerByNumber(
  phoneNumber: string
): Promise<{ practitionerId: string; authToken: string } | null> {
  const normalized = normalizePhone(phoneNumber);
  if (!normalized) return null;

  // Check practitioner_integrations for SMS config with this number.
  // Join to practitioners to get member_id (what comms_threads expects).
  const result = await queryOne<{
    practitioner_id: string;
    member_id: string;
    config_encrypted: string;
  }>(
    `SELECT pi.practitioner_id, p.member_id, pi.config_encrypted
     FROM practitioner_integrations pi
     JOIN practitioners p ON p.id = pi.practitioner_id
     WHERE pi.integration_type = 'sms'
       AND pi.status = 'connected'
     ORDER BY pi.updated_at DESC`,
    []
  );

  // For now, single-practitioner system — return first connected SMS integration
  // In multi-practitioner mode, would decrypt and match from_number
  if (result) {
    return {
      practitionerId: result.member_id, // members.id for comms_threads compatibility
      authToken: '', // Will be loaded from env or decrypted config when needed
    };
  }

  // Fallback: check env var for single-practitioner setup
  const envSid = process.env.TWILIO_ACCOUNT_SID;
  const envToken = process.env.TWILIO_AUTH_TOKEN;
  const envFrom = process.env.TWILIO_FROM_NUMBER;

  if (envSid && envToken && envFrom) {
    const envNormalized = normalizePhone(envFrom);
    if (envNormalized === normalized) {
      // Find the practitioner — for single-practitioner, get first one.
      // Return member_id so it aligns with comms_threads.practitioner_id.
      const practitioner = await queryOne<{ member_id: string }>(
        `SELECT member_id FROM practitioners LIMIT 1`,
        []
      );
      if (practitioner) {
        return {
          practitionerId: practitioner.member_id,
          authToken: envToken,
        };
      }
    }
  }

  return null;
}
