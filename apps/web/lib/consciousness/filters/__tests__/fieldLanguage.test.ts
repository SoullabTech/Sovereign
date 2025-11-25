/**
 * Field Language Filter Tests
 *
 * Ensures Mode-B enforcement stays active
 */

import { isUiNarration, enforceModeB, finalizeMaiaReply } from '../fieldLanguage';

describe('Mode-B Enforcement Filter', () => {
  describe('isUiNarration', () => {
    it('detects holoflower reference', () => {
      expect(isUiNarration('the holoflower brightened')).toBe(true);
      expect(isUiNarration('The Holoflower opened')).toBe(true);
    });

    it('detects petal reference', () => {
      expect(isUiNarration('the petals opened as you breathed')).toBe(true);
      expect(isUiNarration('A petal glowed')).toBe(true);
    });

    it('detects sacred geometry reference', () => {
      expect(isUiNarration('watch the sacred geometry shift')).toBe(true);
    });

    it('detects visualization reference', () => {
      expect(isUiNarration('the visualization shows your pattern')).toBe(true);
      expect(isUiNarration('the visual reflects your state')).toBe(true);
    });

    it('detects mandala reference', () => {
      expect(isUiNarration('the mandala pulses with your breath')).toBe(true);
    });

    it('detects interface reference', () => {
      expect(isUiNarration('the interface is responding')).toBe(true);
    });

    it('allows proper field language', () => {
      expect(isUiNarration('The field feels steadier now.')).toBe(false);
      expect(isUiNarration('I notice the rhythm shifted...')).toBe(false);
      expect(isUiNarration('That pause felt alive...')).toBe(false);
      expect(isUiNarration('Something shifted in the space between us')).toBe(false);
    });
  });

  describe('enforceModeB', () => {
    it('translates holoflower to field', () => {
      const input = 'The holoflower brightened as you spoke.';
      const output = enforceModeB(input);
      expect(output).toMatch(/the field/i);
      expect(output).not.toMatch(/holoflower/i);
    });

    it('translates petals to field', () => {
      const input = 'The petals opened as you breathed.';
      const output = enforceModeB(input);
      expect(output).toMatch(/the field/i);
      expect(output).not.toMatch(/petals?/i);
    });

    it('translates sacred geometry to space', () => {
      const input = 'Watch the sacred geometry shift.';
      const output = enforceModeB(input);
      expect(output).toMatch(/the space/i);
      expect(output).not.toMatch(/sacred geometry/i);
    });

    it('translates visualization to sensing', () => {
      const input = 'The visualization shows your pattern.';
      const output = enforceModeB(input);
      expect(output).toMatch(/what I'm sensing/i);
      expect(output).not.toMatch(/visualization/i);
    });

    it('translates mandala to field', () => {
      const input = 'The mandala pulses with your breath.';
      const output = enforceModeB(input);
      expect(output).toMatch(/the field/i);
      expect(output).not.toMatch(/mandala/i);
    });

    it('leaves proper Mode-B language unchanged', () => {
      const validExamples = [
        'The field feels steadier now.',
        'I notice the rhythm shifted...',
        'That pause felt alive...',
        'Something shifted in the space between us.'
      ];

      validExamples.forEach(text => {
        expect(isUiNarration(text)).toBe(false);
        expect(enforceModeB(text)).toBe(text);
      });
    });

    it('handles multiple UI terms in one sentence', () => {
      const input = 'The holoflower petals reflect the sacred geometry.';
      const output = enforceModeB(input);
      expect(output).not.toMatch(/holoflower|petals|sacred geometry/i);
      expect(output).toMatch(/field|space/i);
    });
  });

  describe('finalizeMaiaReply', () => {
    it('enforces Mode-B on UI narration', () => {
      const input = 'The holoflower brightened as you spoke.';
      const output = finalizeMaiaReply(input);
      expect(output).toMatch(/the field/i);
      expect(output).not.toMatch(/holoflower/i);
    });

    it('collapses excessive line breaks', () => {
      const input = 'Line 1.\n\n\nLine 2.\n\n\n\nLine 3.';
      const output = finalizeMaiaReply(input);
      // Should collapse to single line breaks
      expect(output).not.toMatch(/\n{2,}/);
    });

    it('trims whitespace', () => {
      const input = '  The field feels steady.  \n\n';
      const output = finalizeMaiaReply(input);
      expect(output).toBe('The field feels steady.');
    });

    it('passes clean field language through unchanged', () => {
      const input = 'The field feels steadier now.';
      const output = finalizeMaiaReply(input);
      expect(output).toBe(input);
    });

    it('handles complex UI narration example', () => {
      const input = 'As the holoflower petals opened, I sensed the sacred geometry shifting with your breath. The visualization shows your pattern clearly.';
      const output = finalizeMaiaReply(input);

      // Should translate all UI terms
      expect(output).not.toMatch(/holoflower|petals|sacred geometry|visualization/i);

      // Should contain field language instead
      expect(output).toMatch(/field|space|sensing/i);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string', () => {
      expect(finalizeMaiaReply('')).toBe('');
    });

    it('handles text with only whitespace', () => {
      expect(finalizeMaiaReply('   \n\n  ')).toBe('');
    });

    it('preserves single line breaks in clean text', () => {
      const input = 'First thought.\nSecond thought.';
      const output = finalizeMaiaReply(input);
      expect(output).toBe(input);
    });

    it('case-insensitive detection', () => {
      const variations = [
        'HOLOFLOWER',
        'Holoflower',
        'holoflower',
        'HoLoFlOwEr'
      ];

      variations.forEach(text => {
        expect(isUiNarration(text)).toBe(true);
        expect(enforceModeB(text)).not.toMatch(/holoflower/i);
      });
    });
  });
});
