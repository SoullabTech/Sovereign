import { BENCHMARK_CORPUS } from '../corpus';
import { GOLD_QUERIES } from '../goldQueries';
import { BLIND_QUERIES } from '../blindQueries';

describe('AIN-SOURCE-FABRIC-02R4 blind query freeze',()=>{
  const corpusRefs=new Set(BENCHMARK_CORPUS.map(s=>s.sourceRef));
  const goldIds=new Set(GOLD_QUERIES.map(q=>q.id));

  it('contains exactly 24 new inquiries with no id overlap',()=>{
    expect(BLIND_QUERIES).toHaveLength(24);
    const ids=BLIND_QUERIES.map(q=>q.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.some(id=>goldIds.has(id))).toBe(false);
  });

  it('balances focused, distributed, and unsupported inquiry pressure',()=>{
    const supported=BLIND_QUERIES.filter(q=>q.expectedAnswer);
    const unsupported=BLIND_QUERIES.filter(q=>!q.expectedAnswer);
    expect(supported).toHaveLength(16);
    expect(unsupported).toHaveLength(8);
    expect(supported.filter(q=>q.evidenceMode==='focused')).toHaveLength(8);
    expect(supported.filter(q=>q.evidenceMode==='distributed')).toHaveLength(8);
  });

  it('binds every supported must-source to the fixed 26-source corpus',()=>{
    for(const query of BLIND_QUERIES.filter(q=>q.expectedAnswer)){
      expect(query.mustSources.length).toBeGreaterThan(0);
      for(const ref of query.mustSources) expect(corpusRefs.has(ref)).toBe(true);
    }
  });

  it('keeps unsupported queries source-empty by construction',()=>{
    for(const query of BLIND_QUERIES.filter(q=>!q.expectedAnswer)){
      expect(query.mustSources).toHaveLength(0);
    }
  });
});
