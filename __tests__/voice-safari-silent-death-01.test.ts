import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(process.cwd(), 'components/voice/ContinuousConversation.tsx'), 'utf8');

describe('VOICE-SAFARI-SILENT-DEATH-01 integration', () => {
  it('routes the observed zombie through one evidence-qualified self-heal', () => {
    expect(source).toContain('shouldSelfHealSafariRecognition({');
    expect(source).toContain("witness: String(forensics.witness ?? 'indeterminate') as CaptureSilenceWitness");
    expect(source).toContain('alreadyAttempted: selfHealAttemptedRef.current');
    expect(source).toContain("ensureFreshAndStartFnRef.current?.('safari_silent_death_self_heal')");
    expect(source).toContain("logVoiceEvent('voice_capture_self_heal'");
  });

  it('resets the self-heal latch only when a recognition result arrives', () => {
    expect(source).toContain('if (recognitionResult) selfHealAttemptedRef.current = false;');
    expect(source).toContain('markCaptureActivity(true, true); // 🩺 a RESULT proves the replacement recognizer is alive');
  });

  it('preserves explicit-floor turns across web epoch boundaries and timeouts', () => {
    expect(source).toContain("materializeOutstandingWebTailFnRef.current?.('web_onend_explicit_floor')");
    expect(source).toContain("session.markForRecreate('explicit_floor_tail_carry')");
    expect(source).toContain("materializeOutstandingWebTailFnRef.current?.('web_cycle_timeout_explicit_floor')");
    expect(source).toContain("session.markForRecreate('explicit_floor_cycle_timeout')");
  });

  it("materializes Safari's visible interim before I'm Done checks chars", () => {
    const commitStart = source.indexOf('const commitTurn = useCallback(() => {');
    const materialize = source.indexOf("materializeOutstandingWebTail('ui_im_done')", commitStart);
    const charCheck = source.indexOf('const chars = accumulatedTranscript.current.trim().length;', commitStart);
    expect(commitStart).toBeGreaterThan(-1);
    expect(materialize).toBeGreaterThan(commitStart);
    expect(charCheck).toBeGreaterThan(materialize);
  });
});
