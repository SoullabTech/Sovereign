export type EvidenceMode='focused'|'distributed';
export type ClaimNeed='conceptual_orientation'|'prediction';

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
  if(
    /\bdestined\b/.test(text)||
    /\bforetell\b/.test(text)||
    /\bpredict (?:my|the member|a member)\b/.test(text)
  ) return 'prediction';
  return 'conceptual_orientation';
}

export function evidenceSufficiency(
  query:string,
  features:EvidenceFeatures,
  predictionSupported=false,
):SufficiencyDecision{
  const claim=inferClaimNeed(query);
  if(claim==='prediction'&&!predictionSupported){
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
