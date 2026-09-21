import {
  buildRelationalFieldShadowRequest,
  epistemicJoinIntegrationShadowEnabled,
  evaluateRelationalFieldEpistemicShadow,
} from '../relationalField';

const input = {
  memberId: 'member-1',
  modelName: 'qwen-shadow',
  architectureVersion: 'rf-shadow-test',
  packet: {
    packetDigest: 'packet-digest',
    evidence: [
      { id: 'E1', text: 'I keep returning to this question.', authoredBy: 'member' },
      { id: 'E2', text: 'Today I want to stay with it.', authoredBy: 'member' },
    ],
  },
  plan: {
    synthesis: [{
      text: 'A recurring concern may be taking shape.',
      basisEvidenceIds: ['E1', 'E2'],
    }],
  },
} as const;

describe('I4 relational-field epistemic integration shadow', () => {
  it('is default OFF and only literal 1 enables it', () => {
    expect(epistemicJoinIntegrationShadowEnabled({})).toBe(false);
    expect(epistemicJoinIntegrationShadowEnabled({ MAIA_EPISTEMIC_JOIN_INTEGRATION_SHADOW: 'true' })).toBe(false);
    expect(epistemicJoinIntegrationShadowEnabled({ MAIA_EPISTEMIC_JOIN_INTEGRATION_SHADOW: '1' })).toBe(true);
  });

  it('returns null without evaluating while OFF', () => {
    expect(evaluateRelationalFieldEpistemicShadow({ ...input, env: {} })).toBeNull();
  });
  it('maps an existing MAIA provisional synthesis only to candidate hypothesis standing', () => {
    const request = buildRelationalFieldShadowRequest(input, 0);
    expect(request.requestedStanding).toBe('CANDIDATE_UNESTABLISHED');
    expect(request.envelope.operation).toBe('HYPOTHESIZE');
    expect(request.envelope.claimedSemantics).toEqual([]);
    expect(request.warrants).toEqual([]);
    expect(request.envelope.offeredWarrantRefs).toEqual([]);
    expect(request.envelope.jurisdiction).toBe('maia_conversational_inquiry');
    expect(request.envelope.boundaries[0]?.statement).toMatch(/lineage only/i);
  });

  it('evaluates candidate standing and emits structural telemetry only', () => {
    const telemetry = evaluateRelationalFieldEpistemicShadow({
      ...input,
      env: { MAIA_EPISTEMIC_JOIN_INTEGRATION_SHADOW: '1' },
    });
    expect(telemetry).toEqual({
      status: 'evaluated',
      proposalCount: 1,
      evaluatedCount: 1,
      admittedStandingCounts: { CANDIDATE_UNESTABLISHED: 1 },
      refusalCodeCounts: {},
      representationClosed: true,
      errorCount: 0,
    });
    const serialized = JSON.stringify(telemetry);
    expect(serialized).not.toContain('recurring concern');
    expect(serialized).not.toContain('I keep returning');
    expect(serialized).not.toContain('member-1');
    expect(serialized).not.toContain('E1');
  });

  it('does not force a single-source synthesis into a semantic join', () => {
    const telemetry = evaluateRelationalFieldEpistemicShadow({
      ...input,
      env: { MAIA_EPISTEMIC_JOIN_INTEGRATION_SHADOW: '1' },
      plan: { synthesis: [{ text: 'Maybe.', basisEvidenceIds: ['E1'] }] },
    });
    expect(telemetry).toEqual({
      status: 'evaluated',
      proposalCount: 0,
      evaluatedCount: 0,
      admittedStandingCounts: {},
      refusalCodeCounts: {},
      representationClosed: true,
      errorCount: 0,
    });
  });

  it('fails the shadow structurally instead of inventing missing evidence or authorship', () => {
    const telemetry = evaluateRelationalFieldEpistemicShadow({
      ...input,
      env: { MAIA_EPISTEMIC_JOIN_INTEGRATION_SHADOW: '1' },
      packet: {
        packetDigest: 'packet-digest',
        evidence: [
          { id: 'E1', text: 'computed content', authoredBy: 'system' },
          { id: 'E2', text: 'member content', authoredBy: 'member' },
        ],
      },
      plan: { synthesis: [{ text: 'Maybe.', basisEvidenceIds: ['E1', 'E2'] }] },
    });
    expect(telemetry).toMatchObject({
      status: 'error',
      proposalCount: 1,
      evaluatedCount: 0,
      errorCount: 1,
      representationClosed: true,
    });
  });
});
