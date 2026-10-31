import { writerStudioPlanForMember } from '../planAccessServer';
import { writersStudioBetaAccess } from '../betaAccessServer';

jest.mock('../betaAccessServer', () => ({ writersStudioBetaAccess: jest.fn() }));
const betaAccess = writersStudioBetaAccess as jest.MockedFunction<typeof writersStudioBetaAccess>;

beforeEach(() => jest.resetAllMocks());

test('projects the existing member-scoped pilot authority into complimentary Pro', async () => {
  betaAccess.mockResolvedValue({ eligible: true, basis: 'active_beta_tester' });
  const decision = await writerStudioPlanForMember('fictional-member-a');
  expect(betaAccess).toHaveBeenCalledWith('fictional-member-a');
  expect(decision).toMatchObject({ plan: 'pro', pilotEligible: true, complimentary: true });
});

test('does not mint a Pro grant for an unadmitted member', async () => {
  betaAccess.mockResolvedValue({ eligible: false, basis: 'not_in_pilot' });
  const decision = await writerStudioPlanForMember('fictional-member-b');
  expect(decision).toMatchObject({
    plan: 'free', pilotEligible: false, publicEnrollmentEnabled: false,
  });
});

test('fails closed when the pilot authority is unavailable', async () => {
  betaAccess.mockRejectedValue(new Error('database unavailable'));
  await expect(writerStudioPlanForMember('fictional-member-a'))
    .rejects.toThrow('database unavailable');
});
