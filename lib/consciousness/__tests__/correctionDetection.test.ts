import { detectCorrectionSignal } from '../correctionDetection';

describe('detectCorrectionSignal', () => {
  it('detects repeat: you already asked', () => {
    const r = detectCorrectionSignal("You already asked me that.");
    expect(r.hasCorrectionSignal).toBe(true);
    expect(r.correctionType).toBe('repeat');
    expect(r.confidence).toBeGreaterThan(0.8);
  });

  it('detects repeat: i just said', () => {
    const r = detectCorrectionSignal("I just said it was about trust.");
    expect(r.hasCorrectionSignal).toBe(true);
    expect(r.correctionType).toBe('repeat');
  });

  it('detects misread: that\'s not what i meant', () => {
    const r = detectCorrectionSignal("That's not what I meant at all.");
    expect(r.hasCorrectionSignal).toBe(true);
    expect(r.correctionType).toBe('misread');
  });

  it('detects thread_loss: you aren\'t keeping up', () => {
    const r = detectCorrectionSignal("You aren't keeping up with what I said.");
    expect(r.hasCorrectionSignal).toBe(true);
    expect(r.correctionType).toBe('thread_loss');
    expect(r.matchedPhrase).toBe("you aren't keeping up");
  });

  it('detects thread_loss: you\'re not following', () => {
    const r = detectCorrectionSignal("You're not following what I'm saying.");
    expect(r.hasCorrectionSignal).toBe(true);
    expect(r.correctionType).toBe('thread_loss');
  });

  it('returns no signal for normal messages', () => {
    const r = detectCorrectionSignal("I feel like the platform is getting better.");
    expect(r.hasCorrectionSignal).toBe(false);
    expect(r.correctionType).toBeNull();
    expect(r.confidence).toBe(0);
  });

  it('is case-insensitive', () => {
    const r = detectCorrectionSignal("YOU ALREADY ASKED that.");
    expect(r.hasCorrectionSignal).toBe(true);
    expect(r.correctionType).toBe('repeat');
  });

  it('handles apostrophe variant: thats not what i meant', () => {
    const r = detectCorrectionSignal("Thats not what i meant.");
    expect(r.hasCorrectionSignal).toBe(true);
    expect(r.correctionType).toBe('misread');
  });
});
