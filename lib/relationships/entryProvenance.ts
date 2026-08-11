/**
 * Actor integrity for relational writes.
 *
 * THE FAILURE THIS EXISTS TO PREVENT. An agent driving a real browser inherited
 * a member's session cookie and wrote into that member's real relationship
 * record. The rows rendered as "you wrote" — the member's own words about their
 * own parent, except a machine had written them. Authorship was being derived
 * from WHICH MEMBER RECORD the session pointed at. It must be derived from WHO
 * IS ACTUALLY WRITING.
 *
 * WHAT IS STRUCTURAL HERE (holds regardless of anyone's care):
 *   1. `provenance` is NOT NULL with no database default, so a write path
 *      cannot omit it and silently inherit "member".
 *   2. It is never read from a request body. `resolveWriteProvenance` accepts
 *      no caller-supplied class — a client cannot assert "I am the member".
 *   3. Non-interactive writers (observer, check-in composer, seeds) hardcode
 *      their own class at the call site and never reach this function.
 *   4. `member_authored` is reachable from exactly ONE place: an interactive
 *      request that passes every check below. Everything else degrades to
 *      `test_fixture`, which never renders as the member's words.
 *
 * ⚠️ WHAT IS NOT STRUCTURAL — stated plainly rather than implied away.
 * An agent that drives a real browser, with a real session, and does not
 * announce itself is indistinguishable from a human at the HTTP layer. No
 * check below can refute a determined impersonator. These signals raise the
 * floor from "nothing" to "an agent must actively lie to be mistaken for the
 * member" — they do not make it impossible. Genuine proof would need a signal
 * the automation cannot mint (a platform attestation, or a human-presence
 * factor). That is not built, and this comment must not be read as if it were.
 */

import type { NextRequest } from 'next/server';

export type EntryProvenance =
  | 'member_authored'
  | 'maia_authored'
  | 'observer_derived'
  | 'system_generated'
  | 'test_fixture';

/** Only this class may ever render as the member's own words. */
export const MEMBER_AUTHORED: EntryProvenance = 'member_authored';

/**
 * Automation markers. Any one of these present ⇒ the write can never be
 * attributed to the member. Deliberately generous: a false "test_fixture" is a
 * recoverable labelling error, a false "member_authored" is contamination of
 * someone's account of their own life.
 */
const AUTOMATION_UA = /headlesschrome|puppeteer|playwright|phantomjs|selenium|webdriver|python-requests|node-fetch|curl\/|wget|axios|got\//i;

/**
 * Resolve the provenance of an INTERACTIVE write. There is no parameter by
 * which a caller can request a class — that is the point.
 */
export function resolveWriteProvenance(request: NextRequest): {
  provenance: EntryProvenance;
  reason: string;
} {
  // An explicit agent declaration is honoured immediately. Our own automation
  // sets this so that an honest agent cannot contaminate a member's record
  // even by accident — which is exactly how the contamination happened.
  const declaredAgent =
    request.headers.get('x-agent-actor') ||
    request.headers.get('x-automation') ||
    (process.env.MAIA_AGENT_LANE === '1' ? 'env:MAIA_AGENT_LANE' : null);
  if (declaredAgent) {
    return { provenance: 'test_fixture', reason: `declared agent (${declaredAgent})` };
  }

  const ua = request.headers.get('user-agent') || '';
  if (!ua) {
    return { provenance: 'test_fixture', reason: 'no user-agent (not a browser)' };
  }
  if (AUTOMATION_UA.test(ua)) {
    return { provenance: 'test_fixture', reason: 'automation user-agent' };
  }

  // A real browser form post carries an origin. Scripted fetches usually do
  // not. Absence is treated as non-member.
  if (!request.headers.get('origin') && !request.headers.get('referer')) {
    return { provenance: 'test_fixture', reason: 'no origin/referer (not a browser navigation)' };
  }

  return { provenance: MEMBER_AUTHORED, reason: 'interactive browser session' };
}

/**
 * Does this row represent the member's own voice? The single predicate the UI
 * must use — never `confidence == null`, which only ever meant "the observer
 * did not write this".
 */
export function isMemberVoice(provenance: string | null | undefined): boolean {
  return provenance === MEMBER_AUTHORED;
}
