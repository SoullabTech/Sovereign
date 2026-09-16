import { readFileSync } from 'fs';
import { join } from 'path';
const src=readFileSync(join(process.cwd(),'scripts/voice/evaluate-turn03-ownership-candidate.ts'),'utf8');
describe('TURN-03 ownership-candidate evaluator',()=>{
 it('pins both sealed A3 populations',()=>{expect(src).toContain("9cc22bea45da34e9ada85504dcd2e76b986fc411155c7c731c7fa043c1588dbf");expect(src).toContain("8a13e17ee0d427e194fe5c6f2ade696630fd6cac735c3b550b5def25bc492a65");});
 it('uses Natural floor and existing ceiling rather than a model-completion shortcut',()=>{expect(src).toContain("conversationalSpace:'natural'");expect(src).toContain('modelCompletionCanShortenWindow:false');expect(src).toContain('ambiguityCeilingMs:6000');});
 it('gives simultaneous speech onset priority over a timer',()=>{expect(src).toContain('genericYieldMs<r.pauseMs');expect(src).toContain('simultaneousSpeechOnsetOutranksTimer:true');});
 it('remains shadow only',()=>{expect(src).toContain("act:'A3_ASYMMETRIC_OWNERSHIP_CANDIDATE_03'");expect(src).toContain('canAlterEndpointing:false');});
});
