import { writersStudioBetaAccess } from '../betaAccessServer';
import { writerStudioPlanForMember } from '../planAccessServer';

jest.mock('../planAccessServer', () => ({ writerStudioPlanForMember: jest.fn() }));
const plan = writerStudioPlanForMember as jest.Mock;
beforeEach(() => jest.resetAllMocks());

test('CRM-only/ordinary writer receives no beta admission even when asked for beta=1', async () => {
  plan.mockResolvedValue({
    plan: 'free', basis: 'public_not_launched', pilotEligible: false,
    complimentary: false, paymentEnabled: false,
  });
  expect(await writersStudioBetaAccess('fictional-member-a')).toEqual({
    eligible: false, basis: 'not_in_pilot',
  });
  expect(plan).toHaveBeenCalledWith('fictional-member-a');
});

test('founder-approved and independently R20-verified complimentary Pro may see beta UI', async () => {
  plan.mockResolvedValue({
    plan: 'pro', basis: 'founder_approved_beta', pilotEligible: true,
    complimentary: true, paymentEnabled: false,
  });
  expect(await writersStudioBetaAccess('fictional-member-a')).toEqual({
    eligible: true, basis: 'founder_approved_beta',
  });
});

test('selected founder witness is separate from member beta admission', async () => {
  plan.mockResolvedValue({
    plan: 'pro', basis: 'founder_witness', pilotEligible: true,
    complimentary: true, paymentEnabled: false,
  });
  expect(await writersStudioBetaAccess('fictional-founder')).toEqual({
    eligible: true, basis: 'founder_witness',
  });
});

test('general paid tier, manipulated beta flag or non-complimentary state cannot create beta access', async () => {
  for (const spoof of [
    { plan: 'pro', basis: 'public_not_launched', pilotEligible: true, complimentary: true, paymentEnabled: false },
    { plan: 'pro', basis: 'founder_approved_beta', pilotEligible: false, complimentary: true, paymentEnabled: false },
    { plan: 'pro', basis: 'founder_approved_beta', pilotEligible: true, complimentary: false, paymentEnabled: false },
    { plan: 'pro', basis: 'founder_approved_beta', pilotEligible: true, complimentary: true, paymentEnabled: true },
  ]) {
    plan.mockResolvedValueOnce(spoof);
    expect((await writersStudioBetaAccess('fictional-member')).eligible).toBe(false);
  }
});

test('missing/failed external R20 authority fails CLOSED, never converts to optimistic eligibility', async () => {
  plan.mockRejectedValue(new Error('pilot_r20_authority_not_provisioned'));
  await expect(writersStudioBetaAccess('fictional-member')).rejects.toThrow();
});
