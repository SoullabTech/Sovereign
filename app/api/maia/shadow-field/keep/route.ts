export const dynamic = 'force-dynamic';

/**
 * Shadow Field — the keep act (MAIA-SHADOW-FIELD-01 · PROTOTYPE v1 · P4).
 *
 * THE ONLY SHADOW FIELD PERSISTENCE PATH. Nothing else in the Field writes: the turn
 * route imports no database client at all. Constitution v0.2 L3 / §4, falsifier F8.
 *
 * What may be written (founder P4 ruling 2026-09-06):
 *   source_type        'shadow_field'   — member-authored material explicitly kept
 *   source_id          NULL             — the member's text lives in the atom itself
 *   body               member-authored text, never a MAIA reading
 *   return_preference  'member_pulled'  — the prompt loader does not ambiently retrieve
 *                                         this, so keeping is not background context
 *   provenance / facilitator_id / epistemological_status  untouched (NULL)
 *
 * Four refusals, all before any write:
 *   1. Sanctuary — refused at the persistence boundary, not by hiding a button. A
 *      forged or direct request under Sanctuary creates zero rows.
 *   2. A MAIA POSSIBILITY is not keepable, ever — including after the member has taken
 *      it up. Only the member's own distinct interpretation is (constitution C1).
 *   3. MAIA-proposed wording requires an explicit member acceptance act before the write.
 *   4. No activation act ⇒ no Field ⇒ nothing to keep.
 *
 * Withdrawal never reaches this route: leaving is handled in the turn route and returns
 * before any keep is offered (L6, F14).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { isMemberTester } from '@/lib/auth/tester';
import { shouldPersistKeep } from '@/lib/sanctuary/sanctuaryGuards';
import { query } from '@/lib/db/postgres';
import type { ShadowActivation } from '@/lib/maia/shadowField/types';

/** The five close options. "Leave this entirely here" never reaches this route. */
type KeepKind = 'experience' | 'question' | 'pattern' | 'practice';
const KEEP_KINDS: readonly KeepKind[] = ['experience', 'question', 'pattern', 'practice'];

/**
 * Authorship of the text being kept. A MAIA POSSIBILITY is deliberately not
 * representable here — there is no variant that carries one.
 */
type KeepAuthorship =
  | { readonly authoredBy: 'member' }
  | { readonly authoredBy: 'maia_proposed'; readonly acceptedByMember: true };

interface KeepRequest {
  readonly activation: ShadowActivation;
  readonly sanctuary: boolean;
  readonly kind: KeepKind;
  readonly text: string;
  readonly authorship: KeepAuthorship;
  readonly title?: string;
}

function isMemberActivation(value: unknown): value is ShadowActivation {
  if (!value || typeof value !== 'object') return false;
  const a = value as Record<string, unknown>;
  return (
    a.act === 'member_entered_shadow_field' &&
    a.authoredBy === 'member' &&
    a.participationClass === 'placed'
  );
}

function refuse(reason: string, text: string, status = 409) {
  return NextResponse.json({ kept: false, reason, text }, { status });
}

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session?.memberId) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  const tester = await isMemberTester(session.memberId);
  if (!tester) {
    return NextResponse.json({ error: 'Not available' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Partial<KeepRequest> | null;
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  // 4. Entry is an act — and so is keeping. No Field, nothing to keep.
  if (!isMemberActivation(body.activation)) {
    return refuse('no_activation', 'There is nothing here to keep.');
  }

  // 1. SANCTUARY — the persistence boundary itself refuses. Before any write.
  if (!shouldPersistKeep(body.sanctuary === true)) {
    return refuse(
      'sanctuary',
      "This session isn't being kept. Nothing from it is stored, including this.",
    );
  }

  // 2. A MAIA reading is never keepable. The wire shape cannot express one, and any
  //    attempt to label the text as MAIA's own reading is refused rather than coerced.
  const authorship = body.authorship;
  if (!authorship || typeof authorship !== 'object') {
    return refuse('invalid_authorship', 'Only your own words can be kept.');
  }
  const authoredBy = (authorship as { authoredBy?: unknown }).authoredBy;
  if (authoredBy !== 'member' && authoredBy !== 'maia_proposed') {
    return refuse('maia_possibility_not_keepable', 'Only your own words can be kept.');
  }

  // 3. MAIA-proposed wording requires an explicit acceptance act before the write.
  if (
    authoredBy === 'maia_proposed' &&
    (authorship as { acceptedByMember?: unknown }).acceptedByMember !== true
  ) {
    return refuse(
      'wording_not_accepted',
      'I can suggest wording, but you have to accept it before anything is kept.',
    );
  }

  const kind = body.kind;
  if (!kind || !KEEP_KINDS.includes(kind)) {
    return refuse('invalid_kind', 'Nothing was kept.', 400);
  }

  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (!text) return refuse('empty', 'There is nothing written to keep.', 400);

  // Title is the member's own words — supplied by them, or the opening of their text.
  // MAIA does not author a title for Shadow Field material.
  const title = (typeof body.title === 'string' && body.title.trim())
    ? body.title.trim().slice(0, 120)
    : text.slice(0, 80);

  const result = await query<{ id: string; source_type: string; body: string }>(
    `INSERT INTO member_memory_atoms
       (member_id, source_type, source_id, title, body, return_preference)
     VALUES ($1, 'shadow_field', NULL, $2, $3, 'member_pulled')
     RETURNING id, source_type, body`,
    [session.memberId, title, text],
  );

  const row = result.rows[0];
  return NextResponse.json({
    kept: true,
    id: row.id,
    sourceType: row.source_type,
    kind,
    returnPreference: 'member_pulled',
  });
}
