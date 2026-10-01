jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), transaction: jest.fn() }));
import { query } from '@/lib/db/postgres';
import { resolvePriorMaiaEditorialCarry } from '../relationshipCarriage';
const q = query as jest.Mock;

const REL={id:'rel-1',member_id:'m1',living_work_id:'w1',manuscript_id:'ms1'};
const RECEIVER={manuscript_id:'ms1',proposal_chain_id:'pc-new',locus_scope_kind:'passage'};
const EP={child_kind:'EDITORIAL_TURN',manuscript_scope_requested:'section',manuscript_scope_executed:'section',temporal_posture:'CURRENT_FROZEN_LOCUS',editorial_thread_id:'th-old',editorial_maia_turn_index:4};

function successRows(body:string|null='Earlier MAIA response') {
  q.mockReset();
  q.mockImplementation(async (sql:string) => {
    if (sql.includes('FROM writer_editorial_relationships')) return { rows:[REL] };
    if (sql.includes('FROM living_work_expressions')) return { rows:[{id:'decl-1'}] };
    if (sql.includes('FROM ask_threads th') && sql.includes('LEFT JOIN proposal_chains')) return { rows:[RECEIVER] };
    if (sql.includes('FROM writer_editorial_relationship_episodes')) return { rows:[EP] };
    if (sql.includes('SELECT manuscript_id, proposal_chain_id FROM ask_threads')) return { rows:[{manuscript_id:'ms1',proposal_chain_id:'pc-old'}] };
    if (sql.includes('SELECT speaker, body FROM ask_turns')) return { rows:[{speaker:'maia',body}] };
    throw new Error('unexpected query '+sql);
  });
}

describe('A2-11 prior MAIA Editorial carry resolver', () => {
  it('derives exact source facts from custody and returns one immutable-shaped carry', async () => {
    successRows();
    const out=await resolvePriorMaiaEditorialCarry({memberId:'m1',relationshipId:'rel-1',receiverThreadId:'th-new',sourceEpisodeSequence:2});
    expect(out).toEqual({ok:true,carry:{
      kind:'PRIOR_MAIA_EDITORIAL_TURN',relationshipId:'rel-1',sourceEpisodeSequence:2,
      sourceThreadId:'th-old',sourceMaiaTurnIndex:4,sourceBody:'Earlier MAIA response',
      sourceTemporal:'CURRENT_FROZEN_LOCUS',sourceScope:'section',receiverThreadId:'th-new',receiverScope:'passage',
      producerId:'system.writer_relationship_prior_editorial_turn',
    }});
  });

  it('refuses a same-thread source because child-local history already owns it', async () => {
    successRows();
    const same={...EP,editorial_thread_id:'th-new'};
    q.mockImplementation(async (sql:string) => {
      if (sql.includes('FROM writer_editorial_relationships')) return { rows:[REL] };
      if (sql.includes('FROM living_work_expressions')) return { rows:[{id:'decl-1'}] };
      if (sql.includes('FROM ask_threads th') && sql.includes('LEFT JOIN proposal_chains')) return { rows:[RECEIVER] };
      if (sql.includes('FROM writer_editorial_relationship_episodes')) return { rows:[same] };
      throw new Error('same-thread should refuse before source read');
    });
    await expect(resolvePriorMaiaEditorialCarry({memberId:'m1',relationshipId:'rel-1',receiverThreadId:'th-new',sourceEpisodeSequence:2}))
      .resolves.toEqual({ok:false,reason:'same_thread_source'});
  });

  it('refuses passage source widening into a section receiver', async () => {
    successRows();
    const sectionReceiver={...RECEIVER,locus_scope_kind:'section'};
    const passageSource={...EP,manuscript_scope_requested:'passage',manuscript_scope_executed:'passage'};
    q.mockImplementation(async (sql:string) => {
      if (sql.includes('FROM writer_editorial_relationships')) return { rows:[REL] };
      if (sql.includes('FROM living_work_expressions')) return { rows:[{id:'decl-1'}] };
      if (sql.includes('FROM ask_threads th') && sql.includes('LEFT JOIN proposal_chains')) return { rows:[sectionReceiver] };
      if (sql.includes('FROM writer_editorial_relationship_episodes')) return { rows:[passageSource] };
      if (sql.includes('SELECT manuscript_id, proposal_chain_id FROM ask_threads')) return { rows:[{manuscript_id:'ms1',proposal_chain_id:'pc-old'}] };
      if (sql.includes('SELECT speaker, body FROM ask_turns')) return { rows:[{speaker:'maia',body:'Earlier'}] };
      throw new Error('unexpected query');
    });
    await expect(resolvePriorMaiaEditorialCarry({memberId:'m1',relationshipId:'rel-1',receiverThreadId:'th-new',sourceEpisodeSequence:2}))
      .resolves.toEqual({ok:false,reason:'scope_widening_forbidden'});
  });

  it('refuses a non-MAIA source turn', async () => {
    successRows();
    q.mockImplementation(async (sql:string) => {
      if (sql.includes('FROM writer_editorial_relationships')) return { rows:[REL] };
      if (sql.includes('FROM living_work_expressions')) return { rows:[{id:'decl-1'}] };
      if (sql.includes('FROM ask_threads th') && sql.includes('LEFT JOIN proposal_chains')) return { rows:[RECEIVER] };
      if (sql.includes('FROM writer_editorial_relationship_episodes')) return { rows:[EP] };
      if (sql.includes('SELECT manuscript_id, proposal_chain_id FROM ask_threads')) return { rows:[{manuscript_id:'ms1',proposal_chain_id:'pc-old'}] };
      if (sql.includes('SELECT speaker, body FROM ask_turns')) return { rows:[{speaker:'author',body:'not maia'}] };
      throw new Error('unexpected query');
    });
    await expect(resolvePriorMaiaEditorialCarry({memberId:'m1',relationshipId:'rel-1',receiverThreadId:'th-new',sourceEpisodeSequence:2}))
      .resolves.toEqual({ok:false,reason:'source_turn_not_maia'});
  });
});
