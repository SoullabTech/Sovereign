import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('R8H Hermes Develop Craft canvas', () => {
  const host = read('app/dev/writers-studio-p4r1/P4R1StudioHost.tsx');
  const develop = read('app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx');
  const developController = read('app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx');
  const craftController = read('app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx');
  const canvas = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
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

  it('lets any chapter conversation cross through Hermes even without an exact prior passage citation', () => {
    expect(develop).toContain('afterMaiaTurn={({ threadId, lastMaiaTurnIndex }) => {');
    expect(develop).toContain('chapterDialogue.sectionId ?? props.currentSectionId');
    expect(develop).toContain('props.onCraftFromConversation(sectionId, carry)');
    expect(developController).toContain("query.set('insightAction', 'choose-craft-passage')");
    expect(developController).toContain('query.set(CRAFT_SOURCE_THREAD, carry.sourceThreadId)');
    expect(craftController).toContain('chosen-conversation-craft-passage');
    expect(craftController).toContain("arrivalInsight?.readingId ?? 'conversation-only'");
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
    expect(canvas).toContain('Editor’s eye ↔ Reader’s eye');
    expect(canvas).toContain('Markup');
    expect(canvas).toContain('Preview');
    expect(canvas).toContain("props.suggestedVersion?.author === 'member'");
    expect(canvas).toContain('editIds(editorialSegments(props.held.text, props.suggestedVersion.wording))');
    expect(canvas).toContain('composeSelected(');
    expect(canvas).toContain('selectedRevisionEdits');
    expect(canvas).toContain("craftView !== 'preview'");
    expect(canvas).toContain("craftView === 'markup'");
  });

  it('uses conventional in-page edit marks rather than a loose textarea-only craft surface', () => {
    expect(marks).toContain("data-delete={edit.from ? 'true' : undefined}");
    expect(marks).toContain("data-insert={edit.to ? 'true' : undefined}");
    expect(marks).toContain('p4r1-revision-inline-insert');
    expect(css).toContain("span[data-delete='true']");
    expect(css).toContain('#b54b4b');
    expect(css).toContain('#3568aa');
    expect(css).toContain('.p4r1-craft-view-switch');
  });

  it('keeps Apply as the mutation boundary', () => {
    expect(canvas).toContain('Nothing changes until Apply.');
    expect(canvas).toContain('onApply={props.onApply}');
    expect(marks).toContain('Save these as my version');
  });
});
