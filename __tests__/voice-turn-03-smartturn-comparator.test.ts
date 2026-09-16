import { readFileSync } from 'fs';import { join } from 'path';
const py=readFileSync(join(process.cwd(),'scripts/voice/smartturn-a3-comparator.py'),'utf8');
const ts=readFileSync(join(process.cwd(),'scripts/voice/run-turn03-a3-smartturn-comparator.ts'),'utf8');
describe('TURN-03 Smart Turn comparator custody',()=>{
 it('pins model, threshold, 16k mono and upstream 8-second preprocessing',()=>{expect(py).toContain("MODEL_ID='pipecat-ai/smart-turn-v3'");expect(py).toContain('SAMPLE_RATE=16000');expect(py).toContain('MAX_SAMPLES=8*SAMPLE_RATE');expect(py).toContain('THRESHOLD=0.5');expect(py).toContain("np.pad(audio,(MAX_SAMPLES-len(audio),0)");expect(py).toContain("providers=['CPUExecutionProvider']");});
 it('binds exact weight and sealed synthetic control corpus',()=>{expect(ts).toContain("MODEL_SHA='2bb026316b14a660486a75b1733cd3fbab8c2fd0314dc9af7be49f8cca967e4f'");expect(ts).toContain("CONTROL_SHA='9cc22bea45da34e9ada85504dcd2e76b986fc411155c7c731c7fa043c1588dbf'");expect(ts).toContain('fixture hash drift');});
 it('uses Smart Turn as comparator, not future-speech port or live authority',()=>{expect(ts).toContain("act:'A3_SMART_TURN_COMPARATOR_01'");expect(ts).toContain('canAlterEndpointing:false');expect(ts).not.toContain('acousticContinue:');expect(ts).not.toContain('acousticYield:');});
 it('scores at the Natural floor and keeps semantic override separate',()=>{expect(ts).toContain('const RATE=16000, FLOOR=3500, THRESHOLD=0.5');expect(ts).toContain("if(semInc>=0.62)");expect(ts).toContain("else if(semY>=0.72)");});
});
