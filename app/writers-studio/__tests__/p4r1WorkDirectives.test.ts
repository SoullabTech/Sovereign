import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (...parts: string[]) => readFileSync(join(process.cwd(), ...parts), 'utf8');

describe('P4R1 Work Decision + Protection Ledger', () => {
  it('is visible from the returning Work without becoming a new primary mode', () => {
    const home = read('app/dev/writers-studio-pc3-live/P4R1HomeView.tsx');
    const host = read('app/dev/writers-studio-p4r1/P4R1StudioHost.tsx');

    expect(home).toContain("import P4R1WorkDirectives from './P4R1WorkDirectives'");
    expect(home).toContain('<P4R1WorkDirectives workId={work.id} />');
    expect(host).not.toContain("mode === 'directives'");
  });

  it('keeps writer authority explicit in the member-facing copy', () => {
    const panel = read('app/dev/writers-studio-pc3-live/P4R1WorkDirectives.tsx');
    const vocabulary = read('lib/writersStudio/workDirectives.ts');

    expect(panel).toContain('These are your directions for the Work.');
    expect(panel).toContain('they never become manuscript text or editing permission.');
    expect(vocabulary).toContain("protect: 'What to protect'");
    expect(vocabulary).toContain("decision: 'Decisions we’ve made'");
    expect(vocabulary).toContain("open_question: 'Still open'");
    expect(panel).toContain('Revise');
    expect(panel).toContain('Retire');
  });

  it('threads current Work directives into MAIA Work context without changing edit authority', () => {
    const context = read('lib/manuscript/ask/workContext.ts');
    const reader = read('lib/manuscript/ask/askReader.ts');

    expect(context).toContain('workDirectiveContextForWork');
    expect(context).toContain('readonly workDirectives: string');
    expect(reader).toContain('writer-authored editorial directions for the Work');
    expect(reader).toContain('Keep their authority distinct from manuscript prose');
  });
});
