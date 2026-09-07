/**
 * WS2 · PASSKEY ADMISSION — the one predicate that decides who may register.
 *
 * THE INVARIANT (founder ruling, 2026-09-06):
 *
 *   A prefix determines whether a passkey has an ACCEPTABLE FORMAT.
 *   It never determines AUTHORIZATION. Authorization is a real pending,
 *   unexpired invite row.
 *
 * WHY THIS MODULE EXISTS AT ALL. Before this repair, `/api/members/check` and
 * `/api/members/register` each carried their own copy of the admission logic
 * and had drifted: `check` answered `{ isInvite: true, inviteStatus: 'valid' }`
 * for a passkey that merely LOOKED right, and `register` accepted the same one
 * with an explicit `// If no invite found but it's an admin passkey, that's
 * fine - continue`. The invite table was never consulted as authority — on
 * production it held ZERO rows while every member had joined anyway.
 *
 * So the two routes now share ONE function. Repairing the drift without
 * removing the duplication would fix today's divergence and leave tomorrow's
 * free to reappear.
 *
 * THE OLD NAME WAS PART OF THE DEFECT. `isAdminPasskey()` was a FORMAT check
 * wearing an AUTHORIZATION name, and both routes' comments ("admin passkeys",
 * "always allowed") reinforced the wrong reading. A later reader repairing
 * "admission" would look for an authorization bug and find none, because the
 * bug was a format predicate standing where an authorization predicate should
 * be. `hasAcceptedPasskeyFormat` says what it does.
 *
 * ⛔ NO BOOTSTRAP EXCEPTION. `inviteConfig.foundingPasskeys` exists but has
 * zero callers and is an exact-match list, not a prefix rule; zero callers
 * means it is not authority. Production evidence showed existing members hold
 * invitation capacity (invites_remaining = 10, no cooling period), so no
 * bootstrap credential is demonstrably necessary and none is granted here.
 */

import { query } from '@/lib/db/postgres';

/**
 * Accepted passkey FORMATS. `generateInvitePasskey()` emits `SOULLAB-…` by
 * design, so a legitimately issued invite satisfies this. The other three are
 * retained because existing member rows carry them; they confer nothing.
 *
 * ⛔ Adding a prefix here widens the FORMAT accepted, never the authority
 * granted. Nothing downstream reads a prefix to decide a role or a tier.
 */
const ACCEPTED_PASSKEY_PREFIXES = ['SOULLAB-', 'MAIA-', 'PIONEER-', 'FOUNDING-'] as const;

/** Format only. Says nothing about whether this passkey may be used. */
export function hasAcceptedPasskeyFormat(passkey: string): boolean {
  const normalized = passkey.toUpperCase();
  return ACCEPTED_PASSKEY_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

/**
 * The admission verdict. Every outcome is named, so a caller cannot treat an
 * absence as a permission — the failure mode this repair exists to close.
 */
export type Admission =
  /** Already a member: this is a returning person, not an admission question. */
  | { kind: 'existing_member'; member: Record<string, unknown> }
  /** A real pending, unexpired invite. The ONLY state that admits. */
  | { kind: 'admit'; inviteId: string; createdBy: string | null; inviterUsername: string | null; inviterName: string | null }
  /** The passkey does not look like one of ours. */
  | { kind: 'refused'; reason: 'bad_format' }
  /** Correct shape, but no invite was ever issued for it. THE BYPASS, CLOSED. */
  | { kind: 'refused'; reason: 'no_invite' }
  /** An invite exists but has been used, revoked, or otherwise moved on. */
  | { kind: 'refused'; reason: 'invite_not_pending'; status: string }
  /** An invite exists and its time has passed. */
  | { kind: 'refused'; reason: 'invite_expired' }
  /**
   * The invites table could not be consulted. FAIL CLOSED. The old code
   * swallowed this and admitted anyway — bootstrap tolerance from before the
   * table existed. It exists now, so an unreadable invite table is an outage,
   * not a licence.
   */
  | { kind: 'refused'; reason: 'invite_lookup_unavailable' };

/**
 * Resolve admission for a passkey. ONE query path, shared by `check` and
 * `register`, so the two can never again disagree about who may join.
 *
 * Order matters: an existing member is answered before any invite question,
 * because a returning person is not being admitted.
 */
export async function resolveAdmission(rawPasskey: string): Promise<Admission> {
  const passkey = rawPasskey.toUpperCase().trim();

  if (!hasAcceptedPasskeyFormat(passkey)) {
    return { kind: 'refused', reason: 'bad_format' };
  }

  const memberResult = await query(
    'SELECT id, username, name, onboarded, onboarding_step FROM members WHERE passkey = $1',
    [passkey],
  );
  if (memberResult.rows.length > 0) {
    return { kind: 'existing_member', member: memberResult.rows[0] as Record<string, unknown> };
  }

  let inviteRows: Record<string, unknown>[];
  try {
    const inviteResult = await query(
      `SELECT i.id, i.status, i.expires_at, i.created_by,
              m.username AS inviter_username, m.name AS inviter_name
         FROM invites i
         LEFT JOIN members m ON i.created_by = m.id
        WHERE i.passkey = $1`,
      [passkey],
    );
    inviteRows = inviteResult.rows as Record<string, unknown>[];
  } catch (error) {
    /* Fail closed, and say which way we failed. An unreadable invite table
       must never read as "no restriction applies". */
    const message = error instanceof Error ? error.message : 'unknown';
    console.error(`[ADMISSION] invite lookup failed: ${message}`);
    return { kind: 'refused', reason: 'invite_lookup_unavailable' };
  }

  if (inviteRows.length === 0) return { kind: 'refused', reason: 'no_invite' };

  const invite = inviteRows[0];
  const status = String(invite.status ?? '');
  if (status !== 'pending') {
    return { kind: 'refused', reason: 'invite_not_pending', status };
  }
  if (invite.expires_at && new Date(invite.expires_at as string) < new Date()) {
    return { kind: 'refused', reason: 'invite_expired' };
  }

  return {
    kind: 'admit',
    inviteId: String(invite.id),
    createdBy: (invite.created_by as string | null) ?? null,
    inviterUsername: (invite.inviter_username as string | null) ?? null,
    inviterName: (invite.inviter_name as string | null) ?? null,
  };
}

/** Member-facing wording for each refusal. One place, so the two routes agree. */
export function admissionRefusalMessage(reason: Exclude<Admission, { kind: 'existing_member' } | { kind: 'admit' }>['reason']): string {
  switch (reason) {
    case 'bad_format':
    case 'no_invite':
      return 'Invalid passkey. Contact support for a valid passkey.';
    case 'invite_not_pending':
      return 'This invite has already been used.';
    case 'invite_expired':
      return 'This invite has expired. Please request a new one.';
    case 'invite_lookup_unavailable':
      return 'We could not check this passkey just now. Please try again shortly.';
  }
}
