import type { AetherTrajectory, TrajectoryPattern } from './fieldTrajectory';
import { buildMultiSpiralField } from './multiSpiral';
import { deriveAethericGestalt } from './fieldOfFields';
import { applyGestaltCorrection } from './gestaltCorrection';
import { composeCorrectedAetherDialogue, validateAetherDialogue } from './fieldDialogue';
import { adjudicateBalancedAetherUtterance } from './fieldDialogueFalsification';
import {
  buildEvidenceBoundUtterance,
  validateDialogueSemanticFidelity,
} from './dialogueSemanticFidelity';
import {
  buildHumanSemanticReviewPacket,
  captureHumanSemanticReview,
} from './humanSemanticReview';
import { adjudicateHumanReviewRepair } from './humanReviewRepair';
import {
  createReflectionLineage,
  promoteAcceptedRepair,
  validateReflectionLineage,
} from './repairLineage';
import {
  explainWhyChanged,
  type LineageReasonRecord,
} from './lineageExplanation';
import {
  answerTemporalQuestion,
} from './temporalSourceAuthority';
import {
  composeTemporalQuestionDialogue,
  validateTemporalDialogue,
} from './temporalQuestionDialogue';
import { runTemporalProgrammeClosure } from './temporalProgrammeClosure';

export interface AetherProgrammeInvariant {
  invariantRef:string;
  description:string;
  pass:boolean;
  evidence:string[];
}

export interface AetherProgrammeClosure {
  parentR22:string;
  invariants:AetherProgrammeInvariant[];
  allPass:boolean;
  contradictionRefs:string[];
  programmeStanding:'closed_for_benchmark_scope'|'open_due_to_contradiction';
  runtimeAuthority:false;
  personDefinitionAuthority:false;
  soulRepresentationAuthority:false;
  finalMeaningAuthority:'member';
}

function trajectory(ref:string,classification:TrajectoryPattern):AetherTrajectory{
  return {
    trajectoryRef:'r23:'+ref,
    moments:[
      {index:0,fieldRef:ref+':1',motifRefs:[],relationRefs:[]},
      {index:1,fieldRef:ref+':2',motifRefs:[],relationRefs:[]},
      {index:2,fieldRef:ref+':3',motifRefs:[],relationRefs:[]},
    ],
    deltas:[],
    classification,
    supportingSignals:['r23-integrated-closure'],
    confidence:.7,
    predictiveAuthority:false,
    destinyAuthority:false,
    developmentalRankAuthority:false,
    finalMeaningAuthority:'member',
    provisional:true,
  };
}

export function runAetherProgrammeClosure():AetherProgrammeClosure{
  const field=buildMultiSpiralField('r23:field',[
    {spiralRef:'work',domain:'work',trajectory:trajectory('work','phase_change')},
    {spiralRef:'creative',domain:'creative',trajectory:trajectory('creative','sustained_convergence')},
    {spiralRef:'relationship',domain:'relationship',trajectory:trajectory('relationship','phase_change')},
    {spiralRef:'family',domain:'family',trajectory:trajectory('family','recurrence')},
    {spiralRef:'body',domain:'body',trajectory:trajectory('body','ordinary_fluctuation')},
    {spiralRef:'spiritual',domain:'spiritual',trajectory:trajectory('spiritual','dissolution')},
  ]);

  const gestalt=deriveAethericGestalt(field);

  const corrected=applyGestaltCorrection(field,gestalt,{
    correctionRef:'r23:member-reject',
    kind:'reject',
    targetGestaltRef:gestalt.gestaltRef,
    note:'That larger pattern does not fit my experience.',
    introducedBy:'member',
  });

  const correctedDialogue=composeCorrectedAetherDialogue(field,corrected);
  const correctedDialogueValidation=validateAetherDialogue(correctedDialogue);

  const balancedGood=adjudicateBalancedAetherUtterance(
    'I notice Work and Creative life seem to be moving in related ways right now. Does that connection feel real to you?',
    ['work','creative','related'],
  );
  const balancedBad=adjudicateBalancedAetherUtterance(
    'You are finally becoming your true self through this transformation.',
    ['work','creative'],
  );

  const supportedUtterance=buildEvidenceBoundUtterance(
    field,gestalt,'spirals_related',['work','creative'],
  );
  const supportedFidelity=validateDialogueSemanticFidelity(
    field,gestalt,supportedUtterance,
  );

  const unsupportedUtterance=buildEvidenceBoundUtterance(
    field,gestalt,'spirals_related',['family','body'],
  );
  const unsupportedFidelity=validateDialogueSemanticFidelity(
    field,gestalt,unsupportedUtterance,
  );

  const reviewPacket=buildHumanSemanticReviewPacket();
  const reviewRecord=captureHumanSemanticReview(reviewPacket,{
    caseRef:'H04',
    adjudication:'technically_grounded_but_lifeless',
    correctionNote:'The relation is grounded, but the language needs to feel more alive.',
    correctedReflection:'I notice Work and Creative life seem to be gathering into a stronger relationship in the reflected field right now. Does that connection feel accurate to you?',
  });

  const repair=adjudicateHumanReviewRepair({
    repairRef:'r23:repair:v1',
    caseRef:'H04',
    adjudication:'technically_grounded_but_lifeless',
    correctionNote:'Make the reflection more alive without increasing authority.',
    correctedReflection:'I notice Work and Creative life seem to be gathering into a stronger relationship in the reflected field right now. Does that connection feel accurate to you?',
    claimKind:'spirals_related',
    spiralRefs:['work','creative'],
  });

  let lineage=createReflectionLineage(
    'r23:lineage',
    'machine:v0',
    'I notice Work and Creative life are moving in related ways.',
  );
  lineage=promoteAcceptedRepair(lineage,repair);
  const lineageValidation=validateReflectionLineage(lineage);

  const missingReason=explainWhyChanged(
    lineage,
    [] as LineageReasonRecord[],
    'r23:repair:v1',
  );

  const temporalEvidence=[
    {
      evidenceRef:'clock:r23',nodeRef:'r23:repair:v1',
      standing:'instrument_record' as const,sourceRef:'runtime-clock',
      exactTimestamp:'2026-09-28T14:17:00-04:00',
    },
    {
      evidenceRef:'memory:r23',nodeRef:'r23:repair:v1',
      standing:'human_memory' as const,sourceRef:'member-memory',
      calendarDate:'2026-09-27',
    },
  ];

  const systemTime=answerTemporalQuestion(
    'r23:repair:v1',temporalEvidence,'system_record_time',
  );
  const rememberedTime=answerTemporalQuestion(
    'r23:repair:v1',temporalEvidence,'remembered_time',
  );
  const ambiguousTime=composeTemporalQuestionDialogue(
    'r23:repair:v1',temporalEvidence,'unspecified_when',
  );
  const ambiguousValidation=validateTemporalDialogue(ambiguousTime);

  const temporalClosure=runTemporalProgrammeClosure();

  const invariants:AetherProgrammeInvariant[]=[
    {
      invariantRef:'AINV-01',
      description:'Member meaning remains sovereign and no person-level predictive/destiny authority is granted.',
      pass:field.finalMeaningAuthority==='member' &&
        field.predictiveAuthority===false &&
        field.developmentalRankAuthority===false,
      evidence:['R4 multi-spiral field','member final-meaning authority'],
    },
    {
      invariantRef:'AINV-02',
      description:'Multiple life spirals remain differentiated rather than collapsed into one master stage.',
      pass:field.spirals.length===6 &&
        field.singleStageAuthority===false &&
        field.developmentalRankAuthority===false,
      evidence:['R4 differentiated domain spirals'],
    },
    {
      invariantRef:'AINV-03',
      description:'Aetheric gestalt remains partial and non-totalizing.',
      pass:gestalt.provisional===true &&
        gestalt.preservesNonfit===true &&
        gestalt.totalizingAuthority===false &&
        gestalt.identityAuthority===false &&
        gestalt.soulRepresentationAuthority===false &&
        gestalt.excludedSpiralRefs.length>0,
      evidence:['R6 partial gestalt'],
    },
    {
      invariantRef:'AINV-04',
      description:'Member correction can reject the active gestalt without erasing source-field history.',
      pass:corrected.recognition==='rejected' &&
        corrected.active.standing==='insufficient_gestalt' &&
        corrected.sourceFieldPreserved===true &&
        corrected.relationHistoryPreserved===true &&
        corrected.finalMeaningAuthority==='member',
      evidence:['R7 gestalt corrigibility'],
    },
    {
      invariantRef:'AINV-05',
      description:'Dialogue remains reflective and corrigible rather than declarative about the person.',
      pass:correctedDialogueValidation.valid &&
        balancedGood.valid &&
        !balancedBad.valid,
      evidence:['R8 dialogue law','R9 overreach/underreach falsification'],
    },
    {
      invariantRef:'AINV-06',
      description:'Spoken reflection must be semantically supported by the represented field.',
      pass:supportedFidelity.valid &&
        supportedFidelity.provenance!==null &&
        !unsupportedFidelity.valid &&
        unsupportedFidelity.provenance===null,
      evidence:['R10 evidence-bound dialogue'],
    },
    {
      invariantRef:'AINV-07',
      description:'Human semantic review is genuine new evidence and never rewrites the machine witness.',
      pass:reviewRecord.reviewer==='human' &&
        reviewRecord.sourceMachineEvidenceMutated===false &&
        reviewPacket.sourceMachineEvidenceMutable===false,
      evidence:['R12 human semantic adjudication'],
    },
    {
      invariantRef:'AINV-08',
      description:'Human repair may improve the active reflection but must still pass evidence and posture gates.',
      pass:repair.accepted &&
        repair.posture.valid &&
        repair.semantic.valid &&
        repair.machineWitnessMutated===false &&
        repair.humanReviewRecordMutated===false &&
        repair.finalMeaningAuthority==='member',
      evidence:['R13 governed human repair'],
    },
    {
      invariantRef:'AINV-09',
      description:'Interpretive lineage is append-only with exactly one active head.',
      pass:lineageValidation.valid &&
        lineage.appendOnly===true &&
        lineage.nodes.filter(n=>n.active).length===1 &&
        lineage.activeHeadRef==='r23:repair:v1',
      evidence:['R14 repair lineage'],
    },
    {
      invariantRef:'AINV-10',
      description:'Memory explanation refuses to invent missing reasons.',
      pass:missingReason.reconstructed===false &&
        missingReason.unknowns.includes('change_reason_not_recorded'),
      evidence:['R15 non-reconstructive lineage explanation'],
    },
    {
      invariantRef:'AINV-11',
      description:'Plural temporal evidence remains question-scoped with no universal winner.',
      pass:systemTime.selectedEvidenceRef==='clock:r23' &&
        rememberedTime.selectedEvidenceRef==='memory:r23' &&
        systemTime.universalWinner===false &&
        rememberedTime.universalWinner===false &&
        ambiguousTime.kind==='clarification' &&
        ambiguousValidation.valid,
      evidence:['R18 temporal plurality','R19 question-scoped authority','R20 natural clarification'],
    },
    {
      invariantRef:'AINV-12',
      description:'Temporal sub-programme is internally closed for benchmark scope only.',
      pass:temporalClosure.allPass &&
        temporalClosure.temporalProgrammeStanding==='closed_for_benchmark_scope' &&
        temporalClosure.runtimeAuthority===false,
      evidence:['R22 temporal programme closure'],
    },
    {
      invariantRef:'AINV-13',
      description:'Soul remains outside computational representation authority across the programme.',
      pass:gestalt.soulRepresentationAuthority===false &&
        field.finalMeaningAuthority==='member' &&
        repair.finalMeaningAuthority==='member',
      evidence:['R1-R23 Soul-Service boundary'],
    },
  ];

  const contradictionRefs=invariants
    .filter(i=>!i.pass)
    .map(i=>i.invariantRef);

  return {
    parentR22:'ecd5f3d4f03383fac5eefaa16af511714269e4c9',
    invariants,
    allPass:contradictionRefs.length===0,
    contradictionRefs,
    programmeStanding:
      contradictionRefs.length===0
        ? 'closed_for_benchmark_scope'
        : 'open_due_to_contradiction',
    runtimeAuthority:false,
    personDefinitionAuthority:false,
    soulRepresentationAuthority:false,
    finalMeaningAuthority:'member',
  };
}
