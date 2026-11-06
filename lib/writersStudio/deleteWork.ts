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
 * THE RETRY IS FINISHED ON THE SERVER. When the writing is already gone (another device, or a request whose answer was lost) the ruling's
 * retry "finds the manuscript already gone (404) and continues". The server continues, in the same transaction: if the Work this card
 * named still declares the gone writing, that dangling declaration goes (and the Work with it, unless it declares something else).
 * So this module sends ONE request and a 404 is simply done: there is no second request to get wrong, and no way for the client to
 * remove a Work the member did not confirm.
 *
 * NO OPTIMISTIC SUCCESS. The caller may only treat a Work as gone once the server
 * has said so — including about bytes it has not finished destroying.
 */

export type DeleteOutcome =
  /** The server said yes. `workRemoved` is its word on whether the Work went (the manuscripts route says; the Work route always removes
   *  the Work; a 404 says nothing about the Work), so the page never has to guess what became of the card it is showing. */
  | { readonly ok: true; readonly workRemoved?: boolean }
  /** Nothing was removed, or not all of it was. The message is member-facing.
   *  `removed: true` means the server committed the removal (the writing is gone) but could not yet CONFIRM the whole custody
   *  ending, so the caller must stop showing the writing AND still show the message: both are true.
   *  `unknown: true` means we could not learn what the server did (no answer, an unreadable answer, or a server error that does
   *  not say). The caller must re-read what is true before telling the member anything, and the message says it does not know. */
  | {
      readonly ok: false;
      readonly message: string;
      readonly removed?: boolean;
      readonly refusal?: string;
      readonly unknown?: boolean;
      /** For a committed removal that is not yet confirmed: which of its obligations the server says are still owed. */
      readonly unconfirmed?: Unconfirmed;
      /** For a committed removal: whether the Work went with it, as the server said (undefined when it did not say). */
      readonly workRemoved?: boolean;
    };

/** What the server says is still owed after a committed removal. Absent flags mean "not owed" when the object is present. */
export interface Unconfirmed {
  readonly originalFile?: boolean;
  readonly image?: boolean;
  readonly deletionRecord?: boolean;
}

/** The server committed the removal but could not yet confirm every part of ending custody. The message is member-facing. */
export class DeletionUnconfirmed extends Error {
  /** Whether the Work itself went, as the server said (true: the card is gone for good; false: the Work stays; undefined: not told). */
  readonly workRemoved: boolean | undefined;
  constructor(message: string, workRemoved?: boolean) { super(message); this.name = 'DeletionUnconfirmed'; this.workRemoved = workRemoved; }
}

/** The writing is also declared by another of the member's Works, so the server refused to erase it (nothing was deleted).
 *  The member's way forward is to remove THIS Work and keep the writing where it still lives. The message is member-facing. */
export class DeletionSharedMaterial extends Error {
  constructor(message: string) { super(message); this.name = 'DeletionSharedMaterial'; }
}

/** An outcome the member must be told about ON THE PAGE, not in a dialog: the page was re-read before this was thrown, and that
 *  re-read may already have removed the card that started the act (the delete had in fact gone through), so a message left in the
 *  card's dialog would be lost with it. The message is member-facing and true of what was learned. */
export class DeletionNotice extends Error {
  constructor(message: string) { super(message); this.name = 'DeletionNotice'; }
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
   gone through, so nothing is promised either way. runDeleteWork appends what is true about Home AFTER it has tried to re-read it:
   it never claims Home is current unless the re-read worked. */
const UNKNOWN_DELETE =
  'We could not confirm whether that work was deleted.';

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

  /* A card with no writing goes to the Work route, which always removes the Work. */
  const viaWorkRoute = !manuscriptId;

  let res: Response;
  try {
    res = await fetcher(url, { method: 'DELETE' });
  } catch {
    // The request may have reached the server before the connection failed: we do not know.
    return { ok: false, message: UNKNOWN_DELETE, unknown: true };
  }

  if (res.ok) {
    if (viaWorkRoute) return { ok: true, workRemoved: true };
    const said = (await readBody(res))?.workRemoved;
    return typeof said === 'boolean' ? { ok: true, workRemoved: said } : { ok: true };
  }
  /* 404 means the writing is already gone: another device, or a request that succeeded while the response was lost. Absence is the
     outcome sought. (If a Work still declared it, the server has already finished that in the same transaction.) It says nothing
     about the Work, unless the Work route was asked: there, 404 means the Work is gone. */
  if (res.status === 404) return viaWorkRoute ? { ok: true, workRemoved: true } : { ok: true };
  if (res.status === 401) return { ok: false, message: SESSION_ENDED_DELETE };

  const body = await readBody(res);
  const refusal = typeof body?.refusal === 'string' ? body.refusal : null;
  if (body?.removed === true) {
    // The server committed the removal and says something is still owed. A code this client does not know is still a committed
    // removal: say what we can prove (the removal happened, custody is unconfirmed) and never "nothing was removed".
    const known = refusal !== null && OWED_AFTER_REMOVAL.has(refusal) ? refusal : 'custody_incomplete';
    // The subject of the sentence: the Work went (a Work card whose Work declared only this writing), or only the writing did.
    const subject = workId && body.workRemoved !== false ? 'work' : 'writing';
    // Whether the Work went: the server's word where it gave one; the Work route (no writing on the card) always removes the Work.
    const workRemoved = typeof body.workRemoved === 'boolean' ? body.workRemoved : (viaWorkRoute ? true : undefined);
    return { ok: false, message: deletionRefusalCopy(known, { subject, ...(body.unconfirmed ? { unconfirmed: body.unconfirmed } : {}) }), removed: true, ...(workRemoved !== undefined ? { workRemoved } : {}), ...(refusal ? { refusal } : {}), ...(body.unconfirmed ? { unconfirmed: body.unconfirmed } : {}) };
  }
  if (refusal !== null && REFUSED_BEFORE_ANY_ACT.has(refusal)) return { ok: false, message: deletionRefusalCopy(refusal), refusal };
  // A 5xx that does not say what it did (it may have rolled back, or it may have committed and failed afterwards): never "nothing was
  // removed". A 4xx is a rejection before any act, including one whose refusal code this client does not know.
  if (res.status >= 500) return { ok: false, message: UNKNOWN_DELETE, unknown: true };
  return { ok: false, message: GENERIC };
}

/* Refusals the server returns BEFORE it touches anything: "nothing was deleted" is true of them. */
const REFUSED_BEFORE_ANY_ACT: ReadonlySet<string> = new Set(['declared_in_other_works', 'work_no_longer_holds_it']);
/* What the server may still owe after it has committed a removal. */
const OWED_AFTER_REMOVAL: ReadonlySet<string> = new Set(['custody_incomplete', 'image_bytes_owed']);

interface ServerBody {
  refusal?: unknown;
  removed?: unknown;
  workRemoved?: unknown;
  unconfirmed?: Unconfirmed;
}

/** The server's body, or null when there is none or it is not JSON. A raw `error` string is NEVER shown to the member: these
 *  routes' error strings are technical ("Unauthorized", "Failed to remove manuscript"), not member-directed sentences. */
async function readBody(res: Response): Promise<ServerBody | null> {
  try {
    const body = (await res.json()) as unknown;
    if (!body || typeof body !== 'object') return null;
    const raw = body as { refusal?: unknown; removed?: unknown; workRemoved?: unknown; unconfirmed?: unknown };
    const u = raw.unconfirmed && typeof raw.unconfirmed === 'object' ? (raw.unconfirmed as Record<string, unknown>) : null;
    return {
      refusal: raw.refusal,
      removed: raw.removed,
      workRemoved: raw.workRemoved,
      ...(u ? { unconfirmed: { originalFile: u.originalFile === true, image: u.image === true, deletionRecord: u.deletionRecord === true } } : {}),
    };
  } catch {
    return null;
  }
}

function custodyCopy(subject: 'work' | 'writing', unconfirmed?: Unconfirmed): string {
  const opening = subject === 'writing' ? 'This writing was deleted from your studio' : 'This work was removed from your studio';
  const named = unconfirmed !== undefined && (unconfirmed.originalFile || unconfirmed.image || unconfirmed.deletionRecord);
  const items = named
    ? [
        ...(unconfirmed.originalFile ? ['that its original file has been destroyed'] : []),
        ...(unconfirmed.image ? ['that its image has been destroyed'] : []),
        ...(unconfirmed.deletionRecord ? ['that our independent record of the deletion has been sealed'] : []),
      ]
    : ['that its original file, if there was one, has been destroyed', 'that our independent record of the deletion has been sealed'];
  const list = items.length === 1
    ? items[0]!
    : items.length === 2
      ? `two things: ${items[0]}, and ${items[1]}`
      : `three things: ${items[0]}, ${items[1]}, and ${items[2]}`;
  return `${opening}, but we could not confirm ${list}. Until we can, we are not going to tell you it is gone.`;
}

/**
 * Deletion refusals in the member's language.
 *
 * Each branch is exact about what is still true of their writing, because after
 * pressing Delete that is the only thing they need to know for certain.
 */
export function deletionRefusalCopy(
  refusal: string,
  context: { readonly subject?: 'work' | 'writing'; readonly unconfirmed?: Unconfirmed } = {},
): string {
  switch (refusal) {
    /* Shared material. Theirs to resolve — we must not choose which work loses
       the writing, and we must not pretend the obstacle is technical. */
    case 'declared_in_other_works':
      return 'This writing is also in another of your Works, so it cannot be deleted from here '
        + 'without taking it from there. Nothing was deleted. On Home, press Delete on one of '
        + 'those Works and, when asked, choose “Remove this Work”. Then delete the writing from the last Work that holds it.';

    /* The Work the member pressed Delete on no longer holds this writing. The page is refreshed before this is shown. */
    case 'work_no_longer_holds_it':
      return 'That Work has changed since this page loaded. It may have been removed on another '
        + 'device. Nothing was deleted.';

    /* The rows are gone, but not everything behind them could be confirmed. The sentence names exactly the obligations the server says
       are owed, each with its own verb: bytes are owed DESTRUCTION; the independent record of the deletion (which exists so a
       restored backup cannot bring the writing back) is owed SEALING and is kept on purpose. When the server did not say which,
       it names the two that can be owed after a writing's deletion. It promises nothing the code does not do: it says we will not
       call it gone until we can. */
    case 'custody_incomplete':
      return custodyCopy(context.subject ?? 'work', context.unconfirmed);

    /* A Work's image is bytes in the vault: the row went with the Work, the bytes are queued, and they were not yet confirmed
       destroyed when the answer was written. */
    case 'image_bytes_owed':
      return custodyCopy(context.subject ?? 'work', { image: true });

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
    /* The living-works route deletes the Work row (and, by cascade, everything that hangs from it) and queues the Work's own image
       bytes. It never touches a manuscript. This is its door. */
    res = await fetcher(`/api/sovereign/living-works/${workId}`, { method: 'DELETE' });
  } catch {
    return { ok: false, message: REMOVE_UNKNOWN, unknown: true };
  }
  // Removed, or already gone: either way the Work is not there.
  if (res.ok || res.status === 404) return { ok: true, workRemoved: true };
  if (res.status === 401) return { ok: false, message: REMOVE_SESSION_ENDED };
  const body = await readBody(res);
  const refusal = typeof body?.refusal === 'string' ? body.refusal : null;
  if (body?.removed === true) {
    // The Work row is gone and something it owned (its image) is still owed: a committed removal that is not yet confirmed.
    return { ok: false, message: deletionRefusalCopy('image_bytes_owed', { subject: 'work' }), removed: true, workRemoved: true, ...(refusal ? { refusal } : {}), unconfirmed: { image: true } };
  }
  if (res.status >= 500) return { ok: false, message: REMOVE_UNKNOWN, unknown: true };
  return { ok: false, message: REMOVE_GENERIC };
}

/* A rejection before any act: nothing changed. */
const REMOVE_GENERIC =
  'That work could not be removed just now. Nothing changed — your writing is untouched.';
/* We could not learn what the server did: say so, and never "nothing changed". */
const REMOVE_UNKNOWN =
  'We could not confirm whether that work was removed.';
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
 * conversations and corrections are. `others` is how many other Works hold the writing right now (the page counts them from the
 * Works it shows, so the sentence is true of what the member can see).
 */
export const removeSharedWorkCopy = (others: number) => {
  const where = others > 1 ? `${others} of your other Works` : 'another of your Works';
  const stays = others > 1 ? 'the other Works that hold it' : 'your other Work';
  return {
    question: (title: string) => `Remove “${title}” and keep the writing?`,
    body:
      `This writing is also in ${where}, so it cannot be deleted from here without taking it from there. `
      + `You can remove this Work instead. That removes the Work and what you built inside it: ${WHAT_GOES_WITH_A_WORK}. `
      + `${NO_UNDO_AND_BACKUPS} The writing itself is not deleted: it stays in ${stays}.`,
    confirm: 'Remove this Work',
    working: 'Removing…',
    /* Not "Keep it": under a question that says "keep the writing" that reads as an answer, not as cancel. */
    cancel: 'Don’t remove',
  } as const;
};
export const REMOVE_SHARED_WORK_COPY = removeSharedWorkCopy(1);

/**
 * A Work that holds more than one writing has no Delete: which writing would go is the member's choice, and there is no control
 * for that choice on the card. The act on offer is the container-only one, and it deletes none of the writings.
 */
export const REMOVE_MANY_WORK_COPY = {
  question: (title: string) => `Remove “${title}”?`,
  body:
    'This Work holds more than one writing, so it cannot be deleted from here without choosing which writing to delete. '
    + `You can remove the Work instead. That removes the Work and what you built inside it: ${WHAT_GOES_WITH_A_WORK}. `
    + `${NO_UNDO_AND_BACKUPS} None of the writings is deleted: each stays in any other Work that holds it, or with your other writing that is not in a Work.`,
  confirm: 'Remove this Work',
  working: 'Removing…',
  cancel: 'Don’t remove',
} as const;

/** Said on the page after a Work was removed. It says only what removal guarantees (no writing was deleted), never where the
 *  writing now lives: that depends on a list that may have changed since the dialog opened. */
export const removedWorkNotice = (title: string, why: 'shared' | 'many' = 'shared'): string =>
  why === 'many'
    ? `“${title}” was removed. None of its writings was deleted.`
    : `“${title}” was removed. The writing itself was not deleted.`;

/** What a Work card's Delete is, so its confirmation can say what is true of THIS Work and no more. */
export type WorkDeleteKind =
  | 'loose'              // writing that no Work holds: only the writing goes (and the conversations about it)
  | 'writing'            // one writing and nothing else: the writing and the Work go
  | 'writing-keeps-work' // one writing plus other parts: the writing goes, the Work stays with what else it holds (asked ON the Work's card: the title is the Work's)
  | 'writing-from-work'  // the same act asked from the WRITING (History, loose list): the title is the writing's, and the Work it is in stays
  | 'empty'              // no writing: only the Work (the declaration) goes
  | 'many';              // several writings: no Delete, only Remove

export function deleteConfirmCopy(kind: Exclude<WorkDeleteKind, 'many'>, title: string): { readonly question: string; readonly body: string } {
  switch (kind) {
    case 'loose':
      return {
        question: DELETE_WORK_COPY.question(title),
        body:
          'This deletes the writing: its sections and drafts, the original file it came from, if there is one, and your conversations '
          + 'with MAIA about the writing. '
          + 'It cannot be undone and there is no archive. Private backups already taken can still hold a copy until they are retired on their normal schedule.',
      };
    case 'writing':
      return {
        question: DELETE_WORK_COPY.question(title),
        body:
          'This deletes the Work and its writing: the sections and drafts, the original file it came from, if there is one, and your '
          + 'conversations with MAIA about the writing. '
          + `It also removes what you built inside the Work: ${WHAT_GOES_WITH_A_WORK}. `
          + 'It cannot be undone and there is no archive. Private backups already taken can still hold a copy until they are retired on their normal schedule.',
      };
    case 'writing-from-work':
      return {
        question: DELETE_WORK_COPY.question(title),
        body:
          'This deletes the writing: its sections and drafts, the original file it came from, if there is one, and your conversations '
          + 'with MAIA about the writing. The Work it is in stays, with what else it holds. '
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
   `refresh` re-reads Home. It is awaited BEFORE the member is told anything about an outcome that changes what is true, and the
   member is never told "Home now shows what is current" unless that re-read worked: a refresh that returns `false` (or throws) is
   reported to the member as a re-read that did not happen. */
type Refresh = () => Promise<unknown>;
const refreshed = async (refresh: Refresh): Promise<boolean> => {
  try { return (await refresh()) !== false; } catch { return false; }
};
/** Re-read every list Home depends on. True only when ALL of them were read: a list that could not be read (it reports false or throws)
 *  makes the whole re-read "did not work", so the page never tells the member it is current when part of it is not. */
export async function reReadAll(loads: ReadonlyArray<() => Promise<boolean>>): Promise<boolean> {
  const read = await Promise.all(loads.map(async (load) => { try { return (await load()) === true; } catch { return false; } }));
  return read.every(Boolean);
}
const HOME_CURRENT = 'Home now shows what is current.';
const HOME_CURRENT_CHECK = 'Home now shows what is current, so check it before you try again.';
const HOME_NOT_RELOADED = 'We could not reload Home either, so reload this page and check before you try again.';

/** What the page learns when the server said yes. `refreshed` is whether the re-read afterwards worked: when it did not, the page may
 *  still show what was just deleted, and the member must be told to reload. */
export interface ActResult {
  readonly refreshed: boolean;
  /** The server's word on whether the Work went (undefined when it did not say, e.g. the writing was already gone). */
  readonly workRemoved?: boolean;
}

/** Said when a re-read after an act that DID happen could not be done: the page may still show what was just deleted. */
export const RELOAD_HOME_LINE = 'We could not reload Home, so reload this page to see what is current.';
const withReload = (message: string, fresh: boolean): string => (fresh ? message : `${message} ${RELOAD_HOME_LINE}`);

export async function runDeleteWork(target: DeleteTarget, fetcher: Fetcher, refresh: Refresh): Promise<ActResult> {
  const outcome = await deleteWork(target, fetcher);
  if (outcome.ok) return { refreshed: await refreshed(refresh), ...(outcome.workRemoved !== undefined ? { workRemoved: outcome.workRemoved } : {}) };
  // Removed, but not yet confirmed: stop listing it AND still say so (and, if the list could not be re-read, say that too).
  if (outcome.removed) { const fresh = await refreshed(refresh); throw new DeletionUnconfirmed(withReload(outcome.message, fresh), outcome.workRemoved); }
  // Shared writing: nothing was deleted and Delete cannot succeed from this card. The server knows something this page may not
  // (the other Work), so the page is re-read before the card offers the other act; if the re-read shows nothing shared the card
  // still shows the server's sentence instead of doing nothing.
  if (outcome.refusal === 'declared_in_other_works') { const fresh = await refreshed(refresh); throw new DeletionSharedMaterial(withReload(outcome.message, fresh)); }
  // A stale card: make the page true first, then say so. The re-read may remove the card that asked, so this goes to the PAGE.
  if (outcome.refusal === 'work_no_longer_holds_it') {
    const fresh = await refreshed(refresh);
    throw new DeletionNotice(`${outcome.message} ${fresh ? HOME_CURRENT : HOME_NOT_RELOADED}`);
  }
  // An outcome we could not learn: re-read, then say so, on the page (the delete may in fact have gone through).
  if (outcome.unknown) {
    const fresh = await refreshed(refresh);
    throw new DeletionNotice(`${outcome.message} ${fresh ? HOME_CURRENT_CHECK : HOME_NOT_RELOADED}`);
  }
  throw new Error(outcome.message);
}

export async function runRemoveWork(workId: string, fetcher: Fetcher, refresh: Refresh): Promise<ActResult> {
  const outcome = await removeWork(workId, fetcher);
  if (outcome.ok) return { refreshed: await refreshed(refresh), workRemoved: true };
  if (outcome.removed) { const fresh = await refreshed(refresh); throw new DeletionUnconfirmed(withReload(outcome.message, fresh), true); }
  if (outcome.unknown) {
    const fresh = await refreshed(refresh);
    throw new DeletionNotice(`${outcome.message} ${fresh ? HOME_CURRENT_CHECK : HOME_NOT_RELOADED}`);
  }
  throw new Error(outcome.message);
}
