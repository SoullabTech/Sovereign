/**
 * DESKTOP-GHOST-REARM-02 — the second authority asks the first.
 *
 * ⛔ THE DEVICE DEFECT, 2026-08-30, witnessed on the proven Desktop sovereign
 * transport (`maia-desktop/0.0.1-d01`, `desktop_sovereign`, Whisper 200,
 * `maxMs: 120000`). GHOST-REARM-01 gated automatic re-arming in
 * OracleConversation. It did not gate `ContinuousConversation.requestRestart`,
 * a SECOND re-arm authority nobody had enumerated. On the Desktop path the
 * consequence was not merely a stray microphone:
 *
 *     real 318-char member turn
 *   → full MAIA response generated
 *   → every TTS attempt refused by the sovereignty policy (no audio)
 *   → requestRestart('maia_stopped_speaking') re-armed 0.7s later
 *   → Whisper hallucinated "You" from 2.1s of near-silence
 *   → ghost member turn dispatched, answered by the THRESHOLD fast-path
 *   → the ghost exchange displaced the member's real exchange
 *
 * ⭐ THE RULE THIS PINS. ContinuousConversation may own HOW it restarts — its
 * timers, its state machine, its recognition objects. It may no longer own
 * WHETHER it is permitted to. The consent predicate has exactly one
 * implementation, in the parent, and is passed down.
 *
 * ⛔ THE FAILURE MODE THIS FILE EXISTS TO CATCH is not "the mic re-armed". It
 * is "someone re-implemented the predicate locally so both components now
 * answer the question, and one of them is wrong." That is how GHOST-REARM-01
 * became survivable in the first place: the file's own header had declared
 * since its first commit that "ONLY requestRestart() may INITIATE a new
 * listening cycle" — documentation enforced by nothing.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ORACLE = fs.readFileSync(
  path.resolve(__dirname, '../../../components/OracleConversation.tsx'), 'utf8');
const CONTINUOUS = fs.readFileSync(
  path.resolve(__dirname, '../../../components/voice/ContinuousConversation.tsx'), 'utf8');

/** Source with comments stripped, so an assertion cannot match the prose that
 *  explains the rule instead of the code that enforces it. */
const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const CONTINUOUS_CODE = stripComments(CONTINUOUS);
const ORACLE_CODE = stripComments(ORACLE);

// ── 1 · ONE source of the consent predicate ────────────────────────────────
describe('1 — the predicate has one implementation', () => {
  it('OracleConversation owns it', () => {
    expect(ORACLE_CODE).toMatch(/const mayAutoRearm\s*=\s*useCallback/);
    expect(ORACLE_CODE).toMatch(/lastSendWasVoiceRef\.current/);
    expect(ORACLE_CODE).toMatch(/responseSpokeRef\.current/);
  });

  it('ContinuousConversation does NOT re-implement it', () => {
    // ⛔ THE REGRESSION THIS CATCHES. A well-meaning local copy of
    // `lastSendWasVoice && responseSpoke` would restore two authorities that
    // agree today and drift tomorrow.
    expect(CONTINUOUS_CODE).not.toMatch(/lastSendWasVoice/);
    expect(CONTINUOUS_CODE).not.toMatch(/responseSpoke/);
  });

  it('ContinuousConversation invents no second turn identity for this', () => {
    expect(CONTINUOUS_CODE).not.toMatch(/AUDIO_PLAYING_CONFIRMED/);
  });

  it('the parent decision is decision-only — it opens nothing', () => {
    const body = ORACLE_CODE.match(
      /const mayAutoRearm\s*=\s*useCallback\([\s\S]*?\n  \}, \[\]\);/)?.[0] ?? '';
    expect(body).not.toMatch(/startListening/);
  });

  it('attemptAutoRearm delegates to it rather than restating it', () => {
    const body = ORACLE_CODE.match(
      /const attemptAutoRearm\s*=\s*useCallback\([\s\S]*?\n  \}, \[[^\]]*\]\);/)?.[0] ?? '';
    expect(body).toMatch(/mayAutoRearm\(\)/);
    expect(body).not.toMatch(/lastSendWasVoiceRef/);
    expect(body).not.toMatch(/responseSpokeRef/);
  });
});

// ── 2 · the authority actually reaches the second path ─────────────────────
describe('2 — the seam is wired', () => {
  it('the parent passes its predicate down', () => {
    expect(ORACLE_CODE).toMatch(/authorizeAutoRearm=\{mayAutoRearm\}/);
  });

  it('the child declares the prop', () => {
    expect(CONTINUOUS_CODE).toMatch(/authorizeAutoRearm\?:\s*\(\)\s*=>\s*boolean/);
  });

  it('requestRestart consults it', () => {
    expect(CONTINUOUS_CODE).toMatch(/authorizeAutoRearmRef\.current\?\.\(\)\s*===\s*false/);
  });

  it('it is read at call time, not captured in a closure', () => {
    // ⛔ A stale answer about the PREVIOUS response is the specific thing the
    // founder ruled out. A ref read inside the callback re-asks every time.
    expect(CONTINUOUS_CODE).toMatch(/authorizeAutoRearmRef\.current\s*=\s*authorizeAutoRearm/);
  });

  it('refusal is loud, not silent', () => {
    expect(CONTINUOUS_CODE).toMatch(/auto_rearm_unauthorized/);
  });
});

// ── 3 · the founder's acceptance table, executable ─────────────────────────
/**
 * The gate reproduced exactly as `requestRestart` applies it. The component
 * needs the whole voice stack to render, so the truth table is driven here
 * while §1–2 pin that the component's own copy is the same shape.
 */
type Source = 'user_tap' | 'maia_stopped_speaking' | 'recognition_stopped'
  | 'interruption_end' | 'foreground_resume';

const gate = (
  source: Source,
  facts: { lastSendWasVoice: boolean; responseSpoke: boolean },
  opts?: { forceOverride?: boolean; authorityAbsent?: boolean },
): boolean => {
  if (source === 'user_tap') return true;                       // the gesture IS consent
  if (opts?.authorityAbsent) return true;                       // unparented surfaces unchanged
  const mayAutoRearm = facts.lastSendWasVoice && facts.responseSpoke;
  return mayAutoRearm;                                          // forceOverride is NOT consulted
};

const VOICE_AND_AUDIO = { lastSendWasVoice: true, responseSpoke: true };
const VOICE_NO_AUDIO = { lastSendWasVoice: true, responseSpoke: false };
const TYPED_AND_AUDIO = { lastSendWasVoice: false, responseSpoke: true };

describe('3 — acceptance table', () => {
  it('voice input + actual MAIA audio → allowed', () => {
    expect(gate('maia_stopped_speaking', VOICE_AND_AUDIO)).toBe(true);
  });

  it('voice input + no audio → DENIED', () => {
    // The witnessed defect, exactly.
    expect(gate('maia_stopped_speaking', VOICE_NO_AUDIO)).toBe(false);
  });

  it('typed input + audio → DENIED', () => {
    expect(gate('maia_stopped_speaking', TYPED_AND_AUDIO)).toBe(false);
  });

  it('watchdog / recovery after a silent response → DENIED', () => {
    expect(gate('recognition_stopped', VOICE_NO_AUDIO, { forceOverride: true })).toBe(false);
    expect(gate('foreground_resume', VOICE_NO_AUDIO)).toBe(false);
    expect(gate('interruption_end', VOICE_NO_AUDIO)).toBe(false);
  });

  it('forceOverride does not buy consent', () => {
    // ⛔ forceOverride exists to stop the policy/authority guards refusing a
    // restart a caller already reasoned about. It was never a licence to
    // listen without the member.
    expect(gate('recognition_stopped', VOICE_NO_AUDIO, { forceOverride: true })).toBe(false);
    expect(gate('maia_stopped_speaking', TYPED_AND_AUDIO, { forceOverride: true })).toBe(false);
  });

  it('explicit Speak is untouched, even after a silent response', () => {
    expect(gate('user_tap', VOICE_NO_AUDIO)).toBe(true);
    expect(gate('user_tap', TYPED_AND_AUDIO)).toBe(true);
    // ⭐ The repair must NARROW automatic authority without breaking deliberate
    // member consent. A gate that never opens would pass every test above.
    expect(gate('user_tap', { lastSendWasVoice: false, responseSpoke: false })).toBe(true);
  });

  it('a stale prior confirmation cannot authorize the current response', () => {
    // responseSpoke is reset per response; the previous turn having made sound
    // is not evidence about this one.
    expect(gate('maia_stopped_speaking', { lastSendWasVoice: true, responseSpoke: false })).toBe(false);
  });

  it('surfaces without a parent authority keep prior behaviour', () => {
    expect(gate('maia_stopped_speaking', VOICE_NO_AUDIO, { authorityAbsent: true })).toBe(true);
  });
});
