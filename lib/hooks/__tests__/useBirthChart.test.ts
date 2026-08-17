/**
 * Birth-data persistence contract.
 *
 * The defect these tests lock down: birth data was treated as saved when it had
 * only reached localStorage. On iOS, ITP deletes script-writable storage after 7
 * days for sites not installed to the home screen, so "saved" data vanished and
 * the member was asked to enter it again.
 *
 * Contract:
 *   1. A write only counts as saved when it reaches the member's account.
 *   2. Legacy browser-local data is promoted to the account ONLY when it can be
 *      proven to belong to the authenticated member.
 */

const mockApiFetch = jest.fn();

jest.mock('@/lib/http/apiBase', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
  apiUrl: (p: string) => p,
}));

import { putBirthDataToServer, ownedLegacyBirthData, type BirthData } from '../useBirthChart';

const VALID: BirthData = {
  date: '1985-03-14',
  time: '09:30',
  location: { name: 'Boulder, CO', lat: 40.015, lng: -105.2705, timezone: 'America/Denver' },
  houseSystem: 'porphyry',
};

const MEMBER = 'a3f1c2d4-5b6e-4a7f-8c9d-0e1f2a3b4c5d';
const OTHER_MEMBER = 'ffffffff-1111-2222-3333-444444444444';

beforeEach(() => {
  mockApiFetch.mockReset();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('putBirthDataToServer — only a server write counts as saved', () => {
  it('reports success when the account write lands', async () => {
    mockApiFetch.mockResolvedValue({ ok: true, status: 200 });

    await expect(putBirthDataToServer(VALID)).resolves.toEqual({ ok: true });
  });

  it('uses PUT — a PATCH returns 405 and silently loses the data', async () => {
    mockApiFetch.mockResolvedValue({ ok: true, status: 200 });

    await putBirthDataToServer(VALID);

    const [url, init] = mockApiFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/members/profile');
    expect(init.method).toBe('PUT');
  });

  it('sends no client-supplied id — the route derives identity from the session', async () => {
    mockApiFetch.mockResolvedValue({ ok: true, status: 200 });

    await putBirthDataToServer(VALID);

    const [, init] = mockApiFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body));
    expect(body).toEqual({
      birthData: { date: VALID.date, time: VALID.time, location: VALID.location },
    });
    expect(body.id).toBeUndefined();
  });

  // The regression: each of these used to return true.
  it('reports failure on 405 (the original PATCH defect)', async () => {
    mockApiFetch.mockResolvedValue({ ok: false, status: 405 });

    const outcome = await putBirthDataToServer(VALID);

    expect(outcome.ok).toBe(false);
    expect(outcome).toMatchObject({ reason: 'rejected' });
  });

  it('reports failure, and names the session, on 401', async () => {
    mockApiFetch.mockResolvedValue({ ok: false, status: 401 });

    const outcome = await putBirthDataToServer(VALID);

    expect(outcome.ok).toBe(false);
    expect(outcome).toMatchObject({ reason: 'no_session' });
    if (!outcome.ok) expect(outcome.message).toMatch(/sign in/i);
  });

  it('reports failure when the database is unavailable (503)', async () => {
    mockApiFetch.mockResolvedValue({ ok: false, status: 503 });

    await expect(putBirthDataToServer(VALID)).resolves.toMatchObject({
      ok: false,
      reason: 'rejected',
    });
  });

  it('reports failure when the server is unreachable', async () => {
    mockApiFetch.mockRejectedValue(new Error('Network request failed'));

    await expect(putBirthDataToServer(VALID)).resolves.toMatchObject({
      ok: false,
      reason: 'unreachable',
    });
  });

  it('never claims durable persistence in a failure message', async () => {
    mockApiFetch.mockResolvedValue({ ok: false, status: 500 });

    const outcome = await putBirthDataToServer(VALID);

    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.message).toMatch(/this device only|not saved/i);
  });
});

describe('ownedLegacyBirthData — promote only what provably belongs to this member', () => {
  it('promotes local data when beta_user.id matches the authenticated member', () => {
    const result = ownedLegacyBirthData(MEMBER, { id: MEMBER, birthData: VALID });

    expect(result).toMatchObject({ date: VALID.date, time: VALID.time });
    expect(result?.location.name).toBe('Boulder, CO');
  });

  // Ownership cannot be proven — these must not migrate.
  it('refuses when the local copy belongs to a different member', () => {
    expect(ownedLegacyBirthData(MEMBER, { id: OTHER_MEMBER, birthData: VALID })).toBeNull();
  });

  it('refuses when the browser has no member binding at all', () => {
    expect(ownedLegacyBirthData(MEMBER, { birthData: VALID })).toBeNull();
    expect(ownedLegacyBirthData(MEMBER, null)).toBeNull();
  });

  it('refuses when the server did not identify the member', () => {
    expect(ownedLegacyBirthData(null, { id: MEMBER, birthData: VALID })).toBeNull();
    expect(ownedLegacyBirthData(undefined, { id: MEMBER, birthData: VALID })).toBeNull();
  });

  it('refuses a non-string id rather than coercing it into a match', () => {
    expect(ownedLegacyBirthData(MEMBER, { id: 12345, birthData: VALID })).toBeNull();
    expect(ownedLegacyBirthData(12345, { id: 12345, birthData: VALID })).toBeNull();
  });

  it('refuses incomplete local data', () => {
    expect(ownedLegacyBirthData(MEMBER, { id: MEMBER, birthData: null })).toBeNull();
    expect(
      ownedLegacyBirthData(MEMBER, { id: MEMBER, birthData: { date: '1985-03-14' } })
    ).toBeNull();
    expect(
      ownedLegacyBirthData(MEMBER, {
        id: MEMBER,
        birthData: { date: '1985-03-14', time: '09:30', location: { name: 'Nowhere' } },
      })
    ).toBeNull();
  });
});
