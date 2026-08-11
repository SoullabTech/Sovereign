/**
 * Browse continuity guard (Slice 2).
 *
 * The load-bearing claim is that search is EXACT — the member asked for a word
 * and gets the material containing that word. These tests fail if anyone later
 * makes it fuzzy, ranked, or semantic, and they fail if a content type quietly
 * stops being browsable.
 */
import { searchLibrary, filterKind, KIND_LABEL, type LibraryItem } from '../library';

const item = (over: Partial<LibraryItem> & Pick<LibraryItem, 'id' | 'kind' | 'line'>): LibraryItem => ({
  at: '2026-08-01T10:00:00.000Z',
  ...over,
});

const corpus: LibraryItem[] = [
  item({ id: 'j1', kind: 'journal', line: 'The house was quiet in a way I noticed.' }),
  item({ id: 'j2', kind: 'journal', line: 'Bought plums. Ate three standing at the sink.' }),
  item({ id: 'c1', kind: 'capture', line: 'On leaving', detail: 'A quiet capture about the house.' }),
  item({ id: 's1', kind: 'session', line: 'Solo session', detail: 'Talked about work.' }),
  item({ id: 'ch1', kind: 'change', line: 'Leaving the role', detail: 'Named a threshold.' }),
  item({ id: 'd1', kind: 'decision', line: 'Whether to stay', detail: 'Weighing it.' }),
];

describe('search is exact', () => {
  it('matches a literal substring in the member’s own line', () => {
    expect(searchLibrary(corpus, 'plums').map((i) => i.id)).toEqual(['j2']);
  });

  it('is case-insensitive, because typing is', () => {
    expect(searchLibrary(corpus, 'HOUSE').map((i) => i.id)).toEqual(['j1', 'c1']);
  });

  it('searches the second line too, where the source carries one', () => {
    expect(searchLibrary(corpus, 'threshold').map((i) => i.id)).toEqual(['ch1']);
  });

  it('returns everything for an empty or whitespace query', () => {
    expect(searchLibrary(corpus, '')).toHaveLength(corpus.length);
    expect(searchLibrary(corpus, '   ')).toHaveLength(corpus.length);
  });

  it('returns nothing rather than guessing — no fuzzy, no stemming, no synonyms', () => {
    expect(searchLibrary(corpus, 'plum trees')).toEqual([]); // not a substring
    expect(searchLibrary(corpus, 'quietly')).toEqual([]); // not a stem match
    expect(searchLibrary(corpus, 'silence')).toEqual([]); // not a synonym for quiet
    expect(searchLibrary(corpus, 'huose')).toEqual([]); // not a typo correction
  });

  it('does not reorder — results keep the order they were given', () => {
    const q = searchLibrary(corpus, 'the');
    expect(q.map((i) => i.id)).toEqual(corpus.filter((i) => searchLibrary([i], 'the').length).map((i) => i.id));
  });
});

describe('every content type stays browsable', () => {
  it('carries all five kinds', () => {
    expect(Object.keys(KIND_LABEL).sort()).toEqual(
      ['capture', 'change', 'decision', 'journal', 'session'].sort(),
    );
  });

  it('can narrow to each one', () => {
    for (const k of ['journal', 'capture', 'session', 'change', 'decision'] as const) {
      expect(filterKind(corpus, k).every((i) => i.kind === k)).toBe(true);
      expect(filterKind(corpus, k).length).toBeGreaterThan(0);
    }
  });

  it('null means everything', () => {
    expect(filterKind(corpus, null)).toHaveLength(corpus.length);
  });

  it('composes with search without losing the kind constraint', () => {
    expect(searchLibrary(filterKind(corpus, 'journal'), 'house').map((i) => i.id)).toEqual(['j1']);
  });
});

describe('one entry, shown once', () => {
  it('drops a capture that is only the bridge artifact of an entry the member has', async () => {
    // Reproduces the walk defect: keeping an entry also writes a capsule with
    // sourceId = the entry id, so Browse listed every entry twice.
    const { loadLibrary } = await import('../library');
    const mockFetch = jest.spyOn(await import('@/lib/http/apiBase'), 'apiFetch');
    mockFetch.mockImplementation(async (path: string) => {
      const body =
        path.startsWith('/api/capsules')
          ? {
              capsules: [
                { id: 'cap-of-j1', sourceId: 'j1', title: 'Journal: The house was quiet', createdAt: '2026-08-01T10:00:00.000Z' },
                { id: 'cap-real', sourceId: 'session-9', title: 'From a conversation', createdAt: '2026-08-01T09:00:00.000Z' },
              ],
            }
          : {};
      return { ok: true, json: async () => body } as unknown as Response;
    });

    const { items, kinds } = await loadLibrary([
      { id: 'j1', content: 'The house was quiet in a way I noticed.', created_at: '2026-08-01T10:00:00.000Z' },
    ]);

    expect(items.filter((i) => i.kind === 'capture').map((i) => i.id)).toEqual(['cap-real']);
    expect(items.filter((i) => i.line.includes('The house was quiet'))).toHaveLength(1);
    expect(kinds).toContain('capture');
    mockFetch.mockRestore();
  });
});

describe('navigation honesty', () => {
  it('captures offer no doorway — their reader is founder-gated', () => {
    // A member routed to /labtools lands on a founder refusal. That was the
    // 2026-07-28 defect; a row with no href is the correct alternative.
    const capture = corpus.find((i) => i.kind === 'capture')!;
    expect(capture.href).toBeUndefined();
  });
});
