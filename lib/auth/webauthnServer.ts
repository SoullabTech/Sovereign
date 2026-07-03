/**
 * WebAuthn Server-Side Logic
 *
 * Handles passkey/biometric authentication:
 * - Registration (enrolling Face ID, Touch ID, Windows Hello)
 * - Authentication (verifying biometric)
 *
 * Uses @simplewebauthn/server for WebAuthn protocol handling
 */

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
  type AuthenticatorTransportFuture,
} from '@simplewebauthn/server';
import { query } from '@/lib/db/postgres';

// WebAuthn configuration
const RP_NAME = 'MAIA Sovereign';
const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost';
const ORIGIN = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';
const CHALLENGE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

// In-memory challenge store (for production, use Redis or database)
const challengeStore = new Map<string, { challenge: string; expiresAt: number }>();

export interface WebAuthnCredential {
  id: string;
  memberId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  deviceType: 'platform' | 'cross-platform';
  transports: AuthenticatorTransportFuture[];
  deviceName: string | null;
  lastUsedAt: Date | null;
  createdAt: Date;
}

/**
 * Store a challenge for later verification
 */
function storeChallenge(memberId: string, challenge: string): void {
  challengeStore.set(memberId, {
    challenge,
    expiresAt: Date.now() + CHALLENGE_TIMEOUT_MS
  });

  // Clean up expired challenges periodically
  if (challengeStore.size > 1000) {
    const now = Date.now();
    for (const [key, value] of challengeStore) {
      if (value.expiresAt < now) {
        challengeStore.delete(key);
      }
    }
  }
}

/**
 * Retrieve and consume a challenge
 */
function consumeChallenge(memberId: string): string | null {
  const stored = challengeStore.get(memberId);
  if (!stored) return null;

  challengeStore.delete(memberId);

  if (stored.expiresAt < Date.now()) {
    return null; // Expired
  }

  return stored.challenge;
}

/**
 * Get existing credentials for a member (for excludeCredentials)
 */
export async function getMemberCredentials(memberId: string): Promise<WebAuthnCredential[]> {
  try {
    const result = await query(
      `SELECT id, member_id, credential_id, public_key, counter, device_type,
              transports, device_name, last_used_at, created_at
       FROM webauthn_credentials
       WHERE member_id = $1 AND revoked = FALSE`,
      [memberId]
    );

    return result.rows.map(row => ({
      id: row.id,
      memberId: row.member_id,
      credentialId: row.credential_id,
      publicKey: row.public_key,
      counter: Number(row.counter),
      deviceType: row.device_type,
      transports: row.transports || [],
      deviceName: row.device_name,
      lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : null,
      createdAt: new Date(row.created_at)
    }));
  } catch (error) {
    console.error('[WebAuthn] Failed to get member credentials:', error);
    return [];
  }
}

/**
 * Get credential by credential ID (for authentication)
 */
export async function getCredentialById(credentialId: string): Promise<WebAuthnCredential | null> {
  try {
    const result = await query(
      `SELECT id, member_id, credential_id, public_key, counter, device_type,
              transports, device_name, last_used_at, created_at
       FROM webauthn_credentials
       WHERE credential_id = $1 AND revoked = FALSE`,
      [credentialId]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      memberId: row.member_id,
      credentialId: row.credential_id,
      publicKey: row.public_key,
      counter: Number(row.counter),
      deviceType: row.device_type,
      transports: row.transports || [],
      deviceName: row.device_name,
      lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : null,
      createdAt: new Date(row.created_at)
    };
  } catch (error) {
    console.error('[WebAuthn] Failed to get credential:', error);
    return null;
  }
}

/**
 * Generate registration options for a new passkey
 */
export async function createRegistrationOptions(
  memberId: string,
  username: string,
  displayName: string
): Promise<ReturnType<typeof generateRegistrationOptions>> {
  // Get existing credentials to exclude
  const existingCredentials = await getMemberCredentials(memberId);

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userID: new TextEncoder().encode(memberId),
    userName: username,
    userDisplayName: displayName,
    attestationType: 'none', // We don't need attestation for this use case
    excludeCredentials: existingCredentials.map(cred => ({
      id: cred.credentialId,
      transports: cred.transports,
    })),
    authenticatorSelection: {
      // 'required': the credential MUST be discoverable (resident) so a usernameless
      // "Continue with Face ID" login can find it. 'preferred' let iOS store a
      // non-discoverable credential that empty-allowCredentials auth could never
      // surface — the root cause of 7 enrolled / 0 authenticated.
      residentKey: 'required',
      // 'required': force the biometric/user-verification gesture — this is what
      // makes it Face ID / Touch ID rather than a silent assertion.
      userVerification: 'required',
      authenticatorAttachment: 'platform', // Prefer built-in (Face ID, Touch ID)
    },
    timeout: CHALLENGE_TIMEOUT_MS,
  });

  // Store challenge for verification
  storeChallenge(memberId, options.challenge);

  return options;
}

/**
 * Verify registration response and save credential
 */
export async function verifyRegistration(
  memberId: string,
  response: RegistrationResponseJSON,
  deviceName?: string
): Promise<{ verified: boolean; error?: string; credentialId?: string }> {
  const expectedChallenge = consumeChallenge(memberId);
  if (!expectedChallenge) {
    return { verified: false, error: 'Challenge expired or not found' };
  }

  let verification: VerifiedRegistrationResponse;
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });
  } catch (error) {
    console.error('[WebAuthn] Registration verification failed:', error);
    return { verified: false, error: 'Verification failed' };
  }

  if (!verification.verified || !verification.registrationInfo) {
    return { verified: false, error: 'Verification failed' };
  }

  const { credential, credentialDeviceType } = verification.registrationInfo;

  // Save credential to database
  try {
    // credential.id is ALREADY a Base64URLString in @simplewebauthn/server v13 — store it as-is.
    // Do NOT re-encode: Buffer.from(<string>).toString('base64url') double-encodes it, so the stored
    // value never matches response.id at login (getCredentialById) → CREDENTIAL_NOT_FOUND on every sign-in.
    const credentialIdBase64 = credential.id;
    const publicKeyBase64 = Buffer.from(credential.publicKey).toString('base64');

    await query(
      `INSERT INTO webauthn_credentials (
        member_id, credential_id, public_key, counter, device_type, transports, device_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        memberId,
        credentialIdBase64,
        publicKeyBase64,
        credential.counter,
        credentialDeviceType === 'singleDevice' ? 'platform' : 'cross-platform',
        response.response.transports || [],
        deviceName || null
      ]
    );

    // Update member's has_webauthn flag
    await query(
      `UPDATE members SET has_webauthn = TRUE WHERE id = $1`,
      [memberId]
    );

    return { verified: true, credentialId: credentialIdBase64 };
  } catch (error) {
    console.error('[WebAuthn] Failed to save credential:', error);
    return { verified: false, error: 'Failed to save credential' };
  }
}

/**
 * Generate authentication options (for signin)
 */
export async function createAuthenticationOptions(
  memberId?: string
): Promise<{ options: Awaited<ReturnType<typeof generateAuthenticationOptions>>; challengeKey: string }> {
  let allowCredentials: { id: string; transports?: AuthenticatorTransportFuture[] }[] = [];

  if (memberId) {
    const credentials = await getMemberCredentials(memberId);
    allowCredentials = credentials.map(cred => ({
      id: cred.credentialId,
      transports: cred.transports,
    }));
  }

  // Diagnostic: separates "not tapped" from "tapped and failed". An empty
  // allowCredentials means we're relying on a discoverable/resident credential
  // (usernameless flow) — the path that silently returned nothing pre-fix.
  if (allowCredentials.length === 0) {
    console.log(`[WebAuthn] auth options: empty allowCredentials (discoverable flow), memberId=${memberId ? 'known' : 'none'}`);
  } else {
    console.log(`[WebAuthn] auth options: ${allowCredentials.length} allowCredentials for known member`);
  }

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
    // 'required': the assertion must carry a user-verification (biometric) flag.
    userVerification: 'required',
    timeout: CHALLENGE_TIMEOUT_MS,
  });

  // Store challenge - use 'anonymous' if no member ID (discoverable credential flow)
  const challengeKey = memberId || `anon_${options.challenge.substring(0, 16)}`;
  storeChallenge(challengeKey, options.challenge);

  return { options, challengeKey };
}

/**
 * Verify authentication response
 */
export async function verifyAuthentication(
  challengeKey: string,
  response: AuthenticationResponseJSON
): Promise<{
  verified: boolean;
  error?: string;
  memberId?: string;
  credentialId?: string;
}> {
  const expectedChallenge = consumeChallenge(challengeKey);
  if (!expectedChallenge) {
    return { verified: false, error: 'Challenge expired or not found' };
  }

  // Get the credential
  const credentialIdBase64 = response.id;
  const credential = await getCredentialById(credentialIdBase64);

  if (!credential) {
    return { verified: false, error: 'Credential not found' };
  }

  let verification: VerifiedAuthenticationResponse;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: credential.credentialId,
        publicKey: Buffer.from(credential.publicKey, 'base64'),
        counter: credential.counter,
        transports: credential.transports,
      },
    });
  } catch (error) {
    console.error('[WebAuthn] Authentication verification failed:', error);
    return { verified: false, error: 'Verification failed' };
  }

  if (!verification.verified) {
    return { verified: false, error: 'Verification failed' };
  }

  // Update counter to prevent replay attacks
  try {
    await query(
      `UPDATE webauthn_credentials
       SET counter = $1, last_used_at = NOW()
       WHERE id = $2`,
      [verification.authenticationInfo.newCounter, credential.id]
    );
  } catch (error) {
    console.error('[WebAuthn] Failed to update counter:', error);
    // Don't fail auth for counter update failure
  }

  return {
    verified: true,
    memberId: credential.memberId,
    credentialId: credential.credentialId
  };
}

/**
 * Revoke a credential
 */
export async function revokeCredential(
  credentialId: string,
  memberId: string
): Promise<boolean> {
  try {
    const result = await query(
      `UPDATE webauthn_credentials
       SET revoked = TRUE, revoked_at = NOW()
       WHERE credential_id = $1 AND member_id = $2`,
      [credentialId, memberId]
    );

    // Check if member has any remaining credentials
    const remaining = await query(
      `SELECT COUNT(*) as count FROM webauthn_credentials
       WHERE member_id = $1 AND revoked = FALSE`,
      [memberId]
    );

    if (Number(remaining.rows[0].count) === 0) {
      await query(
        `UPDATE members SET has_webauthn = FALSE WHERE id = $1`,
        [memberId]
      );
    }

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('[WebAuthn] Failed to revoke credential:', error);
    return false;
  }
}

/**
 * Rename a credential
 */
export async function renameCredential(
  credentialId: string,
  memberId: string,
  newName: string
): Promise<boolean> {
  try {
    const result = await query(
      `UPDATE webauthn_credentials
       SET device_name = $1
       WHERE credential_id = $2 AND member_id = $3 AND revoked = FALSE`,
      [newName, credentialId, memberId]
    );
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('[WebAuthn] Failed to rename credential:', error);
    return false;
  }
}
