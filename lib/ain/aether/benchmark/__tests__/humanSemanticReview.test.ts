import {
  buildHumanSemanticReviewPacket,
  captureHumanSemanticReview,
  validateHumanSemanticReviewPacket,
} from '../humanSemanticReview';

describe('AIN-AETHER-01R12 human semantic adjudication packet',()=>{
  test('builds five review cards from the frozen R11 witness',()=>{
    const packet=buildHumanSemanticReviewPacket();
    expect(packet.cards).toHaveLength(5);
    expect(packet.parentR11).toBe('45b88f9c71dc72be113416a1d74b303c8e1ca532');
    expect(packet.sourceMachineEvidenceMutable).toBe(false);
    expect(validateHumanSemanticReviewPacket(packet)).toEqual({valid:true,errors:[]});
  });

  test('cards expose field, relations, gestalt, utterance, provenance, uncertainty, and review choices',()=>{
    const packet=buildHumanSemanticReviewPacket();
    const admitted=packet.cards.find(c=>c.machineDecision==='admit')!;
    expect(admitted.representedField.length).toBeGreaterThan(0);
    expect(admitted.relationSummary.length).toBeGreaterThan(0);
    expect(admitted.utterance.length).toBeGreaterThan(0);
    expect(admitted.whyThisReflection).not.toBeNull();
    expect(admitted.uncertainty).not.toBeNull();
    expect(admitted.memberCheck).not.toBeNull();
    expect(admitted.adjudicationOptions).toContain('semantically_faithful');
    expect(admitted.reviewQuestions.length).toBeGreaterThan(0);
  });

  test('refused case remains reviewable without fabricated provenance',()=>{
    const packet=buildHumanSemanticReviewPacket();
    const refused=packet.cards.find(c=>c.caseRef==='H05')!;
    expect(refused.machineDecision).toBe('refuse');
    expect(refused.whyThisReflection).toBeNull();
    expect(refused.machineErrors).toContain('unsupported_related_pair:family::body');
    expect(refused.adjudicationOptions).toContain('appropriate_refusal');
  });

  test('human review is captured as append-only evidence',()=>{
    const packet=buildHumanSemanticReviewPacket();
    const record=captureHumanSemanticReview(packet,{
      caseRef:'H01',
      adjudication:'useful_but_incomplete',
      correctionNote:'The comparison is grounded, but it misses the bodily recurrence as important context.',
      correctedReflection:'Work appears to be dissolving while Relationship converges, with Body recurrence remaining an important third movement.',
    });
    expect(record.reviewer).toBe('human');
    expect(record.sourceMachineEvidenceMutated).toBe(false);
    expect(record.frozenMachineEvidenceRef).toBe(packet.frozenMachineWitnessRef);
  });

  test('human review requires a real adjudication note',()=>{
    const packet=buildHumanSemanticReviewPacket();
    expect(()=>captureHumanSemanticReview(packet,{
      caseRef:'H02',
      adjudication:'semantically_faithful',
      correctionNote:'   ',
    })).toThrow('HUMAN_REVIEW_NOTE_REQUIRED');
  });
});
