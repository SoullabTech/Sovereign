import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root=resolve(__dirname,'../../../../..');
const r4g=JSON.parse(readFileSync(
  resolve(root,'docs/programme/AIN-SOURCE-FABRIC-02/r4g/r4g-summary.json'),
  'utf8',
));
const r3=JSON.parse(readFileSync(
  resolve(root,'docs/programme/AIN-SOURCE-FABRIC-02/r3/r3-summary.json'),
  'utf8',
));

describe('AIN-SOURCE-FABRIC-02R4G graph/community evidence',()=>{
  const accepted=r4g.methods.graph_shadow_community;
  const direct=r4g.methods.direct_graph_falsifier;
  const final=r4g.methods.final_with_abstention;
  const r3Final=r3.methods.callosal_abstention;

  it('anchors graph expansion behind the successful Blind C gate',()=>{
    expect(r4g.parentBlindPass).toBe('566a358c7826a3df4038e0e27f79e8269ce6a076');
    expect(r4g.parameters.acceptedGraphBonus).toBe(0);
    expect(r4g.parameters.acceptedCommunityBonus).toBe(.002);
  });

  it('community context improves must recall over R3 without reducing bridge or counterevidence recall',()=>{
    expect(accepted.mustRecall).toBeGreaterThan(r3Final.mustRecall);
    expect(accepted.mustRecall).toBeGreaterThan(.96);
    expect(accepted.bridgeRecall).toBeGreaterThan(.98);
    expect(accepted.counterevidenceRecall).toBe(1);
  });

  it('improves the previously weak global and diversity families',()=>{
    expect(accepted.globalMustRecall).toBeGreaterThan(.88);
    expect(accepted.diversityMustRecall).toBeGreaterThan(.88);
  });

  it('falsifies direct graph rank authority',()=>{
    expect(direct.mustRecall).toBeLessThan(accepted.mustRecall);
    expect(direct.globalMustRecall).toBeLessThan(accepted.globalMustRecall);
    expect(direct.diversityMustRecall).toBeLessThan(accepted.diversityMustRecall);
  });

  it('preserves answerability after community expansion',()=>{
    expect(final.abstainedQueries).toBe(6);
    expect(final.positiveFalseAbstentions).toBe(0);
    expect(final.negativeFalsePositiveQueries).toBe(0);
    expect(final.hardFailQueries).toBe(0);
  });

  it('keeps one-hop graph discovery bounded and communities explicit',()=>{
    expect(final.avgExpandedNeighbors).toBeGreaterThan(0);
    expect(final.avgExpandedNeighbors).toBeLessThanOrEqual(18);
    expect(final.queriesWithActiveCommunities).toBe(12);
  });
});
