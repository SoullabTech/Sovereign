import { NextRequest } from 'next/server';
import { POST, DELETE } from '../route';
import { isTrustedPilotWrite, verifiedPilotWriterActor } from '@/lib/writersStudio/pilotWriteSecurity';
import { approvePilotWriter, revokePilotWriter } from '@/lib/writersStudio/pilotGrantServer';
import {
  PilotR20AuthorityUnavailable,
  requireIndependentPilotR20MutationReceipt,
} from '@/lib/writersStudio/pilotR20Authority';

jest.mock('@/lib/writersStudio/pilotWriteSecurity', () => ({
  isTrustedPilotWrite: jest.fn(), verifiedPilotWriterActor: jest.fn(),
}));
jest.mock('@/lib/writersStudio/pilotGrantServer', () => ({
  approvePilotWriter: jest.fn(), revokePilotWriter: jest.fn(),
}));
jest.mock('@/lib/writersStudio/pilotR20Authority', () => ({
  ...jest.requireActual('@/lib/writersStudio/pilotR20Authority'),
  requireIndependentPilotR20MutationReceipt: jest.fn(),
}));

const origin = isTrustedPilotWrite as jest.Mock;
const actor = verifiedPilotWriterActor as jest.Mock;
const approve = approvePilotWriter as jest.Mock;
const revoke = revokePilotWriter as jest.Mock;
const seal = requireIndependentPilotR20MutationReceipt as jest.Mock;
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
  // Fixture authorization only, NOT production's unprovisioned R20 authority.
  seal.mockResolvedValue(undefined);
  approve.mockResolvedValue(true);
  revoke.mockResolvedValue(true);
});
afterAll(() => delete process.env.WRITER_PILOT_GRANT_WRITES_ENABLED);

test('writes are held by default even if a founder session is present', async () => {
  delete process.env.WRITER_PILOT_GRANT_WRITES_ENABLED;
  const response = await POST(request({ memberId: target }));
  expect(response.status).toBe(423);
  expect(seal).not.toHaveBeenCalled();
  expect(approve).not.toHaveBeenCalled();
});

test('refuses forged and absent origin before processing credentials or R20', async () => {
  origin.mockReturnValue(false);
  expect((await POST(request({ memberId: target }))).status).toBe(403);
  expect(actor).not.toHaveBeenCalled();
  expect(seal).not.toHaveBeenCalled();
});

test('requires a verified founder account; CTO, operations and shared password never suffice', async () => {
  actor.mockResolvedValueOnce(null).mockResolvedValueOnce({ memberId: founder, founder: false });
  expect((await POST(request({ memberId: target }))).status).toBe(401);
  expect((await POST(request({ memberId: target }))).status).toBe(403);
  expect(seal).not.toHaveBeenCalled();
  expect(approve).not.toHaveBeenCalled();
});

test('fictional founder approval checks external seal BEFORE writing local grant', async () => {
  const events: string[] = [];
  seal.mockImplementationOnce(() => { events.push('r20-seal'); return Promise.resolve(); });
  approve.mockImplementationOnce(() => { events.push('database'); return Promise.resolve(true); });
  const response = await POST(request({ memberId: target, approvedBy: target, tier: 'pro' }));
  expect(response.status).toBe(200);
  expect(events).toEqual(['r20-seal', 'database']);
  expect(seal).toHaveBeenCalledWith({ action: 'approve', memberId: target, actorId: founder });
  expect(approve).toHaveBeenCalledWith(target, founder);
  expect(response.headers.get('cache-control')).toContain('no-store');
});

test('fictional revocation checks external seal BEFORE local revocation', async () => {
  const events: string[] = [];
  seal.mockImplementationOnce(() => { events.push('r20-seal'); return Promise.resolve(); });
  revoke.mockImplementationOnce(() => { events.push('database'); return Promise.resolve(true); });
  const response = await DELETE(request({ memberId: target, founder: 'wrong' }, 'DELETE'));
  expect(response.status).toBe(200);
  expect(events).toEqual(['r20-seal', 'database']);
  expect(seal).toHaveBeenCalledWith({ action: 'revoke', memberId: target, actorId: founder });
  expect(revoke).toHaveBeenCalledWith(target, founder);
  expect(approve).not.toHaveBeenCalled();
});

test('even an enabled feature flag cannot bypass unprovisioned R20', async () => {
  seal.mockRejectedValueOnce(new PilotR20AuthorityUnavailable());
  const response = await POST(request({ memberId: target }));
  expect(response.status).toBe(423);
  expect(await response.json()).toEqual({ error: 'pilot_r20_authority_held' });
  expect(approve).not.toHaveBeenCalled();
});

test('unprovisioned R20 blocks revocation write too; external terminal refusal remains authoritative', async () => {
  seal.mockRejectedValueOnce(new PilotR20AuthorityUnavailable());
  const response = await DELETE(request({ memberId: target }, 'DELETE'));
  expect(response.status).toBe(423);
  expect(revoke).not.toHaveBeenCalled();
});

test('rejects malformed target, missing target and group enrollment arrays', async () => {
  for (const body of [{ memberId: [target] }, { memberId: 'bad' }, {}, []]) {
    expect((await POST(request(body))).status).toBe(400);
  }
  expect(seal).not.toHaveBeenCalled();
  expect(approve).not.toHaveBeenCalled();
});

test('no matching current approval returns a refusal, not assumed success', async () => {
  approve.mockResolvedValue(false);
  expect((await POST(request({ memberId: target }))).status).toBe(409);
});

test('DB or missing-schema errors fail closed with no account data', async () => {
  approve.mockRejectedValue(new Error('fictional SQL details'));
  const response = await POST(request({ memberId: target }));
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ error: 'pilot_grant_unavailable' });
});
