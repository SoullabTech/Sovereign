import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('C6 — Work material visibility in PC3 Home', () => {
  const summary = read('app/dev/writers-studio-pc3-live/P4R1WorkMaterialsSummary.tsx');
  const home = read('app/dev/writers-studio-pc3-live/P4R1HomeView.tsx');

  it('shows declared materials on the active returning Work', () => {
    expect(home).toContain('<P4R1WorkMaterialsSummary work={work} />');
    expect(summary).toContain('What feeds this Work');
    expect(summary).toContain('Relationships you declared.');
  });

  it('states that visibility is not automatic manuscript reading', () => {
    expect(summary).toContain('Nothing here is automatically read into the manuscript.');
  });

  it('keeps canonical homes visible for Ideas and Sources', () => {
    expect(summary).toContain("material.materialType === 'idea'");
    expect(summary).toContain('/maia/ideas/');
    expect(summary).toContain("material.materialType === 'source_upload'");
    expect(summary).toContain('/writers-studio/sources');
  });

  it('contains no cognition, material fetch, or manuscript mutation path', () => {
    expect(summary).not.toContain('apiFetch');
    expect(summary).not.toContain('ask');
    expect(summary).not.toContain('commission');
    expect(summary).not.toContain('onEditBody');
    expect(summary).not.toContain('manuscriptId');
  });
});
