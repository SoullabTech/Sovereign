/**
 * PRO-STUDIO-01 security candidate: fixture-only settings boundary.
 * No network, production DB, real member, or credential access.
 */
import { NextRequest } from 'next/server';

const mockIdentity = jest.fn<() => Promise<any>>();
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: any[] }>>();

jest.mock('@/lib/auth/getCurrentPractitioner', () => ({
  getCurrentPractitioner: () => mockIdentity(),
}));
jest.mock('@/lib/db/postgres', () => ({
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

import { GET, POST } from '../route';

const alice = { memberId: 'fictional-member-a', practitionerId: 'fictional-practitioner-a' };
const bob = { memberId: 'fictional-member-b', practitionerId: 'fictional-practitioner-b' };

function get(url = 'https://localhost/api/studio/settings?key=video_room_url') {
  return new NextRequest(url);
}
function post(key: string, value: unknown) {
  return new NextRequest('https://localhost/api/studio/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });
}

describe('Pro Studio settings: scoped and secret-free', () => {
  beforeEach(() => {
    mockIdentity.mockReset();
    mockQuery.mockReset();
    mockIdentity.mockResolvedValue(alice);
    mockQuery.mockResolvedValue({ rows: [{ video_room_url: 'https://meet.example/a' }] });
  });

  it('refuses anonymous named reads before querying the database', async () => {
    mockIdentity.mockResolvedValue(null);
    const res = await GET(get());
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('refuses anonymous writes before querying the database', async () => {
    mockIdentity.mockResolvedValue(null);
    const res = await POST(post('video_room_url', 'https://meet.example/a'));
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('refuses named global/secret setting reads without revealing presence', async () => {
    for (const key of ['descript_api_token', 'calendar_disclosure_default', 'some_future_secret']) {
      const res = await GET(get('https://localhost/api/studio/settings?key=' + key));
      expect(res.status).toBe(403);
      expect((await res.json()).error).toBe('Setting unavailable');
    }
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('refuses global setting modification even for a valid practitioner', async () => {
    for (const key of ['descript_api_token', 'calendar_disclosure_default', 'unknown_key']) {
      const res = await POST(post(key, 'fictional-value'));
      expect(res.status).toBe(403);
    }
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('binds named reads to the verified practitioner, not a querystring owner', async () => {
    await GET(get('https://localhost/api/studio/settings?key=video_room_url&practitioner_id=fictional-practitioner-b'));
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('WHERE practitioner_id = $1'),
      [alice.practitionerId],
    );
    expect(mockQuery.mock.calls[0][0]).not.toContain('studio_settings');
  });

  it('keeps practitioner A and practitioner B separated at query parameter boundary', async () => {
    mockIdentity.mockResolvedValueOnce(alice).mockResolvedValueOnce(bob);
    mockQuery.mockResolvedValueOnce({ rows: [{ video_room_url: 'https://meet.example/a' }] })
      .mockResolvedValueOnce({ rows: [{ video_room_url: 'https://meet.example/b' }] });
    const a = await (await GET(get())).json();
    const b = await (await GET(get())).json();
    expect(a.value).toBe('https://meet.example/a');
    expect(b.value).toBe('https://meet.example/b');
    expect(mockQuery.mock.calls.map((call) => call[1])).toEqual([[alice.practitionerId], [bob.practitionerId]]);
  });

  it('returns only scoped, non-secret preferences in the historical list shape', async () => {
    const res = await GET(get('https://localhost/api/studio/settings'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ key: 'video_room_url', value: 'https://meet.example/a' }]);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('upserts only a valid HTTPS link under the authenticated practitioner', async () => {
    const res = await POST(post('video_room_url', 'https://meet.example/a'));
    expect(res.status).toBe(200);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO practitioner_settings (practitioner_id, video_room_url)'),
      [alice.practitionerId, 'https://meet.example/a'],
    );
    expect(mockQuery.mock.calls[0][0]).not.toContain('studio_settings');
  });

  it('clears the current practitioner preference without writing a global key', async () => {
    const res = await POST(post('video_room_url', null));
    expect(res.status).toBe(200);
    expect(mockQuery.mock.calls[0][1]).toEqual([alice.practitionerId, null]);
  });

  it.each([
    ['insecure HTTP URL', 'http://meet.example/a'],
    ['credentialed HTTPS URL', 'https://username:password@meet.example/a'],
    ['script scheme', 'javascript:alert(1)'],
    ['long URL', 'https://example.com/' + 'a'.repeat(2048)],
    ['non-string URL', { hostname: 'meet.example' }],
  ])('rejects %s before database writes', async (_kind, value) => {
    const res = await POST(post('video_room_url', value));
    expect(res.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('rejects malformed bodies', async () => {
    const req = new NextRequest('https://localhost/api/studio/settings', {
      method: 'POST', body: '{bad-json', headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('does not disclose database exception text', async () => {
    mockQuery.mockRejectedValueOnce(new Error('Fictional sensitive backend detail'));
    const res = await GET(get());
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain('Fictional sensitive');
  });
});
