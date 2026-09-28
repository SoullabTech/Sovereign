export type TemporalEvidenceStanding=
  | 'instrument_record'
  | 'document_record'
  | 'human_memory'
  | 'coarse_import'
  | 'sequence_constraint';

export interface TemporalEvidence {
  evidenceRef:string;
  nodeRef:string;
  standing:TemporalEvidenceStanding;
  sourceRef:string;
  exactTimestamp?:string;
  calendarDate?:string;
  coarsePeriod?:string;
  afterNodeRef?:string;
  beforeNodeRef?:string;
}

export interface TemporalConflict {
  conflictRef:string;
  nodeRef:string;
  evidenceRefs:string[];
  conflictKind:
    | 'exact_vs_date'
    | 'exact_vs_exact'
    | 'date_vs_date'
    | 'calendar_vs_memory'
    | 'sequence_vs_calendar'
    | 'mixed_precision';
  status:'held_open'|'resolved_by_explicit_rule';
  resolution?:{
    selectedEvidenceRef:string;
    rule:string;
  };
}

export interface ReconciledTemporalField {
  nodeRef:string;
  evidence:TemporalEvidence[];
  conflicts:TemporalConflict[];
  selectedEvidenceRef:string|null;
  selectionReason:string|null;
  unresolvedConflict:boolean;
  forcedCollapse:false;
}

function isoDay(ts:string){
  return ts.slice(0,10);
}

function evidenceDay(e:TemporalEvidence):string|null{
  if(e.exactTimestamp) return isoDay(e.exactTimestamp);
  if(e.calendarDate) return e.calendarDate;
  return null;
}

export function reconcileTemporalEvidence(
  nodeRef:string,
  evidence:TemporalEvidence[],
  options?:{preferInstrumentRecord?:boolean},
):ReconciledTemporalField{
  const relevant=evidence.filter(e=>e.nodeRef===nodeRef);
  const conflicts:TemporalConflict[]=[];

  for(let i=0;i<relevant.length;i++){
    for(let j=i+1;j<relevant.length;j++){
      const a=relevant[i], b=relevant[j];
      const ad=evidenceDay(a), bd=evidenceDay(b);
      if(ad&&bd&&ad!==bd){
        let kind:TemporalConflict['conflictKind']='mixed_precision';
        if(a.exactTimestamp&&b.exactTimestamp) kind='exact_vs_exact';
        else if(a.calendarDate&&b.calendarDate) kind='date_vs_date';
        else if(
          (a.standing==='human_memory'||b.standing==='human_memory')
        ) kind='calendar_vs_memory';
        else if(a.exactTimestamp||b.exactTimestamp) kind='exact_vs_date';

        conflicts.push({
          conflictRef:'temporal-conflict:'+a.evidenceRef+':'+b.evidenceRef,
          nodeRef,
          evidenceRefs:[a.evidenceRef,b.evidenceRef],
          conflictKind:kind,
          status:'held_open',
        });
      }
    }
  }

  let selectedEvidenceRef:string|null=null;
  let selectionReason:string|null=null;

  if(options?.preferInstrumentRecord){
    const instrument=relevant.find(e=>e.standing==='instrument_record'&&e.exactTimestamp);
    if(instrument){
      selectedEvidenceRef=instrument.evidenceRef;
      selectionReason='explicit_rule_prefer_instrument_exact_timestamp';
      for(const conflict of conflicts){
        if(conflict.evidenceRefs.includes(instrument.evidenceRef)){
          conflict.status='resolved_by_explicit_rule';
          conflict.resolution={
            selectedEvidenceRef:instrument.evidenceRef,
            rule:'prefer_instrument_exact_timestamp',
          };
        }
      }
    }
  }

  const unresolvedConflict=conflicts.some(c=>c.status==='held_open');

  if(!selectedEvidenceRef&&!unresolvedConflict&&relevant.length===1){
    selectedEvidenceRef=relevant[0].evidenceRef;
    selectionReason='single_uncontested_temporal_evidence';
  }

  return {
    nodeRef,
    evidence:relevant,
    conflicts,
    selectedEvidenceRef,
    selectionReason,
    unresolvedConflict,
    forcedCollapse:false,
  };
}

export function explainReconciledTemporalField(
  field:ReconciledTemporalField,
){
  if(field.unresolvedConflict){
    return {
      answer:'The temporal sources disagree, so the record keeps the conflict open rather than selecting one time as definitive.',
      evidenceRefs:field.evidence.map(e=>e.evidenceRef),
      conflictRefs:field.conflicts.filter(c=>c.status==='held_open').map(c=>c.conflictRef),
      selectedEvidenceRef:field.selectedEvidenceRef,
      falseConsensus:false,
    };
  }

  if(field.selectedEvidenceRef){
    return {
      answer:field.selectionReason==='single_uncontested_temporal_evidence'
        ? 'The record has one uncontested temporal source for this reflection.'
        : 'The record selected one temporal source only because an explicit reconciliation rule was applied.',
      evidenceRefs:field.evidence.map(e=>e.evidenceRef),
      conflictRefs:field.conflicts.map(c=>c.conflictRef),
      selectedEvidenceRef:field.selectedEvidenceRef,
      falseConsensus:false,
    };
  }

  return {
    answer:'The record does not contain enough temporal evidence to select a time.',
    evidenceRefs:field.evidence.map(e=>e.evidenceRef),
    conflictRefs:field.conflicts.map(c=>c.conflictRef),
    selectedEvidenceRef:null,
    falseConsensus:false,
  };
}

export function validateReconciledTemporalField(field:ReconciledTemporalField){
  const errors:string[]=[];
  if(field.forcedCollapse!==false) errors.push('forced_temporal_collapse');
  if(field.unresolvedConflict&&field.selectionReason==='single_uncontested_temporal_evidence'){
    errors.push('conflict_mislabeled_uncontested');
  }
  if(field.selectedEvidenceRef&&!field.evidence.some(e=>e.evidenceRef===field.selectedEvidenceRef)){
    errors.push('selected_temporal_evidence_missing');
  }
  for(const conflict of field.conflicts){
    if(conflict.status==='resolved_by_explicit_rule'&&!conflict.resolution){
      errors.push('resolved_conflict_missing_rule:'+conflict.conflictRef);
    }
  }
  return {valid:errors.length===0,errors};
}
