import { readFileSync } from 'fs';
import { join } from 'path';

const W = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

describe('TURN-02 · bounded HANDS_FREE capture recovery', () => {
  it('routes first silent_death through the canonical restart authority', () => {
    const src = W('components/voice/ContinuousConversation.tsx');
    const start = src.indexOf('const handleCaptureLoss = useCallback');
    const end = src.indexOf('/**\n   * Attach loss listeners', start);
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const body = src.slice(start, end);

    expect(body).toContain('shouldAttemptAutomaticCaptureRecovery');
    expect(body).toContain("listeningModeRef.current === 'HANDS_FREE'");
    expect(body).toContain('continuousConversation: wantsContinuousConversationRef.current');
    expect(body).toContain('automaticEndpointing: automaticTurnCommitAllowed()');
    expect(body).toContain('restartRequestInFlight: restartRequestInFlightRef.current');
    expect(body).toContain('recoveryAlreadyAttempted: selfHealAttemptedRef.current');
    expect(body).toContain("requestRestartFnRef.current?.('capture_recovery')");

    const spend = body.indexOf('selfHealAttemptedRef.current = true');
    const restart = body.indexOf("requestRestartFnRef.current?.('capture_recovery')");
    const failClosed = body.indexOf('wantsContinuousConversationRef.current = false');
    expect(spend).toBeGreaterThan(-1);
    expect(restart).toBeGreaterThan(spend);
    expect(failClosed).toBeGreaterThan(restart);
    const recoveryBranch = body.slice(spend, failClosed);
    expect(recoveryBranch).toContain('return;');
    expect(recoveryBranch).not.toContain('processAccumulatedTranscript');
    expect(recoveryBranch).not.toContain('onTranscript(');
  });

  it('replenishes the recovery budget only after an actual recognition result', () => {
    const src = W('components/voice/ContinuousConversation.tsx');

    const activityStart = src.indexOf('const markCaptureActivity = useCallback');
    const activityEnd = src.indexOf(
      '// ==========================================================================\n  // 🔬 CAPTURE FORENSICS',
      activityStart,
    );
    const activity = src.slice(activityStart, activityEnd);
    expect(activity).not.toContain('selfHealAttemptedRef.current = false');

    const resultStart = src.indexOf('recognition.onresult =');
    const resultEnd = src.indexOf("logVoiceEvent('voice_transcribe_result'", resultStart);
    const resultPrefix = src.slice(resultStart, resultEnd);
    expect(resultPrefix).toContain('selfHealAttemptedRef.current = false');
  });

  it('preserves TURN-01 explicit floor and manual Pause authority', () => {
    const src = W('components/voice/ContinuousConversation.tsx');
    expect(src).toContain('const explicitFloorOwned = !automaticTurnCommitAllowed()');
    expect(src).toContain('shouldActOnCaptureLiveness');
    expect(src).toContain("sendTriggerRef.current = 'manual'");
    expect(src).toContain('commitTurn: () => commitTurn()');
  });
});
