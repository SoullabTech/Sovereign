import { BENCHMARK_CORPUS } from '../corpus';
import {
  activeForTemporalNeed,
  BENCHMARK_TEMPORAL_EDGES,
  temporalDisposition,
  validateTemporalGraph,
} from '../temporalGraph';

describe('R5 temporal / supersession graph',()=>{
  it('contains only known sources and no self edges',()=>{
    expect(()=>validateTemporalGraph(BENCHMARK_CORPUS)).not.toThrow();
    expect(BENCHMARK_TEMPORAL_EDGES.length).toBeGreaterThanOrEqual(5);
  });

  it('preserves J9 historically while preventing it from governing the current claim',()=>{
    const standing=temporalDisposition('j9-adjudication');
    expect(standing.historicalVisible).toBe(true);
    expect(standing.currentClaimEligible).toBe(false);
    expect(standing.supersededBy).toContain('authority-law');
    expect(standing.correctedBy).toContain('j11-reconciliation');
    expect(activeForTemporalNeed('j9-adjudication','historical')).toBe(true);
    expect(activeForTemporalNeed('j9-adjudication','current')).toBe(false);
  });

  it('does not confuse later evidence with supersession',()=>{
    const adr=temporalDisposition('library-adr');
    expect(adr.currentClaimEligible).toBe(true);
    expect(adr.supersededBy).toEqual([]);
    expect(activeForTemporalNeed('library-adr','current')).toBe(true);
  });

  it('keeps evidence lineage without erasing earlier contracts',()=>{
    expect(temporalDisposition('indra-composer').currentClaimEligible).toBe(true);
    expect(temporalDisposition('indra-validation').currentClaimEligible).toBe(true);
  });
});
