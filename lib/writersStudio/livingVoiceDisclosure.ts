/**
 * LV-J · DISCLOSURE MEMORY — device-local UI state, and nothing more.
 *
 * ── THE DISTINCTION THIS FILE EXISTS TO HOLD ──────────────────────────────
 *
 *     DISCLOSURE SEEN     device-local UI state
 *     PASSAGE AUTHORITY   never remembered · freshly given every encounter
 *
 * ⛔ REMEMBERING THAT THE DISCLOSURE WAS SHOWN IS NOT REMEMBERING PERMISSION.
 * The stored flag suppresses repetitive explanatory copy. It authorizes
 * nothing, and it must never become an input to whether a passage may be sent.
 * Every encounter still requires both acts, every time:
 *
 *     select a passage  +  press "Explore this passage"
 *
 * That pair is the authority. A writer who has seen the disclosure a hundred
 * times has granted nothing by having seen it.
 *
 * ── WHERE IT MAY LIVE, AND WHERE IT MAY NOT ───────────────────────────────
 *
 * Ruled 2026-09-08: device/browser only.
 *
 *   ✅  localStorage on this browser
 *   ⛔  a member DB attribute
 *   ⛔  MAIA memory
 *   ⛔  Work metadata
 *   ⛔  analytics
 *   ⛔  a voice profile
 *   ⛔  a cross-device preference
 *
 * Clearing site data, a private window, or another device means the writer
 * sees the disclosure again. That is the correct outcome, not a bug: the flag
 * is a convenience on one browser, so its loss costs a paragraph of copy and
 * never costs a permission — because it was never holding one.
 *
 * ── VERSIONED ON PURPOSE ──────────────────────────────────────────────────
 *
 * The key carries the version of the disclosure it acknowledges. If what the
 * disclosure SAYS materially changes, increment `DISCLOSURE_VERSION` and every
 * writer sees the new text once. A silent edit under an old key would let a
 * changed explanation ride on an acknowledgement of the previous one.
 *
 * ⛔ THE PASSAGE NEVER TOUCHES THIS STORE. The only value written is `'true'`.
 */

/** Increment when the disclosure's TEXT materially changes. */
export const DISCLOSURE_VERSION = 1;

export const DISCLOSURE_KEY = `living_voice_disclosure_seen_v${DISCLOSURE_VERSION}`;

/**
 * What the writer is told, once per browser.
 *
 * It states the scope of the act rather than reassuring about it, and it says
 * the thing that is easy to assume otherwise: this is not MAIA reading the
 * Work.
 */
export const DISCLOSURE_COPY =
  'You are handing me this passage, and only this passage, for this one look. ' +
  'I am not reading your Work, I keep nothing of it afterwards, and nothing I ' +
  'say goes into your writing unless you put it there yourself.';

/**
 * Storage is read defensively because it throws in more situations than it
 * looks like it should — a private window, a browser set to block site data,
 * a WebView with storage partitioned away. Every failure resolves to "not
 * seen", which shows the disclosure again. Erring toward showing it is the
 * only safe direction: the failure mode of showing it twice is mild, and the
 * failure mode of suppressing it wrongly is a writer who was never told.
 */
export function hasSeenDisclosure(): boolean {
  try {
    return window.localStorage.getItem(DISCLOSURE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markDisclosureSeen(): void {
  try {
    window.localStorage.setItem(DISCLOSURE_KEY, 'true');
  } catch {
    /* A browser that will not remember it simply shows it again. There is
       nothing here worth reporting to the writer, and nothing to retry. */
  }
}
