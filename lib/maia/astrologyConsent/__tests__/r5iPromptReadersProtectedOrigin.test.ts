import {query} from '@/lib/db/postgres';
import {
  loadRecentDevelopmentalMemories,loadRecentMarkedEpisodes,
  loadRecentThemeSignals,loadPriorCrossSessionExchanges,
} from '@/lib/maia/memoryLoaders';
jest.mock('@/lib/db/postgres',()=>({query:jest.fn()}));
const db=query as jest.Mock;
const A='11111111-1111-4111-8111-111111111111';
describe('R5i MAIA prompt loaders: R4F/R4I immutable chart origin always wins over ordinary label',()=>{
  beforeEach(()=>{jest.resetAllMocks();});
  it('developmental read filters by verified member and protected registry, including source exchange ancestry',async()=>{
    db.mockResolvedValue({rows:[{id:'fiction-ordinary',content_text:'change; pace; steady',significance:0.7,formed_at:new Date()}]});
    const result=await loadRecentDevelopmentalMemories(A,8);
    expect(result.map(x=>x.id)).toEqual(['fiction-ordinary']);
    const [sql,params]=db.mock.calls[0] as [string,unknown[]];
    expect(params).toEqual([A,8]);
    expect(sql).toContain('origin_scope = \'ordinary\'');
    expect(sql).toContain('source_session_id IS NOT NULL');
    expect(sql).toContain('astro_maia_protected_origins');
    expect(sql).toContain('astro_maia_transfer_grants');
    expect(sql).toContain('NOT EXISTS');
    expect(sql).toContain('ancestry.exchange_id = developmental_memories.source_exchange_id');
  });
  it('episode read excludes protected chart even when member manually marked the earlier turn',async()=>{
    db.mockResolvedValue({rows:[{episode_id:'ordinary',verbatim_text:'quiet thought',source_turn_id:'fiction-turn',
      source_session_id:'ordinary-session',created_at:new Date()}]});
    const out=await loadRecentMarkedEpisodes(A,5);
    expect(out.map(x=>x.episode_id)).toEqual(['ordinary']);
    const [sql,params]=db.mock.calls[0] as [string,unknown[]];
    expect(params).toEqual([A,5]);
    expect(sql).toContain('marked_by_member = TRUE');
    expect(sql).toContain('astro_maia_protected_origins');
    expect(sql).toContain('ancestry.id::text = episodic_memories.source_turn_id');
    expect(sql).toContain('denied.session_id = episodic_memories.source_session_id');
  });
  it('theme and cross-session raw exchange paths also deny protected source registry',async()=>{
    db.mockResolvedValue({rows:[]});
    await loadRecentThemeSignals(A,4);
    await loadPriorCrossSessionExchanges(A,'later',4);
    expect(db).toHaveBeenCalledTimes(2);
    for(const call of db.mock.calls) {
      const sql=call[0] as string;
      expect(sql).toContain('astro_maia_protected_origins');
      expect(sql).toContain('astro_maia_transfer_grants');
      expect(sql).toContain('NOT EXISTS');
    }
  });
  it('missing privacy registry refuses all affected source content, not a false ordinary grant',async()=>{
    db.mockRejectedValue(Error('relation astro_maia_protected_origins does not exist'));
    expect(await loadRecentDevelopmentalMemories(A)).toEqual([]);
    expect(await loadRecentMarkedEpisodes(A)).toEqual([]);
  });
});
