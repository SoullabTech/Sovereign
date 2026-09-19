/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import RevisionDesk from '@/app/writers-studio/insight/RevisionDesk';
import { approachNote, selectedProposalText, voiceNote } from '../editorialApproaches';
jest.mock('@/app/writers-studio/insight/WorkInspiration', () => ({ __esModule: true, default: () => null }));
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root, container: HTMLDivElement;
const version = { id: 'v1', author: 'maia' as const, wording: 'A warm fire opens a question.', supersedes: null, rationale: 'A possible direction.' };
const thread = { threadId: 't1', chainId: 'c1', locusText: 'My original story.', targetSectionId: 's1', sectionLabel: 'First', legacyLocus: false, turns: [], versions: [version], headVersionId: 'v1' };
let props: React.ComponentProps<typeof RevisionDesk>;
const render = () => act(() => root.render(React.createElement(RevisionDesk, props)));
const button = (name: string) => Array.from(container.querySelectorAll('button')).find(b => b.textContent === name)!;
const click = (name: string) => act(() => button(name).click());
beforeEach(() => {
  container = document.createElement('div'); document.body.append(container); root = createRoot(container);
  props = { showInspiration: false, scopeKey: 'scope1', manuscriptId: 'm1', title: 'First',
    currentText: 'My original story.', thread, version, instruction: '', onInstruction: jest.fn(),
    onSend: jest.fn(), onSelectVersion: jest.fn(), onApply: jest.fn(), onSaveMember: jest.fn(async () => true),
    busy: false, message: null, response: null, onKeep: jest.fn() };
});
afterEach(() => { act(() => root.unmount()); container.remove(); });
test('directions select one context without accumulating prompt blocks', () => {
  render(); click('Preserve and deepen'); click('One full telling, later echoes');
  expect(props.onInstruction).not.toHaveBeenCalled();
  click('Discuss this');
  const sent = (props.onSend as jest.Mock).mock.calls[0][0];
  expect(sent).toContain(approachNote('echo'));
  expect(sent).not.toContain(approachNote('deepen'));
  expect(props.onApply).not.toHaveBeenCalled();
});
test('keep remains available before proposals and does not save or apply', () => {
  props = { ...props, version: null, thread: null }; render(); click('Keep current wording');
  expect(props.onKeep).toHaveBeenCalledTimes(1);
  expect(props.onSaveMember).not.toHaveBeenCalled(); expect(props.onApply).not.toHaveBeenCalled();
});
test('partial wording changes only the working draft, then saves through existing version path', async () => {
  render(); click('Build from current wording');
  const proposal = container.querySelector<HTMLTextAreaElement>('textarea[aria-label="Select words from this proposal"]')!;
  act(() => { proposal.focus(); proposal.setSelectionRange(2, 11); document.dispatchEvent(new Event('selectionchange')); });
  const working = container.querySelector<HTMLTextAreaElement>('textarea.wsi-revision')!;
  act(() => { working.focus(); working.setSelectionRange(3, 11); document.dispatchEvent(new Event('selectionchange')); });
  click('Insert selected words into my working revision');
  expect(working.value).toBe('My warm fire story.');
  expect(props.onApply).not.toHaveBeenCalled();
  await act(async () => { button('Save your revision as a version').click(); });
  expect(props.onSaveMember).toHaveBeenCalledWith({ threadId: 't1', sectionId: 's1', supersedes: 'v1', text: 'My warm fire story.' });
  expect(props.onApply).not.toHaveBeenCalled();
});
test('a working draft is retained but cannot save into another passage', () => {
  render(); click('Adjust this wording');
  props = { ...props, scopeKey: 'scope2', thread: { ...thread, threadId: 't2', targetSectionId: 's2' } };
  render();
  expect(container.querySelector<HTMLTextAreaElement>('textarea.wsi-revision')!.value).toBe(version.wording);
  expect(button('Save your revision as a version').disabled).toBe(true);
  expect(button('Apply this proposal').disabled).toBe(true);
  props = { ...props, scopeKey: 'scope1', thread }; render();
  expect(button('Save your revision as a version').disabled).toBe(false);
});
test('a newly chosen alternative becomes visible after keeping the original', () => {
  render(); click('Keep current wording');
  props = { ...props, version: { ...version, id: 'v2', wording: 'Another direction.' } }; render();
  expect(container.querySelector('.wsi-proposed')?.textContent).toBe('Another direction.');
});
test('selection rejects empty and invalid ranges; voice reference is explicitly bounded', () => {
  expect(selectedProposalText('A 🔥 story', 2, 4)).toBe('🔥');
  expect(selectedProposalText('abc', -1, 2)).toBeNull();
  expect(selectedProposalText('abc', 0, 4)).toBeNull();
  expect(selectedProposalText('abc', 1, 1)).toBeNull();
  expect(voiceNote('', '')).toBe('');
  expect(voiceNote('Keep my cadence', 'My own example')).toContain('reference only, not replacement text');
});

test('discussion preserves an open draft and sends it only on the explicit gesture', () => {
  props = { ...props, instruction: 'Make the ending quieter.' }; render(); click('Adjust this wording');
  expect(button('Discuss this').disabled).toBe(false); click('Discuss this');
  expect(props.onSend).toHaveBeenCalledWith(expect.stringContaining('My unsaved working revision'));
  expect(container.querySelector<HTMLTextAreaElement>('textarea.wsi-revision')!.value).toBe(version.wording);
  expect(props.onApply).not.toHaveBeenCalled();
});
test('application requires context review of this exact version and invalidates on context change', () => {
  props = { ...props, sectionBody: 'Before. My original story. After.' }; render();
  expect(button('Apply this proposal').disabled).toBe(true); click('Read in context');
  expect(container.querySelector('mark')?.textContent).toBe(version.wording);
  expect(button('Apply this proposal').disabled).toBe(false);
  props = { ...props, sectionBody: 'Changed. My original story. After.' }; render();
  expect(button('Apply this proposal').disabled).toBe(true);
});
test('an applied receipt is separate from a new working draft', () => {
  props = { ...props, message: 'Selected revision applied.', appliedVersionId: 'v1' }; render(); click('Adjust this wording');
  expect(container.textContent).toContain('Working revision · not applied');
  expect(container.textContent).toContain('Applied revision:');
  expect(container.textContent).not.toContain('Selected revision applied.');
});
test('a returned alternative does not discard or silently reparent the working draft', () => {
  render(); click('Adjust this wording');
  const v2 = { ...version, id: 'v2', supersedes: 'v1', rationale: 'Editorial purpose: Quieter ending' };
  props = { ...props, version: v2, thread: { ...thread, versions: [version, v2], headVersionId: 'v2' } }; render();
  expect(container.querySelector<HTMLTextAreaElement>('textarea.wsi-revision')!.value).toBe(version.wording);
  expect(button('Save your revision as a version').disabled).toBe(true);
  click('Continue my draft after the latest alternative');
  expect(button('Save your revision as a version').disabled).toBe(false);
  expect(container.textContent).toContain('Quieter ending · v2');
});

test('teaching questions replace one another and preserve the working revision', () => {
  render(); click('Adjust this wording');
  const draft = container.querySelector('textarea.wsi-revision') as HTMLTextAreaElement;
  const before = draft.value;
  click('Explain the craft'); click('Make the case for my original'); click('Discuss this');
  const sent = (props.onSend as jest.Mock).mock.calls[0][0];
  expect(sent).toContain('Make the strongest case for keeping my original wording.');
  expect(sent).not.toContain('Explain the craft principle behind this suggestion using');
  expect(sent).toContain('My unsaved working revision');
  expect(draft.value).toBe(before);
  expect(props.onApply).not.toHaveBeenCalled(); expect(props.onSaveMember).not.toHaveBeenCalled();
});
