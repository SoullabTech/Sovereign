import type {
  AetherFieldPattern,
  MemberAetherField,
  MemberAetherCorrection,
} from './memberField';
import { applyMemberAetherCorrection } from './memberField';

export type AetherDeltaKind=
  | 'appeared'
  | 'disappeared'
  | 'intensified'
  | 'dissipated'
  | 'reconfigured'
  | 'temporally_shifted'
  | 'recognition_changed'
  | 'unchanged';

export interface PatternDelta {
  patternRef:string;
  motif:string;
  kind:AetherDeltaKind;
  beforeFacetRefs:string[];
  afterFacetRefs:string[];
  addedFacetRefs:string[];
  removedFacetRefs:string[];
  beforeTemporal:string[];
  afterTemporal:string[];
  beforeQualities:string[];
  afterQualities:string[];
  beforeRecognition:string|null;
  afterRecognition:string|null;
}

export interface FieldRelation {
  relationRef:string;
  aPatternRef:string;
  bPatternRef:string;
  basis:
    | 'shared_facet'
    | 'shared_quality'
    | 'shared_temporal'
    | 'contradiction_link';
  strength:number;
}

export interface FieldGeometry {
  fieldRef:string;
  relations:FieldRelation[];
}

export interface FieldGeometryDelta {
  addedRelations:FieldRelation[];
  removedRelations:FieldRelation[];
  strengthenedRelations:Array<{before:FieldRelation;after:FieldRelation}>;
  weakenedRelations:Array<{before:FieldRelation;after:FieldRelation}>;
}

export interface MemberAetherFieldDelta {
  fromFieldRef:string;
  toFieldRef:string;
  patternDeltas:PatternDelta[];
  geometryBefore:FieldGeometry;
  geometryAfter:FieldGeometry;
  geometryDelta:FieldGeometryDelta;
  changed:boolean;
  finalMeaningAuthority:'member';
  provisional:true;
}

function unique<T>(xs:T[]):T[]{ return [...new Set(xs)]; }

function overlap<T>(a:T[],b:T[]):T[]{ const bs=new Set(b); return a.filter(x=>bs.has(x)); }

function relationKey(a:string,b:string,basis:string){
  return [a,b].sort().join('::')+'::'+basis;
}

export function deriveFieldGeometry(field:MemberAetherField):FieldGeometry{
  const relations:FieldRelation[]=[];
  const ps=field.patterns.filter(p=>p.memberRecognition!=='rejected');

  for(let i=0;i<ps.length;i++){
    for(let j=i+1;j<ps.length;j++){
      const a=ps[i], b=ps[j];
      const sharedFacets=overlap(a.contributingFacetRefs,b.contributingFacetRefs);
      const sharedQualities=overlap(a.qualities,b.qualities);
      const sharedTemporal=overlap(a.temporalStandings,b.temporalStandings);

      if(sharedFacets.length){
        relations.push({
          relationRef:relationKey(a.patternRef,b.patternRef,'shared_facet'),
          aPatternRef:a.patternRef,
          bPatternRef:b.patternRef,
          basis:'shared_facet',
          strength:Math.min(1,.25+.15*sharedFacets.length),
        });
      }
      if(sharedQualities.length){
        relations.push({
          relationRef:relationKey(a.patternRef,b.patternRef,'shared_quality'),
          aPatternRef:a.patternRef,
          bPatternRef:b.patternRef,
          basis:'shared_quality',
          strength:Math.min(1,.2+.12*sharedQualities.length),
        });
      }
      if(sharedTemporal.length){
        relations.push({
          relationRef:relationKey(a.patternRef,b.patternRef,'shared_temporal'),
          aPatternRef:a.patternRef,
          bPatternRef:b.patternRef,
          basis:'shared_temporal',
          strength:Math.min(1,.15+.1*sharedTemporal.length),
        });
      }
    }
  }

  for(const contradiction of field.contradictions){
    const linked=field.patterns.filter(p=>
      p.contributingObservationRefs.some(ref=>contradiction.observationRefs.includes(ref))
    );
    for(let i=0;i<linked.length;i++){
      for(let j=i+1;j<linked.length;j++){
        relations.push({
          relationRef:relationKey(linked[i].patternRef,linked[j].patternRef,'contradiction_link'),
          aPatternRef:linked[i].patternRef,
          bPatternRef:linked[j].patternRef,
          basis:'contradiction_link',
          strength:.8,
        });
      }
    }
  }

  return {fieldRef:field.fieldRef,relations};
}

function patternDelta(before:AetherFieldPattern|undefined,after:AetherFieldPattern|undefined):PatternDelta{
  if(!before&&after){
    return {
      patternRef:after.patternRef,motif:after.motif,kind:'appeared',
      beforeFacetRefs:[],afterFacetRefs:[...after.contributingFacetRefs],
      addedFacetRefs:[...after.contributingFacetRefs],removedFacetRefs:[],
      beforeTemporal:[],afterTemporal:[...after.temporalStandings],
      beforeQualities:[],afterQualities:[...after.qualities],
      beforeRecognition:null,afterRecognition:after.memberRecognition,
    };
  }
  if(before&&!after){
    return {
      patternRef:before.patternRef,motif:before.motif,kind:'disappeared',
      beforeFacetRefs:[...before.contributingFacetRefs],afterFacetRefs:[],
      addedFacetRefs:[],removedFacetRefs:[...before.contributingFacetRefs],
      beforeTemporal:[...before.temporalStandings],afterTemporal:[],
      beforeQualities:[...before.qualities],afterQualities:[],
      beforeRecognition:before.memberRecognition,afterRecognition:null,
    };
  }
  const b=before!, a=after!;
  const added=a.contributingFacetRefs.filter(x=>!b.contributingFacetRefs.includes(x));
  const removed=b.contributingFacetRefs.filter(x=>!a.contributingFacetRefs.includes(x));
  const timeChanged=JSON.stringify([...b.temporalStandings].sort())!==JSON.stringify([...a.temporalStandings].sort());
  const qualitiesChanged=JSON.stringify([...b.qualities].sort())!==JSON.stringify([...a.qualities].sort());
  const recognitionChanged=b.memberRecognition!==a.memberRecognition;

  let kind:AetherDeltaKind='unchanged';
  if(added.length>0&&removed.length===0) kind='intensified';
  else if(removed.length>0&&added.length===0) kind='dissipated';
  else if(added.length||removed.length||qualitiesChanged) kind='reconfigured';
  else if(timeChanged) kind='temporally_shifted';
  else if(recognitionChanged) kind='recognition_changed';

  return {
    patternRef:a.patternRef,motif:a.motif,kind,
    beforeFacetRefs:[...b.contributingFacetRefs],afterFacetRefs:[...a.contributingFacetRefs],
    addedFacetRefs:added,removedFacetRefs:removed,
    beforeTemporal:[...b.temporalStandings],afterTemporal:[...a.temporalStandings],
    beforeQualities:[...b.qualities],afterQualities:[...a.qualities],
    beforeRecognition:b.memberRecognition,afterRecognition:a.memberRecognition,
  };
}

export function compareMemberAetherFields(
  before:MemberAetherField,
  after:MemberAetherField,
):MemberAetherFieldDelta{
  const refs=unique([...before.patterns.map(p=>p.patternRef),...after.patterns.map(p=>p.patternRef)]);
  const patternDeltas=refs.map(ref=>patternDelta(
    before.patterns.find(p=>p.patternRef===ref),
    after.patterns.find(p=>p.patternRef===ref),
  ));

  const geometryBefore=deriveFieldGeometry(before);
  const geometryAfter=deriveFieldGeometry(after);
  const bm=new Map(geometryBefore.relations.map(r=>[r.relationRef,r]));
  const am=new Map(geometryAfter.relations.map(r=>[r.relationRef,r]));
  const addedRelations=[...am.values()].filter(r=>!bm.has(r.relationRef));
  const removedRelations=[...bm.values()].filter(r=>!am.has(r.relationRef));
  const strengthenedRelations:Array<{before:FieldRelation;after:FieldRelation}>=[];
  const weakenedRelations:Array<{before:FieldRelation;after:FieldRelation}>=[];

  for(const [ref,b] of bm){
    const a=am.get(ref); if(!a) continue;
    if(a.strength>b.strength) strengthenedRelations.push({before:b,after:a});
    if(a.strength<b.strength) weakenedRelations.push({before:b,after:a});
  }

  const geometryDelta={addedRelations,removedRelations,strengthenedRelations,weakenedRelations};
  const changed=
    patternDeltas.some(d=>d.kind!=='unchanged') ||
    addedRelations.length>0 || removedRelations.length>0 ||
    strengthenedRelations.length>0 || weakenedRelations.length>0;

  return {
    fromFieldRef:before.fieldRef,
    toFieldRef:after.fieldRef,
    patternDeltas,
    geometryBefore,
    geometryAfter,
    geometryDelta,
    changed,
    finalMeaningAuthority:'member',
    provisional:true,
  };
}

export function applyCorrectionAndCompare(
  field:MemberAetherField,
  correction:MemberAetherCorrection,
):{corrected:MemberAetherField;delta:MemberAetherFieldDelta}{
  const corrected=applyMemberAetherCorrection(field,correction);
  return {corrected,delta:compareMemberAetherFields(field,corrected)};
}
