import { writerStudioPlanForMember } from '../planAccessServer';
import { writersStudioStanding } from '../betaAccessServer';

jest.mock('../betaAccessServer', () => ({ writersStudioStanding: jest.fn() }));
const betaAccess = writersStudioStanding as jest.MockedFunction<typeof writersStudioStanding>;

beforeEach(() => jest.resetAllMocks());

test('projects the existing member-scoped pilot authority into complimentary Pro', async () => {
  betaAccess.mockResolvedValue({ admitted: true, plan: 'pro', basis: 'active_beta_tester' });
  const decision = await writerStudioPlanForMember('fictional-member-a');
  expect(betaAccess).toHaveBeenCalledWith('fictional-member-a');
  expect(decision).toMatchObject({ plan: 'pro', pilotEligible: true, complimentary: true });
});

test('does not mint a Pro grant for an unadmitted member', async () => {
  betaAccess.mockResolvedValue({ admitted: false, plan: null, basis: 'not_in_pilot' });
  const decision = await writerStudioPlanForMember('fictional-member-b');
  expect(decision).toMatchObject({
    plan: 'free', pilotEligible: false, publicEnrollmentEnabled: false,
  });
});

test('⭐ an ended grant projects to an admitted Free plan, never Pro (design #2263)', async () => {
  betaAccess.mockResolvedValue({ admitted: true, plan: 'free', basis: 'grant_revoked', endedAt: '2027-01-01T00:00:00.000Z' });
  const decision = await writerStudioPlanForMember('fictional-member-c');
  expect(decision).toMatchObject({
    plan: 'free', basis: 'grant_revoked', admitted: true, pilotEligible: false, complimentary: false,
    endedAt: '2027-01-01T00:00:00.000Z',
  });
  expect(decision.included.advanced_review).toBe(false);
  expect(decision.included.multiple_active_works).toBe(true);
});

test('fails closed when the pilot authority is unavailable', async () => {
  betaAccess.mockRejectedValue(new Error('database unavailable'));
  await expect(writerStudioPlanForMember('fictional-member-a'))
    .rejects.toThrow('database unavailable');
});
