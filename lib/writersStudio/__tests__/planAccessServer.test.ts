import { writerStudioPlanForMember } from '../planAccessServer';
import { readWriterPilotApproval } from '../pilotGrantServer';
import { requireIndependentPilotR20Grant } from '../pilotR20Authority';

jest.mock('../pilotGrantServer', () => ({ readWriterPilotApproval: jest.fn() }));
jest.mock('../pilotR20Authority', () => ({ requireIndependentPilotR20Grant: jest.fn() }));
const candidate = readWriterPilotApproval as jest.Mock;
const r20 = requireIndependentPilotR20Grant as jest.Mock;
const GRANT = '11111111-1111-4111-8111-111111111111';

beforeEach(() => {
  jest.resetAllMocks();
  r20.mockResolvedValue(undefined);
});

test('requires both a real member-owned accepted grant and independent R20 confirmation for complimentary Pro', async () => {
  candidate.mockResolvedValue({ eligible: true, basis: 'founder_approved_beta', grantId: GRANT });
  const result = await writerStudioPlanForMember('fictional-member-1');
  expect(candidate).toHaveBeenCalledWith('fictional-member-1');
  expect(r20).toHaveBeenCalledTimes(1);
  expect(r20).toHaveBeenCalledWith({ memberId: 'fictional-member-1', grantId: GRANT });
  expect(result.plan).toBe('pro');
  expect(result.complimentary).toBe(true);
});

test('unadmitted members remain on informational Free without calling independent authority', async () => {
  candidate.mockResolvedValue({ eligible: false, basis: 'no_founder_approval' });
  const result = await writerStudioPlanForMember('fictional-member-2');
  expect(result.plan).toBe('free');
  expect(result.pilotEligible).toBe(false);
  expect(result.publicEnrollmentEnabled).toBe(false);
  expect(r20).not.toHaveBeenCalled();
});

test('selected founder witness is distinct from a beta seat and does not require a writer-grant witness', async () => {
  candidate.mockResolvedValue({ eligible: true, basis: 'founder_witness' });
  const result = await writerStudioPlanForMember('founder-fictional');
  expect(result.plan).toBe('pro');
  expect(result.basis).toBe('founder_witness');
  expect(r20).not.toHaveBeenCalled();
});

test('an accepted DB row is insufficient when independent R20 authority is unavailable', async () => {
  candidate.mockResolvedValue({ eligible: true, basis: 'founder_approved_beta', grantId: GRANT });
  r20.mockRejectedValue(new Error('pilot_r20_authority_not_provisioned'));
  await expect(writerStudioPlanForMember('fictional-member-1'))
    .rejects.toThrow('pilot_r20_authority_not_provisioned');
});

test('external R20 revocation must take precedence over a restored accepted DB record', async () => {
  candidate.mockResolvedValue({ eligible: true, basis: 'founder_approved_beta', grantId: GRANT });
  r20.mockRejectedValue(new Error('r20_external_revoked'));
  await expect(writerStudioPlanForMember('fictional-member-1'))
    .rejects.toThrow('r20_external_revoked');
});

test('no Pro projection if member-linked database cannot be queried', async () => {
  candidate.mockRejectedValue(new Error('database unavailable'));
  await expect(writerStudioPlanForMember('fictional-member-1')).rejects.toThrow('database unavailable');
  expect(r20).not.toHaveBeenCalled();
});
