/**
 * Focused tests for the unified trust middleware.
 *
 * Tests the checkAccess orchestration seam with mocked dependencies.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies — both relative and @/ paths to cover source + test imports
vi.mock('../../lib/trust/service', () => ({
  getSessionPrivacy: vi.fn(),
}));

vi.mock('../../lib/trust/isAiPermittedAdapter', () => ({
  resolveAiPermission: vi.fn(),
}));

vi.mock('../../lib/practitioner/auth', () => ({
  verifySessionAccess: vi.fn(),
  verifyContainerAccess: vi.fn(),
}));

// Also mock the @/ aliased paths (used by source files at runtime)
vi.mock('@/lib/trust/service', async () => await vi.importActual('../../lib/trust/service'));
vi.mock('@/lib/practitioner/auth', async () => await vi.importActual('../../lib/practitioner/auth'));

import { checkAccess } from '../../lib/trust/checkAccess';
import { getSessionPrivacy } from '../../lib/trust/service';
import { resolveAiPermission } from '../../lib/trust/isAiPermittedAdapter';
import { verifySessionAccess } from '../../lib/practitioner/auth';

const mockGetSessionPrivacy = vi.mocked(getSessionPrivacy);
const mockResolveAiPermission = vi.mocked(resolveAiPermission);
const mockVerifySessionAccess = vi.mocked(verifySessionAccess);

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSessionPrivacy.mockResolvedValue(null);
  mockResolveAiPermission.mockResolvedValue({ permitted: true });
  mockVerifySessionAccess.mockResolvedValue(true);
});

describe('checkAccess', () => {
  it('denies when no actorId provided', async () => {
    const result = await checkAccess({
      actorId: '',
      resourceType: 'session',
      action: 'read',
      channel: 'oracle',
    });

    expect(result.allowed).toBe(false);
    expect(result.reasonCode).toBe('no_actor');
  });

  it('allows basic read with valid actor', async () => {
    const result = await checkAccess({
      actorId: 'member-123',
      resourceType: 'session',
      action: 'read',
      channel: 'oracle',
    });

    expect(result.allowed).toBe(true);
    expect(result.reasonCode).toBe('permitted');
    expect(result.trustCheckedAt).toBeTruthy();
  });

  it('checks AI permission when useAI is true', async () => {
    mockResolveAiPermission.mockResolvedValue({ permitted: false, reason: 'memory_contract_never_use_for_ai' });

    const result = await checkAccess({
      actorId: 'member-123',
      resourceType: 'session',
      action: 'generate',
      channel: 'oracle',
      useAI: true,
    });

    expect(result.allowed).toBe(true); // allowed but AI degraded
    expect(result.aiPermitted).toBe(false);
    expect(result.aiDenialReason).toBe('memory_contract_never_use_for_ai');
  });

  it('checks AI permission for meaning-expanding actions even without useAI', async () => {
    mockResolveAiPermission.mockResolvedValue({ permitted: false, reason: 'session_ai_disabled' });

    const result = await checkAccess({
      actorId: 'member-123',
      resourceType: 'session',
      action: 'generate', // meaning-expanding
      channel: 'studio',
      useAI: false,
    });

    expect(result.aiPermitted).toBe(false);
    expect(result.meaningExpansion).toBe(true);
  });

  it('denies when relationship check fails for practitioner', async () => {
    mockVerifySessionAccess.mockResolvedValue(false);

    const result = await checkAccess({
      actorId: 'practitioner-456',
      memberId: 'member-123',
      resourceType: 'session',
      action: 'read',
      channel: 'studio',
      relationshipContext: { sessionId: 'session-789' },
    });

    expect(result.allowed).toBe(false);
    expect(result.reasonCode).toBe('no_relationship');
  });

  it('allows member to access own session even if verifySessionAccess fails', async () => {
    mockVerifySessionAccess.mockResolvedValue(false);

    const result = await checkAccess({
      actorId: 'member-123',
      memberId: 'member-123', // same as actorId
      resourceType: 'session',
      action: 'read',
      channel: 'oracle',
      relationshipContext: { sessionId: 'session-789' },
    });

    expect(result.allowed).toBe(true);
  });

  it('denies when requested scope exceeds privacy envelope', async () => {
    mockGetSessionPrivacy.mockResolvedValue({
      privacyMode: 'sensitive',
      consentLevel: 'verbal',
      visibilityScope: 'member_only',
      allowAiDistillation: false,
      allowExport: false,
    });

    const result = await checkAccess({
      actorId: 'member-123',
      resourceType: 'session',
      resourceId: 'session-789',
      action: 'share',
      channel: 'studio',
      requestedScope: 'care_team',
    });

    expect(result.allowed).toBe(false);
    expect(result.reasonCode).toBe('scope_exceeds_envelope');
    expect(result.allowedScope).toBe('member_only');
  });

  it('requires disclosure for meaning-expanding actions with AI', async () => {
    const result = await checkAccess({
      actorId: 'member-123',
      resourceType: 'session',
      action: 'generate',
      channel: 'studio',
      useAI: true,
      relationshipContext: { sessionId: 'session-789' },
    });

    expect(result.meaningExpansion).toBe(true);
    expect(result.disclosureRequired).toBe(true);
    expect(result.disclosureText).toContain('AI assistance');
  });

  it('does not require disclosure for read actions', async () => {
    const result = await checkAccess({
      actorId: 'member-123',
      resourceType: 'session',
      action: 'read',
      channel: 'oracle',
    });

    expect(result.disclosureRequired).toBeFalsy();
    expect(result.meaningExpansion).toBe(false);
  });
});
