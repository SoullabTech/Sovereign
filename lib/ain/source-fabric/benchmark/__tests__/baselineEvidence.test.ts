import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(root,'docs/programme/AIN-SOURCE-FABRIC-02/baseline/baseline-summary.json'),
  'utf8',
));
const complementarity=JSON.parse(readFileSync(
  resolve(root,'docs/programme/AIN-SOURCE-FABRIC-02/baseline/complementarity-diagnostic.json'),
  'utf8',
));
const chunks=JSON.parse(readFileSync(
  resolve(root,'docs/programme/AIN-SOURCE-FABRIC-02/baseline/chunk-manifest.json'),
  'utf8',
));

describe('AIN-SOURCE-FABRIC-02R2 baseline evidence',()=>{
  const rawBm25=summary.methods['bm25-raw'].overall;
  const govBm25=summary.methods['bm25-governed'].overall;
  const rawSem=summary.methods['semantic-raw'].overall;
  const govSem=summary.methods['semantic-governed'].overall;

  it('uses the fixed 26-source / 1735-chunk corpus',()=>{
    expect(summary.corpus).toEqual({sources:26,chunks:1735});
    expect(chunks.chunkCount).toBe(1735);
    expect(chunks.tokenEstimate).toBe(95808);
  });

  it('governance removes permission hard-fails without reducing must recall',()=>{
    expect(rawBm25.hardFailQueries).toBeGreaterThan(0);
    expect(govBm25.hardFailQueries).toBe(0);
    expect(govBm25.mustRecall).toBeCloseTo(rawBm25.mustRecall,10);

    expect(rawSem.hardFailQueries).toBeGreaterThan(0);
    expect(govSem.hardFailQueries).toBe(0);
    expect(govSem.mustRecall).toBeCloseTo(rawSem.mustRecall,10);
  });

  it('semantic retrieval improves overall must-source recall over BM25 in this corpus',()=>{
    expect(govSem.mustRecall).toBeGreaterThan(govBm25.mustRecall);
    expect(govSem.mustRecall).toBeGreaterThan(.92);
    expect(govBm25.mustRecall).toBeGreaterThan(.87);
  });

  it('both simple baselines expose an abstention problem on every negative control',()=>{
    expect(govBm25.negativeFalsePositiveQueries).toBe(6);
    expect(govSem.negativeFalsePositiveQueries).toBe(6);
  });

  it('the two lanes have genuine complementary must-source wins',()=>{
    expect(complementarity.bm25UniqueMustWins).toHaveLength(3);
    expect(complementarity.semanticUniqueMustWins).toHaveLength(7);
    expect(complementarity.tiedQueries).toBe(62);
  });

  it('the governed oracle union exceeds either single-lane must recall',()=>{
    expect(complementarity.oracleUnionMustRecall).toBeGreaterThan(govSem.mustRecall);
    expect(complementarity.oracleUnionMustRecall).toBeGreaterThan(govBm25.mustRecall);
    expect(complementarity.fullMustCoverageQueries).toBe(66);
  });
});
