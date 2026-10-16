import { NextRequest } from 'next/server';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(),
}));
jest.mock('@/lib/writersStudio/betaAccessServer', () => ({
  writersStudioBetaAccess: jest.fn(),
}));

import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
import {
  reviewHeldWriterRequestR17,
  R17_REAL_WRITER_SERVICE_ENABLED,
  R17_REVIEW_ROUTE,
} from '../heldWriterSessionReviewR17';

const session = getMemberIdFromRequest as jest.MockedFunction<typeof getMemberIdFromRequest>;
const admission = writersStudioBetaAccess as jest.MockedFunction<typeof writersStudioBetaAccess>;
const MEMBER = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const URL = 'https://soullab.life' + R17_REVIEW_ROUTE;
const envBeta = process.env.WRITERS_STUDIO_RESTRICTED_BETA;
const envReview = process.env.WRITERS_STUDIO_R17_HELD_SERVICE_REVIEW;

function req(path = URL, opts?: { method?: string; host?: string; origin?: string; memberClaim?: string }) {
  const headers: Record<string, string> = {};
  if (opts?.host !== null) headers.host = opts?.host ?? 'soullab.life';
  if (opts?.origin !== undefined) headers.origin = opts.origin;
  if (opts?.memberClaim !== undefined) headers['x-member-id'] = opts.memberClaim;
  return new NextRequest(path, { method: opts?.method ?? 'GET', headers });
}

beforeEach(() => {
  jest.resetAllMocks();
  process.env.WRITERS_STUDIO_RESTRICTED_BETA = 'true';
  process.env.WRITERS_STUDIO_R17_HELD_SERVICE_REVIEW = 'true';
  session.mockResolvedValue(MEMBER);
  admission.mockResolvedValue({ eligible: true, basis: 'active_beta_tester' });
});
afterAll(() => {
  if (envBeta === undefined) delete process.env.WRITERS_STUDIO_RESTRICTED_BETA;
  else process.env.WRITERS_STUDIO_RESTRICTED_BETA = envBeta;
  if (envReview === undefined) delete process.env.WRITERS_STUDIO_R17_HELD_SERVICE_REVIEW;
  else process.env.WRITERS_STUDIO_R17_HELD_SERVICE_REVIEW = envReview;
});

describe('R17 held-only production-host session preflight (inactive source)', () => {
  it('never activates real writing in the shipped code', () => {
    expect(R17_REAL_WRITER_SERVICE_ENABLED).toBe(false);
  });
  it('fails closed when either explicit gate is absent', async () => {
    delete process.env.WRITERS_STUDIO_RESTRICTED_BETA;
    expect(await reviewHeldWriterRequestR17(req())).toEqual({ kind: 'refused', status: 404 });
    process.env.WRITERS_STUDIO_RESTRICTED_BETA = 'true';
    delete process.env.WRITERS_STUDIO_R17_HELD_SERVICE_REVIEW;
    expect(await reviewHeldWriterRequestR17(req())).toEqual({ kind: 'refused', status: 404 });
    expect(session).not.toHaveBeenCalled();
  });
  it('refuses beta host, HTTP, and virtual-host mismatch before session query', async () => {
    expect(await reviewHeldWriterRequestR17(req('https://beta.soullab.life' + R17_REVIEW_ROUTE, { host: 'beta.soullab.life' }))).toEqual({ kind: 'refused', status: 403 });
    expect(await reviewHeldWriterRequestR17(req('http://soullab.life' + R17_REVIEW_ROUTE))).toEqual({ kind: 'refused', status: 403 });
    expect(await reviewHeldWriterRequestR17(req(URL, { host: 'evil.example' }))).toEqual({ kind: 'refused', status: 403 });
    expect(session).not.toHaveBeenCalled();
  });
  it('refuses unreviewed paths, query flags and HTTP methods', async () => {
    expect(await reviewHeldWriterRequestR17(req('https://soullab.life/writers-studio'))).toEqual({ kind: 'refused', status: 404 });
    expect(await reviewHeldWriterRequestR17(req(URL + '?memberId=' + MEMBER))).toEqual({ kind: 'refused', status: 404 });
    expect(await reviewHeldWriterRequestR17(req(URL, { method: 'DELETE' }))).toEqual({ kind: 'refused', status: 405 });
    expect(session).not.toHaveBeenCalled();
  });
  it('rejects cross-site or missing Origin for POST before resolving a session', async () => {
    for (const origin of [undefined, 'https://beta.soullab.life', 'https://attacker.example']) {
      expect(await reviewHeldWriterRequestR17(req(URL, { method: 'POST', origin }))).toEqual({ kind: 'refused', status: 403 });
    }
    expect(session).not.toHaveBeenCalled();
  });
  it('does not turn a browser-supplied member ID into authentication', async () => {
    session.mockResolvedValue(null);
    expect(await reviewHeldWriterRequestR17(req(URL, { memberClaim: MEMBER }))).toEqual({ kind: 'refused', status: 401 });
    expect(admission).not.toHaveBeenCalled();
  });
  it('refuses a session with no current, approved writer invitation+consent', async () => {
    admission.mockResolvedValue({ eligible: false, basis: 'not_in_pilot' });
    expect(await reviewHeldWriterRequestR17(req())).toEqual({ kind: 'refused', status: 403 });
    expect(admission).toHaveBeenCalledWith(MEMBER);
  });
  it('does not mistake founder/CTO witness access for author-owned writing', async () => {
    admission.mockResolvedValue({ eligible: true, basis: 'founder_witness' });
    expect(await reviewHeldWriterRequestR17(req())).toEqual({ kind: 'refused', status: 403 });
  });
  it('fails closed if session, invitation or consent authority fails', async () => {
    session.mockRejectedValueOnce(new Error('fixture session database offline'));
    expect(await reviewHeldWriterRequestR17(req())).toEqual({ kind: 'refused', status: 503 });
    admission.mockRejectedValueOnce(new Error('fixture consent ledger offline'));
    expect(await reviewHeldWriterRequestR17(req())).toEqual({ kind: 'refused', status: 503 });
  });
  it('only returns HELD ciphertext preflight subject from real session resolver', async () => {
    const result = await reviewHeldWriterRequestR17(req());
    expect(result).toEqual({
      kind: 'held_only',
      subject: { memberId: MEMBER, assertedBy: 'server_verified_member_session' },
      origin: 'https://soullab.life',
    });
    expect(session).toHaveBeenCalledTimes(1);
    expect(admission).toHaveBeenCalledWith(MEMBER);
    expect(result).not.toHaveProperty('write');
  });
  it('accepts matching same-origin POST but cannot write or invite anyone', async () => {
    session.mockResolvedValue(OTHER);
    const result = await reviewHeldWriterRequestR17(req(URL, { method: 'POST', origin: 'https://soullab.life' }));
    expect(result).toEqual({
      kind: 'held_only',
      subject: { memberId: OTHER, assertedBy: 'server_verified_member_session' },
      origin: 'https://soullab.life',
    });
    expect(admission).toHaveBeenCalledWith(OTHER);
  });
});
