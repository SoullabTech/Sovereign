import { readFileSync } from 'fs';
import { join } from 'path';
const src=readFileSync(join(process.cwd(),'scripts/voice/run-turn03-a3-adversarial.ts'),'utf8');
describe('TURN-03 A3 adversarial runner',()=>{
 it('pins the same Smart Turn model and Natural floor',()=>{expect(src).toContain("MODEL_SHA='2bb026316b14a660486a75b1733cd3fbab8c2fd0314dc9af7be49f8cca967e4f'");expect(src).toContain('FLOOR=3500');expect(src).toContain('THRESHOLD=0.5');});
 it('contains complete-but-continuing, rhetorical, re-entry, and implicit-yield cases',()=>{for(const id of ['reflective-complete-5s','emotional-complete-6s','rhetorical-question-4s','self-correction-4s','list-continuation-5s','reentry-complete-4s','implicit-share-yield','reflective-conclusion-yield','narrative-end-yield','gratitude-yield','where-i-am-yield'])expect(src).toContain(`id:'${id}'`);});
 it('keeps Smart Turn and semantic-only separately measurable',()=>{expect(src).toContain('semanticOnly:metrics');expect(src).toContain('smartTurn:metrics');expect(src).toContain('smartTurnSemantic:metrics');});
 it('remains shadow-only with no live authority',()=>{expect(src).toContain("act:'A3_ADVERSARIAL_02'");expect(src).toContain('canAlterEndpointing:false');expect(src).not.toContain('onTranscript(');expect(src).not.toContain('onCommit(');});
});
