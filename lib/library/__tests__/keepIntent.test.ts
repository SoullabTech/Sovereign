import { readFileSync } from 'fs';
import { join } from 'path';
import {
  interpretKeepIntent,
  UnresolvedIntentError,
  DEFAULT_USAGE_AUTHORITY,
  USAGE_AUTHORITY_LADDER,
} from '../keepIntent';

describe('keepIntent — the constitutional seam', () => {
  describe('contract: member intent → governed state', () => {
    it("maps a member-facing choice to the exact governed object (the contract shape)", () => {
      const out = interpretKeepIntent({ intent: 'keep', usage: 'Reflect with me', source: 'conversation' });
      expect(out).toEqual({
        memberIntent: 'keep',
        scope: 'member',
        visibility: 'private',
        usageAuthority: 'reflect_with_me',
        lifecycle: 'kept',
        source: 'conversation',
      });
    });

    it('accepts the governed enum directly too', () => {
      const out = interpretKeepIntent({ intent: 'keep', usage: 'use_in_guidance', source: 'manual' });
      expect(out.usageAuthority).toBe('use_in_guidance');
    });

    it('is deterministic — same input, same output', () => {
      const a = interpretKeepIntent({ intent: 'keep', usage: 'Only when I ask', source: 'transcript' });
      const b = interpretKeepIntent({ intent: 'keep', usage: 'Only when I ask', source: 'transcript' });
      expect(a).toEqual(b);
    });
  });

  describe('invariant: easy to keep, slow to become authoritative', () => {
    it('defaults usage authority to the low end when the member does not choose', () => {
      const out = interpretKeepIntent({ intent: 'keep', source: 'conversation' });
      expect(out.usageAuthority).toBe('only_when_i_ask');
      expect(DEFAULT_USAGE_AUTHORITY).toBe('only_when_i_ask');
    });

    it('NEVER yields use_in_guidance by default — authority must be granted deliberately', () => {
      const out = interpretKeepIntent({ intent: 'keep', source: 'conversation' });
      expect(out.usageAuthority).not.toBe('use_in_guidance');
    });
  });

  describe('falsifier #1 in code: never guess — reject under-determined input', () => {
    it('rejects an intent that has no single governed state in v1', () => {
      expect(() => interpretKeepIntent({ intent: 'share' as never, source: 'conversation' }))
        .toThrow(UnresolvedIntentError);
    });

    it('rejects an unrecognized usage choice rather than widening toward guidance', () => {
      expect(() => interpretKeepIntent({ intent: 'keep', usage: 'whenever you feel like it' as never, source: 'conversation' }))
        .toThrow(UnresolvedIntentError);
    });
  });

  describe('no member label leaks below the seam', () => {
    it('emits only governed enum values', () => {
      const out = interpretKeepIntent({ intent: 'keep', usage: 'Store only', source: 'book' });
      expect(USAGE_AUTHORITY_LADDER).toContain(out.usageAuthority);
      expect(out.usageAuthority).toBe('store_only'); // not the label "Store only"
    });
  });

  describe('the seam stays small (test #2: how many concerns does it touch?)', () => {
    it('imports nothing — knows nothing of retrieval, embeddings, prompts, db, or identity', () => {
      const src = readFileSync(join(__dirname, '..', 'keepIntent.ts'), 'utf8');
      // A pure seam has zero module imports. If this ever fails, the interpreter is
      // accumulating downstream responsibilities — the sprawl falsifier, caught in CI.
      const importLines = src.split('\n').filter((l) => /^\s*import\s/.test(l));
      expect(importLines).toEqual([]);
    });
  });
});
