const resolveIdentity = jest.fn();
const persistAct = jest.fn();
const runTurn = jest.fn();
const preflightRelationship = jest.fn();
const resolveCarry = jest.fn();

jest.mock('@/lib/maia/canonical-turn', () => ({
  resolveCanonicalIdentity: (...a: unknown[]) => resolveIdentity(...a),
}));
jest.mock('@/lib/manuscript/editorialRuntime/memberAct', () => ({
  persistMemberEditorialAct: (...a: unknown[]) => persistAct(...a),
}));
jest.mock('@/lib/manuscript/editorialRuntime/turn', () => ({
  runEditorialTurn: (...a: unknown[]) => runTurn(...a),
}));
jest.mock('@/lib/writers-studio/relationshipCarriage', () => ({
  preflightEditorialRelationshipCarriage: (...a: unknown[]) => preflightRelationship(...a),
  resolvePriorMaiaEditorialCarry: (...a: unknown[]) => resolveCarry(...a),
}));

import { POST } from '../route';

const resolvedCarry = {
  kind:'PRIOR_MAIA_EDITORIAL_TURN' as const,
  relationshipId:'rel-1', sourceEpisodeSequence:2,
  sourceThreadId:'th-old', sourceMaiaTurnIndex:4, sourceBody:'Earlier MAIA response',
  sourceTemporal:'CURRENT_FROZEN_LOCUS' as const, sourceScope:'section' as const,
  receiverThreadId:'th-new', receiverScope:'passage' as const,
  producerId:'system.writer_relationship_prior_editorial_turn' as const,
};

const request = (body: unknown) => ({ json: async () => body }) as never;

beforeEach(() => {
  process.env.WRITERS_STUDIO_EDITORIAL_ENABLED='1';
  jest.clearAllMocks();
  resolveIdentity.mockResolvedValue({status:'verified',memberId:'member-1'});
  preflightRelationship.mockResolvedValue({ok:true,relationshipId:'rel-1',manuscriptId:'ms-1',proposalChainId:'pc-new',manuscriptLocusScope:'passage'});
  resolveCarry.mockResolvedValue({ok:true,carry:resolvedCarry});
  persistAct.mockResolvedValue({ok:true,turnIndex:0,direction:null});
  runTurn.mockResolvedValue({ok:false,reason:'structured_refused',detail:'not_configured'});
});

describe('A2-11 editorial carry ingress', () => {
  const base = {
    threadId:'th-new', relationshipId:'rel-1', sanctuary:false,
    act:{act:'discourse',text:'Continue here.',refersTo:null},
    carry:{kind:'prior_maia_editorial_turn',sourceEpisodeSequence:2},
  };

  it('resolves carry before persisting the member act and passes only the server-resolved carry to runtime', async () => {
    const res=await POST(request(base));
    expect(res.status).toBe(502);
    expect(resolveCarry).toHaveBeenCalledWith({memberId:'member-1',relationshipId:'rel-1',receiverThreadId:'th-new',sourceEpisodeSequence:2});
    expect(resolveCarry.mock.invocationCallOrder[0]).toBeLessThan(persistAct.mock.invocationCallOrder[0]);
    expect(persistAct.mock.invocationCallOrder[0]).toBeLessThan(runTurn.mock.invocationCallOrder[0]);
    expect(runTurn).toHaveBeenCalledWith(expect.objectContaining({relationshipId:'rel-1',carry:resolvedCarry,currentTurnIndex:0}));
  });

  it('refuses malformed carry before persistence', async () => {
    const res=await POST(request({...base,carry:{...base.carry,sourceBody:'client-smuggled'}}));
    expect(res.status).toBe(400);
    expect(resolveCarry).not.toHaveBeenCalled();
    expect(persistAct).not.toHaveBeenCalled();
  });

  it('requires relationshipId when carry is present', async () => {
    const { relationshipId: _drop, ...withoutRelationship } = base;
    const res=await POST(request(withoutRelationship));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({error:'relationship_required'});
    expect(persistAct).not.toHaveBeenCalled();
  });

  it('refuses Sanctuary before relationship/carry reads or durable member persistence', async () => {
    const res=await POST(request({...base,sanctuary:true}));
    expect(res.status).toBe(409);
    expect(preflightRelationship).not.toHaveBeenCalled();
    expect(resolveCarry).not.toHaveBeenCalled();
    expect(persistAct).not.toHaveBeenCalled();
  });

  it('returns carry preflight refusal with persisted false and never calls runtime', async () => {
    resolveCarry.mockResolvedValue({ok:false,reason:'source_episode_not_found'});
    const res=await POST(request(base));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({error:'source_episode_not_found',persisted:false});
    expect(persistAct).not.toHaveBeenCalled();
    expect(runTurn).not.toHaveBeenCalled();
  });
});
