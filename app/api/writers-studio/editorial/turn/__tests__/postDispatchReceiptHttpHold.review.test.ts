/**
 * CLASS A review-only, source-exact negative HTTP test for Writer's Studio.
 * A provider may have received the author's Work before receipt confirmation
 * fails. That is NOT a pre-dispatch refusal or a normal provider error.
 * Synthetic identities/words, zero provider, no PostgreSQL or persistence.
 */
const resolveIdentity = jest.fn();
const persistAct = jest.fn();
const runTurn = jest.fn();
const preflightRelationship = jest.fn();
const resolveCarry = jest.fn();

jest.mock('@/lib/maia/canonical-turn', () => ({
  resolveCanonicalIdentity: (...args: unknown[]) => resolveIdentity(...args),
}));
jest.mock('@/lib/manuscript/editorialRuntime/memberAct', () => ({
  persistMemberEditorialAct: (...args: unknown[]) => persistAct(...args),
}));
jest.mock('@/lib/manuscript/editorialRuntime/turn', () => ({
  runEditorialTurn: (...args: unknown[]) => runTurn(...args),
}));
jest.mock('@/lib/writers-studio/relationshipCarriage', () => ({
  preflightEditorialRelationshipCarriage: (...args: unknown[]) =>
    preflightRelationship(...args),
  resolvePriorMaiaEditorialCarry: (...args: unknown[]) => resolveCarry(...args),
}));

import { POST } from '../route';
const request = (body: unknown) => ({ json: async () => body }) as never;
const base = {
  threadId: 'fictional-thread', relationshipId: 'fictional-relationship',
  sanctuary: false,
  act: { act: 'discourse', text: 'FICTIONAL_WORDS_NO_MEMBER_DATA', refersTo: null },
  carry: { kind: 'prior_maia_editorial_turn', sourceEpisodeSequence: 2 },
};
const carried = {
  kind: 'PRIOR_MAIA_EDITORIAL_TURN', relationshipId: 'fictional-relationship',
  sourceEpisodeSequence: 2, sourceThreadId: 'fictional-old-thread',
  sourceMaiaTurnIndex: 4, sourceBody: 'Fictional earlier reply',
  sourceTemporal: 'CURRENT_FROZEN_LOCUS', sourceScope: 'section',
  receiverThreadId: 'fictional-thread', receiverScope: 'passage',
  producerId: 'system.writer_relationship_prior_editorial_turn',
};

beforeEach(() => {
  process.env.WRITERS_STUDIO_EDITORIAL_ENABLED = '1';
  jest.clearAllMocks();
  resolveIdentity.mockResolvedValue({ status: 'verified', memberId: 'fictional-member' });
  persistAct.mockResolvedValue({ ok: true, turnIndex: 7, direction: null });
  preflightRelationship.mockResolvedValue({
    ok: true, relationshipId: 'fictional-relationship',
    manuscriptId: 'fictional-work', proposalChainId: 'fictional-chain',
    manuscriptLocusScope: 'passage',
  });
  resolveCarry.mockResolvedValue({ ok: true, carry: carried });
});

describe('Class A HOLD: post-dispatch unconfirmed receipt HTTP contract', () => {
  test('RED: a crossed-provider attempt without receipt acknowledgement must be 500, not generic 502', async () => {
    runTurn.mockResolvedValueOnce({
      ok: false, reason: 'disclosure_confirmation_unresolved',
      dispatch: 'response_observed',
    });
    const logs = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const res = await POST(request(base));
      expect(runTurn).toHaveBeenCalledTimes(1);
      expect(persistAct).toHaveBeenCalledTimes(1);
      expect(res.status).toBe(500);
      const outcome = await res.json();
      expect(outcome).toMatchObject({
        error: 'disclosure_confirmation_unresolved',
        dispatch: 'response_observed',
      });
      expect(JSON.stringify(outcome)).not.toContain('FICTIONAL_WORDS_NO_MEMBER_DATA');
      expect(JSON.stringify(logs.mock.calls)).not.toContain('FICTIONAL_WORDS_NO_MEMBER_DATA');
    } finally {
      logs.mockRestore();
    }
  });
  test('GREEN: pre-dispatch disclosure denial stays 409 without a dispatch fact', async () => {
    runTurn.mockResolvedValueOnce({ ok: false, reason: 'disclosure_unavailable' });
    const res = await POST(request(base));
    expect(res.status).toBe(409);
    const outcome = await res.json();
    expect(outcome.error).toBe('disclosure_unavailable');
    expect(outcome).not.toHaveProperty('dispatch');
    expect(runTurn).toHaveBeenCalledTimes(1);
  });
});
