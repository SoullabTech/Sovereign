import { NextRequest } from 'next/server';
import { POST, DELETE } from '../route';
import { isTrustedPilotWrite, verifiedPilotWriterActor } from '@/lib/writersStudio/pilotWriteSecurity';
import { approvePilotWriter, revokePilotWriter } from '@/lib/writersStudio/pilotGrantServer';

jest.mock('@/lib/writersStudio/pilotWriteSecurity', () => ({
  isTrustedPilotWrite: jest.fn(), verifiedPilotWriterActor: jest.fn(),
}));
jest.mock('@/lib/writersStudio/pilotGrantServer', () => ({
  approvePilotWriter: jest.fn(), revokePilotWriter: jest.fn(),
}));

const origin = isTrustedPilotWrite as jest.Mock;
const actor = verifiedPilotWriterActor as jest.Mock;
const approve = approvePilotWriter as jest.Mock;
const revoke = revokePilotWriter as jest.Mock;
const target = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
const founder = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
const request = (body: unknown, method: 'POST' | 'DELETE' = 'POST') =>
  new NextRequest('https://beta.soullab.test/api/sovereign/writers-studio/pilot-approval', {
    method, headers: { Origin: 'https://beta.soullab.test' }, body: JSON.stringify(body),
  });

beforeEach(() => {
  jest.resetAllMocks();
  process.env.WRITER_PILOT_GRANT_WRITES_ENABLED = '1';
  origin.mockReturnValue(true);
  actor.mockResolvedValue({ memberId: founder, founder: true });
  approve.mockResolvedValue(true);
  revoke.mockResolvedValue(true);
});
afterAll(() => delete process.env.WRITER_PILOT_GRANT_WRITES_ENABLED);

test('writes are held by default even if a founder session is present', async () => {
  delete process.env.WRITER_PILOT_GRANT_WRITES_ENABLED;
  const response = await POST(request({ memberId: target }));
  expect(response.status).toBe(423);
  expect(approve).not.toHaveBeenCalled();
});

test('refuses forged and absent origin before processing credentials', async () => {
  origin.mockReturnValue(false);
  expect((await POST(request({ memberId: target }))).status).toBe(403);
  expect(actor).not.toHaveBeenCalled();
  expect(approve).not.toHaveBeenCalled();
});

test('requires a verified founder account; CTO, operations and shared password never suffice', async () => {
  actor.mockResolvedValueOnce(null).mockResolvedValueOnce({ memberId: founder, founder: false });
  expect((await POST(request({ memberId: target }))).status).toBe(401);
  expect((await POST(request({ memberId: target }))).status).toBe(403);
  expect(approve).not.toHaveBeenCalled();
});

test('single-member approval uses verified founder identity, not client-supplied actor', async () => {
  const response = await POST(request({ memberId: target, approvedBy: target, tier: 'pro' }));
  expect(response.status).toBe(200);
  expect(approve).toHaveBeenCalledTimes(1);
  expect(approve).toHaveBeenCalledWith(target, founder);
  expect(response.headers.get('cache-control')).toContain('no-store');
});

test('single-member revocation carries verified founder and does not delete writing', async () => {
  const response = await DELETE(request({ memberId: target, founder: 'wrong' }, 'DELETE'));
  expect(response.status).toBe(200);
  expect(revoke).toHaveBeenCalledWith(target, founder);
  expect(approve).not.toHaveBeenCalled();
});

test('rejects malformed target, missing target and group enrollment arrays', async () => {
  for (const body of [{ memberId: [target] }, { memberId: 'bad' }, {}, []]) {
    expect((await POST(request(body))).status).toBe(400);
  }
  expect(approve).not.toHaveBeenCalled();
});

test('no matching current approval returns a refusal, not an assumed success', async () => {
  approve.mockResolvedValue(false);
  expect((await POST(request({ memberId: target }))).status).toBe(409);
});

test('DB or missing-schema errors fail closed with no account data', async () => {
  approve.mockRejectedValue(new Error('fictional SQL details'));
  const response = await POST(request({ memberId: target }));
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ error: 'pilot_grant_unavailable' });
});
