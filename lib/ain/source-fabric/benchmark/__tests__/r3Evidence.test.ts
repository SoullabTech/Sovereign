import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root=resolve(__dirname,'../../../../..');
const r3=JSON.parse(readFileSync(
  resolve(root,'docs/programme/AIN-SOURCE-FABRIC-02/r3/r3-summary.json'),
  'utf8',
));
const baseline=JSON.parse(readFileSync(
  resolve(root,'docs/programme/AIN-SOURCE-FABRIC-02/baseline/baseline-summary.json'),
  'utf8',
));

describe('AIN-SOURCE-FABRIC-02R3 evidence',()=>{
  const rrf=r3.methods.rrf;
  const callosal=r3.methods.callosal;
  const final=r3.methods.callosal_abstention;
  const semantic=baseline.methods['semantic-governed'].overall;

  it('runs against the same fixed corpus and local embedding model',()=>{
    expect(r3.model).toBe('nomic-embed-text');
    expect(r3.corpus).toEqual({sources:26,chunks:1735});
    expect(r3.referenceParameters.metadataWeight).toBe(.003);
  });

  it('RRF materially exceeds the semantic-only must-source baseline',()=>{
    expect(rrf.mustRecall).toBeGreaterThan(semantic.mustRecall);
    expect(rrf.mustRecall).toBeGreaterThan(.95);
  });

  it('callosal reranking improves helpful coverage and context quality without losing must recall',()=>{
    expect(callosal.mustRecall).toBeCloseTo(rrf.mustRecall,12);
    expect(callosal.helpfulRecall).toBeGreaterThan(rrf.helpfulRecall);
    expect(callosal.irrelevantRate).toBeLessThan(rrf.irrelevantRate);
    expect(callosal.sourceClassDiversity).toBeGreaterThan(rrf.sourceClassDiversity);
    expect(callosal.usefulPerThousandTokens).toBeGreaterThan(rrf.usefulPerThousandTokens);
  });

  it('abstention removes every negative-control false positive without false abstaining on a supported inquiry',()=>{
    expect(final.abstainedQueries).toBe(6);
    expect(final.positiveFalseAbstentions).toBe(0);
    expect(final.negativeFalsePositiveQueries).toBe(0);
    expect(final.abstentionReasons).toEqual({
      weak_distributed_evidence:2,
      weak_focused_evidence:3,
      unsupported_claim:1,
    });
  });

  it('preserves counterevidence and bridge retrieval after fusion and abstention',()=>{
    expect(final.counterevidenceRecall).toBe(1);
    expect(final.bridgeRecall).toBeGreaterThan(.98);
  });
});
