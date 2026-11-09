/**
 * "Keep mine" → writer-confirmed note. Real component; the decision client and the Sanctuary reader are fictional doubles.
 * Not a browser run.
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const settle = jest.fn(async (..._a: unknown[]) => ({ ok: true as const }));
let posture: { resolved: boolean; sanctuary?: boolean } = { resolved: true, sanctuary: false };
jest.mock('@/lib/writersStudio/decisionClient', () => ({ settleDecisionNote: (...a: unknown[]) => settle(...a) }));
jest.mock('@/lib/sanctuary/currentClientPosture', () => ({ readCurrentSanctuaryPosture: () => posture }));
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import KeepNotePrompt from '@/app/dev/writers-studio-pc3-live/KeepNotePrompt';

let host: HTMLDivElement; let root: Root; const done = jest.fn();
const mount = async () => { await act(async () => { root.render(React.createElement(KeepNotePrompt, { workId: 'W', sectionId: 'S', passageLabel: 'The Harbour', onDone: done })); }); };
const btn = (t: string) => [...document.body.querySelectorAll('button')].find((b) => b.textContent === t)!;
beforeEach(() => { host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host); settle.mockClear(); done.mockClear(); posture = { resolved: true, sanctuary: false }; });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

describe('Keep mine · writer-confirmed note', () => {
  it('shows nothing recorded until the writer confirms; the sentence is prefilled and theirs to change', async () => {
    await mount();
    expect(settle).not.toHaveBeenCalled();
    const ta = document.body.querySelector('textarea')!;
    expect(ta.value).toContain('The Harbour');
  });
  it('"Note it" records exactly the words in the box, as a passage-desk wording decision', async () => {
    await mount();
    const ta = document.body.querySelector('textarea')! as HTMLTextAreaElement;
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!;
    await act(async () => { setter.call(ta, 'I am keeping this line as it is.'); ta.dispatchEvent(new Event('input', { bubbles: true })); });
    await act(async () => { btn('Note it').click(); });
    // The posture is no longer passed as a hard-coded `false`; the client declares the member's real posture (founder ruling 2026-11-09).
    expect(settle).toHaveBeenCalledWith('W', 'I am keeping this line as it is.', { room: 'passage_desk', subjectKind: 'wording', subjectRef: 'S' });
    expect(done).toHaveBeenCalled();
  });
  it('"No thanks" records nothing', async () => {
    await mount();
    await act(async () => { btn('No thanks').click(); });
    expect(settle).not.toHaveBeenCalled(); expect(done).toHaveBeenCalled();
  });
  it('Sanctuary on records nothing and says so', async () => {
    posture = { resolved: true, sanctuary: true };
    await mount();
    await act(async () => { btn('Note it').click(); });
    expect(settle).not.toHaveBeenCalled(); expect(done).not.toHaveBeenCalled();
    expect(document.body.querySelector('[data-keep-note-refusal]')?.textContent).toContain('Sanctuary is on');
  });
  it('an unreadable setting records nothing and says so', async () => {
    posture = { resolved: false };
    await mount();
    await act(async () => { btn('Note it').click(); });
    expect(settle).not.toHaveBeenCalled();
    expect(document.body.querySelector('[data-keep-note-refusal]')?.textContent).toContain('could not be read');
  });
  it('an empty sentence cannot be noted', async () => {
    await mount();
    const ta = document.body.querySelector('textarea')! as HTMLTextAreaElement;
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!;
    await act(async () => { setter.call(ta, '   '); ta.dispatchEvent(new Event('input', { bubbles: true })); });
    expect((btn('Note it') as HTMLButtonElement).disabled).toBe(true);
  });
});
