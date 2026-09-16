import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
const path=join(process.cwd(),'docs/programme/VOICE-2026/evidence/TURN-03-A3-OWNERSHIP-CANDIDATE-20260916/A3_OWNERSHIP_CANDIDATE_EVIDENCE.json');
const bytes=readFileSync(path); const d=JSON.parse(bytes.toString('utf8'));
const sha=createHash('sha256').update(bytes).digest('hex');
describe('TURN-03 asymmetric ownership evidence',()=>{
 it('pins the exact evidence artifact',()=>expect(sha).toBe('a704f64257b5acce56a1ef663a6a12729432e3fb2c959302a7e29fd62de20acd'));
 it('clears the observed 15 continuation / 7 yield population',()=>{expect(d.metrics.overall.continueSamples).toBe(15);expect(d.metrics.overall.yieldSamples).toBe(7);expect(d.metrics.overall.falseFloorSeizures).toBe(0);expect(d.metrics.overall.correctYields).toBe(7);expect(d.metrics.overall.yieldRecall).toBe(1);});
 it('keeps model completion from shortening member space',()=>expect(d.policy.modelCompletionCanShortenWindow).toBe(false));
 it('uses the existing Natural ambiguity ceiling',()=>{expect(d.policy.earliestConsiderationMs).toBe(3500);expect(d.policy.ambiguityCeilingMs).toBe(6000);expect(d.metrics.overall.medianYieldLatencyMs).toBe(6000);});
 it('remains shadow only',()=>{expect(d.shadowOnly).toBe(true);expect(d.authority.canAlterEndpointing).toBe(false);expect(d.authority.canDispatchCognition).toBe(false);});
});
