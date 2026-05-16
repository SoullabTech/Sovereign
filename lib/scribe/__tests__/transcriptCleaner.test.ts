/**
 * Pre-persistence phantom-duplicate guard tests.
 *
 * Covers isLikelyPhantomDuplicate — the single-segment counterpart to the
 * batch-oriented detectPhantomPrefix. Test gates absence integrity:
 * silence/noise tokens must be rejected, and near-identical text from recent
 * chunks must be rejected, so fabricated events cannot enter the continuity
 * field even when a client regresses on the audio-prepending source fix.
 */
import { isLikelyPhantomDuplicate } from '../transcriptCleaner';

describe('isLikelyPhantomDuplicate', () => {
  describe('silence / noise rejection', () => {
    it('rejects empty string', () => {
      expect(isLikelyPhantomDuplicate('', [])).toBe(true);
    });

    it('rejects whitespace-only text', () => {
      expect(isLikelyPhantomDuplicate('   \n  ', [])).toBe(true);
    });

    it('rejects short Whisper hallucinations (under 8 chars)', () => {
      expect(isLikelyPhantomDuplicate('Mm.', [])).toBe(true);
      expect(isLikelyPhantomDuplicate('Yeah.', [])).toBe(true);
      expect(isLikelyPhantomDuplicate('Thanks.', [])).toBe(true);
    });

    it('accepts utterances that meet the meaningful-length floor', () => {
      expect(isLikelyPhantomDuplicate('Thank you very much.', [])).toBe(false);
    });
  });

  describe('near-duplicate rejection (phantom-prefix shape)', () => {
    it('rejects text near-identical to a recent segment', () => {
      const recent = ['This is sentence one for the recording test.'];
      const phantom = 'This is sentence one for the recording test.';
      expect(isLikelyPhantomDuplicate(phantom, recent)).toBe(true);
    });

    it('rejects prefix-contaminated text matching recent text', () => {
      // Phantom shape: same prefix audio re-transcribed across chunks
      const recent = ['This is sentence one for the recording.'];
      const contaminated = 'This is sentence one for the recording...';
      expect(isLikelyPhantomDuplicate(contaminated, recent)).toBe(true);
    });

    it('accepts genuinely new content', () => {
      const recent = ['This is sentence one for the recording.'];
      const newSentence = 'And then she said something completely different about the weather.';
      expect(isLikelyPhantomDuplicate(newSentence, recent)).toBe(false);
    });

    it('rejects when matching ANY recent segment, not just the last', () => {
      const recent = [
        'And then she said something completely different.',
        'This is sentence one for the recording.',
        'Another unrelated utterance.',
      ];
      const contaminated = 'This is sentence one for the recording.';
      expect(isLikelyPhantomDuplicate(contaminated, recent)).toBe(true);
    });

    it('tolerates empty / null entries in recentTexts safely', () => {
      const recent = ['', '   ', 'A real prior sentence here.'];
      expect(isLikelyPhantomDuplicate('A completely fresh utterance now.', recent)).toBe(false);
    });
  });

  describe('absence integrity (the load-bearing case)', () => {
    it('rejects silence chunks even when recentTexts is empty', () => {
      // The first chunk of a session: no prior context, but silence should still
      // never produce a persisted segment.
      expect(isLikelyPhantomDuplicate('', [])).toBe(true);
      expect(isLikelyPhantomDuplicate('.', [])).toBe(true);
    });

    it('rejects re-transcribed prefix audio with no new content', () => {
      // The phantom shape: chunk N's transcription matches chunk N-1's because
      // the prepended audio dominated the Whisper output.
      const recent = ['The session began at three in the afternoon today.'];
      const phantom = 'The session began at three in the afternoon today.';
      expect(isLikelyPhantomDuplicate(phantom, recent)).toBe(true);
    });
  });
});
