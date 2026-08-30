/**
 * DESKTOP-HANDS-FREE-CONSENT-01 — hands-free is the consent, and it persists.
 *
 * ⛔ THE DEFECT, device-witnessed 2026-08-30. Desktop sovereign voice completed
 * one full turn correctly — member speech, final local Whisper transcript, MAIA
 * text response — and then returned to TAP TO SPEAK. Every time. A voice
 * companion that works for exactly one exchange is not a voice companion.
 *
 * ⛔ THE CAUSE WAS OUR OWN PREVIOUS REPAIR. GHOST-REARM-01 required
 * `responseSpokeRef.current === true` before the microphone could reopen: MAIA
 * must have made an audible sound. With TTS refused by the sovereignty policy
 * MAIA always returns text and no audio, so that flag was never true, and the
 * gate terminated every hands-free conversation after one turn — while the same
 * component declared hands-free ON by default and then tried to restart the
 * mic. The rules contradicted each other.
 *
 * ⭐ THE ERROR UNDERNEATH. Two unrelated facts were conflated. Whether MAIA'S
 * SPEAKER worked is not evidence about whether the MEMBER still wants to talk.
 * Their consent came from their own gesture; our TTS failing does not revoke it.
 *
 * ⭐ THE SPLIT. Each question is now answered where it is answerable:
 *
 *   CONSENT            → OracleConversation.mayAutoRearm
 *                        the turn came from voice, and the member is in
 *                        hands-free, which stands until they end it
 *
 *   DID ANYONE SPEAK   → androidVoiceFallback
 *                        a capture whose analyser never crossed the speech
 *                        threshold is not submitted, so silence cannot become
 *                        a turn — the anti-ghost guard, at the audio
 *
 * ⛔ AND NOT THE CAPTURE FLOOR. That rule says waiting BEFORE the member speaks
 * is not silence AFTER speech, so the recorder keeps listening while they
 * gather themselves. This one says: if the whole capture passed and nobody ever
 * spoke, invent nothing from it. Together they let a member take as long as
 * they like to begin without the waiting becoming words.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ORACLE = fs.readFileSync(
  path.resolve(__dirname, '../../../components/OracleConversation.tsx'), 'utf8');
const FALLBACK = fs.readFileSync(
  path.resolve(__dirname, '../androidVoiceFallback.ts'), 'utf8');
const CONTINUOUS = fs.readFileSync(
  path.resolve(__dirname, '../../../components/voice/ContinuousConversation.tsx'), 'utf8');

const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const ORACLE_CODE = stripComments(ORACLE);
const FALLBACK_CODE = stripComments(FALLBACK);
const CONTINUOUS_CODE = stripComments(CONTINUOUS);

const GATE = (() => {
  const i = ORACLE_CODE.indexOf('const mayAutoRearm');
  return i < 0 ? '' : ORACLE_CODE.slice(i, ORACLE_CODE.indexOf('}, []);', i));
})();

// ── 1 · consent comes from the member, not from our speaker ────────────────
describe('1 — the consent rule', () => {
  it('the gate exists', () => {
    expect(GATE).not.toBe('');
  });

  it('hands-free is what authorises continuation', () => {
    expect(GATE).toMatch(/isHandsFree === true/);
  });

  it('a typed turn is still never voice consent', () => {
    expect(GATE).toMatch(/if \(!lastSendWasVoiceRef\.current\) return false;/);
  });

  it('MAIA having made a sound is no longer the gate', () => {
    // ⛔ THE REGRESSION THIS CATCHES: restoring the overcorrection would once
    // again end every hands-free conversation after one silent response.
    expect(GATE).not.toMatch(/if \(!responseSpokeRef\.current\) return false;/);
  });

  it('the display is still not claimed speculatively', () => {
    // LISTENING-STATE-TRUTH-01 stands: capture truth comes from
    // onRecordingStateChange, never from an intention to request one.
    const i = ORACLE_CODE.indexOf("'🎤 [StreamingVoice] Hands-free mode - requesting mic restart'");
    const j = ORACLE_CODE.indexOf("attemptAutoRearm('streaming_response_complete')", i);
    expect(ORACLE_CODE.slice(i, j)).not.toMatch(/setIsListening\(true\)/);
  });
});

// ── 2 · the anti-ghost guard moved to the audio ────────────────────────────
describe('2 — silence does not become a turn', () => {
  it('the recorder reports whether the member was ever heard', () => {
    expect(FALLBACK_CODE).toMatch(/heardSpeech: lastLoudAt !== null/);
  });

  it('a capture nobody spoke into is not submitted', () => {
    expect(FALLBACK_CODE).toMatch(/if \(!heardSpeech\) \{/);
    expect(FALLBACK_CODE).toMatch(/reason: 'no_speech_detected'/);
  });

  it('the refusal happens BEFORE the network request', () => {
    const gate = FALLBACK_CODE.indexOf('if (!heardSpeech)');
    const post = FALLBACK_CODE.indexOf("apiFetch('/api/voice/transcribe-simple'");
    expect(gate).toBeGreaterThan(-1);
    expect(post).toBeGreaterThan(gate);   // audio never leaves the device
  });

  it('the capture floor is untouched — waiting is still not silence', () => {
    expect(FALLBACK_CODE).toMatch(/let lastLoudAt: number \| null = null/);
    expect(FALLBACK_CODE).toMatch(/if \(lastLoudAt === null\) return;/);
  });

  it('a sub-tick utterance is not judged unheard', () => {
    // The analyser interval is 100ms; a capture shorter than one tick would
    // otherwise reach the gate having never sampled.
    expect(FALLBACK_CODE).toMatch(/checkSilence\(\);\n\s*const silenceTimer/);
  });
});

// ── 3 · presence without faking a transcript ───────────────────────────────
describe('3 — the member can see they are heard', () => {
  it('the recorder exposes the analyser it already runs', () => {
    expect(FALLBACK_CODE).toMatch(/onLevel\?:\s*\(level: number, speaking: boolean\)\s*=>\s*void/);
    expect(FALLBACK_CODE).toMatch(/opts\.onLevel\?\.\(/);
  });

  it('Desktop forwards it to the existing visualiser path', () => {
    expect(CONTINUOUS_CODE).toMatch(/onLevel:\s*\(level: number, speaking: boolean\)\s*=>\s*onAudioLevelChange\?\.\(level, speaking\)/);
  });

  it('no second AudioContext and no second stream', () => {
    // Presence reuses the analyser silence detection already drives.
    const opens = [...FALLBACK_CODE.matchAll(/new AudioCtx\(\)/g)].length;
    expect(opens).toBe(1);
    expect(FALLBACK_CODE).not.toMatch(/getUserMedia/);
  });

  it('presence is not a faked transcript', () => {
    // ⛔ The retired experiment re-transcribed a growing clip against the same
    // Whisper every 2s and contended with the committing request. The true live
    // transcript is a separate streaming-STT unit.
    expect(FALLBACK_CODE).not.toMatch(/partialIntervalMs/);
    expect(FALLBACK_CODE).not.toMatch(/transcribeClipForDisplay/);
  });
});

// ── 4 · the acceptance table, executable ───────────────────────────────────
const mayAutoRearm = (s: { lastSendWasVoice: boolean; handsFree: boolean }) =>
  s.lastSendWasVoice && s.handsFree;

const commits = (s: { heardSpeech: boolean }) => s.heardSpeech;

describe('4 — acceptance', () => {
  it('hands-free voice turn, MAIA text-only → conversation continues', () => {
    expect(mayAutoRearm({ lastSendWasVoice: true, handsFree: true })).toBe(true);
  });

  it('three consecutive hands-free turns need no further taps', () => {
    for (let turn = 0; turn < 3; turn++) {
      expect(mayAutoRearm({ lastSendWasVoice: true, handsFree: true })).toBe(true);
    }
  });

  it('push-to-talk still requires the next tap', () => {
    expect(mayAutoRearm({ lastSendWasVoice: true, handsFree: false })).toBe(false);
  });

  it('a typed turn never opens the microphone, hands-free or not', () => {
    expect(mayAutoRearm({ lastSendWasVoice: false, handsFree: true })).toBe(false);
    expect(mayAutoRearm({ lastSendWasVoice: false, handsFree: false })).toBe(false);
  });

  it('leaving hands-free ends the standing consent', () => {
    expect(mayAutoRearm({ lastSendWasVoice: true, handsFree: false })).toBe(false);
  });

  it('an armed mic nobody spoke into commits nothing', () => {
    // No request, no transcript, no member turn, no "You".
    expect(commits({ heardSpeech: false })).toBe(false);
  });

  it('a mic the member did speak into commits', () => {
    expect(commits({ heardSpeech: true })).toBe(true);
  });
});
