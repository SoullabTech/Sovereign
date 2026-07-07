/**
 * Invite System Configuration
 *
 * Controls invite limits, cooling periods, and expiration.
 */

export const inviteConfig = {
  /** Number of invites new members start with */
  initialInvites: 10,

  /** Days before new members can start inviting */
  coolingPeriodDays: 7,

  /** Days until an unused invite expires */
  inviteExpirationDays: 30,

  /** Invite tiers and their limits */
  tiers: {
    /** Founding members (early beta testers) - generous allocation */
    founding: {
      initialInvites: 100,
      coolingPeriodDays: 0, // No waiting
    },
    /** Standard members */
    standard: {
      initialInvites: 10,
      coolingPeriodDays: 7,
    },
    /** Members who've earned bonus invites */
    earned: {
      bonusInvites: 5, // Added on top of remaining
    },
  },

  /**
   * Passkeys that automatically grant founding tier
   * These are special passkeys for VIP testers and their invitees
   * Format: INVITE-[SERIES]-[NUMBER]
   */
  foundingPasskeys: [
    // Direct VIP passkeys
    'SOULLAB-CATH',
    'SOULLAB-RYAN',
    // Luminary series - for Cath's VIP network
    'INVITE-LUMINARY-1', 'INVITE-LUMINARY-2', 'INVITE-LUMINARY-3', 'INVITE-LUMINARY-4', 'INVITE-LUMINARY-5',
    'INVITE-LUMINARY-6', 'INVITE-LUMINARY-7', 'INVITE-LUMINARY-8', 'INVITE-LUMINARY-9', 'INVITE-LUMINARY-10',
  ],

  /** Words used to generate memorable passkeys */
  passkeyWords: [
    // Consciousness-themed words
    'AURORA', 'BEACON', 'CIPHER', 'DAWN', 'EMBER',
    'FLUX', 'GLYPH', 'HELIX', 'IRIS', 'JADE',
    'KARMA', 'LOTUS', 'MUSE', 'NEXUS', 'ORACLE',
    'PRISM', 'QUEST', 'RUNE', 'SAGE', 'TIDE',
    'UNITY', 'VORTEX', 'WAVE', 'XENON', 'YOGA', 'ZENITH',
    // Nature words
    'ASPEN', 'BIRCH', 'CEDAR', 'DELTA', 'ECHO',
    'FERN', 'GROVE', 'HAVEN', 'IVY', 'JASPER',
    'KELP', 'LUNA', 'MAPLE', 'NOVA', 'OAK',
    'PEARL', 'QUARTZ', 'RIVER', 'STONE', 'TERRA',
    // Abstract concepts
    'AURA', 'BLISS', 'CALM', 'DREAM', 'ESSENCE',
    'FAITH', 'GRACE', 'HOPE', 'INSIGHT', 'JOY',
    'KINDRED', 'LIGHT', 'MYSTIC', 'NORTH', 'ORIGIN',
    'PATH', 'QUIET', 'RADIANCE', 'SPIRIT', 'TRUTH',
  ],
} as const;

/**
 * Crockford-style base32 alphabet for invite tokens — omits ambiguous
 * characters (0 O 1 I L U) so a human can transcribe a passkey without error.
 */
const PASSKEY_ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ'; // 30 symbols
const PASSKEY_BODY_LENGTH = 14; // 30^14 ≈ 68.7 bits of entropy

/**
 * Generate a unique, cryptographically-random passkey for an invite.
 *
 * Keeps the `SOULLAB-` prefix (required by the registration format gate,
 * `isAdminPasskey`) so the invite → register → onboarding mechanism is
 * unchanged, but replaces the old memorable word + 3-digit suffix
 * (~16 bits, Math.random — guessable) with a crypto-random body drawn from
 * Web Crypto (`getRandomValues`, available in every runtime — no import).
 * Uses rejection sampling (`b < max`) to avoid modulo bias. Grouped for
 * readable manual entry: SOULLAB-XXXXX-XXXXX-XXXX.
 */
export function generateInvitePasskey(): string {
  const n = PASSKEY_ALPHABET.length;      // 30
  const max = 256 - (256 % n);            // 240 — reject bytes >= 240 to stay unbiased
  const out: string[] = [];
  while (out.length < PASSKEY_BODY_LENGTH) {
    const bytes = new Uint8Array(PASSKEY_BODY_LENGTH);
    crypto.getRandomValues(bytes);
    for (const b of bytes) {
      if (out.length >= PASSKEY_BODY_LENGTH) break;
      if (b < max) out.push(PASSKEY_ALPHABET[b % n]);
    }
  }
  const body = out.join('');
  return `SOULLAB-${body.slice(0, 5)}-${body.slice(5, 10)}-${body.slice(10)}`;
}

/**
 * Calculate when a new member can start inviting
 */
export function calculateCanInviteAfter(tier: string = 'standard'): Date {
  const tierConfig = inviteConfig.tiers[tier as keyof typeof inviteConfig.tiers] || inviteConfig.tiers.standard;
  const coolingDays = 'coolingPeriodDays' in tierConfig ? tierConfig.coolingPeriodDays : inviteConfig.coolingPeriodDays;

  const canInviteAfter = new Date();
  canInviteAfter.setDate(canInviteAfter.getDate() + coolingDays);
  return canInviteAfter;
}

/**
 * Calculate invite expiration date
 */
export function calculateInviteExpiration(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + inviteConfig.inviteExpirationDays);
  return expiresAt;
}

/**
 * Get initial invite count for a tier
 */
export function getInitialInvites(tier: string = 'standard'): number {
  const tierConfig = inviteConfig.tiers[tier as keyof typeof inviteConfig.tiers];
  if (tierConfig && 'initialInvites' in tierConfig) {
    return tierConfig.initialInvites;
  }
  return inviteConfig.initialInvites;
}

/**
 * Check if a passkey should grant founding tier
 */
export function isFoundingPasskey(passkey: string): boolean {
  const normalized = passkey.toUpperCase();
  return (inviteConfig.foundingPasskeys as readonly string[]).includes(normalized);
}

/**
 * Get the appropriate tier for a passkey
 */
export function getTierForPasskey(passkey: string): 'founding' | 'standard' {
  return isFoundingPasskey(passkey) ? 'founding' : 'standard';
}
