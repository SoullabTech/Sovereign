const queryMock = jest.fn();
const loadThreadMock = jest.fn();

jest.mock('@/lib/db/postgres', () => ({
  query: (...args: unknown[]) => queryMock(...args),
}));

jest.mock('@/lib/manuscript/ask/threadStore', () => ({
  loadThread: (...args: unknown[]) => loadThreadMock(...args),
}));

import { resolveWorkConversationCraftCarry } from '../workConversationCraftCarry';

const turns = [
  { index: 0, speaker: 'author' as const, body: 'I want the reader to feel this.', staleness: {}, answerProvenance: null, createdAt: new Date() },
  { index: 1, speaker: 'maia' as const, body: 'I see a tension between explanation and experience.', staleness: {}, answerProvenance: null, createdAt: new Date() },
  { index: 2, speaker: 'author' as const, body: 'The spiral should feel lived, not taught.', staleness: {}, answerProvenance: null, createdAt: new Date() },
  { index: 3, speaker: 'maia' as const, body: 'Then the craft question is where explanation keeps the reader at a distance.', staleness: {}, answerProvenance: null, createdAt: new Date() },
  { index: 4, speaker: 'author' as const, body: 'Later words after the handoff should not leak backward.', staleness: {}, answerProvenance: null, createdAt: new Date() },
];

beforeEach(() => {
  jest.clearAllMocks();
  queryMock.mockResolvedValue({ rows: [{ manuscript_id: 'ms-1', proposal_chain_id: 'pc-1' }] });
  loadThreadMock.mockResolvedValue({
    id: 'work-thread-1',
    manuscriptId: 'ms-1',
    anchor: { on: 'work' },
    reading: null,
    canonicalAtOpen: 'c1',
    initiatedBy: 'author',
    openedAt: new Date(),
    turns,
  });
});

describe('R8G Work conversation → Craft carry', () => {
  it('re-resolves the owned Work thread, freezes at the selected MAIA turn, and preserves authorship', async () => {
    const out = await resolveWorkConversationCraftCarry({
      memberId: 'member-1',
      receiverThreadId: 'editorial-thread-1',
      sourceThreadId: 'work-thread-1',
      sourceMaiaTurnIndex: 3,
    });
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.carry.sourceMaiaTurnIndex).toBe(3);
    expect(out.carry.memberTurns.map((t) => t.turnIndex)).toEqual([0, 2]);
    expect(out.carry.maiaTurns.map((t) => t.turnIndex)).toEqual([1, 3]);
    expect(out.carry.memberTurns.map((t) => t.body).join(' ')).not.toContain('Later words after the handoff');
    expect(out.carry.producerIds).toEqual([
      'member.writer_prior_work_conversation',
      'system.writer_prior_work_conversation',
    ]);
  });

  it('refuses a browser-named boundary that is not a MAIA turn', async () => {
    const out = await resolveWorkConversationCraftCarry({
      memberId: 'member-1',
      receiverThreadId: 'editorial-thread-1',
      sourceThreadId: 'work-thread-1',
      sourceMaiaTurnIndex: 2,
    });
    expect(out).toEqual({ ok: false, reason: 'source_turn_not_maia' });
  });

  it('refuses cross-manuscript carry', async () => {
    queryMock.mockResolvedValue({ rows: [{ manuscript_id: 'ms-2', proposal_chain_id: 'pc-1' }] });
    const out = await resolveWorkConversationCraftCarry({
      memberId: 'member-1',
      receiverThreadId: 'editorial-thread-1',
      sourceThreadId: 'work-thread-1',
      sourceMaiaTurnIndex: 3,
    });
    expect(out).toEqual({ ok: false, reason: 'source_thread_mismatch' });
  });
});
