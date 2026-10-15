jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));

import { query } from '@/lib/db/postgres';
import { approvedBetaConsentPolicy, hasActiveWriterBetaConsent } from '../betaConsentGate';

const member = '11111111-1111-4111-8111-111111111111';
const otherMember = '22222222-2222-4222-8222-222222222222';
const hash = 'a'.repeat(64);
const version = 'pilot-v1';
const queryMock = query as jest.Mock;

beforeEach(() => jest.resetAllMocks());

it('refuses missing, malformed, or unsigned policy references without querying members', () => {
  for (const [v,h] of [
    [undefined,undefined], ['v1',undefined], ['',hash], ['bad value',hash], [version,'*'], [version,'B'.repeat(64)],
  ]) {
    expect(approvedBetaConsentPolicy(v,h)).toBeNull();
  }
  expect(approvedBetaConsentPolicy(version,hash)).toEqual({ policyVersion:version,policySHA256:hash });
});

it('refuses missing policy without discovering the member', async () => {
  expect(await hasActiveWriterBetaConsent(member,null)).toBe(false);
  expect(queryMock).not.toHaveBeenCalled();
});

it('checks the latest ordered consent act across ALL versions', async () => {
  const policy=approvedBetaConsentPolicy(version,hash);
  queryMock.mockResolvedValue({ rows: [{ decision:'accept',policy_version:version,policy_sha256:hash }] });
  expect(await hasActiveWriterBetaConsent(member,policy)).toBe(true);
  expect(queryMock).toHaveBeenCalledWith(expect.stringContaining('ORDER BY seq DESC LIMIT 1'),[member]);
  expect(queryMock).toHaveBeenCalledTimes(1);
});

it('refuses prior policy, revoked decision, empty receipt, or different source hash', async () => {
  const policy=approvedBetaConsentPolicy(version,hash);
  for (const latest of [
    {decision:'revoke',policy_version:version,policy_sha256:hash},
    {decision:'accept',policy_version:'pilot-v0',policy_sha256:hash},
    {decision:'accept',policy_version:version,policy_sha256:'b'.repeat(64)},
    null,
  ]) {
    queryMock.mockResolvedValueOnce({rows:latest?[latest]:[]});
    expect(await hasActiveWriterBetaConsent(member,policy)).toBe(false);
  }
});

it('refuses a malformed member id even when a policy exists', async () => {
  expect(await hasActiveWriterBetaConsent('someone-else',approvedBetaConsentPolicy(version,hash))).toBe(false);
  expect(queryMock).not.toHaveBeenCalled();
});

it('never converts a database error into an implied grant', async () => {
  queryMock.mockRejectedValue(new Error('test-only database unavailable'));
  await expect(hasActiveWriterBetaConsent(otherMember,approvedBetaConsentPolicy(version,hash))).rejects.toThrow('test-only database unavailable');
});
