// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/app/dev/writers-studio-pc3-live/P4R1VoiceCapture', () => ({ default: () => null }));
import EditorialDancePanel, { type EditorialDancePanelProps } from '@/app/dev/writers-studio-pc3-live/EditorialDancePanel';
import type { RebuildEditorialVersion } from '@/lib/writersStudio/rebuild/editorialCollaboration';

const original = 'Mara set the cup down. She were listening for the bird.';
const revised = original.replace('She were', 'She was');
const member: RebuildEditorialVersion = { id: 'member-version-1', author: 'member', wording: revised, supersedes: null, rationale: 'Editorial purpose: Grammar. Preserve all other wording.' };
const maia: RebuildEditorialVersion = { ...member, id: 'fixture-maia-version', author: 'maia' };
let host: HTMLDivElement; let root: Root; let props: EditorialDancePanelProps;
beforeEach(() => {
  Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { configurable: true, value: true });
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
  props = {
    manuscriptTitle: 'Fictional passage', currentText: original, sectionBody: original,
    thread: { threadId: 'owned-thread', chainId: 'owned-chain', locusText: original, targetSectionId: 'owned-section', sectionLabel: 'Fictional passage', legacyLocus: false, turns: [], versions: [member], headVersionId: member.id },
    version: member, lastMaiaTurn: null, appliedVersionId: null, busy: false, message: null, undoMessage: null,
    sessionPosture: { resolved: true, sanctuary: false }, onChooseSessionPosture: vi.fn(),
    onSelectVersion: vi.fn(), onSend: vi.fn(), onSaveMember: vi.fn(async () => true), onApply: vi.fn(), onUndo: vi.fn(), onKeep: vi.fn(), onDepth: vi.fn(),
  };
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.restoreAllMocks(); });
const render = async () => { await act(async () => root.render(createElement(EditorialDancePanel, props))); };
const button = (text: string) => [...host.querySelectorAll('button')].find(el => el.textContent?.trim() === text);
const click = (text: string) => { const el = button(text); expect(el, text).toBeTruthy(); act(() => el!.click()); };
const editor = () => host.querySelector<HTMLTextAreaElement>('[aria-label="Edit your working version"]');

describe('Saved member versions remain usable without model success', () => {
  it('shows exact saved member wording and requires review before Apply', async () => {
    await render(); expect(editor()?.value).toBe(revised);
    expect(button('Apply my version')?.disabled).toBe(true);
    click('Read my version in context'); expect(button('Apply my version')?.disabled).toBe(false);
    click('Apply my version'); expect(props.onApply).toHaveBeenCalledTimes(1);
    expect(props.onSend).not.toHaveBeenCalled(); expect(props.onSaveMember).not.toHaveBeenCalled();
  });
  it('offers every saved member alternative with explicit author attribution', async () => {
    const other = { ...member, id: 'member-version-2', rationale: 'Editorial purpose: Another wording.' };
    props.thread = { ...props.thread!, versions: [member, other], headVersionId: other.id };
    props.version = other; await render();
    const choices = host.querySelectorAll('[data-member-version]'); expect(choices.length).toBe(2);
    for (const el of choices) expect(el.textContent).toContain('Your saved version');
    click('Read my version in context'); expect(button('Apply my version')?.disabled).toBe(false);
  });
  it('does not attribute a member-only alternative or fallback response to MAIA', async () => {
    await render(); expect(host.textContent).not.toContain('MAIA’s recommendation');
    expect(host.textContent).not.toContain('MAIA offered a direction');
    expect(host.textContent).not.toContain('Here is one direction I would try');
    expect(host.textContent).toContain('Your saved wording');
  });
  it('keeps member controls available while showing a provider error', async () => {
    props.message = 'MAIA could not complete that turn. Your saved writing is still available.';
    await render(); expect(editor()?.value).toBe(revised); expect(host.textContent).toContain(props.message);
    expect(props.onSend).not.toHaveBeenCalled();
  });
  it('preserves exact version identity even when two alternatives have identical wording', async () => {
    const later = { ...member, id: 'later-member-version', supersedes: member.id };
    props.thread = { ...props.thread!, versions: [member, later], headVersionId: later.id }; props.version = later;
    await render(); click('Read my version in context'); expect(button('Apply my version')?.disabled).toBe(false);
  });
  it('does not choose a version on mount when none was selected', async () => {
    props.version = null; await render(); expect(host.querySelectorAll('[data-member-version]').length).toBe(1);
    expect(props.onSelectVersion).not.toHaveBeenCalled(); expect(button('Apply my version')?.disabled).toBe(true);
    act(() => host.querySelector<HTMLButtonElement>('[data-member-version]')!.click());
    expect(props.onSelectVersion).toHaveBeenCalledWith(member.id);
  });
  it('shows an honest empty-response state rather than a fabricated MAIA utterance', async () => {
    props.thread = { ...props.thread!, versions: [], headVersionId: null, turns: [{ turnIndex: 0, speaker: 'author', body: 'Please look at this.', at: '2026-10-14T00:00:00Z' }] };
    props.version = null; await render();
    expect(host.textContent).toContain('No MAIA response is recorded');
    expect(host.textContent).not.toContain('Here’s what I’m seeing.');
    expect(host.textContent).not.toContain('I’m staying with the passage');
    expect(props.onSend).not.toHaveBeenCalled();
  });
  it('retains the existing attributed MAIA proposal path without auto-application', async () => {
    props.thread = { ...props.thread!, versions: [maia], headVersionId: maia.id }; props.version = maia;
    await render(); expect(editor()?.value).toBe(revised); expect(host.textContent).toContain('MAIA’s recommendation');
    click('Read my version in context'); expect(button('Apply my version')?.disabled).toBe(true);
    expect(props.onApply).not.toHaveBeenCalled(); expect(props.onSend).not.toHaveBeenCalled();
  });
  it('shows durable Undo for an already applied member version after reopening', async () => {
    props.appliedVersionId = member.id; await render(); expect(button('Undo this change')).toBeTruthy();
    click('Undo this change'); expect(props.onUndo).toHaveBeenCalledTimes(1);
  });
});
