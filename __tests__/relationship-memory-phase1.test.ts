/**
 * Relationship Memory v1 — Phase 1 attach safeguards (scribe/start)
 *
 * Proves the load-bearing Phase-1 guarantees from the spec (§4, §6, §10) and
 * Kelly's release standard:
 *   - a client owned by the practitioner attaches (client_id persisted)
 *   - FAIL CLOSED: a client NOT owned by the practitioner is never attached
 *   - stricter sanctuary: keepLinkPrivate stores no link, even with a valid client
 *   - no clientId → no link, no ownership query
 *
 * Run: npx jest __tests__/relationship-memory-phase1.test.ts
 */

const mockInsertOne = jest.fn();
const mockQueryOne = jest.fn();
jest.mock('@/lib/db/postgres', () => ({
  insertOne: (...args: any[]) => mockInsertOne(...args),
  queryOne: (...args: any[]) => mockQueryOne(...args),
}));

const mockGetMemberId = jest.fn();
jest.mock('@/lib/scribe/scribeAuth', () => ({
  getMemberIdFromRequest: (...args: any[]) => mockGetMemberId(...args),
}));

import { POST } from '@/app/api/scribe/start/route';

const MEMBER = 'member-aaaa';
const OWNED_CLIENT = 'client-owned-1111';
const FOREIGN_CLIENT = 'client-foreign-9999';

function req(body: any): any {
  return { json: async () => body };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetMemberId.mockResolvedValue(MEMBER);
  mockInsertOne.mockImplementation(async (_table: string, data: any) => ({
    id: 'session-1',
    container: data.container,
    started_at: '2026-06-11T00:00:00Z',
    consent_status: data.consent_status,
  }));
});

function insertedData() {
  expect(mockInsertOne).toHaveBeenCalledTimes(1);
  return mockInsertOne.mock.calls[0][1];
}

describe('Relationship Memory Phase 1 — attach safeguards', () => {
  it('attaches client_id when the client belongs to the practitioner', async () => {
    mockQueryOne.mockResolvedValue({ id: OWNED_CLIENT });
    const res: any = await POST(req({ container: 'practitioner', clientId: OWNED_CLIENT }));
    const json = await res.json();
    // ownership query is scoped to [clientId, requesting memberId]
    expect(mockQueryOne).toHaveBeenCalledWith(
      expect.stringContaining('practitioner_clients'),
      [OWNED_CLIENT, MEMBER]
    );
    expect(insertedData().client_id).toBe(OWNED_CLIENT);
    expect(json.session.linkStored).toBe(true);
    expect(json.session.clientId).toBe(OWNED_CLIENT);
  });

  it('FAILS CLOSED: a client not owned by the practitioner is never attached', async () => {
    mockQueryOne.mockResolvedValue(null); // ownership check returns no row
    const res: any = await POST(req({ container: 'practitioner', clientId: FOREIGN_CLIENT }));
    const json = await res.json();
    expect(insertedData().client_id).toBeUndefined();
    expect(json.session.linkStored).toBe(false);
    expect(json.session.clientId).toBeNull();
  });

  it('stricter sanctuary: keepLinkPrivate stores no link, even with a valid client', async () => {
    const res: any = await POST(
      req({ container: 'practitioner', clientId: OWNED_CLIENT, keepLinkPrivate: true })
    );
    const json = await res.json();
    expect(mockQueryOne).not.toHaveBeenCalled(); // never even resolves the client
    expect(insertedData().client_id).toBeUndefined();
    expect(json.session.linkStored).toBe(false);
  });

  it('no clientId → no link and no ownership query', async () => {
    const res: any = await POST(req({ container: 'solo' }));
    const json = await res.json();
    expect(mockQueryOne).not.toHaveBeenCalled();
    expect(insertedData().client_id).toBeUndefined();
    expect(json.session.linkStored).toBe(false);
  });
});
