/**
 * WS-DELETE-01 retained editorial threads — the adoption route's answer for a refused (orphaned) origin. HERMETIC.
 * The route is only a carrier of the outcome (its header says so); what is pinned here is that the carrier keeps the three
 * relationship refusals apart: an unknown id is 404, a thread that is not editorial is 400, and a thread whose Work was removed is
 * 409 with the same code the thread, version and open paths already use for the same fact.
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

let outcome: unknown = null;
const adoptVersion = jest.fn(async () => outcome);
jest.mock('@/lib/manuscript/editorialRuntime/adoption', () => ({ adoptVersion: (...a: unknown[]) => (adoptVersion as any)(...a) }));
jest.mock('@/lib/maia/canonical-turn', () => ({
  resolveCanonicalIdentity: jest.fn(async () => ({ status: 'verified', memberId: 'm-1', memberRef: 'ref' })),
}));

import { POST } from '../route';

const post = (body: unknown) => POST(new NextRequest('http://localhost/api/writers-studio/editorial/adoption', {
  method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' },
}));

beforeEach(() => { process.env.WRITERS_STUDIO_EDITORIAL_ENABLED = '1'; adoptVersion.mockClear(); });

describe('adoption route status for a relationship refusal', () => {
  it.each([
    ['origin_unavailable', 409],
    ['not_editorial', 400],
    ['thread_not_found', 404],
    ['chain_unknown', 404],
    ['version_unknown', 404],
  ])('ORIG-%s answers %i, with the outcome whole in the body', async (reason, status) => {
    outcome = { kind: 'relationship_refusal', reason };
    const res = await post({ threadId: 't-1', versionId: 'v-1' });
    expect(res.status).toBe(status);
    expect(await res.json()).toEqual({ kind: 'relationship_refusal', reason });
  });

  it('ORIG-flag the route is still off by default: 404 with an empty body, and the seam is never called', async () => {
    process.env.WRITERS_STUDIO_EDITORIAL_ENABLED = '0';
    outcome = { kind: 'relationship_refusal', reason: 'origin_unavailable' };
    const res = await post({ threadId: 't-1', versionId: 'v-1' });
    expect(res.status).toBe(404);
    expect(await res.text()).toBe('');
    expect(adoptVersion).not.toHaveBeenCalled();
  });
});
