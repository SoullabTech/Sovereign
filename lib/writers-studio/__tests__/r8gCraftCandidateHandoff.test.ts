jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(async () => 'member-witness'),
}));

import { priorWorkConversationCraftCandidates } from '@/lib/manuscript/editorialDiscourse/contract';
import { constructEditorialWriterTurn, renderEditorialTurn } from '../canonicalWriterTurn';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';

const identity = async () => resolveCanonicalIdentity({} as never);

describe('R8G authorship-preserving craft carry handoff', () => {
  it('renders writer and MAIA Work-conversation turns as distinct admitted producers', async () => {
    const blocks = priorWorkConversationCraftCandidates({
      memberTurns: [{ turnIndex: 2, body: 'This must feel like lived participation.' }],
      maiaTurns: [{ turnIndex: 3, body: 'Then the craft question is where explanation creates distance.' }],
    });
    expect(blocks.map((b) => b.producerId)).toEqual([
      'member.writer_prior_work_conversation',
      'system.writer_prior_work_conversation',
    ]);
    expect(blocks[0]!.text).toContain('writer-authored turns');
    expect(blocks[1]!.text).toContain('MAIA-authored turns');

    const turn = constructEditorialWriterTurn({
      identity: await identity() as never,
      sessionRef: 'editorial-thread-1',
      exchangeId: 'ex-1',
      ask: 'Show me craft examples.',
      sanctuary: false,
    }, blocks);
    const proof = renderEditorialTurn(
      turn,
      { tier: 'CORE' },
      blocks.map((block) => block.producerId),
    );
    expect(proof).not.toBeNull();
    expect(proof!.admitted).toEqual(expect.arrayContaining([
      'member.writer_prior_work_conversation',
      'system.writer_prior_work_conversation',
    ]));
    expect(proof!.systemPrompt).toContain('This must feel like lived participation.');
    expect(proof!.systemPrompt).toContain('where explanation creates distance');
  });
});
