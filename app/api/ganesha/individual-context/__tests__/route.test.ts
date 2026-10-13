import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
const mockResolve = jest.fn<(...args: unknown[]) => Promise<any>>();
jest.mock('@/lib/auth/individualContext', () => ({
  resolveIndividualContext: (...args: unknown[]) => mockResolve(...args),
}));
import { GET } from '../route';

const req = new NextRequest('https://soullab.life/api/ganesha/individual-context');

beforeEach(() => {
  mockResolve.mockReset();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('G2-1 Ganesha individual context route — read-only and minimally disclosed', () => {
  it('requires an authenticated member', async () => {
    mockResolve.mockResolvedValue(null);
    const r = await GET(req);
    expect(r.status).toBe(401);
    expect(r.headers.get('cache-control')).toBeNull();
  });

  it('allows new member without practitioner and refuses to pretend Pro standing', async () => {
    mockResolve.mockResolvedValue({
      memberId: 'member',
      legacyPersonalStatus: 'none',
      legacyPersonalPractitionerId: null,
    });
    const r = await GET(req);
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({
      authenticated: true,
      personalField: { identityReady: true, owner: 'member', contentAccess: 'not_assessed' },
      legacyPersonal: { status: 'none' },
      professionalStanding: 'not_evaluated',
    });
    expect(r.headers.get('cache-control')).toBe('no-store');
  });

  it('does not expose a historical practitioner identifier or infer a grant', async () => {
    mockResolve.mockResolvedValue({
      memberId: 'member',
      legacyPersonalStatus: 'active',
      legacyPersonalPractitionerId: 'historical-secret-reference',
    });
    const r = await GET(req);
    expect(r.status).toBe(200);
    expect(JSON.stringify(await r.json())).not.toContain('historical-secret-reference');
  });

  it('returns normal personal membership while ambiguous legacy history is held', async () => {
    mockResolve.mockResolvedValue({
      memberId: 'member',
      legacyPersonalStatus: 'ambiguous',
      legacyPersonalPractitionerId: null,
    });
    const r = await GET(req);
    expect((await r.json())).toMatchObject({
      personalField: { identityReady: true, owner: 'member', contentAccess: 'not_assessed' },
      legacyPersonal: { status: 'ambiguous' },
    });
  });

  it('fails closed if the backing identity read is unavailable', async () => {
    mockResolve.mockRejectedValue(new Error('synthetic DB unavailable'));
    const r = await GET(req);
    expect(r.status).toBe(503);
    expect(JSON.stringify(await r.json())).not.toContain('synthetic DB unavailable');
  });
});
