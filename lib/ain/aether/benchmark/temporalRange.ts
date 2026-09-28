export type TemporalRangePrecision=
  | 'exact_range'
  | 'date_range'
  | 'coarse_range'
  | 'sequence_bounded'
  | 'unknown';

export interface TemporalRangeRecord {
  rangeRef:string;
  nodeRef:string;
  precision:TemporalRangePrecision;
  start?:string;
  end?:string;
  coarseLabel?:string;
  afterNodeRef?:string;
  beforeNodeRef?:string;
  sourceRef:string;
}

export interface TemporalRangeExplanation {
  nodeRef:string;
  answer:string;
  precision:TemporalRangePrecision;
  evidenceRangeRefs:string[];
  unknowns:string[];
  midpointPromoted:false;
}

function validDateLike(value:string){
  return !Number.isNaN(Date.parse(value));
}

export function validateTemporalRanges(records:TemporalRangeRecord[]){
  const errors:string[]=[];
  const refs=new Set<string>();

  for(const r of records){
    if(refs.has(r.rangeRef)) errors.push('duplicate_range_ref:'+r.rangeRef);
    refs.add(r.rangeRef);

    if(r.precision==='exact_range'){
      if(!r.start||!r.end||!validDateLike(r.start)||!validDateLike(r.end)){
        errors.push('invalid_exact_range:'+r.nodeRef);
      }
    }

    if(r.precision==='date_range'){
      if(!r.start||!r.end) errors.push('missing_date_range_bounds:'+r.nodeRef);
    }

    if(r.precision==='coarse_range'&&!r.coarseLabel){
      errors.push('missing_coarse_range_label:'+r.nodeRef);
    }

    if(r.precision==='sequence_bounded'){
      if(!r.afterNodeRef&&!r.beforeNodeRef){
        errors.push('sequence_range_missing_bounds:'+r.nodeRef);
      }
      if(r.start||r.end||r.coarseLabel){
        errors.push('sequence_range_has_false_calendar_precision:'+r.nodeRef);
      }
    }

    if(r.precision==='unknown'&&(r.start||r.end||r.coarseLabel||r.afterNodeRef||r.beforeNodeRef)){
      errors.push('unknown_range_has_precision:'+r.nodeRef);
    }

    if(r.start&&r.end&&validDateLike(r.start)&&validDateLike(r.end)){
      if(Date.parse(r.start)>Date.parse(r.end)) errors.push('range_start_after_end:'+r.nodeRef);
    }
  }

  return {valid:errors.length===0,errors};
}

export function explainTemporalRange(
  records:TemporalRangeRecord[],
  nodeRef:string,
):TemporalRangeExplanation{
  const r=records.find(x=>x.nodeRef===nodeRef);

  if(!r){
    return {
      nodeRef,
      answer:'No temporal range was recorded for this reflection.',
      precision:'unknown',
      evidenceRangeRefs:[],
      unknowns:['temporal_range_not_recorded'],
      midpointPromoted:false,
    };
  }

  if(r.precision==='exact_range'){
    return {
      nodeRef,
      answer:`This reflection is recorded as occurring sometime between ${r.start} and ${r.end}; the record does not identify one exact moment within that interval.`,
      precision:r.precision,
      evidenceRangeRefs:[r.rangeRef],
      unknowns:['exact_event_time_within_range_unknown'],
      midpointPromoted:false,
    };
  }

  if(r.precision==='date_range'){
    return {
      nodeRef,
      answer:`This reflection is recorded between ${r.start} and ${r.end}, with no more precise time preserved.`,
      precision:r.precision,
      evidenceRangeRefs:[r.rangeRef],
      unknowns:['clock_time_within_date_range_unknown'],
      midpointPromoted:false,
    };
  }

  if(r.precision==='coarse_range'){
    return {
      nodeRef,
      answer:`This reflection is recorded only as occurring around ${r.coarseLabel}.`,
      precision:r.precision,
      evidenceRangeRefs:[r.rangeRef],
      unknowns:['exact_range_bounds_unknown'],
      midpointPromoted:false,
    };
  }

  if(r.precision==='sequence_bounded'){
    const pieces:string[]=[];
    if(r.afterNodeRef) pieces.push('after '+r.afterNodeRef);
    if(r.beforeNodeRef) pieces.push('before '+r.beforeNodeRef);
    return {
      nodeRef,
      answer:`This reflection is only bounded in sequence: ${pieces.join(' and ')}. No calendar time is preserved.`,
      precision:r.precision,
      evidenceRangeRefs:[r.rangeRef],
      unknowns:['calendar_range_unknown'],
      midpointPromoted:false,
    };
  }

  return {
    nodeRef,
    answer:'The record preserves no usable temporal range for this reflection.',
    precision:'unknown',
    evidenceRangeRefs:[r.rangeRef],
    unknowns:['temporal_range_unknown'],
    midpointPromoted:false,
  };
}
