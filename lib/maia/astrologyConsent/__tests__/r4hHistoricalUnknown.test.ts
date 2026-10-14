import fs from 'node:fs';
import path from 'node:path';
import { query } from '@/lib/db/postgres';
import { excludeProtectedDevelopmentalMemories } from '../r4gDerivedProvenance';
import { CUT1_BASELINE_NONVECTOR_SQL, CUT1_OBSERVED_NONVECTOR_SQL } from '@/lib/memory/cut1Trace';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), pool: null }));
const mockedQuery = query as jest.Mock;
const read = (file: string) => fs.readFileSync(path.join(process.cwd(),file),'utf8');
const user = 'aaaaaaaa-0000-4000-8000-000000000001';

beforeEach(() => mockedQuery.mockReset());

describe('R4H ambiguity policy: unknown is not authorization', () => {
  it('suppresses both explicitly protected and historically unclassified memories', async () => {
    mockedQuery.mockResolvedValue({ rows: [
      { id: 'protected-derived' }, { id: 'unclassified-historical-derived' },
    ]});
    const content = [
      { id: 'protected-derived', text: 'FICTIONAL_PRIVATE' },
      { id: 'ordinary-derived', text: 'FICTIONAL_ORDINARY' },
      { id: 'unclassified-historical-derived', text: 'FICTIONAL_UNKNOWN' },
    ];
    expect(await excludeProtectedDevelopmentalMemories(user, content)).toEqual([content[1]]);
    const [sql] = mockedQuery.mock.calls[0];
    expect(sql).toContain("d.origin_scope IS DISTINCT FROM 'ordinary'");
    expect(sql).toContain('d.source_session_id IS NULL');
    expect(sql).toContain('astro_maia_transfer_grants');
  });
  it('preserves ranking of only verified ordinary candidate memory in both CUT1 paths', () => {
    for (const sql of [CUT1_BASELINE_NONVECTOR_SQL, CUT1_OBSERVED_NONVECTOR_SQL]) {
      expect(sql).toContain("origin_scope = 'ordinary'");
      expect(sql).toContain('source_session_id IS NOT NULL');
      expect(sql).toContain('ORDER BY');
    }
  });
  it('covers the second developmental reader, breakthrough, and vector candidates', () => {
    const loader = read('lib/maia/memoryLoaders.ts');
    expect(loader).toContain("origin_scope = 'ordinary'");
    const bundle = read('lib/memory/MemoryBundle.ts');
    expect(bundle).toContain("breakthrough_moments.origin_scope = 'ordinary'");
    expect(bundle).toContain("AND source_session_id IS NOT NULL");
  });
  it('retains ordinary cross-session conversation turns without requiring derived-memory metadata', () => {
    const turns = read('lib/memory/stores/TurnsStore.ts');
    expect(turns).toContain('getRecentTurns(');
    expect(turns).toContain('astro_maia_transfer_grants');
    expect(turns).not.toContain("conversation_turns.origin_scope = 'ordinary'");
  });
});
