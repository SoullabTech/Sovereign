/**
 * EXPORT DATA API TESTS
 *
 * Tests for POST /api/members/export-data (GDPR compliance):
 * 1. Returns 401 when unauthenticated (no session)
 * 2. Returns 200 with whitelisted settings when authenticated
 * 3. Settings response contains only camelCase keys, no internal IDs
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

// Mock auth
const mockGetCurrentSession = jest.fn<() => Promise<{ memberId: string } | null>>();
jest.mock('@/lib/auth/serverSessions', () => ({
  getCurrentSession: () => mockGetCurrentSession(),
}));

// Mock database
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

// Import after mocks
import { POST } from '../route';

function createRequest() {
  return new NextRequest('http://localhost/api/members/export-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
}

describe('Export Data API - Auth + Whitelist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentSession.mockReset();
    mockQuery.mockReset();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetCurrentSession.mockResolvedValue(null);

    const response = await POST(createRequest());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({
      error: 'Authentication required. Please sign in to export your data.',
    });
  });

  it('returns 404 when member not found', async () => {
    mockGetCurrentSession.mockResolvedValue({ memberId: 'nonexistent-id' });

    // Mock all 5 queries in Promise.all order
    mockQuery
      .mockResolvedValueOnce({ rows: [] }) // memberResult - empty
      .mockResolvedValueOnce({ rows: [] }) // settingsResult
      .mockResolvedValueOnce({ rows: [] }) // sessionsResult
      .mockResolvedValueOnce({ rows: [] }) // memoriesResult
      .mockResolvedValueOnce({ rows: [] }); // googleResult

    const response = await POST(createRequest());
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Member not found');
  });

  it('returns 200 with whitelisted settings when authenticated', async () => {
    mockGetCurrentSession.mockResolvedValue({
      memberId: 'ce284751-e457-42f6-89b6-bc07d0876682',
    });

    // Mock all 5 queries in Promise.all order
    mockQuery
      // 1. memberResult
      .mockResolvedValueOnce({
        rows: [{
          id: 'ce284751-e457-42f6-89b6-bc07d0876682',
          username: 'testuser',
          name: 'Test User',
        }],
      })
      // 2. settingsResult - includes both whitelisted and non-whitelisted fields
      .mockResolvedValueOnce({
        rows: [{
          // Internal fields that should NOT leak
          id: 'settings-uuid-should-not-leak',
          member_id: 'ce284751-e457-42f6-89b6-bc07d0876682',

          // MAIA settings (should be whitelisted)
          default_memory_mode: 'balanced',
          voice_model: 'shimmer',
          voice_speed: '1.0',
          memory_depth: 'moderate',
          archetype: 'Guide',
          conversation_mode: 'maia',
          preferred_assistant_name: 'MAIA',

          // Notifications (should be nested)
          email_weekly_digest: true,
          email_breakthrough_moments: false,
          email_community_updates: true,
          email_product_updates: false,

          // Privacy (should be nested)
          share_anonymous_insights: true,
          allow_research_participation: false,

          // Membership (should be nested)
          circle_tier: 'supporter',
          circle_amount: 22,
          circle_joined_at: '2026-01-01T00:00:00.000Z',

          // Additional fields
          wisdom_systems: ['astrology', 'psychology'],
          cultural_lens: 'western-esoteric',
          storage_consent: { audioServer: false, conversationsServer: true },
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-02-01T00:00:00.000Z',

          // Hypothetical internal field that should NOT leak
          internal_secret_key: 'should-never-appear',
        }],
      })
      // 3. sessionsResult
      .mockResolvedValueOnce({ rows: [] })
      // 4. memoriesResult
      .mockResolvedValueOnce({ rows: [] })
      // 5. googleResult
      .mockResolvedValueOnce({ rows: [] });

    const response = await POST(createRequest());

    expect(response.status).toBe(200);

    const text = await response.text();
    const data = JSON.parse(text);

    // Basic structure
    expect(data).toHaveProperty('exportedAt');
    expect(data).toHaveProperty('profile');
    expect(data).toHaveProperty('settings');
    expect(data).toHaveProperty('sessions');
    expect(data).toHaveProperty('memories');
    expect(data).toHaveProperty('connectedServices');

    const settings = data.settings;
    expect(settings).toBeTruthy();

    // ✅ Whitelisted keys present with camelCase
    expect(settings.defaultMemoryMode).toBe('balanced');
    expect(settings.voiceModel).toBe('shimmer');
    expect(settings.preferredAssistantName).toBe('MAIA');

    // ✅ Nested structures
    expect(settings.notifications).toEqual({
      weeklyDigest: true,
      breakthroughMoments: false,
      communityUpdates: true,
      productUpdates: false,
    });

    expect(settings.privacy).toEqual({
      shareAnonymousInsights: true,
      allowResearchParticipation: false,
    });

    expect(settings.membership).toEqual({
      tier: 'supporter',
      amount: 22,
      joinedAt: '2026-01-01T00:00:00.000Z',
    });

    // ✅ Additional whitelisted fields
    expect(settings.wisdomSystems).toEqual(['astrology', 'psychology']);
    expect(settings.culturalLens).toBe('western-esoteric');
    expect(settings.storageConsent).toEqual({ audioServer: false, conversationsServer: true });

    // 🚫 Internal/raw DB fields should NOT leak
    expect(settings.id).toBeUndefined();
    expect(settings.member_id).toBeUndefined();
    expect(settings.default_memory_mode).toBeUndefined(); // snake_case raw column
    expect(settings.email_weekly_digest).toBeUndefined(); // snake_case raw column
    expect(settings.internal_secret_key).toBeUndefined();
  });

  it('handles null settings gracefully', async () => {
    mockGetCurrentSession.mockResolvedValue({
      memberId: 'member-with-no-settings',
    });

    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'member-with-no-settings', username: 'new' }] })
      .mockResolvedValueOnce({ rows: [] }) // No settings row
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const response = await POST(createRequest());
    expect(response.status).toBe(200);

    const text = await response.text();
    const data = JSON.parse(text);

    expect(data.settings).toBeNull();
  });
});
