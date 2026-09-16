import { createHash } from 'node:crypto';

/** Domain separation prevents an invite lookup digest from being reused as a
 * generic credential fingerprint elsewhere in the system. */
const INVITE_HASH_DOMAIN = 'soullab-invite-v1:';

export const STRONG_INVITE_PATTERN = /^SOULLAB-[23456789ABCDEFGHJKMNPQRSTVWXYZ]{5}-[23456789ABCDEFGHJKMNPQRSTVWXYZ]{5}-[23456789ABCDEFGHJKMNPQRSTVWXYZ]{4}$/;

export function normalizeInvitePasskey(raw: string): string {
  return raw.trim().toUpperCase();
}

export function hashInvitePasskey(raw: string): string {
  return createHash('sha256')
    .update(INVITE_HASH_DOMAIN + normalizeInvitePasskey(raw), 'utf8')
    .digest('hex');
}

export function isStrongInvitePasskey(raw: string): boolean {
  return STRONG_INVITE_PATTERN.test(normalizeInvitePasskey(raw));
}
