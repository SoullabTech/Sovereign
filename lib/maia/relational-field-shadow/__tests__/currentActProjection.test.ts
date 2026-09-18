import { assembleRelationalFieldPacket } from '../fieldAssembler';
import { buildCurrentActProjection, proposeOrdinaryRelation } from '../currentActProjection';

describe('H8 current-act shadow projection', () => {
  test('ordinary relation proposals are conservative and deterministic', () => {
    expect(proposeOrdinaryRelation('Do not persist this outside Sanctuary.')).toBe('PROHIBITION');
    expect(proposeOrdinaryRelation('We need to keep the direct answer in slot one.')).toBe('REQUIREMENT');
    expect(proposeOrdinaryRelation('I changed my mind; use the newer wording.')).toBe('CORRECTION');
    expect(proposeOrdinaryRelation('The cedar image was on my mind yesterday.')).toBe('HISTORY');
  });

  test('direct answer anchors slot one while materially necessary context fills remaining slots', () => {
    const packet = assembleRelationalFieldPacket({
      exchangeId: 'x4',
      userInput: 'Can this be saved during Sanctuary?',
      priorMemberTurns: [
        { id: '11', exchangeId: 'x1', content: 'Do not save Sanctuary material.', createdAt: '2026-09-17T12:00:00Z' },
        { id: '12', exchangeId: 'x2', content: 'During Sanctuary we need to fail closed before anything can persist.', createdAt: '2026-09-17T12:01:00Z' },
        { id: '13', exchangeId: 'x3', content: 'Yesterday I was thinking about the silver cedar.', createdAt: '2026-09-17T12:02:00Z' },
      ],
    });
    const projection = buildCurrentActProjection(packet);
    expect(projection.projectionStatus).toBe('projected');
    expect(projection.anchorEvidenceId).toBe('E1');
    expect(projection.selectedEvidenceIds[0]).toBe('E1');
    expect(projection.selectedEvidenceIds).toContain('E2');
    expect(projection.candidates.find((c) => c.evidenceId === 'E2')).toMatchObject({
      currentActRelation: 'REQUIRES_FOR_CURRENT_ACT',
      materialityClass: 'REQUIRED_FOR_VALIDITY',
    });
    expect(projection.selectedEvidenceIds).not.toContain(packet.currentEvidenceId);
  });

  test('same packet produces byte-stable projection digest', () => {
    const input = {
      exchangeId: 'x2',
      userInput: 'What is required before we ship this?',
      priorMemberTurns: [
        { id: '1', exchangeId: 'x1', content: 'We must verify the translation before shipping.', createdAt: '2026-09-17T12:00:00Z' },
      ],
    };
    const a = buildCurrentActProjection(assembleRelationalFieldPacket(input));
    const b = buildCurrentActProjection(assembleRelationalFieldPacket(input));
    expect(a).toEqual(b);
    expect(a.projectionDigest).toHaveLength(64);
  });

  test('no prior evidence yields a bounded abstention rather than invention', () => {
    const projection = buildCurrentActProjection(assembleRelationalFieldPacket({
      exchangeId: 'x1', userInput: 'hello', priorMemberTurns: [],
    }));
    expect(projection.projectionStatus).toBe('no_prior_evidence');
    expect(projection.selectedEvidenceIds).toEqual([]);
    expect(projection.anchorEvidenceId).toBeNull();
  });
});
