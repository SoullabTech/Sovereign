import { writerStudioPlanForMember } from '../planAccessServer';
import { writersStudioBetaAccess } from '../betaAccessServer';

jest.mock('../betaAccessServer', () => ({ writersStudioBetaAccess: jest.fn() }));
const betaCheck = writersStudioBetaAccess as jest.Mock;

beforeEach(() => jest.resetAllMocks());

test('requires a server-resolved, member-scoped active pilot before complimentary Pro', async () => {
  betaCheck.mockResolvedValue({ eligible: true, basis: 'active_beta_tester' });
  const result = await writerStudioPlanForMember('fictional-member-1');
  expect(betaCheck).toHaveBeenCalledTimes(1);
  expect(betaCheck).toHaveBeenCalledWith('fictional-member-1');
  expect(result.plan).toBe('pro');
  expect(result.complimentary).toBe(true);
});

test('unadmitted member remains on informational free product plan', async () => {
  betaCheck.mockResolvedValue({ eligible: false, basis: 'not_in_pilot' });
  const result = await writerStudioPlanForMember('fictional-member-2');
  expect(result.plan).toBe('free');
  expect(result.pilotEligible).toBe(false);
  expect(result.publicEnrollmentEnabled).toBe(false);
});

test('does not mint a Pro claim if the pilot authority is down', async () => {
  betaCheck.mockRejectedValue(new Error('no database'));
  await expect(writerStudioPlanForMember('fictional-member-1')).rejects.toThrow('no database');
});
