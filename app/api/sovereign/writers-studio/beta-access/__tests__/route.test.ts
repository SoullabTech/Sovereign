import { NextRequest } from 'next/server';
import { GET } from '../route';
import { verifiedPilotWriterActor } from '@/lib/writersStudio/pilotWriteSecurity';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';

jest.mock('@/lib/writersStudio/pilotWriteSecurity', () => ({ verifiedPilotWriterActor: jest.fn() }));
jest.mock('@/lib/writersStudio/betaAccessServer', () => ({ writersStudioBetaAccess: jest.fn() }));
const member = verifiedPilotWriterActor as jest.Mock;
const access = writersStudioBetaAccess as jest.Mock;
const request = () => new NextRequest('https://beta.soullab.test/api/sovereign/writers-studio/beta-access');

beforeEach(() => jest.resetAllMocks());

test('not authenticated does not look up beta data', async () => {
  member.mockResolvedValue(null);
  const r = await GET(request());
  expect(r.status).toBe(401);
  expect(access).not.toHaveBeenCalled();
  expect(r.headers.get('cache-control')).toContain('no-store');
});

test('server-derived exact member authorization determines beta presentation', async () => {
  member.mockResolvedValue({ memberId: 'fictional-a', founder: false });
  access.mockResolvedValue({ eligible: true, basis: 'founder_approved_beta' });
  const r = await GET(request());
  expect(r.status).toBe(200);
  expect(await r.json()).toEqual({ eligible: true, basis: 'founder_approved_beta' });
  expect(access).toHaveBeenCalledWith('fictional-a');
  expect(r.headers.get('vary')).toContain('x-session-token');
});

test('unadmitted member receives no sensitive grant information', async () => {
  member.mockResolvedValue({ memberId: 'fictional-b', founder: false });
  access.mockResolvedValue({ eligible: false, basis: 'not_in_pilot' });
  expect(await (await GET(request())).json()).toEqual({ eligible: false, basis: 'not_in_pilot' });
});

test('R20 unavailable never returns positive or public-cacheable eligibility', async () => {
  member.mockResolvedValue({ memberId: 'fictional-a', founder: false });
  access.mockRejectedValue(new Error('external checkpoint unavailable'));
  const r = await GET(request());
  expect(r.status).toBe(503);
  expect(await r.json()).toEqual({ error: 'pilot_access_unavailable' });
  expect(r.headers.get('cache-control')).toContain('no-store');
});
