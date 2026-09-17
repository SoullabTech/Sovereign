/**
 * SPM-F5 W1 — legacy sovereignty retirement.
 *
 * These proofs are intentionally negative: the retired corridor must remain
 * non-executable and non-promissory. They do not prove complete account
 * deletion; that belongs to the later custody/disposition programme.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { readFileSync } from 'fs';
import path from 'path';
import { matchRule } from '@/config/accessMatrix';

const mockPoolQuery = jest.fn<(...args: any[]) => Promise<any>>();
const mockPoolConnect = jest.fn<(...args: any[]) => Promise<any>>();

jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    query: mockPoolQuery,
    connect: mockPoolConnect,
  })),
}));

const ROOT = path.resolve(__dirname, '../../../..');

function source(rel: string): string {
  return readFileSync(path.join(ROOT, rel), 'utf8');
}
function mockExpressResponse() {
  const response: any = {
    statusCode: 200,
    body: undefined,
  };
  response.status = jest.fn((code: number) => {
    response.statusCode = code;
    return response;
  });
  response.json = jest.fn((body: unknown) => {
    response.body = body;
    return body;
  });
  return response;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockPoolQuery.mockRejectedValue(new Error('W1 retirement must never query PostgreSQL'));
  mockPoolConnect.mockRejectedValue(new Error('W1 retirement must never connect to PostgreSQL'));
});

describe('W1 · Next deletion endpoint is a retirement tombstone', () => {
  it('returns 410 and explicitly states that no account change occurred', async () => {
    const { POST } = await import('../delete-my-memory/route');
    const res = await POST();
    const body: any = await res.json();

    expect(res.status).toBe(410);
    expect(body.error).toBe('legacy_sovereignty_retired');
    expect(body.accountChanged).toBe(false);
    expect(body.nextStep).toBe('account_settings');
    expect(body.message).toMatch(/retired/i);
    expect(body.message).toMatch(/no deletion/i);
  });
  it('has no database or legacy-service dependency', () => {
    const src = source('app/api/sovereignty/delete-my-memory/route.ts');
    expect(src).not.toMatch(/@\/lib\/db|postgres|UserDataSovereignty|delete-memory-api/);
    expect(src).not.toMatch(/DELETE\s+FROM|INSERT\s+INTO|UPDATE\s+/i);
  });
});

describe('W1 · Next data-summary endpoint is a retirement tombstone', () => {
  it('returns 410 without echoing or reading a caller-selected identity', async () => {
    const { GET } = await import('../my-data-summary/[userId]/route');
    const res = await GET();
    const body: any = await res.json();

    expect(res.status).toBe(410);
    expect(body.error).toBe('legacy_sovereignty_retired');
    expect(body.accountChanged).toBe(false);
    expect(body.nextStep).toBe('account_settings');
    expect(JSON.stringify(body)).not.toMatch(/user_id|deletion_available|deletion_permanent|deletion_immediate/i);
  });

  it('has no database dependency and no dynamic user-id read', () => {
    const src = source('app/api/sovereignty/my-data-summary/[userId]/route.ts');
    expect(src).not.toMatch(/@\/lib\/db|postgres|params.*userId|SELECT\s+/i);
  });
});


describe('W1 · retired routes declare their own access posture', () => {
  it('delete-my-memory no longer inherits /api/sovereign by lexical prefix', () => {
    const rule = matchRule('/api/sovereignty/delete-my-memory');
    expect(rule?.exact).toBe('/api/sovereignty/delete-my-memory');
    expect(rule?.notes).toMatch(/RETIRED.*W1/i);
  });

  it('data-summary is explicitly classified by its own retired prefix', () => {
    const path = '/api/sovereignty/my-data-summary/arbitrary';
    const rule = matchRule(path);
    expect(rule?.prefix).toBe('/api/sovereignty/my-data-summary/');
    expect(rule?.notes).toMatch(/RETIRED.*W1/i);
  });
});

describe('W1 · standalone legacy service cannot revive deletion', () => {
  it('deleteUserMemory refuses before any PostgreSQL call', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { UserDataSovereignty } = require('../../../../services/user-sovereignty/delete-memory-api.js');
    const res = mockExpressResponse();

    await UserDataSovereignty.deleteUserMemory(
      { body: { userId: 'victim', confirmationPhrase: 'anything' } },
      res,
    );

    expect(res.statusCode).toBe(410);
    expect(res.body.success).toBe(false);
    expect(res.body.accountChanged).toBe(false);
    expect(res.body.error).toBe('legacy_sovereignty_retired');
    expect(mockPoolConnect).not.toHaveBeenCalled();
    expect(mockPoolQuery).not.toHaveBeenCalled();
  });

  it('getDataSummary refuses before any PostgreSQL call and does not echo the id', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { UserDataSovereignty } = require('../../../../services/user-sovereignty/delete-memory-api.js');
    const res = mockExpressResponse();

    await UserDataSovereignty.getDataSummary({ params: { userId: 'victim' } }, res);

    expect(res.statusCode).toBe(410);
    expect(res.body.error).toBe('legacy_sovereignty_retired');
    expect(JSON.stringify(res.body)).not.toContain('victim');
    expect(mockPoolConnect).not.toHaveBeenCalled();
    expect(mockPoolQuery).not.toHaveBeenCalled();
  });
});
describe('W1 · Lab Tools sovereignty surface is non-executable and non-promissory', () => {
  const page = source('app/labtools/sovereignty/page.tsx');

  it('contains no old destructive request or hardcoded demo identity', () => {
    expect(page).not.toMatch(/\/api\/sovereignty\/delete-my-memory/);
    expect(page).not.toMatch(/\/api\/sovereignty\/my-data-summary/);
    expect(page).not.toContain('demo_user_001');
    expect(page).not.toContain('DELETE ALL MY CONSCIOUSNESS DATA');
  });

  it('does not promise deletion availability or completion', () => {
    expect(page).not.toMatch(/deletion_(available|permanent|immediate)/i);
    expect(page).not.toMatch(/all consciousness data|permanently and completely|processed successfully|queued/i);
  });

  it('points to the current account settings rather than another legacy deletion path', () => {
    expect(page).toContain('href="/account/settings"');
    expect(page).toMatch(/legacy.*retired|retired.*legacy/is);
  });
});
