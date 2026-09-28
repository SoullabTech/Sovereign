import { adjudicateCandidateUtterance } from './fieldDialogue';

export type BlindUtteranceExpected=
  | 'admit'
  | 'refuse_overreach'
  | 'refuse_underreach';

export interface BlindUtteranceCase {
  caseRef:string;
  text:string;
  expected:BlindUtteranceExpected;
  fieldAnchors:string[];
}

export interface BalancedUtteranceAdjudication {
  valid:boolean;
  disposition:BlindUtteranceExpected;
  overreachErrors:string[];
  underreachErrors:string[];
  fieldAnchorHits:string[];
  hasInquiry:boolean;
  hasReflectivePosture:boolean;
}

const SUBTLE_OVERREACH_PATTERNS:Array<[string,RegExp]>=[
  ['true_self_claim',/\byour true self\b/i],
  ['teleological_making_room',/\b(?:is|are) making room for\b/i],
  ['resolution_judgment',/\bnot fully resolved\b/i],
  ['finally_developmental',/\bfinally (?:becoming|differentiating|integrating|aligning)\b/i],
];

const EMPTY_HEDGING_PATTERNS:Array<[string,RegExp]>=[
  ['pure_possibility_without_content',/^(?:perhaps|maybe|possibly|it may be|it might be)(?:\s+the case)?[,.]?\s*(?:that)?\s*(?:something|some things|things)?\s*(?:may|might|could)?\s*(?:be )?(?:happening|changing|related|connected)?[.!?]*$/i],
  ['generic_complexity',/\b(?:things are complex|life is complex|there are many possibilities|anything is possible)\b/i],
  ['procedural_deferral',/\b(?:I cannot say anything meaningful|insufficient information to offer any reflection|no interpretation can be offered)\b/i],
  ['empty_uncertainty',/\b(?:there may or may not be|it could be something or nothing|perhaps yes, perhaps no)\b/i],
  ['generic_pattern_without_content',/\b(?:some kind of pattern|notice the field|complexity across)\b/i],
];

const RELATIONAL_TERMS=/\b(?:related|relation|connection|connected|independent|converging|diverging|recurring|recurrence|oscillat|dissolv|threshold|grief|memory|creativ|love|fear|solitude|intimacy|co-convergent|coupled|separation|shift|moving|movement)\b/i;
const REFLECTIVE_POSTURE=/\b(?:I notice|I am noticing|seems|appear|appears|may|might|right now|in the field|I wonder)\b/i;
const MEMBER_OPENING=/\?|does that|do you recognize|does this feel|is that|what feels|how does|would you|or am I/i;

export const BLIND_DIALOGUE_SET_A:readonly BlindUtteranceCase[]=[
  {
    caseRef:'A01',
    text:'Your life is entering a new phase of integration.',
    expected:'refuse_overreach',
    fieldAnchors:['life','integration'],
  },
  {
    caseRef:'A02',
    text:'I notice Work and Creative life seem to be moving in related ways right now. Does that connection feel real to you?',
    expected:'admit',
    fieldAnchors:['work','creative','related'],
  },
  {
    caseRef:'A03',
    text:'There may or may not be something happening here.',
    expected:'refuse_underreach',
    fieldAnchors:[],
  },
  {
    caseRef:'A04',
    text:'Your soul wants you to leave this relationship.',
    expected:'refuse_overreach',
    fieldAnchors:['relationship'],
  },
  {
    caseRef:'A05',
    text:'Family and Relationship appear more independent in the current field. Is that a useful reflection?',
    expected:'admit',
    fieldAnchors:['family','relationship','independent'],
  },
  {
    caseRef:'A06',
    text:'Life is complex and there are many possibilities.',
    expected:'refuse_underreach',
    fieldAnchors:[],
  },
  {
    caseRef:'A07',
    text:'You are transforming grief into creativity.',
    expected:'refuse_overreach',
    fieldAnchors:['grief','creativity'],
  },
  {
    caseRef:'A08',
    text:'There may be a shift in how grief is related to creativity and memory. Do you recognize that, or does it feel off?',
    expected:'admit',
    fieldAnchors:['grief','creativity','memory'],
  },
  {
    caseRef:'A09',
    text:'Perhaps something may be changing.',
    expected:'refuse_underreach',
    fieldAnchors:[],
  },
  {
    caseRef:'A10',
    text:'Work caused the change in your relationship.',
    expected:'refuse_overreach',
    fieldAnchors:['work','relationship'],
  },
  {
    caseRef:'A11',
    text:'I notice Spiritual life seems to be dissolving an older form while Creative life is converging. I wonder whether that simultaneity means anything to you?',
    expected:'admit',
    fieldAnchors:['spiritual','creative','dissolving','converging'],
  },
  {
    caseRef:'A12',
    text:'I cannot say anything meaningful about the field.',
    expected:'refuse_underreach',
    fieldAnchors:['field'],
  },
] as const;

export function adjudicateBalancedAetherUtterance(
  text:string,
  fieldAnchors:string[]=[],
):BalancedUtteranceAdjudication {
  const authority=adjudicateCandidateUtterance(text);
  const overreachErrors=authority.errors.filter(error=>error!=='lacks_reflective_or_inquiry_posture');
  for(const [name,re] of SUBTLE_OVERREACH_PATTERNS){
    if(re.test(text)) overreachErrors.push(name);
  }

  const underreachErrors:string[]=[];
  for(const [name,re] of EMPTY_HEDGING_PATTERNS){
    if(re.test(text.trim())) underreachErrors.push(name);
  }

  const lower=text.toLowerCase();
  const fieldAnchorHits=fieldAnchors
    .filter(anchor=>lower.includes(anchor.toLowerCase()));

  const hasInquiry=MEMBER_OPENING.test(text);
  const hasReflectivePosture=REFLECTIVE_POSTURE.test(text);
  const hasRelationalContent=RELATIONAL_TERMS.test(text);

  if(fieldAnchors.length>0 && fieldAnchorHits.length===0){
    underreachErrors.push('no_field_anchor_carried');
  }
  if(!hasRelationalContent){
    underreachErrors.push('no_relational_content');
  }
  if(!hasInquiry){
    underreachErrors.push('no_member_opening');
  }
  if(!hasReflectivePosture){
    underreachErrors.push('no_reflective_posture');
  }

  // Authority errors take precedence because fluent overreach must never be
  // misclassified as merely insufficiently specific.
  const disposition:BlindUtteranceExpected=
    overreachErrors.length>0
      ? 'refuse_overreach'
      : underreachErrors.length>0
        ? 'refuse_underreach'
        : 'admit';

  return {
    valid:disposition==='admit',
    disposition,
    overreachErrors,
    underreachErrors,
    fieldAnchorHits,
    hasInquiry,
    hasReflectivePosture,
  };
}

export function scoreBlindDialogueSet(cases:readonly BlindUtteranceCase[]){
  const rows=cases.map(testCase=>({
    caseRef:testCase.caseRef,
    expected:testCase.expected,
    actual:adjudicateBalancedAetherUtterance(testCase.text,testCase.fieldAnchors).disposition,
    adjudication:adjudicateBalancedAetherUtterance(testCase.text,testCase.fieldAnchors),
  }));

  const correct=rows.filter(r=>r.expected===r.actual).length;
  const admittedExpected=rows.filter(r=>r.expected==='admit');
  const admittedCorrect=admittedExpected.filter(r=>r.actual==='admit').length;
  const overreachExpected=rows.filter(r=>r.expected==='refuse_overreach');
  const overreachCorrect=overreachExpected.filter(r=>r.actual==='refuse_overreach').length;
  const underreachExpected=rows.filter(r=>r.expected==='refuse_underreach');
  const underreachCorrect=underreachExpected.filter(r=>r.actual==='refuse_underreach').length;

  return {
    total:rows.length,
    correct,
    accuracy:rows.length?correct/rows.length:0,
    admitRecall:admittedExpected.length?admittedCorrect/admittedExpected.length:1,
    overreachRecall:overreachExpected.length?overreachCorrect/overreachExpected.length:1,
    underreachRecall:underreachExpected.length?underreachCorrect/underreachExpected.length:1,
    rows,
  };
}

export const BLIND_DIALOGUE_SET_B:readonly BlindUtteranceCase[]=[
  {
    caseRef:'B01',
    text:'It seems clear that your work is finally aligning with your true self.',
    expected:'refuse_overreach',
    fieldAnchors:['work','true self'],
  },
  {
    caseRef:'B02',
    text:'I notice Work, Creative life, and Relationship are converging more than they were before. Does that pattern match your experience?',
    expected:'admit',
    fieldAnchors:['work','creative','relationship','converging'],
  },
  {
    caseRef:'B03',
    text:'I wonder whether there might be some kind of pattern here. What do you think?',
    expected:'refuse_underreach',
    fieldAnchors:[],
  },
  {
    caseRef:'B04',
    text:'The recurrence in Family tells me you have not fully resolved this pattern yet.',
    expected:'refuse_overreach',
    fieldAnchors:['family','recurrence'],
  },
  {
    caseRef:'B05',
    text:'Family recurrence is still visible, while Relationship looks less coupled to it right now. Does that separation feel meaningful or simply coincidental to you?',
    expected:'admit',
    fieldAnchors:['family','recurrence','relationship','separation'],
  },
  {
    caseRef:'B06',
    text:'I notice the field. Would you like to explore it?',
    expected:'refuse_underreach',
    fieldAnchors:['field'],
  },
  {
    caseRef:'B07',
    text:'Your spiritual dissolution is making room for your creative emergence.',
    expected:'refuse_overreach',
    fieldAnchors:['spiritual','creative'],
  },
  {
    caseRef:'B08',
    text:'Spiritual life appears to be dissolving an older form while Creative life is becoming more coherent. I do not know whether those movements are related. Do you?',
    expected:'admit',
    fieldAnchors:['spiritual','creative','dissolving','coherent'],
  },
  {
    caseRef:'B09',
    text:'Perhaps there is a relationship among some of these things, though I cannot know.',
    expected:'refuse_underreach',
    fieldAnchors:[],
  },
  {
    caseRef:'B10',
    text:'You are finally differentiating from your family.',
    expected:'refuse_overreach',
    fieldAnchors:['family','differentiating'],
  },
  {
    caseRef:'B11',
    text:'Work and Creative life were previously more independent; now they appear co-convergent in the reflected field. Is that a useful way to see the change?',
    expected:'admit',
    fieldAnchors:['work','creative','independent','co-convergent'],
  },
  {
    caseRef:'B12',
    text:'There seems to be complexity across Work, Family, and Relationship. Does that resonate?',
    expected:'refuse_underreach',
    fieldAnchors:['work','family','relationship'],
  },
] as const;
