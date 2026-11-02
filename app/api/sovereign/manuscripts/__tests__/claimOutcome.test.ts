/**
 * D4 (server half) — what POST /api/sovereign/manuscripts does when the original cannot be bound to the new Work.
 *
 * The design is deliberate and kept: the member's words are saved either way and the response LABELS the Work honestly.
 * What this pins is that the label is truthful in every failure shape and that the trace left behind is content-free.
 * Measured against the real library: a KMS outage makes claimArrival RESOLVE false (it does not throw), which used to
 * leave no log line at all.
 */
import { NextRequest } from 'next/server';

const MEMBER = '11111111-1111-4111-8111-111111111111';
const CANARY = 'WSICANARYSERVERSIDE0123456789ABCDEF';

jest.mock('@/lib/db/postgres', () => {
  const client = {
    query: jest.fn(async (sql: string) => {
      if (/INSERT INTO member_manuscripts|INSERT INTO manuscript_sections|INSERT INTO living_works|INSERT INTO living_work_expressions/.test(sql)) {
        return { rows: [{ id: 'row-fictional-1' }] };
      }
      return { rows: [] };
    }),
  };
  return { query: jest.fn(async () => ({ rows: [] })), transaction: jest.fn(async (fn: (c: unknown) => unknown) => fn(client)) };
});
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn(async () => '11111111-1111-4111-8111-111111111111') }));
jest.mock('@/lib/manuscript/source/arrivals', () => ({
  claimArrival: jest.fn(),
  recordSuppliedArrival: jest.fn(async () => ({ id: 'supplied-arrival-1' })),
}));
jest.mock('@/lib/cabin/request', () => ({ cabinStore: jest.fn(), cabinMemberFromRequest: jest.fn(), setCabinSessionCookie: jest.fn() }));

import { POST } from '../route';
import { claimArrival } from '@/lib/manuscript/source/arrivals';

const claim = claimArrival as jest.Mock;
let logged: string[];

function req(extra: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/sovereign/manuscripts', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'Fictional Work', sections: [{ heading: 'One', body: 'Fictional body text.' }], createWork: true, ...extra }),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  logged = [];
  for (const m of ['log', 'info', 'warn', 'error'] as const) {
    jest.spyOn(console, m).mockImplementation((...a: unknown[]) => { logged.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')); });
  }
});
afterEach(() => jest.restoreAllMocks());

it('bound: labelled source_custodied, and no custody warning is logged', async () => {
  claim.mockResolvedValue(true);
  const res = await POST(req({ sourceArrivalId: '44444444-4444-4444-8444-444444444444' }));
  expect(res.status).toBe(201);
  expect((await res.json()).sourceCustody).toBe('source_custodied');
  expect(logged.filter((l) => l.includes('custody not bound'))).toEqual([]);
});

it('claim RETURNS false (the KMS-outage shape): the Work is saved and labelled legacy, and the case now leaves a content-free trace', async () => {
  claim.mockResolvedValue(false);
  const res = await POST(req({ sourceArrivalId: '44444444-4444-4444-8444-444444444444' }));
  expect(res.status).toBe(201);
  expect((await res.json()).sourceCustody).toBe('legacy_interpreted_import');
  const line = logged.find((l) => l.includes('custody not bound'));
  expect(line).toBeDefined();
  expect(line).toContain('claim_not_bound');
  expect(line).not.toContain(MEMBER); // identified by memberRef, never the raw member id
});

it('claim THROWS: the Work is saved and labelled legacy, and the log carries the error NAME but never its message or content', async () => {
  const err = new Error(`fictional failure mentioning ${CANARY}`); err.name = 'FictionalClaimError';
  claim.mockRejectedValue(err);
  const res = await POST(req({ sourceArrivalId: '44444444-4444-4444-8444-444444444444' }));
  expect(res.status).toBe(201);
  expect((await res.json()).sourceCustody).toBe('legacy_interpreted_import');
  const all = logged.join('\n');
  expect(all).toContain('claim_threw');
  expect(all).toContain('FictionalClaimError');
  expect(all).not.toContain(CANARY);
});

it('a pasted import whose text arrival cannot be bound is also labelled legacy and traced', async () => {
  claim.mockResolvedValue(false);
  const res = await POST(req({ confirmedText: 'Fictional pasted text.' }));
  expect(res.status).toBe(201);
  expect((await res.json()).sourceCustody).toBe('legacy_interpreted_import');
  expect(logged.some((l) => l.includes('claim_not_bound'))).toBe(true);
});
