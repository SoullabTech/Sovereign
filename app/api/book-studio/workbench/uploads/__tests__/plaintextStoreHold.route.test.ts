/**
 * D2 — the workbench upload route, EXECUTED: held in code once member intake is released, unchanged before.
 */
import { NextRequest } from 'next/server';

const FOUNDER = '11111111-1111-4111-8111-111111111111';

jest.mock('@/lib/founder/founderAuth', () => ({
  requireFounder: jest.fn(async () => ({ ok: true, memberId: '11111111-1111-4111-8111-111111111111' })),
}));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(async () => ({ rows: [{ id: 'upload-1' }] })) }));
jest.mock('@/lib/workbench/storage', () => ({
  writeOriginal: jest.fn(async () => 'rel/path'), writeReviewed: jest.fn(), writeDraft: jest.fn(),
  extFromName: jest.fn(() => 'txt'), deleteUpload: jest.fn(), originalPath: jest.fn(() => '/nowhere'),
}));
jest.mock('@/lib/workbench/extract/text', () => ({ extractText: jest.fn(async () => 'fictional text') }));
jest.mock('@/lib/workbench/extract/docx', () => ({ extractDocx: jest.fn() }));
jest.mock('@/lib/workbench/extract/pdf', () => ({ extractPdf: jest.fn() }));
jest.mock('@/lib/writersStudio/releaseAuthority', () => ({ writerReleaseAuthority: jest.fn() }));

import { POST } from '../route';
import { requireFounder } from '@/lib/founder/founderAuth';
import { query } from '@/lib/db/postgres';
import { writeOriginal } from '@/lib/workbench/storage';
import { writerReleaseAuthority } from '@/lib/writersStudio/releaseAuthority';

const founder = requireFounder as jest.Mock;
const authority = writerReleaseAuthority as jest.Mock;

function upload(): NextRequest {
  const form = new FormData();
  form.append('file', new File([Buffer.from('fictional')], 'fictional.txt', { type: 'text/plain' }));
  return new NextRequest('http://localhost/api/book-studio/workbench/uploads', { method: 'POST', body: form });
}
function notMultipart(): NextRequest {
  return new NextRequest('http://localhost/api/book-studio/workbench/uploads', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}',
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  founder.mockResolvedValue({ ok: true, memberId: FOUNDER });
  authority.mockReturnValue({ sourceIntakeReleased: false });
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => jest.restoreAllMocks());

describe('while member intake is held (today): behaviour is unchanged', () => {
  it('a founder upload still proceeds to storage', async () => {
    const res = await POST(upload());
    expect(res.status).toBe(200);
    expect(writeOriginal).toHaveBeenCalledTimes(1);
  });
  it('the request is still read as a form (the hold has not intervened)', async () => {
    const res = await POST(notMultipart());
    expect(res.status).toBe(400);
  });
});

describe('once member intake is released: the plaintext store is held in code', () => {
  beforeEach(() => authority.mockReturnValue({ sourceIntakeReleased: true }));

  it('answers 423 before the body is read, before any row is written and before any byte is stored', async () => {
    const res = await POST(upload());
    expect(res.status).toBe(423);
    expect(await res.json()).toMatchObject({ code: 'workbench_plaintext_store_held' });
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(query).not.toHaveBeenCalled();
    expect(writeOriginal).not.toHaveBeenCalled();
  });

  it('holds even for a body that would otherwise be refused as malformed (the hold precedes parsing)', async () => {
    const res = await POST(notMultipart());
    expect(res.status).toBe(423);
  });

  it('identity still comes first: a non-founder gets the auth answer, not a hold notice', async () => {
    founder.mockResolvedValue({ ok: false, error: 'Forbidden', status: 403 });
    const res = await POST(upload());
    expect(res.status).toBe(403);
    expect(query).not.toHaveBeenCalled();
  });

  it('fails closed when the manifest value is malformed', async () => {
    authority.mockReturnValue({ sourceIntakeReleased: undefined });
    const res = await POST(upload());
    expect(res.status).toBe(423);
    expect(writeOriginal).not.toHaveBeenCalled();
  });
});
