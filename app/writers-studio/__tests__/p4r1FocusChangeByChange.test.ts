/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Table, { type CraftsmansTableR1Props } from '@/app/dev/writers-studio-pc3-live/CraftsmansTableR1';
import EditorialDancePanel from '@/app/dev/writers-studio-pc3-live/EditorialDancePanel';

/** Conversation-first step 5: Craftsman's Table's change-by-change mode inside Passage Focus. */

const before = 'Fire begins as a possibility that invites us into life.';
const original = 'Others deepen as we become increasingly aware of what brings coherence and vitality.';
const after = 'Actualization does not mean perfection.';
const body = `${before}\n\n${original}\n\n${after}`;
const proposal = original.replace('increasingly ', '');

let host: HTMLDivElement; let root: Root;
beforeEach(() => {
  (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
  HTMLElement.prototype.scrollIntoView = jest.fn();
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

function tableProps(extra: Partial<CraftsmansTableR1Props> = {}): CraftsmansTableR1Props {
  return {
    compact: true,
    sections: [{ draftSectionId: 'fire', sourceSectionId: null, position: 0, heading: 'Fire',
      headingDepth: 2, headingSignal: null, editable: true, body }],
    bodyOf: () => body,
    held: { draftSectionId: 'fire', start: before.length + 2, end: before.length + 2 + original.length, text: original, revisionNumber: 1 },
    thread: null,
    version: { id: 'proposal', author: 'maia', wording: proposal, supersedes: null, rationale: 'One optional deletion.' },
    busy: false, appliedVersionId: null,
    onSend: jest.fn(), onSaveMember: jest.fn(async () => true), onApply: jest.fn(),
    ...extra,
  } as CraftsmansTableR1Props;
}
const labels = () => [...host.querySelectorAll('button')].map((b) => b.textContent?.trim());
async function click(label: string) {
  const b = [...host.querySelectorAll('button')].find((x) => x.textContent?.trim() === label);
  if (!b) throw new Error('Missing button: ' + label);
  await act(async () => b.click());
}

describe('compact mode', () => {
  it('keeps the safeguard line and Write here; hides the view toggles, notation, Suggest/Discuss and Compose', async () => {
    await act(async () => root.render(React.createElement(Table, tableProps())));
    expect(host.textContent).toContain('Red strikeouts and blue inserts: proposed edits. Apply remains your choice.');
    expect(labels()).toContain('Write here');
    for (const gone of ['Markup', 'Preview', 'Guided', 'Professional', 'Suggest an edit', 'Discuss']) expect(labels()).not.toContain(gone);
    expect(host.querySelector<HTMLDetailsElement>('.p4r1-craft-r1-compose-menu')?.hidden ?? true).toBe(true);
    expect(host.textContent).not.toContain("Write · Craftsman's Table");
  });

  it('the full room is unchanged when not compact', async () => {
    await act(async () => root.render(React.createElement(Table, tableProps({ compact: false }))));
    expect(labels()).toEqual(expect.arrayContaining(['Markup', 'Preview', 'Suggest an edit', 'Discuss']));
  });
});

describe('per-change asks store only the writer’s words (server-owned instruction)', () => {
  it('Why? and Another way on one change send the change act with the change named', async () => {
    const p = tableProps();
    await act(async () => root.render(React.createElement(Table, p)));
    await act(async () => host.querySelector<HTMLElement>('.p4r1-craft-r1-locus del[data-edit-id]')!.click());
    await click('Why?');
    const [whyText, whyOpts] = (p.onSend as jest.Mock).mock.calls.at(-1)!;
    expect(whyText).toMatch(/^Why the deletion "increasingly"\?$/);
    expect(whyOpts).toMatchObject({ proposalPolicy: 'reply_only', passageAct: 'change-why' });
    await click('Another way');
    const [anotherText, anotherOpts] = (p.onSend as jest.Mock).mock.calls.at(-1)!;
    expect(anotherText).toBe('Show me another way to handle the deletion "increasingly".');
    expect(anotherOpts).toMatchObject({ proposalPolicy: 'allow', proposalRequested: true, passageAct: 'change-another' });
    for (const [text] of (p.onSend as jest.Mock).mock.calls) expect(text).not.toMatch(/Stay inside this exact local edit|Make the strongest case/);
  });
});

describe('Adjust in the option card opens the change-by-change mode', () => {
  const maiaVersion = { id: 'v1', author: 'maia' as const, wording: 'A cleaner turn.', supersedes: null, rationale: 'Editorial purpose: Clearer turn' };
  const thread = { threadId: 't1', chainId: 'c1', locusText: 'Original words.', targetSectionId: 's1', sectionLabel: null, legacyLocus: false,
    turns: [{ turnIndex: 0, speaker: 'maia', body: 'Editorial purpose: Clearer turn', at: 't' }], versions: [maiaVersion], headVersionId: 'v1' };
  function renderPanel(deeper?: React.ReactNode) {
    act(() => root.render(React.createElement(EditorialDancePanel, {
      manuscriptTitle: 'Threshold', currentText: 'Original words.', sectionBody: 'Original words.',
      thread, version: maiaVersion, lastMaiaTurn: thread.turns[0], appliedVersionId: null, busy: false, message: null, undoMessage: null,
      sessionPosture: { resolved: true, sanctuary: false }, onChooseSessionPosture: jest.fn(), onSelectVersion: jest.fn(),
      onSend: jest.fn(), onSaveMember: jest.fn(async () => true), onApply: jest.fn(), onUndo: jest.fn(), onKeep: jest.fn(), onDepth: jest.fn(),
      onUseVersion: jest.fn(async () => true), deeper,
    } as any)));
  }
  it('opens and closes the deeper mode inside the card', () => {
    renderPanel(React.createElement('div', { 'data-test-deeper': true }, 'marks here'));
    const adjust = host.querySelector<HTMLButtonElement>('[data-option-adjust]')!;
    expect(host.querySelector('[data-option-deeper]')).toBeNull();
    act(() => adjust.click());
    const deeper = host.querySelector('[data-option-card] [data-option-deeper]')!;
    expect(deeper.querySelector('[data-test-deeper]')).not.toBeNull();
    expect(adjust.getAttribute('aria-expanded')).toBe('true');
    act(() => adjust.click());
    expect(host.querySelector('[data-option-deeper]')).toBeNull();
  });
  it('without a deeper mode, Adjust still opens the writer’s working version under More', () => {
    renderPanel(undefined);
    act(() => host.querySelector<HTMLButtonElement>('[data-option-adjust]')!.click());
    expect(host.querySelector<HTMLDetailsElement>('[data-option-more]')!.open).toBe(true);
  });
});
