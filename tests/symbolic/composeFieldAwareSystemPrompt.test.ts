/**
 * composeFieldAwareSystemPrompt — unit tests for the field-aware composer.
 *
 * Pins the suppression contract: while the Astrologer field is non-inactive,
 * integrative blocks (orientation, knowledge field, council, collective,
 * participatory themes) must be dropped, and the Astrologer presence
 * addendum must be prepended after the base.
 */

import {
  composeFieldAwareSystemPrompt,
  SUPPRESSED_IN_FIELD,
  COMPOSITION_ORDER_INACTIVE,
  type SystemPromptBlocks,
} from '@/lib/symbolic/presence/composeFieldAwareSystemPrompt';
import {
  ASTROLOGER_PRESENCE_BLOCK,
  ACTIVATION_ACKNOWLEDGEMENT_REQUESTED,
  ACTIVATION_ACKNOWLEDGEMENT_ACTIVE,
} from '@/lib/symbolic/presence/astrologicalMaia';

const ALL_BLOCKS: SystemPromptBlocks = {
  base: '[BASE-IDENTITY]',
  orientationBlock: '[ORIENTATION]',
  cmEnvironmentBlock: '[CM-ENV]',
  knowledgeFieldBlock: '[KNOWLEDGE-FIELD]',
  reportContextBlock: '[REPORT-CTX]',
  activeThemeBlock: '[ACTIVE-THEME]',
  councilInsights: '[COUNCIL]',
  collectiveWisdom: '[COLLECTIVE]',
  eventArcBlock: '[EVENT-ARC]',
  relationalContextBlock: '[RELATIONAL]',
};

describe('composeFieldAwareSystemPrompt', () => {
  // -------------------------------------------------------------------------
  // INACTIVE state — passthrough composition
  // -------------------------------------------------------------------------

  describe('state: inactive (passthrough)', () => {
    test('all blocks pass through in canonical order', () => {
      const result = composeFieldAwareSystemPrompt('inactive', ALL_BLOCKS);
      expect(result.fieldAddendumIncluded).toBe(false);
      expect(result.suppressed).toEqual([]);
      // Verify each block appears in the order specified by COMPOSITION_ORDER_INACTIVE
      let lastIndex = -1;
      for (const key of COMPOSITION_ORDER_INACTIVE) {
        const value = ALL_BLOCKS[key];
        if (!value) continue;
        const idx = result.systemPrompt.indexOf(value);
        expect(idx).toBeGreaterThan(lastIndex);
        lastIndex = idx;
      }
    });

    test('inactive does NOT include Astrologer presence addendum', () => {
      const result = composeFieldAwareSystemPrompt('inactive', ALL_BLOCKS);
      expect(result.systemPrompt).not.toContain(ASTROLOGER_PRESENCE_BLOCK);
      expect(result.systemPrompt).not.toContain('ROUTER STATE: REQUESTED');
      expect(result.systemPrompt).not.toContain('ROUTER STATE: ACTIVE');
    });

    test('missing optional blocks are dropped', () => {
      const result = composeFieldAwareSystemPrompt('inactive', { base: '[BASE]' });
      expect(result.systemPrompt).toBe('[BASE]');
      expect(result.suppressed).toEqual([]);
    });

    test('all blocks present → all included', () => {
      const result = composeFieldAwareSystemPrompt('inactive', ALL_BLOCKS);
      for (const value of Object.values(ALL_BLOCKS)) {
        expect(result.systemPrompt).toContain(value as string);
      }
    });
  });

  // -------------------------------------------------------------------------
  // REQUESTED state — addendum + suppression
  // -------------------------------------------------------------------------

  describe('state: requested', () => {
    test('Astrologer presence addendum is prepended', () => {
      const result = composeFieldAwareSystemPrompt('requested', ALL_BLOCKS);
      expect(result.fieldAddendumIncluded).toBe(true);
      expect(result.systemPrompt).toContain(ASTROLOGER_PRESENCE_BLOCK);
      expect(result.systemPrompt).toContain('ROUTER STATE: REQUESTED');
    });

    test('addendum follows the base block', () => {
      const result = composeFieldAwareSystemPrompt('requested', ALL_BLOCKS);
      const baseIdx = result.systemPrompt.indexOf('[BASE-IDENTITY]');
      const addendumIdx = result.systemPrompt.indexOf('ROUTER STATE: REQUESTED');
      expect(baseIdx).toBeGreaterThanOrEqual(0);
      expect(addendumIdx).toBeGreaterThan(baseIdx);
    });

    test('REQUESTED variant of activation acknowledgement is in the prompt', () => {
      const result = composeFieldAwareSystemPrompt('requested', ALL_BLOCKS);
      expect(result.systemPrompt).toContain(ACTIVATION_ACKNOWLEDGEMENT_REQUESTED);
    });

    test('integrative blocks are suppressed', () => {
      const result = composeFieldAwareSystemPrompt('requested', ALL_BLOCKS);
      expect(result.systemPrompt).not.toContain('[ORIENTATION]');
      expect(result.systemPrompt).not.toContain('[KNOWLEDGE-FIELD]');
      expect(result.systemPrompt).not.toContain('[ACTIVE-THEME]');
      expect(result.systemPrompt).not.toContain('[COUNCIL]');
      expect(result.systemPrompt).not.toContain('[COLLECTIVE]');
    });

    test('kept blocks pass through', () => {
      const result = composeFieldAwareSystemPrompt('requested', ALL_BLOCKS);
      expect(result.systemPrompt).toContain('[BASE-IDENTITY]');
      expect(result.systemPrompt).toContain('[CM-ENV]');
      expect(result.systemPrompt).toContain('[REPORT-CTX]');
      expect(result.systemPrompt).toContain('[EVENT-ARC]');
      expect(result.systemPrompt).toContain('[RELATIONAL]');
    });

    test('suppressed list reports all five integrative blocks', () => {
      const result = composeFieldAwareSystemPrompt('requested', ALL_BLOCKS);
      expect(result.suppressed.sort()).toEqual([...SUPPRESSED_IN_FIELD].sort());
    });

    test('suppressed list only reports blocks that were actually present', () => {
      const partial: SystemPromptBlocks = {
        base: '[BASE]',
        knowledgeFieldBlock: '[KF]',
        // No orientation, council, collective, or theme
      };
      const result = composeFieldAwareSystemPrompt('requested', partial);
      expect(result.suppressed).toEqual(['knowledgeFieldBlock']);
    });
  });

  // -------------------------------------------------------------------------
  // ACTIVE state — same suppression, different addendum variant
  // -------------------------------------------------------------------------

  describe('state: active', () => {
    test('Astrologer presence addendum included with ACTIVE state header', () => {
      const result = composeFieldAwareSystemPrompt('active', ALL_BLOCKS);
      expect(result.fieldAddendumIncluded).toBe(true);
      expect(result.systemPrompt).toContain('ROUTER STATE: ACTIVE');
    });

    test('ACTIVE variant of activation acknowledgement is in the prompt', () => {
      const result = composeFieldAwareSystemPrompt('active', ALL_BLOCKS);
      expect(result.systemPrompt).toContain(ACTIVATION_ACKNOWLEDGEMENT_ACTIVE);
    });

    test('same suppression as requested', () => {
      const result = composeFieldAwareSystemPrompt('active', ALL_BLOCKS);
      expect(result.systemPrompt).not.toContain('[ORIENTATION]');
      expect(result.systemPrompt).not.toContain('[KNOWLEDGE-FIELD]');
      expect(result.systemPrompt).not.toContain('[COUNCIL]');
      expect(result.systemPrompt).not.toContain('[COLLECTIVE]');
      expect(result.systemPrompt).not.toContain('[ACTIVE-THEME]');
    });

    test('kept blocks pass through', () => {
      const result = composeFieldAwareSystemPrompt('active', ALL_BLOCKS);
      expect(result.systemPrompt).toContain('[CM-ENV]');
      expect(result.systemPrompt).toContain('[REPORT-CTX]');
      expect(result.systemPrompt).toContain('[EVENT-ARC]');
      expect(result.systemPrompt).toContain('[RELATIONAL]');
    });
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------

  test('only base block, in field → addendum still prepended', () => {
    const result = composeFieldAwareSystemPrompt('active', { base: '[BASE]' });
    expect(result.fieldAddendumIncluded).toBe(true);
    expect(result.systemPrompt).toContain('[BASE]');
    expect(result.systemPrompt).toContain(ASTROLOGER_PRESENCE_BLOCK);
    expect(result.suppressed).toEqual([]);
  });

  test('empty base block, in field → addendum still works', () => {
    const result = composeFieldAwareSystemPrompt('active', { base: '' });
    expect(result.fieldAddendumIncluded).toBe(true);
    expect(result.systemPrompt).toContain(ASTROLOGER_PRESENCE_BLOCK);
  });
});
