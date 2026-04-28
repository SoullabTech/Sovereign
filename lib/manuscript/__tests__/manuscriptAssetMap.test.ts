/**
 * Smoke tests — manuscriptAssetMap (Phase 1, Step 1.5)
 *
 * Confirms the asset bridge:
 *   - emits one candidate per (chapterId, ref) pair
 *   - attaches chapter context (title, element) and defaults role to 'unknown'
 *   - counts duplicate occurrences without producing duplicate candidates
 *   - same ref across different chapters yields distinct candidates
 *   - applyAssetResolutions promotes only resolved placeholders
 *   - caption from placeholder survives when resolution omits one
 *   - resolution caption overrides placeholder caption
 *   - returns input manuscript unchanged when no resolutions are passed
 *   - status helper reports total / resolved / unresolved correctly
 *
 * Pure / inline fixtures only — no I/O.
 */

import { describe, it, expect } from '@jest/globals';

import {
  extractAssetCandidates,
  applyAssetResolutions,
  getAssetResolutionStatus,
  chapterIdOf,
  makePlaceholderId,
} from '../adapters/manuscriptAssetMap';
import type { Block, Manuscript } from '../types';

const FIXTURE: Manuscript = {
  type: 'book',
  title: 'Test',
  author: 'A',
  chapters: [
    {
      number: 1,
      title: 'Chapter 1',
      element: 'fire',
      blocks: [
        { type: 'image-placeholder', ref: 'image1' },
        { type: 'text', content: 'hello' },
        { type: 'image-placeholder', ref: 'image2', caption: 'figure two' },
        { type: 'image-placeholder', ref: 'image1' }, // duplicate ref in same chapter
      ],
    },
    {
      number: 2,
      title: 'Chapter 2',
      element: 'water',
      blocks: [
        // Same ref as chapter 1, but different chapter — distinct candidate.
        { type: 'image-placeholder', ref: 'image1' },
      ],
    },
  ],
};

describe('manuscriptAssetMap', () => {
  describe('helpers', () => {
    it('chapterIdOf prefers explicit id, falls back to chapter-${number}', () => {
      expect(chapterIdOf({ number: 5, title: 'X' })).toBe('chapter-5');
      expect(chapterIdOf({ id: 'preface', number: 0, title: 'P' })).toBe('preface');
    });

    it('makePlaceholderId composes chapterId and ref', () => {
      expect(makePlaceholderId('chapter-1', 'image8')).toBe('chapter-1:image8');
    });
  });

  describe('extractAssetCandidates', () => {
    it('emits one candidate per unique (chapterId, ref) pair', () => {
      const cs = extractAssetCandidates(FIXTURE);
      expect(cs).toHaveLength(3);
      expect(cs.map((c) => c.placeholderId).sort()).toEqual([
        'chapter-1:image1',
        'chapter-1:image2',
        'chapter-2:image1',
      ]);
    });

    it('counts duplicate occurrences within a chapter', () => {
      const cs = extractAssetCandidates(FIXTURE);
      const ch1image1 = cs.find((c) => c.placeholderId === 'chapter-1:image1');
      expect(ch1image1?.occurrenceCount).toBe(2);
    });

    it('attaches chapter title, element, and defaults role to unknown', () => {
      const cs = extractAssetCandidates(FIXTURE);
      const c = cs.find((x) => x.placeholderId === 'chapter-1:image1');
      expect(c?.chapterTitle).toBe('Chapter 1');
      expect(c?.element).toBe('fire');
      expect(c?.role).toBe('unknown');
      expect(c?.ref).toBe('image1');
    });

    it('keeps same-ref different-chapter as distinct candidates', () => {
      const cs = extractAssetCandidates(FIXTURE);
      const ch1 = cs.find((c) => c.placeholderId === 'chapter-1:image1');
      const ch2 = cs.find((c) => c.placeholderId === 'chapter-2:image1');
      expect(ch1?.element).toBe('fire');
      expect(ch2?.element).toBe('water');
    });
  });

  describe('applyAssetResolutions', () => {
    it('promotes resolved placeholders to image blocks', () => {
      const next = applyAssetResolutions(FIXTURE, [
        {
          placeholderId: 'chapter-1:image1',
          assetId: 'asset-A',
          role: 'diagram',
        },
      ]);
      const blocks = next.chapters?.[0].blocks ?? [];
      // Two image-placeholder blocks for image1 in chapter 1 → both resolved
      expect(blocks[0].type).toBe('image');
      expect(blocks[3].type).toBe('image');
      // image2 is unresolved — stays a placeholder
      expect(blocks[2].type).toBe('image-placeholder');
      // Chapter 2 image1 has its own placeholderId — unresolved here
      expect(next.chapters?.[1].blocks?.[0].type).toBe('image-placeholder');
    });

    it('preserves placeholder caption when resolution omits one', () => {
      const next = applyAssetResolutions(FIXTURE, [
        {
          placeholderId: 'chapter-1:image2',
          assetId: 'asset-B',
          role: 'archetype',
        },
      ]);
      const b = next.chapters?.[0].blocks?.[2];
      expect(b?.type).toBe('image');
      if (b?.type === 'image') {
        expect(b.caption).toBe('figure two');
      }
    });

    it('lets resolution caption override placeholder caption', () => {
      const next = applyAssetResolutions(FIXTURE, [
        {
          placeholderId: 'chapter-1:image2',
          assetId: 'asset-B',
          role: 'archetype',
          caption: 'overridden',
        },
      ]);
      const b = next.chapters?.[0].blocks?.[2];
      if (b?.type === 'image') {
        expect(b.caption).toBe('overridden');
      } else {
        throw new Error('expected image block');
      }
    });

    it('returns input unchanged when resolutions is empty', () => {
      const next = applyAssetResolutions(FIXTURE, []);
      expect(next).toBe(FIXTURE);
    });

    it('reuses chapter references when no block in that chapter changed', () => {
      // Resolve only chapter-2's placeholder; chapter 1 should be reference-equal.
      const next = applyAssetResolutions(FIXTURE, [
        {
          placeholderId: 'chapter-2:image1',
          assetId: 'asset-X',
          role: 'atmospheric',
        },
      ]);
      expect(next.chapters?.[0]).toBe(FIXTURE.chapters?.[0]);
      expect(next.chapters?.[1]).not.toBe(FIXTURE.chapters?.[1]);
    });
  });

  describe('getAssetResolutionStatus', () => {
    it('reports total / resolved / unresolved counts and IDs', () => {
      const status = getAssetResolutionStatus(FIXTURE, [
        {
          placeholderId: 'chapter-1:image1',
          assetId: 'asset-A',
          role: 'diagram',
        },
      ]);
      expect(status.total).toBe(3);
      expect(status.resolved).toBe(1);
      expect(status.unresolved).toBe(2);
      expect(status.unresolvedIds.sort()).toEqual([
        'chapter-1:image2',
        'chapter-2:image1',
      ]);
    });

    it('reports zero resolved when no resolutions are passed', () => {
      const status = getAssetResolutionStatus(FIXTURE, []);
      expect(status.total).toBe(3);
      expect(status.resolved).toBe(0);
      expect(status.unresolved).toBe(3);
    });
  });

  describe('parts form', () => {
    it('walks chapters nested under parts', () => {
      const partsManuscript: Manuscript = {
        type: 'book',
        title: 'P',
        author: 'A',
        parts: [
          {
            title: 'Part I',
            chapters: [
              {
                number: 1,
                title: 'C1',
                blocks: [{ type: 'image-placeholder', ref: 'image9' }] as Block[],
              },
            ],
          },
        ],
      };
      const cs = extractAssetCandidates(partsManuscript);
      expect(cs).toHaveLength(1);
      expect(cs[0].placeholderId).toBe('chapter-1:image9');
    });
  });
});
