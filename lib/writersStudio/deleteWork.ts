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
  /** Nothing was removed, or not all of it was. The message is member-facing.
   *  `removed: true` means the server committed the removal (the writing is gone) but could not yet CONFIRM the whole custody
   *  ending, so the caller must stop showing the writing AND still show the message: both are true.
   *  `unknown: true` means we could not learn what the server did (no answer, an unreadable answer, or a server error that does
   *  not say). The caller must re-read what is true before telling the member anything, and the message says it does not know. */
  | { readonly ok: false; readonly message: string; readonly removed?: boolean; readonly refusal?: string; readonly unknown?: boolean };

/** The server committed the removal but could not yet confirm every part of ending custody. The message is member-facing. */
export class DeletionUnconfirmed extends Error {
  constructor(message: string) { super(message); this.name = 'DeletionUnconfirmed'; }
}

/** The writing is also declared by another of the member's Works, so the server refused to erase it (nothing was deleted).
 *  The member's way forward is to remove THIS Work and keep the writing where it still lives. The message is member-facing. */
export class DeletionSharedMaterial extends Error {
  constructor(message: string) { super(message); this.name = 'DeletionSharedMaterial'; }
}

export interface DeleteTarget {
  /** The member's declaration, when this card is a declared Work. */
  readonly workId: string | null;
  /** The writing itself. Null for a Work that never had a manuscript. */
  readonly manuscriptId: string | null;
}

/* A refusal or a client-side rejection: the server did not act, so "nothing was removed" is TRUE. */
const GENERIC =
  'That work could not be deleted just now. Nothing was removed — please try again.';

/* We could not tell what happened (no answer, an unreadable answer, or a server error that does not say): it may or may not have
   gone through, so nothing is promised either way. The page is re-read before this is shown, so what Home then displays is true. */
const UNKNOWN_DELETE =
  'We could not confirm whether that work was deleted. Home now shows what is current, so check it before you try again.';

/* 401: the server refused before doing anything, so nothing was deleted, and the way forward is to sign in. */
const SESSION_ENDED_DELETE =
  'Your session has ended, so nothing was deleted. Sign in again, then try again.';

type Fetcher = (url: string, init: RequestInit) => Promise<Response>;

export async function deleteWork(
  target: DeleteTarget,
  fetcher: Fetcher,
): Promise<DeleteOutcome> {
  const { workId, manuscriptId } = target;

  /* Material and declaration are erased together, server-side. A Work with no
     manuscript has nothing to erase — only a declaration to withdraw. */
  /* When the card is a Work's, the request names that Work. The server refuses if it no longer holds the writing, so a stale card
     (the Work was removed on another device, or a moment ago) can never reach the writing of a Work the member did not pick. */
  const url = manuscriptId
    ? `/api/sovereign/manuscripts/${manuscriptId}${workId ? `?workId=${encodeURIComponent(workId)}` : ''}`
    : workId
      ? `/api/sovereign/living-works/${workId}`
      : null;
  if (!url) return { ok: false, message: GENERIC };

  let res: Response;
  try {
    res = await fetcher(url, { method: 'DELETE' });
  } catch {
    // The request may have reached the server before the connection failed: we do not know.
    return { ok: false, message: UNKNOWN_DELETE, unknown: true };
  }

  /* 404 on the WRITING means it is already gone: another device, or a request that succeeded while the response was lost. Absence
     of the writing is the outcome sought, but a Work that still names it would render as an ordinary, openable, empty Work: the
     detached state this ruling forbids by name. The ruling's own retry path says the retry "finds the manuscript already gone
     (404) and continues", so a Work card follows through and withdraws the declaration. */
  if (res.status === 404 && workId && manuscriptId) {
    const withdrawn = await removeWork(workId, fetcher);
    if (withdrawn.ok) return { ok: true };
    return withdrawn.unknown ? { ok: false, message: UNKNOWN_DELETE, unknown: true } : { ok: false, message: GENERIC };
  }
  if (res.ok || res.status === 404) return { ok: true };
  if (res.status === 401) return { ok: false, message: SESSION_ENDED_DELETE };

  const body = await readBody(res);
  const refusal = typeof body?.refusal === 'string' ? body.refusal : null;
  const removed = body?.removed === true;
  if (removed) {
    return { ok: false, message: deletionRefusalCopy(refusal ?? 'custody_incomplete'), removed: true, ...(refusal ? { refusal } : {}) };
  }
  if (refusal) return { ok: false, message: deletionRefusalCopy(refusal), refusal };
  // A server error that does not say what it did (it may have rolled back, or it may have committed and failed afterwards):
  // never "nothing was removed". Other 4xx are rejections before any act.
  if (res.status >= 500) return { ok: false, message: UNKNOWN_DELETE, unknown: true };
  return { ok: false, message: GENERIC };
}

/** The server's body, or null when there is none or it is not JSON. A raw `error` string is NEVER shown to the member: these
 *  routes' error strings are technical ("Unauthorized", "Failed to remove manuscript"), not member-directed sentences. */
async function readBody(res: Response): Promise<{ refusal?: unknown; removed?: unknown } | null> {
  try {
    const body = (await res.json()) as unknown;
    return body && typeof body === 'object' ? (body as { refusal?: unknown; removed?: unknown }) : null;
  } catch {
    return null;
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
      return 'This writing is also in another of your Works, so it cannot be deleted from here '
        + 'without taking it from there. Nothing was deleted. On Home, press Delete on one of '
        + 'those Works and choose “Remove this Work”, then delete the writing.';

    /* The Work the member pressed Delete on no longer holds this writing. The page is refreshed before this is shown. */
    case 'work_no_longer_holds_it':
      return 'That Work has changed since this page loaded. It may have been removed on another '
        + 'device. Nothing was deleted. Home now shows what is current.';

    /* The rows are gone, but not everything behind them could be confirmed destroyed. "Custody incomplete" has more than one cause
       (the original file, or our own recovery record of the deletion), so the sentence names both and promises nothing the
       code does not do: it says we will not call it gone until we can. */
    case 'custody_incomplete':
      return 'This work was removed from your studio, but we could not confirm that everything behind it '
        + 'has been destroyed: the original file, if there was one, and our own record of the deletion. '
        + 'Until we can, we are not going to tell you it is gone.';

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
 *
 * CORRECTION (R-SHARED review, 2026-11-05): the census claim above, that every foreign key into `living_works` cascades only
 * to link rows, was true on 2026-09-08 and is NOT true now. Migrations of 2026-09-25 to 2026-09-29 added Work-level conversations
 * (`ask_threads.living_work_id`), what the writer told MAIA (`living_work_writer_understanding`), corrections, editorial
 * relationship and return rows, all ON DELETE CASCADE from the Work row. Removing a Work therefore ends those too. The writing
 * is still untouched. The copy below says what goes; `REMOVE_WORK_COPY` (used only by the older, unmounted HomeView) predates that
 * and under-describes it.
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
    return { ok: false, message: REMOVE_UNKNOWN, unknown: true };
  }
  if (res.ok || res.status === 404) return { ok: true };
  if (res.status === 401) return { ok: false, message: REMOVE_SESSION_ENDED };
  if (res.status >= 500) return { ok: false, message: REMOVE_UNKNOWN, unknown: true };
  return { ok: false, message: REMOVE_GENERIC };
}

/* A rejection before any act: nothing changed. */
const REMOVE_GENERIC =
  'That work could not be removed just now. Nothing changed — your writing is untouched.';
/* We could not learn what the server did: say so, and never "nothing changed". */
const REMOVE_UNKNOWN =
  'We could not confirm whether that work was removed. Home now shows what is current, so check it before you try again.';
const REMOVE_SESSION_ENDED =
  'Your session has ended, so nothing changed. Sign in again, then try again.';

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

/* What goes when a Work row is removed: every table that cascades from it (see the R-SHARED lane record, section 6). Kept in one
   place so the two removal bodies cannot drift apart. Conversations about the WRITING itself are not here: they belong to the
   manuscript, not to the Work. */
const WHAT_GOES_WITH_A_WORK =
  'its conversations with MAIA, what you told MAIA about it, your corrections, where you left off, its list of materials and its image';
const NO_UNDO_AND_BACKUPS =
  'It cannot be undone, and private backups already taken can still hold a copy until they are retired on their normal schedule.';

/**
 * The way out of a shared-writing refusal. Delete was refused because another of the member's Works also holds the writing, so
 * the only act on offer is the container-only one: remove THIS Work and leave the writing where it still lives. The body says
 * what goes and what stays, so the member does not have to infer it. It never says "nothing is deleted": the Work's own
 * conversations and corrections are.
 */
export const REMOVE_SHARED_WORK_COPY = {
  question: (title: string) => `Remove “${title}” and keep the writing?`,
  body:
    'This writing is also in another of your Works, so it cannot be deleted from here without taking it from there. '
    + `You can remove this Work instead. That removes the Work and what you built inside it: ${WHAT_GOES_WITH_A_WORK}. `
    + `${NO_UNDO_AND_BACKUPS} The writing, and your conversations about the writing itself, stay in your other Work.`,
  confirm: 'Remove this Work',
  working: 'Removing…',
  /* Not "Keep it": under a question that says "keep the writing" that reads as an answer, not as cancel. */
  cancel: 'Don’t remove',
} as const;

/**
 * A Work that holds more than one writing has no Delete: which writing would go is the member's choice, and there is no control
 * for that choice on the card. The act on offer is the container-only one, and it deletes none of the writings.
 */
export const REMOVE_MANY_WORK_COPY = {
  question: (title: string) => `Remove “${title}”?`,
  body:
    'This Work holds more than one writing, so it cannot be deleted from here without choosing which writing to delete. '
    + `You can remove the Work instead. That removes the Work and what you built inside it: ${WHAT_GOES_WITH_A_WORK}. `
    + `${NO_UNDO_AND_BACKUPS} None of the writings is deleted: each stays in any other Work that holds it, or under “Writing not yet in a Work”.`,
  confirm: 'Remove this Work',
  working: 'Removing…',
  cancel: 'Don’t remove',
} as const;

/** Said on the page after a Work was removed and its writing kept, so the member is told what happened and not left to infer it. */
export const removedWorkNotice = (title: string, why: 'shared' | 'many' = 'shared'): string =>
  why === 'many'
    ? `“${title}” was removed. Its writings were not deleted: they stay in any other Work that holds them, or under “Writing not yet in a Work”.`
    : `“${title}” was removed. The writing is still in your other Work.`;

/** What a Work card's Delete is, so its confirmation can say what is true of THIS Work and no more. */
export type WorkDeleteKind =
  | 'writing'            // one writing and nothing else: the writing and the Work go
  | 'writing-keeps-work' // one writing plus other parts: the writing goes, the Work stays with what else it holds
  | 'empty'              // no writing: only the Work (the declaration) goes
  | 'many';              // several writings: no Delete, only Remove

export function deleteConfirmCopy(kind: Exclude<WorkDeleteKind, 'many'>, title: string): { readonly question: string; readonly body: string } {
  switch (kind) {
    case 'writing':
      return {
        question: DELETE_WORK_COPY.question(title),
        body:
          'This deletes the Work and its writing: its sections and drafts, and the original file it came from, if there is one. '
          + `It also removes what you built inside the Work: ${WHAT_GOES_WITH_A_WORK}. `
          + 'It cannot be undone and there is no archive. Private backups already taken can still hold a copy until they are retired on their normal schedule.',
      };
    case 'writing-keeps-work':
      return {
        question: `Delete the writing in “${title}”?`,
        body:
          'This deletes the writing in this Work: its sections and drafts, the original file it came from, if there is one, and your '
          + 'conversations with MAIA about the writing. The Work itself stays, with what else it holds. '
          + 'It cannot be undone and there is no archive. Private backups already taken can still hold a copy until they are retired on their normal schedule.',
      };
    case 'empty':
      return {
        question: DELETE_WORK_COPY.question(title),
        body:
          'This Work has no writing in it. Deleting it removes the Work and what you built inside it: '
          + `${WHAT_GOES_WITH_A_WORK}. ${NO_UNDO_AND_BACKUPS}`,
      };
  }
}

/** Copy for the confirmation step. Kept beside the act so the two cannot drift. */
export const DELETE_WORK_COPY = {
  action: 'Delete Work and writing',
  working: 'Deleting…',
  cancel: 'Keep it',
  confirm: 'Delete permanently',
  /** Shown beneath the action. The two hints are the whole distinction. */
  /* No "permanently": this line sits beneath the action and has no room to say that earlier backups can still hold a
     copy, and `permanentErasureCertified` is false. The confirmation body carries the full, qualified statement. */
  hint: 'Deletes this Work and its writing. This cannot be undone.',
  /* Names the work, and names what deletion actually reaches. A member agreeing
     to this should not later discover the original import outlived it. It also
     must not promise more than deletion can deliver: backups already taken are
     not rewritten, so the copy says so instead of claiming nothing is kept
     (D5; `permanentErasureCertified` is false for the same reason). */
  question: (title: string) => `Delete “${title}”?`,
  body:
    'This deletes the writing, its sections and drafts, and the original file it came '
    + 'from. It cannot be undone and there is no archive. Private backups already taken '
    + 'can still hold a copy until they are retired on their normal schedule.',
} as const;


/* ── The act, as the page runs it ─────────────────────────────────────────────────────────────────────────────────────────────
   One place that maps what the server said to what the page does, so it is tested at runtime and not only by reading source.
   `refresh` re-reads Home. It is awaited BEFORE the member is told anything about an outcome that changes what is true. */
type Refresh = () => Promise<unknown>;
const quietly = (refresh: Refresh) => refresh().catch(() => undefined);

export async function runDeleteWork(target: DeleteTarget, fetcher: Fetcher, refresh: Refresh): Promise<void> {
  const outcome = await deleteWork(target, fetcher);
  if (outcome.ok) { await quietly(refresh); return; }
  // Removed, but not yet confirmed destroyed: stop listing it AND still say so.
  if (outcome.removed) { await quietly(refresh); throw new DeletionUnconfirmed(outcome.message); }
  // Shared writing: nothing was deleted and Delete cannot succeed from this card. The card offers the other act.
  if (outcome.refusal === 'declared_in_other_works') throw new DeletionSharedMaterial(outcome.message);
  // A stale card, or an outcome we could not learn: make the page true first, then say so.
  if (outcome.refusal === 'work_no_longer_holds_it' || outcome.unknown) { await quietly(refresh); throw new Error(outcome.message); }
  throw new Error(outcome.message);
}

export async function runRemoveWork(workId: string, fetcher: Fetcher, refresh: Refresh): Promise<void> {
  const outcome = await removeWork(workId, fetcher);
  if (outcome.ok) { await quietly(refresh); return; }
  if (outcome.unknown) await quietly(refresh);
  throw new Error(outcome.message);
}
