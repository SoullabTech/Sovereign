import { readFileSync } from 'fs';
import { join } from 'path';

const cc = readFileSync(join(process.cwd(), 'components/voice/ContinuousConversation.tsx'), 'utf8');
const observer = readFileSync(join(process.cwd(), 'lib/voice/turnA4ShadowObserver.ts'), 'utf8');

describe('TURN-03 A4 shadow integration', () => {
  it('keeps A4 observation behind separate research opt-in plus explicit floor ownership', () => {
    expect(cc).toContain('a4ShadowResearchEnabled = false');
    expect(cc).toContain("if (!a4ShadowResearchEnabled || automaticEndpointingAllowed(turnTakingPreferencesRef.current)) return;");
    expect(cc).toContain("noteA4ShadowPauseStarted('web_audio_vad')");
    expect(cc).toContain("noteA4ShadowSpeechResumed('web_audio_vad')");
    expect(cc).toContain("noteA4ShadowPauseStarted('native_audio_level')");
    expect(cc).toContain("noteA4ShadowSpeechResumed('native_audio_level')");
  });

  it('uses audio state, not transcript callbacks, as the A4 pause clock', () => {
    expect(cc).not.toContain("noteA4ShadowSpeechActivity('web_result')");
    expect(cc).not.toContain("noteA4ShadowSpeechActivity('native_partial')");
    expect(cc).toContain('const wasSpeaking = isSpeakingNowRef.current');
    expect(cc).toContain('rawLevel >= 0.02 && !a4NativeSpeakingRef.current');
    expect(cc).toContain('rawLevel < 0.01 && a4NativeSpeakingRef.current');
  });

  it('gives the observer no transcript, cognition, TTS, or commit API', () => {
    expect(observer).not.toContain('processAccumulatedTranscript');
    expect(observer).not.toContain('onTranscript');
    expect(observer).not.toContain('dispatchCognition');
    expect(observer).not.toContain('startTts');
    expect(observer).not.toContain('NativeSpeechRecognition');
  });

  it('gates the historical web VAD commit path off during explicit floor ownership', () => {
    expect(cc).toContain('const adaptiveSilenceThreshold = 5000');
    expect(cc).toContain('if (automaticEndpointingAllowed(turnTakingPreferencesRef.current)');
    expect(cc).toContain("sendTriggerRef.current = 'vad'");
    expect(cc).toContain("trigger: 'vad'");
    expect(cc).toContain('const turnSilenceMs = effectiveSilenceMs()');
  });

  it('records explicit I’m Done as A4 ground truth before canonical commit', () => {
    const start = cc.indexOf('const commitTurn = useCallback');
    const end = cc.indexOf('\n\n  // Assign functions', start);
    const body = cc.slice(start, end);
    expect(body).toContain("noteA4ShadowExplicitYield('ui_im_done')");
    expect(body).toContain("sendTriggerRef.current = 'manual'");
    expect(body).toContain('processAccumulatedTranscript()');
    expect(body).not.toContain('onTranscript(');
  });
});
