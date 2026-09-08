/**
 * WS-WHOLE-MANUSCRIPT-01 · F-3 (BRIDGE) — how a writer enters their book.
 *
 *   view choice = device-local × Work
 *   default     = Section
 *   storage     = local preference only
 *
 * ⚠️ THIS IS A BRIDGE, NOT THE RULING FULFILLED. F-3 asks for **member × Work**,
 * which needs account-level storage; no preference table exists, and adding one
 * is a migration this lane is not authorized to author. So the choice is kept
 * per device, and the shortfall is stated rather than papered over: a writer who
 * opens the same book on a second device gets Section until a preference store
 * exists. Nothing in the UI may claim otherwise. Cross-device member × Work
 * persistence remains OWED.
 *
 * ⛔ A PREFERENCE MAY NEVER COST A WRITER A WORD. Every read and write is
 * wrapped: browsers refuse `localStorage` in private windows, with site data
 * blocked, and inside some embedded webviews — and this project has already lost
 * member state to exactly that (`beta_user` after WebView resets, in the Anchor's
 * trap list). A view preference is the least important thing on the page. If
 * storage is unavailable, corrupt, or holds a value this module does not
 * recognise, the answer is Section and the writing continues.
 *
 * ⛔ AGE AND PROVENANCE DO NOT CHOOSE. Nothing here inspects when a Work was
 * imported or how old its writing is. An old manuscript is not inferred into
 * Whole Manuscript; the writer chooses how to enter their book (F-3).
 */

export type ManuscriptView = 'section' | 'whole';

/** A Work that has never had a choice made opens in Section. */
export const DEFAULT_MANUSCRIPT_VIEW: ManuscriptView = 'section';

const PREFIX = 'ws.manuscriptView.';

const isView = (v: unknown): v is ManuscriptView => v === 'section' || v === 'whole';

/** Keyed by Work, so one book may stay in Whole Manuscript while another does not. */
const keyFor = (workKey: string) => `${PREFIX}${workKey}`;

export function readManuscriptView(workKey: string): ManuscriptView {
  if (!workKey) return DEFAULT_MANUSCRIPT_VIEW;
  try {
    const raw = window.localStorage.getItem(keyFor(workKey));
    /* An unrecognised value is treated as absence, not as an error to report.
       A preference written by a future version, or corrupted, must not strand a
       writer in a view this build cannot render. */
    return isView(raw) ? raw : DEFAULT_MANUSCRIPT_VIEW;
  } catch {
    return DEFAULT_MANUSCRIPT_VIEW;
  }
}

/**
 * Record the choice. Returns whether it was kept — the caller may want to know,
 * but must not depend on it: the view still changes either way, because the
 * writer's immediate intent outranks whether we could remember it.
 */
export function writeManuscriptView(workKey: string, view: ManuscriptView): boolean {
  if (!workKey) return false;
  try {
    window.localStorage.setItem(keyFor(workKey), view);
    return true;
  } catch {
    return false;
  }
}
