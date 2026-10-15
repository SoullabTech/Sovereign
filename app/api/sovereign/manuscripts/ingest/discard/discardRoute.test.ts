import { NextRequest } from 'next/server';
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/manuscript/source/discardUnclaimedArrival', () => ({ discardUnclaimedArrival: jest.fn() }));
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { discardUnclaimedArrival } from '@/lib/manuscript/source/discardUnclaimedArrival';
import { POST } from './route';

const member = getMemberIdFromRequest as jest.Mock;
const discard = discardUnclaimedArrival as jest.Mock;
const id = '11111111-1111-4111-8111-111111111111';
const url = 'http://localhost/api/sovereign/manuscripts/ingest/discard';
const request = (body: unknown) => new NextRequest(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
beforeEach(() => { jest.resetAllMocks();member.mockResolvedValue('member-1'); });

it('denies anonymous caller before reading member-owned upload', async () => {
  member.mockResolvedValue(null);
  expect((await POST(request({ sourceArrivalId: id }))).status).toBe(401);
  expect(discard).not.toHaveBeenCalled();
});
it('refuses any client-supplied membership override', async () => {
  expect((await POST(request({ sourceArrivalId: id, memberId: 'other' }))).status).toBe(400);
  expect(discard).not.toHaveBeenCalled();
});
it('refuses wrong and missing UUID shapes', async () => {
  for (const body of [{}, { sourceArrivalId: '' }, { sourceArrivalId: 'not-a-uuid' }, [], null]) {
    expect((await POST(request(body))).status).toBe(400);
  }
  expect(discard).not.toHaveBeenCalled();
});
it('acknowledges exactly one authenticated, unclaimed discard', async () => {
  discard.mockResolvedValue({ kind: 'discarded', bytesDestroyed: true });
  const r = await POST(request({ sourceArrivalId: id }));
  expect(r.status).toBe(200);
  expect((await r.json()).originalBytesDestroyed).toBe(true);
  expect(r.headers.get('Cache-Control')).toBe('no-store');
  expect(discard).toHaveBeenCalledWith(id, 'member-1');
});
it('hides foreign or unknown arrivals, never deleting one', async () => {
  discard.mockResolvedValue({ kind: 'not_found' });
  expect((await POST(request({ sourceArrivalId: id }))).status).toBe(404);
});
it('refuses a claimed source and protects its saved Work', async () => {
  discard.mockResolvedValue({ kind: 'already_claimed' });
  expect((await POST(request({ sourceArrivalId: id }))).status).toBe(409);
});
it('reports outstanding erasure without promising bytes were destroyed', async () => {
  discard.mockResolvedValue({ kind: 'erasure_pending' });
  const r = await POST(request({ sourceArrivalId: id }));
  expect(r.status).toBe(503);
  expect((await r.json()).originalBytesDestroyed).toBe(false);
});
it('fails closed when storage or database is unavailable', async () => {
  discard.mockRejectedValue(new Error('fictional storage unavailable'));
  expect((await POST(request({ sourceArrivalId: id }))).status).toBe(503);
});
