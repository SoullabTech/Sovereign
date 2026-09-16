import { createHash } from 'node:crypto';

// Must match lib/auth/inviteCredential.ts. A root contract test binds the two.
const INVITE_HASH_DOMAIN = 'soullab-invite-v1:';

export function normalizeInvitePasskey(raw: string): string {
  return raw.trim().toUpperCase();
}

export function hashInvitePasskey(raw: string): string {
  return createHash('sha256')
    .update(INVITE_HASH_DOMAIN + normalizeInvitePasskey(raw), 'utf8')
    .digest('hex');
}
