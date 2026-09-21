/**
 * WS-EDITORIAL-SCOPE-01 · THE AUTHOR'S CONTROLS, HELD ACROSS A SESSION.
 *
 * ⭐⭐ ONE ASYMMETRY, AND IT IS THE WHOLE FILE:
 *
 *     LATITUDE                PERSISTS    a working preference
 *     PARAGRAPH REMOVAL   ⛔ NEVER        a permission
 *
 * A writer who works at "Passage" should not re-set the slider every time the
 * page reloads — that friction is the surface making the writer do its
 * bookkeeping, and it is half of what made this studio tiring to use.
 *
 * ⛔⛔ THE PARAGRAPH PERMISSION IS NOT THAT KIND OF THING. It is the author
 * saying *you may bring me wording with my paragraph taken out* — once, in a
 * conversation they were present for. Restoring it silently on a later visit
 * would mean MAIA proposing a deletion under a permission the writer granted
 * weeks ago and has no reason to remember giving.
 *
 * ⭐ Sanctuary's law, one floor down: *there is no stealth memory, and a
 * permission the person cannot see themselves granting is not consent.* So it
 * opens OFF on every visit and the writer grants it in the moment or not at all.
 *
 * ⛔ And this is why the restore function takes the stored value and still
 * returns `mayRemoveParagraphs: false` — the refusal is in the CODE PATH, not
 * in a discipline about what the writer happens to save.
 */

import {
  DEFAULT_EDITORIAL_LATITUDE, isEditorialLatitude,
  type EditorialLatitude, type EditorialScopeDeclaration,
} from '@/lib/manuscript/editorialScope/contract';

export const LATITUDE_STORAGE_KEY = 'ws_editing_latitude';

/**
 * ⭐⭐ THE SEQUENCE OVERRIDE IS PER-WORK, so its key carries the Work.
 *
 * ⛔ Not one global switch. A writer deep in a manuscript they know may want
 * wording immediately; the same writer opening something new may not. One
 * switch for both would make the flip mean less than it says.
 *
 * ⭐ AND IT DOES PERSIST, unlike the paragraph permission — deliberately, and
 * the difference is what each one is. Paragraph removal lets MAIA arrive with
 * the writer's words already gone; this only changes the ORDER of a
 * conversation in which nothing is yet removed, under the tightest size bound
 * there is. ⛔ A rule that treated every switch as equally dangerous would
 * teach the writer that none of them are.
 */
export const sequenceOverrideKey = (workId: string) => `ws_propose_immediately:${workId}`;

/**
 * ⭐ What a stored value becomes. Pure, so the asymmetry is falsifiable.
 *
 * ⛔ AN UNREADABLE VALUE IS THE PROTECTIVE DEFAULT, never a guess and never a
 * throw. Storage returns `null` in a private window, after a clear, and in a
 * WebView that has lost its origin — all of which this project has already been
 * bitten by, and none of which should widen what MAIA may do.
 */
export function restoreDeclaration(stored: string | null): EditorialScopeDeclaration {
  const n = stored === null ? NaN : Number(stored);
  return {
    latitude: isEditorialLatitude(n) ? n : DEFAULT_EDITORIAL_LATITUDE,
    /* ⛔⛔ ALWAYS. There is deliberately no branch here to read a stored
       permission, because a branch is a thing a later change can flip. */
    mayRemoveParagraphs: false,
  };
}

/** ⭐ What may be written down. ⛔ The permission is not part of the return. */
export function persistableLatitude(latitude: EditorialLatitude): string {
  return String(latitude);
}

/* ── browser seams, isolated so the law above stays pure ─────────────────── */

export function readStoredLatitude(): EditorialScopeDeclaration {
  try {
    return restoreDeclaration(window.localStorage.getItem(LATITUDE_STORAGE_KEY));
  } catch {
    /* ⛔ Blocked storage is not an error the writer needs to see, and it is not
       a reason to be more permissive. */
    return restoreDeclaration(null);
  }
}

/** ⛔ Only an exact stored `'1'` releases the gate. Anything else keeps it. */
export function readSequenceOverride(workId: string): boolean {
  if (workId === '') return false;
  try {
    return window.localStorage.getItem(sequenceOverrideKey(workId)) === '1';
  } catch { return false; }
}

export function writeSequenceOverride(workId: string, may: boolean): void {
  if (workId === '') return;
  try {
    if (may) window.localStorage.setItem(sequenceOverrideKey(workId), '1');
    else window.localStorage.removeItem(sequenceOverrideKey(workId));
  } catch { /* ⛔ A preference that cannot be saved is not a failure worth raising. */ }
}

export function writeStoredLatitude(latitude: EditorialLatitude): void {
  try {
    window.localStorage.setItem(LATITUDE_STORAGE_KEY, persistableLatitude(latitude));
  } catch { /* ⛔ A preference that cannot be saved is not a failure worth raising. */ }
}
