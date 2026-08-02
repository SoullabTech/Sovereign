/**
 * Coach Field — Axis 3: the client-declared position, shared only by explicit member act.
 *
 * FOUNDER RULING C3 (2026-08-02), option (ii) — the prohibition is NARROWED, not repealed:
 *
 *   "A practitioner may not read a member's self-declared program position merely because
 *    the practitioner administers the program. The member may explicitly share that
 *    declaration with the practitioner, item by item or as an ongoing surface preference."
 *
 *   "Larry may invite the client to share where they feel they are.
 *    He may not inspect it by administrative right."
 *
 * WHAT THIS MODULE DELIBERATELY DOES NOT CONTAIN
 * ----------------------------------------------
 * There is no function here — and none may be added — that reads `field_program_positions`
 * keyed by practitioner. The practitioner-facing read below queries `coach_position_shares`
 * ONLY: a separate table of member-authored snapshots. `field_program_positions` keeps its
 * original rule (`catalog spec §8`) completely intact; sharing produces a NEW record rather
 * than widening an existing join. If a future caller needs "what does Larry see", the answer
 * is always and only `listSharedPositionsForPractitioner`.
 *
 * THE SIX SHARING RULES (founder, verbatim intent) and where each is enforced:
 *   1. preserve the client's exact wording      → declared_position snapshot (never a live join)
 *   2. preserve who authored it and when        → stated_by + declared_at carried onto the share
 *   3. show Larry it is client-declared         → stated_by returned on every practitioner read
 *   4. stop future sharing without deleting     → consent mode 'off'; existing shares untouched
 *   5. never silently expose earlier privates   → FORWARD-ONLY: see `shareOngoingIfConsented`
 *   6. sharing ≠ broader Field access           → no other read in this codebase keys off consent
 */

import { query } from '@/lib/db/postgres';
import { CoachFieldAccessError } from './access';

export type ShareMode = 'off' | 'ongoing';
export type StatedBy = 'member_confirmed' | 'member_stated' | 'practitioner_seeded';

export interface SharedPosition {
  id: string;
  client_member_id: string;
  field_slug: string;
  program_slug: string;
  /** The client's EXACT wording at the moment of sharing. */
  declared_position: string;
  /** Always surfaced so Larry sees this is client-declared, not practitioner-assessed. */
  stated_by: StatedBy;
  declared_at: string | Date | null;
  shared_at: string | Date;
  share_origin: 'item' | 'ongoing';
  withdrawn_at: string | Date | null;
}

const sanitizeSlug = (v: unknown): string =>
  typeof v === 'string' ? v.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 64) : '';

/**
 * The member's own view of what they are sharing, and with whom.
 * Client-keyed: a practitioner cannot call this for someone else.
 */
export async function getConsent(input: {
  clientMemberId: string;
  practitionerMemberId: string;
  fieldSlug: string;
  programSlug?: string;
}): Promise<{ mode: ShareMode; effectiveFrom: string | Date | null }> {
  const { rows } = await query<any>(
    `SELECT mode, effective_from FROM coach_position_share_consents
      WHERE client_member_id = $1 AND practitioner_member_id = $2
        AND field_slug = $3 AND program_slug = $4`,
    [
      input.clientMemberId,
      input.practitionerMemberId,
      sanitizeSlug(input.fieldSlug),
      sanitizeSlug(input.programSlug) || 'general',
    ],
  );
  if (!rows.length) return { mode: 'off', effectiveFrom: null };
  return { mode: rows[0].mode, effectiveFrom: rows[0].effective_from };
}

/**
 * The member sets or clears their standing preference. Member-authored ONLY — the
 * practitioner id is a target, never the caller's credential.
 *
 * RULE 5 — turning sharing ON is FORWARD-ONLY. `effective_from` is stamped at the moment
 * of consent and no backfill of prior declarations occurs anywhere in this module. A
 * declaration the member made privately last month stays private; only declarations made
 * or re-confirmed after this instant will ever be shared.
 *
 * RULE 4 — turning sharing OFF writes mode='off' and touches no `coach_position_shares`
 * row. What was already shared remains shared (and remains withdrawable item by item);
 * what has not yet been shared never will be.
 */
export async function setConsent(input: {
  clientMemberId: string;
  practitionerMemberId: string;
  fieldSlug: string;
  programSlug?: string;
  mode: ShareMode;
}): Promise<{ mode: ShareMode }> {
  if (input.mode !== 'off' && input.mode !== 'ongoing') {
    throw new CoachFieldAccessError('mode must be "off" or "ongoing".', 422);
  }
  const field = sanitizeSlug(input.fieldSlug);
  if (!field) throw new CoachFieldAccessError('fieldContext is required.', 422);
  const program = sanitizeSlug(input.programSlug) || 'general';

  await query(
    `INSERT INTO coach_position_share_consents
       (client_member_id, practitioner_member_id, field_slug, program_slug, mode, effective_from)
     VALUES ($1,$2,$3,$4,$5,NOW())
     ON CONFLICT (client_member_id, practitioner_member_id, field_slug, program_slug)
     DO UPDATE SET mode = EXCLUDED.mode,
                   -- Re-stamped on every change: re-enabling after a pause is still
                   -- forward-only from the NEW moment, never from the original one.
                   effective_from = NOW(),
                   updated_at = NOW()`,
    [input.clientMemberId, input.practitionerMemberId, field, program, input.mode],
  );
  return { mode: input.mode };
}

/**
 * ITEM-BY-ITEM share: the member shares one declaration, right now, regardless of mode.
 *
 * The wording is passed in and snapshotted. We do NOT read it back out of
 * `field_program_positions` and join it live — a later private edit must not
 * retroactively change what the practitioner was shown.
 */
export async function shareDeclaredPosition(input: {
  clientMemberId: string;
  practitionerMemberId: string;
  fieldSlug: string;
  programSlug?: string;
  declaredPosition: string;
  statedBy: StatedBy;
  declaredAt?: string | Date | null;
  origin?: 'item' | 'ongoing';
}): Promise<SharedPosition> {
  const text = input.declaredPosition?.trim();
  if (!text) throw new CoachFieldAccessError('Nothing to share.', 422);
  if (text.length > 300) throw new CoachFieldAccessError('That is too long to share.', 422);

  const { rows } = await query<SharedPosition>(
    `INSERT INTO coach_position_shares
       (client_member_id, practitioner_member_id, field_slug, program_slug,
        declared_position, stated_by, declared_at, share_origin)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      input.clientMemberId,
      input.practitionerMemberId,
      sanitizeSlug(input.fieldSlug),
      sanitizeSlug(input.programSlug) || 'general',
      text,
      input.statedBy,
      input.declaredAt ?? null,
      input.origin ?? 'item',
    ],
  );
  return rows[0];
}

/**
 * Called on the member's own declaration path (when they state or confirm a position),
 * AFTER the position has been written. If — and only if — a standing consent is on and
 * was granted BEFORE this declaration, the declaration is also shared.
 *
 * This is the only automatic write in the module, and it is not a promotion: the member
 * performed two explicit acts (declaring a position, and earlier turning sharing on).
 * Nothing is inferred from behaviour, and nothing already private is swept forward.
 */
export async function shareOngoingIfConsented(input: {
  clientMemberId: string;
  practitionerMemberId: string;
  fieldSlug: string;
  programSlug?: string;
  declaredPosition: string;
  statedBy: StatedBy;
  declaredAt?: string | Date | null;
}): Promise<SharedPosition | null> {
  const consent = await getConsent(input);
  if (consent.mode !== 'ongoing') return null;

  // Forward-only guard, belt and braces: a declaration that predates the consent is
  // never shared, even if a caller passes an old declaredAt.
  if (input.declaredAt && consent.effectiveFrom) {
    if (new Date(input.declaredAt) < new Date(consent.effectiveFrom)) return null;
  }
  return shareDeclaredPosition({ ...input, origin: 'ongoing' });
}

/**
 * Member withdraws one shared declaration from FUTURE display.
 * The row survives (append-only trigger) — the historical fact that it was shared stands.
 */
export async function withdrawShare(input: {
  clientMemberId: string;
  shareId: string;
}): Promise<void> {
  const { rowCount } = await query(
    `UPDATE coach_position_shares
        SET withdrawn_at = NOW()
      WHERE id = $1 AND client_member_id = $2 AND withdrawn_at IS NULL`,
    [input.shareId, input.clientMemberId],
  );
  if (!rowCount) throw new CoachFieldAccessError('No such share.', 404);
}

/**
 * THE ONLY practitioner-facing read of a client's declared position.
 *
 * Reads `coach_position_shares` — never `field_program_positions`. Every row returned got
 * here through an explicit member act. `stated_by` travels with it so the UI can always
 * label it client-declared rather than letting it read as an assessment.
 */
export async function listSharedPositionsForPractitioner(input: {
  practitionerMemberId: string;
  clientMemberId: string;
}): Promise<SharedPosition[]> {
  const { rows } = await query<SharedPosition>(
    `SELECT * FROM coach_position_shares
      WHERE practitioner_member_id = $1
        AND client_member_id = $2
        AND withdrawn_at IS NULL
      ORDER BY shared_at DESC
      LIMIT 25`,
    [input.practitionerMemberId, input.clientMemberId],
  );
  return rows;
}

/** The member's own record of what they have shared — so they can see and withdraw it. */
export async function listOwnShares(clientMemberId: string): Promise<SharedPosition[]> {
  const { rows } = await query<SharedPosition>(
    `SELECT * FROM coach_position_shares
      WHERE client_member_id = $1
      ORDER BY shared_at DESC
      LIMIT 50`,
    [clientMemberId],
  );
  return rows;
}
