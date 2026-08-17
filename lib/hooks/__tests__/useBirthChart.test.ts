/**
 * @jest-environment jsdom
 *
 * useBirthChart — save contract and legacy-migration guard.
 *
 * These cover the rules the astrology/iOS persistence repair exists to enforce:
 *
 *   - persistence is ESTABLISHED by a 2xx and by nothing else;
 *   - no client-supplied identity is ever sent (the server resolves the member
 *     from the verified session credential);
 *   - a legacy local->profile promotion is attempted at most once per member
 *     per session, and the guard still bounds attempts when sessionStorage
 *     is unavailable.
 */

import { __internal, isBirthDataComplete, type BirthData } from '../useBirthChart';

jest.mock('@/lib/http/apiBase', () => ({
  apiFetch: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { apiFetch } = require('@/lib/http/apiBase') as { apiFetch: jest.Mock };

const {
  putBirthData,
  migrationAttemptedThisSession,
  markMigrationAttempted,
  clearMigrationGuard,
} = __internal;

const MEMBER = '3f1c8a6e-9b2d-4c7a-8e5f-1d0b6a4c9e22';
const OTHER_MEMBER = '7a2e4d19-3c5b-4f8a-9d1e-2b6c8f0a3d55';

const BIRTH: BirthData = {
  date: '1988-03-14',
  time: '09:25',
  location: { name: 'Baton Rouge, LA', lat: 30.4515, lng: -91.1871, timezone: 'America/Chicago' },
  houseSystem: 'porphyry',
};

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
  clearMigrationGuard(MEMBER);
  clearMigrationGuard(OTHER_MEMBER);
});

describe('putBirthData — persistence is established only by a 2xx', () => {
  it('returns true on a 2xx', async () => {
    apiFetch.mockResolvedValue({ ok: true, status: 200 });
    await expect(putBirthData(BIRTH)).resolves.toBe(true);
  });

  it('returns false on a non-2xx rather than reporting a save', async () => {
    apiFetch.mockResolvedValue({ ok: false, status: 401 });
    await expect(putBirthData(BIRTH)).resolves.toBe(false);
  });

  it('returns false when the schema is stale (503), not a silent success', async () => {
    apiFetch.mockResolvedValue({ ok: false, status: 503 });
    await expect(putBirthData(BIRTH)).resolves.toBe(false);
  });

  it('returns false on a transport failure', async () => {
    apiFetch.mockRejectedValue(new Error('Network request failed'));
    await expect(putBirthData(BIRTH)).resolves.toBe(false);
  });
});

describe('putBirthData — identity is never client-supplied', () => {
  it('PUTs to the bare profile path with no id query', async () => {
    apiFetch.mockResolvedValue({ ok: true, status: 200 });
    await putBirthData(BIRTH);

    const [path, options] = apiFetch.mock.calls[0];
    expect(path).toBe('/api/members/profile');
    expect(path).not.toContain('?id=');
    expect(options.method).toBe('PUT');
  });

  it('omits any id from the request body', async () => {
    apiFetch.mockResolvedValue({ ok: true, status: 200 });
    await putBirthData(BIRTH);

    const body = JSON.parse(apiFetch.mock.calls[0][1].body);
    expect(body).not.toHaveProperty('id');
    expect(body).not.toHaveProperty('memberId');
    expect(body.birthData).toMatchObject({ date: BIRTH.date, time: BIRTH.time });
  });

  it('sends birthData: null to clear', async () => {
    apiFetch.mockResolvedValue({ ok: true, status: 200 });
    await putBirthData(null);

    expect(JSON.parse(apiFetch.mock.calls[0][1].body)).toEqual({ birthData: null });
  });
});

describe('legacy migration guard — one automatic attempt per member per session', () => {
  it('reports not-yet-attempted before any attempt', () => {
    expect(migrationAttemptedThisSession(MEMBER)).toBe(false);
  });

  it('reports attempted once marked', () => {
    markMigrationAttempted(MEMBER);
    expect(migrationAttemptedThisSession(MEMBER)).toBe(true);
  });

  it('is scoped per member — one member\'s attempt does not block another', () => {
    markMigrationAttempted(MEMBER);
    expect(migrationAttemptedThisSession(OTHER_MEMBER)).toBe(false);
  });

  it('an explicit retry clears the guard', () => {
    markMigrationAttempted(MEMBER);
    clearMigrationGuard(MEMBER);
    expect(migrationAttemptedThisSession(MEMBER)).toBe(false);
  });

  it('is not permanent — a fresh session starts unguarded', () => {
    markMigrationAttempted(MEMBER);
    // Simulate a new app session: sessionStorage is gone, and so is the
    // in-memory guard that lives with the page.
    sessionStorage.clear();
    clearMigrationGuard(MEMBER);
    expect(migrationAttemptedThisSession(MEMBER)).toBe(false);
  });

  it('still bounds attempts when sessionStorage throws', () => {
    const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('sessionStorage unavailable');
    });
    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('sessionStorage unavailable');
    });

    try {
      expect(migrationAttemptedThisSession(MEMBER)).toBe(false);
      markMigrationAttempted(MEMBER);
      // Without the in-memory fallback this returns false and load() would
      // re-attempt the promotion PUT on every storage/update event.
      expect(migrationAttemptedThisSession(MEMBER)).toBe(true);
    } finally {
      getItem.mockRestore();
      setItem.mockRestore();
    }
  });
});

describe('isBirthDataComplete', () => {
  it('accepts complete data', () => {
    expect(isBirthDataComplete(BIRTH)).toBe(true);
  });

  it('rejects null', () => {
    expect(isBirthDataComplete(null)).toBe(false);
  });

  it('rejects data missing a usable location', () => {
    expect(
      isBirthDataComplete({
        ...BIRTH,
        location: { name: '', lat: 0, lng: 0, timezone: 'UTC' },
      })
    ).toBe(false);
  });
});
