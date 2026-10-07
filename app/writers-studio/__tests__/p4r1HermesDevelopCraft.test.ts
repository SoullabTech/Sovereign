import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('R8H Hermes Develop Craft canvas', () => {
  const host = read('app/dev/writers-studio-p4r1/P4R1StudioHost.tsx');
  const develop = read('app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx');
  const observationDialogue = read('app/writers-studio/develop/ObservationDialogue.tsx');
  const developController = read('app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx');
  const craftController = read('app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx');
  const canvas = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  const hermes = read('app/dev/writers-studio-pc3-live/HermesCraftPanel.tsx');
  const manuscript = read('app/writers-studio/canvas/WholeManuscriptSurface.tsx');
  const marks = read('app/dev/writers-studio-pc3-live/RevisionManuscriptLayer.tsx');
  const css = read('app/dev/writers-studio-p4r1/p4r1-live.css');

  it('keeps Craft in Develop while Write remains the clean authorship surface', () => {
    expect(host).toContain("mode === 'develop' && params?.get('developCraft') === '1'");
    expect(host).toContain('<P4R1WriteEditController surfaceMode="develop-craft" />');
    expect(craftController).toContain("surfaceMode = 'write'");
    expect(canvas).toContain("mode={props.surfaceMode === 'develop-craft' ? 'develop' : 'write'}");
    expect(developController).toContain("query.set('developCraft', '1')");
  });

  it('uses originating chapter evidence first, with conversation-only passage choice as the fallback', () => {
    expect(develop).toContain('afterMaiaTurn={({ threadId, lastMaiaTurnIndex, lastMaiaTurnBody }) => {');
    expect(develop).toContain('chapterDialogue.sectionId ?? props.currentSectionId');
    expect(develop).toContain('sourceMaiaTurnBody: lastMaiaTurnBody');
    expect(develop).toContain('props.onWorkWithAttentionItem(');
    expect(develop).toContain('chapterDialogue.itemId');
    expect(develop).toContain('chapterDialogue.sectionId ?? sectionId');
    expect(develop).toContain('props.onCraftFromConversation(props.currentSectionId!');
    expect(developController).toContain('resolveCraftLocusHint(craftFromConversation.sourceMaiaTurnBody, context.sections)');
    expect(developController).toContain("query.set('insightAction', 'craft-passage')");
    expect(developController).toContain('query.set(CRAFT_HINT_START, String(hint.start))');
    expect(developController).toContain('query.set(CRAFT_HINT_END, String(hint.end))');
    expect(developController).toContain('query.set(CRAFT_SOURCE_THREAD, carry.sourceThreadId)');
    expect(craftController).toContain('resolved-craft-hint');
    expect(craftController).toContain("arrivalInsight?.readingId ?? 'conversation-only'");
  });

  it('keeps Hermes intact across a permission-to-read observation dialogue', () => {
    expect(observationDialogue).toContain('afterMaiaTurn?: ReactNode');
    expect(observationDialogue).toContain("lastTurn?.speaker === 'maia'");
    expect(observationDialogue).toContain('data-observation-after-maia-turn');
    expect(observationDialogue).toContain('question: pausedQuestion.current');
    expect(observationDialogue).toContain("if (mode.kind !== 'open') return");
    expect(observationDialogue).toContain("mode.kind !== 'resume'");
    expect(develop).toContain('props.observationWorkTargets[selectedObservation.key]');
    expect(develop).toContain('Work this into the writing →');
    expect(develop).toContain('sourceMaiaTurnBody: lastMaiaTurnBody');
  });

  it('waits for explicit privacy posture without consuming the automatic Craft act', () => {
    expect(craftController).toContain('!sessionPosture.resolved');
    expect(craftController).toContain('sessionPosture.sanctuary');
    expect(craftController).toContain('sessionPosture,');
    expect(craftController).toContain('Your Craft request is still held here.');
    const primerAt = craftController.indexOf("const key = [\n      'craft-primer'");
    const effectAt = craftController.lastIndexOf('useEffect(() => {', primerAt);
    const craftEffect = craftController.slice(effectAt, craftController.indexOf('  const makeThisAWork', primerAt));
    expect(craftEffect.indexOf('autoCraftKey.current = key')).toBeGreaterThan(craftEffect.indexOf('!sessionPosture.resolved'));
  });

  it('makes Hermes the only visible Craft relationship instead of exposing the editorial dashboard', () => {
    expect(canvas).toContain("import HermesCraftPanel from './HermesCraftPanel'");
    expect(canvas).toContain('<HermesCraftPanel');
    expect(canvas).toContain("props.surfaceMode !== 'develop-craft'\n    && selectionRect");
    expect(canvas).toContain("const isolatedRoom = props.surfaceMode !== 'develop-craft'");
    expect(canvas).toContain("props.surfaceMode !== 'develop-craft'\n    && (props.attentionReturnItemId || lineageReturnActive)");
    expect(hermes).toContain('Hermes · with MAIA');
    expect(hermes).toContain('What you discovered comes with you.');
    expect(hermes).toContain('Another way');
    expect(hermes).toContain('Lighter');
    expect(hermes).toContain('More embodied');
    expect(hermes).toContain('Teach me');
    expect(hermes).toContain('Go deeper');
    expect(hermes).toContain('Tell Hermes what you want the writing to do');
    expect(hermes).not.toContain('RevisionDesk');
    expect(hermes).not.toContain('More editorial controls');
  });

  it('docks the Craftsman relationship beside the manuscript instead of floating over it', () => {
    expect(canvas).toContain("const craftEditorialInShell = props.surfaceMode === 'develop-craft' && editorial");
    expect(canvas).toContain('maia={shellMaia}');
    expect(canvas).toContain('maiaResizable={shellHasCraftEditorial}');
    expect(canvas).toContain("props.surfaceMode === 'develop-craft' ? null : editorial");
    expect(css).toContain('.fr-maia > .p4r1-context-card.p4r1-editorial');
    expect(css).toContain('position:relative;');
    expect(css).toContain('width:100%;');
  });

  it('makes the manuscript non-destructive and selectable in Develop Craft', () => {
    expect(manuscript).toContain('readOnly?: boolean');
    expect(manuscript).toContain('aria-readonly="true"');
    expect(manuscript).toContain('data-write-editor');
    expect(canvas).toContain("readOnly={props.surfaceMode === 'develop-craft'}");
    expect(canvas).toContain("props.surfaceMode !== 'develop-craft' && props.workspaceOpen && props.held");
  });

  it('provides Markup and Preview as two views of the same chosen revision state', () => {
    expect(canvas).toContain("useState<'markup' | 'preview'>('markup')");
    expect(canvas).toContain('Work directly in the writing');
    expect(canvas).toContain('Markup');
    expect(canvas).toContain('Preview');
    expect(canvas).toContain("props.suggestedVersion?.author === 'member'");
    expect(canvas).toContain('editIds(editorialSegments(props.held.text, props.suggestedVersion.wording))');
    expect(canvas).toContain('composeSelected(');
    expect(canvas).toContain('selectedRevisionEdits');
    expect(canvas).toContain("craftView !== 'preview'");
    expect(canvas).toContain("craftView === 'markup'");
  });

  it('marks the craft locus immediately, then uses conventional red/blue edit notation', () => {
    expect(marks).toContain('showLocus = false');
    expect(marks).toContain('p4r1-craft-locus-ink');
    expect(canvas).toContain("showLocus={props.surfaceMode === 'develop-craft'}");
    expect(marks).toContain("data-delete={edit.from ? 'true' : undefined}");
    expect(marks).toContain("data-insert={edit.to ? 'true' : undefined}");
    expect(marks).toContain('p4r1-revision-inline-insert');
    expect(css).toContain('.p4r1-craft-locus-ink');
    expect(css).toContain("span[data-delete='true']");
    expect(css).toContain('#b54b4b');
    expect(css).toContain('#3568aa');
    expect(css).toContain('.p4r1-craft-view-switch');
  });

  it('keeps Apply as the mutation boundary', () => {
    expect(canvas).toContain('Nothing changes until you choose to apply your version.');
    expect(hermes).toContain('Apply my version');
    expect(canvas).toContain('onApply={props.onApply}');
    expect(marks).toContain('Save these as my version');
  });
});
