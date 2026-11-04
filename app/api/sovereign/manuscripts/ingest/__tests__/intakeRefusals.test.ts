/**
 * D1 / D3 / D6 — the ingest route's refusals, EXECUTED (not read from source).
 *
 * The release manifest is mocked to RELEASED so the route can be driven past its module-load hold; every collaborator that
 * would touch a database, a vault or a parser is mocked, so each test can assert what was NOT called. The point of each
 * refusal is that it happens BEFORE anything is stored: the assertions on `parseUpload` and `recordArtifactArrival` are
 * the substance.
 *
 * Gate order exercised here: identity, hold (released here), audience, rate limit, posture, key-provider configuration,
 * idempotency header, body, parse, text refusal, custody.
 */
import { NextRequest } from 'next/server';

jest.mock('@/lib/writersStudio/releaseAuthority', () => ({
  writerReleaseAuthority: () => ({
    manifestId: 'test-released',
    sourceIntakeReleased: true,
    importFormats: ['docx', 'pdf', 'epub', 'text'],
    exportsCertified: { pdf: false, epub: false },
    permanentErasureCertified: false,
  }),
}));
jest.mock('@/lib/auth/verifiedAccess', () => ({
  deriveVerifiedAccess: jest.fn(async () => ({
    authenticated: true, tier: 'free', roles: [], memberId: '11111111-1111-4111-8111-111111111111', reason: null,
  })),
}));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(async () => '11111111-1111-4111-8111-111111111111'),
}));
jest.mock('@/lib/writersStudio/betaAccessServer', () => ({
  writersStudioBetaAccess: jest.fn(async () => ({ eligible: true, basis: 'active_beta_tester' })),
}));
jest.mock('@/lib/manuscript/ingest/parseUpload', () => {
  const actual = jest.requireActual('@/lib/manuscript/ingest/parseUpload');
  return { ...actual, parseUpload: jest.fn() };
});
jest.mock('@/lib/manuscript/source/arrivals', () => ({
  recordArtifactArrival: jest.fn(async () => ({ id: 'arrival-fictional-1' })),
}));

import { POST } from '../route';
import { SOURCE_UPLOAD_IDEMPOTENCY_HEADER } from '@/lib/writersStudio/sourceUploadAttempt';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { deriveVerifiedAccess } from '@/lib/auth/verifiedAccess';
import { parseUpload } from '@/lib/manuscript/ingest/parseUpload';
import { recordArtifactArrival } from '@/lib/manuscript/source/arrivals';

const parse = parseUpload as jest.Mock;
const record = recordArtifactArrival as jest.Mock;
const beta = writersStudioBetaAccess as jest.Mock;
const memberOf = getMemberIdFromRequest as jest.Mock;
const access = deriveVerifiedAccess as jest.Mock;

const KEY = '30000000-0000-4000-8000-000000000001';
let memberSeq = 0;
/** A fresh member per test so the in-memory rate budget of one test never leaks into another. */
function actAs(id: string) {
  memberOf.mockResolvedValue(id);
  access.mockResolvedValue({ authenticated: true, tier: 'free', roles: [], memberId: id, reason: null });
}
function request(headers: Record<string, string | null> = {}): NextRequest {
  const form = new FormData();
  form.append('file', new File([Buffer.from('fictional file bytes')], 'fictional.txt', { type: 'text/plain' }));
  const h = new Headers({ [SOURCE_UPLOAD_IDEMPOTENCY_HEADER]: KEY, 'x-maia-sanctuary': 'false' });
  for (const [k, v] of Object.entries(headers)) { if (v === null) h.delete(k); else h.set(k, v); }
  return new NextRequest('http://localhost/api/sovereign/manuscripts/ingest', { method: 'POST', headers: h, body: form });
}

const envRef = process.env as Record<string, string | undefined>;
let savedProvider: string | undefined;
beforeEach(() => {
  jest.clearAllMocks();
  // The route refuses before storing anything when no key provider is configured; these tests drive it as a configured process.
  savedProvider = envRef.WRITER_SOURCE_KEY_PROVIDER;
  envRef.WRITER_SOURCE_KEY_PROVIDER = 'local-test';
  memberSeq += 1;
  actAs(`aaaaaaaa-aaaa-4aaa-8aaa-${String(memberSeq).padStart(12, '0')}`);
  beta.mockResolvedValue({ eligible: true, basis: 'active_beta_tester' });
  parse.mockResolvedValue({ text: 'Fictional readable text.', format: 'text', warnings: [], fidelity: null });
  record.mockResolvedValue({ id: 'arrival-fictional-1' });
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});
afterEach(() => {
  jest.restoreAllMocks();
  if (savedProvider === undefined) delete envRef.WRITER_SOURCE_KEY_PROVIDER; else envRef.WRITER_SOURCE_KEY_PROVIDER = savedProvider;
});

it('sanity: an eligible member with explicit ordinary posture and readable text is accepted and its original is recorded', async () => {
  const res = await POST(request());
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.sourceArrivalId).toBe('arrival-fictional-1');
  expect(record).toHaveBeenCalledTimes(1);
});

describe('D-01 — a released route with no key provider configured refuses honestly, before creating anything', () => {
  const unconfigure = () => { delete envRef.WRITER_SOURCE_KEY_PROVIDER; };

  it('answers 503 source_intake_not_configured, NOT retryable, with a true sentence; reads no body, parses nothing, stores nothing', async () => {
    unconfigure();
    const res = await POST(request());
    expect(res.status).toBe(503);
    expect(res.headers.get('cache-control')).toBe('no-store');
    const body = await res.json();
    expect(body).toMatchObject({ code: 'source_intake_not_configured', retryable: false });
    expect(body.error).toContain('Nothing was sent or saved');
    expect(body.error).toContain('paste your writing');
    expect(body.error).not.toMatch(/retry|try again/i); // a retry of this can never work, so it is not offered
    expect(parse).not.toHaveBeenCalled();
    expect(record).not.toHaveBeenCalled(); // no landing intent, no stranded row
  });

  it.each([
    ['the provider is unknown', 'gcp-kms'],
    ['aws-kms is named but the key ARN and region are not', 'aws-kms'],
  ])('also refuses when %s', async (_n, provider) => {
    envRef.WRITER_SOURCE_KEY_PROVIDER = provider;
    const keep = [envRef.WRITER_SOURCE_KMS_KEY_ARN, envRef.WRITER_SOURCE_KMS_REGION, envRef.AWS_REGION, envRef.AWS_DEFAULT_REGION];
    delete envRef.WRITER_SOURCE_KMS_KEY_ARN; delete envRef.WRITER_SOURCE_KMS_REGION; delete envRef.AWS_REGION; delete envRef.AWS_DEFAULT_REGION;
    try {
      const res = await POST(request());
      expect(res.status).toBe(503);
      expect(record).not.toHaveBeenCalled();
    } finally {
      const names = ['WRITER_SOURCE_KMS_KEY_ARN', 'WRITER_SOURCE_KMS_REGION', 'AWS_REGION', 'AWS_DEFAULT_REGION'];
      names.forEach((n, i) => { if (keep[i] === undefined) delete envRef[n]; else envRef[n] = keep[i]; });
    }
  });

  it('tells a member nothing about the configuration until they have passed the audience gate: a non-roster member still gets 403', async () => {
    unconfigure();
    beta.mockResolvedValue({ eligible: false, basis: 'not_in_pilot' });
    const res = await POST(request());
    expect(res.status).toBe(403);
    expect((await res.json()).code).toBeUndefined();
  });

  it('is checked AFTER posture: a Sanctuary request is refused as Sanctuary, and a missing posture claim as 428, whatever the configuration', async () => {
    unconfigure();
    const sanctuary = await POST(request({ 'x-maia-sanctuary': 'true' }));
    expect(sanctuary.status).toBe(423);
    expect((await sanctuary.json()).code).toBe('sanctuary_unavailable');
    const missing = await POST(request({ 'x-maia-sanctuary': null }));
    expect(missing.status).toBe(428);
  });

  it('is checked BEFORE the body: an unconfigured process refuses a request that has no retry identifier with the configuration answer', async () => {
    unconfigure();
    const res = await POST(request({ [SOURCE_UPLOAD_IDEMPOTENCY_HEADER]: null }));
    expect(res.status).toBe(503);
  });

  it('a configured process is unaffected: the same request is accepted and recorded', async () => {
    const res = await POST(request());
    expect(res.status).toBe(200);
    expect(record).toHaveBeenCalledTimes(1);
  });
});

describe('D1 — audience', () => {
  it('refuses a signed-in member who is not in the Writer pilot, before the body is read or anything is stored', async () => {
    beta.mockResolvedValue({ eligible: false, basis: 'not_in_pilot' });
    const res = await POST(request());
    expect(res.status).toBe(403);
    expect(parse).not.toHaveBeenCalled();
    expect(record).not.toHaveBeenCalled();
    expect(beta).toHaveBeenCalledWith(expect.stringMatching(/^aaaaaaaa-/)); // asked about THIS member
  });

  it('fails closed when the roster lookup itself fails (never reads an error as "allowed")', async () => {
    beta.mockRejectedValue(new Error('fictional database fault'));
    const res = await POST(request());
    expect(res.status).toBeGreaterThanOrEqual(500);
    expect(record).not.toHaveBeenCalled();
  });

  it('rate-limits one member after 20 attempts in an hour, without affecting another member', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 21; i++) statuses.push((await POST(request())).status);
    expect(statuses.slice(0, 20).every((s) => s === 200)).toBe(true);
    expect(statuses[20]).toBe(429);
    actAs('bbbbbbbb-bbbb-4bbb-8bbb-000000000099');
    expect((await POST(request())).status).toBe(200);
  });
});

describe('D6 — Sanctuary and posture', () => {
  it('refuses Sanctuary before the body is read', async () => {
    const res = await POST(request({ 'x-maia-sanctuary': 'true' }));
    expect(res.status).toBe(423);
    expect((await res.json()).code).toBe('sanctuary_unavailable');
    expect(parse).not.toHaveBeenCalled();
    expect(record).not.toHaveBeenCalled();
  });

  it.each([[null], [''], ['yes'], ['1'], ['TRUE'], ['undefined']])(
    'fails closed on a missing or malformed posture (%s): it is never read as ordinary',
    async (value) => {
      const res = await POST(request({ 'x-maia-sanctuary': value }));
      expect(res.status).toBe(428);
      expect((await res.json()).code).toBe('posture_required');
      expect(parse).not.toHaveBeenCalled();
      expect(record).not.toHaveBeenCalled();
    },
  );
});

describe('D3 — text that cannot be stored is refused before anything is stored', () => {
  it.each([
    ['empty', '', 'no_readable_text'],
    ['whitespace only', '  \n\t  \r\n ', 'no_readable_text'],
    ['a NUL byte', 'before\u0000after', 'unstorable_characters'],
    ['UTF-16 decoded as UTF-8 (NUL between letters)', 'h\u0000e\u0000l\u0000l\u0000o\u0000', 'unstorable_characters'],
  ])('%s: 422 with a clear reason, and custody is never reached', async (_name, text, code) => {
    parse.mockResolvedValue({ text, format: 'text', warnings: [], fidelity: null });
    const res = await POST(request());
    expect(res.status).toBe(422);
    expect((await res.json()).code).toBe(code);
    expect(record).not.toHaveBeenCalled();
  });

  it('does not refuse ordinary text that merely contains unusual but storable characters', async () => {
    parse.mockResolvedValue({ text: 'Naïve café — “quoted” 漢字 \u{1F600}', format: 'text', warnings: [], fidelity: null });
    const res = await POST(request());
    expect(res.status).toBe(200);
    expect(record).toHaveBeenCalledTimes(1);
  });
});
