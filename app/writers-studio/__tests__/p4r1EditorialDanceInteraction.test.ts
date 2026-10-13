/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import EditorialDancePanel from '@/app/dev/writers-studio-pc3-live/EditorialDancePanel';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const maiaVersion = {
  id: 'v1',
  author: 'maia' as const,
  wording: 'A cleaner turn.',
  supersedes: null,
  rationale: 'Editorial purpose: Clearer turn\nReduce repeated explanation while preserving the image.',
};

const memberVersion = {
  id: 'v2',
  author: 'member' as const,
  wording: 'My cleaner turn.',
  supersedes: 'v1',
  rationale: 'Editorial purpose: My version',
};

function thread(versions = [maiaVersion] as any[]) {
  return {
    threadId: 't1',
    chainId: 'c1',
    targetSectionId: 's1',
    sectionLabel: 'Threshold',
    locusText: 'Original words.',
    legacyLocus: false,
    turns: [
      { turnIndex: 0, speaker: 'maia' as const, body: 'I would keep the movement and make the turn cleaner.', at: '2026-09-28T10:00:00Z' },
    ],
    versions,
    headVersionId: versions[versions.length - 1]?.id ?? null,
    application: null,
  };
}

test('writer shapes MAIA wording, discusses it, reviews exact text, saves member version, then Apply becomes reachable', async () => {
  const onSend = jest.fn();
  const onSaveMember = jest.fn(async () => true);
  const onApply = jest.fn();
  const onUndo = jest.fn();
  const onSelectVersion = jest.fn();
  const onKeep = jest.fn();
  const onDepth = jest.fn();

  let props: any = {
    manuscriptTitle: 'Threshold',
    currentText: 'Original words.',
    sectionBody: 'Before.\n\nOriginal words.\n\nAfter.',
    thread: thread(),
    version: maiaVersion,
    lastMaiaTurn: thread().turns[0],
    appliedVersionId: null,
    busy: false,
    message: null,
    undoMessage: null,
    sessionPosture: { resolved: true, sanctuary: false },
    onChooseSessionPosture: jest.fn(),
    onSelectVersion,
    onSend,
    onSaveMember,
    onApply,
    onUndo,
    onKeep,
    onDepth,
  };

  const draw = () => act(() => root.render(React.createElement(EditorialDancePanel, props)));
  draw();

  const button = (text: string) =>
    Array.from(container.querySelectorAll('button')).find((b) => b.textContent === text)!;

  const editor = container.querySelector('textarea[aria-label="Edit your working version"]') as HTMLTextAreaElement;
  expect(editor.value).toBe('A cleaner turn.');
  expect(button('Apply my version').disabled).toBe(true);

  act(() => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!
      .call(editor, 'My cleaner turn.');
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  });

  const talk = container.querySelector('input[aria-label="Tell MAIA how you want to shape this version"]') as HTMLInputElement;
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
      .call(talk, 'Keep my cadence but trust the image more.');
    talk.dispatchEvent(new Event('input', { bubbles: true }));
  });
  act(() => button('Talk it through').click());
  expect(onSend).toHaveBeenCalled();
  expect(onSend.mock.calls.at(-1)?.[0]).toContain('My working revision (not applied):\nMy cleaner turn.');
  expect(onSend.mock.calls.at(-1)?.[0]).toContain('Do not silently restore your earlier proposal.');

  act(() => button('Read my version in context').click());
  expect(container.querySelector('.p4r1-dance-context')?.textContent).toContain('My cleaner turn.');
  expect(button('Apply my version').disabled).toBe(true);

  await act(async () => button('Save my version').click());
  expect(onSaveMember).toHaveBeenCalledWith({
    threadId: 't1',
    sectionId: 's1',
    supersedes: 'v1',
    text: 'My cleaner turn.',
    purpose: 'Clearer turn',
  });

  props = {
    ...props,
    thread: thread([maiaVersion, memberVersion]),
    version: memberVersion,
  };
  draw();

  expect((container.querySelector('textarea[aria-label="Edit your working version"]') as HTMLTextAreaElement).value)
    .toBe('My cleaner turn.');
  expect(button('Apply my version').disabled).toBe(false);

  act(() => button('Apply my version').click());
  expect(onApply).toHaveBeenCalledTimes(1);

  props = { ...props, appliedVersionId: 'v2' };
  draw();
  expect(button('Undo this change')).toBeTruthy();
  act(() => button('Undo this change').click());
  expect(onUndo).toHaveBeenCalledTimes(1);
});

test('creative direction buttons request real proposal turns instead of fabricating local versions', () => {
  const onSend = jest.fn();
  const props: any = {
    manuscriptTitle: 'Threshold',
    currentText: 'Original words.',
    sectionBody: 'Before.\n\nOriginal words.\n\nAfter.',
    thread: thread(),
    version: maiaVersion,
    lastMaiaTurn: thread().turns[0],
    appliedVersionId: null,
    busy: false,
    message: null,
    undoMessage: null,
    sessionPosture: { resolved: true, sanctuary: false },
    onChooseSessionPosture: jest.fn(),
    onSelectVersion: jest.fn(),
    onSend,
    onSaveMember: jest.fn(async () => true),
    onApply: jest.fn(),
    onUndo: jest.fn(),
    onKeep: jest.fn(),
    onDepth: jest.fn(),
  };

  act(() => root.render(React.createElement(EditorialDancePanel, props)));
  const direction = Array.from(container.querySelectorAll('button'))
    .find((b) => b.textContent === 'Preserve and deepen')!;
  act(() => direction.click());

  expect(onSend).toHaveBeenCalledTimes(1);
  expect(onSend.mock.calls[0][0]).toContain('Direction I want to explore: Preserve and deepen');
  expect(onSend.mock.calls[0][0]).toContain('Nothing is to be applied automatically.');
  expect(onSend.mock.calls[0][1]).toEqual({ proposalPolicy: 'allow', proposalRequested: true });
});


test('near-duplicate stored MAIA versions are not presented as separate creative directions', () => {
  const duplicatePurpose = {
    id: 'v1b',
    author: 'maia' as const,
    wording: 'A slightly different cleaner turn.',
    supersedes: 'v1',
    rationale: 'Editorial purpose: Clearer turn\nA second attempt at the same purpose.',
  };
  const duplicateWording = {
    id: 'v1c',
    author: 'maia' as const,
    wording: 'Let the image arrive before the explanation.',
    supersedes: 'v1b',
    rationale: 'Editorial purpose: Another label',
  };
  const genuinelyDifferent = {
    id: 'v3',
    author: 'maia' as const,
    wording: 'Let the image arrive before the explanation.',
    supersedes: 'v1c',
    rationale: 'Editorial purpose: More embodied\nBring the felt image forward.',
  };
  const realThread = thread([maiaVersion, duplicatePurpose, duplicateWording, genuinelyDifferent]);

  act(() => root.render(React.createElement(EditorialDancePanel, {
    manuscriptTitle: 'Threshold',
    currentText: 'Original words.',
    sectionBody: 'Before.\n\nOriginal words.\n\nAfter.',
    thread: realThread,
    version: genuinelyDifferent,
    lastMaiaTurn: realThread.turns[0],
    appliedVersionId: null,
    busy: false,
    message: null,
    undoMessage: null,
    sessionPosture: { resolved: true, sanctuary: false },
    onChooseSessionPosture: jest.fn(),
    onSelectVersion: jest.fn(),
    onSend: jest.fn(),
    onSaveMember: jest.fn(async () => true),
    onApply: jest.fn(),
    onUndo: jest.fn(),
    onKeep: jest.fn(),
    onDepth: jest.fn(),
  } as any)));

  const options = Array.from(container.querySelectorAll('.p4r1-dance-options > button'));
  const text = options.map((button) => button.textContent ?? '').join(' | ');
  expect(text.match(/Clearer turn/g)?.length ?? 0).toBeLessThanOrEqual(1);
  expect(text).toContain('More embodied');
  expect(options.length).toBe(2);
});


test('empty editorial room offers examples and ideas as real MAIA acts', () => {
  const onSend = jest.fn();
  const onDepth = jest.fn();
  act(() => root.render(React.createElement(EditorialDancePanel, {
    manuscriptTitle: 'Threshold',
    currentText: 'Original words.',
    sectionBody: 'Before.\n\nOriginal words.\n\nAfter.',
    thread: null,
    version: null,
    lastMaiaTurn: null,
    appliedVersionId: null,
    busy: false,
    message: null,
    undoMessage: null,
    sessionPosture: { resolved: true, sanctuary: false },
    onChooseSessionPosture: jest.fn(),
    onSelectVersion: jest.fn(),
    onSend,
    onSaveMember: jest.fn(async () => true),
    onApply: jest.fn(),
    onUndo: jest.fn(),
    onKeep: jest.fn(),
    onDepth,
  } as any)));

  const button = (text: string) =>
    Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.includes(text))!;

  act(() => button('Show me examples').click());
  expect(onDepth).toHaveBeenCalledWith('learning');
  expect(onSend.mock.calls.at(-1)?.[0]).toContain('clearly labeled illustrative examples');
  expect(onSend.mock.calls.at(-1)?.[0]).toContain('examples, not recommendations');
  expect(onSend.mock.calls.at(-1)?.[1]).toEqual({ proposalPolicy: 'reply_only' });

  act(() => button('Give me ideas').click());
  expect(onSend.mock.calls.at(-1)?.[0]).toContain('several ideas for where this exact passage could go');
  expect(onSend.mock.calls.at(-1)?.[0]).toContain('distinct creative directions');
  expect(onSend.mock.calls.at(-1)?.[0]).toContain('Do not rank them');
  expect(onSend.mock.calls.at(-1)?.[1]).toEqual({ proposalPolicy: 'reply_only' });

  act(() => button('Discuss what’s happening').click());
  expect(onSend.mock.calls.at(-1)?.[1]).toEqual({ proposalPolicy: 'reply_only' });

  act(() => button('Teach me about the writing').click());
  expect(onSend.mock.calls.at(-1)?.[1]).toEqual({ proposalPolicy: 'reply_only' });

  act(() => button('Go deeper').click());
  expect(onSend.mock.calls.at(-1)?.[1]).toEqual({ proposalPolicy: 'reply_only' });

  act(() => button('Show edit options').click());
  expect(onSend.mock.calls.at(-1)?.[1]).toEqual({ proposalPolicy: 'allow', proposalRequested: true });
});


test('empty editorial room requires an explicit live privacy posture before MAIA can act', () => {
  const onChooseSessionPosture = jest.fn();
  act(() => root.render(React.createElement(EditorialDancePanel, {
    manuscriptTitle: 'Threshold',
    currentText: 'Original words.',
    sectionBody: 'Before.\n\nOriginal words.\n\nAfter.',
    thread: null,
    version: null,
    lastMaiaTurn: null,
    appliedVersionId: null,
    busy: false,
    message: null,
    undoMessage: null,
    sessionPosture: { resolved: false, reason: 'no_live_settings' },
    onChooseSessionPosture,
    onSelectVersion: jest.fn(),
    onSend: jest.fn(),
    onSaveMember: jest.fn(async () => true),
    onApply: jest.fn(),
    onUndo: jest.fn(),
    onKeep: jest.fn(),
    onDepth: jest.fn(),
  } as any)));

  expect(container.textContent).toContain('Choose how this session should hold the exchange.');
  const examples = Array.from(container.querySelectorAll('button'))
    .find((button) => button.textContent?.includes('Show me examples')) as HTMLButtonElement;
  expect(examples.disabled).toBe(true);

  const ordinary = Array.from(container.querySelectorAll('button'))
    .find((button) => button.textContent === 'Ordinary')!;
  const sanctuary = Array.from(container.querySelectorAll('button'))
    .find((button) => button.textContent === 'Sanctuary')!;
  act(() => ordinary.click());
  act(() => sanctuary.click());
  expect(onChooseSessionPosture).toHaveBeenNthCalledWith(1, false);
  expect(onChooseSessionPosture).toHaveBeenNthCalledWith(2, true);
});

test('a MAIA response without a proposal stays visible and keeps exploration actionable', () => {
  const onSend = jest.fn();
  const responseOnlyThread = {
    threadId: 't-response',
    chainId: 'c-response',
    targetSectionId: 's1',
    sectionLabel: 'Threshold',
    locusText: 'Original words.',
    legacyLocus: false,
    turns: [
      { turnIndex: 0, speaker: 'author' as const, body: 'Help me understand this passage.', at: '2026-09-28T10:00:00Z' },
      { turnIndex: 1, speaker: 'maia' as const, body: 'The passage turns from explanation toward image. I would stay with that movement before deciding whether anything needs changing.', at: '2026-09-28T10:00:01Z' },
    ],
    versions: [],
    headVersionId: null,
    application: null,
  };

  act(() => root.render(React.createElement(EditorialDancePanel, {
    manuscriptTitle: 'Threshold',
    currentText: 'Original words.',
    sectionBody: 'Before.\n\nOriginal words.\n\nAfter.',
    thread: responseOnlyThread,
    version: null,
    lastMaiaTurn: responseOnlyThread.turns[1],
    appliedVersionId: null,
    busy: false,
    message: null,
    undoMessage: null,
    sessionPosture: { resolved: true, sanctuary: false },
    onChooseSessionPosture: jest.fn(),
    onSelectVersion: jest.fn(),
    onSend,
    onSaveMember: jest.fn(async () => true),
    onApply: jest.fn(),
    onUndo: jest.fn(),
    onKeep: jest.fn(),
    onDepth: jest.fn(),
  } as any)));

  expect(container.querySelector('.p4r1-dance-response')?.textContent)
    .toContain('The passage turns from explanation toward image.');
  expect(container.textContent).toContain('Continue from here');
  expect(container.textContent).toContain('Show examples');
  expect(container.textContent).toContain('Give me ideas');
  expect(container.textContent).toContain('Show revision options');
  expect(container.querySelector('.p4r1-dance-start-actions')).toBeNull();
  expect(container.textContent).not.toContain('Apply my version');

  const followup = (text: string) =>
    Array.from(container.querySelectorAll('button')).find((button) => button.textContent === text)!;

  act(() => followup('Show examples').click());
  expect(onSend.mock.calls.at(-1)?.[1]).toEqual({ proposalPolicy: 'reply_only' });

  act(() => followup('Give me ideas').click());
  expect(onSend.mock.calls.at(-1)?.[1]).toEqual({ proposalPolicy: 'reply_only' });

  act(() => followup('Teach me more').click());
  expect(onSend.mock.calls.at(-1)?.[1]).toEqual({ proposalPolicy: 'reply_only' });

  act(() => followup('Go deeper').click());
  expect(onSend.mock.calls.at(-1)?.[1]).toEqual({ proposalPolicy: 'reply_only' });

  act(() => followup('Show revision options').click());
  expect(onSend.mock.calls.at(-1)?.[1]).toEqual({ proposalPolicy: 'allow', proposalRequested: true });
});
