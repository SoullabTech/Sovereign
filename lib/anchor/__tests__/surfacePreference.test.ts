/**
 * Daily Anchor surface-preference — standing-consent vocabulary, pinned as-is.
 *
 * These tests characterize the CURRENT behavior of lib/anchor/surfacePreference.ts
 * only: the value vocabulary (CHECK-constraint mirror), the ambient-eligible
 * subset, and the input validator at the gesture route. They prescribe nothing
 * about consent semantics and deliberately do NOT touch the enforcement lane —
 * ambient exclusion is enforced as a literal SQL predicate in
 * lib/anchor/loadRecentAnchors.ts and grep-audited by the refusal registry (R08).
 *
 * Constitutional anchor: docs/canon/SPIRAL_CONTINUITY_ENGINE.md §7
 * (ambient-surfacing boundary).
 */
import {
  AMBIENT_ELIGIBLE_ANCHOR_SURFACE_PREFERENCES,
  VALID_ANCHOR_SURFACE_PREFERENCES,
  isValidAnchorSurfacePreference,
} from '../surfacePreference';
import type { AnchorSurfacePreference } from '../surfacePreference';
import type { MemoryAtomReturnPreference } from '@/lib/maia/memoryAtomsLoader';

describe('Anchor surface preference — standing-consent vocabulary', () => {
  describe('isValidAnchorSurfacePreference (gesture-route input validation)', () => {
    it.each([
      'member_pulled',
      'contextual_doorway',
      'ritual_review_opt_in',
    ])('accepts the valid value %j', (value) => {
      expect(isValidAnchorSurfacePreference(value)).toBe(true);
    });

    it.each([
      'sometimes',
      'always',
      '',
      'Member_Pulled',
      'MEMBER_PULLED',
      ' member_pulled',
      'member_pulled ',
      'contextual-doorway',
      'contextual_doorway_opt_in',
    ])('rejects the non-vocabulary string %j', (value) => {
      expect(isValidAnchorSurfacePreference(value)).toBe(false);
    });

    it.each([
      undefined,
      null,
      0,
      1,
      NaN,
      true,
      false,
      {},
      { preference: 'member_pulled' },
      [],
      ['member_pulled'],
    ])('rejects the non-string input %j', (value) => {
      expect(isValidAnchorSurfacePreference(value)).toBe(false);
    });
  });

  describe('VALID_ANCHOR_SURFACE_PREFERENCES (CHECK-constraint mirror)', () => {
    it('holds exactly the three vocabulary values, no extras', () => {
      expect(VALID_ANCHOR_SURFACE_PREFERENCES.size).toBe(3);
      expect(VALID_ANCHOR_SURFACE_PREFERENCES.has('member_pulled')).toBe(true);
      expect(VALID_ANCHOR_SURFACE_PREFERENCES.has('contextual_doorway')).toBe(true);
      expect(VALID_ANCHOR_SURFACE_PREFERENCES.has('ritual_review_opt_in')).toBe(true);
    });
  });

  describe('AMBIENT_ELIGIBLE_ANCHOR_SURFACE_PREFERENCES (ambient-surfacing boundary)', () => {
    it('is exactly contextual_doorway and ritual_review_opt_in', () => {
      expect(AMBIENT_ELIGIBLE_ANCHOR_SURFACE_PREFERENCES).toEqual([
        'contextual_doorway',
        'ritual_review_opt_in',
      ]);
    });

    it('deliberately excludes member_pulled — explicit pulls never surface ambiently', () => {
      expect(AMBIENT_ELIGIBLE_ANCHOR_SURFACE_PREFERENCES).not.toContain('member_pulled');
    });

    it('is a strict subset of the valid vocabulary', () => {
      expect(AMBIENT_ELIGIBLE_ANCHOR_SURFACE_PREFERENCES.length).toBeLessThan(
        VALID_ANCHOR_SURFACE_PREFERENCES.size,
      );
      for (const value of AMBIENT_ELIGIBLE_ANCHOR_SURFACE_PREFERENCES) {
        expect(isValidAnchorSurfacePreference(value)).toBe(true);
      }
    });
  });

  describe('shared consent grammar with member_memory_atoms.return_preference', () => {
    it('value vocabulary is verbatim across memory surfaces (type-level, erased at runtime)', () => {
      // If either union drifts, ts-jest fails to compile this file — the two
      // consent vocabularies (atoms + anchors) must remain one shared grammar.
      type IsMutuallyAssignable<A, B> = [A] extends [B]
        ? [B] extends [A]
          ? true
          : false
        : false;
      const grammarHolds: IsMutuallyAssignable<
        AnchorSurfacePreference,
        MemoryAtomReturnPreference
      > = true;
      expect(grammarHolds).toBe(true);
    });
  });
});
