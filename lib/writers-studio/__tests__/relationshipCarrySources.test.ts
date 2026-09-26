jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), transaction: jest.fn() }));
import { query } from '@/lib/db/postgres';
import { listEligiblePriorMaiaEditorialCarrySources } from '../relationshipCarriage';

const q = query as jest.Mock;
const REL={id:'rel-1',member_id:'m1',living_work_id:'w1',manuscript_id:'ms1'};
const RECEIVER={manuscript_id:'ms1',proposal_chain_id:'pc-new',locus_scope_kind:'passage'};

beforeEach(() => q.mockReset());

describe('A2-14 eligible carry source list', () => {
  it('returns only the exact bounded source prefix and presentation metadata', async () => {
    const longBody='🌿'.repeat(321);
    const admitted=new Date('2026-09-26T12:00:00.000Z');
    q.mockImplementation(async (sql:string, params:unknown[]) => {
      if (sql.includes('FROM writer_editorial_relationships')) return { rows:[REL] };
      if (sql.includes('FROM living_work_expressions')) return { rows:[{id:'decl-1'}] };
      if (sql.includes('FROM ask_threads th') && sql.includes('LEFT JOIN proposal_chains')) return { rows:[RECEIVER] };
      if (sql.includes('SELECT e.sequence')) {
        expect(params).toEqual(['rel-1','m1','ms1','th-new','passage']);
        expect(sql).toContain("e.editorial_thread_id <> $4");
        expect(sql).toContain("NOT (e.manuscript_scope_requested = 'passage' AND $5::text = 'section')");
        expect(sql).toContain('ORDER BY e.admitted_at ASC, e.sequence ASC');
        return { rows:[{sequence:7,manuscript_scope_requested:'section',admitted_at:admitted,body:longBody}] };
      }
      throw new Error('unexpected query '+sql);
    });
    const out=await listEligiblePriorMaiaEditorialCarrySources({memberId:'m1',relationshipId:'rel-1',receiverThreadId:'th-new'});
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.relationshipId).toBe('rel-1');
    expect(out.receiverThreadId).toBe('th-new');
    expect(out.sources).toHaveLength(1);
    const source=out.sources[0]!;
    expect(source).toEqual(expect.objectContaining({
      kind:'prior_maia_editorial_turn',sourceEpisodeSequence:7,sourceScope:'section',
      admittedAt:'2026-09-26T12:00:00.000Z',excerptTruncated:true,
    }));
    expect(Array.from(source.excerpt)).toHaveLength(320);
    expect(source.excerpt).toBe('🌿'.repeat(320));
    expect(source.excerpt.endsWith('…')).toBe(false);
    expect('sourceThreadId' in source).toBe(false);
    expect('sourceMaiaTurnIndex' in source).toBe(false);
  });

  it('returns a short source byte-for-byte without synthetic truncation', async () => {
    const body='  Exact spacing.\nSecond line.  ';
    q.mockImplementation(async (sql:string) => {
      if (sql.includes('FROM writer_editorial_relationships')) return { rows:[REL] };
      if (sql.includes('FROM living_work_expressions')) return { rows:[{id:'decl-1'}] };
      if (sql.includes('FROM ask_threads th') && sql.includes('LEFT JOIN proposal_chains')) return { rows:[RECEIVER] };
      if (sql.includes('SELECT e.sequence')) return { rows:[{sequence:2,manuscript_scope_requested:'passage',admitted_at:new Date('2026-09-25T10:00:00Z'),body}] };
      throw new Error('unexpected query');
    });
    const out=await listEligiblePriorMaiaEditorialCarrySources({memberId:'m1',relationshipId:'rel-1',receiverThreadId:'th-new'});
    expect(out.ok).toBe(true);
    if (out.ok) expect(out.sources[0]).toMatchObject({excerpt:body,excerptTruncated:false});
  });

  it('refuses an invalid receiver before querying source episodes', async () => {
    q.mockImplementation(async (sql:string) => {
      if (sql.includes('FROM writer_editorial_relationships')) return { rows:[REL] };
      if (sql.includes('FROM living_work_expressions')) return { rows:[{id:'decl-1'}] };
      if (sql.includes('FROM ask_threads th')) return { rows:[] };
      if (sql.includes('SELECT e.sequence')) throw new Error('source list must not be queried');
      throw new Error('unexpected query');
    });
    await expect(listEligiblePriorMaiaEditorialCarrySources({memberId:'m1',relationshipId:'rel-1',receiverThreadId:'foreign'}))
      .resolves.toEqual({ok:false,reason:'receiver_thread_invalid'});
  });
});
