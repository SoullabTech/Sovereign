import { NextRequest } from 'next/server';
import { POST } from '../route';
import { isTrustedPilotWrite, verifiedPilotWriterActor } from '@/lib/writersStudio/pilotWriteSecurity';
import { acceptPilotWriter } from '@/lib/writersStudio/pilotGrantServer';

jest.mock('@/lib/writersStudio/pilotWriteSecurity', () => ({
  isTrustedPilotWrite: jest.fn(), verifiedPilotWriterActor: jest.fn(),
}));
jest.mock('@/lib/writersStudio/pilotGrantServer', () => ({ acceptPilotWriter: jest.fn() }));

const origin = isTrustedPilotWrite as jest.Mock;
const actor = verifiedPilotWriterActor as jest.Mock;
const accept = acceptPilotWriter as jest.Mock;
const writerId = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
const request = () => new NextRequest(
  'https://beta.soullab.test/api/sovereign/writers-studio/pilot-accept',
  { method: 'POST', headers: { Origin: 'https://beta.soullab.test' } },
);

beforeEach(() => {
  jest.resetAllMocks();
  process.env.WRITER_PILOT_GRANT_WRITES_ENABLED = '1';
  origin.mockReturnValue(true);
  actor.mockResolvedValue({ memberId: writerId, founder: false });
  accept.mockResolvedValue(true);
});
afterAll(() => delete process.env.WRITER_PILOT_GRANT_WRITES_ENABLED);

test('held by default', async () => {
  delete process.env.WRITER_PILOT_GRANT_WRITES_ENABLED;
  expect((await POST(request())).status).toBe(423);
  expect(accept).not.toHaveBeenCalled();
});

test('writer can accept only their own verified session, not someone else by input', async () => {
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(accept).toHaveBeenCalledWith(writerId);
  expect(response.headers.get('cache-control')).toContain('no-store');
});

test('wrong origin, no session and missing founder approval are separate refusals', async () => {
  origin.mockReturnValueOnce(false);
  expect((await POST(request())).status).toBe(403);
  actor.mockResolvedValueOnce(null);
  expect((await POST(request())).status).toBe(401);
  accept.mockResolvedValueOnce(false);
  expect((await POST(request())).status).toBe(409);
});

test('database failure does not pretend an invitation was accepted', async () => {
  accept.mockRejectedValueOnce(new Error('DB unavailable'));
  expect((await POST(request())).status).toBe(503);
});
