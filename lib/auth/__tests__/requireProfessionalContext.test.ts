import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
const mockAccess = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockPractitioner = jest.fn<(...args: unknown[]) => Promise<any>>();
jest.mock('@/lib/auth/verifiedAccess', () => ({
  deriveVerifiedAccess: (...args: unknown[]) => mockAccess(...args),
}));
jest.mock('@/lib/auth/getCurrentPractitioner', () => ({
  getCurrentPractitioner: (...args: unknown[]) => mockPractitioner(...args),
}));
import { requireProfessionalContext } from '../requireProfessionalContext';

const MEMBER = '11111111-1111-4111-8111-111111111111';
const PRACTICE = '22222222-2222-4222-8222-222222222222';
const FOREIGN = '33333333-3333-4333-8333-333333333333';
const req = new NextRequest('https://soullab.life/api/stellium/dashboard');
const access = (tier = 'pro', roles = ['practitioner']) => ({
  authenticated: true, memberId: MEMBER, tier, roles,
});
const professional = (portalType = 'generalist') => ({
  memberId: MEMBER, practitionerId: PRACTICE, portalType,
});
beforeEach(() => {
  mockAccess.mockReset();
  mockPractitioner.mockReset();
  mockAccess.mockResolvedValue(access());
  mockPractitioner.mockResolvedValue(professional());
});

describe('GANESHA–PRO G1: verified professional context', () => {
  it('accepts the verified professional UUID and not the request claim as authority', async () => {
    const result = await requireProfessionalContext(req, PRACTICE);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.context).toMatchObject({
      memberId: MEMBER, practitionerId: PRACTICE,
    });
  });
  it('refuses a foreign practitioner UUID without reading another resource', async () => {
    const result = await requireProfessionalContext(req, FOREIGN);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(404);
  });
  it('refuses unsigned or expired sessions before looking up practitioner rows', async () => {
    mockAccess.mockResolvedValue({ authenticated: false, memberId: null, tier: 'free', roles: [] });
    const result = await requireProfessionalContext(req, PRACTICE);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(401);
    expect(mockPractitioner).not.toHaveBeenCalled();
  });
  it('refuses personal/steward funding without an explicit professional role', async () => {
    mockAccess.mockResolvedValue(access('personal', ['member']));
    const result = await requireProfessionalContext(req, PRACTICE);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(403);
    expect(mockPractitioner).not.toHaveBeenCalled();
  });
  it('refuses paid pro with no practitioner or admin role', async () => {
    mockAccess.mockResolvedValue(access('pro', ['member']));
    const result = await requireProfessionalContext(req, PRACTICE);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(403);
  });
  it('refuses a Personal Portal compatibility practitioner row despite pro tier', async () => {
    mockPractitioner.mockResolvedValue(professional('personal'));
    const result = await requireProfessionalContext(req, PRACTICE);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(403);
  });
  it('refuses a valid session whose practitioner identity belongs to another member', async () => {
    mockPractitioner.mockResolvedValue({ ...professional(), memberId: FOREIGN });
    const result = await requireProfessionalContext(req, PRACTICE);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(403);
  });
  it('fails closed if active practitioner standing has been revoked', async () => {
    mockPractitioner.mockResolvedValue(null);
    const result = await requireProfessionalContext(req, PRACTICE);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(403);
  });
  it('rejects non-string and forged body IDs with no normalization coercion', async () => {
    const result = await requireProfessionalContext(req, { id: PRACTICE });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(404);
  });
});
