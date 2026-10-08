/** @jest-environment node */
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/writers-studio/source-posture/route';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { transitionSourcePersistencePosture, readSourcePersistencePosture } from '../sessionPersistenceLease';
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('../sessionPersistenceLease', () => ({
  transitionSourcePersistencePosture: jest.fn(), readSourcePersistencePosture: jest.fn(),
  PersistenceRefused: class PersistenceRefused extends Error {},
}));
const member = getMemberIdFromRequest as jest.Mock;
const transition = transitionSourcePersistencePosture as jest.Mock;
const read = readSourcePersistencePosture as jest.Mock;
const request = (body: unknown, origin?: string) => new NextRequest('http://localhost/api/writers-studio/source-posture', {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...(origin ? { Origin: origin } : {}) },
  body: JSON.stringify(body),
});
beforeEach(() => { jest.clearAllMocks(); member.mockResolvedValue('m1'); transition.mockResolvedValue({ posture: 'sanctuary', revision: '5' }); read.mockResolvedValue({ posture: 'unresolved', revision: '0' }); });
test('unauthenticated read refuses', async () => {
  member.mockResolvedValue(null);
  expect((await GET(new NextRequest('http://localhost/api/writers-studio/source-posture'))).status).toBe(401);
  expect(read).not.toHaveBeenCalled();
});
test('read is member-bound and never cached', async () => {
  const response = await GET(new NextRequest('http://localhost/api/writers-studio/source-posture'));
  expect(response.status).toBe(200);
  expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  expect(await response.json()).toEqual({ posture: 'unresolved', revision: '0' });
});
test('cross-origin posture change refuses before authentication or transition', async () => {
  expect((await POST(request({ posture: 'ordinary' }, 'https://attacker.example'))).status).toBe(403);
  expect(transition).not.toHaveBeenCalled();
});
test.each([{ posture: false }, { posture: 'unresolved' }, { posture: 'ordinary', sanctuary: false }])('ambiguous or extra fields are refused', async body => {
  expect((await POST(request(body))).status).toBe(400);
  expect(transition).not.toHaveBeenCalled();
});
test('explicit authenticated posture invokes server transition only', async () => {
  const response = await POST(request({ posture: 'sanctuary' }, 'http://localhost'));
  expect(response.status).toBe(200);
  expect(transition).toHaveBeenCalledWith(expect.any(NextRequest), 'm1', 'sanctuary');
});

test('direct API request cannot unlock ordinary persistence before UI integration', async () => {
  const response = await POST(request({ posture: 'ordinary' }, 'http://localhost'));
  expect(response.status).toBe(423);
  expect(transition).not.toHaveBeenCalled();
});
