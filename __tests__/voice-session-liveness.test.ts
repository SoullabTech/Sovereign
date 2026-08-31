/**
 * Fluent listening across silence + a visible live transcript.
 *
 * REPORTED (Kelly, 2026-08-31, PWA on Chrome, measured with a timer):
 *   "it seems like 20 seconds is a timeout … I'd like it to be conversational
 *    where it's just kind of listening in"
 *   "she needs to be fluently listening for at least the first hour of
 *    conversation and more for some"
 *   "the transcription layer at the bottom scrolls off the screen so members
 *    can't see what they are saying is being registered"
 *
 * MECHANISM (two defects, one felt symptom — "she stopped hearing me"):
 *
 *  1. STAND-DOWN ON SILENCE. The Web Speech API ends a recognition epoch after
 *     ~5-8s of quiet; `onend` re-arms only while the conversation reads as
 *     recently active. Those liveness windows were 15-45 SECONDS, so a member
 *     who paused to think lost the mic after a couple of epochs — about the
 *     twenty seconds Kelly timed. A pause is part of a conversation, not the
 *     end of one.
 *
 *  2. INVISIBLE CAPTURE. The live transcript was a single `truncate`d line
 *     inside the bottom bar. `truncate` clips from the START, so the newest
 *     words — the only ones that answer "is it still hearing me?" — were
 *     exactly the ones cut, and the row vanished the instant the state left
 *     'listening'.
 *
 * The two fixes are one change: the mic now stays open across long pauses, and
 * an open mic must be a VISIBLE mic. Lengthening the session without showing
 * what is registered would trade one uncertainty for a worse one.
 *
 * SCOPE: structural pins over the source, in the manner of
 * voicebar-keyboard-dock.test.ts — this repo's jest runs in a Node environment
 * with no @testing-library/react, so there is no rendered-DOM or live-timer
 * proof available here. Real-device confirmation (a >1 minute silent stretch
 * mid-conversation, then speech that still lands) is the merge gate.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { VOICE_TIMING } from '../lib/voice/voiceTiming';

const ROOT = join(__dirname, '..');
const CONTINUOUS = readFileSync(
  join(ROOT, 'components/voice/ContinuousConversation.tsx'),
  'utf8'
);
const BAR = readFileSync(
  join(ROOT, 'components/voice/VoiceInteractionBar.tsx'),
  'utf8'
);

const ONE_HOUR_MS = 60 * 60 * 1000;

/** Body of the conversation-alive gate, which decides every re-arm. */
function aliveGateBody(): string {
  const start = CONTINUOUS.indexOf('function isConversationAlive');
  expect(start).toBeGreaterThan(-1);
  return CONTINUOUS.slice(start, CONTINUOUS.indexOf('}', CONTINUOUS.indexOf('return (', start)));
}

/** The onend block that decides whether a silent epoch ends the session. */
function onendStandDownBlock(): string {
  const start = CONTINUOUS.indexOf('const hasEverSpoken = lastSpeechTime.current > 0;');
  expect(start).toBeGreaterThan(-1);
  return CONTINUOUS.slice(start, CONTINUOUS.indexOf('const hasAccumulatedTranscript', start));
}

describe('session liveness windows', () => {
  it('keeps a conversation alive for at least the first hour', () => {
    expect(VOICE_TIMING.CONVERSATION_ALIVE_MS).toBeGreaterThanOrEqual(ONE_HOUR_MS);
  });

  it('treats the pause after MAIA speaks as fully mid-conversation', () => {
    // The most common place a member goes quiet is right after MAIA finishes.
    // It is the last place the mic should give up, so this window is not
    // allowed to be shorter than the speech-side one.
    expect(VOICE_TIMING.POST_RESPONSE_ALIVE_MS).toBeGreaterThanOrEqual(
      VOICE_TIMING.CONVERSATION_ALIVE_MS
    );
  });

  it('does not confuse liveness with the per-turn silence thresholds', () => {
    // Turn-taking (when to SUBMIT) stays fast; liveness (whether the mic stays
    // open at all) is what got long. Collapsing the two would make MAIA wait
    // an hour before answering.
    expect(VOICE_TIMING.WEB_SILENCE_TALK_MS).toBeLessThan(30_000);
    expect(VOICE_TIMING.CONVERSATION_ALIVE_MS).toBeGreaterThan(
      VOICE_TIMING.WEB_SILENCE_CARE_MS * 10
    );
  });
});

describe('the mic does not stand down on a thoughtful pause', () => {
  it('derives the conversation-alive gate from VOICE_TIMING, not inline seconds', () => {
    const body = aliveGateBody();
    expect(body).toContain('VOICE_TIMING.CONVERSATION_ALIVE_MS');
    expect(body).toContain('VOICE_TIMING.POST_RESPONSE_ALIVE_MS');
    expect(body).toContain('VOICE_TIMING.MIC_TAP_ALIVE_MS');
    // The literals that produced the ~20s stand-down.
    expect(body).not.toMatch(/30_000|15_000|10_000/);
  });

  it('derives the onend stand-down from VOICE_TIMING, not a 45s window', () => {
    const block = onendStandDownBlock();
    expect(block).toContain('VOICE_TIMING.CONVERSATION_ALIVE_MS');
    expect(block).toContain('VOICE_TIMING.POST_RESPONSE_ALIVE_MS');
    expect(block).not.toContain('45000');
  });
});

describe('genuine failure detection is not defanged by the longer window', () => {
  // Staying open across silence must not mean staying open across breakage.
  // A dead mic that never stands down is worse than one that stands down too
  // soon: the member talks into nothing and is never told.
  it('still stops on a rapid-restart loop', () => {
    expect(CONTINUOUS).toContain("handleCaptureLossFnRef.current?.('restart_loop')");
  });

  it('still stops on an abort loop', () => {
    expect(CONTINUOUS).toContain("handleCaptureLossFnRef.current?.('abort_loop')");
  });

  it('still stops on a fatal recognition error', () => {
    expect(CONTINUOUS).toContain("setMicState('ERROR', `onerror_${errorCode}`)");
  });

  it('leaves the silent-death watchdog to detect a mic that stopped emitting', () => {
    expect(CONTINUOUS).toContain('captureForensics');
  });
});

describe('the member can see they are being heard', () => {
  it('renders the transcript in its own layer above the bar', () => {
    expect(BAR).toContain('function LiveTranscriptLayer');
    expect(BAR).toContain('<LiveTranscriptLayer');
  });

  it('never truncates what the member said', () => {
    const start = BAR.indexOf('function LiveTranscriptLayer');
    const layer = BAR
      .slice(start, BAR.indexOf('interface VoiceInteractionBarProps'))
      // Comments name the old behavior in prose; only the markup is under test.
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    expect(layer).not.toContain('truncate');
    // Wrapping + tail-scrolling is what replaces it.
    expect(layer).toContain('whitespace-pre-wrap');
    expect(layer).toContain('overflow-y-auto');
  });

  it('keeps the newest words in view rather than the oldest', () => {
    expect(BAR).toContain('el.scrollTop = el.scrollHeight');
  });

  it('holds the transcript through thinking, not only while listening', () => {
    // It used to blink out at the moment of submission — the one instant the
    // member most needs to see what was captured.
    expect(BAR).toMatch(/voiceState === 'listening' \|\|\s*\n?\s*voiceState === 'thinking'/);
  });

  it('sits above the bar using the bar\'s measured height', () => {
    // A hard-coded offset is how the transcript ended up behind the bar.
    expect(BAR).toContain('bottomOffset={keyboardInset + barHeight}');
    expect(BAR).toContain('getBoundingClientRect().height');
  });

  it('announces the transcript to assistive technology', () => {
    expect(BAR).toContain('aria-live="polite"');
  });
});
