/**
 * review/candidates — read-time surface guard (Patch 3).
 *
 * Pending candidates are MAIA inferences about the session's client. The guard resolves
 * the session's case posture (session→client→case, the WORKING link) and withholds ALL
 * candidates when the case forbids representation — skipping the content query entirely so
 * withheld content is never loaded. Closes the residual gap (case linked/flipped to private
 * after analyze created the candidates). Unlinked sessions proceed.
 *
 * Spec: docs/specs/CLIENT_REPRESENTATION_GOVERNANCE_PATCH_2026-06-25.md §2 (surface)
 */
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/scribe/scribeAuth', () => ({ getMemberIdFromRequest: jest.fn(), verifySessionOwnership: jest.fn() }));

import { GET } from '../candidates/route';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest, verifySessionOwnership } from '@/lib/scribe/scribeAuth';

const mockQuery = query as jest.Mock;
const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockOwn = verifySessionOwnership as jest.Mock;

const CANDIDATE = {
  id: 'cand-1', lens_id: 'shadow', memory_type: 'pattern', content: 'MAIA INFERENCE',
  significance: '0.80', facet_code: null, element_tags: null, evidence_ref: null,
  created_at: new Date(), expires_at: new Date(Date.now() + 1e6),
};

function wire(posture: { privacyMode: string; consentCapturedAt: Date | null } | null) {
  mockQuery.mockImplementation(async (sql: string) => {
    if (sql.includes('JOIN practitioner_cases')) // posture resolution
      return posture
        ? { rows: [{ privacy_mode: posture.privacyMode, consent_captured_at: posture.consentCapturedAt }], rowCount: 1 }
        : { rows: [], rowCount: 0 };
    if (sql.includes('pending_review_candidates')) return { rows: [CANDIDATE], rowCount: 1 }; // content
    return { rows: [], rowCount: 0 };
  });
}
const req = () => ({ url: 'http://x/api/studio/review/candidates?sessionId=sess-1' }) as never;

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.mockResolvedValue('prac-1');
  mockOwn.mockResolvedValue({ id: 'sess-1', client_id: 'c1' });
});

describe('review/candidates — read-time surface guard', () => {
  it('private case ⇒ all candidates withheld; content never loaded', async () => {
    wire({ privacyMode: 'private', consentCapturedAt: null });
    const body = await (await GET(req())).json();
    expect(body.withheld).toBe(true);
    expect(body.candidates).toHaveLength(0);
    expect(JSON.stringify(body)).not.toContain('MAIA INFERENCE');
    // the candidate content query is never reached
    expect(mockQuery.mock.calls.some(([sql]) => String(sql).includes('pending_review_candidates'))).toBe(false);
  });

  it('consent_based without consent ⇒ withheld', async () => {
    wire({ privacyMode: 'consent_based', consentCapturedAt: null });
    const body = await (await GET(req())).json();
    expect(body.withheld).toBe(true);
    expect(body.candidates).toHaveLength(0);
  });

  it('transparent ⇒ candidates surface', async () => {
    wire({ privacyMode: 'transparent', consentCapturedAt: null });
    const body = await (await GET(req())).json();
    expect(body.withheld).toBe(false);
    expect(body.candidates).toHaveLength(1);
    expect(JSON.stringify(body)).toContain('MAIA INFERENCE');
  });

  it('unlinked session (no case) ⇒ proceeds (candidates surface)', async () => {
    wire(null);
    const body = await (await GET(req())).json();
    expect(body.withheld).toBe(false);
    expect(body.candidates).toHaveLength(1);
  });

  it('no auth ⇒ 401', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET(req());
    expect(res.status).toBe(401);
  });
});
