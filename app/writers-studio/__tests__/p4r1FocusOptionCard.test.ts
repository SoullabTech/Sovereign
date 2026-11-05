/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import EditorialDancePanel from '@/app/dev/writers-studio-pc3-live/EditorialDancePanel';

/** Conversation-first Focus, step 3: MAIA's option is one compact card inside the conversation. */

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root; let container: HTMLDivElement;
beforeEach(() => { container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
afterEach(() => { act(() => root.unmount()); container.remove(); });

const maiaVersion = {
  id: 'v1', author: 'maia' as const, wording: 'A cleaner turn.', supersedes: null,
  rationale: 'Editorial purpose: Clearer turn\nReduce repeated explanation while preserving the image.',
};
const turns = [
  { turnIndex: 0, speaker: 'author', body: 'Let’s talk about what’s happening in this passage.', at: 't0' },
  { turnIndex: 1, speaker: 'maia', body: 'What is the turn for?', at: 't1' },
  { turnIndex: 2, speaker: 'author', body: 'Show me revision options, from what we’ve discussed.', at: 't2' },
  { turnIndex: 3, speaker: 'maia', body: 'What I’d preserve: the image.\n\nEditorial purpose: Clearer turn', at: 't3' },
];
const thread = {
  threadId: 't1', chainId: 'c1', locusText: 'Original words.', targetSectionId: 's1', sectionLabel: null, legacyLocus: false,
  turns, versions: [maiaVersion], headVersionId: 'v1',
};

function render(extra: Record<string, unknown> = {}) {
  const props = {
    manuscriptTitle: 'Threshold', currentText: 'Original words.', sectionBody: 'Before sentence. Original words. After sentence.',
    thread, version: maiaVersion, lastMaiaTurn: turns[3], appliedVersionId: null, busy: false, message: null, undoMessage: null,
    sessionPosture: { resolved: true, sanctuary: false }, onChooseSessionPosture: jest.fn(), onSelectVersion: jest.fn(),
    onSend: jest.fn(), onSaveMember: jest.fn(async () => true), onApply: jest.fn(), onUndo: jest.fn(), onKeep: jest.fn(), onDepth: jest.fn(),
    onUseVersion: jest.fn(async () => true),
    ...extra,
  };
  act(() => root.render(React.createElement(EditorialDancePanel, props as any)));
  return props as any;
}
const card = () => container.querySelector('[data-option-card]')!;
const btn = (sel: string) => container.querySelector<HTMLButtonElement>(sel)!;

test('the option is one card: purpose, the passage in context with changes marked, three actions', () => {
  render();
  expect(card()).not.toBeNull();
  expect(card().querySelector('h4')!.textContent).toContain('Clearer turn');
  const ctx = card().querySelector('[data-option-in-context]')!;
  expect(ctx.textContent).toContain('Before sentence.');
  expect(ctx.textContent).toContain('After sentence.');
  expect(Array.from(ctx.querySelectorAll('ins')).map((n) => n.textContent).join(' ')).toContain('cleaner');
  expect(Array.from(ctx.querySelectorAll('del')).map((n) => n.textContent).join(' ')).toContain('Original');
  expect(['[data-option-use]', '[data-option-adjust]', '[data-option-another]'].map((s) => btn(s).textContent))
    .toEqual(['Use this', 'Adjust', 'Another']);
});

test('the conversation stays above the card; MAIA’s latest turn is the card, not repeated', () => {
  render();
  const conv = container.querySelector('[data-option-conversation] [data-focus-conversation]')!;
  const speakers = Array.from(conv.children).map((li) => li.getAttribute('data-turn-speaker'));
  expect(speakers).toEqual(['author', 'maia', 'author']);
});

test('Use this is one act: saves MAIA’s wording as the writer’s version and applies it, nothing else', async () => {
  const p = render();
  await act(async () => { btn('[data-option-use]').click(); await Promise.resolve(); });
  expect(p.onUseVersion).toHaveBeenCalledTimes(1);
  expect(p.onUseVersion.mock.calls[0][0]).toMatchObject({ threadId: 't1', sectionId: 's1', supersedes: 'v1', text: 'A cleaner turn.' });
  expect(p.onSend).not.toHaveBeenCalled();
  expect(p.onApply).not.toHaveBeenCalled();
  expect(p.onSaveMember).not.toHaveBeenCalled();
});

test('a failed Use this says the manuscript is unchanged', async () => {
  render({ onUseVersion: jest.fn(async () => false) });
  await act(async () => { btn('[data-option-use]').click(); await Promise.resolve(); });
  expect(card().textContent).toContain('Your manuscript is unchanged.');
});

test('once applied, the card offers Undo in place of the actions', () => {
  const p = render({ appliedVersionId: 'm1' });
  expect(container.querySelector('[data-option-use]')).toBeNull();
  const undo = Array.from(card().querySelectorAll('button')).find((b) => b.textContent === 'Undo this change')!;
  act(() => undo.click());
  expect(p.onUndo).toHaveBeenCalled();
});

test('Adjust opens More with the writer’s own working version; Another asks MAIA for another option', () => {
  const p = render();
  const more = container.querySelector<HTMLDetailsElement>('[data-option-more]')!;
  expect(more.open).toBe(false);
  act(() => btn('[data-option-adjust]').click());
  expect(more.open).toBe(true);
  expect(more.querySelector('textarea[aria-label="Edit your working version"]')).not.toBeNull();
  act(() => btn('[data-option-another]').click());
  expect(p.onSend.mock.calls.at(-1)?.[0]).toContain('one genuinely different option');
});

test('Use this is not offered under Sanctuary', () => {
  render({ sessionPosture: { resolved: true, sanctuary: true } });
  expect(btn('[data-option-use]').disabled).toBe(true);
});

test('the writer’s just-sent words show at once, and not twice once the thread has them', () => {
  render({ busy: true, pendingQuestion: 'Make it quieter.' });
  expect(container.querySelector('[data-pending-turn]')!.textContent).toContain('Make it quieter.');
  render({ busy: true, pendingQuestion: 'Show me revision options, from what we’ve discussed.' });
  expect(container.querySelector('[data-pending-turn]')).toBeNull();
});

test('controller: Use this saves the writer’s version, then applies that exact saved id', () => {
  const src = require('fs').readFileSync(require('path').join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx'), 'utf8') as string;
  const i = src.indexOf('const useVersionNow = useCallback');
  const body = src.slice(i, src.indexOf('}, [saveMemberRevisionForId, applyVersionById]);', i));
  expect(body).toContain('const savedId = await saveMemberRevisionForId(draft);');
  expect(body).toContain('if (!savedId) return false;');
  expect(body).toContain('await applyVersionById(savedId);');
  expect(src).toContain('onUseVersion={useVersionNow}');
});

test('after an Undo, Use this replaces the latest version (the writer’s earlier save), not MAIA’s option', async () => {
  const member = { id: 'm1', author: 'member' as const, wording: 'A cleaner turn.', supersedes: 'v1', rationale: null };
  const p = render({ thread: { ...thread, versions: [maiaVersion, member], headVersionId: 'm1' } });
  await act(async () => { btn('[data-option-use]').click(); await Promise.resolve(); });
  expect(p.onUseVersion.mock.calls[0][0]).toMatchObject({ supersedes: 'm1', text: 'A cleaner turn.' });
});

test('a reply-only turn after the option stays in the conversation; the card says it is earlier', () => {
  // Seen on production 2026-11-05: Discuss after an option showed no reply at all.
  const withAdjunct = [
    ...turns.slice(0, 3),
    { ...turns[3]!, adjunct: { kind: 'version', id: 'v1' } },
    { turnIndex: 4, speaker: 'author', body: 'Let’s talk about what’s happening in this passage.', at: 't4' },
    { turnIndex: 5, speaker: 'maia', body: 'The two sentences disagree about their subject.', at: 't5', adjunct: null },
  ];
  render({ thread: { ...thread, turns: withAdjunct }, lastMaiaTurn: withAdjunct[5] });
  const conv = container.querySelector('[data-option-conversation] [data-focus-conversation]')!;
  expect(conv.textContent).toContain('The two sentences disagree about their subject.');
  expect(card().querySelector('.p4r1-eyebrow')!.textContent).toBe('MAIA’s earlier option');
});

test('the turn that produced the option is still folded into the card', () => {
  const withAdjunct = [...turns.slice(0, 3), { ...turns[3]!, adjunct: { kind: 'version', id: 'v1' } }];
  render({ thread: { ...thread, turns: withAdjunct }, lastMaiaTurn: withAdjunct[3] });
  const conv = container.querySelector('[data-option-conversation] [data-focus-conversation]')!;
  expect(Array.from(conv.children).map((li) => li.getAttribute('data-turn-speaker'))).toEqual(['author', 'maia', 'author']);
  expect(card().querySelector('.p4r1-eyebrow')!.textContent).toBe('MAIA’s option');
});
