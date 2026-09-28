export type EvidenceMode='focused'|'distributed';
export type ClaimNeed=
  | 'conceptual_orientation'
  | 'prediction'
  | 'external_revelation'
  | 'diagnostic_identity'
  | 'third_party_interiority'
  | 'symbolic_causation'
  | 'symbolic_directive';

export interface EvidenceFeatures {
  bm25Top:number;
  semanticTop:number;
  semanticTop3Average:number;
  topSourceAgreement:boolean;
  sourceOverlap:number;
}

export interface SufficiencyDecision {
  answer:boolean;
  reason:'sufficient'|'weak_focused_evidence'|'weak_distributed_evidence'|'unsupported_claim';
}

export function inferEvidenceMode(query:string):EvidenceMode{
  const text=query.toLowerCase();
  if(
    text.includes('across the corpus')||
    text.includes('corpus-wide')||
    text.includes('what does this corpus')||
    text.includes('according to this corpus')||
    text.includes('retrieve diverse')||
    text.includes('find diverse')
  ) return 'distributed';
  return 'focused';
}

export function inferClaimNeed(query:string):ClaimNeed{
  const text=query.toLowerCase();
  const certainty=/\b(?:prove|proves|proven|confirm|confirms|confirmed|establish|establishes|guarantee|guarantees|guaranteed|demonstrate|demonstrates|objectively|actually)\b/;

  if(
    /\bhidden motives?\b/.test(text)||
    /\bsecretly (?:thinks?|feels?|wants?|resents?|hates?|loves?|jealous)\b/.test(text)||
    /\bwhat (?:another|the other) person really (?:thinks?|feels?|wants?)\b/.test(text)
  ) return 'third_party_interiority';

  if(
    certainty.test(text)&&
    /\b(?:narcissist|psychopath|sociopath|borderline|bipolar|personality disorder|mental disorder|mental illness|diagnos(?:e|is|ed|tic))\b/.test(text)
  ) return 'diagnostic_identity';

  if(
    certainty.test(text)&&(
      /\b(?:deceased|dead|ancestor|spirit|ghost)\b.*\b(?:communicat\w*|message\w*|contact\w*|speaking|speaks?)\b/.test(text)||
      /\b(?:communicat\w*|message\w*|contact\w*)\b.*\b(?:deceased|dead|ancestor|spirit|ghost)\b/.test(text)
    )
  ) return 'external_revelation';

  if(
    certainty.test(text)&&
    /\b(?:astrology|astrological|dream|divination|oracle|i ching)\b/.test(text)&&
    /\b(?:cause|caused|causes|made|because of)\b/.test(text)
  ) return 'symbolic_causation';

  if(
    /\b(?:astrology|astrological|dream|divination|oracle|i ching)\b/.test(text)&&
    /\b(?:commands?|requires?|orders?|tells?)\b/.test(text)&&
    /\b(?:must|should|required to|have to)\b/.test(text)
  ) return 'symbolic_directive';

  if(
    /\bdestined\b/.test(text)||
    /\bforetell\b/.test(text)||
    /\bpredict (?:my|the member|a member)\b/.test(text)||
    (certainty.test(text)&&/\bwill\b/.test(text))
  ) return 'prediction';

  return 'conceptual_orientation';
}

export function evidenceSufficiency(
  query:string,
  features:EvidenceFeatures,
  claimSupported=false,
):SufficiencyDecision{
  const claim=inferClaimNeed(query);
  if(claim!=='conceptual_orientation'&&!claimSupported){
    return {answer:false,reason:'unsupported_claim'};
  }

  const mode=inferEvidenceMode(query);
  if(mode==='distributed'){
    const supported=
      features.topSourceAgreement||
      features.semanticTop3Average>=.64;
    return supported
      ?{answer:true,reason:'sufficient'}
      :{answer:false,reason:'weak_distributed_evidence'};
  }

  const weak=
    !features.topSourceAgreement&&
    features.semanticTop<.68&&
    features.bm25Top<13&&
    features.sourceOverlap<=4;

  return weak
    ?{answer:false,reason:'weak_focused_evidence'}
    :{answer:true,reason:'sufficient'};
}
