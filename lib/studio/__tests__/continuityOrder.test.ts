/**
 * These tests exist to hold one line: ORDERING EXPRESSES MEANING, NOT PRESENTATION.
 *
 * The failure they guard against is `ORDER BY kind, created_at DESC` — technically
 * reasonable, conceptually wrong, and invisible in review because nobody flags a sort.
 * Each comparator answers a different question, so each is tested against that
 * question rather than against a shared notion of "newest".
 */

import { describe, it, expect } from '@jest/globals';
import {
  sortLivingCommitments,
  sortCommitmentHistory,
  sortRecognitions,
  sortImportantDetails,
} from '@/lib/studio/continuityOrder';

const item = (
  id: string,
  createdAt: string,
  updatedAt: string,
  status: string | null = null
) => ({ id, createdAt, updatedAt, status });

describe('living commitments — "is this still alive?"', () => {
  const list = [
    item('done', '2026-01-01', '2026-06-01', 'completed'),
    item('stale-alive', '2026-01-02', '2026-02-01', 'alive'),
    item('fresh-alive', '2026-01-03', '2026-05-01', 'alive'),
    item('released', '2026-01-04', '2026-07-01', 'released'),
  ];

  it('returns only alive commitments', () => {
    expect(sortLivingCommitments(list).map((c) => c.id)).toEqual(['fresh-alive', 'stale-alive']);
  });

  it('orders by most recently tended, not by creation', () => {
    // `stale-alive` was created LATER than nothing here matters — what matters is
    // that `fresh-alive` was tended more recently. Sorting by createdAt would
    // reverse these two.
    const sorted = sortLivingCommitments(list);
    expect(sorted[0].id).toBe('fresh-alive');
  });

  it('never mixes completed or released into the live list', () => {
    const ids = sortLivingCommitments(list).map((c) => c.id);
    expect(ids).not.toContain('done');
    expect(ids).not.toContain('released');
  });
});

describe('commitment history — collapsed, separate from live', () => {
  const list = [
    item('alive', '2026-01-01', '2026-08-01', 'alive'),
    item('completed-old', '2026-01-02', '2026-02-01', 'completed'),
    item('released-new', '2026-01-03', '2026-06-01', 'released'),
  ];

  it('returns only completed and released', () => {
    expect(sortCommitmentHistory(list).map((c) => c.id)).toEqual([
      'released-new',
      'completed-old',
    ]);
  });

  it('excludes live commitments even though they sort newest', () => {
    expect(sortCommitmentHistory(list).map((c) => c.id)).not.toContain('alive');
  });
});

describe('recognitions — insertion order, newest first (PROVISIONAL)', () => {
  it('orders by createdAt descending', () => {
    const list = [
      { id: 'a', createdAt: '2026-01-01' },
      { id: 'c', createdAt: '2026-03-01' },
      { id: 'b', createdAt: '2026-02-01' },
    ];
    expect(sortRecognitions(list).map((r) => r.id)).toEqual(['c', 'b', 'a']);
  });

  it('makes no claim about significance — equal timestamps keep input order', () => {
    const list = [
      { id: 'first', createdAt: '2026-01-01' },
      { id: 'second', createdAt: '2026-01-01' },
    ];
    expect(sortRecognitions(list).map((r) => r.id)).toEqual(['first', 'second']);
  });
});

describe('important details — reference card, OLDEST first', () => {
  it('orders by createdAt ascending, opposite to every other surface', () => {
    const list = [
      { id: 'newest', createdAt: '2026-03-01' },
      { id: 'oldest', createdAt: '2026-01-01' },
      { id: 'middle', createdAt: '2026-02-01' },
    ];
    // Deliberate: a detail added first (a partner's name, a preference) is usually
    // the most load-bearing. Newest-first would bury it as the list grows.
    expect(sortImportantDetails(list).map((d) => d.id)).toEqual(['oldest', 'middle', 'newest']);
  });

  it('is the inverse of the recognition ordering — they do not share an axis', () => {
    const list = [
      { id: 'a', createdAt: '2026-01-01' },
      { id: 'b', createdAt: '2026-02-01' },
    ];
    expect(sortImportantDetails(list).map((d) => d.id)).toEqual(
      sortRecognitions(list).map((r) => r.id).reverse()
    );
  });
});

describe('no comparator consults note_date', () => {
  it('ignores note_date entirely — it is meaningful only for kind=note', () => {
    const withMisleadingNoteDate = [
      { id: 'x', createdAt: '2026-01-01', updatedAt: '2026-01-01', status: 'alive', noteDate: '2099-01-01' },
      { id: 'y', createdAt: '2026-02-01', updatedAt: '2026-02-01', status: 'alive', noteDate: '1999-01-01' },
    ];
    // If note_date leaked into the comparator, 'x' would sort first.
    expect(sortLivingCommitments(withMisleadingNoteDate)[0].id).toBe('y');
  });
});
