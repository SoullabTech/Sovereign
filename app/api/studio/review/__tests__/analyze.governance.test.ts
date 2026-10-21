/**
 * analyze — generate gate (Increment 3C, session-keyed route).
 *
 * analyze is session-keyed; it resolves the session's client case(s) via client_id and
 * refuses generation BEFORE any LLM call if a governed case refuses. Unlinked sessions
 * (no resolved case) proceed — the persist gate at save (3A) is the backstop.
 *
 * Spec: docs/specs/CLIENT_REPRESENTATION_GOVERNANCE_PATCH_2026-06-25.md §2 (generate)
 */
const mockGenerate = jest.fn();
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/scribe/scribeAuth', () => ({ getMemberIdFromRequest: jest.fn(), verifySessionOwnership: jest.fn() }));
jest.mock('@/lib/studio/reviewLens', () => ({ isValidReviewLensId: () => true, REVIEW_LENS_REGISTRY: {} }));
jest.mock('@/lib/consciousness/LLMProvider', () => ({ getLLMProvider: () => ({ generateSimple: mockGenerate }) }));

import { POST } from '../analyze/route';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest, verifySessionOwnership } from '@/lib/scribe/scribeAuth';

const mockQuery = query as jest.Mock;
const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockOwn = verifySessionOwnership as jest.Mock;

function wireGov(opts: { privacyMode: string; consentCapturedAt: Date | null }) {
  mockQuery.mockImplementation(async (sql: string) => {
    if (sql.includes('JOIN practitioner_cases')) // the session→client→case resolution
      return { rows: [{ privacy_mode: opts.privacyMode, consent_captured_at: opts.consentCapturedAt }], rowCount: 1 };
    return { rows: [], rowCount: 0 };
  });
}
const req = (body: unknown) => ({ json: async () => body }) as never;
const BODY = { sessionId: 'sess-1', lenses: ['shadow'] };

beforeEach(() => {
  mockQuery.mockReset(); mockAuth.mockReset(); mockOwn.mockReset(); mockGenerate.mockReset();
  mockAuth.mockResolvedValue('prac-1');
  mockOwn.mockResolvedValue({ id: 'sess-1' }); // session owned
});

describe('analyze — generate gate (client-linked sessions)', () => {
  it("linked client case private ⇒ 403 REPRESENTATION_NOT_PERMITTED, LLM never called", async () => {
    wireGov({ privacyMode: 'private', consentCapturedAt: null });
    const res = await POST(req(BODY));
    expect(res.status).toBe(403);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('linked client case consent_based + no consent ⇒ 403 CONSENT_REQUIRED, LLM never called', async () => {
    wireGov({ privacyMode: 'consent_based', consentCapturedAt: null });
    const res = await POST(req(BODY));
    expect(res.status).toBe(403);
    expect(mockGenerate).not.toHaveBeenCalled();
  });
});
