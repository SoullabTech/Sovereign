/** @jest-environment node */
/** Source-writing overlap must stay sealed even when Caddy is bypassed.
 * No database or filesystem writes: all writers and extractors are mocked.
 */
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/writersStudio/betaAccessServer', () => ({ writersStudioBetaAccess: jest.fn() }));
jest.mock('@/lib/founder/founderAuth', () => ({ requireFounder: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), transaction: jest.fn() }));
jest.mock('@/lib/workbench/intake', () => ({
  IntakeError: class IntakeError extends Error { status = 400; },
  ingestWorkbenchUpload: jest.fn(),
}));
jest.mock('@/lib/workbench/storage', () => ({
  writeOriginal: jest.fn(), writeReviewed: jest.fn(), writeDraft: jest.fn(),
  originalPath: jest.fn(), extFromName: jest.fn(), deleteUpload: jest.fn(),
}));
jest.mock('@/lib/workbench/extract/text', () => ({ extractText: jest.fn() }));
jest.mock('@/lib/workbench/extract/docx', () => ({ extractDocx: jest.fn() }));
jest.mock('@/lib/workbench/extract/pdf', () => ({ extractPdf: jest.fn() }));

import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
import { requireFounder } from '@/lib/founder/founderAuth';
import { query } from '@/lib/db/postgres';
import { ingestWorkbenchUpload } from '@/lib/workbench/intake';
import { writeOriginal, writeReviewed, writeDraft } from '@/lib/workbench/storage';
import { sourceUploadPostureAuthorized, sourceReviewedEditAuthorized } from '@/lib/workbench/uploadPostureAuthority';
import { POST as studioPost } from '@/app/api/writers-studio/sources/route';
import { PATCH as studioPatch } from '@/app/api/writers-studio/sources/[id]/route';
import { POST as founderPost } from '@/app/api/book-studio/workbench/uploads/route';
import { PATCH as founderPatch } from '@/app/api/book-studio/workbench/uploads/[id]/route';

const memberId = '00000000-0000-4000-8000-000000000001';
const sourceId = '00000000-0000-4000-8000-000000000002';
const sourceCtx = { params: Promise.resolve({ id: sourceId }) };
const req = (path: string, method: string, body?: unknown) =>
  new NextRequest('http://localhost' + path, {
    method,
    ...(body === undefined ? {} : {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  });

beforeEach(() => {
  jest.clearAllMocks();
  (getMemberIdFromRequest as jest.Mock).mockResolvedValue(memberId);
  (writersStudioBetaAccess as jest.Mock).mockResolvedValue({ eligible: true, basis: 'synthetic_beta' });
  (requireFounder as jest.Mock).mockResolvedValue({ ok: true, memberId });
});

afterEach(() => {
  expect(query).not.toHaveBeenCalled();
  expect(ingestWorkbenchUpload).not.toHaveBeenCalled();
  expect(writeOriginal).not.toHaveBeenCalled();
  expect(writeReviewed).not.toHaveBeenCalled();
  expect(writeDraft).not.toHaveBeenCalled();
});

it('the only source authority remains separately closed for uploads and reviewed edits', () => {
  expect(sourceUploadPostureAuthorized()).toBe(false);
  expect(sourceReviewedEditAuthorized()).toBe(false);
});
it('unauthenticated Studio source POST refuses before beta access or persistence', async () => {
  (getMemberIdFromRequest as jest.Mock).mockResolvedValue(null);
  const res = await studioPost(req('/api/writers-studio/sources', 'POST'));
  expect(res.status).toBe(401);
  expect(writersStudioBetaAccess).not.toHaveBeenCalled();
});
it('non-beta source POST is denied before parsing the body', async () => {
  (writersStudioBetaAccess as jest.Mock).mockResolvedValue({ eligible: false, basis: 'not_admitted' });
  const res = await studioPost(req('/api/writers-studio/sources', 'POST'));
  expect(res.status).toBe(403);
});
it('admitted beta source POST stays 423 before multipart parsing or filesystem calls', async () => {
  const res = await studioPost(req('/api/writers-studio/sources', 'POST'));
  expect(res.status).toBe(423);
});
it('Studio reviewed source PATCH stays 423 before reading the JSON body', async () => {
  const res = await studioPatch(req('/api/writers-studio/sources/' + sourceId, 'PATCH', { transcription: 'synthetic private text' }), sourceCtx);
  expect(res.status).toBe(423);
});
it('founder Workbench POST stays 423 even with full founder authority', async () => {
  const res = await founderPost(req('/api/book-studio/workbench/uploads', 'POST'));
  expect(res.status).toBe(423);
});
it('founder Workbench PATCH refuses both transcription and Sanctuary metadata changes', async () => {
  const res = await founderPatch(req('/api/book-studio/workbench/uploads/' + sourceId, 'PATCH', {
    transcription_reviewed: 'synthetic content', sanctuary: true,
  }), sourceCtx);
  expect(res.status).toBe(423);
});
it('founder authorization is still required before Workbench source decisions', async () => {
  (requireFounder as jest.Mock).mockResolvedValue({ ok: false, error: 'Forbidden', status: 403 });
  expect((await founderPost(req('/api/book-studio/workbench/uploads', 'POST'))).status).toBe(403);
  expect((await founderPatch(req('/api/book-studio/workbench/uploads/' + sourceId, 'PATCH'), sourceCtx)).status).toBe(403);
});
