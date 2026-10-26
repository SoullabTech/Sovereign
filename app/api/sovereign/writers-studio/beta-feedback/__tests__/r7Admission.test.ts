import { NextRequest } from 'next/server';
import { POST } from '../route';
import { verifiedPilotWriterActor } from '@/lib/writersStudio/pilotWriteSecurity';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
import { isTrustedPilotWrite } from '@/lib/writersStudio/pilotWriteSecurity';
import { query } from '@/lib/db/postgres';

jest.mock('@/lib/writersStudio/betaAccessServer', () => ({ writersStudioBetaAccess: jest.fn() }));
jest.mock('@/lib/writersStudio/pilotWriteSecurity', () => ({ isTrustedPilotWrite: jest.fn(), verifiedPilotWriterActor: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));

const member = verifiedPilotWriterActor as jest.Mock;
const access = writersStudioBetaAccess as jest.Mock;
const origin = isTrustedPilotWrite as jest.Mock;
const db = query as jest.Mock;
const body = { signal: 'felt_like_my_voice', studioMode: 'write', orientationContext: {} };
const request = () => new NextRequest(
  'https://beta.soullab.test/api/sovereign/writers-studio/beta-feedback',
  { method: 'POST', headers: { Origin: 'https://beta.soullab.test' }, body: JSON.stringify(body) },
);

beforeEach(() => {
  jest.resetAllMocks();
  origin.mockReturnValue(true);
  member.mockResolvedValue({ memberId: 'fictional-author', founder: false });
  access.mockResolvedValue({ eligible: false, basis: 'not_in_pilot' });
  db.mockResolvedValue({ rows: [] });
});

test('forged origin is refused before identity, member data or feedback insert', async () => {
  origin.mockReturnValue(false);
  const r = await POST(request());
  expect(r.status).toBe(403);
  expect(await r.json()).toEqual({ refusal: 'untrusted_origin' });
  expect(member).not.toHaveBeenCalled();
  expect(db).not.toHaveBeenCalled();
});

test('active CRM contact without founder+R20 grant cannot post beta feedback', async () => {
  const r = await POST(request());
  expect(r.status).toBe(403);
  expect(await r.json()).toEqual({ refusal: 'not_in_beta_pilot' });
  expect(db).not.toHaveBeenCalled();
});

test('R20 outage refuses submission and never captures member narrative', async () => {
  access.mockRejectedValue(new Error('R20 unable to attest revocation floor'));
  const r = await POST(request());
  expect(r.status).toBe(503);
  expect(await r.json()).toEqual({ refusal: 'pilot_access_unavailable' });
  expect(db).not.toHaveBeenCalled();
  expect(r.headers.get('cache-control')).toContain('no-store');
});

test('valid member-only consented feedback writes no cross-member Work data', async () => {
  access.mockResolvedValue({ eligible: true, basis: 'founder_approved_beta' });
  const r = await POST(request());
  expect(r.status).toBe(200);
  expect(db).toHaveBeenCalledTimes(1);
  const [sql,params] = db.mock.calls[0];
  expect(sql).toContain('writer_studio_beta_feedback');
  expect(params[0]).toBe('fictional-author');
  expect(params[1]).toBeNull();
  expect(r.headers.get('cache-control')).toContain('no-store');
});

test('session failure never inserts feedback', async () => {
  member.mockRejectedValue(new Error('session backend down'));
  const r = await POST(request());
  expect(r.status).toBe(503);
  expect(access).not.toHaveBeenCalled();
  expect(db).not.toHaveBeenCalled();
});
