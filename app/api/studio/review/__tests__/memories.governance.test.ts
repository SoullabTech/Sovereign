/**
 * review/memories — surface filter (Increment 3B).
 *
 * Held MAIA-generated client representations must not surface even though they exist in
 * case_memories. Two-pass guard: content is loaded ONLY for surfaceable ids, so withheld
 * content can never reach the response payload.
 *
 * DB + auth mocked. The surface decision itself (maySurfaceRepresentation) is proven in
 * scripts/repro/client_representation_guard_proof.mts.
 *
 * Spec: docs/specs/CLIENT_REPRESENTATION_GOVERNANCE_PATCH_2026-06-25.md §2 (surface)
 */
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/scribe/scribeAuth', () => ({ getMemberIdFromRequest: jest.fn() }));

import { GET } from '../memories/route';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';

const mockQuery = query as jest.Mock;
const mockAuth = getMemberIdFromRequest as jest.Mock;

// Mixed governance rows (pass 1).
const GOV_ROWS = [
  { id: 'A', authorship: 'practitioner_authored', crossing_allowed: false }, // surfaces (own note)
  { id: 'B', authorship: 'maia_inferred', crossing_allowed: false },         // HELD → withheld
  { id: 'C', authorship: 'maia_inferred', crossing_allowed: true },          // surfaces (allowed)
];
const row = (id: string, content: string) => ({
  id, case_id: 'case-1', memory_type: 'pattern', content, significance: '0.80',
  facet_code: null, element_tags: null, source_session_id: 's', review_lens_id: 'lens',
  evidence_refs: null, source_candidate_id: 'c', formed_at: new Date(),
  session_title: null, session_started_at: null,
});
const CONTENT: Record<string, ReturnType<typeof row>> = {
  A: row('A', 'PRACTITIONER NOTE'),
  B: row('B', 'MAIA HELD SECRET'),
  C: row('C', 'MAIA ALLOWED'),
};

function wire(opts: { privacyMode: string; consentCapturedAt: Date | null }) {
  mockQuery.mockImplementation(async (sql: string, params?: unknown[]) => {
    if (sql.includes('FROM practitioner_cases'))
      return { rows: [{ id: 'case-1', privacy_mode: opts.privacyMode, consent_captured_at: opts.consentCapturedAt }], rowCount: 1 };
    if (sql.includes('cm.content')) { // pass 2 — content ONLY for requested ids
      const ids = (params?.[0] as string[]) ?? [];
      return { rows: ids.map((id) => CONTENT[id]).filter(Boolean), rowCount: ids.length };
    }
    if (sql.includes('case_memories')) return { rows: GOV_ROWS, rowCount: GOV_ROWS.length }; // pass 1
    return { rows: [], rowCount: 0 };
  });
}

const req = (caseId: string) => ({ url: `http://x/api/studio/review/memories?caseId=${caseId}` }) as never;

beforeEach(() => {
  mockQuery.mockReset();
  mockAuth.mockReset();
  mockAuth.mockResolvedValue('prac-1');
});

describe('review/memories — surface filter', () => {
  it('transparent case: practitioner_authored + crossing-allowed surface; held maia withheld; no held content in payload', async () => {
    wire({ privacyMode: 'transparent', consentCapturedAt: null });
    const res = await GET(req('case-1'));
    const body = await res.json();

    expect(body.memories.map((m: { id: string }) => m.id).sort()).toEqual(['A', 'C']);
    expect(body.withheld).toBe(1);
    const payload = JSON.stringify(body);
    expect(payload).not.toContain('MAIA HELD SECRET'); // withheld content never reaches payload
    expect(payload).toContain('PRACTITIONER NOTE');
    expect(payload).toContain('MAIA ALLOWED');
  });

  it('private case: ALL maia_* withheld (even crossing-allowed); only practitioner_authored surfaces', async () => {
    wire({ privacyMode: 'private', consentCapturedAt: null });
    const res = await GET(req('case-1'));
    const body = await res.json();

    expect(body.memories.map((m: { id: string }) => m.id)).toEqual(['A']);
    expect(body.withheld).toBe(2);
    const payload = JSON.stringify(body);
    expect(payload).not.toContain('MAIA HELD SECRET');
    expect(payload).not.toContain('MAIA ALLOWED'); // crossing-allowed maia withheld under private
    expect(payload).toContain('PRACTITIONER NOTE');
  });

  it('consent_based without captured consent: consent floor withholds everything', async () => {
    wire({ privacyMode: 'consent_based', consentCapturedAt: null });
    const res = await GET(req('case-1'));
    const body = await res.json();

    expect(body.memories).toHaveLength(0);
    expect(body.withheld).toBe(3);
    expect(JSON.stringify(body)).not.toContain('PRACTITIONER NOTE'); // even authored is withheld under unmet consent
  });
});
