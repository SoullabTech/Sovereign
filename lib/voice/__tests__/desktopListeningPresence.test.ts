/**
 * DESKTOP-LISTENING-PRESENCE-01 — the member can see they are being heard.
 *
 * ⛔ THE DEFECT, member-reported 2026-08-30: "it also didnt register what I was
 * saying in the listening field in lower left to indicate that it is hearing
 * me." On the Web Speech path that slot fills continuously. On the Desktop
 * sovereign path it stayed empty for the entire utterance — Whisper is batch
 * and sees the clip only after recording stops, and `onInterimTranscript` was
 * called from the Web Speech and native branches only, never the sovereign one.
 *
 * The cost was not cosmetic. Mid-utterance, on the record, the member said "I'm
 * not very confident this is working" — into a system that was working. A
 * surface that gives no evidence of listening cannot be distinguished from one
 * that is broken, and the member pays that uncertainty every turn.
 *
 * ⭐ WHAT WAS BUILT, AND WHAT IT IS NOT. Every ~2s the chunks captured so far
 * are transcribed by the same local Whisper and shown. These are REAL
 * transcriptions of real audio, not Web-Speech-style interim guesses. Later
 * context can re-word earlier text, but nothing displayed was invented —
 * showing speculative words would be a smaller version of the same untruth
 * this lane keeps repairing.
 *
 * ⛔ AND NOT A TURN. A partial is presentation. The committed turn is still the
 * final transcript the recorder returns.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const FALLBACK = fs.readFileSync(
  path.resolve(__dirname, '../androidVoiceFallback.ts'), 'utf8');
const CONTINUOUS = fs.readFileSync(
  path.resolve(__dirname, '../../../components/voice/ContinuousConversation.tsx'), 'utf8');
const BAR = fs.readFileSync(
  path.resolve(__dirname, '../../../components/voice/VoiceInteractionBar.tsx'), 'utf8');
const LIMITS = fs.readFileSync(
  path.resolve(__dirname, '../desktopUtteranceLimits.ts'), 'utf8');

const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/^\s*\/\/.*$/gm, '');

const FALLBACK_CODE = stripComments(FALLBACK);
const CONTINUOUS_CODE = stripComments(CONTINUOUS);
const BAR_CODE = stripComments(BAR);

describe('1 — the sovereign path feeds the interim slot', () => {
  it('Desktop asks for partials', () => {
    const spread = CONTINUOUS_CODE.match(
      /\.\.\.\(info\.isDesktop \? \{[\s\S]*?\} : \{\}\)/)?.[0] ?? '';
    expect(spread).toContain('partialIntervalMs');
    expect(spread).toContain('onPartial');
  });

  it('partials reach the same interim callback the Web Speech path uses', () => {
    expect(CONTINUOUS_CODE).toMatch(/onPartial:\s*\(text: string\)\s*=>\s*onInterimTranscript\?\.\(text\)/);
  });

  it('the interval is a decided Desktop constant', () => {
    expect(LIMITS).toMatch(/export const DESKTOP_PARTIAL_INTERVAL_MS = 2_000;/);
  });
});

describe('2 — partials are real, and cheap enough to be honest', () => {
  it('a partial clip is transcribed, not guessed', () => {
    expect(FALLBACK_CODE).toMatch(/transcribeClipForDisplay/);
    expect(FALLBACK_CODE).toMatch(/api\/voice\/transcribe-simple/);
  });

  it('the recorder is chunked so a mid-turn clip is decodable', () => {
    // Chunk 0 carries the container header; 0..k concatenated is a complete
    // recording of the first k slices rather than a fragment.
    expect(FALLBACK_CODE).toMatch(/recorder\.start\(PARTIAL_CHUNK_MS\)/);
    expect(FALLBACK_CODE).toMatch(/new Blob\(chunks\.slice\(\)/);
  });

  it('only one partial is in flight at a time', () => {
    expect(FALLBACK_CODE).toMatch(/partialInFlight/);
  });

  it('a partial never commits a turn', () => {
    // The committed transcript is the recorder's return value. onPartial must
    // not be wired to the transcript dispatch path.
    expect(CONTINUOUS_CODE).not.toMatch(/onPartial:\s*\(text: string\)\s*=>\s*onTranscript/);
  });

  it('partial failure is silent, not an event', () => {
    const fn = FALLBACK_CODE.slice(FALLBACK_CODE.indexOf('async function transcribeClipForDisplay'));
    const body = fn.slice(0, fn.indexOf('\n}'));
    expect(body).not.toMatch(/logVoiceEvent/);
  });
});

describe('3 — callers that asked for nothing are unchanged', () => {
  it('the plain recorder.start() path survives for Android and Firefox/Zen', () => {
    expect(FALLBACK_CODE).toMatch(/recorder\.start\(\);/);
  });

  it('the partial timer only exists when both options are supplied', () => {
    expect(FALLBACK_CODE).toMatch(/opts\.partialIntervalMs && opts\.onPartialClip/);
  });
});

describe('4 — the display shows the newest words', () => {
  it('the interim line no longer truncates to one line', () => {
    // ⛔ THE REGRESSION THIS CATCHES. `truncate` clamps to one line and shows
    // the START, so a member speaking a long sentence watches its beginning
    // sit still while everything they add stays invisible.
    const block = BAR_CODE.slice(
      BAR_CODE.indexOf('{interimTranscript}') - 400,
      BAR_CODE.indexOf('{interimTranscript}'));
    expect(block).not.toMatch(/\btruncate\b/);
  });

  it('it wraps and holds a few lines', () => {
    const block = BAR_CODE.slice(
      BAR_CODE.indexOf('{interimTranscript}') - 400,
      BAR_CODE.indexOf('{interimTranscript}'));
    expect(block).toMatch(/whitespace-pre-wrap/);
    expect(block).toMatch(/break-words/);
    expect(block).toMatch(/max-h-/);
  });

  it('it stays pinned to the newest text', () => {
    expect(BAR_CODE).toMatch(/scrollTop = el\.scrollHeight/);
  });
});
