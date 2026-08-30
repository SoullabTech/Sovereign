/**
 * DESKTOP-GHOST-REARM-01 — automatic listening needs the member's consent.
 *
 * ⛔ THE DEVICE DEFECT, 2026-08-30. MAIA generated text; every TTS attempt was
 * refused by the sovereignty policy, so no audio played. The response lifecycle
 * completed anyway, the microphone re-armed by itself, heard room noise, and
 * Whisper dispatched a 3-character transcript. Twice. The ghost turn was then
 * answered and DISPLACED the member's real exchange.
 *
 * ⭐ SUPERSEDED IN PART by DESKTOP-HANDS-FREE-CONSENT-01. The original rule was
 * "MAIA must have made an audible sound before the microphone may reopen." It
 * stopped the ghosts and it was the wrong rule: with TTS refused by policy,
 * MAIA always returns text and no audio, so hands-free conversation ended after
 * exactly one exchange. Whether OUR SPEAKER worked is not evidence about
 * whether the MEMBER still wants to talk.
 *
 * The two questions are now answered where each is answerable. CONSENT lives
 * here: a turn came from voice, and the member is in hands-free, which is
 * standing consent until they end it. WAS ANYONE ACTUALLY SPEAKING lives at the
 * audio: `androidVoiceFallback` refuses to submit a capture whose analyser never
 * crossed the speech threshold, so silence cannot become "You".
 *
 * ⭐ WHAT THIS FILE TESTS, AND WHY IT IS SOURCE-SHAPED. The authority itself
 * lives inside a 11k-line React component whose render requires the whole voice
 * stack, so exercising it end-to-end here would test the harness, not the rule.
 * What CAN be pinned exactly is the thing that actually drifted: that the rule
 * exists in ONE place, that every automatic re-arm passes through it, and that
 * the evidence is recorded before the surface-specific early return. Those are
 * the properties whose absence produced the defect.
 *
 * The decision logic is additionally reproduced below and driven through the
 * founder's full acceptance table, so the truth table is executable even though
 * the component is not.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ORACLE = fs.readFileSync(
  path.resolve(__dirname, '../../../components/OracleConversation.tsx'), 'utf8');
const STREAMING = fs.readFileSync(
  path.resolve(__dirname, '../../../hooks/useStreamingVoice.ts'), 'utf8');

// ── 1 · the authority is singular ──────────────────────────────────────────
describe('1 — one authority, not seven predicates', () => {
  it('no automatic re-arm decides for itself', () => {
    // ⛔ THE REGRESSION THIS CATCHES. Seven sites each wrote
    // `if (lastSendWasVoiceRef.current) …startListening(x)`. Any reappearance of
    // that shape is a caller deciding authority again.
    expect(ORACLE).not.toMatch(
      /if \(lastSendWasVoiceRef\.current\)\s*voiceSession\.methods\.startListening/);
  });

  it('every automatic re-arm goes through attemptAutoRearm', () => {
    const viaAuthority = [...ORACLE.matchAll(/attemptAutoRearm\('/g)].length;
    expect(viaAuthority).toBe(7);
  });

  it('the authority reads BOTH halves of the consent boundary', () => {
    // ⭐ THE HALVES CHANGED BY RULING (DESKTOP-HANDS-FREE-CONSENT-01), not by a
    // test being loosened. The second half WAS `responseSpokeRef` — MAIA must
    // have made a sound — which ended every hands-free conversation after one
    // turn once TTS was refused by the sovereignty policy. Whether our speaker
    // worked is not evidence about whether the member still wants to talk.
    //
    // The halves are now: this turn came from voice, AND the member is in
    // hands-free, which is itself standing consent until they end it.
    const fn = ORACLE.slice(ORACLE.indexOf('const mayAutoRearm'));
    const body = fn.slice(0, fn.indexOf('}, []);'));
    expect(body).toContain('lastSendWasVoiceRef.current');   // input modality
    expect(body).toContain('isHandsFree === true');          // standing consent
  });

  it('the explicit Speak tap is NOT routed through the auto authority', () => {
    // Tapping Speak is member consent and must stay available after a silent
    // response — it is the liveness path that makes gating the watchdog safe.
    const tap = ORACLE.indexOf('speak-button-arms-mic');
    expect(tap).toBeGreaterThan(-1);
    const handler = ORACLE.slice(tap, tap + 2000);
    expect(handler).not.toContain('attemptAutoRearm');
  });
});

// ── 2 · the watchdog is not exempt ─────────────────────────────────────────
describe('2 — the watchdog obeys the same authority', () => {
  it('watchdog_recovery is gated, not special-cased', () => {
    // ⛔ An exemption would recreate the defect through a slower door: silent
    // response → ordinary re-arm refused → watchdog fires later → mic reopens.
    expect(ORACLE).toContain("attemptAutoRearm('watchdog_recovery')");
    expect(ORACLE).not.toMatch(/watchdog[\s\S]{0,120}lastSendWasVoiceRef\.current\)\s*voiceSession/);
  });
});

// ── 3 · the evidence is cross-surface and identity-scoped ──────────────────
describe('3 — evidence survives the surface guard', () => {
  it('the belief is recorded BEFORE the PWA early return', () => {
    // ⛔ THE ORIGINAL HOLE. Desktop received these signals and discarded them at
    // `if (!isPwaVoice) return;`. Evidence must be recorded above that line.
    const h = ORACLE.indexOf('const handlePlaybackSignal');
    const guard = ORACLE.indexOf('if (!isPwaVoice) return;', h);
    const before = ORACLE.slice(h, guard);
    expect(before).toContain('TURN_STARTED');
    expect(before).toContain('AUDIO_PLAYING_CONFIRMED');
    expect(before).toContain('responseSpokeRef.current = true');
  });

  it('ONLY audio-confirmed may establish that MAIA spoke', () => {
    const h = ORACLE.indexOf('const handlePlaybackSignal');
    const guard = ORACLE.indexOf('if (!isPwaVoice) return;', h);
    // ⛔ COMMENTS STRIPPED FIRST. The block deliberately DOCUMENTS why
    // AUDIO_FAILED / AUDIO_BLOCKED / AUDIO_ENDED must not grant, so asserting on
    // raw text matches the explanation and fails on the presence of its own
    // rationale. The documentation is the point; the assertion is about code.
    const before = ORACLE.slice(h, guard)
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n').filter((l) => !/^\s*(\/\/|\*)/.test(l)).join('\n');
    for (const nonGranting of ['AUDIO_FAILED', 'AUDIO_BLOCKED', 'AUDIO_ENDED']) {
      expect(before, `${nonGranting} must not grant`).not.toContain(nonGranting);
    }
    // ...and the one that may, does.
    expect(before).toContain('AUDIO_PLAYING_CONFIRMED');
  });

  it('the belief is cleared at TURN START, not at a later completion point', () => {
    // ⛔ A `true` inherited from turn N would authorise re-arm after a SILENT
    // turn N+1 — the defect itself. The reset rides the same channel as the
    // grant, emitted at turn start before any request or playback.
    const start = STREAMING.indexOf('// ─── TURN START ───');
    const window = STREAMING.slice(start, start + 900);
    expect(window).toContain("type: 'TURN_STARTED'");
    expect(window).toContain('turnIdRef.current');
  });

  it('a late confirmation from a previous turn is rejected', () => {
    expect(STREAMING).toMatch(/type: 'AUDIO_PLAYING_CONFIRMED', turnId: turnIdRef\.current/);
    const h = ORACLE.indexOf('const handlePlaybackSignal');
    const before = ORACLE.slice(h, ORACLE.indexOf('if (!isPwaVoice) return;', h));
    expect(before).toContain('spokenTurnIdRef.current === signal.turnId');
  });

  it('reuses the existing turn identity rather than minting a second one', () => {
    // `turnIdRef` is already sent to the server as x-voice-turn-id.
    expect(STREAMING).toContain("'x-voice-turn-id': turnIdRef.current");
  });
});

// ── 4 · the acceptance table, executable ───────────────────────────────────
describe('4 — the acceptance table', () => {
  /** The authority's decision, reproduced exactly. */
  const mayRearm = (lastSendWasVoice: boolean, handsFree: boolean) =>
    lastSendWasVoice && handsFree;

  const CASES: Array<[string, boolean, boolean, boolean]> = [
    // description,                                        voice, handsFree, expected
    ['hands-free voice turn, MAIA spoke',                   true,  true,  true],
    ['hands-free voice turn, MAIA returned text only',      true,  true,  true],
    ['hands-free, TTS refused by sovereignty policy',       true,  true,  true],
    ['hands-free, third consecutive turn',                  true,  true,  true],
    ['push-to-talk voice turn, MAIA spoke',                 true,  false, false],
    ['push-to-talk voice turn, silent response',            true,  false, false],
    ['typed turn, MAIA spoke',                              false, true,  false],
    ['typed turn in hands-free mode',                       false, true,  false],
  ];

  it.each(CASES)('%s → auto-rearm %s', (_d, voice, handsFree, expected) => {
    expect(mayRearm(voice, handsFree)).toBe(expected);
  });

  it('a silent response no longer ends a hands-free conversation', () => {
    // ⛔ THE OVERCORRECTION THIS PINS AGAINST. Under the old rule this case was
    // `false`, which is why voice worked for exactly one exchange.
    expect(mayRearm(true, true)).toBe(true);
  });

  it('the reproduced rule matches the source rule', () => {
    // Guards the table above from drifting away from the component.
    const fn = ORACLE.slice(ORACLE.indexOf('const mayAutoRearm'));
    const body = fn.slice(0, fn.indexOf('}, []);'));
    expect(body).toMatch(/if \(!lastSendWasVoiceRef\.current\) return false;/);
    expect(body).toMatch(/isHandsFree === true/);
    // The retired predicate must not silently return as a gate.
    expect(body).not.toMatch(/if \(!responseSpokeRef\.current\) return false;/);
  });
});
