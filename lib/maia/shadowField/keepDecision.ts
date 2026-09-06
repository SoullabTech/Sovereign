/**
 * Shadow Field — the keep decision (MAIA-SHADOW-FIELD-01 · P4 / P4-C1).
 *
 * A pure function so that the refusals can be PROVEN on the same code the route runs,
 * rather than on a copy of its reasoning. The route decides nothing on its own: it resolves
 * server state, calls this, and either writes or returns the refusal.
 *
 * Sanctuary arrives here as `serverSanctuary`, taken from the server-held Field session.
 * There is deliberately NO client sanctuary parameter — a forged request has nothing to
 * assert with.
 */

export type KeepKind = 'experience' | 'question' | 'pattern' | 'practice';
export const KEEP_KINDS: readonly KeepKind[] = ['experience', 'question', 'pattern', 'practice'];

/**
 * Authorship of the text offered for keeping. A MAIA POSSIBILITY is not representable:
 * there is no variant that carries one (constitution C1 — only the member's own distinct
 * interpretation is keep-eligible, never the possibility it answered).
 */
export type KeepAuthorship =
  | { readonly authoredBy: 'member' }
  | { readonly authoredBy: 'maia_proposed'; readonly acceptedByMember: boolean };

export interface KeepClaim {
  readonly kind?: unknown;
  readonly text?: unknown;
  readonly authorship?: unknown;
  readonly title?: unknown;
}

export type KeepRefusalReason =
  | 'no_field_session'
  | 'sanctuary'
  | 'maia_possibility_not_keepable'
  | 'wording_not_accepted'
  | 'invalid_kind'
  | 'empty';

export type KeepDecision =
  | { readonly allow: true; readonly kind: KeepKind; readonly title: string; readonly body: string }
  | { readonly allow: false; readonly reason: KeepRefusalReason; readonly text: string };

function refuse(reason: KeepRefusalReason, text: string): KeepDecision {
  return { allow: false, reason, text };
}

/**
 * @param claim          what the client is asking to keep
 * @param serverSession  the server-held Field session, or null if none could be verified
 */
export function decideKeep(
  claim: KeepClaim,
  serverSession: { readonly sanctuary: boolean } | null,
): KeepDecision {
  // 1. No verified Field sitting ⇒ nothing to keep. Fail closed: unknown, expired, foreign
  //    and closed tokens all land here.
  if (!serverSession) {
    return refuse('no_field_session', 'There is nothing here to keep.');
  }

  // 2. SANCTUARY — from the server, never from the request. This is the persistence
  //    boundary itself refusing, so a forged claim of non-Sanctuary cannot pass.
  if (serverSession.sanctuary === true) {
    return refuse(
      'sanctuary',
      "This session isn't being kept. Nothing from it is stored, including this.",
    );
  }

  // 3. Only member-authored material. A MAIA reading is never keepable — including after
  //    the member has taken it up, which creates their OWN distinct interpretation (C1).
  const authorship = claim.authorship as { authoredBy?: unknown; acceptedByMember?: unknown };
  if (!authorship || typeof authorship !== 'object') {
    return refuse('maia_possibility_not_keepable', 'Only your own words can be kept.');
  }
  const authoredBy = authorship.authoredBy;
  if (authoredBy !== 'member' && authoredBy !== 'maia_proposed') {
    return refuse('maia_possibility_not_keepable', 'Only your own words can be kept.');
  }

  // 4. Wording I proposed is kept only after the member accepts it, explicitly, before write.
  if (authoredBy === 'maia_proposed' && authorship.acceptedByMember !== true) {
    return refuse(
      'wording_not_accepted',
      'I can suggest wording, but you have to accept it before anything is kept.',
    );
  }

  const kind = claim.kind;
  if (typeof kind !== 'string' || !KEEP_KINDS.includes(kind as KeepKind)) {
    return refuse('invalid_kind', 'Nothing was kept.');
  }

  const text = typeof claim.text === 'string' ? claim.text.trim() : '';
  if (!text) return refuse('empty', 'There is nothing written to keep.');

  // Title is the member's own words — theirs, or the opening of their text. MAIA does not
  // author a title for Shadow Field material.
  const title =
    typeof claim.title === 'string' && claim.title.trim()
      ? claim.title.trim().slice(0, 120)
      : text.slice(0, 80);

  return { allow: true, kind: kind as KeepKind, title, body: text };
}
