import { NextRequest } from 'next/server';
import { proxy } from '../../../proxy';
import { deriveVerifiedAccess } from '@/lib/auth/verifiedAccess';
import {
  writersStudioBetaAccess, writerStudioBetaPreConsentCandidate,
} from '@/lib/writersStudio/betaAccessServer';
import { memberHasHistoricalBetaConsent } from '@/lib/writersStudio/betaPostWithdrawalCustody';

jest.mock('@/lib/auth/verifiedAccess', () => ({ deriveVerifiedAccess: jest.fn() }));
jest.mock('@/lib/writersStudio/betaAccessServer', () => ({
  writersStudioBetaAccess: jest.fn(),
  writerStudioBetaPreConsentCandidate: jest.fn(),
}));
jest.mock('@/lib/writersStudio/betaPostWithdrawalCustody', () => ({
  memberHasHistoricalBetaConsent: jest.fn(),
}));

const verify = deriveVerifiedAccess as jest.Mock;
const studio = writersStudioBetaAccess as jest.Mock;
const preConsent = writerStudioBetaPreConsentCandidate as jest.Mock;
const custody = memberHasHistoricalBetaConsent as jest.Mock;

const MEMBER = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
const WORK = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
const request = (path: string, method = 'GET') =>
  new NextRequest('https://beta.soullab.life' + path, {
    method, headers: { host: 'beta.soullab.life' },
  });
const signed = (memberId: string | null = MEMBER) => ({
  authenticated: memberId !== null, memberId,
  roles: ['member'], tier: 'free',
  reason: memberId ? null : 'no_credential',
});

const oldEnv = {
  beta: process.env.WRITERS_STUDIO_RESTRICTED_BETA,
  door: process.env.WRITERS_STUDIO_BETA_SINGLE_DOOR,
  custody: process.env.WRITERS_STUDIO_BETA_CUSTODY_SELF_SERVICE_ENABLED,
};

beforeEach(() => {
  process.env.WRITERS_STUDIO_RESTRICTED_BETA = 'true';
  process.env.WRITERS_STUDIO_BETA_SINGLE_DOOR = 'true';
  process.env.WRITERS_STUDIO_BETA_CUSTODY_SELF_SERVICE_ENABLED = 'true';
  jest.resetAllMocks();
  verify.mockResolvedValue(signed());
  studio.mockResolvedValue({ eligible: false, basis: 'not_in_pilot' });
  preConsent.mockResolvedValue(true);
  custody.mockResolvedValue(true);
});

afterAll(() => {
  const restore = (key: string, value: string | undefined) => {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  };
  restore('WRITERS_STUDIO_RESTRICTED_BETA', oldEnv.beta);
  restore('WRITERS_STUDIO_BETA_SINGLE_DOOR', oldEnv.door);
  restore('WRITERS_STUDIO_BETA_CUSTODY_SELF_SERVICE_ENABLED', oldEnv.custody);
});

describe('R8: a former writer retains only authenticated consent and custody corridors', () => {
  it('accepts consent page and endpoint for verified candidate after withdrawal', async () => {
    for (const [path, method] of [
      ['/beta/consent', 'GET'],
      ['/api/beta/consent', 'GET'],
      ['/api/beta/consent', 'POST'],
    ]) {
      const answer = await proxy(request(path, method));
      expect(answer.status).toBe(200);
    }
    expect(preConsent).toHaveBeenCalledWith(MEMBER);
    expect(studio).not.toHaveBeenCalled();
    expect(custody).not.toHaveBeenCalled();
  });

  it('allows historical-consent custody but not reopening the writing room', async () => {
    for (const [path, method] of [
      ['/beta/custody', 'GET'],
      ['/api/beta/custody', 'GET'],
      ['/api/beta/custody/' + WORK, 'GET'],
      ['/api/beta/custody/' + WORK, 'DELETE'],
    ]) {
      expect((await proxy(request(path, method))).status).toBe(200);
    }
    expect(custody).toHaveBeenCalled();
    expect(preConsent).not.toHaveBeenCalled();
    expect(studio).not.toHaveBeenCalled();
    expect((await proxy(request('/api/writers-studio/editorial/turn','POST'))).status).toBe(403);
    expect((await proxy(request('/api/sovereign/manuscripts/'+WORK+'/draft'))).status).toBe(403);
    expect((await proxy(request('/writers-studio'))).status).toBe(307);
  });

  it('rejects anonymous consent and custody before any conditional right check', async () => {
    verify.mockResolvedValue(signed(null));
    expect((await proxy(request('/api/beta/consent'))).status).toBe(401);
    expect((await proxy(request('/api/beta/custody'))).status).toBe(401);
    expect(preConsent).not.toHaveBeenCalled();
    expect(custody).not.toHaveBeenCalled();
  });

  it('rejects a member lacking pre-consent invitation authority', async () => {
    preConsent.mockResolvedValue(false);
    expect((await proxy(request('/api/beta/consent'))).status).toBe(403);
    expect((await proxy(request('/writers-studio'))).status).toBe(307);
  });

  it('rejects custody where historic authenticated ownership/consent is absent', async () => {
    custody.mockResolvedValue(false);
    expect((await proxy(request('/api/beta/custody'))).status).toBe(403);
    expect((await proxy(request('/api/beta/custody/' + WORK, 'DELETE'))).status).toBe(403);
  });

  it('never opens a generic beta prefix or unrecognized custody method/identifier', async () => {
    expect((await proxy(request('/api/beta/private'))).status).toBe(403);
    expect((await proxy(request('/beta/admin'))).status).toBe(307);
    expect((await proxy(request('/api/beta/custody/' + WORK + '/extra'))).status).toBe(403);
    expect((await proxy(request('/api/beta/custody/not-an-id'))).status).toBe(403);
    expect((await proxy(request('/api/beta/custody/' + WORK, 'POST'))).status).toBe(403);
    expect(custody).not.toHaveBeenCalled();
    expect(preConsent).not.toHaveBeenCalled();
  });

  it('fails closed if consent authority or historical custody verification errors', async () => {
    preConsent.mockRejectedValueOnce(new Error('unavailable'));
    expect((await proxy(request('/api/beta/consent'))).status).toBe(503);
    custody.mockRejectedValueOnce(new Error('unavailable'));
    expect((await proxy(request('/api/beta/custody'))).status).toBe(503);
  });

  it('preserves normal product access when beta single-door is switched off', async () => {
    process.env.WRITERS_STUDIO_BETA_SINGLE_DOOR = 'false';
    expect((await proxy(request('/beta/consent'))).status).toBe(200);
    expect(custody).not.toHaveBeenCalled();
    expect(preConsent).not.toHaveBeenCalled();
  });
});
