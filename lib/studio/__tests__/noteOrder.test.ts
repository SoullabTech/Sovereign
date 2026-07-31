import { sortNotes } from '../noteOrder';

/**
 * The risk this guards: two competing notions of "newest" — the server's SQL ordering
 * and a divergent client ordering. Every case below states the SQL behaviour it mirrors.
 */

// A DATE column: all notes on one calendar day serialize to the same instant.
const day = (d: string) => `${d}T07:00:00.000Z`;

describe('sortNotes — mirrors ORDER BY note_date DESC, created_at DESC', () => {
  it('orders by note_date descending', () => {
    const out = sortNotes([
      { id: 'old', noteDate: day('2026-07-20'), createdAt: '2026-07-20T10:00:00.000Z' },
      { id: 'new', noteDate: day('2026-07-30'), createdAt: '2026-07-30T10:00:00.000Z' },
    ] as any);
    expect(out.map((n: any) => n.id)).toEqual(['new', 'old']);
  });

  it('breaks a same-day tie by created_at descending', () => {
    const out = sortNotes([
      { id: 'morning', noteDate: day('2026-07-30'), createdAt: '2026-07-30T09:00:00.000Z' },
      { id: 'evening', noteDate: day('2026-07-30'), createdAt: '2026-07-30T21:00:00.000Z' },
      { id: 'noon', noteDate: day('2026-07-30'), createdAt: '2026-07-30T12:00:00.000Z' },
    ] as any);
    expect(out.map((n: any) => n.id)).toEqual(['evening', 'noon', 'morning']);
  });

  // The behaviour F-2 introduced. Before backdating, prepending a new note was correct.
  it('does NOT place a freshly written but backdated note at the top', () => {
    const existing = [
      { id: 'a', noteDate: day('2026-07-30'), createdAt: '2026-07-30T10:00:00.000Z' },
      { id: 'b', noteDate: day('2026-07-25'), createdAt: '2026-07-25T10:00:00.000Z' },
    ];
    // Written now, but describing work from the 22nd.
    const backdated = {
      id: 'backdated',
      noteDate: day('2026-07-22'),
      createdAt: '2026-07-31T23:00:00.000Z',
    };
    const out = sortNotes([backdated, ...existing] as any);
    expect(out.map((n: any) => n.id)).toEqual(['a', 'b', 'backdated']);
  });

  it('places a forward-dated note above older ones despite being written later', () => {
    const out = sortNotes([
      { id: 'older', noteDate: day('2026-07-10'), createdAt: '2026-07-31T10:00:00.000Z' },
      { id: 'session', noteDate: day('2026-07-28'), createdAt: '2026-07-29T10:00:00.000Z' },
    ] as any);
    expect(out.map((n: any) => n.id)).toEqual(['session', 'older']);
  });

  it('does not mutate the input array', () => {
    const input = [
      { id: 'x', noteDate: day('2026-07-20'), createdAt: '2026-07-20T10:00:00.000Z' },
      { id: 'y', noteDate: day('2026-07-30'), createdAt: '2026-07-30T10:00:00.000Z' },
    ];
    const snapshot = input.map((n) => n.id);
    sortNotes(input as any);
    expect(input.map((n) => n.id)).toEqual(snapshot);
  });

  it('is idempotent — re-sorting server-ordered notes changes nothing', () => {
    const serverOrdered = [
      { id: '1', noteDate: day('2026-07-30'), createdAt: '2026-07-30T18:00:00.000Z' },
      { id: '2', noteDate: day('2026-07-30'), createdAt: '2026-07-30T09:00:00.000Z' },
      { id: '3', noteDate: day('2026-07-11'), createdAt: '2026-07-11T09:00:00.000Z' },
    ];
    expect(sortNotes(serverOrdered as any).map((n: any) => n.id)).toEqual(['1', '2', '3']);
  });
});
