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
test('directions add an editable question without generating or applying', () => {
  render(); click('Explore preserve and deepen');
  expect(props.onInstruction).toHaveBeenCalledWith(approachNote('deepen'));
  expect(props.onSend).not.toHaveBeenCalled(); expect(props.onApply).not.toHaveBeenCalled();
  expect(container.textContent).toContain('Consider:');
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
