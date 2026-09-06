/**
 * WS2-NAV-01 — the member act that gives a draft's section breaks durable identity.
 *
 * THE COMMAND ALREADY EXISTED AND IS UNCHANGED. `{ convert: true }` on the draft
 * route is deliberately separate from an ordinary save, because a conversion
 * assigns durable section identities that authored structure and developmental
 * evidence both depend on (draft/route.ts D9). What was missing was a door: no
 * surface anywhere sent that command, so no member could ever reach a navigable
 * manuscript. This adds the door and nothing else.
 *
 * THE SYSTEM PROPOSES; THE MEMBER CONFIRMS. Conversion is never automatic — not
 * on import, not on save. The boundaries are detected at ingest and offered; the
 * act that makes them the Work's structure is the member's.
 *
 * NO OPTIMISTIC SUCCESS. The caller may only treat the Work as converted once the
 * server says so. A failed conversion leaves the continuous draft exactly as it
 * was — the honest outcome is "still unconverted", never a hopeful remount.
 */

export type ConfirmOutcome =
  | { readonly ok: true }
  /** The server refused or the request failed. The draft is unchanged. */
  | { readonly ok: false; readonly message: string };

const GENERIC =
  'Those section breaks could not be confirmed. Your draft is unchanged — please try again.';

export async function confirmSectionBreaks(
  manuscriptId: string,
  fetcher: (url: string, init: RequestInit) => Promise<Response>
): Promise<ConfirmOutcome> {
  let res: Response;
  try {
    res = await fetcher(`/api/sovereign/manuscripts/${manuscriptId}/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ convert: true }),
    });
  } catch {
    return { ok: false, message: GENERIC };
  }

  if (res.ok) return { ok: true };

  try {
    const body = (await res.json()) as { error?: unknown; refusal?: unknown };
    /* A `refusal` is a CLASSIFICATION, never display text. Codes like
       `boundary_confirmation_required` are instrumentation words, and showing
       one would leak the measuring apparatus into the room and describe a
       member's manuscript in a vocabulary invented for auditing it. The same
       boundary sectionNavigationCopy() draws for navigation reasons is drawn
       here for conversion refusals: the mapping is the only path from a code to
       a screen, and an unrecognised code falls back rather than escaping.

       `error` is different — those are already member-directed sentences from
       the route ('Invalid JSON body', 'Not found'), not classifications. */
    if (typeof body?.refusal === 'string') {
      return { ok: false, message: conversionRefusalCopy(body.refusal) };
    }
    if (typeof body?.error === 'string' && body.error.trim().length > 0) {
      return { ok: false, message: body.error };
    }
    return { ok: false, message: GENERIC };
  } catch {
    return { ok: false, message: GENERIC };
  }
}

/**
 * Conversion refusals in the member's language.
 *
 * Every branch says the same thing in substance, because it is the thing that
 * matters most and is always true: their writing is unchanged. What differs is
 * WHOSE TASK the refusal names — the member's, or ours.
 */
export function conversionRefusalCopy(refusal: string): string {
  switch (refusal) {
    /* The member's draft and the detected breaks no longer agree. Only they can
       say where a break now falls, so this must not read like a system error. */
    case 'boundary_moved':
    case 'boundary_confirmation_required':
    case 'not_pristine_under_lock':
    case 'heading_not_in_historical_form':
    case 'heading_prefix_not_found':
    case 'leading_text_before_first_boundary':
      return 'Your draft has moved since those section breaks were detected, so they no longer '
        + 'describe it. Your writing is unchanged. The breaks will need to be found again from '
        + 'the draft as it stands now.';

    /* Nothing to convert from. An authorship task, not a failure. */
    case 'no_source_sections':
    case 'draft_not_found':
      return 'There are no detected section breaks to confirm for this Work yet. '
        + 'Your writing is unchanged.';

    /* Already done — say so plainly rather than as a refusal. */
    case 'already_normalized':
      return 'This Work already has its sections. Your writing is unchanged.';

    /* Ours, not theirs. It should not read like something they did. */
    case 'already_converted_inconsistently':
    case 'withheld_instruments_disagree':
    case 'inverse_proof_failed':
    case 'result_not_current_composer_output':
    case 'boundary_offsets_incomplete':
      return 'We could not confirm those section breaks safely, so nothing was changed. '
        + 'This one is ours to look at — your writing is untouched and you can keep working.';

    default:
      return GENERIC;
  }
}

/** Copy for the unconverted state. Kept beside the act so the two cannot drift. */
export const SECTION_BREAKS_COPY = {
  title: 'This Work is not yet navigable.',
  body:
    'Section breaks were detected when your manuscript came in, but they are not yet its structure. '
    + 'Confirming them turns them into the working sections you can move between — and they become '
    + 'durable, so what you write and what MAIA notices can both point at the same places.',
  action: 'Confirm section breaks',
  working: 'Confirming…',
  /* Shown when the outline is unconverted but conversion is NOT available —
     `no_draft`, or a draft whose breaks can no longer be proved. It must not
     imply an act that is not on offer. */
  bodyNotConvertible:
    'Section navigation is not available for this Work yet. Your writing is unchanged, '
    + 'and you can keep working here.',
} as const;
