jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));

import { query } from '@/lib/db/postgres';
import { persistRelationalFieldShadowEvidence } from '../evidenceStore';

const mockQuery = query as jest.Mock;

describe('SH-F5 dedicated paired evidence store', () => {
  beforeEach(() => mockQuery.mockReset().mockResolvedValue({ rows: [] }));

  test('persists exact primary pair, provenance digests, shadow result and no member id', async () => {
    await persistRelationalFieldShadowEvidence({
      turnId: 9,
      exchangeId: 'ex9',
      architectureVersion: 'rf-shadow-01@test',
      modelName: 'qwen3:32b',
      deterministicSeed: 17,
      status: 'rendered',
      processingProfile: 'CORE',
      originRoute: '/api/sovereign/app/maia/list',
      primaryStage: 'sovereign_list_pre_http_return',
      primaryResponseSha256: 'primary-digest',
      primaryResponseText: 'exact route primary',
      currentEvidenceId: 'E2',
      evidenceManifest: [{
        evidenceId: 'E2', sourceKind: 'current_request', sourceRowId: null,
        exchangeId: 'ex9', contentSha256: 'member-digest', createdAt: null, current: true,
      }],
      packetDigest: 'packet-digest',
      promptSha256: 'prompt-digest',
      basisEvidenceIds: ['E2'],
      rawPlan: { synthesis: [{ text: 'possible pattern', basisEvidenceIds: ['E2'] }], question: 'what opens?' },
      rawPlanSha256: 'plan-digest',
      shadowResponseText: 'shadow output',
      renderedDigest: 'rendered-digest',
      totalMs: 44,
      generationMs: 31,
    });
    expect(mockQuery).toHaveBeenCalledTimes(1);
    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain('INSERT INTO maia_relational_field_shadow_runs');
    expect(sql).toContain('primary_response_text');
    expect(sql).toContain('packet_digest');
    expect(sql).toContain('prompt_sha256');
    expect(params).toHaveLength(24);
    expect(params).toContain('exact route primary');
    expect(params).toContain('packet-digest');
    expect(params).toContain('prompt-digest');
    expect(JSON.stringify(params)).not.toContain('member-1');
  });
});
