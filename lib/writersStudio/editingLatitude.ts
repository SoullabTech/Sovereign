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

export function writeStoredLatitude(latitude: EditorialLatitude): void {
  try {
    window.localStorage.setItem(LATITUDE_STORAGE_KEY, persistableLatitude(latitude));
  } catch { /* ⛔ A preference that cannot be saved is not a failure worth raising. */ }
}
