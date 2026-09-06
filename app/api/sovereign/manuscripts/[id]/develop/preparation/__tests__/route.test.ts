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

const divergence = (classification: string, bodyLinesChanged: number) =>
  ({ classification, boundaries: 185, resolved: 185, headingsChanged: 0, bodyLinesChanged, draftChars: 381076 });

/** The production case: unchanged since import. Mechanical authority. */
const EXACT = { kind: 'exact', sourceSections: 185, divergence: divergence('PRISTINE', 0), stateDigest: DIGEST };
/** Written in since import. The member's confirmation is the authority. */
const DIVERGED = { kind: 'diverged', sourceSections: 185, divergence: divergence('EDITED', 12), disclosureDigest: DIGEST };

beforeEach(() => { jest.clearAllMocks(); mockAuth.mockResolvedValue(MEMBER); });

describe('GET — resolving never prepares', () => {
  it('401 without a verified member; nothing is resolved', async () => {
    mockAuth.mockResolvedValue(null);
    expect((await GET(get(), ctx)).status).toBe(401);
    expect(mockResolve).not.toHaveBeenCalled();
  });

  it('returns the state, and converts nothing', async () => {
    mockResolve.mockResolvedValue(EXACT);
    const res = await GET(get(), ctx);
    expect(res.status).toBe(200);
    expect((await res.json()).kind).toBe('exact');
    expect(mockConvert).not.toHaveBeenCalled();
  });
});

describe('POST — the confirmation', () => {
  it('401 without a verified member; nothing converts', async () => {
    mockAuth.mockResolvedValue(null);
    expect((await POST(post({ act: 'prepare', stateDigest: DIGEST }), ctx)).status).toBe(401);
    expect(mockConvert).not.toHaveBeenCalled();
  });

  /* ⛔ A BODY THAT COULD CARRY A BOUNDARY IS REFUSED WHOLE. Honouring the
     known keys and ignoring the rest would let a client believe it had placed
     a cut, and place one it never saw refused. */
  it('refuses a body carrying anything but the act and its state digest', async () => {
    const res = await POST(post({ act: 'prepare', stateDigest: DIGEST, sections: [{ text: 'x' }] }), ctx);
    expect(res.status).toBe(400);
    expect((await res.json()).refusal).toBe('foreign_field');
    expect(mockConvert).not.toHaveBeenCalled();
  });

  it('refuses a call naming no act', async () => {
    const res = await POST(post({ stateDigest: DIGEST }), ctx);
    expect(res.status).toBe(400);
    expect((await res.json()).refusal).toBe('act_required');
    expect(mockConvert).not.toHaveBeenCalled();
  });

  /* THE RULING, ENFORCED ON BOTH PATHS. An act naming no state is an act over
     something nobody was told about. */
  it.each(['prepare', 'confirm_conversion'])('refuses %s when it carries no state digest', async (act) => {
    const res = await POST(post({ act }), ctx);
    expect(res.status).toBe(400);
    expect((await res.json()).refusal).toBe('state_digest_required');
    expect(mockConvert).not.toHaveBeenCalled();
  });

  /* ⛔ NEITHER ACT MAY STAND FOR THE OTHER. `prepare` over a changed draft
     would convert without ever showing the member what moved;
     `confirm_conversion` over an unchanged one records a consent that was
     never required and so was never given meaning. */
  it('refuses prepare over a diverged Work', async () => {
    mockResolve.mockResolvedValue(DIVERGED);
    const res = await POST(post({ act: 'prepare', stateDigest: DIGEST }), ctx);
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ refusal: 'wrong_authority', state: 'diverged', expected: 'confirm_conversion' });
    expect(mockConvert).not.toHaveBeenCalled();
  });

  it('refuses confirm_conversion over an exact Work', async () => {
    mockResolve.mockResolvedValue(EXACT);
    const res = await POST(post({ act: 'confirm_conversion', stateDigest: DIGEST }), ctx);
    expect(res.status).toBe(409);
    expect((await res.json()).expected).toBe('prepare');
    expect(mockConvert).not.toHaveBeenCalled();
  });

  it.each(['unresolvable', 'no_draft', 'ready', 'no_source', 'indeterminate'])(
    'refuses a confirmation over a %s Work — the client does not decide convertibility',
    async (kind) => {
      mockResolve.mockResolvedValue({ kind });
      const res = await POST(post({ act: 'prepare', stateDigest: DIGEST }), ctx);
      expect(res.status).toBe(409);
      expect(await res.json()).toEqual({ refusal: 'not_convertible', state: kind });
      expect(mockConvert).not.toHaveBeenCalled();
    });

  it('carries MECHANICAL authority for an exact Work, and nothing else', async () => {
    mockResolve.mockResolvedValue(EXACT);
    mockConvert.mockResolvedValue({ status: 'converted', sectionCount: 185, draftVersion: 12 });
    const res = await POST(post({ act: 'prepare', stateDigest: DIGEST }), ctx);
    expect(res.status).toBe(200);
    expect(mockConvert).toHaveBeenCalledWith(MS, MEMBER, { authority: 'mechanical', stateDigest: DIGEST });
    expect(await res.json()).toEqual({ status: 'converted', sectionCount: 185, draftVersion: 12 });
  });

  it('carries MEMBER CONFIRMATION for a diverged Work', async () => {
    mockResolve.mockResolvedValue(DIVERGED);
    mockConvert.mockResolvedValue({ status: 'converted', sectionCount: 185, draftVersion: 12 });
    await POST(post({ act: 'confirm_conversion', stateDigest: DIGEST }), ctx);
    expect(mockConvert).toHaveBeenCalledWith(MS, MEMBER, { authority: 'member_confirmation', disclosureDigest: DIGEST });
  });

  it.each([
    ['preparation_stale', EXACT, 'prepare'],
    ['disclosure_stale', DIVERGED, 'confirm_conversion'],
    ['not_pristine_under_lock', EXACT, 'prepare'],
    ['boundary_moved', EXACT, 'prepare'],
  ] as const)('surfaces %s as a conflict, not a success', async (refusal, state, act) => {
    mockResolve.mockResolvedValue(state);
    mockConvert.mockResolvedValue({ status: 'refused', refusal });
    const res = await POST(post({ act, stateDigest: DIGEST }), ctx);
    expect(res.status).toBe(409);
    expect((await res.json()).refusal).toBe(refusal);
  });
});
