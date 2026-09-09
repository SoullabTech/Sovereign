/**
 * EVIDENCE-NAMING-01A — CONTAINMENT, bound to its five falsifiers.
 *
 * ⭐⭐ A seven-day event-count ratio may not acquire a psychological
 *     interpretation merely by crossing a software boundary.
 *
 * `potential_spiritual_bypassing` was emitted when mental-tagged events
 * outnumbered emotional-tagged events by more than 3:1 over seven days, stored
 * with the description *"Mental insights without emotional integration"*, and
 * spoken as *"You're processing mentally more than emotionally…"*.
 *
 * ⭐ The founder's precision (2026-09-09): the COUNT is not the error.
 *
 *   OBSERVATION   more mental-tagged than emotional-tagged activity in 7 days
 *   ELEMENTAL     more Air than Water in the recent recorded field   (DERIVED)
 *   INQUIRY       "is insight moving faster than feeling right now?"
 *
 * The inflation is the collapse of all three planes into a stored database fact.
 * ⛔ And even "Air without Water" overstates it: 3:1 is Air-heavy RELATIVE TO
 * Water, never Water-less.
 *
 * ⛔ THIS SUITE PROVES CONTAINMENT ONLY. It does not prove that any historical
 * row was migrated, that any production row exists, or that a lawful successor
 * is correct. Those are EVIDENCE-NAMING-01B (custody) and -01C (lawful identity).
 */

import fs from 'fs';
import path from 'path';
import {
  DEPRECATED_PATTERN_KEYS,
  isDeprecatedPatternKey,
} from '../deprecatedPatternKeys';

const DEPRECATED = 'potential_spiritual_bypassing';

/* The DB is mocked at the module boundary: this is a containment witness, not an
   integration test. Every call is captured so the SQL and its parameters can be
   asserted rather than assumed. */
const calls: { sql: string; params: unknown[] }[] = [];
jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(async (sql: string, params: unknown[] = []) => {
    calls.push({ sql, params });
    // A count high enough that the withdrawn 3:1 ratio would have fired.
    if (/COUNT\(\*\)\s+as\s+count/i.test(sql)) return { rows: [{ count: '12' }], rowCount: 1 };
    // An existing pattern row, so the lawful-path assertion exercises the store
    // rather than a mock artefact. (First draft returned the count shape here too
    // and the store read `row.id` as undefined — instrument fault, not product.)
    return { rows: [{ id: 'pattern-1', seen_count: 1 }], rowCount: 1 };
  }),
}));
jest.mock('../embeddings', () => ({
  generateLocalEmbedding: jest.fn(async () => new Array(8).fill(0)),
}));

import { ConsciousnessMemoryLattice } from '../ConsciousnessMemoryLattice';
import { PatternMemoryStore } from '../stores/PatternMemoryStore';
import { loadRecentDevelopmentalMemories } from '@/lib/maia/memoryLoaders';

const facet = { code: 'AIR-2', element: 'air', name: 'Air 2', description: '' } as any;

beforeEach(() => { calls.length = 0; });

describe('F1 · the same event history no longer produces the key', () => {
  it('detects patterns from a mental-heavy history without naming bypassing', async () => {
    const lattice = new ConsciousnessMemoryLattice();
    const patterns: string[] = await (lattice as any).detectEmergentPatterns(
      'member-1',
      { type: 'mental', insight: 'a thought', cognitiveLevel: 4 },
      facet,
    );

    // The mock returns 12 for every count, so a 12:12 mental/emotional reading is
    // the *most favourable* case for the old classifier and it still must not fire.
    expect(patterns).not.toContain(DEPRECATED);
    expect(patterns.some(p => isDeprecatedPatternKey(p))).toBe(false);

    // ⭐ and the withdrawal is of ONE meaning, not of pattern detection: the other
    // detectors still work, so this is containment rather than amputation.
    expect(patterns).toContain('facet_dwelling:AIR-2');
  });

  it('runs no mental-vs-emotional ratio query at all', async () => {
    const lattice = new ConsciousnessMemoryLattice();
    await (lattice as any).detectEmergentPatterns(
      'member-1',
      { type: 'mental', insight: 'a thought', cognitiveLevel: 4 },
      facet,
    );
    const ratioQuery = calls.find(c =>
      /event_type\s*=\s*'mental'/.test(c.sql) && /emotional/.test(c.sql));
    expect(ratioQuery).toBeUndefined();
  });
});

describe('F2 · the deprecated key cannot be newly persisted', () => {
  it('refuses loudly rather than renaming silently', async () => {
    await expect(
      PatternMemoryStore.upsertByKey({ userId: 'member-1', patternKey: DEPRECATED }),
    ).rejects.toThrow(/withdrawn \(EVIDENCE-NAMING-01A\)/);
  });

  it('refuses a suffixed variant too — the TYPE is what was withdrawn', async () => {
    await expect(
      PatternMemoryStore.upsertByKey({ userId: 'member-1', patternKey: `${DEPRECATED}:air` }),
    ).rejects.toThrow(/EVIDENCE-NAMING-01A/);
  });

  it('writes nothing on the way to refusing', async () => {
    await PatternMemoryStore.upsertByKey({ userId: 'm', patternKey: DEPRECATED }).catch(() => {});
    expect(calls).toHaveLength(0);
  });

  it('still persists lawful patterns — containment is not a freeze', async () => {
    await expect(
      PatternMemoryStore.upsertByKey({ userId: 'member-1', patternKey: 'recurring_emotion:grief' }),
    ).resolves.toBeDefined();
  });
});

describe('F3 · a historical deprecated row cannot enter developmental-memory loading', () => {
  /**
   * ⚠️ HONEST SCOPE. Without a Postgres connection this asserts that the
   * quarantine is IN THE QUERY and parameterised by the shared list — not that
   * Postgres evaluated it. The executable check runs at EVIDENCE-NAMING-01B,
   * which is the step that has a production connection.
   */
  it('excludes the withdrawn keys in the query, so they cannot occupy a limit slot', async () => {
    await loadRecentDevelopmentalMemories('member-1', 3);
    const load = calls.find(c => /FROM developmental_memories/.test(c.sql));
    expect(load).toBeDefined();
    expect(load!.sql).toMatch(/NOT EXISTS/);
    expect(load!.sql).toMatch(/entity_tags/);
    expect(load!.params[2]).toEqual([...DEPRECATED_PATTERN_KEYS]);
  });

  it('mirrors the key semantics exactly — type segment, so a suffix cannot slip past', () => {
    expect(isDeprecatedPatternKey(DEPRECATED)).toBe(true);
    expect(isDeprecatedPatternKey(`${DEPRECATED}:air`)).toBe(true);
    expect(isDeprecatedPatternKey('recurring_emotion:grief')).toBe(false);
    expect(isDeprecatedPatternKey(null)).toBe(false);
  });

  it('does NOT exclude emergent_pattern as a memory_type — one meaning withdrawn, not a kind of memory', async () => {
    await loadRecentDevelopmentalMemories('member-1', 3);
    const load = calls.find(c => /FROM developmental_memories/.test(c.sql))!;
    expect(load.sql).not.toMatch(/memory_type\s*(!=|<>)/);
    expect(load.sql).not.toMatch(/emergent_pattern/);
  });

  it('mutates nothing — quarantine is a read-side refusal, custody is 01B', async () => {
    await loadRecentDevelopmentalMemories('member-1', 3);
    for (const c of calls) expect(c.sql).not.toMatch(/\b(UPDATE|DELETE|INSERT)\b/i);
  });
});

describe('F4 · the deprecated key cannot produce a member-facing insight', () => {
  it('yields no insight when the withdrawn pattern is handed in directly', async () => {
    const lattice = new ConsciousnessMemoryLattice();
    const node = {
      id: 'n1', userId: 'member-1',
      event: { type: 'mental', insight: 'a thought', cognitiveLevel: 4 },
      facet, phase: { name: 'x', description: '' },
      connections: [], createdAt: new Date(),
    } as any;

    const withPattern: string[] = await (lattice as any).synthesizeInsights(
      'member-1', node, [DEPRECATED]);
    const withoutPattern: string[] = await (lattice as any).synthesizeInsights(
      'member-1', node, []);

    // The withdrawn key contributes nothing: the two outputs are identical.
    expect(withPattern).toEqual(withoutPattern);
    const joined = withPattern.join(' ').toLowerCase();
    expect(joined).not.toMatch(/bypass/);
    expect(joined).not.toMatch(/mentally more than emotionally/);
    expect(joined).not.toMatch(/without emotional integration/);
  });
});

describe('F5 · no replacement diagnosis or interpretation is introduced', () => {
  /* Comments are stripped before scanning — the C21 lesson: a file that
     DOCUMENTS a withdrawn string must not read as the string returning. */
  const strip = (src: string) =>
    src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  const read = (rel: string) =>
    strip(fs.readFileSync(path.join(process.cwd(), rel), 'utf8'));

  const SITES = [
    'lib/memory/ConsciousnessMemoryLattice.ts',
    'lib/memory/stores/PatternMemoryStore.ts',
    'lib/maia/memoryLoaders.ts',
  ];

  it.each(SITES)('%s introduces no successor key', rel => {
    expect(read(rel)).not.toMatch(/high_mental_to_emotional_event_ratio/);
  });

  it.each(SITES)('%s carries no clinical rendering of the ratio', rel => {
    const code = read(rel).toLowerCase();
    expect(code).not.toMatch(/mental insights without emotional integration/);
    expect(code).not.toMatch(/spiritual bypassing/);
  });

  it('the executable code emits the withdrawn key nowhere', () => {
    for (const rel of SITES) {
      const code = read(rel);
      // The shared list is the one lawful mention: a refusal must be able to name
      // what it refuses. Every other occurrence would be an emission site.
      expect(code).not.toMatch(new RegExp(`patterns\\.push\\([^)]*${DEPRECATED}`));
    }
    expect(read('lib/memory/deprecatedPatternKeys.ts')).toMatch(DEPRECATED);
  });

  it('describePattern can no longer render the withdrawn meaning', () => {
    expect(read('lib/memory/stores/PatternMemoryStore.ts'))
      .not.toMatch(/Mental insights without emotional integration/);
  });
});
