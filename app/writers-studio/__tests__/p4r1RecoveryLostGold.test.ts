import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (...parts: string[]) => readFileSync(join(process.cwd(), ...parts), 'utf8');

describe('P4R1 Recovery / Lost Gold', () => {
  it('offers only manuscripts the writer declared into the same Work', () => {
    const route = read('app/api/writers-studio/recovery/route.ts');

    expect(route).toContain("e.expression_type = 'manuscript'");
    expect(route).toContain('e.living_work_id = $1');
    expect(route).toContain('m.member_id = $2');
    expect(route).toContain("error: 'source_not_in_work'");
  });

  it('labels lexical difference as evidence rather than a restore decision', () => {
    const route = read('app/api/writers-studio/recovery/route.ts');

    expect(route).toContain("kind: 'deterministic_lexical_difference'");
    expect(route).toContain('Possible recovery material');
    expect(route).toContain('This does not establish that the material is better');
    expect(route).not.toContain('UPDATE manuscript_draft_sections');
    expect(route).not.toContain('INSERT INTO working_draft_revisions');
  });

  it('makes source crossing into MAIA an explicit member act', () => {
    const view = read('app/dev/writers-studio-pc3-live/P4R1RecoveryView.tsx');
    const controller = read('app/dev/writers-studio-pc3-live/P4R1ReviewController.tsx');

    expect(view).toContain('Discuss with MAIA');
    expect(view).toContain('Do not edit or restore anything unless I explicitly ask.');
    expect(view).toContain('Root voice reference');
    expect(view).toContain('Leave out for now');
    expect(controller).toContain('initialDraft={workDraft}');
  });

  it('is a Review lens, not a new Studio primary mode', () => {
    const room = read('app/writers-studio/full-redesign/LiveReviewRoom.tsx');
    const host = read('app/dev/writers-studio-p4r1/P4R1StudioHost.tsx');

    expect(room).toContain("...(recovery ? ['Recovery'] : [])");
    expect(room).toContain("tab === 'Recovery'");
    expect(host).not.toContain("mode === 'recovery'");
  });
});
