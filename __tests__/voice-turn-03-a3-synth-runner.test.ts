import { readFileSync } from 'fs';
import { join } from 'path';
const src=readFileSync(join(process.cwd(),'scripts/voice/run-turn03-a3-synth-bench.ts'),'utf8');
describe('TURN-03 A3 synthetic benchmark custody',()=>{
  it('compares baseline, acoustic, and fused policies without granting authority',()=>{
    expect(src).toContain("act:'A3_SYNTH_01'");
    expect(src).toContain("baseline:'TURN-01 silence threshold'");
    expect(src).toContain("conservative:'TURN-02 arbiter with no predictor evidence'");
    expect(src).toContain("acoustic:'TURN-02 arbiter + DualTurn only'");
    expect(src).toContain("semantic:'TURN-02 arbiter + high-precision semantic cues only'");
    expect(src).toContain("fused:'TURN-02 arbiter + DualTurn + high-precision semantic cues'");
    expect(src).toContain('canAlterEndpointing:false');
  });
  it('contains required pause classes and 2/4/6 second continuation stress cases',()=>{
    for(const k of ['ordinary_pause','word_search','hesitation','emotional_pause','breath','unfinished_syntax','explicit_yield','question_yield','reentry']) expect(src).toContain(k);
    for(const ms of ['pauseMs: 2000','pauseMs: 4000','pauseMs: 6000']) expect(src).toContain(ms);
  });
  it('keeps evidence content-free while using synthetic text only inside the generator',()=>{
    expect(src).toContain('rawAudioPersistedInRepo:false');
    expect(src).toContain('memberData:false');
    expect(src).not.toContain('transcript:');
    expect(src).not.toContain('audioBase64');
  });
});
