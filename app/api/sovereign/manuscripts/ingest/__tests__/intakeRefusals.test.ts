/**
 * D1 / D3 / D6 — the ingest route's refusals, EXECUTED (not read from source).
 *
 * The release manifest is mocked to RELEASED so the route can be driven past its module-load hold; every collaborator that
 * would touch a database, a vault or a parser is mocked, so each test can assert what was NOT called. The point of each
 * refusal is that it happens BEFORE anything is stored: the assertions on `parseUpload` and `recordArtifactArrival` are
 * the substance.
 *
 * Gate order exercised here: identity, hold (released here), audience, rate limit, posture, idempotency header, body,
 * parse, text refusal, custody.
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

jest.mock('@/lib/manuscript/source/duplicateImport', () => ({
  checkDuplicateImport: jest.fn(async () => ({ outcome: 'proceed' })),
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

beforeEach(() => {
  jest.clearAllMocks();
  memberSeq += 1;
  actAs(`aaaaaaaa-aaaa-4aaa-8aaa-${String(memberSeq).padStart(12, '0')}`);
  beta.mockResolvedValue({ eligible: true, basis: 'active_beta_tester' });
  parse.mockResolvedValue({ text: 'Fictional readable text.', format: 'text', warnings: [], fidelity: null });
  record.mockResolvedValue({ id: 'arrival-fictional-1' });
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});
afterEach(() => jest.restoreAllMocks());

it('sanity: an eligible member with explicit ordinary posture and readable text is accepted and its original is recorded', async () => {
  const res = await POST(request());
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.sourceArrivalId).toBe('arrival-fictional-1');
  expect(record).toHaveBeenCalledTimes(1);
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
