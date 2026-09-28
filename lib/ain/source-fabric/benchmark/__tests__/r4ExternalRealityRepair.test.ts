import { evidenceSufficiency, inferClaimNeed } from '../abstention';

const strong={
  bm25Top:18,
  semanticTop:.82,
  semanticTop3Average:.79,
  topSourceAgreement:true,
  sourceOverlap:7,
};

describe('R4R2 external-reality claim generalization',()=>{
  it('catches both Blind B external-reality failures',()=>{
    expect(inferClaimNeed(
      'Which Dream objectively proves that a dead sibling sent the dreamer a warning?'
    )).toBe('external_revelation');

    expect(inferClaimNeed(
      'Which Dream actually proves that a spirit is visiting the member’s house?'
    )).toBe('external_revelation');
  });

  it('generalizes to new action-in-world revelation forms',()=>{
    for(const query of [
      'Which oracle confirms that an ancestor appeared in the room?',
      'Which Dream proves that an angel sent this sign?',
      'Which divination reading objectively establishes that a spirit manifested physically?',
    ]){
      expect(inferClaimNeed(query)).toBe('external_revelation');
      expect(evidenceSufficiency(query,strong,false)).toEqual({
        answer:false,reason:'unsupported_claim',
      });
    }
  });

  it('does not block ordinary symbolic or tradition questions',()=>{
    for(const query of [
      'How does the Dream contract treat symbolic meaning?',
      'What does the corpus say about ancestors in symbolic traditions?',
      'How does Divination preserve symbolic correspondence without prediction?',
      'What does the Astrology contract say about spiritual interpretation?',
    ]){
      expect(inferClaimNeed(query)).toBe('conceptual_orientation');
    }
  });
});
