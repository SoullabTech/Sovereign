import type { ReflectionLineage } from './repairLineage';

export type TemporalPrecision=
  | 'exact_timestamp'
  | 'calendar_date'
  | 'coarse_period'
  | 'sequence_only'
  | 'unknown';

export interface LineageTemporalRecord {
  temporalRef:string;
  nodeRef:string;
  sequenceIndex:number;
  precision:TemporalPrecision;
  recordedAt?:string;
  calendarDate?:string;
  coarsePeriod?:string;
  sourceRef:string;
}

export interface TemporalExplanation {
  nodeRef:string;
  answer:string;
  precision:TemporalPrecision;
  evidenceTemporalRefs:string[];
  unknowns:string[];
  falsePrecisionIntroduced:false;
}

function temporalFor(records:LineageTemporalRecord[],nodeRef:string){
  return records.find(r=>r.nodeRef===nodeRef);
}

function validIsoTimestamp(value:string){
  return !Number.isNaN(Date.parse(value)) && /T/.test(value);
}

export function validateTemporalRecords(
  lineage:ReflectionLineage,
  records:LineageTemporalRecord[],
){
  const errors:string[]=[];
  const nodeRefs=new Set(lineage.nodes.map(n=>n.nodeRef));
  const temporalRefs=new Set<string>();
  const sequenceIndexes=new Set<number>();

  for(const record of records){
    if(temporalRefs.has(record.temporalRef)) errors.push('duplicate_temporal_ref:'+record.temporalRef);
    temporalRefs.add(record.temporalRef);
    if(sequenceIndexes.has(record.sequenceIndex)) errors.push('duplicate_sequence_index:'+record.sequenceIndex);
    sequenceIndexes.add(record.sequenceIndex);
    if(!nodeRefs.has(record.nodeRef)) errors.push('unknown_temporal_node:'+record.nodeRef);

    if(record.precision==='exact_timestamp'){
      if(!record.recordedAt||!validIsoTimestamp(record.recordedAt)){
        errors.push('invalid_exact_timestamp:'+record.nodeRef);
      }
    }
    if(record.precision==='calendar_date'&&!record.calendarDate){
      errors.push('missing_calendar_date:'+record.nodeRef);
    }
    if(record.precision==='coarse_period'&&!record.coarsePeriod){
      errors.push('missing_coarse_period:'+record.nodeRef);
    }
    if(record.precision==='sequence_only'&&(record.recordedAt||record.calendarDate||record.coarsePeriod)){
      errors.push('sequence_only_has_false_time:'+record.nodeRef);
    }
    if(record.precision==='unknown'&&(record.recordedAt||record.calendarDate||record.coarsePeriod)){
      errors.push('unknown_time_has_precision:'+record.nodeRef);
    }
  }

  const ordered=[...records].sort((a,b)=>a.sequenceIndex-b.sequenceIndex);
  for(let i=1;i<ordered.length;i++){
    if(ordered[i].sequenceIndex<=ordered[i-1].sequenceIndex){
      errors.push('non_monotonic_sequence');
    }
  }

  return {valid:errors.length===0,errors};
}

export function explainWhenNode(
  lineage:ReflectionLineage,
  records:LineageTemporalRecord[],
  nodeRef:string,
):TemporalExplanation{
  const node=lineage.nodes.find(n=>n.nodeRef===nodeRef);
  if(!node){
    return {
      nodeRef,
      answer:'The lineage does not contain that reflection.',
      precision:'unknown',
      evidenceTemporalRefs:[],
      unknowns:['node_missing:'+nodeRef],
      falsePrecisionIntroduced:false,
    };
  }

  const record=temporalFor(records,nodeRef);
  if(!record){
    return {
      nodeRef,
      answer:'The lineage preserves this reflection, but no temporal metadata was recorded for it.',
      precision:'unknown',
      evidenceTemporalRefs:[],
      unknowns:['temporal_metadata_not_recorded'],
      falsePrecisionIntroduced:false,
    };
  }

  if(record.precision==='exact_timestamp'){
    return {
      nodeRef,
      answer:`This reflection was recorded at ${record.recordedAt}.`,
      precision:record.precision,
      evidenceTemporalRefs:[record.temporalRef],
      unknowns:[],
      falsePrecisionIntroduced:false,
    };
  }

  if(record.precision==='calendar_date'){
    return {
      nodeRef,
      answer:`This reflection was recorded on ${record.calendarDate}; no more precise time is preserved.`,
      precision:record.precision,
      evidenceTemporalRefs:[record.temporalRef],
      unknowns:['clock_time_not_recorded'],
      falsePrecisionIntroduced:false,
    };
  }

  if(record.precision==='coarse_period'){
    return {
      nodeRef,
      answer:`This reflection is recorded only as occurring during ${record.coarsePeriod}.`,
      precision:record.precision,
      evidenceTemporalRefs:[record.temporalRef],
      unknowns:['exact_date_and_time_not_recorded'],
      falsePrecisionIntroduced:false,
    };
  }

  if(record.precision==='sequence_only'){
    return {
      nodeRef,
      answer:`This reflection is preserved as sequence position ${record.sequenceIndex}, but no calendar time was recorded.`,
      precision:record.precision,
      evidenceTemporalRefs:[record.temporalRef],
      unknowns:['calendar_time_not_recorded'],
      falsePrecisionIntroduced:false,
    };
  }

  return {
    nodeRef,
    answer:'The record preserves the reflection but does not preserve when it occurred.',
    precision:'unknown',
    evidenceTemporalRefs:[record.temporalRef],
    unknowns:['time_unknown'],
    falsePrecisionIntroduced:false,
  };
}

export function explainTemporalOrder(
  records:LineageTemporalRecord[],
  earlierRef:string,
  laterRef:string,
):TemporalExplanation{
  const a=temporalFor(records,earlierRef);
  const b=temporalFor(records,laterRef);
  const unknowns:string[]=[];

  if(!a) unknowns.push('temporal_metadata_missing:'+earlierRef);
  if(!b) unknowns.push('temporal_metadata_missing:'+laterRef);

  if(!a||!b){
    return {
      nodeRef:laterRef,
      answer:'The record does not contain enough temporal metadata to establish that ordering.',
      precision:'unknown',
      evidenceTemporalRefs:[a,b].filter(Boolean).map(x=>x!.temporalRef),
      unknowns,
      falsePrecisionIntroduced:false,
    };
  }

  const relation=
    a.sequenceIndex<b.sequenceIndex
      ? `${earlierRef} is recorded before ${laterRef}.`
      : a.sequenceIndex>b.sequenceIndex
        ? `${earlierRef} is recorded after ${laterRef}.`
        : 'The two records have the same sequence position, so their order is not distinguishable.';

  return {
    nodeRef:laterRef,
    answer:relation,
    precision:'sequence_only',
    evidenceTemporalRefs:[a.temporalRef,b.temporalRef],
    unknowns:a.sequenceIndex===b.sequenceIndex?['relative_order_ambiguous']:[],
    falsePrecisionIntroduced:false,
  };
}
