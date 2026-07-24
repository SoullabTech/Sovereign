/**
 * Auto-scroll settle verification — fourth, independent mechanism of
 * Issue 1 (2026-07-24 texting-experience audit). Separate from the
 * recency guard (#739/#741, transcript-scroll-resettle.test.ts) and the
 * bottom-anchor layout (#740/#742, mobile-bottom-anchor.test.ts +
 * transcript-reserve-overflow.test.ts) — different failure, different fix.
 *
 * EVIDENCE (physical device, iOS): a programmatic scrollIntoView that
 * correctly reaches the bottom can drift away from it afterward, with no
 * resize and no content-size change to explain the drift —
 * `gap=-13 -> gap=4 -> gap=82`, settling 82px short of true bottom.
 * Elastic/rubber-band overscroll is the leading explanation, especially
 * given the negative-gap overshoot before the positive-gap undershoot —
 * but the fix does not depend on proving that cause. Named neutrally:
 * "Programmatic bottom-scroll can settle short after reaching the natural
 * end on iOS." It verifies the actual resting position after a
 * programmatic bottom-scroll and corrects once if short.
 *
 * NOT a general "whenever scrolling stops, force bottom" observer — that
 * could override a member's own intentional scroll-away (the exact defect
 * #739/#741 fixed on the OTHER guard). This only watches scrolls this code
 * itself initiated, via two independent safeguards:
 *   - `autoScrollGenerationRef`, an operation token so an older debounce
 *     cannot correct after a newer message, resize, or scroll has taken
 *     ownership;
 *   - comparing `lastUserScrollAtRef` against the value captured when the
 *     operation began, so a genuine user gesture (pointerdown/touchstart/
 *     wheel — the same signals #741 wired up) aborts the correction.
 *
 * ACCEPTANCE EVIDENCE (from the founder spec): a successful trace shows
 *   AUTO-SCROLL-START -> gap=-13 -> gap=4 -> gap=82 ->
 *   AUTO-SCROLL-SETTLED-CORRECTED(gap=82) -> gap≈0
 * and the mirror case must also abort cleanly:
 *   AUTO-SCROLL-START -> USER-SCROLL-INTENT(pointerdown) ->
 *   AUTO-SCROLL-SETTLE-ABORTED(user-intent)
 * The second branch is essential — without it this could recreate the
 * "member scroll-away gets stolen" defect #739/#741 already fixed once.
 *
 * SCOPE: OracleConversation.tsx only. Both existing programmatic
 * bottom-scroll call sites (the [messages] effect and the visualViewport
 * resize resettle) now route through the shared beginAutoScroll helper
 * instead of calling scrollIntoView directly — no new call sites, no new
 * global scroll-stop listener.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const SRC = readFileSync(
  join(__dirname, '..', 'components/OracleConversation.tsx'),
  'utf8'
);

function beginAutoScrollBlock(): string {
  const start = SRC.indexOf(
    "const beginAutoScroll = (behavior: ScrollBehavior, label: string) => {"
  );
  const end = SRC.indexOf('\n  };', start) + '\n  };'.length;
  return SRC.slice(start, end);
}

function messagesEffectBlock(): string {
  const start = SRC.indexOf('// Auto-scroll to latest message');
  const end = SRC.indexOf('}, [messages]);', start) + '}, [messages]);'.length;
  return SRC.slice(start, end);
}

function resettleFnBlock(): string {
  const start = SRC.indexOf('const resettle = () => {');
  const end = SRC.indexOf('\n    };', start) + '\n    };'.length;
  return SRC.slice(start, end);
}

describe('beginAutoScroll — operation ownership', () => {
  it('assigns a new generation token per call, before doing anything else observable', () => {
    const block = beginAutoScrollBlock();
    expect(block).toMatch(/const generation = \+\+autoScrollGenerationRef\.current;/);
  });

  it('captures the current lastUserScrollAtRef value as the owner snapshot at start', () => {
    const block = beginAutoScrollBlock();
    expect(block).toMatch(/const ownerScrollAt = lastUserScrollAtRef\.current;/);
  });

  it('still performs the scrollIntoView with the given behavior', () => {
    const block = beginAutoScrollBlock();
    expect(block).toMatch(/messagesEndRef\.current\?\.scrollIntoView\(\{ behavior \}\)/);
  });

  it('ownership loss is checked as two separate conditions, not one combined boolean', () => {
    // Superseded by the founder review split (see the abort-branch describe
    // block below for the full rationale): a single stillOwnsPosition()
    // boolean could not distinguish "a newer operation took over" from
    // "the member actually touched the transcript" in the abort log.
    const block = beginAutoScrollBlock();
    expect(block).toMatch(/const isSuperseded = \(\) => autoScrollGenerationRef\.current !== generation;/);
    expect(block).toMatch(/const isUserIntent = \(\) => lastUserScrollAtRef\.current !== ownerScrollAt;/);
    expect(block).not.toMatch(/stillOwnsPosition/);
  });
});

describe('beginAutoScroll — quiet-interval polling', () => {
  it('polls via requestAnimationFrame, not a fixed setTimeout delay', () => {
    const block = beginAutoScrollBlock();
    expect(block).toMatch(/requestAnimationFrame\(poll\);/);
  });

  it('tracks scrollTop changes to reset the quiet timer, not a single fire-once check', () => {
    const block = beginAutoScrollBlock();
    expect(block).toMatch(/if \(el\.scrollTop !== lastTop\) \{/);
    expect(block).toMatch(/lastTop = el\.scrollTop;/);
    expect(block).toMatch(/quietSince = now;/);
  });

  it('does not correct until the quiet interval has elapsed', () => {
    const block = beginAutoScrollBlock();
    expect(block).toMatch(/if \(now - quietSince < AUTO_SCROLL_QUIET_MS\) \{/);
    expect(block).toMatch(/requestAnimationFrame\(poll\);\s*\n\s*return;/);
  });

  it('has a hard timeout ceiling so a never-quiet scroll cannot poll forever', () => {
    expect(SRC).toMatch(/const AUTO_SCROLL_MAX_WAIT_MS = 3000;/);
    const block = beginAutoScrollBlock();
    expect(block).toMatch(/if \(now - startedAt > AUTO_SCROLL_MAX_WAIT_MS\) \{/);
    expect(block).toMatch(/AUTO-SCROLL-SETTLE-TIMEOUT/);
  });
});

describe('beginAutoScroll — abort branch (the essential mirror case)', () => {
  it('checks supersession and user-intent as two DISTINCT reasons, not one combined boolean', () => {
    // Founder review: a newer programmatic operation is not user intent —
    // conflating them would make the diagnostic record falsely claim a
    // member touched the transcript when ownership merely passed to a
    // newer automatic scroll (e.g. a content-resize renewal).
    const block = beginAutoScrollBlock();
    expect(block).toMatch(/const isSuperseded = \(\) => autoScrollGenerationRef\.current !== generation;/);
    expect(block).toMatch(/const isUserIntent = \(\) => lastUserScrollAtRef\.current !== ownerScrollAt;/);
  });

  it('checks ownership at the top of every poll frame, before reading geometry', () => {
    const block = beginAutoScrollBlock();
    const pollStart = block.indexOf('const poll = () => {');
    const firstCheck = block.indexOf('if (isSuperseded())', pollStart);
    const geometryRead = block.indexOf('el.scrollTop', pollStart);
    expect(firstCheck).toBeGreaterThan(pollStart);
    expect(firstCheck).toBeLessThan(geometryRead);
  });

  it('re-checks BOTH reasons again after the quiet interval, not just once at the start', () => {
    const block = beginAutoScrollBlock();
    const supersededChecks = block.match(/if \(isSuperseded\(\)\) \{/g) || [];
    const userIntentChecks = block.match(/if \(isUserIntent\(\)\) \{/g) || [];
    expect(supersededChecks.length).toBeGreaterThanOrEqual(2);
    expect(userIntentChecks.length).toBeGreaterThanOrEqual(2);
  });

  it('a superseded exit does NOT clear autoScrollActiveRef — a newer operation already owns it', () => {
    const block = beginAutoScrollBlock();
    const supersededIdx = block.indexOf('if (isSuperseded()) {');
    const supersededBranch = block.slice(supersededIdx, block.indexOf('AUTO-SCROLL-SETTLE-ABORTED(superseded)', supersededIdx) + 60);
    expect(supersededBranch).not.toMatch(/autoScrollActiveRef\.current = false/);
  });

  it('a user-intent exit DOES clear autoScrollActiveRef — this operation is really done', () => {
    const block = beginAutoScrollBlock();
    const userIntentIdx = block.indexOf('if (isUserIntent()) {');
    const userIntentBranch = block.slice(userIntentIdx, block.indexOf('AUTO-SCROLL-SETTLE-ABORTED(user-intent)', userIntentIdx) + 60);
    expect(userIntentBranch).toMatch(/autoScrollActiveRef\.current = false;/);
  });

  it('logs AUTO-SCROLL-SETTLE-ABORTED(superseded) and (user-intent) as distinct log lines', () => {
    const block = beginAutoScrollBlock();
    expect(block).toMatch(/AUTO-SCROLL-SETTLE-ABORTED\(superseded\)/);
    expect(block).toMatch(/AUTO-SCROLL-SETTLE-ABORTED\(user-intent\)/);
  });

  it('does not scrollTo (correct) anywhere in either abort path', () => {
    const block = beginAutoScrollBlock();
    const supersededIdx = block.indexOf("pushScrollDebug('AUTO-SCROLL-SETTLE-ABORTED(superseded)');");
    const userIntentIdx = block.indexOf("pushScrollDebug('AUTO-SCROLL-SETTLE-ABORTED(user-intent)');");
    expect(block.slice(supersededIdx, supersededIdx + 60)).not.toMatch(/el\.scrollTo/);
    expect(block.slice(userIntentIdx, userIntentIdx + 60)).not.toMatch(/el\.scrollTo/);
  });
});

describe('beginAutoScroll — correction branch', () => {
  it('only corrects when the gap exceeds a small epsilon, not on any nonzero gap', () => {
    expect(SRC).toMatch(/const BOTTOM_EPSILON_PX = 4;/);
    const block = beginAutoScrollBlock();
    expect(block).toMatch(/if \(gap > BOTTOM_EPSILON_PX\) \{/);
  });

  it('computes gap the same way the existing debug logger does: scrollHeight - clientHeight - scrollTop', () => {
    const block = beginAutoScrollBlock();
    expect(block).toMatch(
      /const gap = el\.scrollHeight - el\.clientHeight - el\.scrollTop;/
    );
  });

  it('corrects with an immediate scroll (behavior: "auto"), never "smooth"', () => {
    const block = beginAutoScrollBlock();
    const correctionIdx = block.indexOf('if (gap > BOTTOM_EPSILON_PX)');
    const correctionBlock = block.slice(correctionIdx, correctionIdx + 200);
    expect(correctionBlock).toMatch(/el\.scrollTo\(\{ top: el\.scrollHeight - el\.clientHeight, behavior: 'auto' \}\)/);
  });

  it('logs the corrected gap value for device-log verification', () => {
    const block = beginAutoScrollBlock();
    expect(block).toMatch(/AUTO-SCROLL-SETTLED-CORRECTED\(gap=\$\{Math\.round\(gap\)\}\)/);
  });

  it('logs a distinct SETTLED (no-correction) line when the gap is already within tolerance', () => {
    const block = beginAutoScrollBlock();
    expect(block).toMatch(/AUTO-SCROLL-SETTLED\(gap=\$\{Math\.round\(gap\)\}\)/);
    expect(block).not.toMatch(/AUTO-SCROLL-SETTLED-CORRECTED\(gap=\$\{Math\.round\(gap\)\}\)\)/);
  });

  it('does not schedule another poll frame after a correction or a no-op settle (cannot loop)', () => {
    // Scoped to the correction/settle branch itself, up through the end of
    // the `poll` function — NOT the whole rest of the block, which would
    // also catch the one legitimate outer `requestAnimationFrame(poll)`
    // that kicks the polling off in the first place.
    const block = beginAutoScrollBlock();
    const correctionIdx = block.indexOf('if (gap > BOTTOM_EPSILON_PX)');
    const pollFnEnd = block.indexOf('\n    };', correctionIdx) + '\n    };'.length;
    const branchToPollEnd = block.slice(correctionIdx, pollFnEnd);
    expect(branchToPollEnd).not.toMatch(/requestAnimationFrame\(poll\)/);
  });
});

describe('call sites — both existing programmatic bottom-scrolls route through beginAutoScroll', () => {
  it('the [messages] effect calls beginAutoScroll with behavior "smooth", not scrollIntoView directly', () => {
    const block = messagesEffectBlock();
    expect(block).toMatch(/beginAutoScroll\('smooth', `messages-effect\(count=\$\{messages\.length\}\)`\)/);
    expect(block).not.toMatch(/scrollIntoView/);
  });

  it('the visualViewport resettle calls beginAutoScroll with behavior "auto", not scrollIntoView directly', () => {
    const block = resettleFnBlock();
    expect(block).toMatch(/beginAutoScroll\('auto', `vv-resize\(scrollAwayMs=\$\{scrollAwayMs\}\)`\)/);
    expect(block).not.toMatch(/scrollIntoView/);
  });

  it('the content-resize ResizeObserver renews an ALREADY-active operation, never starts a fresh one', () => {
    // Founder review: a typewriter/streaming reply can keep growing after
    // the settle poll already gave up on AUTO_SCROLL_MAX_WAIT_MS. Renewal
    // must be gated on autoScrollActiveRef — unconditionally calling
    // beginAutoScroll on every resize would yank a member who scrolled
    // away on purpose while unrelated content resized (the #739/#741
    // defect, reintroduced).
    const start = SRC.indexOf('const observer = new ResizeObserver(() => {');
    const end = SRC.indexOf('});', start) + '});'.length;
    const block = SRC.slice(start, end);
    expect(block).toMatch(/if \(autoScrollActiveRef\.current\) \{/);
    expect(block).toMatch(/beginAutoScroll\('auto', 'content-resize-renew'\);/);
  });

  it('exactly three call sites in the whole file: messages effect, resize resettle, content-resize renewal', () => {
    // The regex requires an immediate '(' after the name, so the
    // definition itself ("beginAutoScroll = (...) => {") does not match —
    // only the three actual invocations do.
    const calls = SRC.match(/beginAutoScroll\(/g) || [];
    expect(calls.length).toBe(3);
  });
});

describe('autoScrollActiveRef — ownership flag for renewal', () => {
  it('is set true at the start of every beginAutoScroll operation', () => {
    const block = beginAutoScrollBlock();
    const generationIdx = block.indexOf('const generation = ++autoScrollGenerationRef.current;');
    const activeIdx = block.indexOf('autoScrollActiveRef.current = true;');
    expect(activeIdx).toBeGreaterThan(generationIdx);
    expect(activeIdx).toBeLessThan(block.indexOf('messagesEndRef.current?.scrollIntoView'));
  });

  it('is cleared on timeout and on a real correction/settle — every exit that is NOT a supersession', () => {
    const block = beginAutoScrollBlock();
    const timeoutIdx = block.indexOf('AUTO-SCROLL-SETTLE-TIMEOUT');
    const timeoutBranch = block.slice(Math.max(0, timeoutIdx - 120), timeoutIdx);
    expect(timeoutBranch).toMatch(/autoScrollActiveRef\.current = false;/);

    const correctionIdx = block.indexOf('if (gap > BOTTOM_EPSILON_PX)');
    const preCorrection = block.slice(block.lastIndexOf('\n', correctionIdx - 40), correctionIdx);
    expect(preCorrection).toMatch(/autoScrollActiveRef\.current = false;/);
  });
});

describe('scope guards', () => {
  it('does not add a generic scroll-stop / scrollend listener anywhere in the file', () => {
    expect(SRC).not.toMatch(/addEventListener\('scrollend'/);
  });

  it('does not touch the #739/#741 recency-guard skip branch', () => {
    expect(SRC).toMatch(/vv-resize-SKIPPED\(recent-user-scroll-away, \$\{scrollAwayMs\}ms\)/);
    expect(SRC).toMatch(/const recentDeliberateScrollAway = !wasNearBottomRef\.current && scrollAwayMs < RECENT_USER_SCROLL_MS;/);
  });

  it('does not touch the #740/#742 conditional footer reserve', () => {
    const block = beginAutoScrollBlock();
    expect(block).not.toMatch(/contentOverflows|messageContentIntrinsicRef|OVERFLOW_EPSILON_PX/);
  });

  it('does not change the #703/#709 bottom clearance geometry', () => {
    expect(SRC).toMatch(/bottom: showChatInterface \? '260px' : '220px',/);
  });
});

/**
 * Visibility-aware pause/resume — founder review, round 2. The settle poll
 * runs on requestAnimationFrame, which browsers throttle heavily once
 * `document.hidden` is true. A member backgrounding Safari mid-reply
 * (switching apps, checking a notification) is routine, not an edge case —
 * without visibility awareness, hidden wall-clock time silently eats
 * AUTO_SCROLL_MAX_WAIT_MS, timing the operation out — abandoning the
 * final-rest check — before the tab is ever foregrounded again. Traced
 * live: this tool's own Browser pane reports document.visibilityState as
 * permanently "hidden," reproducing a 16-real-second stall from a 3-second
 * budget — a confound in that test harness, but a genuine lifecycle hole
 * in the mechanism regardless of what exposed it.
 *
 * Five acceptance cases (founder spec):
 *   1. Foreground operation settles and corrects normally (unchanged —
 *      covered by the correction-branch describe block above).
 *   2. App backgrounds mid-operation, returns, then performs a fresh
 *      final-rest check.
 *   3. User scrolls after returning, so correction aborts.
 *   4. A newer automatic scroll supersedes the paused operation.
 *   5. No listener or polling loop survives after completion or unmount.
 */
describe('visibility-aware pause/resume — PAUSED/RESUMED as explicit lifecycle events', () => {
  it('pausing cancels the pending frame and logs PAUSED, without touching generation or ownerScrollAt', () => {
    // "I would not simply track visible frames indefinitely... generation
    // and ownerScrollAt are untouched, so ownership survives the pause."
    const block = beginAutoScrollBlock();
    const handlerStart = block.indexOf('const handleVisibilityChange = () => {');
    const hiddenBranchEnd = block.indexOf('// Resuming.', handlerStart);
    const hiddenBranch = block.slice(handlerStart, hiddenBranchEnd);
    expect(hiddenBranch).toMatch(/if \(document\.hidden\) \{/);
    expect(hiddenBranch).toMatch(/cancelAnimationFrame\(rafId\);/);
    expect(hiddenBranch).toMatch(/AUTO-SCROLL-SETTLE-PAUSED\(hidden\)/);
    expect(hiddenBranch).not.toMatch(/autoScrollGenerationRef|ownerScrollAt =/);
  });

  it('a background sync that triggers beginAutoScroll while already hidden pauses immediately, without wasting a poll tick', () => {
    const block = beginAutoScrollBlock();
    const finalCheckIdx = block.lastIndexOf("if (typeof document !== 'undefined' && document.hidden) {");
    expect(finalCheckIdx).toBeGreaterThan(-1);
    const finalBlock = block.slice(finalCheckIdx, finalCheckIdx + 200);
    expect(finalBlock).toMatch(/AUTO-SCROLL-SETTLE-PAUSED\(hidden\)/);
    expect(finalBlock).toMatch(/\} else \{\s*\n\s*startWindow\(\);/);
  });

  it('resuming verifies ownership BEFORE starting a fresh window — superseded and user-intent both checked', () => {
    // Acceptance cases 3 & 4: a newer auto-scroll or a genuine gesture
    // during the hidden window must be respected on resume, not silently
    // overridden by blindly restarting.
    const block = beginAutoScrollBlock();
    const handlerStart = block.indexOf('const handleVisibilityChange = () => {');
    const resumingIdx = block.indexOf('// Resuming.', handlerStart);
    const startWindowCallIdx = block.indexOf('startWindow();', resumingIdx);
    const resumeBranch = block.slice(resumingIdx, startWindowCallIdx);
    expect(resumeBranch).toMatch(/if \(isSuperseded\(\)\) \{/);
    expect(resumeBranch).toMatch(/if \(isUserIntent\(\)\) \{/);
    // Ownership checks must come BEFORE the RESUMED log + startWindow call.
    const supersededIdx = resumeBranch.indexOf('isSuperseded()');
    const userIntentIdx = resumeBranch.indexOf('isUserIntent()');
    const resumedLogIdx = resumeBranch.indexOf('AUTO-SCROLL-SETTLE-RESUMED');
    expect(supersededIdx).toBeLessThan(resumedLogIdx);
    expect(userIntentIdx).toBeLessThan(resumedLogIdx);
  });

  it('a superseded resume aborts as (superseded), a genuine-gesture resume aborts as (user-intent) — not one merged reason', () => {
    const block = beginAutoScrollBlock();
    const handlerStart = block.indexOf('const handleVisibilityChange = () => {');
    const resumingIdx = block.indexOf('// Resuming.', handlerStart);
    const startWindowCallIdx = block.indexOf('startWindow();', resumingIdx);
    const resumeBranch = block.slice(resumingIdx, startWindowCallIdx);
    expect(resumeBranch).toMatch(/AUTO-SCROLL-SETTLE-ABORTED\(superseded\)/);
    expect(resumeBranch).toMatch(/AUTO-SCROLL-SETTLE-ABORTED\(user-intent\)/);
  });

  it('a successful resume logs RESUMED, then starts a genuinely fresh window (fresh startedAt/quietSince), not a continuation of the old one', () => {
    // Acceptance case 2. "begin a fresh bounded settle check against the
    // current geometry" — startWindow() resets startedAt/lastTop/quietSince
    // from `now`, so hidden wall-clock time is excluded from the budget,
    // and the resumed window gets the FULL AUTO_SCROLL_MAX_WAIT_MS, not a
    // remainder.
    const block = beginAutoScrollBlock();
    const startWindowStart = block.indexOf('const startWindow = () => {');
    const startWindowEnd = block.indexOf('\n    };', startWindowStart) + '\n    };'.length;
    const startWindowBlock = block.slice(startWindowStart, startWindowEnd);
    expect(startWindowBlock).toMatch(/startedAt = now0;/);
    expect(startWindowBlock).toMatch(/lastTop = -1;/);
    expect(startWindowBlock).toMatch(/quietSince = now0;/);
    expect(startWindowBlock).toMatch(/rafId = requestAnimationFrame\(poll\);/);

    const handlerStart = block.indexOf('const handleVisibilityChange = () => {');
    const resumedLogIdx = block.indexOf('AUTO-SCROLL-SETTLE-RESUMED', handlerStart);
    const startWindowCallIdx = block.indexOf('startWindow();', resumedLogIdx - 20);
    expect(startWindowCallIdx).toBeGreaterThan(resumedLogIdx);
  });

  it('the max-wait ceiling is documented as PER WINDOW, not a global ceiling spanning pause/resume cycles', () => {
    expect(SRC).toMatch(/Hard ceiling PER SETTLE WINDOW/);
    expect(SRC).toMatch(/a backgrounded-then-foregrounded operation\s*\n\s*\/\/ resumes into a FRESH window/);
  });
});

describe('cleanup — no listener or polling loop survives (acceptance case 5)', () => {
  it('cleanup() cancels any pending rAF AND removes the visibilitychange listener', () => {
    const block = beginAutoScrollBlock();
    const cleanupStart = block.indexOf('const cleanup = () => {');
    const cleanupEnd = block.indexOf('\n    };', cleanupStart) + '\n    };'.length;
    const cleanupBlock = block.slice(cleanupStart, cleanupEnd);
    expect(cleanupBlock).toMatch(/cancelAnimationFrame\(rafId\);/);
    expect(cleanupBlock).toMatch(/document\.removeEventListener\('visibilitychange', handleVisibilityChange\);/);
  });

  it('every terminal exit (superseded, user-intent, timeout, settled, corrected) calls cleanup() before returning', () => {
    const block = beginAutoScrollBlock();
    const pollStart = block.indexOf('const poll = () => {');
    const pollEnd = block.indexOf('\n    };', pollStart) + '\n    };'.length;
    const pollBlock = block.slice(pollStart, pollEnd);
    // Every `return;` in poll() must be preceded by a cleanup() call on
    // one of the two immediately preceding lines — the only exception is
    // the "still quiet, keep polling" branch, which deliberately does NOT
    // clean up (the operation is still in flight).
    const stanzas = pollBlock.split('return;').slice(0, -1);
    const keepsPollingStanza = stanzas.find(s => s.includes('rafId = requestAnimationFrame(poll);'));
    const terminalStanzas = stanzas.filter(s => s !== keepsPollingStanza);
    expect(terminalStanzas.length).toBeGreaterThanOrEqual(5); // superseded x2, user-intent x2, timeout, settled/corrected
    terminalStanzas.forEach(stanza => {
      const lastLines = stanza.trimEnd().split('\n').slice(-4).join('\n');
      expect(lastLines).toMatch(/cleanup\(\);/);
    });
  });

  it('cleanup() only clears the shared autoScrollActiveCleanupRef if it is still THIS operation\'s own cleanup', () => {
    // A stale operation's cleanup() firing late (e.g. its own final poll
    // tick, racing a resize renewal that already replaced it) must not
    // clobber the newer operation's registration.
    const block = beginAutoScrollBlock();
    const cleanupStart = block.indexOf('const cleanup = () => {');
    const cleanupEnd = block.indexOf('\n    };', cleanupStart) + '\n    };'.length;
    const cleanupBlock = block.slice(cleanupStart, cleanupEnd);
    expect(cleanupBlock).toMatch(/if \(autoScrollActiveCleanupRef\.current === cleanup\) \{/);
    expect(cleanupBlock).toMatch(/autoScrollActiveCleanupRef\.current = null;/);
  });

  it('a component-unmount effect calls whatever cleanup is currently registered, so a PAUSED (no pending poll) operation cannot leak', () => {
    // The critical case: a PAUSED operation has no scheduled rAF, so
    // nothing would otherwise ever run again to notice the component is
    // gone. This effect is the only thing that can reach it.
    const start = SRC.indexOf('// Unmount safety net for beginAutoScroll');
    const end = SRC.indexOf('}, []);', start) + '}, []);'.length;
    const block = SRC.slice(start, end);
    expect(block).toMatch(/useEffect\(\(\) => \{/);
    expect(block).toMatch(/return \(\) => \{\s*\n\s*autoScrollActiveCleanupRef\.current\?\.\(\);/);
    expect(block).toMatch(/\}, \[\]\);/);
  });

  it('if the transcript element itself is gone mid-poll (unmounted), poll cleans up rather than looping forever', () => {
    const block = beginAutoScrollBlock();
    const elCheckIdx = block.indexOf('if (!el) {');
    const elCheckEnd = block.indexOf('\n      }', elCheckIdx) + '\n      }'.length;
    const elCheckBlock = block.slice(elCheckIdx, elCheckEnd);
    expect(elCheckBlock).toMatch(/cleanup\(\);/);
    expect(elCheckBlock).toMatch(/autoScrollActiveRef\.current = false;/);
  });
});
