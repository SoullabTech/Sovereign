import {
  answerTemporalQuestion,
  type TemporalQuestionKind,
} from './temporalSourceAuthority';
import type { TemporalEvidence } from './temporalReconciliation';

export interface TemporalDialogueResponse {
  kind:'clarification'|'answer'|'unavailable';
  text:string;
  selectedEvidenceRef:string|null;
  question:TemporalQuestionKind;
  mentionsConflict:boolean;
  exposesInternalTaxonomy:false;
  universalWinner:false;
}

function describeSource(e:TemporalEvidence){
  if(e.exactTimestamp) return e.exactTimestamp;
  if(e.calendarDate) return e.calendarDate;
  if(e.coarsePeriod) return e.coarsePeriod;
  if(e.afterNodeRef||e.beforeNodeRef){
    const bits:string[]=[];
    if(e.afterNodeRef) bits.push('after '+e.afterNodeRef);
    if(e.beforeNodeRef) bits.push('before '+e.beforeNodeRef);
    return bits.join(' and ');
  }
  return null;
}

function otherTemporalSummaries(
  nodeRef:string,
  evidence:TemporalEvidence[],
  selectedEvidenceRef:string|null,
){
  return evidence
    .filter(e=>e.nodeRef===nodeRef&&e.evidenceRef!==selectedEvidenceRef)
    .map(e=>({
      standing:e.standing,
      value:describeSource(e),
    }))
    .filter(x=>Boolean(x.value));
}

export function composeTemporalQuestionDialogue(
  nodeRef:string,
  evidence:TemporalEvidence[],
  question:TemporalQuestionKind,
):TemporalDialogueResponse{
  const decision=answerTemporalQuestion(nodeRef,evidence,question);

  if(decision.ambiguityRequiresClarification){
    return {
      kind:'clarification',
      text:'Do you mean when the system recorded it, the date attached to a document or journal entry, when you remember it happening, the broader period it belonged to, or where it falls in the sequence?',
      selectedEvidenceRef:null,
      question,
      mentionsConflict:evidence.filter(e=>e.nodeRef===nodeRef).length>1,
      exposesInternalTaxonomy:false,
      universalWinner:false,
    };
  }

  if(!decision.selectedEvidenceRef){
    const humanLabel=
      question==='system_record_time' ? 'when the system recorded it'
        : question==='document_date' ? 'the date attached to the document'
          : question==='remembered_time' ? 'when you remember it happening'
            : question==='interpretive_period' ? 'the broader period it belonged to'
              : question==='relative_sequence' ? 'where it falls in the sequence'
                : 'that time';

    return {
      kind:'unavailable',
      text:`I don't have a recorded source for ${humanLabel}. I can tell you what the other time records say without treating them as a substitute.`,
      selectedEvidenceRef:null,
      question,
      mentionsConflict:false,
      exposesInternalTaxonomy:false,
      universalWinner:false,
    };
  }

  const selected=evidence.find(e=>e.evidenceRef===decision.selectedEvidenceRef)!;
  const value=describeSource(selected);
  const others=otherTemporalSummaries(nodeRef,evidence,selected.evidenceRef);

  let lead='';
  if(question==='system_record_time'){
    lead=`The system record puts it at ${value}.`;
  } else if(question==='document_date'){
    lead=`The document or journal date is ${value}.`;
  } else if(question==='remembered_time'){
    lead=`Your remembered time is ${value}.`;
  } else if(question==='interpretive_period'){
    lead=`The broader period recorded for it is ${value}.`;
  } else if(question==='relative_sequence'){
    lead=`In the recorded sequence, it falls ${value}.`;
  } else {
    lead=`The recorded time is ${value}.`;
  }

  const materiallyDifferent=others.some(o=>o.value!==value);
  let conflict='';
  if(materiallyDifferent){
    if(question==='remembered_time'){
      conflict=' Other records place it differently, so I would keep your remembered time distinct from the system or document time.';
    } else if(question==='system_record_time'){
      conflict=' Other records place it differently, so I would treat this specifically as the system-record time rather than the one definitive time.';
    } else if(question==='document_date'){
      conflict=' Other records place it differently, so this is best understood as the document date, not a universal event time.';
    } else {
      conflict=' Other time records differ, so I would keep this answer scoped to the kind of time you asked about.';
    }
  }

  return {
    kind:'answer',
    text:lead+conflict,
    selectedEvidenceRef:selected.evidenceRef,
    question,
    mentionsConflict:materiallyDifferent,
    exposesInternalTaxonomy:false,
    universalWinner:false,
  };
}

const INTERNAL_JARGON=/\b(?:instrument_record|document_record|human_memory|coarse_import|sequence_constraint|TemporalEvidenceStanding|selectedEvidenceRef|universalWinner)\b/i;

export function validateTemporalDialogue(response:TemporalDialogueResponse){
  const errors:string[]=[];
  if(response.exposesInternalTaxonomy!==false) errors.push('internal_taxonomy_exposed');
  if(response.universalWinner!==false) errors.push('universal_temporal_winner_granted');
  if(INTERNAL_JARGON.test(response.text)) errors.push('technical_temporal_jargon_in_member_text');
  if(response.kind==='clarification'&&response.selectedEvidenceRef){
    errors.push('clarification_selected_source');
  }
  if(response.kind==='answer'&&!response.selectedEvidenceRef){
    errors.push('answer_missing_selected_source');
  }
  return {valid:errors.length===0,errors};
}
