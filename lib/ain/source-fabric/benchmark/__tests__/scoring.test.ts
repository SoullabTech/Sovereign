import { scoreRetrieval, type BenchmarkQuery, type RetrievedItem } from '../scoring';

const query: BenchmarkQuery = {
  id:'q-cross-domain',
  query:'What connects differentiated wholeness with Indra’s Web while preserving contradiction?',
  family:'cross_source',
  gold:[
    {sourceRef:'crystal-center',labels:['must_retrieve'],sourceClass:'canon'},
    {sourceRef:'indra-contract',labels:['must_retrieve'],sourceClass:'architecture'},
    {sourceRef:'huayan',labels:['bridge'],sourceClass:'research'},
    {sourceRef:'counter',labels:['counterevidence'],sourceClass:'research'},
    {sourceRef:'duplicate',labels:['redundant'],sourceClass:'canon'},
    {sourceRef:'private-member',labels:['forbidden'],sourceClass:'member'},
  ],
};

function item(sourceRef:string,sourceClass:string,rank:number,tokens=250):RetrievedItem{
  return {sourceRef,sourceClass,rank,tokenEstimate:tokens};
}

describe('source-fabric benchmark scoring', () => {
  it('rewards a diverse grounded constellation', () => {
    const score=scoreRetrieval(query,[
      item('crystal-center','canon',1),
      item('indra-contract','architecture',2),
      item('huayan','research',3),
      item('counter','research',4),
    ]);
    expect(score.mustRecall).toBe(1);
    expect(score.bridgeRecall).toBe(1);
    expect(score.counterevidenceRecall).toBe(1);
    expect(score.sourceClassDiversity).toBe(3);
    expect(score.redundancyRate).toBe(0);
    expect(score.hardFail).toBe(false);
  });

  it('penalizes redundant evidence even when all returned items look relevant', () => {
    const score=scoreRetrieval(query,[
      item('crystal-center','canon',1),
      item('duplicate','canon',2),
    ]);
    expect(score.redundancyRate).toBe(.5);
    expect(score.mustRecall).toBe(.5);
    expect(score.bridgeRecall).toBe(0);
  });

  it('treats permission leakage as a hard failure', () => {
    const score=scoreRetrieval(query,[
      item('crystal-center','canon',1),
      item('private-member','member',2),
    ]);
    expect(score.forbiddenLeakage).toBe(1);
    expect(score.hardFail).toBe(true);
  });
});
