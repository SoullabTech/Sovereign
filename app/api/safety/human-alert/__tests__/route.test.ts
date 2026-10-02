import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockRequireMemberId = jest.fn();
const mockDeliver = jest.fn();

jest.mock('@/lib/auth/session', () => ({
  requireMemberId: () => mockRequireMemberId(),
}));

jest.mock('@/lib/safety/humanSafetyAlert.server', () => ({
  deliverHumanSafetyAlert: (...args: unknown[]) => mockDeliver(...args),
}));

import { POST } from '../route';

function request(body: unknown): any {
  return new Request('https://soullab.ai/api/safety/human-alert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/safety/human-alert', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires member authentication', async () => {
    mockRequireMemberId.mockRejectedValueOnce(new Error('AUTH_REQUIRED'));

    const response = await POST(request({
      source: 'teen_crisis',
      severity: 'crisis',
    }));

    expect(response.status).toBe(401);
    expect(mockDeliver).not.toHaveBeenCalled();
  });

  it('returns 503 when no human channel accepts the alert', async () => {
    mockRequireMemberId.mockResolvedValueOnce('member-1');
    mockDeliver.mockResolvedValueOnce({
      delivered: false,
      sms: 'not_configured',
      slack: 'failed',
      errors: ['Slack HTTP 500'],
    });

    const response = await POST(request({
      source: 'teen_crisis',
      severity: 'crisis',
      crisisType: 'critical_risk',
      sessionId: 'session-1',
      age: 16,
    }));

    expect(response.status).toBe(503);
    expect(mockDeliver).toHaveBeenCalledWith(expect.objectContaining({
      memberId: 'member-1',
      source: 'teen_crisis',
      severity: 'crisis',
    }));
  });

  it('returns success only after a human channel accepts the alert', async () => {
    mockRequireMemberId.mockResolvedValueOnce('member-2');
    mockDeliver.mockResolvedValueOnce({
      delivered: true,
      sms: 'sent',
      slack: 'not_configured',
      errors: [],
    });

    const response = await POST(request({
      source: 'maia_crisis',
      severity: 'crisis',
    }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      delivered: true,
      channels: { sms: 'sent', slack: 'not_configured' },
    });
  });

  it('rejects fields that could carry raw message content', async () => {
    mockRequireMemberId.mockResolvedValueOnce('member-3');

    const response = await POST(request({
      source: 'teen_crisis',
      severity: 'crisis',
      message: 'private body',
    }));

    expect(response.status).toBe(400);
    expect(mockDeliver).not.toHaveBeenCalled();
  });
});
