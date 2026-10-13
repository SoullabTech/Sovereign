import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockResolve = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockRead = jest.fn<(...args: unknown[]) => Promise<any>>();
jest.mock('@/lib/auth/individualContext', () => ({
  resolveIndividualContext: (...args: unknown[]) => mockResolve(...args),
}));
jest.mock('@/lib/ganesha/personalFieldContinuity', () => ({
  readPersonalFieldContinuity: (...args: unknown[]) => mockRead(...args),
}));

import { GET } from '../route';
const ACTOR = '11111111-1111-4111-8111-111111111111';
const FOREIGN = '22222222-2222-4222-8222-222222222222';
const context = { memberId: ACTOR,
  legacyPersonalStatus: 'none', legacyPersonalPractitionerId: null };
const req = (url = 'https://soullab.life/api/ganesha/personal-field/continuity') =>
  new NextRequest(url, { headers: { 'x-member-id': FOREIGN } });
beforeEach(() => {
  mockResolve.mockReset(); mockRead.mockReset();
  mockResolve.mockResolvedValue(context);
  mockRead.mockResolvedValue({
    owner: 'member', access: 'bounded_read_only',
    coverage: 'personal_records_with_verified_provenance_only',
    legacyPersonal: { status: 'none', referenced: false },
    records: { decisions: [], changes: [], processItems: [], notes: [], attention: [] },
  });
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
describe('G2-2 Ganesha Personal Field admission and non-disclosure', () => {
  it('an unsigned caller is refused before any content lookups', async () => {
    mockResolve.mockResolvedValue(null);
    const res = await GET(req());
    expect(res.status).toBe(401);
    expect(res.headers.get('Cache-Control')).toContain('no-store');
    expect(mockRead).not.toHaveBeenCalled();
  });
  it('authenticated member reads only the server-resolved context', async () => {
    const res = await GET(req());
    expect(res.status).toBe(200);
    expect(mockResolve).toHaveBeenCalledTimes(1);
    expect(mockRead).toHaveBeenCalledWith(context);
    expect(res.headers.get('Cache-Control')).toContain('no-store');
    expect((await res.json()).access).toBe('bounded_read_only');
  });
  it('an arbitrary forged member or practitioner parameter is not used as authority', async () => {
    const res = await GET(req('https://soullab.life/api/ganesha/personal-field/continuity?memberId='+
      FOREIGN+'&practitionerId='+FOREIGN));
    expect(res.status).toBe(200);
    expect(mockRead).toHaveBeenCalledWith(context);
    expect(mockRead.mock.calls[0][0]).not.toHaveProperty('clientId');
  });
  it('driver failures do not expose a raw error or return misleading empty history', async () => {
    mockRead.mockRejectedValue(new Error('private_note person@private.invalid'));
    const res = await GET(req());
    expect(res.status).toBe(503);
    expect(res.headers.get('Cache-Control')).toContain('no-store');
    const body = JSON.stringify(await res.json());
    expect(body).not.toContain('private_note');
    expect(body).not.toContain('person@private.invalid');
    expect(body).not.toContain('records');
    expect(console.error).toHaveBeenCalledWith(
      '[Ganesha PersonalField] Read unavailable', { failureKind: 'source_unavailable' });
  });
});
