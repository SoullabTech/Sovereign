/**
 * Invite QR Code Service
 *
 * Generates QR codes for inviting new users to Soullab.
 * The QR code contains a URL that takes them directly to onboarding
 * with their passkey pre-filled.
 *
 * Flow:
 * 1. Practitioner/admin generates QR code for a passkey
 * 2. New user scans QR with phone camera
 * 3. Opens https://soullab.life/begin?passkey=SOULLAB-XYZ
 * 4. User proceeds through onboarding with passkey pre-populated
 */

/**
 * Build the invite URL for a passkey
 */
export function buildInviteUrl(
  passkey: string,
  baseUrl: string = 'https://soullab.life'
): string {
  const encodedPasskey = encodeURIComponent(passkey);
  return `${baseUrl}/begin?passkey=${encodedPasskey}`;
}

/**
 * Build the invite URL with optional referrer tracking
 */
export function buildInviteUrlWithReferrer(
  passkey: string,
  referrerSlug?: string,
  baseUrl: string = 'https://soullab.life'
): string {
  const encodedPasskey = encodeURIComponent(passkey);
  let url = `${baseUrl}/begin?passkey=${encodedPasskey}`;

  if (referrerSlug) {
    url += `&ref=${encodeURIComponent(referrerSlug)}`;
  }

  return url;
}

/**
 * Parse an invite URL to extract the passkey
 */
export function parseInviteUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('passkey');
  } catch {
    return null;
  }
}

/**
 * Validate passkey format
 * Format: SOULLAB-NAME or other valid patterns
 */
export function isValidPasskey(passkey: string): boolean {
  if (!passkey || passkey.length < 3) return false;

  // Allow SOULLAB-* format
  if (/^SOULLAB-[A-Z0-9-]+$/i.test(passkey)) return true;

  // Allow universal/beta keys
  if (/^[A-Z0-9-]{6,}$/i.test(passkey)) return true;

  return false;
}

/**
 * Generate a new passkey in SOULLAB-NAME format
 */
export function generatePasskey(name: string): string {
  // Clean the name: uppercase, remove special chars, limit length
  const cleanName = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 12);

  // Add random suffix if name is too short or common
  if (cleanName.length < 3) {
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SOULLAB-${suffix}`;
  }

  return `SOULLAB-${cleanName}`;
}

/**
 * Generate a unique passkey with random suffix
 */
export function generateUniquePasskey(baseName: string): string {
  const cleanName = baseName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);

  const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();

  return `SOULLAB-${cleanName || 'GIFT'}-${suffix}`;
}

/**
 * Invite QR data structure
 */
export interface InviteQrData {
  passkey: string;
  url: string;
  recipientName?: string;
  recipientEmail?: string;
  gifterName?: string;
  createdAt: string;
}

/**
 * Create invite QR data for a gift passkey
 */
export function createInviteQrData(
  passkey: string,
  options?: {
    recipientName?: string;
    recipientEmail?: string;
    gifterName?: string;
    referrerSlug?: string;
    baseUrl?: string;
  }
): InviteQrData {
  const baseUrl = options?.baseUrl || 'https://soullab.life';
  const url = options?.referrerSlug
    ? buildInviteUrlWithReferrer(passkey, options.referrerSlug, baseUrl)
    : buildInviteUrl(passkey, baseUrl);

  return {
    passkey,
    url,
    recipientName: options?.recipientName,
    recipientEmail: options?.recipientEmail,
    gifterName: options?.gifterName,
    createdAt: new Date().toISOString()
  };
}
