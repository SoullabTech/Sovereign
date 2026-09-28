import type { AetherTrajectory, TrajectoryPattern } from './fieldTrajectory';
import { buildMultiSpiralField, type LifeDomain, type MultiSpiralField } from './multiSpiral';
import { deriveAethericGestalt, type AethericGestaltCandidate } from './fieldOfFields';
import {
  buildEvidenceBoundUtterance,
  validateDialogueSemanticFidelity,
  type DialogueClaimKind,
  type DialogueSemanticFidelityResult,
  type EvidenceBoundUtterance,
} from './dialogueSemanticFidelity';

export type HumanSemanticAdjudication=
  | 'semantically_faithful'
  | 'useful_but_incomplete'
  | 'technically_grounded_but_lifeless'
  | 'overinterpreted'
  | 'beautiful_but_unsupported'
  | 'wrong_relation'
  | 'appropriate_refusal';

export interface HeldOutSpiralSpec {
  spiralRef:string;
  domain:LifeDomain;
  classification:TrajectoryPattern;
}

export interface HeldOutDialogueSpec {
  caseRef:string;
  description:string;
  spirals:HeldOutSpiralSpec[];
  claimKind:DialogueClaimKind;
  claimSpiralRefs:string[];
  machineExpectation:'admit'|'refuse';
  humanReviewRequired:true;
}

export interface HeldOutDialogueResult {
  caseRef:string;
  description:string;
  field:MultiSpiralField;
  gestalt:AethericGestaltCandidate;
  utterance:EvidenceBoundUtterance;
  machineResult:DialogueSemanticFidelityResult;
  machineExpectation:'admit'|'refuse';
  machineExpectationMet:boolean;
  humanReview:{
    required:true;
    status:'pending';
    allowedAdjudications:HumanSemanticAdjudication[];
    questions:string[];
  };
}

function trajectory(ref:string,classification:TrajectoryPattern):AetherTrajectory{
  return {
    trajectoryRef:'heldout:'+ref,
    moments:[
      {index:0,fieldRef:ref+':1',motifRefs:[],relationRefs:[]},
      {index:1,fieldRef:ref+':2',motifRefs:[],relationRefs:[]},
      {index:2,fieldRef:ref+':3',motifRefs:[],relationRefs:[]},
    ],
    deltas:[],
    classification,
    supportingSignals:['held-out-r11'],
    confidence:.7,
    predictiveAuthority:false,
    destinyAuthority:false,
    developmentalRankAuthority:false,
    finalMeaningAuthority:'member',
    provisional:true,
  };
}

export const HELD_OUT_DIALOGUE_SET:readonly HeldOutDialogueSpec[]=[
  {
    caseRef:'H01',
    description:'Work dissolution alongside Relationship convergence and Body recurrence.',
    spirals:[
      {spiralRef:'work',domain:'work',classification:'dissolution'},
      {spiralRef:'relationship',domain:'relationship',classification:'sustained_convergence'},
      {spiralRef:'body',domain:'body',classification:'recurrence'},
      {spiralRef:'creative',domain:'creative',classification:'ordinary_fluctuation'},
    ],
    claimKind:'trajectory_pair',
    claimSpiralRefs:['work','relationship'],
    machineExpectation:'admit',
    humanReviewRequired:true,
  },
  {
    caseRef:'H02',
    description:'Family oscillation with Creative phase change and Spiritual recurrence.',
    spirals:[
      {spiralRef:'family',domain:'family',classification:'oscillation'},
      {spiralRef:'creative',domain:'creative',classification:'phase_change'},
      {spiralRef:'spiritual',domain:'spiritual',classification:'recurrence'},
      {spiralRef:'community',domain:'community',classification:'ordinary_fluctuation'},
    ],
    claimKind:'trajectory_pair',
    claimSpiralRefs:['family','creative'],
    machineExpectation:'admit',
    humanReviewRequired:true,
  },
  {
    caseRef:'H03',
    description:'Mostly independent domains with no legitimate higher-order relation.',
    spirals:[
      {spiralRef:'family',domain:'family',classification:'recurrence'},
      {spiralRef:'body',domain:'body',classification:'ordinary_fluctuation'},
      {spiralRef:'community',domain:'community',classification:'ordinary_fluctuation'},
      {spiralRef:'work',domain:'work',classification:'ordinary_fluctuation'},
    ],
    claimKind:'spirals_more_independent',
    claimSpiralRefs:['family','body'],
    machineExpectation:'admit',
    humanReviewRequired:true,
  },
  {
    caseRef:'H04',
    description:'Strong convergence across Work and Creative with Relationship oscillation.',
    spirals:[
      {spiralRef:'work',domain:'work',classification:'phase_change'},
      {spiralRef:'creative',domain:'creative',classification:'sustained_convergence'},
      {spiralRef:'relationship',domain:'relationship',classification:'oscillation'},
      {spiralRef:'body',domain:'body',classification:'ordinary_fluctuation'},
    ],
    claimKind:'spirals_related',
    claimSpiralRefs:['work','creative'],
    machineExpectation:'admit',
    humanReviewRequired:true,
  },
  {
    caseRef:'H05',
    description:'Tempting but unsupported beautiful synthesis across independent Family and Body.',
    spirals:[
      {spiralRef:'family',domain:'family',classification:'recurrence'},
      {spiralRef:'body',domain:'body',classification:'ordinary_fluctuation'},
      {spiralRef:'creative',domain:'creative',classification:'sustained_convergence'},
      {spiralRef:'spiritual',domain:'spiritual',classification:'dissolution'},
    ],
    claimKind:'spirals_related',
    claimSpiralRefs:['family','body'],
    machineExpectation:'refuse',
    humanReviewRequired:true,
  },
] as const;

const ADJUDICATIONS:HumanSemanticAdjudication[]=[
  'semantically_faithful',
  'useful_but_incomplete',
  'technically_grounded_but_lifeless',
  'overinterpreted',
  'beautiful_but_unsupported',
  'wrong_relation',
  'appropriate_refusal',
];

export function runHeldOutDialogueCase(spec:HeldOutDialogueSpec):HeldOutDialogueResult{
  const field=buildMultiSpiralField(
    'heldout-field:'+spec.caseRef,
    spec.spirals.map(s=>({
      spiralRef:s.spiralRef,
      domain:s.domain,
      trajectory:trajectory(s.spiralRef,s.classification),
    })),
  );
  const gestalt=deriveAethericGestalt(field);
  const utterance=buildEvidenceBoundUtterance(
    field,
    gestalt,
    spec.claimKind,
    spec.claimSpiralRefs,
  );
  const machineResult=validateDialogueSemanticFidelity(field,gestalt,utterance);
  const actual=machineResult.valid?'admit':'refuse';

  return {
    caseRef:spec.caseRef,
    description:spec.description,
    field,
    gestalt,
    utterance,
    machineResult,
    machineExpectation:spec.machineExpectation,
    machineExpectationMet:actual===spec.machineExpectation,
    humanReview:{
      required:true,
      status:'pending',
      allowedAdjudications:[...ADJUDICATIONS],
      questions:[
        'Is the reflection semantically faithful to the represented field?',
        'Is it specific enough to be useful without overinterpreting?',
        'Does the language preserve what does not fit?',
        'Would a human reader understand why this reflection was offered?',
        'Is the reflection alive and relational rather than merely technically correct?',
        'If refused, was refusal appropriate rather than over-cautious?',
      ],
    },
  };
}

export function runHeldOutDialogueSet(
  specs:readonly HeldOutDialogueSpec[]=HELD_OUT_DIALOGUE_SET,
){
  const results=specs.map(runHeldOutDialogueCase);
  return {
    frozenCaseCount:specs.length,
    machineExpectationPassCount:results.filter(r=>r.machineExpectationMet).length,
    allMachineExpectationsMet:results.every(r=>r.machineExpectationMet),
    allHumanReviewsPending:results.every(r=>r.humanReview.status==='pending'),
    results,
  };
}
