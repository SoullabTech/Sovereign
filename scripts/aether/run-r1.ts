import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  applyMemberAetherCorrection,
  deriveMemberAetherField,
  validateMemberAetherField,
  type MemberFieldObservation,
} from '../../lib/ain/aether/benchmark/memberField';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r1');
mkdirSync(OUT,{recursive:true});

const observations:MemberFieldObservation[]=[
  {
    observationRef:'journal:courage',
    facetRef:'journal',
    motif:'Courage',
    temporalStanding:'has_been',
    standing:'member_named',
    qualities:['resonance'],
    note:'Earlier member-authored reflection named courage.',
  },
  {
    observationRef:'work:courage',
    facetRef:'work',
    motif:'Courage',
    temporalStanding:'is_being',
    standing:'source_observed',
    qualities:['directionality','threshold'],
    note:'Current work material carries a courage motif.',
  },
  {
    observationRef:'dream:courage',
    facetRef:'dream',
    motif:'Courage',
    temporalStanding:'may_become',
    standing:'maia_hypothesis',
    qualities:['latency','resonance'],
    note:'Dream material may resonate with the motif.',
  },
  {
    observationRef:'relationship:solitude',
    facetRef:'relationship',
    motif:'Solitude',
    temporalStanding:'is_being',
    standing:'member_named',
    qualities:['tension'],
    note:'The member names a current need for solitude.',
  },
  {
    observationRef:'relationship:intimacy',
    facetRef:'relationship',
    motif:'Intimacy',
    temporalStanding:'is_being',
    standing:'member_named',
    qualities:['resonance'],
    note:'The member also names longing for intimacy.',
  },
];

const field=deriveMemberAetherField(
  'member-field:r1-witness',
  observations,
  [{
    contradictionRef:'relationship:solitude-intimacy',
    observationRefs:['relationship:solitude','relationship:intimacy'],
    note:'Solitude and intimacy are both presently meaningful.',
    status:'held_open',
  }],
  [{
    absenceRef:'work-next-form',
    subject:'the exact next form of work',
    status:'latent',
    note:'Direction may be present while concrete form remains unknown.',
  }],
);

const courage=field.patterns.find(p=>p.motif==='Courage');
if(!courage) throw new Error('R1_COURAGE_PATTERN_MISSING');

const rejected=applyMemberAetherCorrection(field,{
  correctionRef:'member:reject-courage-gestalt',
  kind:'meaning',
  targetRef:courage.patternRef,
  effect:'reject_pattern',
  note:'These do not feel like one pattern to me.',
  introducedBy:'member',
});

const temporal=applyMemberAetherCorrection(field,{
  correctionRef:'member:dream-is-historical',
  kind:'temporal',
  targetRef:'dream:courage',
  effect:'mark_historical',
  note:'That dream belongs to an earlier period.',
  introducedBy:'member',
});

const excluded=applyMemberAetherCorrection(field,{
  correctionRef:'member:dream-not-relevant',
  kind:'relevance',
  targetRef:'dream:courage',
  effect:'exclude',
  note:'Do not use this dream in this inquiry.',
  introducedBy:'member',
});

const evidence={
  generatedAt:new Date().toISOString(),
  parentSourceFabric:'f4fa850243fbd7c19fb2186b9ecb34b3d447cde2',
  field,
  validation:validateMemberAetherField(field),
  couragePattern:courage,
  correctionWitness:{
    rejectedRecognition:rejected.patterns.find(p=>p.patternRef===courage.patternRef)?.memberRecognition??null,
    rejectionPreservedObservationCount:rejected.observations.length,
    temporalStandingAfter:temporal.observations.find(o=>o.observationRef==='dream:courage')?.temporalStanding??null,
    temporalPatternStandings:temporal.patterns.find(p=>p.motif==='Courage')?.temporalStandings??[],
    exclusionRemovedObservation:!excluded.observations.some(o=>o.observationRef==='dream:courage'),
    exclusionRemovedFacet:!excluded.patterns.find(p=>p.motif==='Courage')?.contributingFacetRefs.includes('dream'),
  },
};

writeFileSync(OUT+'/r1-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r1-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentSourceFabric:evidence.parentSourceFabric,
  valid:evidence.validation.valid,
  patternCount:evidence.field.patterns.length,
  contradictionCount:evidence.field.contradictions.length,
  absenceCount:evidence.field.absences.length,
  courageFacets:evidence.couragePattern.contributingFacetRefs,
  courageTemporalStandings:evidence.couragePattern.temporalStandings,
  courageMovements:evidence.couragePattern.movements,
  memberOwnsFinalMeaning:evidence.field.finalMeaningAuthority==='member',
  persistenceAuthority:evidence.field.persistenceAuthority,
  rejectionPreservesSources:evidence.correctionWitness.rejectionPreservedObservationCount===field.observations.length,
  temporalCorrectionRecomputes:
    evidence.correctionWitness.temporalStandingAfter==='has_been' &&
    !evidence.correctionWitness.temporalPatternStandings.includes('may_become'),
  exclusionRecomputes:
    evidence.correctionWitness.exclusionRemovedObservation &&
    evidence.correctionWitness.exclusionRemovedFacet,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r1-summary.json','utf8')),null,2));
