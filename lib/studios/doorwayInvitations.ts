/**
 * Studio doorway invitations (STUDIO-A-LA-CARTE-01 Phase 3; invitation gate chosen by the founder 2026-11-13).
 *
 * An invitation lets a person create a normal member account at a Studio's own door. It never admits them into the
 * Studio: that Studio's own gate still decides. Only the SHA-256 hash of a code is stored.
 */
import { createHash, randomBytes } from 'crypto';
import type { DoorwayId } from './doorways';

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L

/** A new human-typable code, e.g. WRITER-7KQ2-M9XD-4HTP (60 random bits from crypto, never Math.random). */
export function generateInvitationCode(studio: DoorwayId): string {
  const bytes = randomBytes(12);
  let body = '';
  for (let i = 0; i < 12; i++) body += ALPHABET[bytes[i] % ALPHABET.length];
  return `${studio.toUpperCase()}-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}`;
}

/** Case, spaces and dashes do not matter when a person types a code. */
export function normalizeInvitationCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function hashInvitationCode(raw: string): string {
  return createHash('sha256').update(normalizeInvitationCode(raw)).digest('hex');
}

/**
 * The atomic claim. In one statement it takes a use only if the code exists for THIS studio, is not revoked, not
 * expired and not used up, so two people racing for the last use cannot both get it. Returns the invitation id or null.
 * Run inside the same transaction as the member insert so a failed sign-up gives the use back.
 */
export const CLAIM_INVITATION_SQL = `
  UPDATE studio_doorway_invitations
     SET uses = uses + 1
   WHERE code_hash = $1
     AND studio = $2
     AND revoked_at IS NULL
     AND expires_at > now()
     AND uses < max_uses
  RETURNING id`;
