/**
 * series/analyze — generate gate (Increment 3C, case-keyed route).
 *
 * Refuse BEFORE any LLM call when the case consent posture does not permit representation:
 *   private ⇒ 403 REPRESENTATION_NOT_PERMITTED · consent_based without consent ⇒ 403 CONSENT_REQUIRED.
 * transparent passes the gate. The LLM (generateSimple) must never run on refusal, so no
 * inference is generated and no candidate is created.
 *
 * Spec: docs/specs/CLIENT_REPRESENTATION_GOVERNANCE_PATCH_2026-06-25.md §2 (generate)
 */
const mockGenerate = jest.fn();
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/scribe/scribeAuth', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/studio/reviewLens', () => ({ isValidReviewLensId: () => true, REVIEW_LENS_REGISTRY: {} }));
jest.mock('@/lib/consciousness/LLMProvider', () => ({ getLLMProvider: () => ({ generateSimple: mockGenerate }) }));

import { POST } from '../series/analyze/route';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';

const mockQuery = query as jest.Mock;
const mockAuth = getMemberIdFromRequest as jest.Mock;

function wireCase(opts: { privacyMode: string; consentCapturedAt: Date | null }) {
  mockQuery.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM practitioner_cases'))
      return { rows: [{ id: 'case-1', privacy_mode: opts.privacyMode, consent_captured_at: opts.consentCapturedAt }], rowCount: 1 };
    return { rows: [], rowCount: 0 }; // sessions query → empty (route 404s past the gate)
  });
}
const req = (body: unknown) => ({ json: async () => body }) as never;
const BODY = { caseId: 'case-1', sessionIds: ['s1', 's2'], lenses: ['shadow'] };

beforeEach(() => {
  mockQuery.mockReset(); mockAuth.mockReset(); mockGenerate.mockReset();
  mockAuth.mockResolvedValue('prac-1');
});

describe('series/analyze — generate gate', () => {
  it('consent_based + no consent ⇒ 403 CONSENT_REQUIRED, LLM never called', async () => {
    wireCase({ privacyMode: 'consent_based', consentCapturedAt: null });
    const res = await POST(req(BODY));
    expect(res.status).toBe(403);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('private ⇒ 403 REPRESENTATION_NOT_PERMITTED, LLM never called', async () => {
    wireCase({ privacyMode: 'private', consentCapturedAt: null });
    const res = await POST(req(BODY));
    expect(res.status).toBe(403);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('transparent ⇒ passes the gate (not 403; proceeds to session check)', async () => {
    wireCase({ privacyMode: 'transparent', consentCapturedAt: null });
    const res = await POST(req(BODY));
    expect(res.status).not.toBe(403);
  });
});
