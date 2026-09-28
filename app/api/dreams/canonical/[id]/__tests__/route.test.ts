import { NextRequest } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { GET } from '../route';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));

const q = query as jest.Mock;
const member = getMemberIdFromRequest as jest.Mock;

function req() {
  return new NextRequest('http://localhost:3597/api/dreams/canonical/dream-1');
}

beforeEach(() => {
  jest.resetAllMocks();
  member.mockResolvedValue('842acb0f-43e0-47ae-bcee-21e8b3a058de');
});

describe('canonical Dream read', () => {
  test('fails closed without an authenticated member', async () => {
    member.mockResolvedValue(null);
    const response = await GET(req(), { params: Promise.resolve({ id: 'dream-1' }) });
    expect(response.status).toBe(401);
    expect(q).not.toHaveBeenCalled();
  });

  test('resolves legacy owner aliases then reads only an owned Dream row', async () => {
    q.mockResolvedValueOnce({ rows: [{ username: 'kelly' }] });
    q.mockResolvedValueOnce({
      rows: [{
        id: 'dream-1',
        user_id: 'kelly',
        entry_type: 'dream',
        content: 'A remembered dream',
        source: 'journal_room',
        meta: null,
        created_at: '2026-09-27T10:00:00.000Z',
        audio_path: null,
        audio_mime: null,
        audio_duration_ms: null,
        transcript_source: null,
        transcript_confidence: null,
      }],
    });

    const response = await GET(req(), { params: Promise.resolve({ id: 'dream-1' }) });
    expect(response.status).toBe(200);

    const [sql, params] = q.mock.calls[1];
    expect(sql).toContain("entry_type = 'dream'");
    expect(sql).toContain('user_id IN');
    expect(params).toEqual([
      'dream-1',
      '842acb0f-43e0-47ae-bcee-21e8b3a058de',
      'kelly',
      'kelly-nezat',
    ]);

    const body = await response.json();
    expect(body.dream.id).toBe('dream-1');
    expect(body.dream.content).toBe('A remembered dream');
  });

  test('does not reveal whether an absent id is foreign', async () => {
    q.mockResolvedValueOnce({ rows: [{ username: 'kelly' }] });
    q.mockResolvedValueOnce({ rows: [] });

    const response = await GET(req(), { params: Promise.resolve({ id: 'foreign' }) });
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ success: false, error: 'Dream not found' });
  });
});
