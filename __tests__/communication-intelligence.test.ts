/**
 * Communication Intelligence — Scheduling Disclosure Tests
 *
 * Verifies that calendar event details are filtered based on
 * exposure_level and display_title_mode settings on rl_sessions.
 *
 * The disclosure function is the interpretation layer between
 * session reality and external calendar output.
 *
 * Run: npx jest __tests__/communication-intelligence.test.ts
 */

import type { CalendarDisclosure, CalendarDisclosureInput } from '../lib/trust/types';

// ── Mock the database layer ────────────────────────────────────

let mockQueryResult: { rows: any[] } = { rows: [] };

jest.mock('../lib/db/postgres', () => ({
  query: jest.fn(async () => mockQueryResult),
  queryOne: jest.fn(async () => mockQueryResult.rows[0] ?? null),
  insertOne: jest.fn(async () => mockQueryResult.rows[0] ?? null),
}));

import { getCalendarDisclosure } from '../lib/trust/service';

// ── Test data ──────────────────────────────────────────────────

const SAMPLE_SESSION: CalendarDisclosureInput = {
  clientName: 'Jordan Rivera',
  serviceName: 'Individual Therapy',
  locationType: 'video',
  locationDetails: 'https://meet.soullab.life/session-123',
  notes: 'Follow up on last week\'s dream work',
};

function setSessionRow(overrides: {
  privacy_mode?: string;
  exposure_level?: string;
  display_title_mode?: string;
} = {}) {
  mockQueryResult = {
    rows: [{
      privacy_mode: overrides.privacy_mode ?? 'standard',
      exposure_level: overrides.exposure_level ?? 'session_type',
      display_title_mode: overrides.display_title_mode ?? 'generic',
    }],
  };
}

function setNoSession() {
  mockQueryResult = { rows: [] };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockQueryResult = { rows: [] };
});

// ================================================================
// Exposure Level: free_busy_only
// ================================================================

describe('Disclosure — free_busy_only', () => {
  it('returns "Busy" with no details', async () => {
    setSessionRow({ exposure_level: 'free_busy_only' });
    const result = await getCalendarDisclosure('session-1', SAMPLE_SESSION);

    expect(result.title).toBe('Busy');
    expect(result.description).toBeNull();
    expect(result.locationType).toBeNull();
    expect(result.locationDetails).toBeNull();
    expect(result.visible).toBe(true);
  });

  it('does not leak client name', async () => {
    setSessionRow({ exposure_level: 'free_busy_only' });
    const result = await getCalendarDisclosure('session-2', SAMPLE_SESSION);

    expect(result.title).not.toContain('Jordan');
    expect(result.title).not.toContain('Rivera');
    expect(JSON.stringify(result)).not.toContain('Jordan');
  });

  it('does not leak notes', async () => {
    setSessionRow({ exposure_level: 'free_busy_only' });
    const result = await getCalendarDisclosure('session-3', SAMPLE_SESSION);

    expect(JSON.stringify(result)).not.toContain('dream work');
    expect(JSON.stringify(result)).not.toContain('Follow up');
  });
});

// ================================================================
// Exposure Level: session_type
// ================================================================

describe('Disclosure — session_type', () => {
  it('shows service type but no client name or notes', async () => {
    setSessionRow({ exposure_level: 'session_type', display_title_mode: 'generic' });
    const result = await getCalendarDisclosure('session-4', SAMPLE_SESSION);

    expect(result.title).toBe('Session');
    expect(result.description).toContain('Individual Therapy');
    expect(result.description).not.toContain('Jordan');
    expect(result.description).not.toContain('dream work');
    expect(result.locationDetails).toBeNull(); // No specific location at this level
  });

  it('respects display_title_mode: hidden', async () => {
    setSessionRow({ exposure_level: 'session_type', display_title_mode: 'hidden' });
    const result = await getCalendarDisclosure('session-5', SAMPLE_SESSION);

    expect(result.title).toBeNull();
  });

  it('respects display_title_mode: full', async () => {
    setSessionRow({ exposure_level: 'session_type', display_title_mode: 'full' });
    const result = await getCalendarDisclosure('session-6', SAMPLE_SESSION);

    expect(result.title).toContain('Individual Therapy');
    expect(result.title).toContain('Jordan Rivera');
  });
});

// ================================================================
// Exposure Level: full_details
// ================================================================

describe('Disclosure — full_details', () => {
  it('includes client name, notes, and location', async () => {
    setSessionRow({ exposure_level: 'full_details', display_title_mode: 'full' });
    const result = await getCalendarDisclosure('session-7', SAMPLE_SESSION);

    expect(result.title).toContain('Jordan Rivera');
    expect(result.description).toContain('Jordan Rivera');
    expect(result.description).toContain('dream work');
    expect(result.locationDetails).toBe('https://meet.soullab.life/session-123');
  });

  it('includes location type', async () => {
    setSessionRow({ exposure_level: 'full_details', display_title_mode: 'generic' });
    const result = await getCalendarDisclosure('session-8', SAMPLE_SESSION);

    expect(result.locationType).toBe('video');
  });
});

// ================================================================
// Confidential Override
// ================================================================

describe('Disclosure — confidential privacy_mode', () => {
  it('forces free_busy_only regardless of exposure_level', async () => {
    setSessionRow({
      privacy_mode: 'confidential',
      exposure_level: 'full_details',
      display_title_mode: 'full',
    });
    const result = await getCalendarDisclosure('session-9', SAMPLE_SESSION);

    expect(result.title).toBe('Busy');
    expect(result.description).toBeNull();
    expect(result.locationDetails).toBeNull();
    expect(JSON.stringify(result)).not.toContain('Jordan');
    expect(JSON.stringify(result)).not.toContain('dream work');
  });

  it('confidential overrides even session_type', async () => {
    setSessionRow({
      privacy_mode: 'confidential',
      exposure_level: 'session_type',
    });
    const result = await getCalendarDisclosure('session-10', SAMPLE_SESSION);

    expect(result.title).toBe('Busy');
  });
});

// ================================================================
// Default Behavior (no rl_session row)
// ================================================================

describe('Disclosure — default (no rl_session)', () => {
  it('defaults to session_type with generic title', async () => {
    setNoSession();
    const result = await getCalendarDisclosure('missing-session', SAMPLE_SESSION);

    expect(result.title).toBe('Session');
    expect(result.description).toContain('Individual Therapy');
    expect(result.description).not.toContain('Jordan');
    expect(result.locationDetails).toBeNull();
  });
});

// ================================================================
// Response Shape Contract
// ================================================================

describe('Disclosure — response shape', () => {
  it('always returns all CalendarDisclosure fields', async () => {
    setSessionRow({ exposure_level: 'free_busy_only' });
    const result = await getCalendarDisclosure('session-shape', SAMPLE_SESSION);

    expect(result).toHaveProperty('visible');
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('description');
    expect(result).toHaveProperty('locationType');
    expect(result).toHaveProperty('locationDetails');
    expect(typeof result.visible).toBe('boolean');
  });

  it('visible is always true (event exists, just filtered)', async () => {
    setSessionRow({ exposure_level: 'free_busy_only' });
    const r1 = await getCalendarDisclosure('s1', SAMPLE_SESSION);
    expect(r1.visible).toBe(true);

    setSessionRow({ exposure_level: 'full_details' });
    const r2 = await getCalendarDisclosure('s2', SAMPLE_SESSION);
    expect(r2.visible).toBe(true);
  });
});
