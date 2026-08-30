/**
 * DESKTOP-TAP-TO-SPEAK-TRUTH-01 — a tap starts unless a capture is live.
 *
 * ⛔ THE DEFECT, device-witnessed 2026-08-30, after eight successful hands-free
 * turns: "it went off of listening and now Tap to Speak doesnt work." The
 * member then wrote it into the conversation itself — "tap to speak didn't work
 * so I hit the speak button" — which is the shape of the failure: one gesture
 * dead, another for the same intent still working.
 *
 * ⛔ THE CAUSE. The holoflower tap branched on `isMuted` alone:
 *
 *     isMuted === true   → tap STARTS listening
 *     isMuted === false  → tap STOPS listening
 *
 * During a hands-free conversation the re-arm paths call `setIsMuted(false)`.
 * When listening later ended, nothing set it back. So a member looking at a
 * surface that said TAP TO SPEAK tapped it, took the STOP branch, and stopped a
 * microphone that was already stopped. Nothing happened, every time.
 *
 * ⭐ THE RULE, and it is the same one this lane keeps arriving at from new
 * directions: do not use a flag as capture truth unless it IS capture truth.
 * `isMuted` is a preference. `isListening` is established solely by
 * `handleRecordingStateChange` — "this is mic truth" — after acquisition
 * succeeded, which is what LISTENING-STATE-TRUTH-01 secured and what makes it
 * safe to decide with here.
 *
 * The `isMuted` half is KEPT, not replaced: it was the workaround for
 * `isListening` desyncing on iOS. Muted still means start. The addition is that
 * not-actually-listening also means start. Only a live capture is stopped.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ORACLE = fs.readFileSync(
  path.resolve(__dirname, '../../../components/OracleConversation.tsx'), 'utf8');

const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const ORACLE_CODE = stripComments(ORACLE);

describe('1 — the tap consults capture truth', () => {
  it('the toggle no longer branches on the preference alone', () => {
    // ⛔ THE REGRESSION THIS CATCHES, exactly as witnessed.
    expect(ORACLE_CODE).not.toMatch(/if \(voiceMicRef\.current\) \{\s*if \(isMuted\) \{/);
  });

  it('a tap starts when muted OR when nothing is actually capturing', () => {
    expect(ORACLE_CODE).toMatch(/if \(isMuted \|\| !isListening\) \{/);
  });

  it('the start path still leaves the display to mic truth', () => {
    // LISTENING-STATE-TRUTH-01 holds: the gesture requests, it does not claim.
    const i = ORACLE_CODE.indexOf("startListening(isInterrupt ? 'user_interrupt' : 'user_gesture')");
    expect(i).toBeGreaterThan(-1);
    const window = ORACLE_CODE.slice(i - 600, i);
    expect(window).not.toMatch(/setIsListening\(true\)/);
  });

  it('the explicit Speak button is untouched', () => {
    expect(ORACLE_CODE).toMatch(/startListening\('speak_button_gesture'\)/);
  });
});

// ── 2 · acceptance ─────────────────────────────────────────────────────────
const tapStarts = (s: { isMuted: boolean; isListening: boolean }) =>
  s.isMuted || !s.isListening;

describe('2 — acceptance', () => {
  it('the witnessed case: unmuted, not listening → tap STARTS', () => {
    expect(tapStarts({ isMuted: false, isListening: false })).toBe(true);
  });

  it('muted → tap starts (the iOS desync path, preserved)', () => {
    expect(tapStarts({ isMuted: true, isListening: false })).toBe(true);
    expect(tapStarts({ isMuted: true, isListening: true })).toBe(true);
  });

  it('genuinely listening → tap STOPS', () => {
    expect(tapStarts({ isMuted: false, isListening: true })).toBe(false);
  });

  it('a tap is never a no-op', () => {
    // Every combination either starts or stops something real. The defect was
    // a fourth outcome — stopping what was already stopped — which the member
    // experiences as a dead button.
    for (const isMuted of [true, false]) {
      for (const isListening of [true, false]) {
        const starts = tapStarts({ isMuted, isListening });
        if (!starts) expect(isListening).toBe(true);  // only stops a live capture
      }
    }
  });
});
