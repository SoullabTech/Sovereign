import { evidenceSufficiency, inferClaimNeed, inferEvidenceMode } from '../abstention';
import { metadataAwareCallosalRerank, type FusedSource } from '../fusion';
import type { BenchmarkCorpusSource } from '../corpus';

describe('R3 abstention law',()=>{
  it('recognizes distributed field inquiries',()=>{
    expect(inferEvidenceMode('Across the corpus, what protects human agency?')).toBe('distributed');
    expect(inferEvidenceMode('What does this corpus say about Martian agriculture?')).toBe('distributed');
    expect(inferEvidenceMode('Find diverse sources on member sovereignty.')).toBe('distributed');
    expect(inferEvidenceMode('Where is selection begins after authority?')).toBe('focused');
  });

  it('keeps a weak-but-distributed supported field answerable',()=>{
    expect(evidenceSufficiency('Across the corpus, what recurring architecture protects human agency?',{
      bm25Top:10.423,semanticTop:.663,semanticTop3Average:.654,
      topSourceAgreement:false,sourceOverlap:3,
    }).answer).toBe(true);
  });

  it('abstains on distributed adjacent material without enough semantic support',()=>{
    const decision=evidenceSufficiency('What does this corpus say about Martian agriculture irrigation schedules?',{
      bm25Top:10.595,semanticTop:.629,semanticTop3Average:.625,
      topSourceAgreement:false,sourceOverlap:3,
    });
    expect(decision).toEqual({answer:false,reason:'weak_distributed_evidence'});
  });

  it('abstains on weak focused evidence',()=>{
    const decision=evidenceSufficiency('Which document contains Soullab tax filing instructions for 2025?',{
      bm25Top:8.491,semanticTop:.668,semanticTop3Average:.657,
      topSourceAgreement:false,sourceOverlap:3,
    });
    expect(decision.answer).toBe(false);
  });

  it('treats destiny/prediction as a claim-sufficiency problem, not a similarity problem',()=>{
    expect(inferClaimNeed('Which Dream proves that a member is destined to move to Paris?')).toBe('prediction');
    const decision=evidenceSufficiency('Which Dream proves that a member is destined to move to Paris?',{
      bm25Top:12.794,semanticTop:.710,semanticTop3Average:.697,
      topSourceAgreement:false,sourceOverlap:3,
    },false);
    expect(decision).toEqual({answer:false,reason:'unsupported_claim'});
  });
});

describe('metadata-aware callosal reranking',()=>{
  const corpus:BenchmarkCorpusSource[]=[
    {sourceRef:'a',path:'a',sourceClass:'canon',domain:'authority',epistemicRole:'governing_law',temporalStanding:'current',authorityRole:'governing',tags:['authority']},
    {sourceRef:'b',path:'b',sourceClass:'benchmark_contract',domain:'retrieval-benchmark',epistemicRole:'benchmark_governance',temporalStanding:'current',authorityRole:'governing',tags:['weights','relevance','benchmark']},
  ];
  const fused:FusedSource[]=[
    {sourceRef:'a',sourceClass:'canon',rank:1,tokenEstimate:100,rrfScore:.030,lexicalRank:1,semanticRank:1,lanes:['lexical','semantic']},
    {sourceRef:'b',sourceClass:'benchmark_contract',rank:2,tokenEstimate:100,rrfScore:.029,lexicalRank:10,semanticRank:4,lanes:['lexical','semantic']},
  ];

  it('uses metadata as a bounded tie-breaker, not a replacement for retrieval evidence',()=>{
    const ranked=metadataAwareCallosalRerank(
      'fixed relevance weights benchmark',
      fused,corpus,
      {limit:2,metadataWeight:.0075,dualLaneBonus:.001},
    );
    expect(ranked.map(x=>x.sourceRef)).toEqual(['b','a']);
  });

  it('cannot overcome a materially larger retrieval gap',()=>{
    const separated=[fused[0],{...fused[1],rrfScore:.010}];
    const ranked=metadataAwareCallosalRerank(
      'fixed relevance weights benchmark',
      separated,corpus,
      {limit:2,metadataWeight:.0075,dualLaneBonus:.001},
    );
    expect(ranked[0].sourceRef).toBe('a');
  });
});
