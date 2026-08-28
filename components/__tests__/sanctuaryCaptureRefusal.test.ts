/**
 * Sanctuary must be refused at the Keep handler, not at the Keep button.
 *
 * CLAUDE.md Sanctuary invariant 6 is absolute: nothing from a Sanctuary session
 * may be saved, extracted, inferred, or converted into long-term memory "under
 * any circumstances, including by user request during the session."
 *
 * The persistent bookmark carried a `!isSanctuary` render guard, and that guard
 * was mistaken for the boundary. It is not — it hides one entry point. Four
 * other callers reach handleCaptureSpirit and none of them checked Sanctuary:
 *
 *   1. handleDoorwayAction, case 'open_reflection'   (relational routing card)
 *   2. the SacredLabDrawer 'capture-spirit' action
 *   3. the 'labAction' window event, action 'capture-spirit'
 *   4. detectJournalCommand() on typed input — "capture this", "journal this", …
 *
 * The stakes are not "a panel opens." handleCaptureSpirit POSTs the last 16
 * turns to /api/capsules/from-chat-window, which distills them and calls
 * createCapsule() — an `INSERT INTO reflection_capsules` that lands BEFORE the
 * member confirms anything in the panel, and that route has no Sanctuary guard
 * of its own. So any of those four paths wrote Sanctuary content to disk.
 * Observed 2026-08-28: the capture panel open in production with the Sanctuary
 * indicator lit.
 *
 * ⚠️ Asserted against source text: the defect is that a guard is ABSENT from a
 * shared handler. A render test exercises one entry point and would pass while
 * the other four stayed open — an instrument that cannot fail on the defect is
 * not evidence for its absence.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const SOURCE = readFileSync(
  join(__dirname, '..', 'OracleConversation.tsx'),
  'utf8',
);

/** The handler body, from its declaration to its dependency array. */
const HANDLER = (() => {
  const start = SOURCE.indexOf('const handleCaptureSpirit = useCallback(async () => {');
  expect(start).toBeGreaterThan(-1);
  const end = SOURCE.indexOf('}, [userId, messages, sessionId', start);
  expect(end).toBeGreaterThan(start);
  return SOURCE.slice(start, end);
})();

describe('Sanctuary refusal lives inside handleCaptureSpirit', () => {
  it('the handler itself refuses in Sanctuary', () => {
    expect(HANDLER).toMatch(/if \(isSanctuary\) \{/);
  });

  it('the refusal returns before any capture request is dispatched', () => {
    const guard = HANDLER.indexOf('if (isSanctuary) {');
    // The dispatch itself, not the route name — that string also appears in
    // the guard's own explanatory comment.
    const post = HANDLER.indexOf("apiFetch('/api/capsules/from-chat-window'");
    expect(guard).toBeGreaterThan(-1);
    expect(post).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(post);
    // …and the guard's own block returns rather than falling through.
    expect(HANDLER.slice(guard, post)).toMatch(/return;/);
  });

  it('the refusal precedes the auth and message-count guards, so Sanctuary is answered first', () => {
    expect(HANDLER.indexOf('if (isSanctuary) {')).toBeLessThan(
      HANDLER.indexOf('if (!userId) {'),
    );
  });

  it('isSanctuary is a dependency — the ref callers must not hold a stale closure', () => {
    // handleCaptureSpiritRef is what the doorway and labAction paths invoke;
    // omitting isSanctuary here would let a capture fire against a Sanctuary
    // session entered after the last memoization.
    expect(SOURCE).toContain('}, [userId, messages, sessionId, isSanctuary]);');
  });

  it('the member is told why, rather than met with a silent no-op', () => {
    const guard = HANDLER.slice(HANDLER.indexOf('if (isSanctuary) {'));
    expect(guard).toMatch(/toast\.error\(/);
    expect(guard).toContain('Sanctuary');
  });
});

describe('the button guard remains, as defense in depth', () => {
  it('the persistent bookmark is still not offered in Sanctuary', () => {
    expect(SOURCE).toContain('{!isSanctuary &&');
  });
});
