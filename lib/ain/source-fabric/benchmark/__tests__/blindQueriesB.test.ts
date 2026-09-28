import { BENCHMARK_CORPUS } from '../corpus';
import { GOLD_QUERIES } from '../goldQueries';
import { BLIND_QUERIES } from '../blindQueries';
import { BLIND_QUERIES_B } from '../blindQueriesB';

describe('AIN-SOURCE-FABRIC-02R4 Blind Validation B freeze',()=>{
  const corpusRefs=new Set(BENCHMARK_CORPUS.map(s=>s.sourceRef));
  const priorIds=new Set([
    ...GOLD_QUERIES.map(q=>q.id),
    ...BLIND_QUERIES.map(q=>q.id),
  ]);

  it('contains exactly 20 new queries with no prior id overlap',()=>{
    expect(BLIND_QUERIES_B).toHaveLength(20);
    const ids=BLIND_QUERIES_B.map(q=>q.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.some(id=>priorIds.has(id))).toBe(false);
  });

  it('balances supported and unsupported pressure',()=>{
    expect(BLIND_QUERIES_B.filter(q=>q.expectedAnswer)).toHaveLength(10);
    expect(BLIND_QUERIES_B.filter(q=>!q.expectedAnswer)).toHaveLength(10);
  });

  it('binds every supported must-source to the fixed corpus',()=>{
    for(const query of BLIND_QUERIES_B.filter(q=>q.expectedAnswer)){
      expect(query.mustSources.length).toBeGreaterThan(0);
      for(const ref of query.mustSources) expect(corpusRefs.has(ref)).toBe(true);
    }
  });

  it('keeps every unsupported query source-empty',()=>{
    for(const query of BLIND_QUERIES_B.filter(q=>!q.expectedAnswer)){
      expect(query.mustSources).toHaveLength(0);
    }
  });
});
