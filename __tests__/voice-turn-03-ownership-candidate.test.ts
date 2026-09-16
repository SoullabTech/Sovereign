import { decideTurnOwnershipCandidate03 } from '@/lib/voice/turnOwnershipCandidate03';

const base={explicitFloorHeld:false,speechActive:false,silenceMs:4000,selectedSilenceMs:3500,conversationalSpace:'natural' as const};
describe('TURN-03 asymmetric floor-ownership candidate',()=>{
 it('uses TURN-01 Natural floor and existing adaptive ceiling',()=>{const r=decideTurnOwnershipCandidate03(base);expect(r.earliestYieldMs).toBe(3500);expect(r.ambiguityCeilingMs).toBe(6000);expect(r.decision).toBe('wait');});
 it('never overrides explicit floor or active speech',()=>{expect(decideTurnOwnershipCandidate03({...base,silenceMs:9000,explicitFloorHeld:true}).decision).toBe('wait');expect(decideTurnOwnershipCandidate03({...base,silenceMs:9000,speechActive:true}).decision).toBe('wait');});
 it('lets semantic continuation hold beyond the generic ceiling',()=>{expect(decideTurnOwnershipCandidate03({...base,silenceMs:9000,semanticIncomplete:.9}).decision).toBe('wait');});
 it('lets explicit semantic yield hand off at the member floor',()=>{expect(decideTurnOwnershipCandidate03({...base,silenceMs:3500,semanticYield:1}).decision).toBe('yield_candidate');});
 it('does not hand off ambiguous silence until the existing ceiling',()=>{expect(decideTurnOwnershipCandidate03({...base,silenceMs:5999}).decision).toBe('wait');expect(decideTurnOwnershipCandidate03({...base,silenceMs:6000}).decision).toBe('yield_candidate');});
 it('honors learned TURN-01 thresholds that rise above the baseline',()=>{const r=decideTurnOwnershipCandidate03({...base,selectedSilenceMs:5600,silenceMs:5000});expect(r.earliestYieldMs).toBe(5600);expect(r.ambiguityCeilingMs).toBe(6000);expect(r.decision).toBe('wait');});
 it('collapses the ambiguity window when learning reaches the selected Space ceiling',()=>{const r=decideTurnOwnershipCandidate03({...base,selectedSilenceMs:6000,silenceMs:5999});expect(r.earliestYieldMs).toBe(6000);expect(r.ambiguityCeilingMs).toBe(6000);expect(r.decision).toBe('wait');});
});
