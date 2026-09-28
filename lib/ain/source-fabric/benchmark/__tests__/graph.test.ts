import { BENCHMARK_CORPUS } from '../corpus';
import {
  BENCHMARK_GRAPH_EDGES,
  BENCHMARK_COMMUNITIES,
  boundedOneHopExpansion,
  communitiesFor,
  oneHopNeighbors,
  validateBenchmarkGraph,
} from '../graph';

describe('R4G explicit benchmark graph',()=>{
  it('contains only known corpus sources and no self edges',()=>{
    expect(()=>validateBenchmarkGraph(BENCHMARK_CORPUS)).not.toThrow();
    expect(BENCHMARK_GRAPH_EDGES.length).toBeGreaterThan(25);
  });

  it('returns declared one-hop neighbors without recursively expanding them',()=>{
    const neighbors=oneHopNeighbors('rgr-note');
    expect(neighbors.map(n=>n.sourceRef)).toEqual(
      expect.arrayContaining(['rgr-constitution','indra-grammar']),
    );
    expect(neighbors.every(n=>n.seedRef==='rgr-note')).toBe(true);
    expect(neighbors.some(n=>n.sourceRef==='indra-composer')).toBe(false);
  });

  it('obeys seed and per-seed bounds',()=>{
    const expanded=boundedOneHopExpansion(
      ['source-fabric','rgr-note','direction-authority'],
      {seedLimit:2,neighborsPerSeed:2,allowed:()=>true},
    );
    expect(expanded.length).toBeLessThanOrEqual(4);
    expect(new Set(expanded.map(e=>e.seedRef)).size).toBeLessThanOrEqual(2);
  });

  it('reapplies permission before graph admission',()=>{
    const expanded=boundedOneHopExpansion(
      ['source-fabric'],
      {seedLimit:1,neighborsPerSeed:8,allowed:ref=>ref!=='benchmark-contract'},
    );
    expect(expanded.some(e=>e.sourceRef==='benchmark-contract')).toBe(false);
  });

  it('exposes explicit multi-membership communities',()=>{
    expect(communitiesFor('source-fabric')).toEqual(
      expect.arrayContaining(['sovereignty_authority','symbolic_facets','provenance_crossing','retrieval_architecture']),
    );
    expect(Object.keys(BENCHMARK_COMMUNITIES)).toHaveLength(7);
  });
});
