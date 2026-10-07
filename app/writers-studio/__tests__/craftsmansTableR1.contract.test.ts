import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe("Craftsman's Table R1", () => {
  const contract = read('docs/writers-studio/CRAFTSMANS_TABLE_R1.md');
  const host = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  const table = read('app/dev/writers-studio-pc3-live/CraftsmansTableR1.tsx');
  const maia = read('app/dev/writers-studio-pc3-live/MaiaCraftCompanionR1.tsx');
  const css = read('app/dev/writers-studio-p4r1/p4r1-live.css');

  it('freezes the manuscript-first product law and Elemental Alchemy witness', () => {
    expect(contract).toContain("The manuscript is the craftsman's table.");
    expect(contract).toContain('MAIA is the relational intelligence beside it.');
    expect(contract).toContain('Hermes is the invisible continuity');
    expect(contract).toContain('Activating, Amplifying, Actualizing');
    expect(contract).toContain('bodily and relationally');
    expect(contract).toContain('no editorial dashboard');
  });

  it('routes Develop Craft through the dedicated R1 workbench instead of the legacy overlay', () => {
    expect(host).toContain("import CraftsmansTableR1 from './CraftsmansTableR1'");
    expect(host).toContain("import MaiaCraftCompanionR1 from './MaiaCraftCompanionR1'");
    expect(host).toContain("const craftR1Surface = props.surfaceMode === 'develop-craft'");
    expect(host).toContain("const workSurface = props.surfaceMode === 'develop-craft'");
    expect(host).toContain("props.surfaceMode !== 'develop-craft' && mounted");
  });

  it('renders professional inline editorial conventions on the actual manuscript', () => {
    expect(table).toContain('<del');
    expect(table).toContain('<ins');
    expect(table).toContain("kind: 'insert' | 'delete' | 'replace'");
    expect(table).toContain('data-craftsmans-table-r1');
    expect(table).toContain('data-craft-active-section');
    expect(table).toContain('data-craft-authoritative');
    expect(css).toContain('.p4r1-craft-r1-locus del');
    expect(css).toContain('.p4r1-craft-r1-locus ins');
    expect(css).toContain('#b54b4b');
    expect(css).toContain('#4c86cf');
  });

  it('keeps individual edits separable and writer-governed', () => {
    for (const action of ['Use this', 'Keep mine', 'Another way', 'Why?', 'Teach me']) {
      expect(table).toContain(action);
    }
    expect(table).toContain('composeSelected');
    expect(table).toContain('Save my version');
    expect(table).toContain('Apply my version');
    expect(table).toContain('Undo');
  });

  it('keeps Markup and Preview as two views of one working state', () => {
    expect(table).toContain("useState<'markup' | 'preview'>('markup')");
    expect(table).toContain('Markup');
    expect(table).toContain('Preview');
    expect(table).toContain('composeSelected(segments, selected)');
  });

  it('keeps MAIA conversational and capabilities behind progressive disclosure', () => {
    expect(maia).toContain('<span className="p4r1-eyebrow">MAIA</span>');
    expect(maia).toContain('What do you want the writing to do?');
    expect(maia).toContain("useState(false)");
    expect(maia).toContain('Ways to work');
    for (const capability of [
      'Discuss', 'Try wording', 'Examples', 'Ideas', 'Lighter',
      'Keep more of mine', 'Another option', 'Why this?', 'Teach me', 'Go deeper',
    ]) {
      expect(maia).toContain(capability);
    }
    expect(maia).not.toContain('RevisionDesk');
    expect(maia).not.toContain('More editorial controls');
  });

  it('keeps advanced capability in the contract without turning it into default chrome', () => {
    expect(contract).toContain('Guided default');
    expect(contract).toContain('Professional depth');
    expect(contract).toContain('Plain ↔ Expert');
    expect(contract).toContain('Light ↔ Heavy');
    expect(contract).toContain('stet');
    expect(contract).toContain('transpose');
    expect(contract).toContain('copyedit');
    expect(contract).toContain('line edit');
  });

  it('keeps whole-to-part intelligence as a real R1 milestone', () => {
    expect(contract).toContain('Whole ↔ part intelligence');
    expect(contract).toContain('Larger scope tells us where and why');
    expect(contract).toContain('passage, section, chapter, whole');
    expect(contract).toContain('R1-D · Scale');
  });
});
