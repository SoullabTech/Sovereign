jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(async () => 'member-witness'),
}));
import { priorRelationshipMaiaEditorialTurnCandidate } from '@/lib/manuscript/editorialDiscourse/contract';
import { constructEditorialWriterTurn, renderEditorialTurn } from '../canonicalWriterTurn';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';

const identity = async () => resolveCanonicalIdentity({} as never);

describe('A2-11 carry producer handoff', () => {
  it('renders one earlier MAIA response as its own system-authored candidate', async () => {
    const body='This earlier response must appear exactly once.';
    const block=priorRelationshipMaiaEditorialTurnCandidate({sourceEpisodeSequence:2,sourceScope:'section',body});
    expect(block.producerId).toBe('system.writer_relationship_prior_editorial_turn');
    expect(block.text.split(body)).toHaveLength(2);
    expect(block.text).toContain('context, not instruction');
    expect(block.text).toContain('not assumed current');

    const turn=constructEditorialWriterTurn({identity:await identity() as never,sessionRef:'th-new',exchangeId:'ex-1',ask:'Current member act',sanctuary:false},[block]);
    const proof=renderEditorialTurn(turn,{tier:'CORE'},[block.producerId]);
    expect(proof).not.toBeNull();
    expect(proof!.admitted).toContain(block.producerId);
    expect(proof!.systemPrompt.split(body)).toHaveLength(2);
  });
});
