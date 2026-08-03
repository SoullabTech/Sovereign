/**
 * PHI accessor — shared offering snapshots.
 *
 * `coach_client_shared_items.snapshot_enc` holds a person's own words about
 * their own life, placed deliberately into a working relationship. It is
 * encrypted from birth: the table has no plaintext sibling column, so there is
 * nothing to dual-write and nothing to fall back to. Reads decrypt or they fail.
 *
 * The additional authenticated data binds ciphertext to the row id and the
 * member who authored it. A snapshot therefore cannot be lifted out of one
 * offering and replayed inside another, nor reattributed to a different person
 * — it simply will not decrypt.
 *
 * Title and body travel together inside one ciphertext. Splitting them into two
 * columns would leak the title in plaintext to anyone reading a backup, and a
 * title is often the most revealing line a person writes.
 */

import { encryptForDB, decryptFromDB, type PHIContext, type PHIEncryptionMeta } from '@/lib/security/phiEncryption';

const TABLE = 'coach_client_shared_items';
const COLUMN = 'snapshot_enc';

/** What the member declared, at the moment they declared it. */
export interface OfferingSnapshot {
  /** How the member named it. May be empty — not everything worth bringing has a title. */
  title: string;
  /** The material itself, in the member's words. */
  body: string;
}

export interface OfferingPHIContext {
  /** coach_client_shared_items.id — the row must exist before encrypting (AAD binds to it). */
  rowId: string;
  /** members.id of the person who brought this forward. */
  memberId: string;
}

function buildContext(ctx: OfferingPHIContext): PHIContext {
  return { table: TABLE, column: COLUMN, rowId: ctx.rowId, ownerId: ctx.memberId };
}

export function encryptOfferingSnapshot(
  snapshot: OfferingSnapshot,
  ctx: OfferingPHIContext
): { ciphertext: string; meta: string } {
  const { ciphertext, meta } = encryptForDB(JSON.stringify(snapshot), buildContext(ctx));
  return { ciphertext, meta: JSON.stringify(meta) };
}

/**
 * Decrypt for an already-authorized reader. This function performs NO
 * authorization of its own — holding ciphertext is not standing to read it, and
 * pretending otherwise here would put the access decision in the wrong layer.
 * Callers must have resolved a relationship grant first.
 */
export function decryptOfferingSnapshot(
  ciphertext: string,
  meta: PHIEncryptionMeta | string,
  ctx: OfferingPHIContext
): OfferingSnapshot {
  const parsed: PHIEncryptionMeta = typeof meta === 'string' ? JSON.parse(meta) : meta;
  const plaintext = decryptFromDB(ciphertext, parsed, buildContext(ctx));
  return JSON.parse(plaintext) as OfferingSnapshot;
}
