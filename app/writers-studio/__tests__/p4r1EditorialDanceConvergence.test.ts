import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('C2 editorial dance convergence', () => {
  const dance = read('app/dev/writers-studio-pc3-live/EditorialDancePanel.tsx');
  const host = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');

  it('embodies the 3827 authorship choreography without prototype mutation state', () => {
    expect(dance).toContain('MAIA offered a direction. You shape the language. The version you apply is yours.');
    expect(dance).toContain('Read my version in context');
    expect(dance).toContain('Save my version');
    expect(dance).toContain('Apply my version');
    expect(dance).toContain('Undo this change');
    expect(dance).not.toContain('setAppliedText');
    expect(dance).not.toContain('localStorage');
  });

  it('uses the real 3136 proposal and member-version callbacks', () => {
    expect(dance).toContain('thread.versions');
    expect(dance).toContain('props.onSelectVersion');
    expect(dance).toContain('props.onSaveMember');
    expect(dance).toContain('props.onSend');
    expect(dance).toContain('props.onApply');
    expect(dance).toContain('props.onUndo');
  });

  it('makes writer-shaped wording the conversational authority', () => {
    expect(dance).toContain('My working revision (not applied):');
    expect(dance).toContain('Treat my working revision as the wording I am shaping now.');
    expect(dance).toContain('Do not silently restore your earlier proposal.');
  });

  it('keeps Apply unreachable until exact current working text was reviewed and saved as member wording', () => {
    expect(dance).toContain('const reviewedCurrentDraft = reviewedText === workingText;');
    expect(dance).toContain("candidate.author === 'member' && candidate.wording === workingText");
    expect(dance).toContain('disabled={props.busy || !applyReady}');
  });

  it('requests additional creative directions through the existing editorial thread', () => {
    expect(dance).toContain('EDITORIAL_APPROACHES.map');
    expect(dance).toContain('approachNote(id)');
    expect(dance).toContain('Offer one possible revision of this exact passage in that direction.');
  });

  it('makes progressive craft depth real MAIA acts, not decorative toggles', () => {
    expect(dance).toContain('Teach me why this editorial direction works or does not work in this exact passage.');
    expect(dance).toContain('Go deeper on this editorial direction.');
    expect(dance).toContain('props.onSend([');
    expect(dance).toContain('props.lastMaiaTurn?.body');
  });

  it('uses one quiet selection affordance instead of the old multi-button ribbon', () => {
    expect(host).toContain('Work with passage');
    expect(host).toContain('p4r1-selection-menu');
    expect(host).toContain('<b>Focus</b>');
    expect(host).toContain('<b>Revise</b>');
    expect(host).toContain('<b>Discuss</b>');
    expect(host).toContain('Discuss what is happening in this exact passage with me before proposing any edits.');
    expect(host).toContain('<b>Teach me</b>');
    expect(host).toContain('<b>Go deeper</b>');
    const selectionStart = host.indexOf('const contextualActions =');
    const selectionEnd = host.indexOf('const maiaRelationshipCard =', selectionStart);
    const selectionAffordance = host.slice(selectionStart, selectionEnd);
    expect(selectionAffordance).not.toContain('className="p4r1-locus-actions"');
  });

  it('never lets the full editorial dance float over an exact held passage', () => {
    expect(host).toContain('props.workspaceOpen && !isolatedEditorial && !props.held');
    expect(host).toContain('props.workspaceOpen && props.held && !isolatedEditorial');
  });

  it('keeps the mature RevisionDesk behind the simple adapter instead of replacing it', () => {
    expect(host).toContain('<EditorialDancePanel');
    expect(host).toContain('<RevisionDesk');
    expect(host).toContain('More editorial controls');
  });
});
