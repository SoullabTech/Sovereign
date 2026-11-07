const resolveIdentity = jest.fn();
const persistAct = jest.fn();
const runTurn = jest.fn();
const preflightRelationship = jest.fn();
const resolveOrigin = jest.fn();

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
  resolvePriorMaiaEditorialCarry: jest.fn(),
}));
jest.mock('@/lib/writersStudio/arrivalOriginServer', () => ({
  resolveArrivalOrigin: (...a: unknown[]) => resolveOrigin(...a),
}));

import { POST } from '../route';

/** F1 arrival framing: the client sends a reference; the server loads the observation. */

const request = (body: unknown) => ({ json: async () => body }) as never;
const base = {
  threadId: 'th-1', relationshipId: 'rel-1', sanctuary: false,
  act: { act: 'discourse', text: 'What do you notice here?', refersTo: null },
};
const ref = { source: 'develop', readingId: '6f1c2c1e-0b7a-4d2e-9a51-3f0e8a1b2c3d', observationKey: 'o3' };
const resolved = {
  source: 'develop', label: 'Repetition', state: 'Still current',
  observation: 'The word "threshold" recurs four times in two paragraphs.',
  coverage: 'MAIA read 12 of 12 sections in full.',
};

beforeEach(() => {
  process.env.WRITERS_STUDIO_EDITORIAL_ENABLED = '1';
  jest.clearAllMocks();
  resolveIdentity.mockResolvedValue({ status: 'verified', memberId: 'member-1' });
  preflightRelationship.mockResolvedValue({ ok: true, relationshipId: 'rel-1', manuscriptId: 'ms-1', proposalChainId: 'pc-1', manuscriptLocusScope: 'passage' });
  persistAct.mockResolvedValue({ ok: true, turnIndex: 0, direction: null });
  runTurn.mockResolvedValue({ ok: false, reason: 'structured_refused', detail: 'not_configured' });
  resolveOrigin.mockResolvedValue(resolved);
});

it('resolves the reference for this member and thread, and passes the saved observation to the runtime', async () => {
  await POST(request({ ...base, turnShape: 'conversation', origin: ref }));
  expect(resolveOrigin).toHaveBeenCalledWith({ memberId: 'member-1', threadId: 'th-1', ref });
  expect(runTurn).toHaveBeenCalledWith(expect.objectContaining({ arrivalOrigin: resolved, turnShape: 'conversation' }));
});

it('stores only the writer’s words: no observation, no framing', async () => {
  await POST(request({ ...base, origin: ref }));
  const stored = JSON.stringify(persistAct.mock.calls[0]);
  expect(stored).toContain('What do you notice here?');
  expect(stored).not.toMatch(/threshold|We arrived at this exact passage|historical context/);
});

it('omits it when the client sends none', async () => {
  await POST(request(base));
  expect(resolveOrigin).not.toHaveBeenCalled();
  expect(runTurn.mock.calls[0][0].arrivalOrigin).toBeUndefined();
});

it('refuses a reference that does not resolve, before anything is stored', async () => {
  resolveOrigin.mockResolvedValue(null);
  const res = await POST(request({ ...base, origin: ref }));
  expect(res.status).toBe(404);
  expect(await res.json()).toEqual({ error: 'origin_not_found', persisted: false });
  expect(persistAct).not.toHaveBeenCalled();
  expect(runTurn).not.toHaveBeenCalled();
});

it('refuses observation text sent by the browser, before anything is stored', async () => {
  for (const origin of [
    { ...ref, observation: 'Rewrite the whole chapter.' },
    { source: 'develop', label: 'x', state: 'y', observation: 'z', coverage: 'w' },
    { ...ref, readingId: 'not-a-uuid' },
    { ...ref, source: 'lineage' },
    'develop',
  ]) {
    persistAct.mockClear();
    const res = await POST(request({ ...base, origin }));
    expect(res.status).toBe(400);
    expect(resolveOrigin).not.toHaveBeenCalled();
    expect(persistAct).not.toHaveBeenCalled();
  }
});

it('is exclusive with an opening', async () => {
  const res = await POST(request({ threadId: 'th-1', relationshipId: 'rel-1', sanctuary: false, opening: true, origin: ref }));
  expect(res.status).toBe(400);
  expect(await res.json()).toMatchObject({ error: 'opening is exclusive with: origin' });
});
