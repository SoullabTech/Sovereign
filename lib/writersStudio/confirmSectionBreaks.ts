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

  /* Prefer the server's own words — it knows why it refused, and a refusal that
     names its reason is worth more than a generic apology. */
  try {
    const body = (await res.json()) as { error?: unknown; refusal?: unknown };
    const named =
      typeof body?.error === 'string' ? body.error
      : typeof body?.refusal === 'string' ? body.refusal
      : null;
    return { ok: false, message: named ?? GENERIC };
  } catch {
    return { ok: false, message: GENERIC };
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
} as const;
