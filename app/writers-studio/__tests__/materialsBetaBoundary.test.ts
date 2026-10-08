/** @jest-environment node */
import { NextRequest } from 'next/server';
import { POST as upload } from '@/app/api/writers-studio/sources/route';
import { POST as attach } from '@/app/api/sovereign/living-works/[id]/materials/route';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
import { ingestWorkbenchUpload } from '@/lib/workbench/intake';
import { query, transaction } from '@/lib/db/postgres';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/writersStudio/betaAccessServer', () => ({ writersStudioBetaAccess: jest.fn() }));
jest.mock('@/lib/workbench/intake', () => ({ ingestWorkbenchUpload: jest.fn(), IntakeError: class IntakeError extends Error {} }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), transaction: jest.fn() }));
const auth = getMemberIdFromRequest as jest.Mock;
const eligible = writersStudioBetaAccess as jest.Mock;
const ingestion = ingestWorkbenchUpload as jest.Mock;
const db = query as jest.Mock;
const tx = transaction as jest.Mock;
const ctx = { params: Promise.resolve({ id: 'work-1' }) };

beforeEach(() => {
  jest.clearAllMocks();
  auth.mockResolvedValue('member-1');
  eligible.mockResolvedValue({ eligible: false, basis: 'not_in_pilot' });
});

test('non-beta member is refused before reading upload or persisting source', async () => {
  const req = new NextRequest('http://localhost/api/writers-studio/sources', { method: 'POST' });
  const response = await upload(req);
  expect(response.status).toBe(403);
  expect(eligible).toHaveBeenCalledWith('member-1');
  expect(ingestion).not.toHaveBeenCalled();
  expect(db).not.toHaveBeenCalled();
});

test('unauthenticated source upload is refused without eligibility or ingestion', async () => {
  auth.mockResolvedValue(null);
  const response = await upload(new NextRequest('http://localhost/api/writers-studio/sources', { method: 'POST' }));
  expect(response.status).toBe(401);
  expect(eligible).not.toHaveBeenCalled();
  expect(ingestion).not.toHaveBeenCalled();
});

test('source-upload belonging refuses non-beta before any database access', async () => {
  const req = new NextRequest('http://localhost/api/sovereign/living-works/work-1/materials', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ materialType: 'source_upload', materialId: 'source-1' }),
  });
  const response = await attach(req, ctx);
  expect(response.status).toBe(403);
  expect(eligible).toHaveBeenCalledWith('member-1');
  expect(db).not.toHaveBeenCalled();
  expect(tx).not.toHaveBeenCalled();
});

test('existing manuscript belonging is not subjected to the beta-only gate', async () => {
  db.mockResolvedValue({ rows: [] });
  const req = new NextRequest('http://localhost/api/sovereign/living-works/work-1/materials', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ materialType: 'manuscript', materialId: 'manuscript-1' }),
  });
  const response = await attach(req, ctx);
  expect(response.status).toBe(404);
  expect(eligible).not.toHaveBeenCalled();
  expect(db).toHaveBeenCalled();
});
