import { writerStudioAdmissionForMember } from '../admissionServer';
import { writerStudioPlanForMember } from '../planAccessServer';

jest.mock('../planAccessServer', () => ({ writerStudioPlanForMember: jest.fn() }));
const planForMember = writerStudioPlanForMember as jest.MockedFunction<typeof writerStudioPlanForMember>;

beforeEach(() => jest.resetAllMocks());

test('admits only a server-resolved pilot plan', async () => {
  planForMember.mockResolvedValue({
    plan: 'pro', basis: 'active_beta_tester', admitted: true, pilotEligible: true,
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
    plan: 'free', basis: 'public_not_launched', admitted: false, pilotEligible: false,
    complimentary: false, publicEnrollmentEnabled: false, paymentEnabled: false,
    included: {} as never,
  });
  await expect(writerStudioAdmissionForMember('member-b')).resolves.toMatchObject({
    allowed: false,
    code: 'WRITER_STUDIO_INVITATION_REQUIRED',
  });
});

test('⭐ admits a Free plan whose grant ended — admission reads `admitted`, not Pro (design #2263)', async () => {
  planForMember.mockResolvedValue({
    plan: 'free', basis: 'grant_lapsed', admitted: true, pilotEligible: false, endedAt: null,
    complimentary: false, publicEnrollmentEnabled: false, paymentEnabled: false,
    included: {} as never,
  });
  await expect(writerStudioAdmissionForMember('member-c')).resolves.toMatchObject({
    allowed: true,
    plan: { plan: 'free', basis: 'grant_lapsed' },
  });
});

test('does not convert an authority error into a grant', async () => {
  planForMember.mockRejectedValue(new Error('authority unavailable'));
  await expect(writerStudioAdmissionForMember('member-a'))
    .rejects.toThrow('authority unavailable');
});
