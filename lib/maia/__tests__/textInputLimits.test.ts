import {
  MAX_MAIA_TEXT_INPUT_CHARS,
  isMaiaTextInputWithinLimit,
  maiaTextInputLimitForMode,
} from '../textInputLimits';

describe('MAIA text input limits', () => {
  it('sets the conversational composer limit to 50,000 characters', () => {
    expect(MAX_MAIA_TEXT_INPUT_CHARS).toBe(50_000);
  });

  it('accepts conversational text at the limit', () => {
    expect(isMaiaTextInputWithinLimit('x'.repeat(50_000), 'dialogue')).toBe(true);
  });

  it('rejects conversational text above the limit', () => {
    expect(isMaiaTextInputWithinLimit('x'.repeat(50_001), 'dialogue')).toBe(false);
  });

  it('keeps scribe/session transcript intake unlimited', () => {
    expect(maiaTextInputLimitForMode('scribe')).toBeUndefined();
    expect(maiaTextInputLimitForMode('session')).toBeUndefined();
    expect(isMaiaTextInputWithinLimit('x'.repeat(250_000), 'scribe')).toBe(true);
  });
});
