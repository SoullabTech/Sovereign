/**
 * NW-A02 — Prompt Composition Boundary.
 *
 * NW-A01 audited every channel by which practice-field text reaches MAIA's
 * system prompt and found five ways an unauthorized or unratified sentence
 * could govern the model. This module holds the repairs, in one place, so the
 * boundary is legible rather than scattered across the composition path.
 *
 * The five (founder rulings, 2026-08-26):
 *   1. A field under an active containment does not compose. Containment
 *      previously governed only LIVE status, so a field an explicit governance
 *      act was holding shut still composed for anyone who knew its slug.
 *   2. Composition requires an authorized member↔field relationship. The room
 *      previously took a slug from the request and composed it with no check.
 *   3. `how_maia_supports` may not be an unrestricted parallel instruction
 *      channel alongside the governed `maia_guidance`.
 *   4. `professional_practice` stops composing practitioner prose — the column
 *      is declared for jurisdictional declarations, not biography.
 *   5. `about_practice` / `how_we_work_together` require practitioner
 *      ratification before composing.
 *
 * ⛔ SCOPE: this is deliberately NOT a general authority framework. Corpus keeps
 * `corpusIsComposable()`; `maia_guidance` keeps `validateFieldGuidance()`. Three
 * channels, three questions, three mechanisms — NW-A01 records why one universal
 * gate would be the wrong shape.
 */

import { query } from '@/lib/db/postgres';
import { isWidening } from '@/lib/practiceField/fieldGuidance';
import type { PracticeField } from '@/lib/types/practiceField';
import { AUTHORIZED_FIELD_CONTEXTS } from '@/lib/nowWhat/invitation';

/** Repair 1 — an actively contained field never composes. */
export function isContained(field: Pick<PracticeField, 'containment_status'> | null): boolean {
  return field?.containment_status === 'contained';
}

/** Repair 5 — identity self-description composes only once the practitioner ratified it. */
export function identityIsRatified(
  field: Pick<PracticeField, 'identity_ratified_at'> | null,
): boolean {
  return Boolean(field?.identity_ratified_at);
}

/**
 * Repair 3 — `how_maia_supports` is prose that tells MAIA how to behave, so it
 * gets the same narrow-only test `maia_guidance` gets. Widening or override
 * attempts do not compose; legitimate descriptive text does, under a frame that
 * subordinates it to the constitutional floor exactly as guidance is.
 *
 * Returns '' when the text tries to widen authority — refusal, not sanitisation:
 * unlike structured guidance there is no per-entry granularity to salvage.
 */
export function composableMaiaSupport(text: string | null | undefined): string {
  const t = (text ?? '').trim();
  if (!t) return '';
  if (isWidening(t)) return '';
  return t;
}

export type FieldAuthorization =
  | { authorized: true; basis: 'practitioner' | 'program_position' | 'authored_material' | 'invited_context' }
  | { authorized: false; basis: 'no_relationship' };

/**
 * Repair 2 — may THIS member compose THIS field?
 *
 * Four accepted bases, all evidence that already exists in the substrate. No
 * new membership table: inventing one is the "grand framework" this unit is
 * explicitly not building.
 *
 *   practitioner       the field is theirs
 *   program_position   they hold a position in one of the field's programs
 *   authored_material  they have kept material in this field before
 *   invited_context    the slug is an invitation-authorized context
 *
 * ⚠️ `invited_context` is the INTERIM basis. `AUTHORIZED_FIELD_CONTEXTS` is a
 * static allowlist standing in for an invitation-token system that does not
 * exist yet (see lib/nowWhat/invitation.ts). It is what keeps a newly-invited
 * member — who has no position and no material yet — from being refused at
 * their own front door. When real invitation tokens ship, this basis is
 * replaced, and the other three are unaffected.
 *
 * Refusal is the default: an unrecognized slug composes nothing.
 */
export async function memberMayComposeField(
  memberId: string | null | undefined,
  field: Pick<PracticeField, 'field_slug' | 'practitioner_member_id'> | null,
): Promise<FieldAuthorization> {
  const slug = field?.field_slug ?? null;
  if (!memberId || !field || !slug) return { authorized: false, basis: 'no_relationship' };

  if (field.practitioner_member_id === memberId) {
    return { authorized: true, basis: 'practitioner' };
  }

  if (AUTHORIZED_FIELD_CONTEXTS.has(slug)) {
    return { authorized: true, basis: 'invited_context' };
  }

  const pos = await query<{ one: number }>(
    `SELECT 1 AS one FROM field_program_positions
      WHERE member_id = $1 AND field_slug = $2 LIMIT 1`,
    [memberId, slug],
  );
  if (pos.rows.length > 0) return { authorized: true, basis: 'program_position' };

  const authored = await query<{ one: number }>(
    `SELECT 1 AS one FROM member_field_note_threads
      WHERE member_id = $1 AND field_context = $2 LIMIT 1`,
    [memberId, slug],
  );
  if (authored.rows.length > 0) return { authorized: true, basis: 'authored_material' };

  return { authorized: false, basis: 'no_relationship' };
}
