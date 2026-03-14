/**
 * lib/nostr/maiaIdentity.ts
 *
 * Server-side module. MAIA's Nostr identity management.
 *
 * MAIA uses a tiered key model:
 *
 *   Root keypair (OFFLINE — cold storage, never in any env var or DB)
 *   ├── Oracle service key       — signed reflections, kind 1
 *   ├── Support service key      — DM responses, kind 14
 *   ├── Retreat service key      — circle summaries, kind 9
 *   └── Practitioner bridge key  — practitioner coordination, kind 9 + 14
 *
 * Service private keys live in env vars (Docker secrets in production).
 * Delegation certs (NIP-26 tokens) are stored in maia_nostr_delegation_certs.
 * The root private key is NEVER needed by the running application.
 *
 * DO NOT import this module in client-side code. It reads process.env and DB.
 */

import { finalizeEvent, getPublicKey } from 'nostr-tools';
import type { UnsignedEvent, Event } from 'nostr-tools';
import { query } from '@/lib/db/postgres';
import { buildDelegationTag, verifyDelegationToken } from './nip26';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MaiaServiceRole = 'oracle' | 'support' | 'retreat' | 'practitioner_bridge';

export interface DelegationCert {
  rootPubkey: string;      // MAIA's public root identity (hex)
  servicePubkey: string;   // Hot service key pubkey (hex)
  conditions: string;      // NIP-26 condition query string
  delegationToken: string; // Schnorr sig hex (128 chars)
  validSince: number;      // unix timestamp
  validUntil: number;      // unix timestamp
}

// ─── Env var names per service role ──────────────────────────────────────────

const SERVICE_KEY_ENV: Record<MaiaServiceRole, string> = {
  oracle:               'MAIA_ORACLE_SERVICE_PRIVKEY',
  support:              'MAIA_SUPPORT_SERVICE_PRIVKEY',
  retreat:              'MAIA_RETREAT_SERVICE_PRIVKEY',
  practitioner_bridge:  'MAIA_PRACTITIONER_BRIDGE_SERVICE_PRIVKEY',
};

// ─── Root pubkey ──────────────────────────────────────────────────────────────

/**
 * MAIA's root public identity on Nostr.
 * Set MAIA_ROOT_NOSTR_PUBKEY in env (hex format).
 * This is a public key — not a secret.
 */
export function getMaiaRootPubkey(): string | null {
  return process.env.MAIA_ROOT_NOSTR_PUBKEY ?? null;
}

// ─── Service key ──────────────────────────────────────────────────────────────

/**
 * Load a service role's private key from env vars.
 * Returns null if not configured (Phase 4 not set up yet).
 */
function getServicePrivkey(role: MaiaServiceRole): Uint8Array | null {
  const hex = process.env[SERVICE_KEY_ENV[role]];
  if (!hex || !/^[0-9a-f]{64}$/.test(hex)) return null;
  return hexToBytes(hex);
}

/**
 * Get the pubkey for a service role (derived from env privkey).
 */
export function getServicePubkey(role: MaiaServiceRole): string | null {
  const privkey = getServicePrivkey(role);
  if (!privkey) return null;
  return getPublicKey(privkey);
}

// ─── Delegation cert ──────────────────────────────────────────────────────────

/**
 * Load the active delegation cert for a service role from the DB.
 * Returns null if Phase 4 is not yet configured or cert has expired.
 */
export async function loadActiveDelegation(role: MaiaServiceRole): Promise<DelegationCert | null> {
  const now = Math.floor(Date.now() / 1000);

  try {
    const result = await query(
      `SELECT root_pubkey, service_pubkey, conditions, delegation_token,
              valid_since, valid_until
       FROM maia_nostr_delegation_certs
       WHERE service_role = $1
         AND active = true
         AND valid_since <= $2
         AND valid_until >= $2
       ORDER BY created_at DESC
       LIMIT 1`,
      [role, now]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      rootPubkey:      row.root_pubkey as string,
      servicePubkey:   row.service_pubkey as string,
      conditions:      row.conditions as string,
      delegationToken: row.delegation_token as string,
      validSince:      Number(row.valid_since),
      validUntil:      Number(row.valid_until),
    };

  } catch (err) {
    console.error('[MAIA Identity] Failed to load delegation cert', { role, err });
    return null;
  }
}

// ─── Event signing ────────────────────────────────────────────────────────────

export interface MaiaSignResult {
  event: Event;
  delegated: boolean;   // true if NIP-26 delegation tag was attached
  rootPubkey: string | null;
}

/**
 * Sign a Nostr event as a MAIA service role.
 *
 * If a valid delegation cert exists, the event is signed with the service key
 * and a NIP-26 delegation tag is added, linking it to the root identity.
 *
 * If no delegation cert is configured (Phase 4 not yet set up), signing fails
 * and returns null — callers should handle this gracefully.
 *
 * @param role     Service role to sign as
 * @param template Unsigned event (without pubkey, id, or sig)
 */
export async function signAsMaia(
  role: MaiaServiceRole,
  template: Omit<UnsignedEvent, 'pubkey'>
): Promise<MaiaSignResult | null> {

  const privkeyBytes = getServicePrivkey(role);
  if (!privkeyBytes) {
    console.warn(`[MAIA Identity] Service key not configured for role: ${role}`);
    return null;
  }

  const servicePubkey = getPublicKey(privkeyBytes);

  // Load delegation cert
  const delegation = await loadActiveDelegation(role);

  // Build the unsigned event with pubkey set to service key
  const unsigned: UnsignedEvent = {
    ...template,
    pubkey: servicePubkey,
  };

  if (delegation) {
    // Verify the cert is still valid and consistent
    const delegationValid = verifyDelegationToken(
      delegation.rootPubkey,
      delegation.servicePubkey,
      delegation.conditions,
      delegation.delegationToken
    );

    if (!delegationValid) {
      console.error('[MAIA Identity] Delegation token verification failed', { role });
      return null;
    }

    if (delegation.servicePubkey !== servicePubkey) {
      console.error('[MAIA Identity] Delegation cert service pubkey mismatch', {
        role,
        certPubkey: delegation.servicePubkey,
        envPubkey: servicePubkey,
      });
      return null;
    }

    // Attach delegation tag
    const tags = [
      ...unsigned.tags,
      buildDelegationTag(delegation.rootPubkey, delegation.conditions, delegation.delegationToken),
    ];
    const delegatedEvent = finalizeEvent({ ...unsigned, tags }, privkeyBytes);

    return {
      event: delegatedEvent,
      delegated: true,
      rootPubkey: delegation.rootPubkey,
    };
  }

  // No delegation cert — sign as service key only (no root identity link)
  // This is acceptable for internal use; not ideal for public events
  const event = finalizeEvent(unsigned, privkeyBytes);
  return {
    event,
    delegated: false,
    rootPubkey: getMaiaRootPubkey(),
  };
}

// ─── Phase 4 readiness check ──────────────────────────────────────────────────

/**
 * Check whether Phase 4 MAIA identity is fully configured for a role.
 * Used by health checks and admin endpoints.
 */
export async function checkPhase4Readiness(role: MaiaServiceRole): Promise<{
  serviceKeyConfigured: boolean;
  delegationCertActive: boolean;
  rootPubkeyConfigured: boolean;
  ready: boolean;
}> {
  const serviceKeyConfigured = getServicePrivkey(role) !== null;
  const delegation = serviceKeyConfigured ? await loadActiveDelegation(role) : null;
  const delegationCertActive = delegation !== null;
  const rootPubkeyConfigured = getMaiaRootPubkey() !== null;

  return {
    serviceKeyConfigured,
    delegationCertActive,
    rootPubkeyConfigured,
    ready: serviceKeyConfigured && delegationCertActive && rootPubkeyConfigured,
  };
}

// ─── Hex helpers ──────────────────────────────────────────────────────────────

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
