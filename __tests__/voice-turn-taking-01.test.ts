import { readFileSync } from 'fs';
import { join } from 'path';
import {
  CONVERSATIONAL_SPACE_CONFIG,
  DEFAULT_TURN_TAKING_PREFERENCES,
  EMPTY_TURN_RHYTHM,
  automaticEndpointingAllowed,
  observeContinuedPause,
  resolveTurnSilenceMs,
} from '@/lib/voice/turnTaking';

const W = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

describe('TURN-01 · conversational sovereignty', () => {
  it('defaults to Natural + Automatic + learn rhythm', () => {
    expect(DEFAULT_TURN_TAKING_PREFERENCES).toEqual({
      conversationalSpace: 'natural',
      floorControlMode: 'automatic',
      learnRhythm: true,
    });
    expect(resolveTurnSilenceMs(DEFAULT_TURN_TAKING_PREFERENCES)).toBe(3500);
  });

  it('offers monotonically more conversational space', () => {
    const ms = (Object.keys(CONVERSATIONAL_SPACE_CONFIG) as Array<keyof typeof CONVERSATIONAL_SPACE_CONFIG>)
      .map((k) => CONVERSATIONAL_SPACE_CONFIG[k].silenceMs);
    expect(ms).toEqual([1800, 3500, 6000, 10000]);
  });

  it('learning only increases patience and stays inside the selected ceiling', () => {
    let rhythm = { ...EMPTY_TURN_RHYTHM };
    rhythm = observeContinuedPause(rhythm, 4200);
    expect(resolveTurnSilenceMs(DEFAULT_TURN_TAKING_PREFERENCES, rhythm)).toBe(3500); // needs two demonstrations
    rhythm = observeContinuedPause(rhythm, 4600);
    const learned = resolveTurnSilenceMs(DEFAULT_TURN_TAKING_PREFERENCES, rhythm);
    expect(learned).toBeGreaterThanOrEqual(3500);
    expect(learned).toBeLessThanOrEqual(CONVERSATIONAL_SPACE_CONFIG.natural.adaptiveCeilingMs);
  });

  it('explicit floor ownership disables automatic endpoint authority', () => {
    expect(automaticEndpointingAllowed(DEFAULT_TURN_TAKING_PREFERENCES)).toBe(true);
    expect(automaticEndpointingAllowed({
      ...DEFAULT_TURN_TAKING_PREFERENCES,
      floorControlMode: 'explicit',
    })).toBe(false);
  });

  it('removes the native 1.5s/2.5s takeover timers and gates every native automatic commit', () => {
    const src = W('components/voice/ContinuousConversation.tsx');
    expect(src).not.toContain('}, 1500);'); // 1.5s native auto-submit defect
    expect(src).not.toContain('}, 2500);'); // competing 2.5s native auto-submit defect
    expect(src).toContain('const turnSilenceMs = effectiveSilenceMs()');
    expect(src).toContain('automaticTurnCommitAllowed()');
    expect(src).toContain("source: 'native_stop'");
    expect(src).toContain('explicitTurnPrefixRef.current = finalTranscript');
  });

  it('gates audio-level VAD commit behind explicit floor authority', () => {
    const src = W('components/voice/ContinuousConversation.tsx');
    const vadStart = src.indexOf('if (silenceDuration >= adaptiveSilenceThreshold');
    expect(vadStart).toBeGreaterThan(-1);
    const vadEnd = src.indexOf('// 🔥 PWA DUPLEX:', vadStart);
    const vad = src.slice(vadStart, vadEnd);
    const guard = vad.indexOf('if (!automaticTurnCommitAllowed())');
    const commit = vad.indexOf('processAccumulatedTranscript()');
    expect(guard).toBeGreaterThan(-1);
    expect(commit).toBeGreaterThan(guard);
    expect(vad.slice(guard, commit)).toContain("source: 'vad'");
    expect(vad.slice(guard, commit)).toContain('return;');
  });

  it('keeps explicit-floor silence outside liveness teardown authority', () => {
    const src = W('components/voice/ContinuousConversation.tsx');
    const start = src.indexOf('const tick = () => {', src.indexOf('The watchdog: the only observer'));
    const end = src.indexOf('// Failure boundaries that produce no recognition error', start);
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const tick = src.slice(start, end);

    expect(tick).toContain('const explicitFloorOwned = !automaticTurnCommitAllowed()');
    expect(tick).toContain('shouldActOnCaptureLiveness');
    expect(tick).toContain('analyserVoiceAfterRecognition');
    expect(tick).toContain("source: 'liveness_watchdog'");
    expect(tick).toContain("logVoiceEvent('voice_floor_held'");

    const decision = tick.indexOf('const mayEndCapture = shouldActOnCaptureLiveness');
    const teardown = tick.indexOf('handleCaptureLossFnRef.current?.(verdict.cause)');
    expect(decision).toBeGreaterThan(-1);
    expect(teardown).toBeGreaterThan(decision);
    expect(tick.slice(decision, teardown)).toContain('if (!mayEndCapture)');
    expect(tick.slice(decision, teardown)).toContain('return;');
  });

  it('Pause commits through the canonical accumulated-transcript path', () => {
    const src = W('components/voice/ContinuousConversation.tsx');
    const start = src.indexOf('const commitTurn = useCallback');
    expect(start).toBeGreaterThan(-1);
    const body = src.slice(start, src.indexOf('\n\n  // Assign functions', start));
    expect(body).toContain("sendTriggerRef.current = 'manual'");
    expect(body).toContain('processAccumulatedTranscript()');
    expect(body).not.toContain('onTranscript(');
    expect(src).toContain('commitTurn: () => commitTurn()');
  });

  it('member settings persist Space, floor control, and learn-rhythm preferences', () => {
    const migration = W('database/migrations/20260916123000_turn_taking_preferences.sql');
    const service = W('lib/voice/voiceControlsService.ts');
    const panel = W('components/settings/VoiceSettingsPanel.tsx');
    for (const col of ['conversational_space', 'floor_control_mode', 'learn_turn_rhythm']) {
      expect(migration).toContain(col);
      expect(service).toContain(col);
    }
    expect(panel).toContain('Conversational Space');
    expect(panel).toContain('Learn my natural rhythm');
    expect(panel).toContain('Pause button');
  });

  it('voice bar exposes explicit floor ownership as a distinct action from Stop', () => {
    const bar = W('components/voice/VoiceInteractionBar.tsx');
    expect(bar).toContain("holding your floor");
    expect(bar).toContain('Pause');
    expect(bar).toContain('aria-label="Pause speaking — let MAIA respond"');
    expect(bar).not.toContain("I&apos;m done");
    expect(bar).toContain('onClick={onDone}');
    expect(bar).toContain('onClick={onStop}');
  });
});
