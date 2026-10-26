/**
 * Anti-vacuity: the REAL, unmocked pilotR20Authority rejects all mutation
 * routes, even with a valid fictional founder/writer session and flag='1'.
 * Database functions are mocked to assert no side effects.
 */
import { NextRequest } from 'next/server';
import { POST as approve, DELETE as revoke } from '../pilot-approval/route';
import { POST as accept } from '../pilot-accept/route';
import { isTrustedPilotWrite, verifiedPilotWriterActor } from '@/lib/writersStudio/pilotWriteSecurity';
import {
  approvePilotWriter, revokePilotWriter, acceptPilotWriter,
} from '@/lib/writersStudio/pilotGrantServer';

jest.mock('@/lib/writersStudio/pilotWriteSecurity', () => ({
  isTrustedPilotWrite: jest.fn(),
  verifiedPilotWriterActor: jest.fn(),
}));
jest.mock('@/lib/writersStudio/pilotGrantServer', () => ({
  approvePilotWriter: jest.fn(),
  revokePilotWriter: jest.fn(),
  acceptPilotWriter: jest.fn(),
}));
// Deliberately DO NOT MOCK @/lib/writersStudio/pilotR20Authority.
const actor = verifiedPilotWriterActor as jest.Mock;
const origin = isTrustedPilotWrite as jest.Mock;
const grant = approvePilotWriter as jest.Mock;
const withdraw = revokePilotWriter as jest.Mock;
const acceptance = acceptPilotWriter as jest.Mock;
const founder = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
const writer = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';

function approvalRequest(method: 'POST' | 'DELETE'): NextRequest {
  return new NextRequest('https://beta.soullab.test/api/sovereign/writers-studio/pilot-approval', {
    method,
    headers: { Origin: 'https://beta.soullab.test' },
    body: JSON.stringify({ memberId: writer }),
  });
}
function acceptanceRequest() {
  return new NextRequest('https://beta.soullab.test/api/sovereign/writers-studio/pilot-accept', {
    method: 'POST', headers: { Origin: 'https://beta.soullab.test' },
  });
}

beforeEach(() => {
  jest.resetAllMocks();
  process.env.WRITER_PILOT_GRANT_WRITES_ENABLED = '1';
  origin.mockReturnValue(true);
  actor.mockResolvedValue({ memberId: founder, founder: true });
});
afterAll(() => delete process.env.WRITER_PILOT_GRANT_WRITES_ENABLED);

test('real R20 authority refuses founder APPROVE when flag is on', async () => {
  const r = await approve(approvalRequest('POST'));
  expect(r.status).toBe(423);
  expect(await r.json()).toEqual({ error: 'pilot_r20_authority_held' });
  expect(grant).not.toHaveBeenCalled();
});

test('real R20 authority refuses founder REVOKE database mutation when flag is on', async () => {
  const r = await revoke(approvalRequest('DELETE'));
  expect(r.status).toBe(423);
  expect(await r.json()).toEqual({ error: 'pilot_r20_authority_held' });
  expect(withdraw).not.toHaveBeenCalled();
});

test('real R20 authority refuses writer ACCEPT when flag is on', async () => {
  actor.mockResolvedValue({ memberId: writer, founder: false });
  const r = await accept(acceptanceRequest());
  expect(r.status).toBe(423);
  expect(await r.json()).toEqual({ error: 'pilot_r20_authority_held' });
  expect(acceptance).not.toHaveBeenCalled();
});

test('HTTP refusal does not leak a grant UUID or the current account identity', async () => {
  const r = await approve(approvalRequest('POST'));
  const body = JSON.stringify(await r.json());
  expect(body).not.toContain(writer);
  expect(body).not.toContain(founder);
  expect(r.headers.get('cache-control')).toContain('no-store');
});
