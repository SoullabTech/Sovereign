/**
 * Notification preference resolution — FAIL-OPEN contract.
 *
 * The send-time gate must never become a single point of message loss. Under any
 * failure (DB unavailable, query timeout, missing table, missing row, malformed
 * row) resolution must fall back to the CODE DEFAULT, never silently suppress.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

// Import after the mock is registered.
import { resolveNotificationPreference } from '@/lib/team/notificationPreferences';

describe('resolveNotificationPreference — fail-open to default', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  // ── Defaults (no explicit override) ────────────────────────────────────────
  it('missing row → default ON for personal/intentional events', async () => {
    mockQuery.mockResolvedValue({ rows: [] });
    expect(await resolveNotificationPreference('m', 'dm_received', 'email')).toBe(true);
    expect(await resolveNotificationPreference('m', 'mentioned', 'email')).toBe(true);
    expect(await resolveNotificationPreference('m', 'thread_reply', 'email')).toBe(true);
  });

  it('missing row → default OFF for ambient channel_activity (opt-in)', async () => {
    mockQuery.mockResolvedValue({ rows: [] });
    expect(await resolveNotificationPreference('m', 'channel_activity', 'email')).toBe(false);
  });

  // ── Explicit overrides are honored ─────────────────────────────────────────
  it('explicit opt-out row is honored', async () => {
    mockQuery.mockResolvedValue({ rows: [{ enabled: false }] });
    expect(await resolveNotificationPreference('m', 'dm_received', 'email')).toBe(false);
  });

  it('explicit opt-in row is honored', async () => {
    mockQuery.mockResolvedValue({ rows: [{ enabled: true }] });
    expect(await resolveNotificationPreference('m', 'channel_activity', 'email')).toBe(true);
  });

  // ── Failure modes (Kelly's review list) → default, NEVER suppress ───────────
  it('DB unavailable (connection refused) → default ON, not suppressed', async () => {
    mockQuery.mockRejectedValue(new Error('ECONNREFUSED'));
    expect(await resolveNotificationPreference('m', 'dm_received', 'email')).toBe(true);
  });

  it('query timeout → default ON, not suppressed', async () => {
    mockQuery.mockRejectedValue(new Error('canceling statement due to statement timeout'));
    expect(await resolveNotificationPreference('m', 'mentioned', 'email')).toBe(true);
  });

  it('missing table (relation does not exist) → default ON', async () => {
    mockQuery.mockRejectedValue(new Error('relation "member_notification_preferences" does not exist'));
    expect(await resolveNotificationPreference('m', 'thread_reply', 'email')).toBe(true);
  });

  it('malformed row (non-boolean enabled) → default, not suppressed', async () => {
    // A row exists but `enabled` is garbage. Naive `return rows[0].enabled` would
    // yield undefined → the gate would read that as "suppress". Must fall through.
    mockQuery.mockResolvedValue({ rows: [{ enabled: null }] });
    expect(await resolveNotificationPreference('m', 'dm_received', 'email')).toBe(true);
    mockQuery.mockResolvedValue({ rows: [{}] });
    expect(await resolveNotificationPreference('m', 'dm_received', 'email')).toBe(true);
  });

  it('ambient malformed row → still default OFF (no accidental opt-in)', async () => {
    mockQuery.mockResolvedValue({ rows: [{ enabled: 'yes' }] });
    expect(await resolveNotificationPreference('m', 'channel_activity', 'email')).toBe(false);
  });
});
