import { adjudicateHumanReviewRepair } from '../humanReviewRepair';
import {
  createReflectionLineage,
  promoteAcceptedRepair,
  promotePriorReflectionAsNewHead,
} from '../repairLineage';
import {
  explainActiveHead,
  explainWhatChanged,
  explainWhyChanged,
  explainWhatMemberSaid,
  explainWhenSuperseded,
  validateLineageExplanation,
  type LineageReasonRecord,
} from '../lineageExplanation';

function repair(ref:string,text:string){
  return adjudicateHumanReviewRepair({
    repairRef:ref,
    caseRef:'H04',
    adjudication:'useful_but_incomplete',
    correctionNote:'Human requested a more faithful reflection.',
    correctedReflection:text,
    claimKind:'spirals_related',
    spiralRefs:['work','creative'],
  });
}

describe('AIN-AETHER-01R15 lineage query and temporal explanation',()=>{
  let lineage=createReflectionLineage('L15','machine:v0','Work and Creative are moving in related ways.');
  lineage=promoteAcceptedRepair(lineage,repair(
    'repair:v1',
    'I notice Work and Creative life seem more closely related in the reflected field. Does that feel accurate to you?',
  ));
  lineage=promoteAcceptedRepair(lineage,repair(
    'repair:v2',
    'Work and Creative life appear more closely related in the reflected field now. Is that useful to notice, or does it feel overstated?',
  ));

  const reasons:LineageReasonRecord[]=[
    {
      reasonRef:'reason:v1:human',
      nodeRef:'repair:v1',
      kind:'human_review_reason',
      note:'The original wording was grounded but too mechanical.',
      sourceRef:'human-review:H04:1',
    },
    {
      reasonRef:'reason:v2:human',
      nodeRef:'repair:v2',
      kind:'human_review_reason',
      note:'The member wanted a clearer opening to disagree with the strength of the relation.',
      sourceRef:'human-review:H04:2',
    },
  ];

  test('answers what is active from the recorded head only',()=>{
    const answer=explainActiveHead(lineage);
    expect(answer.answer).toContain('repair:v2');
    expect(answer.reconstructed).toBe(false);
    expect(validateLineageExplanation(answer)).toEqual({valid:true,errors:[]});
  });

  test('answers what changed from preserved node text',()=>{
    const answer=explainWhatChanged(lineage,'repair:v1','repair:v2');
    expect(answer.answer).toMatch(/changed from/i);
    expect(answer.evidenceNodeRefs).toEqual(['repair:v1','repair:v2']);
  });

  test('answers why from preserved reason evidence',()=>{
    const answer=explainWhyChanged(lineage,reasons,'repair:v2');
    expect(answer.answer).toMatch(/clearer opening to disagree/i);
    expect(answer.evidenceReasonRefs).toContain('reason:v2:human');
  });

  test('refuses to invent a reason when no reason record exists',()=>{
    const answer=explainWhyChanged(lineage,[],'repair:v2');
    expect(answer.answer).toMatch(/does not record why/i);
    expect(answer.unknowns).toContain('change_reason_not_recorded');
    expect(answer.reconstructed).toBe(false);
  });

  test('can say what the member said only when that note is preserved',()=>{
    const answer=explainWhatMemberSaid(lineage,reasons,'repair:v1');
    expect(answer.answer).toMatch(/too mechanical/i);
    const missing=explainWhatMemberSaid(lineage,[],'repair:v1');
    expect(missing.answer).toMatch(/does not preserve a human correction note/i);
  });

  test('supersession explanation uses recorded successor and rollback remains new history',()=>{
    const superseded=explainWhenSuperseded(lineage,'repair:v1');
    expect(superseded.answer).toContain('repair:v2');

    const rolled=promotePriorReflectionAsNewHead(
      lineage,'repair:v1','repair:v3-return-to-v1',
    );
    const current=explainActiveHead(rolled);
    expect(current.answer).toContain('repair:v3-return-to-v1');
    expect(rolled.nodes.find(n=>n.nodeRef==='repair:v2')).toBeDefined();
  });
});
