import { readFileSync } from 'fs';
import { join } from 'path';
const text=readFileSync(join(process.cwd(),'docs/programme/VOICE-2026/TURN-03_A4_HUMAN_SHADOW_PROTOCOL_2026-09-16.md'),'utf8');
describe('TURN-03 A4 human shadow protocol',()=>{
  it('requires separate opt-in plus explicit-floor testing so silence cannot affect the member',()=>{expect(text).toContain('explicit tester opt-in');expect(text).toContain('explicit floor mode');expect(text).toContain("`I'm Done`");expect(text).toContain('Silence therefore has zero conversational authority');});
  it('uses behavior as ground truth',()=>{expect(text).toContain('speech resumes after silence');expect(text).toContain("member taps `I'm Done`");});
  it('forbids transcript/audio in the research record',()=>{expect(text).toContain('does **not** add raw audio or transcript text');expect(text).toContain('category/count');});
  it('forbids mid-population tuning and live authority',()=>{expect(text).toContain('No threshold or cue rule may be tuned');expect(text).toContain('TURN-04, deployment, or live endpoint influence remain CLOSED');});
  it('requires long-pause and complete-but-continuing coverage',()=>{expect(text).toContain('pauses at and beyond the ceiling');expect(text).toContain('semantically complete but continuing thoughts');expect(text).toContain('re-entry after an apparently complete sentence');});
});
