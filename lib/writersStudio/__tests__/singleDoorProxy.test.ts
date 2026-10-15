import { NextRequest } from 'next/server';
import { proxy } from '../../../proxy';
import { deriveVerifiedAccess } from '@/lib/auth/verifiedAccess';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';

jest.mock('@/lib/auth/verifiedAccess', () => ({ deriveVerifiedAccess: jest.fn() }));
jest.mock('@/lib/writersStudio/betaAccessServer', () => ({ writersStudioBetaAccess: jest.fn() }));

const verify = deriveVerifiedAccess as jest.Mock;
const cohort = writersStudioBetaAccess as jest.Mock;
const access = (authenticated: boolean, memberId: string | null = null) => ({
  authenticated, memberId, roles: ['member'], tier: 'free',
  reason: authenticated ? null : 'no_credential',
});
const req = (path: string, method = 'GET') =>
  new NextRequest('https://beta.soullab.life' + path, { method });

describe('beta single-door middleware, with a genuine NextRequest', () => {
  const prevRestricted = process.env.WRITERS_STUDIO_RESTRICTED_BETA;
  const prevDoor = process.env.WRITERS_STUDIO_BETA_SINGLE_DOOR;
  beforeEach(() => {
    process.env.WRITERS_STUDIO_RESTRICTED_BETA = 'true';
    process.env.WRITERS_STUDIO_BETA_SINGLE_DOOR = 'true';
    verify.mockReset();
    cohort.mockReset();
    verify.mockResolvedValue(access(false));
    cohort.mockResolvedValue({ eligible: false, basis: 'not_in_pilot' });
  });
  afterAll(() => {
    if (prevRestricted === undefined) delete process.env.WRITERS_STUDIO_RESTRICTED_BETA;
    else process.env.WRITERS_STUDIO_RESTRICTED_BETA = prevRestricted;
    if (prevDoor === undefined) delete process.env.WRITERS_STUDIO_BETA_SINGLE_DOOR;
    else process.env.WRITERS_STUDIO_BETA_SINGLE_DOOR = prevDoor;
  });

  it('renders only the public sign-in/bootstrap and no database lookup', async () => {
    expect((await proxy(req('/signin'))).status).toBe(200);
    expect((await proxy(req('/api/members/signin', 'POST'))).status).toBe(200);
    expect((await proxy(req('/favicon.ico'))).status).toBe(200);
    expect(verify).not.toHaveBeenCalled();
    expect(cohort).not.toHaveBeenCalled();
  });

  it('refuses signup and email-code enrollment before any public rule', async () => {
    expect((await proxy(req('/signup'))).status).toBe(404);
    expect((await proxy(req('/api/members/email-code', 'POST'))).status).toBe(404);
    expect(verify).not.toHaveBeenCalled();
  });

  it.each(['/api/open/room', '/api/secret.json', '/api/members/session', '/api/writers-studio/draft'])(
    'returns 401 for anonymous API %s even if the ordinary access matrix is public', async path => {
      expect((await proxy(req(path))).status).toBe(401);
      expect(cohort).not.toHaveBeenCalled();
    },
  );

  it('redirects anonymous /home to the single form', async () => {
    const res = await proxy(req('/home'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/signin?next=%2Fhome');
  });

  it('refuses an authenticated user who is not an admitted writer', async () => {
    verify.mockResolvedValue(access(true, 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'));
    expect((await proxy(req('/api/members/session'))).status).toBe(403);
    expect(cohort).toHaveBeenCalledWith('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa');
  });

  it('admits an exact authenticated cohort member through the real Studio rule', async () => {
    const memberId = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
    verify.mockResolvedValue(access(true, memberId));
    cohort.mockResolvedValue({ eligible: true, basis: 'active_beta_tester' });
    const res = await proxy(req('/writers-studio'));
    expect(res.status).toBe(200);
    expect(cohort).toHaveBeenCalledWith(memberId);
  });

  it('fails closed if cohort authority is unavailable', async () => {
    verify.mockResolvedValue(access(true, 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'));
    cohort.mockRejectedValue(Error('unavailable'));
    const res = await proxy(req('/api/writers-studio/read'));
    expect(res.status).toBe(503);
  });

  it('leaves ordinary Soullab public /home behavior unchanged when flag off', async () => {
    process.env.WRITERS_STUDIO_BETA_SINGLE_DOOR = 'false';
    expect((await proxy(req('/home'))).status).toBe(200);
    expect(verify).not.toHaveBeenCalled();
  });
});
