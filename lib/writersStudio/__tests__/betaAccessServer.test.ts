import { query } from '@/lib/db/postgres';
import {
  explicitlyApprovedWriterMember,
  writerStudioBetaPreConsentCandidate,
  writersStudioBetaAccess,
} from '../betaAccessServer';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));

const writerA = '11111111-1111-4111-8111-111111111111';
const writerB = '22222222-2222-4222-8222-222222222222';
const writerC = '33333333-3333-4333-8333-333333333333';
const queryMock = query as jest.MockedFunction<typeof query>;
const VERSION = 'pilot-v1';
const HASH = 'a'.repeat(64);
function approveConfiguredPolicy() {
  process.env.WRITERS_STUDIO_BETA_CONSENT_VERSION = VERSION;
  process.env.WRITERS_STUDIO_BETA_CONSENT_SHA256 = HASH;
}
function activeReceipt() {
  queryMock.mockResolvedValueOnce({ rows: [{ decision: 'accept', policy_version: VERSION, policy_sha256: HASH }] } as never);
}

function witnessRow(beta: boolean, founder = false) {
  queryMock.mockResolvedValueOnce({
    rows: [{ beta, founder }],
  } as never);
}

describe('Writer’s Studio specific, verified small-group admission', () => {
  const saved = process.env.WRITERS_STUDIO_BETA_MEMBER_IDS;
  const savedVersion = process.env.WRITERS_STUDIO_BETA_CONSENT_VERSION;
  const savedHash = process.env.WRITERS_STUDIO_BETA_CONSENT_SHA256;
  afterEach(() => {
    jest.resetAllMocks();
    if (saved === undefined) delete process.env.WRITERS_STUDIO_BETA_MEMBER_IDS;
    else process.env.WRITERS_STUDIO_BETA_MEMBER_IDS = saved;
    if (savedVersion === undefined) delete process.env.WRITERS_STUDIO_BETA_CONSENT_VERSION;
    else process.env.WRITERS_STUDIO_BETA_CONSENT_VERSION = savedVersion;
    if (savedHash === undefined) delete process.env.WRITERS_STUDIO_BETA_CONSENT_SHA256;
    else process.env.WRITERS_STUDIO_BETA_CONSENT_SHA256 = savedHash;
  });

  it('refuses missing, wildcard, substring, duplicates and malformed member lists', () => {
    expect(explicitlyApprovedWriterMember(writerA, undefined)).toBe(false);
    expect(explicitlyApprovedWriterMember(writerA, '*')).toBe(false);
    expect(explicitlyApprovedWriterMember(writerA, writerA.slice(0, 8))).toBe(false);
    expect(explicitlyApprovedWriterMember(writerA, writerA + ',' + writerA)).toBe(false);
    expect(explicitlyApprovedWriterMember(writerA, writerA + ',*')).toBe(false);
    expect(explicitlyApprovedWriterMember(writerA, writerA + ',')).toBe(false);
    expect(explicitlyApprovedWriterMember('not-a-member-id', writerA)).toBe(false);
  });

  it('matches only an exact member ID in a properly formed protected list', () => {
    expect(explicitlyApprovedWriterMember(writerA, ` ${writerB}, ${writerA.toUpperCase()} `)).toBe(true);
    expect(explicitlyApprovedWriterMember(writerC, `${writerA},${writerB}`)).toBe(false);
    expect(explicitlyApprovedWriterMember(writerA, writerB)).toBe(false);
  });

  it('does not promote a general active beta tester without the separate writer grant', async () => {
    delete process.env.WRITERS_STUDIO_BETA_MEMBER_IDS;
    witnessRow(true);
    expect(await writersStudioBetaAccess(writerA)).toEqual({ eligible: false, basis: 'not_in_pilot' });
    process.env.WRITERS_STUDIO_BETA_MEMBER_IDS = writerB;
    witnessRow(true);
    expect(await writersStudioBetaAccess(writerA)).toEqual({ eligible: false, basis: 'not_in_pilot' });
  });

  it('also refuses an allowlisted account that is not an active registered tester', async () => {
    process.env.WRITERS_STUDIO_BETA_MEMBER_IDS = writerA;
    witnessRow(false);
    expect(await writersStudioBetaAccess(writerA)).toEqual({ eligible: false, basis: 'not_in_pilot' });
  });

  it('admits an exactly allowlisted, active tester using a parameterized member query', async () => {
    process.env.WRITERS_STUDIO_BETA_MEMBER_IDS = `${writerA},${writerB}`;
    approveConfiguredPolicy();
    witnessRow(true);
    activeReceipt();
    expect(await writersStudioBetaAccess(writerA)).toEqual({ eligible: true, basis: 'active_beta_tester' });
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('c.member_id = $1'),
      [writerA],
    );
  });

  it('refuses admitted tester without an approved notice hash and version', async () => {
    process.env.WRITERS_STUDIO_BETA_MEMBER_IDS = writerA;
    delete process.env.WRITERS_STUDIO_BETA_CONSENT_VERSION;
    delete process.env.WRITERS_STUDIO_BETA_CONSENT_SHA256;
    witnessRow(true);
    expect(await writersStudioBetaAccess(writerA)).toEqual({ eligible: false, basis: 'not_in_pilot' });
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  it('refuses when the latest consent event is revocation', async () => {
    process.env.WRITERS_STUDIO_BETA_MEMBER_IDS = writerA;
    approveConfiguredPolicy();
    witnessRow(true);
    queryMock.mockResolvedValueOnce({rows:[{decision:'revoke',policy_version:VERSION,policy_sha256:HASH}]} as never);
    expect(await writersStudioBetaAccess(writerA)).toEqual({eligible:false,basis:'not_in_pilot'});
  });

  it('refuses acceptance of any earlier or differently hashed notice', async () => {
    process.env.WRITERS_STUDIO_BETA_MEMBER_IDS = writerA;
    approveConfiguredPolicy();
    witnessRow(true);
    queryMock.mockResolvedValueOnce({rows:[{decision:'accept',policy_version:'pilot-v0',policy_sha256:HASH}]} as never);
    expect(await writersStudioBetaAccess(writerA)).toEqual({eligible:false,basis:'not_in_pilot'});
    witnessRow(true);
    queryMock.mockResolvedValueOnce({rows:[{decision:'accept',policy_version:VERSION,policy_sha256:'b'.repeat(64)}]} as never);
    expect(await writersStudioBetaAccess(writerA)).toEqual({eligible:false,basis:'not_in_pilot'});
  });

  it('fails closed if the consent ledger cannot be queried', async () => {
    process.env.WRITERS_STUDIO_BETA_MEMBER_IDS = writerA;
    approveConfiguredPolicy();
    witnessRow(true);
    queryMock.mockRejectedValueOnce(new Error('fictional consent database inaccessible'));
    await expect(writersStudioBetaAccess(writerA)).rejects.toThrow('fictional consent database inaccessible');
  });

  it('retains verified founder/CTO witness access without granting beta membership', async () => {
    delete process.env.WRITERS_STUDIO_BETA_MEMBER_IDS;
    witnessRow(false, true);
    expect(await writersStudioBetaAccess(writerC)).toEqual({ eligible: true, basis: 'founder_witness' });
  });

  it('does not convert a database failure into eligibility', async () => {
    process.env.WRITERS_STUDIO_BETA_MEMBER_IDS = writerA;
    queryMock.mockRejectedValueOnce(new Error('synthetic DB unavailable'));
    await expect(writersStudioBetaAccess(writerA)).rejects.toThrow('synthetic DB unavailable');
  });
});

it('pre-consent candidate is separately recognized but never sufficient for full Studio admission', async () => {
  process.env.WRITERS_STUDIO_BETA_MEMBER_IDS = writerA;
  delete process.env.WRITERS_STUDIO_BETA_CONSENT_VERSION;
  delete process.env.WRITERS_STUDIO_BETA_CONSENT_SHA256;
  queryMock.mockResolvedValueOnce({ rows:[{ active_tester:true }] } as never);
  expect(await writerStudioBetaPreConsentCandidate(writerA)).toBe(true);
  expect(queryMock).toHaveBeenCalledWith(expect.stringContaining('c.member_id = $1'),[writerA]);
  witnessRow(true);
  expect(await writersStudioBetaAccess(writerA)).toEqual({eligible:false,basis:'not_in_pilot'});
  delete process.env.WRITERS_STUDIO_BETA_MEMBER_IDS;
});

it('pre-consent candidate rejects non-allowlisted or inactive testers without a session grant', async () => {
  jest.resetAllMocks();
  process.env.WRITERS_STUDIO_BETA_MEMBER_IDS = writerA;
  expect(await writerStudioBetaPreConsentCandidate(writerB)).toBe(false);
  expect(queryMock).not.toHaveBeenCalled();
  queryMock.mockResolvedValueOnce({rows:[{active_tester:false}]} as never);
  expect(await writerStudioBetaPreConsentCandidate(writerA)).toBe(false);
});
