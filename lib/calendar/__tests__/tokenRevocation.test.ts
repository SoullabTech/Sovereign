/**
 * Google Calendar Token Revocation Tests
 *
 * Guards against regression of the infinite refresh loop:
 * - refreshAccessToken() must return TOKEN_REVOKED on invalid_grant
 * - getValidAccessToken() must delete credentials on TOKEN_REVOKED
 * - getValidAccessToken() must NOT delete credentials on network errors
 */

import { refreshAccessToken, getValidAccessToken, TOKEN_REVOKED } from '../GoogleCalendarService';

// ── Mocks ──────────────────────────────────────────────────────────────

const mockQuery = jest.fn();
const mockFindOne = jest.fn();
jest.mock('@/lib/db/postgres', () => ({
  query: (...args: unknown[]) => mockQuery(...args),
  findOne: (...args: unknown[]) => mockFindOne(...args),
  insertOne: jest.fn(),
  updateOne: jest.fn(),
}));

// Provide Google config so getConfig() returns a valid object
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

beforeEach(() => {
  jest.clearAllMocks();
});

// ── refreshAccessToken ─────────────────────────────────────────────────

describe('refreshAccessToken', () => {
  it('returns TOKEN_REVOKED when Google responds with invalid_grant', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => JSON.stringify({
        error: 'invalid_grant',
        error_description: 'Token has been expired or revoked.',
      }),
    });

    const result = await refreshAccessToken('revoked-refresh-token');
    expect(result).toBe(TOKEN_REVOKED);
  });

  it('returns null (not TOKEN_REVOKED) on non-invalid_grant errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => JSON.stringify({
        error: 'temporarily_unavailable',
        error_description: 'Server is temporarily unavailable.',
      }),
    });

    const result = await refreshAccessToken('some-refresh-token');
    expect(result).toBeNull();
  });

  it('returns null (not TOKEN_REVOKED) on network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const result = await refreshAccessToken('some-refresh-token');
    expect(result).toBeNull();
  });

  it('returns tokens on successful refresh', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'new-access-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'calendar',
      }),
    });

    const result = await refreshAccessToken('good-refresh-token');
    expect(result).not.toBeNull();
    expect(result).not.toBe(TOKEN_REVOKED);
    expect((result as { access_token: string }).access_token).toBe('new-access-token');
  });
});

// ── getValidAccessToken ────────────────────────────────────────────────

describe('getValidAccessToken', () => {
  const expiredCreds = {
    id: 'cred-uuid-123',
    user_id: 'user-123',
    access_token: 'old-access-token',
    refresh_token: 'revoked-refresh-token',
    expiry_date: Date.now() - 60_000, // expired 1 minute ago
  };

  it('deletes credentials when token is permanently revoked', async () => {
    mockFindOne.mockResolvedValueOnce(expiredCreds);

    // Google returns invalid_grant
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => JSON.stringify({
        error: 'invalid_grant',
        error_description: 'Token has been expired or revoked.',
      }),
    });

    const token = await getValidAccessToken('user-123');

    expect(token).toBeNull();
    // Must delete the credentials row
    expect(mockQuery).toHaveBeenCalledWith(
      'DELETE FROM google_calendar_credentials WHERE id = $1',
      ['cred-uuid-123']
    );
  });

  it('does NOT delete credentials on transient network failure', async () => {
    mockFindOne.mockResolvedValueOnce(expiredCreds);

    // Network failure (fetch throws)
    mockFetch.mockRejectedValueOnce(new Error('ETIMEDOUT'));

    const token = await getValidAccessToken('user-123');

    expect(token).toBeNull();
    // Must NOT delete — this is a transient error
    expect(mockQuery).not.toHaveBeenCalledWith(
      expect.stringContaining('DELETE'),
      expect.anything()
    );
  });

  it('does NOT delete credentials on non-invalid_grant HTTP errors', async () => {
    mockFindOne.mockResolvedValueOnce(expiredCreds);

    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => JSON.stringify({
        error: 'server_error',
        error_description: 'Internal error.',
      }),
    });

    const token = await getValidAccessToken('user-123');

    expect(token).toBeNull();
    expect(mockQuery).not.toHaveBeenCalledWith(
      expect.stringContaining('DELETE'),
      expect.anything()
    );
  });
});
