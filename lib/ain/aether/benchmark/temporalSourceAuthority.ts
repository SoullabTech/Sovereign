import type {
  TemporalEvidence,
  TemporalEvidenceStanding,
} from './temporalReconciliation';

export type TemporalQuestionKind=
  | 'system_record_time'
  | 'document_date'
  | 'remembered_time'
  | 'interpretive_period'
  | 'relative_sequence'
  | 'unspecified_when';

export interface TemporalAuthorityDecision {
  nodeRef:string;
  question:TemporalQuestionKind;
  selectedEvidenceRef:string|null;
  selectedStanding:TemporalEvidenceStanding|null;
  answer:string;
  alternatives:string[];
  ambiguityRequiresClarification:boolean;
  universalWinner:false;
}

function relevant(evidence:TemporalEvidence[],nodeRef:string){
  return evidence.filter(e=>e.nodeRef===nodeRef);
}

function describe(e:TemporalEvidence){
  if(e.exactTimestamp) return e.exactTimestamp;
  if(e.calendarDate) return e.calendarDate;
  if(e.coarsePeriod) return e.coarsePeriod;
  if(e.afterNodeRef||e.beforeNodeRef){
    const parts:string[]=[];
    if(e.afterNodeRef) parts.push('after '+e.afterNodeRef);
    if(e.beforeNodeRef) parts.push('before '+e.beforeNodeRef);
    return parts.join(' and ');
  }
  return 'time not specified';
}

function selectFirstByStanding(
  evidence:TemporalEvidence[],
  standings:TemporalEvidenceStanding[],
){
  for(const standing of standings){
    const found=evidence.find(e=>e.standing===standing);
    if(found) return found;
  }
  return null;
}

export function answerTemporalQuestion(
  nodeRef:string,
  evidence:TemporalEvidence[],
  question:TemporalQuestionKind,
):TemporalAuthorityDecision{
  const pool=relevant(evidence,nodeRef);

  if(question==='unspecified_when'){
    const distinctStandings=[...new Set(pool.map(e=>e.standing))];
    if(distinctStandings.length>1){
      return {
        nodeRef,
        question,
        selectedEvidenceRef:null,
        selectedStanding:null,
        answer:'There are multiple kinds of temporal evidence here. Which time do you mean: system-record time, document date, remembered time, interpretive period, or relative sequence?',
        alternatives:pool.map(e=>e.evidenceRef),
        ambiguityRequiresClarification:true,
        universalWinner:false,
      };
    }
  }

  let selected:TemporalEvidence|null=null;

  if(question==='system_record_time'){
    selected=selectFirstByStanding(pool,['instrument_record']);
  } else if(question==='document_date'){
    selected=selectFirstByStanding(pool,['document_record']);
  } else if(question==='remembered_time'){
    selected=selectFirstByStanding(pool,['human_memory']);
  } else if(question==='interpretive_period'){
    selected=selectFirstByStanding(pool,['coarse_import','human_memory','document_record']);
  } else if(question==='relative_sequence'){
    selected=selectFirstByStanding(pool,['sequence_constraint']);
  } else if(question==='unspecified_when'&&pool.length===1){
    selected=pool[0];
  }

  if(!selected){
    return {
      nodeRef,
      question,
      selectedEvidenceRef:null,
      selectedStanding:null,
      answer:'The record does not contain temporal evidence authoritative for that specific question.',
      alternatives:pool.map(e=>e.evidenceRef),
      ambiguityRequiresClarification:false,
      universalWinner:false,
    };
  }

  const label=
    question==='system_record_time' ? 'system-record time'
      : question==='document_date' ? 'document date'
        : question==='remembered_time' ? 'remembered time'
          : question==='interpretive_period' ? 'interpretive period'
            : question==='relative_sequence' ? 'relative sequence'
              : 'recorded time';

  return {
    nodeRef,
    question,
    selectedEvidenceRef:selected.evidenceRef,
    selectedStanding:selected.standing,
    answer:`For ${label}, the relevant source is ${selected.evidenceRef}: ${describe(selected)}.`,
    alternatives:pool.filter(e=>e.evidenceRef!==selected!.evidenceRef).map(e=>e.evidenceRef),
    ambiguityRequiresClarification:false,
    universalWinner:false,
  };
}

export function validateTemporalAuthorityDecision(
  decision:TemporalAuthorityDecision,
  evidence:TemporalEvidence[],
){
  const errors:string[]=[];
  if(decision.universalWinner!==false) errors.push('universal_temporal_winner_granted');
  if(decision.selectedEvidenceRef){
    const selected=evidence.find(e=>e.evidenceRef===decision.selectedEvidenceRef);
    if(!selected) errors.push('selected_temporal_source_missing');
    if(selected&&selected.nodeRef!==decision.nodeRef) errors.push('selected_temporal_source_wrong_node');
  }
  if(decision.ambiguityRequiresClarification&&decision.selectedEvidenceRef){
    errors.push('ambiguous_question_selected_source');
  }
  return {valid:errors.length===0,errors};
}
