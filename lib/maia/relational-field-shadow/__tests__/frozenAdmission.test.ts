import { renderCurrentTurnBasisEnvelope } from '../../../../scripts/research/structural-standing/current-turn-basis-envelope';
import { StandingEnvelopeRefused, type StandingEvidence } from '../../../../scripts/research/structural-standing/standing-envelope';

const evidence: StandingEvidence[] = [
  { id: 'E1', text: 'earlier', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
  { id: 'E2', text: 'current', authoredBy: 'member', participationClass: 'authored', authority: 'situate' },
];

describe('SH-F6 frozen admission behavior', () => {
  test('lawful synthesis renders provisional with lineage-not-entailment', () => {
    const out = renderCurrentTurnBasisEnvelope(evidence, {
      synthesis: [{ text: 'a possible pattern is taking shape', basisEvidenceIds: ['E1', 'E2'] }],
      question: 'what feels newly open?',
    }, 'E2');
    expect(out.trace.currentTurn.evidenceId).toBe('E2');
    expect(out.trace.synthesis[0].standing).toBe('maia_provisional');
    expect(out.trace.synthesis[0].basisSemantics).toBe('lineage_not_entailment');
  });

  test('borrowed first-person synthesis refuses rather than being repaired', () => {
    expect(() => renderCurrentTurnBasisEnvelope(evidence, {
      synthesis: [{ text: 'as if to say, I see you', basisEvidenceIds: ['E2'] }],
      question: 'what opens?',
    }, 'E2')).toThrow(StandingEnvelopeRefused);
    try {
      renderCurrentTurnBasisEnvelope(evidence, {
        synthesis: [{ text: 'as if to say, I see you', basisEvidenceIds: ['E2'] }], question: 'what opens?',
      }, 'E2');
    } catch (err) {
      expect((err as StandingEnvelopeRefused).code).toBe('borrowed_first_person');
    }
  });
});
