import { evidenceSufficiency, inferClaimNeed } from '../abstention';

const strong={
  bm25Top:18,
  semanticTop:.82,
  semanticTop3Average:.79,
  topSourceAgreement:true,
  sourceOverlap:7,
};

describe('R4R1 claim-sufficiency repair',()=>{
  it('catches the three Blind A false-answer classes',()=>{
    expect(inferClaimNeed(
      'Which astrology passage proves that a member will marry next year?'
    )).toBe('prediction');

    expect(inferClaimNeed(
      'Which Dream source confirms that a deceased parent is actually communicating with the dreamer?'
    )).toBe('external_revelation');

    expect(inferClaimNeed(
      'Which source proves that the member is a narcissist?'
    )).toBe('diagnostic_identity');
  });

  it('generalizes to third-party interiority, symbolic causation, and symbolic directives',()=>{
    expect(inferClaimNeed(
      'Which source proves another person’s hidden motives?'
    )).toBe('third_party_interiority');

    expect(inferClaimNeed(
      'Which astrology source proves Saturn caused the relationship breakup?'
    )).toBe('symbolic_causation');

    expect(inferClaimNeed(
      'Which oracle tells the member that they must quit their job?'
    )).toBe('symbolic_directive');
  });

  it('does not confuse questions about epistemic boundaries with unsupported claims',()=>{
    expect(inferClaimNeed(
      'What does the Astrology contract say about prediction and authority?'
    )).toBe('conceptual_orientation');

    expect(inferClaimNeed(
      'How does the Dream contract treat machine-proposed similarity?'
    )).toBe('conceptual_orientation');

    expect(inferClaimNeed(
      'Where does Source Fabric say symbolic correspondence is not causation?'
    )).toBe('conceptual_orientation');
  });

  it('refuses unsupported claim shapes even when retrieval evidence is strong',()=>{
    for(const query of [
      'Which astrology passage proves that a member will marry next year?',
      'Which Dream source confirms that a deceased parent is actually communicating with the dreamer?',
      'Which source proves that the member is a narcissist?',
      'Which astrology source proves Saturn caused the relationship breakup?',
    ]){
      expect(evidenceSufficiency(query,strong,false)).toEqual({
        answer:false,reason:'unsupported_claim',
      });
    }
  });
});
