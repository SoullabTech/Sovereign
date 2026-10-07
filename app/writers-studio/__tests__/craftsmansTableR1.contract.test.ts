import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe("Craftsman's Table R1", () => {
  const contract = read('docs/writers-studio/CRAFTSMANS_TABLE_R1.md');
  const host = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  const controller = read('app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx');
  const table = read('app/dev/writers-studio-pc3-live/CraftsmansTableR1.tsx');
  const maia = read('app/dev/writers-studio-pc3-live/MaiaCraftCompanionR1.tsx');
  const craft = read('lib/writersStudio/craftCanvas.ts');
  const working = read('lib/writersStudio/craftWorkingCopy.ts');
  const proMarks = read('lib/writersStudio/craftProfessionalMarks.ts');
  const scope = read('lib/writersStudio/craftScopeR1.ts');
  const reread = read('lib/writersStudio/craftRereadR1.ts');
  const css = read('app/dev/writers-studio-p4r1/p4r1-live.css');

  it('freezes the manuscript-first product law and Elemental Alchemy witness', () => {
    expect(contract).toContain("The manuscript is the craftsman's table.");
    expect(contract).toContain('MAIA is the relational intelligence beside it.');
    expect(contract).toContain('Hermes is the invisible continuity');
    expect(contract).toContain('Activating, Amplifying, Actualizing');
    expect(contract).toContain('bodily and relationally');
    expect(contract).toContain("Writer's Studio is not an AI editorial dashboard.");
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
    expect(table).toContain('data-craftsmans-table-r1');
    expect(table).toContain('data-craft-active-section');
    expect(table).toContain('data-craft-authoritative');
    expect(table).toContain('professionalMarkFor');
    expect(proMarks).toContain("symbol: 'DEL'");
    expect(proMarks).toContain("symbol: 'INS'");
    expect(proMarks).toContain("symbol: 'STET'");
    expect(proMarks).toContain("symbol: '¶'");
    expect(css).toContain('.p4r1-craft-r1-locus del');
    expect(css).toContain('.p4r1-craft-r1-locus ins');
    expect(css).toContain('#b54b4b');
    expect(css).toContain('#4c86cf');
  });

  it('uses professional manuscript geometry rather than a developer text pane', () => {
    expect(table).toContain('typesetProseBlocks');
    expect(table).toContain('CraftContextBlocks');
    expect(table).toContain('splitActiveParagraph');
    expect(table).toContain('p4r1-craft-r1-workrow');
    expect(table).toContain('p4r1-craft-r1-margin');
    expect(table).toContain('MAIA · craft note');
    expect(css).toContain('R1 manuscript geometry');
    expect(css).toContain('grid-template-columns:minmax(0,720px) minmax(170px,210px)');
    expect(css).toContain('.p4r1-craft-r1-margin');
  });

  it('keeps individual edits separable and writer-governed', () => {
    for (const action of ['Use this', 'Keep mine', 'Write it', 'Another way', 'Why?', 'Teach me']) {
      expect(table).toContain(action);
    }
    expect(table).toContain('composeCraftWorkingCopy');
    expect(working).toContain('composeCraftWorkingCopy');
    expect(table).toContain('Save my version');
    expect(table).toContain('Apply my version');
    expect(table).toContain('Undo');
  });

  it('keeps the exact bound editorial relationship available even before MAIA changes wording', () => {
    expect(host).toContain('const craftBoundVersion = props.editorialThread');
    expect(host).toContain('version={craftBoundVersion}');
    expect(host).toContain('craftBoundVersion.wording !== props.held.text');
  });

  it('supports primer, MAIA-edit, and hybrid composition on the manuscript itself', () => {
    expect(contract).toContain('Primer');
    expect(contract).toContain('Edit MAIA');
    expect(contract).toContain('Hybrid');
    expect(table).toContain('Write from mine');
    expect(table).toContain('Edit current hybrid');
    expect(table).toContain('Start from MAIA');
    expect(table).toContain('Use this as my working copy');
    expect(table).toContain('p4r1-craft-r1-direct');
    expect(table).toContain('newerMaiaAlternative');
  });

  it('keeps Markup and Preview as two views of one working state', () => {
    expect(table).toContain("useState<'markup' | 'preview'>('markup')");
    expect(table).toContain('Markup');
    expect(table).toContain('Preview');
    expect(table).toContain('workingText');
    expect(table).toContain('composeCraftWorkingCopy');
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

  it('treats natural writer language as explicit wording authorization without changing the standing preference', () => {
    expect(scope).toContain('craftProposalRequested');
    expect(controller).toContain('resolveCraftSuggestionPolicy({');
    expect(controller).toContain('request: intentText');
    expect(controller).toContain('proactive: mayProposeImmediately');
    expect(controller).toContain('proposalPolicy: options?.proposalPolicy');
    expect(controller).toContain('proposalRequested: options?.proposalRequested');
    expect(controller).toContain('craftPrimerPrompt(mayProposeImmediately), arrivalPolicy');
    expect(controller).toContain('|| !editingSettingsResolved');
  });

  it('presents a clean Craft conversation without exposing orchestration prompts', () => {
    expect(controller).toContain('craftDialogue');
    expect(controller).toContain('options?.displayText');
    expect(controller).toContain("speaker: 'writer'");
    expect(controller).toContain("speaker: 'maia'");
    expect(host).toContain('craftDialogue: readonly CraftDialogueTurn[]');
    expect(maia).toContain('Craft conversation');
    expect(maia).toContain("data-speaker={turn.speaker}");
    expect(maia).toContain("displayText: request");
    expect(css).toContain('R1 Craft dialogue');
    expect(css).toContain(".p4r1-maia-craft-r1-turn[data-speaker='writer']");
    expect(css).toContain(".p4r1-maia-craft-r1-turn[data-speaker='maia']");
  });

  it('keeps proactive wording under the writer setting rather than MAIA choice', () => {
    expect(contract).toContain('Suggestion posture and writer-owned synthesis');
    expect(contract).toContain('Wait-first');
    expect(contract).toContain('Suggest-first');
    expect(maia).toContain('MAIA may offer wording without waiting for me to ask');
    expect(maia).toContain('mayProposeImmediately');
    expect(controller).toContain('mayProposeImmediately');
    expect(craft).toContain('The demonstration is an example, not a recommendation');
  });

  it('keeps advanced capability available without turning it into default chrome', () => {
    expect(contract).toContain('Guided default');
    expect(contract).toContain('Professional depth');
    expect(contract).toContain('Plain ↔ Expert');
    expect(contract).toContain('Light ↔ Heavy');
    expect(maia).toContain('Edit strength');
    expect(maia).toContain('mayRemoveParagraphs');
    expect(table).toContain("notation === 'professional'");
  });

  it('supports governed whole-to-part rereading without pretending unsaved copy was read broadly', () => {
    expect(contract).toContain('Whole ↔ part intelligence');
    expect(scope).toContain('detectCraftRereadIntent');
    expect(scope).toContain('craftReadingScope');
    expect(controller).toContain('runCraftReread({');
    expect(controller).toContain('request: intentText');
    expect(reread).toContain('commission: requestDevelopmentalReading');
    expect(reread).toContain('LENS_ORDER');
    expect(reread).toContain('The governed reread reflects the canonical manuscript state.');
    expect(reread).toContain("coverage: complete ? 'complete' : 'partial'");
    expect(maia).toContain('data-craft-reading-coverage');
    expect(reread).toContain('Compare the current working copy separately.');
  });
});
