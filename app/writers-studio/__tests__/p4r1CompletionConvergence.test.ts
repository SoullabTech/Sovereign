import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(ROOT, file), 'utf8');

describe('Writer’s Studio Elemental Alchemy completion convergence', () => {
  const controller = read('app/dev/writers-studio-pc3-live/P4R1ReviewController.tsx');
  const review = read('app/writers-studio/full-redesign/LiveReviewRoom.tsx');
  const checks = read('app/dev/writers-studio-pc3-live/P4R1CompletionChecks.tsx');
  const ready = read('app/writers-studio/rebuild/ReadyWorkPanel.tsx');
  const completion = read('lib/writersStudio/workCompletion.ts');

  it('mounts Ready the Work in the real P4R1 Review path', () => {
    expect(controller).toContain("import { ReadyWorkPanel }");
    expect(controller).toContain("setTab('Ready the Work')");
    expect(controller).toContain('<ReadyWorkPanel manuscriptId={context.manuscriptId}');
    expect(review).toContain("...(ready ? ['Ready the Work'] : [])");
    expect(review).toContain("tab === 'Ready the Work' && ready");
  });

  it('adds completeness and source checks as bounded Review acts, not new primary modes', () => {
    expect(review).toContain("...(completeness ? ['Completeness'] : [])");
    expect(review).toContain("...(sources ? ['Sources'] : [])");
    expect(controller).toContain('<P4R1CompletenessView');
    expect(controller).toContain('<P4R1SourceAuditView');
    expect(checks).toContain('Do not invent author intention');
    expect(checks).toContain('A bibliography entry is a lead, not proof');
    expect(checks).toContain('Do not edit the manuscript');
  });

  it('keeps readiness explicit and staged', () => {
    expect(ready).toContain('Editorially settled');
    expect(ready).toContain('review-copy ready');
    expect(ready).toContain('publication ready');
    expect(completion).toContain("'EDITORIALLY_SETTLED'");
    expect(completion).toContain("'REVIEW_COPY_READY'");
    expect(completion).toContain("'PUBLICATION_READY'");
    expect(completion).toContain('Not-run and open remain visible');
  });
});
