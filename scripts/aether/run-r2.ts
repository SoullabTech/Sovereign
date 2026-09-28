import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { deriveMemberAetherField, type MemberFieldObservation } from '../../lib/ain/aether/benchmark/memberField';
import { compareMemberAetherFields, deriveFieldGeometry } from '../../lib/ain/aether/benchmark/fieldChange';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r2');
mkdirSync(OUT,{recursive:true});

function obs(
  observationRef:string,
  facetRef:string,
  motif:string,
  temporalStanding:'has_been'|'is_being'|'may_become',
  qualities:any[],
):MemberFieldObservation{
  return {
    observationRef,facetRef,motif,temporalStanding,qualities,
    standing:'member_named',
    note:observationRef,
  };
}

const before=deriveMemberAetherField('field:r2-before',[
  obs('grief:journal','journal','Grief','is_being',['tension']),
  obs('grief:relationship','relationship','Grief','is_being',['tension']),
  obs('fear:relationship','relationship','Fear','is_being',['tension']),
  obs('isolation:journal','journal','Isolation','is_being',['tension']),
],[{
  contradictionRef:'grief-fear',
  observationRefs:['grief:relationship','fear:relationship'],
  note:'Grief and fear are tightly linked in the earlier field.',
  status:'held_open',
}]);

const after=deriveMemberAetherField('field:r2-after',[
  obs('grief:journal','journal','Grief','is_being',['resonance']),
  obs('grief:relationship','relationship','Grief','is_being',['resonance']),
  obs('grief:creative','creative','Grief','is_being',['resonance','threshold']),
  obs('love:relationship','relationship','Love','is_being',['resonance']),
  obs('memory:journal','journal','Memory','is_being',['resonance']),
  obs('creativity:creative','creative','Creativity','may_become',['latency','resonance']),
]);

const delta=compareMemberAetherFields(before,after);
const grief=delta.patternDeltas.find(d=>d.motif==='Grief');
if(!grief) throw new Error('R2_GRIEF_DELTA_MISSING');

const evidence={
  generatedAt:new Date().toISOString(),
  parentR1:'44c3d9fe67a2d6b0d5cec28fd167443c1f7b6efd',
  before,
  after,
  geometryBefore:deriveFieldGeometry(before),
  geometryAfter:deriveFieldGeometry(after),
  delta,
  grief,
};

writeFileSync(OUT+'/r2-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r2-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR1:evidence.parentR1,
  changed:evidence.delta.changed,
  griefKind:evidence.grief.kind,
  griefAddedFacets:evidence.grief.addedFacetRefs,
  relationsBefore:evidence.geometryBefore.relations.length,
  relationsAfter:evidence.geometryAfter.relations.length,
  addedRelations:evidence.delta.geometryDelta.addedRelations.length,
  removedRelations:evidence.delta.geometryDelta.removedRelations.length,
  appearedMotifs:evidence.delta.patternDeltas.filter(x=>x.kind==='appeared').map(x=>x.motif),
  disappearedMotifs:evidence.delta.patternDeltas.filter(x=>x.kind==='disappeared').map(x=>x.motif),
  provisional:evidence.delta.provisional,
  memberOwnsFinalMeaning:evidence.delta.finalMeaningAuthority==='member',
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r2-summary.json','utf8')),null,2));
