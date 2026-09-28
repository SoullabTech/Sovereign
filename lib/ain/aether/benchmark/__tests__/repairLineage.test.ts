import { adjudicateHumanReviewRepair } from '../humanReviewRepair';
import {
  appendHumanReviewNode,
  createReflectionLineage,
  promoteAcceptedRepair,
  promotePriorReflectionAsNewHead,
  validateReflectionLineage,
} from '../repairLineage';

function acceptedRepair(ref:string,text:string){
  return adjudicateHumanReviewRepair({
    repairRef:ref,
    caseRef:'H04',
    adjudication:'technically_grounded_but_lifeless',
    correctionNote:'Refine the active reflection.',
    correctedReflection:text,
    claimKind:'spirals_related',
    spiralRefs:['work','creative'],
  });
}

describe('AIN-AETHER-01R14 repair lineage and active-head succession',()=>{
  test('starts with exactly one machine head',()=>{
    const lineage=createReflectionLineage('L1','machine:v0','Original machine reflection');
    expect(validateReflectionLineage(lineage)).toEqual({valid:true,errors:[]});
    expect(lineage.activeHeadRef).toBe('machine:v0');
  });

  test('human review appends history without becoming active head',()=>{
    const lineage=appendHumanReviewNode(
      createReflectionLineage('L1','machine:v0','Original machine reflection'),
      'human-review:H04:1',
    );
    expect(lineage.activeHeadRef).toBe('machine:v0');
    expect(lineage.nodes.find(n=>n.kind==='human_review')?.active).toBe(false);
  });

  test('accepted repair supersedes exactly one active head',()=>{
    const repair=acceptedRepair(
      'repair:v1',
      'I notice Work and Creative life seem to be gathering into a stronger relationship in the reflected field right now. Does that connection feel accurate to you?',
    );
    const lineage=promoteAcceptedRepair(
      createReflectionLineage('L1','machine:v0','Original machine reflection'),
      repair,
    );
    expect(lineage.activeHeadRef).toBe('repair:v1');
    expect(lineage.nodes.filter(n=>n.active)).toHaveLength(1);
    expect(lineage.nodes.find(n=>n.nodeRef==='machine:v0')?.supersededByRef).toBe('repair:v1');
  });

  test('second accepted repair creates succession without erasing v1',()=>{
    const r1=acceptedRepair(
      'repair:v1',
      'I notice Work and Creative life seem to be gathering into a stronger relationship in the reflected field right now. Does that connection feel accurate to you?',
    );
    const r2=acceptedRepair(
      'repair:v2',
      'Work and Creative life appear more closely related in the reflected field now. Is that useful to notice, or does it feel overstated?',
    );
    let lineage=createReflectionLineage('L1','machine:v0','Original machine reflection');
    lineage=promoteAcceptedRepair(lineage,r1);
    lineage=promoteAcceptedRepair(lineage,r2);
    expect(lineage.activeHeadRef).toBe('repair:v2');
    expect(lineage.nodes.find(n=>n.nodeRef==='repair:v1')).toBeDefined();
    expect(lineage.nodes.filter(n=>n.active)).toHaveLength(1);
  });

  test('rollback is represented as a new head rather than history rewrite',()=>{
    const r1=acceptedRepair(
      'repair:v1',
      'I notice Work and Creative life seem to be gathering into a stronger relationship in the reflected field right now. Does that connection feel accurate to you?',
    );
    let lineage=createReflectionLineage('L1','machine:v0','Original machine reflection');
    lineage=promoteAcceptedRepair(lineage,r1);
    lineage=promotePriorReflectionAsNewHead(lineage,'machine:v0','repair:v2-return-to-v0');
    expect(lineage.activeHeadRef).toBe('repair:v2-return-to-v0');
    expect(lineage.nodes.find(n=>n.nodeRef==='machine:v0')?.text).toBe('Original machine reflection');
    expect(lineage.nodes.filter(n=>n.active)).toHaveLength(1);
  });

  test('refuses promotion of a rejected repair',()=>{
    const rejected=adjudicateHumanReviewRepair({
      repairRef:'repair:bad',
      caseRef:'H05',
      adjudication:'beautiful_but_unsupported',
      correctionNote:'Tempting but unsupported.',
      correctedReflection:'I notice Family and Body seem to be moving in related ways. Does that feel true to you?',
      claimKind:'spirals_related',
      spiralRefs:['family','body'],
    });
    const lineage=createReflectionLineage('L1','machine:v0','Original machine reflection');
    expect(()=>promoteAcceptedRepair(lineage,rejected)).toThrow('LINEAGE_REPAIR_NOT_ACCEPTED');
  });
});
