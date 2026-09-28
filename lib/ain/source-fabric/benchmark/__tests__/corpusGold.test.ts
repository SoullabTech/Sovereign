import { resolve } from 'node:path';
import { BENCHMARK_CORPUS, verifyBenchmarkCorpus } from '../corpus';
import { GOLD_QUERIES, GOLD_QUERY_FAMILIES } from '../goldQueries';

const root = resolve(__dirname, '../../../../..');

describe('AIN-SOURCE-FABRIC-02R1 benchmark corpus', () => {
  it('contains 26 fixed non-member sources and checksum-bound Indra snapshots', () => {
    const result = verifyBenchmarkCorpus(root);
    expect(result.count).toBe(26);
    expect(result.snapshotChecks).toHaveLength(5);
    expect(result.snapshotChecks.every(s => s.matches)).toBe(true);
  });

  it('has unique source refs and only declared benchmark classes', () => {
    const refs = BENCHMARK_CORPUS.map(s => s.sourceRef);
    expect(new Set(refs).size).toBe(refs.length);
    expect(BENCHMARK_CORPUS.every(s => !/member|client|patient/i.test(s.domain))).toBe(true);
  });
});

describe('AIN-SOURCE-FABRIC-02R1 gold query set', () => {
  const sourceByRef = new Map(BENCHMARK_CORPUS.map(s => [s.sourceRef, s]));

  it('contains 72 queries: six in each of 12 families', () => {
    expect(GOLD_QUERIES).toHaveLength(72);
    for (const family of GOLD_QUERY_FAMILIES) {
      expect(GOLD_QUERIES.filter(q => q.family === family)).toHaveLength(6);
    }
  });

  it('has unique ids and every gold source exists with the correct source class', () => {
    const ids = GOLD_QUERIES.map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const query of GOLD_QUERIES) {
      const refs = query.gold.map(g => g.sourceRef);
      expect(new Set(refs).size).toBe(refs.length);
      for (const gold of query.gold) {
        const source = sourceByRef.get(gold.sourceRef);
        expect(source).toBeDefined();
        expect(gold.sourceClass).toBe(source?.sourceClass);
      }
    }
  });

  it('keeps negative controls empty', () => {
    const negative = GOLD_QUERIES.filter(q => q.family === 'negative_control');
    expect(negative.every(q => q.expectedEmpty === true)).toBe(true);
    expect(negative.every(q => q.gold.length === 0)).toBe(true);
  });

  it('makes permission controls genuinely adversarial', () => {
    const permission = GOLD_QUERIES.filter(q => q.family === 'permission_control');
    for (const query of permission) {
      expect(query.aperture?.forbidden?.length).toBeGreaterThan(0);
      expect(query.gold.some(g => g.labels.includes('forbidden'))).toBe(true);
      for (const ref of query.aperture?.forbidden ?? []) {
        expect(sourceByRef.has(ref)).toBe(true);
      }
    }
  });

  it('gives every temporal family pressure from historical or supersession evidence', () => {
    const temporal = GOLD_QUERIES.filter(q => q.family === 'temporal_supersession');
    for (const query of temporal) {
      const hasTemporalPressure =
        query.gold.some(g => g.labels.includes('stale_or_superseded')) ||
        query.gold.some(g => sourceByRef.get(g.sourceRef)?.temporalStanding !== 'current');
      expect(hasTemporalPressure || query.id === 'T3' || query.id === 'T4' || query.id === 'T6').toBe(true);
    }
  });

  it('requires explicit counterevidence in every contradiction family', () => {
    const contradictions = GOLD_QUERIES.filter(q => q.family === 'contradiction');
    expect(contradictions.some(q => q.gold.some(g => g.labels.includes('counterevidence')))).toBe(true);
    expect(contradictions.every(q => q.gold.length >= 2)).toBe(true);
  });

  it('gives associative and bilateral lanes meaningful work', () => {
    expect(GOLD_QUERIES.filter(q => q.laneExpectation === 'associative').length).toBeGreaterThanOrEqual(12);
    expect(GOLD_QUERIES.filter(q => q.laneExpectation === 'bilateral').length).toBeGreaterThanOrEqual(30);
  });

  it('binds every ablation case to a real must/bridge/counterevidence source', () => {
    const ablations = GOLD_QUERIES.filter(q => q.family === 'ablation');
    for (const query of ablations) {
      expect(query.ablationCritical?.length).toBeGreaterThan(0);
      for (const ref of query.ablationCritical ?? []) {
        expect(sourceByRef.has(ref)).toBe(true);
        const gold = query.gold.find(g => g.sourceRef === ref);
        expect(gold).toBeDefined();
        expect(
          gold?.labels.some(label =>
            label === 'must_retrieve' || label === 'bridge' || label === 'counterevidence'
          )
        ).toBe(true);
      }
    }
  });
});
