import { readFileSync } from 'fs';
import { join } from 'path';
import { DEFAULT_WORKING_STYLE, explanationInstruction } from '@/lib/writersStudio/workingStyle';

const root = process.cwd();
const develop = readFileSync(join(root, 'app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx'), 'utf8');
const dialogue = readFileSync(join(root, 'app/writers-studio/develop/ObservationDialogue.tsx'), 'utf8');
const reader = readFileSync(join(root, 'lib/manuscript/ask/developmentalAskReader.ts'), 'utf8');

describe('Semantic Field R1A · writer-paced intelligence', () => {
  it('defaults to intimate pacing and guided explanation', () => {
    expect(DEFAULT_WORKING_STYLE).toEqual({ pace: 'intimate', explanation: 'guided' });
  });

  it('reframes theme candidates as provisional noticings', () => {
    expect(develop).toContain('<h4>Noticings</h4>');
    expect(develop).toContain('You do not need to decide what they mean yet.');
    expect(develop).toContain('Talk about this');
    expect(develop).toContain('Keep nearby');
    expect(develop).toContain('Let rest');
  });

  it('keeps theme governance explicit and secondary', () => {
    expect(develop).toContain('Add to Themes');
    expect(develop).toContain("action: 'accept-candidate'");
    expect(develop).not.toContain('}>Keep as theme</button>');
  });

  it('carries explanation style into anchored dialogue without changing evidence', () => {
    expect(dialogue).toContain('responseStyle: readWorkingStyle().explanation');
    expect(reader).toContain('Keep the substance, evidence, uncertainty, and limits exactly the same.');
    expect(explanationInstruction('plain')).toContain('everyday language');
    expect(explanationInstruction('expert')).toContain('professional editorial terminology');
  });
});
