/**
 * WS-DELETE-01 — the member act that ends Soullab's custody of a Work.
 *
 * THE COMMAND ALREADY EXISTED AND HAD NO DOOR. `DELETE /api/sovereign/manuscripts/:id`
 * has been member-scoped and correct since July and had zero callers anywhere in
 * `app/` or `components/`, so test imports and abandoned drafts accumulated on the
 * Studio home with no way to remove them. This is the third instance of the same
 * shape in this room — after WS2-NAV-01 (`{ convert: true }`, no caller) and NAV-03
 * (`beginDraft()`, no callback). The command is not the capability; the crossing is.
 *
 * ── What Delete means here (founder ruling 2026-09-07) ─────────────────────
 *
 *   member-visible promise   The Work is gone.
 *   must not mean            hidden · archived · detached · unreferenced but retained
 *
 * "If the system wants to preserve the original material, that is a legitimate
 * design — but the button must then be called Withdraw, Remove from Studio, or
 * Archive, not Delete."
 *
 * ── Why this is ONE call, and not two ─────────────────────────────────────
 * A declared Work is two rows: the member's declaration (`living_works`) and the
 * material it names (`member_manuscripts`). Deleting only the declaration is
 * withdrawal — the words survive. Deleting only the material leaves a Work shell
 * pointing at nothing, the *detached* state the ruling forbids by name.
 *
 * An earlier version did both from here, material first, and answered a failure
 * between them with "press Delete again." The founder refused that: retryability
 * is not invariance, and a forbidden state does not become permitted because a
 * second click can repair it. So the two deletions now happen in ONE server-side
 * transaction (lib/manuscript/source/eraseManuscript.ts) and this sends ONE
 * request. There is no interval for a detached Work to exist in, and no ordering
 * for this module to get wrong.
 *
 * The one case that still goes to the living-works route is a Work that has no
 * manuscript at all — nothing to erase, only a declaration to withdraw.
 *
 * NO OPTIMISTIC SUCCESS. The caller may only treat a Work as gone once the server
 * has said so — including about bytes it has not finished destroying.
 */

export type DeleteOutcome =
  | { readonly ok: true }
  /** Nothing was removed, or not all of it was. The message is member-facing. */
  | { readonly ok: false; readonly message: string };

export interface DeleteTarget {
  /** The member's declaration, when this card is a declared Work. */
  readonly workId: string | null;
  /** The writing itself. Null for a Work that never had a manuscript. */
  readonly manuscriptId: string | null;
}

const GENERIC =
  'That work could not be deleted just now. Nothing was removed — please try again.';

type Fetcher = (url: string, init: RequestInit) => Promise<Response>;

export async function deleteWork(
  target: DeleteTarget,
  fetcher: Fetcher,
): Promise<DeleteOutcome> {
  const { workId, manuscriptId } = target;

  /* Material and declaration are erased together, server-side. A Work with no
     manuscript has nothing to erase — only a declaration to withdraw. */
  const url = manuscriptId
    ? `/api/sovereign/manuscripts/${manuscriptId}`
    : workId
      ? `/api/sovereign/living-works/${workId}`
      : null;
  if (!url) return { ok: false, message: GENERIC };

  let res: Response;
  try {
    res = await fetcher(url, { method: 'DELETE' });
  } catch {
    return { ok: false, message: GENERIC };
  }

  /* 404 means it is already gone — another device, or a request that succeeded
     while the response was lost. Absence is the outcome we were seeking. */
  if (res.ok || res.status === 404) return { ok: true };

  return { ok: false, message: await deletionRefusalMessage(res) };
}

async function deletionRefusalMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: unknown; refusal?: unknown };
    /* A `refusal` is a CLASSIFICATION, never display text — the same boundary
       conversionRefusalCopy() draws. `error` values from these routes are already
       member-directed sentences. */
    if (typeof body?.refusal === 'string') return deletionRefusalCopy(body.refusal);
    if (typeof body?.error === 'string' && body.error.trim().length > 0) return body.error;
    return GENERIC;
  } catch {
    return GENERIC;
  }
}

/**
 * Deletion refusals in the member's language.
 *
 * Each branch is exact about what is still true of their writing, because after
 * pressing Delete that is the only thing they need to know for certain.
 */
export function deletionRefusalCopy(refusal: string): string {
  switch (refusal) {
    /* Shared material. Theirs to resolve — we must not choose which work loses
       the writing, and we must not pretend the obstacle is technical. */
    case 'declared_in_other_works':
      return 'This writing also belongs to another work, so deleting it here would '
        + 'remove it from there too. Nothing was deleted. Remove it from the other '
        + 'work first, then delete it here.';

    /* We could not finish ending custody. Never reported as done. */
    case 'custody_incomplete':
      return 'This work was removed from your studio, but we could not confirm the '
        + 'original file was destroyed, so we are not going to tell you it is gone. '
        + 'This one is ours to finish — nothing of yours is being kept on purpose.';

    default:
      return GENERIC;
  }
}

/**
 * WRITERS-STUDIO-WORK-SHELF-01 · REMOVE WORK, KEEP WRITING (founder, 2026-09-08).
 *
 * The second act, and deliberately NOT a redefinition of the first. WS-DELETE-01
 * stands: Delete means deletion, and must never quietly mean "detach the
 * container but keep the writing somewhere else" — the *unreferenced but
 * retained* state it forbids by name. What was missing was a different act, so
 * this adds one rather than softening that one.
 *
 * ⭐ NOTHING HERE TOUCHES MANUSCRIPT STORAGE. The census that produced this
 * ruling found that every foreign key into `living_works` cascades only to link
 * rows — `living_work_expressions` carries `expression_type` + `expression_id`
 * with NO foreign key to any manuscript table, and no manuscript table
 * references `living_works` at all. So the container-only removal is what the
 * database already does; it needed a door, not a mechanism. The destructive path
 * (`eraseManuscript.ts`) is untouched and stays separate.
 *
 * ⛔ THE LABEL MAY NOT OUTRUN THE ACT. WS-DELETE-01 named the price of keeping
 * the writing: the button then cannot say Delete. Nor Archive, which would
 * promise a reversibility nothing implements, nor Withdraw, which would make a
 * lifecycle state out of a word no one ruled. It says Remove, and the
 * confirmation says exactly what survives.
 */
export async function removeWork(
  workId: string,
  fetcher: Fetcher,
): Promise<DeleteOutcome> {
  let res: Response;
  try {
    /* The living-works route only ever deleted the declaration and queued the
       Work's own image bytes. It is already container-only; this is its door. */
    res = await fetcher(`/api/sovereign/living-works/${workId}`, { method: 'DELETE' });
  } catch {
    return { ok: false, message: REMOVE_GENERIC };
  }
  if (res.ok || res.status === 404) return { ok: true };
  return { ok: false, message: REMOVE_GENERIC };
}

const REMOVE_GENERIC =
  'That work could not be removed just now. Nothing changed — your writing is untouched.';

/**
 * Copy for removal. Separate constant from `DELETE_WORK_COPY` so the two acts
 * cannot drift into each other's language — the drift that would recreate the
 * exact confusion this ruling resolved.
 */
export const REMOVE_WORK_COPY = {
  action: 'Remove Work',
  working: 'Removing…',
  cancel: 'Keep it',
  confirm: 'Remove Work',
  question: (title: string) => `Remove “${title}” from Your Works?`,
  /* Says what survives, not merely what goes. A member agreeing to this must
     not have to infer where their writing went. */
  body:
    'This removes the work and how it was arranged. Your writing stays in Your '
    + 'Writings, and you can delete it there if you ever want to.',
  /** Shown beneath the action, so the choice is legible before it is made. */
  hint: 'Keeps your writing in Your Writings.',
} as const;

/** Copy for the confirmation step. Kept beside the act so the two cannot drift. */
export const DELETE_WORK_COPY = {
  action: 'Delete Work and writing',
  working: 'Deleting…',
  cancel: 'Keep it',
  confirm: 'Delete permanently',
  /** Shown beneath the action. The two hints are the whole distinction. */
  hint: 'Permanently deletes this Work and its writing.',
  /* Names the work, and names what deletion actually reaches. A member agreeing
     to this should not later discover the original import outlived it. */
  question: (title: string) => `Delete “${title}”?`,
  body:
    'This deletes the writing, its sections and drafts, and the original file it came '
    + 'from. It cannot be undone and there is no archive — nothing is kept.',
} as const;
