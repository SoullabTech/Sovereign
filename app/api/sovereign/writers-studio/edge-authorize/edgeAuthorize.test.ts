import { NextRequest } from 'next/server';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(),
}));
jest.mock('@/lib/writersStudio/betaAccessServer', () => ({
  writersStudioBetaAccess: jest.fn(),
}));

import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
import { GET } from './route';

const session = getMemberIdFromRequest as jest.MockedFunction<typeof getMemberIdFromRequest>;
const admission = writersStudioBetaAccess as jest.MockedFunction<typeof writersStudioBetaAccess>;
const active = new NextRequest('https://beta.soullab.life/api/sovereign/writers-studio/edge-authorize', {
  headers: { host: 'beta.soullab.life' },
});

describe('WS-BETA-ENTRY-R1 exact member edge authorization', () => {
  const previous = process.env.WRITERS_STUDIO_RESTRICTED_BETA;
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.WRITERS_STUDIO_RESTRICTED_BETA = 'true';
  });
  afterAll(() => {
    if (previous === undefined) delete process.env.WRITERS_STUDIO_RESTRICTED_BETA;
    else process.env.WRITERS_STUDIO_RESTRICTED_BETA = previous;
  });

  it('refuses authorization outside a restricted beta runtime', async () => {
    delete process.env.WRITERS_STUDIO_RESTRICTED_BETA;
    expect((await GET(active)).status).toBe(404);
    expect(session).not.toHaveBeenCalled();
  });

  it('refuses a request to a non-beta host before reading identity', async () => {
    const req = new NextRequest('https://soullab.life/api/sovereign/writers-studio/edge-authorize', {
      headers: { host: 'soullab.life' },
    });
    expect((await GET(req)).status).toBe(403);
    expect(session).not.toHaveBeenCalled();
  });

  it('refuses anonymous and expired/revoked sessions', async () => {
    session.mockResolvedValue(null);
    const r = await GET(active);
    expect(r.status).toBe(401);
    expect(r.headers.get('cache-control')).toBe('no-store');
    expect(admission).not.toHaveBeenCalled();
  });

  it('refuses a valid but uninvited member session', async () => {
    session.mockResolvedValue('11111111-1111-4111-8111-111111111111');
    admission.mockResolvedValue({ eligible: false, basis: 'not_in_pilot' });
    expect((await GET(active)).status).toBe(403);
  });

  it('admits only the exact approved member', async () => {
    session.mockResolvedValue('22222222-2222-4222-8222-222222222222');
    admission.mockResolvedValue({ eligible: true, basis: 'active_beta_tester' });
    const r = await GET(active);
    expect(r.status).toBe(204);
    expect(r.headers.get('cache-control')).toBe('no-store');
  });

  it('refuses uncertain database access without a fallback grant', async () => {
    session.mockResolvedValue('22222222-2222-4222-8222-222222222222');
    admission.mockRejectedValue(new Error('fictional database unavailable'));
    expect((await GET(active)).status).toBe(503);
  });
});
