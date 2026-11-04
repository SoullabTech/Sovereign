/**
 * D2 — POST /api/writers-studio/sources is a hard hold in code, and stays one when the manifest releases.
 *
 * Why this is pinned rather than "tied to the manifest": the route has no live handler behind its refusal (the only
 * in-tree upload body, ingestWorkbenchUpload, has no route caller). Reading the manifest and opening on release would
 * therefore open NOTHING that is encrypted: it would either do nothing or invite someone to wire in the plaintext
 * workbench store. The refusal must hold regardless of the manifest until an encrypted handler exists and this test is
 * changed on purpose. It was previously unpinned (plan finding F1: "no test pins it").
 */
import { NextRequest } from 'next/server';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(async () => '11111111-1111-4111-8111-111111111111'),
}));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(async () => ({ rows: [] })) }));
jest.mock('@/lib/writersStudio/releaseAuthority', () => ({
  writerReleaseAuthority: jest.fn(() => ({ manifestId: 'test-released', sourceIntakeReleased: true })),
}));

import { POST } from '../route';
import { query } from '@/lib/db/postgres';

/** A request whose body methods all throw, so any attempt to read it is visible. */
function bodyTrap(): NextRequest {
  const trap = () => { throw new Error('the request body was read'); };
  return { formData: trap, json: trap, text: trap, arrayBuffer: trap, blob: trap, body: new Proxy({}, { get: trap }) } as unknown as NextRequest;
}

describe('sources POST hold', () => {
  it('answers 423 uncached, even though the manifest mock says member intake is RELEASED', async () => {
    const res = await (POST as (r?: NextRequest) => Promise<Response>)(bodyTrap());
    expect(res.status).toBe(423);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(await res.json()).toEqual({
      error: 'Source uploads are temporarily unavailable pending independent security and recovery acceptance.',
    });
  });

  it('refuses before parsing the body and before any database access', async () => {
    const res = await (POST as (r?: NextRequest) => Promise<Response>)(bodyTrap());
    expect(res.status).toBe(423); // a body read would have thrown instead
    expect(query).not.toHaveBeenCalled();
  });
});
