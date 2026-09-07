/**
 * EXPORT THE CURRENT DRAFT — the client half of the settle contract.
 *
 * Founder ruling 2026-09-07:
 *
 *   BEFORE EXPORT   settle pending writer saves OR refuse
 *   CALLER SENDS    format + exact server-acknowledged draftVersion
 *   SERVER          exports the draft state for that version, OR 409s
 *   NEVER           silently checkpoint · mint a kept version · export a
 *                   different state than the one the writer settled
 *
 * The decisive falsifier: edit a sentence, press Export while that edit is
 * still pending, and the file must either CONTAIN that sentence or REFUSE. It
 * may never download without it.
 *
 * That is why this module takes a `SettleTarget` rather than a version number.
 * A caller that could pass a bare version has already lost the guarantee: it
 * would be naming a state without having made that state true. The settle and
 * the claim are one act here so they cannot come apart at a call site.
 *
 * ⛔ `null` for a manuscript that has never been drafted — the Source IS the
 * current state there, and there is no draft to settle or to name. That is the
 * one case where sending no claim is correct, and it is passed explicitly so a
 * missing version can never be mistaken for it.
 */

import { settleDraft, type SettleTarget } from './settleDraft';

export type ExportFormat = 'pdf' | 'epub';

export type ExportOutcome =
  | { readonly kind: 'ok'; readonly blob: Blob }
  /** The writer's edits would not finish saving. Nothing was requested. */
  | { readonly kind: 'unsettled' }
  /** The draft moved after settling — someone or something else wrote. */
  | { readonly kind: 'moved' }
  /** There is nothing yet to make a book from. */
  | { readonly kind: 'empty' }
  | { readonly kind: 'error' };

export type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

/**
 * `settle` is the writing session when one is mounted, or `null` when this
 * manuscript has no draft at all (Source-backed export).
 */
export async function exportCurrentDraft(
  fetcher: Fetcher,
  manuscriptId: string,
  format: ExportFormat,
  settle: SettleTarget | null,
  settleOpts?: Parameters<typeof settleDraft>[1],
): Promise<ExportOutcome> {
  let draftVersion: number | undefined;

  if (settle) {
    const settled = await settleDraft(settle, settleOpts);
    if (!settled.ok) return { kind: 'unsettled' };
    draftVersion = settled.version;
  }

  let res: Response;
  try {
    res = await fetcher(`/api/sovereign/manuscripts/${manuscriptId}/render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      /* `draftVersion` is omitted, not sent as undefined-or-null: the server
         distinguishes "no draft to claim" from "a claim about version N", and
         a null would be a third thing neither side has a meaning for. */
      body: JSON.stringify(draftVersion === undefined ? { format } : { format, draftVersion }),
    });
  } catch {
    return { kind: 'error' };
  }

  if (res.ok) return { kind: 'ok', blob: await res.blob() };

  /* 409 covers both settle refusals — `settle_required` (no claim for a draft
     that exists) and `unsettled_draft` (the claim was overtaken). From the
     writer's side they are the same event: the words moved, nothing was made.
     ⛔ Never retried automatically. A retry would settle to a NEWER state and
     export it, which is exactly the substitution the guard exists to stop. */
  if (res.status === 409) return { kind: 'moved' };

  /* A 400 is not one thing. "No sections to render" is the writer having
     nothing yet and must read as that; a rejected format or a malformed claim
     is this module's own bug and must NOT be dressed up as the writer's empty
     page. Read the body rather than inferring from the status. */
  if (res.status === 400) {
    const reason = await res
      .json()
      .then((b: { error?: unknown }) => String(b?.error ?? ''))
      .catch(() => '');
    return reason.includes('no sections') ? { kind: 'empty' } : { kind: 'error' };
  }
  return { kind: 'error' };
}

/**
 * ⚠️ THE WEAKER DOOR — for a surface that holds no pending writing.
 *
 * The Press room has had the Download buttons since before any of this, and it
 * cannot settle: it does not own the writing queue, so it has no pending save
 * to flush and no way to see one belonging to another surface. It reads the
 * version the server acknowledges and names it, which detects MOVEMENT but is
 * not settling and must never be described as it.
 *
 * ⛔ Deliberately a separate function with a blunt name rather than a `null`
 * or a boolean on `exportCurrentDraft`. A flag would let a call site opt out
 * of the guarantee while still reading as the guaranteed path; a different
 * name makes the weaker promise visible where it is chosen.
 *
 * The residual window it cannot close: a save in flight from the writing room
 * landing between this version read and the server's own read. That window is
 * why the settling Export exists in the writing room — this one is for a
 * writer who is not currently writing.
 */
export async function exportWithoutSettling(
  fetcher: Fetcher,
  manuscriptId: string,
  format: ExportFormat,
): Promise<ExportOutcome> {
  let draftVersion: number | undefined;
  try {
    const state = await fetcher(`/api/sovereign/manuscripts/${manuscriptId}/write-state`);
    if (state.ok) {
      const body = (await state.json()) as { mode?: string; version?: number };
      /* `no_draft` (and a 404, which means the same) carries no version, and
         sending none is correct there: the Source IS the current state. */
      if (body?.mode !== 'no_draft' && typeof body?.version === 'number') {
        draftVersion = body.version;
      }
    } else if (state.status !== 404) {
      return { kind: 'error' };
    }
  } catch {
    return { kind: 'error' };
  }

  /* A synthetic target that settles instantly: there is nothing here to
     flush, and the version was read a moment ago from the server. */
  return exportCurrentDraft(
    fetcher,
    manuscriptId,
    format,
    draftVersion === undefined
      ? null
      : {
          flushPending: () => {},
          hasUnsavedWork: () => false,
          currentRevisionId: () => draftVersion as number,
        },
  );
}
