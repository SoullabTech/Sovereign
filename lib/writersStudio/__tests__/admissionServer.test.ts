import { writerStudioAdmissionForMember } from '../admissionServer';
import { writerStudioPlanForMember } from '../planAccessServer';

jest.mock('../planAccessServer', () => ({ writerStudioPlanForMember: jest.fn() }));
const planForMember = writerStudioPlanForMember as jest.MockedFunction<typeof writerStudioPlanForMember>;

beforeEach(() => jest.resetAllMocks());

test('admits only a server-resolved pilot plan', async () => {
  planForMember.mockResolvedValue({
    plan: 'pro', basis: 'active_beta_tester', pilotEligible: true,
    complimentary: true, publicEnrollmentEnabled: false, paymentEnabled: false,
    included: {} as never,
  });
  await expect(writerStudioAdmissionForMember('member-a')).resolves.toMatchObject({
    allowed: true,
    plan: { plan: 'pro', pilotEligible: true },
  });
});

test('returns an invitation refusal for the informational Free plan', async () => {
  planForMember.mockResolvedValue({
    plan: 'free', basis: 'public_not_launched', pilotEligible: false,
    complimentary: false, publicEnrollmentEnabled: false, paymentEnabled: false,
    included: {} as never,
  });
  await expect(writerStudioAdmissionForMember('member-b')).resolves.toMatchObject({
    allowed: false,
    code: 'WRITER_STUDIO_INVITATION_REQUIRED',
  });
});

test('does not convert an authority error into a grant', async () => {
  planForMember.mockRejectedValue(new Error('authority unavailable'));
  await expect(writerStudioAdmissionForMember('member-a'))
    .rejects.toThrow('authority unavailable');
});
