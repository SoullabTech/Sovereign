import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe("Develop → Hermes → Craftsman's Table R1", () => {
  const host = read('app/dev/writers-studio-p4r1/P4R1StudioHost.tsx');
  const develop = read('app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx');
  const observationDialogue = read('app/writers-studio/develop/ObservationDialogue.tsx');
  const developController = read('app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx');
  const craftController = read('app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx');
  const canvas = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  const table = read('app/dev/writers-studio-pc3-live/CraftsmansTableR1.tsx');
  const maia = read('app/dev/writers-studio-pc3-live/MaiaCraftCompanionR1.tsx');
  const css = read('app/dev/writers-studio-p4r1/p4r1-live.css');

  it('keeps Craft inside Develop while Write remains the clean authorship surface', () => {
    expect(host).toContain("mode === 'develop' && params?.get('developCraft') === '1'");
    expect(host).toContain('<P4R1WriteEditController surfaceMode="develop-craft" />');
    expect(craftController).toContain("surfaceMode = 'write'");
    expect(canvas).toContain("mode={props.surfaceMode === 'develop-craft' ? 'develop' : 'write'}");
    expect(developController).toContain("query.set('developCraft', '1')");
  });

  it('carries the originating MAIA conversation and resolves a lawful current locus', () => {
    expect(develop).toContain('afterMaiaTurn={({ threadId, lastMaiaTurnIndex, lastMaiaTurnBody }) => {');
    expect(develop).toContain('sourceMaiaTurnBody: lastMaiaTurnBody');
    expect(develop).toContain('props.onWorkWithAttentionItem(');
    expect(developController).toContain('resolveCraftLocusHint(craftFromConversation.sourceMaiaTurnBody, context.sections)');
    expect(developController).toContain("query.set('insightAction', 'craft-passage')");
    expect(developController).toContain('query.set(CRAFT_HINT_START, String(hint.start))');
    expect(developController).toContain('query.set(CRAFT_HINT_END, String(hint.end))');
    expect(developController).toContain('query.set(CRAFT_SOURCE_THREAD, carry.sourceThreadId)');
    expect(craftController).toContain('resolved-craft-hint');
    expect(craftController).toContain("arrivalInsight?.readingId ?? 'conversation-only'");
  });

  it('keeps relational continuity across permission-to-read', () => {
    expect(observationDialogue).toContain('afterMaiaTurn?: ReactNode');
    expect(observationDialogue).toContain("lastTurn?.speaker === 'maia'");
    expect(observationDialogue).toContain('data-observation-after-maia-turn');
    expect(observationDialogue).toContain('question: pausedQuestion.current');
    expect(observationDialogue).toContain("if (mode.kind !== 'open') return");
    expect(observationDialogue).toContain("mode.kind !== 'resume'");
    expect(develop).toContain('Work this into the writing →');
    expect(develop).toContain('sourceMaiaTurnBody: lastMaiaTurnBody');
  });

  it('waits for explicit privacy posture without consuming the held Craft act', () => {
    expect(craftController).toContain('!sessionPosture.resolved');
    expect(craftController).toContain('sessionPosture.sanctuary');
    expect(craftController).toContain('Your Craft request is still held here.');
    const primerAt = craftController.indexOf("const key = [\n      'craft-primer'");
    const effectAt = craftController.lastIndexOf('useEffect(() => {', primerAt);
    const craftEffect = craftController.slice(effectAt, craftController.indexOf('  const makeThisAWork', primerAt));
    expect(craftEffect.indexOf('autoCraftKey.current = key')).toBeGreaterThan(craftEffect.indexOf('!sessionPosture.resolved'));
  });

  it('routes Develop Craft through the manuscript-native R1 workbench', () => {
    expect(canvas).toContain("import CraftsmansTableR1 from './CraftsmansTableR1'");
    expect(canvas).toContain("import MaiaCraftCompanionR1 from './MaiaCraftCompanionR1'");
    expect(canvas).toContain("const craftR1Surface = props.surfaceMode === 'develop-craft'");
    expect(canvas).toContain('<CraftsmansTableR1');
    expect(canvas).toContain('<MaiaCraftCompanionR1');
    expect(canvas).toContain("const workSurface = props.surfaceMode === 'develop-craft'");
    expect(canvas).toContain("const isolatedRoom = props.surfaceMode !== 'develop-craft'");
    expect(canvas).toContain("props.surfaceMode !== 'develop-craft' && mounted");
  });

  it('keeps MAIA beside the table rather than exposing a second editorial application', () => {
    expect(canvas).toContain('maia={shellMaia}');
    expect(canvas).toContain('maiaResizable={shellHasCraftEditorial}');
    expect(maia).toContain('<span className="p4r1-eyebrow">MAIA</span>');
    expect(maia).toContain('What do you want the writing to do?');
    expect(maia).toContain('Ways to work');
    expect(maia).not.toContain('RevisionDesk');
    expect(maia).not.toContain('More editorial controls');
  });

  it('makes Markup and Preview views of one writer-owned working state', () => {
    expect(table).toContain("useState<'markup' | 'preview'>('markup')");
    expect(table).toContain('Markup');
    expect(table).toContain('Preview');
    expect(table).toContain('workingText');
    expect(table).toContain('composeCraftWorkingCopy');
    expect(table).toContain('Write from mine');
    expect(table).toContain('Edit current hybrid');
    expect(table).toContain('Start from MAIA');
  });

  it('uses professional red/blue conventions with progressive disclosure', () => {
    expect(table).toContain('<del');
    expect(table).toContain('<ins');
    expect(table).toContain("notation === 'professional'");
    expect(table).toContain('professionalMarkFor');
    expect(css).toContain('.p4r1-craft-r1-locus del');
    expect(css).toContain('.p4r1-craft-r1-locus ins');
    expect(css).toContain('#b54b4b');
    expect(css).toContain('#4c86cf');
    expect(css).toContain('.p4r1-craft-r1-proofmark');
  });

  it('keeps Apply as the writer-owned mutation boundary', () => {
    expect(table).toContain('Save my version');
    expect(table).toContain('Apply my version');
    expect(table).toContain('Undo');
    expect(canvas).toContain('onApply={props.onApply}');
    expect(craftController).toContain('adoptBoundEditorialVersion(');
  });

  it('grounds every Craft turn in the writer current working copy and can widen scope explicitly', () => {
    expect(craftController).toContain('Writer-owned current working passage:');
    expect(craftController).toContain('detectCraftRereadIntent(intentText)');
    expect(craftController).toContain('const intentText = options?.displayText ?? text;');
    expect(craftController).toContain('requestDevelopmentalReading(');
    expect(craftController).toContain('runWholeManuscriptReview(');
    expect(craftController).toContain('The governed reread reflects the canonical manuscript state.');
  });
});
