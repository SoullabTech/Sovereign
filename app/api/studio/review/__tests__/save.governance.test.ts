/**
 * review/save — persist gate + governance stamp (Increment 3A).
 *
 * Proves the route enforces the Client Representation Governance at the persist boundary:
 *   - consent_based case with no captured consent ⇒ refuse, no INSERT
 *   - otherwise ⇒ INSERT stamps maia_inferred / accepted / crossing_allowed=FALSE (held)
 *     + consent snapshot + source_route. Accepted ≠ surfaceable.
 *
 * DB + auth mocked (also lets this run in CI without Postgres). The pure decisions are
 * additionally proven in scripts/repro/client_representation_guard_proof.mts.
 *
 * Spec: docs/specs/CLIENT_REPRESENTATION_GOVERNANCE_PATCH_2026-06-25.md §2 (persist)
 */
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/scribe/scribeAuth', () => ({ getMemberIdFromRequest: jest.fn() }));

import { POST } from '../save/route';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';

const mockQuery = query as jest.Mock;
const mockAuth = getMemberIdFromRequest as jest.Mock;

const CANDIDATE = {
  id: 'cand-1', session_id: 'sess-1', practitioner_id: 'prac-1', lens_id: 'shadow',
  memory_type: 'pattern', content: 'a MAIA-generated pattern', significance: '0.80',
  facet_code: null, element_tags: null, evidence_ref: null, promoted_at: null,
};

function wireDb(opts: { privacyMode: string; consentCapturedAt: Date | null }) {
  mockQuery.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM practitioner_cases'))
      return { rows: [{ id: 'case-1', privacy_mode: opts.privacyMode, consent_captured_at: opts.consentCapturedAt }], rowCount: 1 };
    if (sql.includes('FROM pending_review_candidates')) return { rows: [CANDIDATE], rowCount: 1 };
    if (sql.includes('FROM case_memories')) return { rows: [], rowCount: 0 };          // dup check
    if (sql.includes('INSERT INTO case_memories')) return { rows: [{ id: 'mem-1' }], rowCount: 1 };
    return { rows: [], rowCount: 0 };                                                   // promoted UPDATE etc.
  });
}

const req = (body: unknown) => ({ json: async () => body }) as never;

beforeEach(() => {
  mockQuery.mockReset();
  mockAuth.mockReset();
  mockAuth.mockResolvedValue('prac-1');
});

describe('review/save — persist gate + stamp', () => {
  it('consent_based + no captured consent ⇒ 403 CONSENT_REQUIRED, no INSERT', async () => {
    wireDb({ privacyMode: 'consent_based', consentCapturedAt: null });
    const res = await POST(req({ caseId: 'case-1', approvedCandidateIds: ['cand-1'] }));
    expect(res.status).toBe(403);
    const insertHappened = mockQuery.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO case_memories'));
    expect(insertHappened).toBe(false);
  });

  it('transparent case ⇒ INSERT stamps maia_inferred / accepted / crossing_allowed FALSE / consent snapshot', async () => {
    wireDb({ privacyMode: 'transparent', consentCapturedAt: null });
    const res = await POST(req({ caseId: 'case-1', approvedCandidateIds: ['cand-1'] }));
    expect(res.status).toBe(200);

    const insertCall = mockQuery.mock.calls.find(([sql]) => String(sql).includes('INSERT INTO case_memories'));
    expect(insertCall).toBeDefined();
    const [sql, params] = insertCall as [string, unknown[]];
    expect(sql).toContain("'accepted'");              // disposition (practitioner approved)
    expect(sql).toContain('FALSE');                   // crossing_allowed (held — NOT surfaceable)
    expect(sql).toContain("'studio/review/save'");    // source_route
    expect(params).toContain('maia_inferred');        // authorship
    expect(params).toContain('transparent');          // consent_basis snapshot
  });

  it('private case ⇒ 403 REPRESENTATION_NOT_PERMITTED, no INSERT (persist backstop)', async () => {
    wireDb({ privacyMode: 'private', consentCapturedAt: null });
    const res = await POST(req({ caseId: 'case-1', approvedCandidateIds: ['cand-1'] }));
    expect(res.status).toBe(403);
    const inserted = mockQuery.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO case_memories'));
    expect(inserted).toBe(false);
  });

  it('consent_based + captured consent ⇒ persists (gate satisfied)', async () => {
    wireDb({ privacyMode: 'consent_based', consentCapturedAt: new Date('2026-06-01') });
    const res = await POST(req({ caseId: 'case-1', approvedCandidateIds: ['cand-1'] }));
    expect(res.status).toBe(200);
    const insertHappened = mockQuery.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO case_memories'));
    expect(insertHappened).toBe(true);
  });
});
