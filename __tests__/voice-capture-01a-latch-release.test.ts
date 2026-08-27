/**
 * VOICE-CAPTURE-01A — the process latch must be released on every early return.
 *
 * `processAccumulatedTranscript` takes a synchronous concurrency latch on its
 * first line:
 *
 *     if (isCallingProcessRef.current) return;   // guard
 *     isCallingProcessRef.current = true;        // latch taken
 *
 * Every path out of the function after that point must set the latch back to
 * false. On 2026-08-27 one path did not: the exact-match dedup guard (Check 1)
 * cleared `accumulatedTranscript` and returned while leaving the latch true.
 * The consequence was not a dropped duplicate — it was a dead session. The
 * FIRST time a member repeated themselves inside the 2s window, the latch stuck
 * and the guard on line one silently swallowed every subsequent turn for the
 * life of the session. Check 2, three lines below, released it correctly; the
 * asymmetry is what made this survive review.
 *
 * WHY THIS IS A SOURCE-READ RATHER THAN A BEHAVIOURAL TEST
 * -------------------------------------------------------
 * `processAccumulatedTranscript` is a `useCallback` closed over refs inside a
 * 3,900-line component that cannot mount without a live SpeechRecognition
 * instance, a MediaStream, and a running conversation. Simulating that to
 * observe one boolean would test the simulation. So we pin the STRUCTURAL
 * invariant instead — the same approach `r2-voice-continuity-contract.test.ts`
 * takes for the streaming route: assert the seam, not a re-enactment of it.
 *
 * This test therefore fails if ANY early return inside the function forgets the
 * release — not merely if this one specific line is deleted. That generality is
 * the point: the defect class is "a new early return is added later and nobody
 * remembers the latch," and a test pinned only to Check 1 would not catch it.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..');
const source = readFileSync(
  join(ROOT, 'components/voice/ContinuousConversation.tsx'),
  'utf8',
);

const LATCH_TAKEN = 'isCallingProcessRef.current = true;';
const LATCH_RELEASED = 'isCallingProcessRef.current = false;';

/**
 * The region of `processAccumulatedTranscript` in which the latch is held:
 * from the line that takes it, to the first line that releases it having
 * completed the send. Early returns inside this region are the ones at risk.
 */
function latchHeldRegion(): string {
  const fnStart = source.indexOf('const processAccumulatedTranscript = useCallback(() => {');
  expect(fnStart).toBeGreaterThan(-1);

  const takenAt = source.indexOf(LATCH_TAKEN, fnStart);
  expect(takenAt).toBeGreaterThan(-1);

  // Bound the search at the next top-level `useCallback(`/`const` declaration
  // after the function, so we never read into a neighbouring handler.
  const nextDecl = source.indexOf('\n  const ', takenAt);
  const end = nextDecl > -1 ? nextDecl : source.length;
  return source.slice(takenAt, end);
}

describe('VOICE-CAPTURE-01A — processAccumulatedTranscript concurrency latch', () => {
  it('takes the latch and guards re-entry on it', () => {
    const region = latchHeldRegion();
    expect(region).toContain(LATCH_TAKEN);
    // The guard that makes the latch load-bearing.
    expect(source).toContain('if (isCallingProcessRef.current) {');
  });

  it('releases the latch on the exact-match dedup return (Check 1)', () => {
    const region = latchHeldRegion();

    // Locate Check 1 by its condition rather than by line number, so the test
    // survives edits above it.
    const checkOneAt = region.indexOf(
      'normalizedTranscript === lastSentNormalized',
    );
    expect(checkOneAt).toBeGreaterThan(-1);

    // The block runs to its first `return;`.
    const returnAt = region.indexOf('return;', checkOneAt);
    expect(returnAt).toBeGreaterThan(checkOneAt);

    const checkOneBlock = region.slice(checkOneAt, returnAt);
    expect(checkOneBlock).toContain(LATCH_RELEASED);
  });

  it('releases the latch on EVERY early return taken while it is held', () => {
    const region = latchHeldRegion();

    // Walk each `return` in the latch-held region. For each, the release must
    // appear between the previous return (or the latch acquisition) and it.
    const offenders: string[] = [];
    let cursor = 0;
    let previousBoundary = 0;

    for (;;) {
      const returnAt = region.indexOf('return;', cursor);
      if (returnAt === -1) break;

      const between = region.slice(previousBoundary, returnAt);
      if (!between.includes(LATCH_RELEASED)) {
        // Report the guard's own text so a failure names the offending path
        // rather than an opaque offset.
        const context = region
          .slice(Math.max(0, returnAt - 260), returnAt)
          .trim()
          .split('\n')
          .slice(-6)
          .join('\n');
        offenders.push(context);
      }

      previousBoundary = returnAt;
      cursor = returnAt + 'return;'.length;
    }

    expect(offenders).toEqual([]);
  });
});
