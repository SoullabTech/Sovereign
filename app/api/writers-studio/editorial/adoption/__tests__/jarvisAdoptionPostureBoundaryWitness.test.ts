/**
 * JARVIS — exact local adoption-route posture characterization.
 *
 * Source-only fictional boundary witness. A PASS in the first test is evidence
 * of a CURRENT SECURITY-REVIEW GAP, not a desired acceptance policy. It must
 * not be mistaken for permission to Apply in Sanctuary or to enable this route.
 * Ownership and version store are deliberately mocked; no SQL/network writes.
 */
const identity = jest.fn();
const adopt = jest.fn();

jest.mock('@/lib/maia/canonical-turn', () => ({
  resolveCanonicalIdentity: (...args: unknown[]) => identity(...args),
}));
jest.mock('@/lib/manuscript/editorialRuntime/adoption', () => ({
  adoptVersion: (...args: unknown[]) => adopt(...args),
}));

import { POST } from '../route';

const makeRequest = (body: unknown) => ({ json: async () => body }) as never;
const authorRequest = {
  threadId: 'fiction-owned-editorial-thread',
  versionId: 'fiction-writer-version',
};
const originalFlag = process.env.WRITERS_STUDIO_EDITORIAL_ENABLED;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.WRITERS_STUDIO_EDITORIAL_ENABLED = '1';
  identity.mockResolvedValue({ status: 'verified', memberId: 'fiction-member-a' });
  adopt.mockResolvedValue({ kind: 'applied', resultingVersion: 2 });
});
afterAll(() => {
  if (originalFlag === undefined) delete process.env.WRITERS_STUDIO_EDITORIAL_ENABLED;
  else process.env.WRITERS_STUDIO_EDITORIAL_ENABLED = originalFlag;
});

describe('JARVIS Class A acceptance STOP — existing adoption route', () => {
  it('documents the gap: verified writer can reach Apply with no current posture field', async () => {
    const response = await POST(makeRequest(authorRequest));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ kind: 'applied' });
    expect(adopt).toHaveBeenCalledWith({
      identity: { status: 'verified', memberId: 'fiction-member-a' },
      threadId: authorRequest.threadId,
      versionId: authorRequest.versionId,
    });
    // This passing test is a NEGATIVE policy witness. No real Apply occurred.
  });

  it('currently rejects Sanctuary as an unknown field, not via current-posture authority', async () => {
    const response = await POST(makeRequest({ ...authorRequest, sanctuary: true }));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: expect.stringContaining('unknown field(s): sanctuary'),
    });
    expect(adopt).not.toHaveBeenCalled();
  });

  it('holds the feature off by default', async () => {
    delete process.env.WRITERS_STUDIO_EDITORIAL_ENABLED;
    const response = await POST(makeRequest(authorRequest));
    expect(response.status).toBe(404);
    expect(adopt).not.toHaveBeenCalled();
  });

  it('requires verified identity for the existing route', async () => {
    identity.mockResolvedValue({ status: 'unverified' });
    const response = await POST(makeRequest(authorRequest));
    expect(response.status).toBe(401);
    expect(adopt).not.toHaveBeenCalled();
  });

  it('refuses caller-supplied manuscript/version authorization facts', async () => {
    const response = await POST(makeRequest({
      ...authorRequest, workId: 'fiction-other-work', baseVersion: 77,
      authorizationId: 'fiction-writer-authorization',
    }));
    expect(response.status).toBe(400);
    expect(adopt).not.toHaveBeenCalled();
  });

  it('never chooses a missing version automatically', async () => {
    const response = await POST(makeRequest({ threadId: authorRequest.threadId }));
    expect(response.status).toBe(400);
    expect(adopt).not.toHaveBeenCalled();
  });

  it('reports a foreign or missing relationship as a refusal, without applying', async () => {
    adopt.mockResolvedValue({ kind: 'relationship_refusal', reason: 'thread_not_found' });
    const response = await POST(makeRequest(authorRequest));
    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ kind: 'relationship_refusal' });
  });
});
