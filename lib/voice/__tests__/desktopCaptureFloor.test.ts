/**
 * DESKTOP-CAPTURE-FLOOR-01 — waiting is not a finished turn.
 *
 * ⛔ THE DEFECT, device-witnessed 2026-08-30 on the proven Desktop sovereign
 * transport. `recordWithSilenceDetection` seeded `lastLoudAt = Date.now()` at
 * recording start, so the silence holdoff ran from the moment the microphone
 * opened rather than from the end of speech. With minMs 800 and holdoff 1500,
 * a member who tapped and took a breath had the recorder close itself at
 * ~1.5 s. Two symptoms, one cause:
 *
 *   · "tried to listen but quickly clicked off" — the explicit tap appeared
 *     dead because capture ended before the member began.
 *   · the ghost "You" turns — an auto-armed mic nobody spoke into recorded
 *     1.5 s of room tone, which Whisper hallucinated into a 3-char turn. The
 *     witnessed durations were 1502 ms and 2105 ms: the holdoff, not the audio.
 *
 * ⛔ THE CLASS OF DEFECT. Identical to the 8-second ceiling repaired in
 * `DESKTOP-SOVEREIGN-STT-UTTERANCE-LIMIT-01`: numbers authored for a bounded
 * Android *recovery* were inherited by Desktop *conversation* through routing
 * classification, never through a decision. We fixed the ceiling and left the
 * floor, so the same mistake survived one commit longer in a second constant.
 *
 * ⭐ THE RULE. The silence clock may not run until the analyser has actually
 * heard the member. Until then only `maxMs` — the safety ceiling — can stop
 * capture.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const FALLBACK = fs.readFileSync(
  path.resolve(__dirname, '../androidVoiceFallback.ts'), 'utf8');
const CONTINUOUS = fs.readFileSync(
  path.resolve(__dirname, '../../../components/voice/ContinuousConversation.tsx'), 'utf8');
const LIMITS = fs.readFileSync(
  path.resolve(__dirname, '../desktopUtteranceLimits.ts'), 'utf8');

const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const FALLBACK_CODE = stripComments(FALLBACK);
const CONTINUOUS_CODE = stripComments(CONTINUOUS);

// ── 1 · the clock starts at speech, not at recording ───────────────────────
describe('1 — the silence clock starts when the member does', () => {
  it('lastLoudAt is unset until something is heard', () => {
    // ⛔ THE REGRESSION THIS CATCHES: any reappearance of a start-time seed.
    expect(FALLBACK_CODE).not.toMatch(/let lastLoudAt\s*=\s*Date\.now\(\)/);
    expect(FALLBACK_CODE).toMatch(/let lastLoudAt: number \| null = null/);
  });

  it('the silence branch cannot fire before first voice', () => {
    expect(FALLBACK_CODE).toMatch(/if \(lastLoudAt === null\) return;/);
  });

  it('the ceiling is still evaluated while waiting', () => {
    // The member may take as long as they need to begin — but the microphone
    // must not stay open forever on a stuck VAD.
    const body = FALLBACK_CODE.slice(FALLBACK_CODE.indexOf('const checkSilence'));
    const maxIdx = body.indexOf("stop('max')");
    const waitIdx = body.indexOf('if (lastLoudAt === null) return;');
    expect(maxIdx).toBeGreaterThan(-1);
    expect(waitIdx).toBeGreaterThan(-1);
    expect(maxIdx).toBeLessThan(waitIdx);   // ceiling checked BEFORE the wait-return
  });
});

// ── 2 · Desktop gets a decided floor, not an inherited one ─────────────────
describe('2 — the holdoff travels with the ceiling', () => {
  it('Desktop declares its own holdoff', () => {
    expect(LIMITS).toMatch(/export const DESKTOP_SILENCE_HOLDOFF_MS = 2_500;/);
  });

  it('it is passed at the Desktop call site', () => {
    expect(CONTINUOUS_CODE).toMatch(/silenceHoldoffMs:\s*DESKTOP_SILENCE_HOLDOFF_MS/);
  });

  it('it is Desktop-scoped, alongside the ceiling', () => {
    const spread = CONTINUOUS_CODE.match(
      /\.\.\.\(info\.isDesktop \? \{[\s\S]*?\} : \{\}\)/)?.[0] ?? '';
    expect(spread).toContain('DESKTOP_MAX_UTTERANCE_MS');
    expect(spread).toContain('DESKTOP_SILENCE_HOLDOFF_MS');
  });

  it('the Android recovery defaults are untouched', () => {
    // ⛔ Widening these would change Android Chrome and the Firefox/Zen branch,
    // neither of which was witnessed and neither of which asked for it.
    expect(FALLBACK_CODE).toMatch(/DEFAULT_SILENCE_HOLDOFF_MS = 1500/);
    expect(FALLBACK_CODE).toMatch(/DEFAULT_MIN_RECORDING_MS = 800/);
    expect(FALLBACK_CODE).toMatch(/DEFAULT_MAX_RECORDING_MS = 8000/);
  });
});

// ── 3 · the stop decision, executable ──────────────────────────────────────
/** `checkSilence` reproduced exactly, driven through the witnessed cases. */
const shouldStop = (
  s: { elapsed: number; lastLoudAt: number | null; now: number },
  opts: { maxMs: number; minMs: number; silenceHoldoffMs: number },
): 'max' | 'silence' | null => {
  if (s.elapsed >= opts.maxMs) return 'max';
  if (s.lastLoudAt === null) return null;
  const silenceFor = s.now - s.lastLoudAt;
  if (s.elapsed >= opts.minMs && silenceFor >= opts.silenceHoldoffMs) return 'silence';
  return null;
};

const DESKTOP = { maxMs: 120_000, minMs: 800, silenceHoldoffMs: 2_500 };

describe('3 — witnessed cases', () => {
  it('tap, then a breath before speaking → still listening', () => {
    // The exact failure: 1.6s in, nothing heard yet.
    expect(shouldStop({ elapsed: 1600, lastLoudAt: null, now: 1600 }, DESKTOP)).toBe(null);
  });

  it('a long hesitation before speaking → still listening', () => {
    expect(shouldStop({ elapsed: 30_000, lastLoudAt: null, now: 30_000 }, DESKTOP)).toBe(null);
  });

  it('an empty room does NOT become a turn', () => {
    // The ghost "You": auto-armed mic, nobody spoke, 1502ms of room tone.
    expect(shouldStop({ elapsed: 1502, lastLoudAt: null, now: 1502 }, DESKTOP)).toBe(null);
  });

  it('but the ceiling still ends a mic nobody ever spoke into', () => {
    expect(shouldStop({ elapsed: 120_000, lastLoudAt: null, now: 120_000 }, DESKTOP)).toBe('max');
  });

  it('a mid-thought pause is not the end of the turn', () => {
    // Heard 2s ago — under the 2.5s Desktop holdoff.
    expect(shouldStop({ elapsed: 9_000, lastLoudAt: 7_000, now: 9_000 }, DESKTOP)).toBe(null);
  });

  it('a finished turn still ends on silence', () => {
    expect(shouldStop({ elapsed: 9_600, lastLoudAt: 7_000, now: 9_600 }, DESKTOP)).toBe('silence');
  });

  it('the 20s utterance that already passed still passes', () => {
    expect(shouldStop({ elapsed: 20_000, lastLoudAt: 19_900, now: 20_000 }, DESKTOP)).toBe(null);
  });

  it('minMs still protects the very start of speech', () => {
    expect(shouldStop({ elapsed: 700, lastLoudAt: 0, now: 700 }, DESKTOP)).toBe(null);
  });
});
