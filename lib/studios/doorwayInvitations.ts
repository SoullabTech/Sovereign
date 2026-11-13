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

/** Emails compare trimmed and lower-cased. Only this hash is stored with an invitation, never the address. */
export function normalizeInvitedEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function hashInvitedEmail(raw: string): string {
  return createHash('sha256').update(normalizeInvitedEmail(raw)).digest('hex');
}

/**
 * The atomic claim. In one statement it takes a use only if the code exists for THIS studio, was sent to THIS email,
 * is not revoked, not expired and not used up, so two people racing for the last use cannot both get it, and an
 * invitation cannot be used to register someone else's address. Returns the invitation id or no row.
 * Run inside the same transaction as the member insert so a failed sign-up gives the use back.
 */
export const CLAIM_INVITATION_SQL = `
  UPDATE studio_doorway_invitations
     SET uses = uses + 1
   WHERE code_hash = $1
     AND studio = $2
     AND email_sha256 = $3
     AND revoked_at IS NULL
     AND expires_at > now()
     AND uses < max_uses
     AND (beta_grant_until IS NULL OR beta_grant_until > now())
  RETURNING id, beta_grant_until, beta_grant_cohort, issuer_member_id, grants_writers_studio`;

/**
 * Writes the dated Writer's Studio beta grant an invitation carries (founder choice 2026-11-13), inside the same
 * transaction as the member insert. Admission and Pro then follow from that grant through the one seam
 * (writersStudioBetaAccess), so the member gets the same decision at writer.soullab.life and from soullab.life Home.
 */
export const GRANT_FROM_INVITATION_SQL = `
  INSERT INTO writers_studio_beta_grant_events (member_id, action, expires_at, cohort, actor_member_id, reason)
  VALUES ($1, 'grant', $2, $3, $4, $5)`;
