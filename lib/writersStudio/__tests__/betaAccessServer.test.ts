import { query } from '@/lib/db/postgres';
import {
  explicitlyApprovedWriterMember,
  writersStudioBetaAccess,
} from '../betaAccessServer';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));

const writerA = '11111111-1111-4111-8111-111111111111';
const writerB = '22222222-2222-4222-8222-222222222222';
const writerC = '33333333-3333-4333-8333-333333333333';
const queryMock = query as jest.MockedFunction<typeof query>;

function witnessRow(beta: boolean, founder = false) {
  queryMock.mockResolvedValueOnce({
    rows: [{ beta, founder }],
  } as never);
}

describe('Writer’s Studio specific, verified small-group admission', () => {
  const saved = process.env.WRITERS_STUDIO_BETA_MEMBER_IDS;
  afterEach(() => {
    jest.resetAllMocks();
    if (saved === undefined) delete process.env.WRITERS_STUDIO_BETA_MEMBER_IDS;
    else process.env.WRITERS_STUDIO_BETA_MEMBER_IDS = saved;
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
    witnessRow(true);
    expect(await writersStudioBetaAccess(writerA)).toEqual({ eligible: true, basis: 'active_beta_tester' });
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('c.member_id = $1'),
      [writerA],
    );
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
