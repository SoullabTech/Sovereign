import { NextRequest } from 'next/server';
import { proxy } from '../proxy';
import { deriveVerifiedAccess } from '../lib/auth/verifiedAccess';
import { writerStudioAdmissionForMember } from '../lib/writersStudio/admissionServer';

jest.mock('../lib/auth/verifiedAccess', () => ({
  deriveVerifiedAccess: jest.fn(),
}));
jest.mock('../lib/writersStudio/admissionServer', () => ({
  writerStudioAdmissionForMember: jest.fn(),
}));

const verified = deriveVerifiedAccess as jest.MockedFunction<typeof deriveVerifiedAccess>;
const admission = writerStudioAdmissionForMember as jest.MockedFunction<
  typeof writerStudioAdmissionForMember
>;

function request(pathname: string): NextRequest {
  return new NextRequest(`https://soullab.life${pathname}`, {
    headers: { 'x-session-token': 'fictional-session-token' },
  });
}

beforeEach(() => {
  jest.resetAllMocks();
  verified.mockResolvedValue({
    authenticated: true,
    memberId: '11111111-1111-4111-8111-111111111111',
    tier: 'free',
    roles: ['member'],
  });
});

test('an admitted pilot proceeds through the real Writer API boundary', async () => {
  admission.mockResolvedValue({
    allowed: true,
    plan: {
      plan: 'pro', basis: 'active_beta_tester', pilotEligible: true,
      complimentary: true, publicEnrollmentEnabled: false, paymentEnabled: false,
      included: {} as never,
    },
  });
  const response = await proxy(request('/api/writers-studio/focus'));
  expect(response.status).toBe(200);
  expect(response.headers.get('x-middleware-next')).toBe('1');
  expect(admission).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111');
});

test('an authenticated but excluded member receives a private 403 without identity leakage', async () => {
  admission.mockResolvedValue({
    allowed: false,
    code: 'WRITER_STUDIO_INVITATION_REQUIRED',
    plan: {
      plan: 'free', basis: 'public_not_launched', pilotEligible: false,
      complimentary: false, publicEnrollmentEnabled: false, paymentEnabled: false,
      included: {} as never,
    },
  });
  const response = await proxy(request('/api/writers-studio/focus'));
  expect(response.status).toBe(403);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  const body = await response.json();
  expect(body).toMatchObject({ code: 'WRITER_STUDIO_INVITATION_REQUIRED' });
  expect(JSON.stringify(body)).not.toContain('11111111-1111-4111-8111-111111111111');
});

test('an excluded member is redirected from the Studio page to its public threshold', async () => {
  admission.mockResolvedValue({
    allowed: false,
    code: 'WRITER_STUDIO_INVITATION_REQUIRED',
    plan: {
      plan: 'free', basis: 'public_not_launched', pilotEligible: false,
      complimentary: false, publicEnrollmentEnabled: false, paymentEnabled: false,
      included: {} as never,
    },
  });
  const response = await proxy(request('/writers-studio'));
  expect(response.status).toBe(307);
  const location = new URL(response.headers.get('location')!);
  expect(location.pathname).toBe('/explore/writers-studio');
  expect(location.searchParams.get('access')).toBe('invitation-required');
});

test('an unavailable roster authority returns 503 rather than an optimistic grant', async () => {
  admission.mockRejectedValue(new Error('database unavailable'));
  const response = await proxy(request('/api/writers-studio/editorial/turn'));
  expect(response.status).toBe(503);
  await expect(response.json()).resolves.toMatchObject({
    code: 'WRITER_STUDIO_ADMISSION_UNAVAILABLE',
  });
});

test('an unauthenticated Writer API request is refused before cohort lookup', async () => {
  verified.mockResolvedValue({
    authenticated: false,
    memberId: null,
    tier: 'free',
    roles: [],
    reason: 'no_credential',
  });
  const response = await proxy(request('/api/writers-studio/focus'));
  expect(response.status).toBe(401);
  expect(admission).not.toHaveBeenCalled();
});

test('plan introspection remains available to any authenticated member', async () => {
  const response = await proxy(request('/api/sovereign/writers-studio/plan'));
  expect(response.status).toBe(200);
  expect(response.headers.get('x-middleware-next')).toBe('1');
  expect(admission).not.toHaveBeenCalled();
});

test('shared Press manuscript operations are not silently reclassified as Writer-only', async () => {
  const response = await proxy(request('/api/sovereign/manuscripts/m1/draft'));
  expect(response.status).toBe(200);
  expect(response.headers.get('x-middleware-next')).toBe('1');
  expect(admission).not.toHaveBeenCalled();
});
