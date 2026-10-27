import type { NextRequest } from 'next/server';
import { GET } from '../route';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writerStudioPlanForMember } from '@/lib/writersStudio/planAccessServer';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/writersStudio/planAccessServer', () => ({ writerStudioPlanForMember: jest.fn() }));

const member = getMemberIdFromRequest as jest.MockedFunction<typeof getMemberIdFromRequest>;
const plan = writerStudioPlanForMember as jest.MockedFunction<typeof writerStudioPlanForMember>;
const req = {} as NextRequest;

beforeEach(() => jest.resetAllMocks());

test('returns a private, no-store server plan for the authenticated member', async () => {
  member.mockResolvedValue('member-a');
  plan.mockResolvedValue({
    plan: 'pro', basis: 'active_beta_tester', pilotEligible: true,
    complimentary: true, publicEnrollmentEnabled: false, paymentEnabled: false,
    included: {} as never,
  });
  const response = await GET(req);
  expect(response.status).toBe(200);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  await expect(response.json()).resolves.toMatchObject({
    plan: 'pro', pilotEligible: true, complimentary: true,
    heldSeparately: expect.arrayContaining(['new_original_file_ingest']),
  });
});

test('refuses an unauthenticated request', async () => {
  member.mockResolvedValue(null);
  const response = await GET(req);
  expect(response.status).toBe(401);
  expect(plan).not.toHaveBeenCalled();
});

test('fails closed when plan authority is unavailable', async () => {
  member.mockResolvedValue('member-a');
  plan.mockRejectedValue(new Error('database unavailable'));
  const response = await GET(req);
  expect(response.status).toBe(503);
  await expect(response.json()).resolves.toEqual({ error: 'plan_unavailable' });
});
