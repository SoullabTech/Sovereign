/**
 * DEVELOP PREPARATION — the boundary, falsified without a database.
 *
 * What is held closed here is the founder's ruling in one line: source
 * boundaries may be OFFERED and may not be silently IMPOSED on a changed
 * draft. Every path below is a way that could have gone wrong — a
 * confirmation with no disclosure, a confirmation over a state the server
 * never agreed was convertible, a body carrying its own boundaries.
 */

import { NextRequest } from 'next/server';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/manuscript/development/preparation', () => ({ resolveDevelopPreparation: jest.fn() }));
jest.mock('@/lib/manuscript/sections/convertDraft', () => ({ convertDraftToSections: jest.fn() }));

import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { resolveDevelopPreparation } from '@/lib/manuscript/development/preparation';
import { convertDraftToSections } from '@/lib/manuscript/sections/convertDraft';
import { GET, POST } from '../route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockResolve = resolveDevelopPreparation as jest.Mock;
const mockConvert = convertDraftToSections as jest.Mock;

const MEMBER = '11111111-1111-1111-1111-111111111111';
const MS = '22222222-2222-2222-2222-222222222222';
const DIGEST = 'a'.repeat(64);
const ctx = { params: Promise.resolve({ id: MS }) };
const url = `http://localhost/api/sovereign/manuscripts/${MS}/develop/preparation`;
const get = () => new NextRequest(url, { method: 'GET' });
const post = (body: unknown) => new NextRequest(url, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});

const CONVERTIBLE = {
  kind: 'convertible', sourceSections: 185, diverged: true,
  divergence: { classification: 'EDITED', boundaries: 185, resolved: 185, headingsChanged: 0, bodyLinesChanged: 12, draftChars: 400000 },
  disclosure: DIGEST,
};

beforeEach(() => { jest.clearAllMocks(); mockAuth.mockResolvedValue(MEMBER); });

describe('GET — resolving never prepares', () => {
  it('401 without a verified member; nothing is resolved', async () => {
    mockAuth.mockResolvedValue(null);
    expect((await GET(get(), ctx)).status).toBe(401);
    expect(mockResolve).not.toHaveBeenCalled();
  });

  it('returns the state, and converts nothing', async () => {
    mockResolve.mockResolvedValue(CONVERTIBLE);
    const res = await GET(get(), ctx);
    expect(res.status).toBe(200);
    expect((await res.json()).kind).toBe('convertible');
    expect(mockConvert).not.toHaveBeenCalled();
  });
});

describe('POST — the confirmation', () => {
  it('401 without a verified member; nothing converts', async () => {
    mockAuth.mockResolvedValue(null);
    expect((await POST(post({ confirm: 'convert', disclosure: DIGEST }), ctx)).status).toBe(401);
    expect(mockConvert).not.toHaveBeenCalled();
  });

  /* ⛔ A BODY THAT COULD CARRY A BOUNDARY IS REFUSED WHOLE. Honouring the
     known keys and ignoring the rest would let a client believe it had placed
     a cut, and place one it never saw refused. */
  it('refuses a body carrying anything but the confirmation and its disclosure', async () => {
    const res = await POST(post({ confirm: 'convert', disclosure: DIGEST, sections: [{ text: 'x' }] }), ctx);
    expect(res.status).toBe(400);
    expect((await res.json()).refusal).toBe('foreign_field');
    expect(mockConvert).not.toHaveBeenCalled();
  });

  it('refuses an unconfirmed call', async () => {
    const res = await POST(post({ disclosure: DIGEST }), ctx);
    expect(res.status).toBe(400);
    expect((await res.json()).refusal).toBe('confirmation_required');
    expect(mockConvert).not.toHaveBeenCalled();
  });

  /* THE RULING, ENFORCED. A confirmation that names no disclosed state is a
     conversion nobody was shown. */
  it('refuses a confirmation that carries no disclosure', async () => {
    const res = await POST(post({ confirm: 'convert' }), ctx);
    expect(res.status).toBe(400);
    expect((await res.json()).refusal).toBe('disclosure_required');
    expect(mockConvert).not.toHaveBeenCalled();
  });

  it.each(['unresolvable', 'no_draft', 'ready', 'no_source', 'indeterminate'])(
    'refuses a confirmation over a %s Work — the client does not decide convertibility',
    async (kind) => {
      mockResolve.mockResolvedValue({ kind });
      const res = await POST(post({ confirm: 'convert', disclosure: DIGEST }), ctx);
      expect(res.status).toBe(409);
      expect(await res.json()).toEqual({ refusal: 'not_convertible', state: kind });
      expect(mockConvert).not.toHaveBeenCalled();
    });

  it('passes the disclosure to the canonical WS2-04A conversion, and nothing else', async () => {
    mockResolve.mockResolvedValue(CONVERTIBLE);
    mockConvert.mockResolvedValue({ status: 'converted', sectionCount: 185, draftVersion: 12 });
    const res = await POST(post({ confirm: 'convert', disclosure: DIGEST }), ctx);
    expect(res.status).toBe(200);
    expect(mockConvert).toHaveBeenCalledWith(MS, MEMBER, DIGEST);
    expect(await res.json()).toEqual({ status: 'converted', sectionCount: 185, draftVersion: 12 });
  });

  it('surfaces a stale disclosure as a conflict, not a success', async () => {
    mockResolve.mockResolvedValue(CONVERTIBLE);
    mockConvert.mockResolvedValue({ status: 'refused', refusal: 'disclosure_stale', detail: 'the draft changed after the divergence was shown' });
    const res = await POST(post({ confirm: 'convert', disclosure: DIGEST }), ctx);
    expect(res.status).toBe(409);
    expect((await res.json()).refusal).toBe('disclosure_stale');
  });

  it('surfaces a moved boundary as a refusal', async () => {
    mockResolve.mockResolvedValue(CONVERTIBLE);
    mockConvert.mockResolvedValue({ status: 'refused', refusal: 'boundary_moved', detail: '1 unresolved' });
    const res = await POST(post({ confirm: 'convert', disclosure: DIGEST }), ctx);
    expect(res.status).toBe(409);
    expect((await res.json()).refusal).toBe('boundary_moved');
  });
});
