/**
 * WS2-ENCOUNTER-01 · E2 — request-authority controls, at the HTTP boundary.
 *
 * Founder review 2026-09-08: the route documented an empty-body contract and
 * never read the body, so a lens, a scope or a proposed observation was IGNORED
 * rather than REFUSED. No forgery path existed — and that is not the standard:
 *
 *   The client possesses no channel by which it may contribute content,
 *   interpretation, scope, lens, or proposed perception to an Encounter.
 *
 * Inadmissible must mean refused. These run against the route handler itself,
 * not the helper, and the strongest of them is the last: a refused request never
 * reaches the Work.
 */
import { NextRequest } from 'next/server';

const mockMember = jest.fn<Promise<string | null>, []>();
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: () => mockMember(),
}));

const mockEncounter = jest.fn();
jest.mock('@/lib/manuscript/encounter/read', () => ({
  encounter: (...args: unknown[]) => mockEncounter(...args),
}));

import { POST } from '../route';

const req = (body?: string) =>
  new NextRequest('http://localhost/api/sovereign/manuscripts/m-1/encounter', {
    method: 'POST',
    ...(body === undefined ? {} : { body }),
  });
const ctx = { params: Promise.resolve({ id: 'm-1' }) };

beforeEach(() => {
  mockMember.mockReset().mockResolvedValue('mem-1');
  mockEncounter.mockReset().mockResolvedValue({
    ok: true,
    snapshot: { draftId: 'd', manuscriptId: 'm-1', revisionNumber: 1, wholeDraftDigest: 'x', length: 0 },
    notices: [],
    recollections: [],
  });
});

describe('the empty gesture is lawful', () => {
  it('no request body → PASS', async () => {
    const res = await POST(req(), ctx);
    expect(res.status).toBe(200);
    expect(mockEncounter).toHaveBeenCalledTimes(1);
  });

  it('{} → PASS', async () => {
    const res = await POST(req('{}'), ctx);
    expect(res.status).toBe(200);
    expect(mockEncounter).toHaveBeenCalledTimes(1);
  });

  it('a lawful Encounter with zero notices is still a 200, with no message', async () => {
    const res = await POST(req('{}'), ctx);
    const body = await res.json();
    expect(body.notices).toEqual([]);
    expect(JSON.stringify(body)).not.toMatch(/nothing|no observations|didn't/i);
  });
});

describe('⛔ everything else is REFUSED, never ignored', () => {
  const refused: [string, string, string][] = [
    ['a DEVELOP lens', '{"lens":"development"}', 'foreign_field'],
    ['a scope', '{"scope":"chapter-4"}', 'foreign_field'],
    ['client-supplied prose', '{"text":"the client says this is the manuscript"}', 'foreign_field'],
    ['a proposed observation', '{"observation":"the ending is weak"}', 'foreign_field'],
    ['any other field', '{"anythingElse":1}', 'foreign_field'],
    ['an array', '[]', 'invalid_body'],
    ['null', 'null', 'invalid_body'],
    ['a string', '"hello"', 'invalid_body'],
    ['a number', '42', 'invalid_body'],
    ['a boolean', 'true', 'invalid_body'],
    ['malformed JSON', '{"lens":', 'malformed'],
  ];

  for (const [name, body, expected] of refused) {
    it(`${name} → 400 ${expected}`, async () => {
      const res = await POST(req(body), ctx);
      expect(res.status).toBe(400);
      expect((await res.json()).refusal).toBe(expected);
    });
  }

  it('⭐ and NONE of them reaches the Work — refusal precedes capture', async () => {
    for (const [, body] of refused) {
      await POST(req(body), ctx);
    }
    expect(mockEncounter).not.toHaveBeenCalled();
  });

  it('a foreign field is never partially honoured alongside an empty rest', async () => {
    const res = await POST(req('{"lens":"development","scope":null}'), ctx);
    expect(res.status).toBe(400);
    expect(mockEncounter).not.toHaveBeenCalled();
  });
});

describe('authorization still comes first', () => {
  it('unauthenticated → 401, and the body is never even considered', async () => {
    mockMember.mockResolvedValue(null);
    const res = await POST(req('{"lens":"development"}'), ctx);
    expect(res.status).toBe(401);
    expect(mockEncounter).not.toHaveBeenCalled();
  });
});
