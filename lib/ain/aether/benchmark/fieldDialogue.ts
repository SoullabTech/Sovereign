import type { MultiSpiralField } from './multiSpiral';
import type { AethericGestaltCandidate } from './fieldOfFields';
import type { CorrectedAethericGestalt } from './gestaltCorrection';

export type AetherDialogueAct=
  | 'reflect'
  | 'inquire'
  | 'offer_relation'
  | 'name_uncertainty'
  | 'honor_rejection'
  | 'invite_reshaping';

export interface AetherDialogueTurn {
  turnRef:string;
  act:AetherDialogueAct;
  text:string;
  referencedSpiralRefs:string[];
  referencedRelationRefs:string[];
  declarativePersonClaim:false;
  identityClaim:false;
  causalClaim:false;
  predictiveClaim:false;
  destinyClaim:false;
  diagnosticClaim:false;
  soulClaim:false;
  finalMeaningAuthority:'member';
}

export interface AetherDialogue {
  dialogueRef:string;
  turns:AetherDialogueTurn[];
  memberCorrectionInvited:true;
  finalMeaningAuthority:'member';
}

function humanize(ref:string){
  return ref.replace(/[-_]/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
}

function listNames(refs:string[]){
  const names=refs.map(humanize);
  if(names.length===0) return '';
  if(names.length===1) return names[0];
  if(names.length===2) return names.join(' and ');
  return names.slice(0,-1).join(', ')+', and '+names[names.length-1];
}

function turn(
  ref:string,
  act:AetherDialogueAct,
  text:string,
  spirals:string[],
  relations:string[]=[],
):AetherDialogueTurn{
  return {
    turnRef:ref,
    act,
    text,
    referencedSpiralRefs:[...spirals],
    referencedRelationRefs:[...relations],
    declarativePersonClaim:false,
    identityClaim:false,
    causalClaim:false,
    predictiveClaim:false,
    destinyClaim:false,
    diagnosticClaim:false,
    soulClaim:false,
    finalMeaningAuthority:'member',
  };
}

export function composeAetherDialogue(
  field:MultiSpiralField,
  gestalt:AethericGestaltCandidate,
):AetherDialogue{
  const names=listNames(gestalt.participatingSpiralRefs);
  const excluded=listNames(gestalt.excludedSpiralRefs);
  const turns:AetherDialogueTurn[]=[];

  if(gestalt.standing==='insufficient_gestalt'){
    turns.push(turn(
      'aether-dialogue:no-gestalt',
      'name_uncertainty',
      'I do not see enough in the current field to offer a larger pattern beyond the individual life areas.',
      [],
    ));
    turns.push(turn(
      'aether-dialogue:invite',
      'inquire',
      'Would you like to stay with one area, or notice whether a connection feels present that I am not seeing?',
      [],
    ));
  } else {
    turns.push(turn(
      'aether-dialogue:reflect',
      'reflect',
      `I notice ${names} are moving in related ways in the field right now.`,
      gestalt.participatingSpiralRefs,
      gestalt.supportingRelationRefs,
    ));
    turns.push(turn(
      'aether-dialogue:nonfit',
      'name_uncertainty',
      excluded
        ? `I am not including ${excluded} in that pattern; those areas seem to be moving differently or independently.`
        : 'I do not want to imply that this pattern accounts for the whole field.',
      gestalt.excludedSpiralRefs,
      gestalt.excludedRelationRefs,
    ));
    turns.push(turn(
      'aether-dialogue:inquire',
      'inquire',
      'Does that connection feel real to you, or am I bringing together things that are separate in your experience?',
      gestalt.participatingSpiralRefs,
      gestalt.supportingRelationRefs,
    ));
    turns.push(turn(
      'aether-dialogue:reshape',
      'invite_reshaping',
      'You can keep the pattern, reject it, or tell me which life areas belong together differently.',
      field.spirals.map(s=>s.spiralRef),
    ));
  }

  return {
    dialogueRef:'aether-dialogue:'+gestalt.gestaltRef,
    turns,
    memberCorrectionInvited:true,
    finalMeaningAuthority:'member',
  };
}

export function composeCorrectedAetherDialogue(
  field:MultiSpiralField,
  corrected:CorrectedAethericGestalt,
):AetherDialogue{
  if(corrected.recognition==='rejected'){
    return {
      dialogueRef:'aether-dialogue:corrected:'+corrected.active.gestaltRef,
      turns:[
        turn(
          'aether-dialogue:honor-rejection',
          'honor_rejection',
          'I will not use that larger pattern as an active interpretation. The underlying life areas and their histories remain available without forcing them into one story.',
          corrected.original.participatingSpiralRefs,
          corrected.original.supportingRelationRefs,
        ),
        turn(
          'aether-dialogue:after-rejection',
          'inquire',
          'What feels more faithful to how these parts of your life relate, if anything?',
          [],
        ),
      ],
      memberCorrectionInvited:true,
      finalMeaningAuthority:'member',
    };
  }
  return composeAetherDialogue(field,corrected.active);
}

const FORBIDDEN_PATTERNS:Array<[string,RegExp]>=[
  ['identity_you_are',/\byou are\b/i],
  ['identity_this_is_who_you_are',/\bwho you (?:really )?are\b/i],
  ['destiny_you_are_entering',/\byou(?:r life)? (?:are|is) entering\b/i],
  ['destiny_meant_to',/\byou are meant to\b/i],
  ['causal_because',/\b(?:work|creative|family|relationship|body|spiritual)[^.!?]{0,60}\bcaused\b/i],
  ['diagnostic',/\byou (?:have|meet criteria for|suffer from)\b/i],
  ['soul_claim',/\byour soul (?:is|wants|needs|has decided)\b/i],
  ['final_truth',/\bthe truth about you\b/i],
  ['pronouncement_transformation',/\byou are transforming\b/i],
];

export function validateAetherDialogue(dialogue:AetherDialogue){
  const errors:string[]=[];
  if(!dialogue.memberCorrectionInvited) errors.push('member_correction_not_invited');
  if(dialogue.finalMeaningAuthority!=='member') errors.push('final_meaning_not_member_owned');

  for(const t of dialogue.turns){
    if(t.declarativePersonClaim) errors.push('declarative_person_claim:'+t.turnRef);
    if(t.identityClaim) errors.push('identity_claim:'+t.turnRef);
    if(t.causalClaim) errors.push('causal_claim:'+t.turnRef);
    if(t.predictiveClaim) errors.push('predictive_claim:'+t.turnRef);
    if(t.destinyClaim) errors.push('destiny_claim:'+t.turnRef);
    if(t.diagnosticClaim) errors.push('diagnostic_claim:'+t.turnRef);
    if(t.soulClaim) errors.push('soul_claim:'+t.turnRef);
    if(t.finalMeaningAuthority!=='member') errors.push('turn_final_meaning_not_member_owned:'+t.turnRef);
    for(const [name,re] of FORBIDDEN_PATTERNS){
      if(re.test(t.text)) errors.push('forbidden_language:'+name+':'+t.turnRef);
    }
  }

  const hasInquiry=dialogue.turns.some(t=>t.act==='inquire'||t.act==='invite_reshaping');
  if(!hasInquiry) errors.push('dialogue_has_no_member_inquiry');

  return {valid:errors.length===0,errors};
}

export function adjudicateCandidateUtterance(text:string){
  const errors:string[]=[];
  for(const [name,re] of FORBIDDEN_PATTERNS){
    if(re.test(text)) errors.push(name);
  }

  const inquiry=/\?|does that|do you recognize|does this feel|would you/i.test(text);
  const provisional=/\b(?:I notice|seems|appears|may|might|provisional|right now|in the field)\b/i.test(text);

  if(!inquiry&&!provisional) errors.push('lacks_reflective_or_inquiry_posture');

  return {valid:errors.length===0,errors};
}
