import {
  materializeHeldWebTurn,
  shouldSelfHealSafariRecognition,
} from '../safariSilentDeathRecovery';

const eligible = {
  cause: 'silent_death' as const,
  witness: 'analyser_hearing_voice' as const,
  isSafari: true,
  explicitFloorHeld: true,
  pageHidden: false,
  recognitionActive: true,
  alreadyAttempted: false,
};

describe('VOICE-SAFARI-SILENT-DEATH-01 recovery admission', () => {
  it('admits only the observed Safari recognizer-zombie shape', () => {
    expect(shouldSelfHealSafariRecognition(eligible)).toBe(true);
    expect(shouldSelfHealSafariRecognition({ ...eligible, witness: 'analyser_alive_no_voice' })).toBe(false);
    expect(shouldSelfHealSafariRecognition({ ...eligible, cause: 'track_muted' })).toBe(false);
    expect(shouldSelfHealSafariRecognition({ ...eligible, isSafari: false })).toBe(false);
    expect(shouldSelfHealSafariRecognition({ ...eligible, explicitFloorHeld: false })).toBe(false);
    expect(shouldSelfHealSafariRecognition({ ...eligible, pageHidden: true })).toBe(false);
    expect(shouldSelfHealSafariRecognition({ ...eligible, recognitionActive: false })).toBe(false);
    expect(shouldSelfHealSafariRecognition({ ...eligible, alreadyAttempted: true })).toBe(false);
  });
});

describe('held Safari turn materialization', () => {
  it('keeps finals, preserves interim-only speech, and joins a fresh tail', () => {
    expect(materializeHeldWebTurn('final words', '')).toBe('final words');
    expect(materializeHeldWebTurn('', 'visible interim')).toBe('visible interim');
    expect(materializeHeldWebTurn('first phrase', 'second phrase')).toBe('first phrase second phrase');
  });

  it('does not duplicate a repeated whole-turn interim or final suffix', () => {
    expect(materializeHeldWebTurn('hello there', 'hello there friend')).toBe('hello there friend');
    expect(materializeHeldWebTurn('hello there friend', 'there friend')).toBe('hello there friend');
  });
});
