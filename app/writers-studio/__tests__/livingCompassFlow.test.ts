/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import WorkInspiration from '../insight/WorkInspiration';
import { apiFetch } from '@/lib/http/apiBase';
import { useLivingWorks } from '../useLivingWorks';

jest.mock('../insight/GoldLine', () => () => null);
jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));
jest.mock('../useLivingWorks', () => ({ useLivingWorks: jest.fn() }));
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const MID = 'test-manuscript';
const makeWork = (id: string, purpose: string | null = null) => ({
  id, title: 'The Test Work', purpose, form: 'Poetry', stage: null,
  manuscriptState: 'partial-manuscript', createdAt: '', updatedAt: '',
  materials: [], expressions: [{ expressionType: 'manuscript', expressionId: MID, declaredAt: '' }],
});
let root: Root;
let host: HTMLDivElement;
let activeWorks: ReturnType<typeof makeWork>[];
const reload = jest.fn(async () => {});
const onBringToQuestion = jest.fn();
const buttons = () => Array.from(host.querySelectorAll('button'));
const button = (name: string) => {
  const found = buttons().find(b => b.textContent?.trim() === name);
  if (!found) throw new Error('Missing button: ' + name);
  return found;
};
const field = (label: string) => {
  const found = Array.from(host.querySelectorAll('label')).find(l => l.textContent?.includes(label));
  if (!found?.querySelector('textarea')) throw new Error('Missing textarea: ' + label);
  return found.querySelector('textarea')!;
};
async function click(name: string) {
  await act(async () => { button(name).click(); });
}
async function type(label: string, value: string) {
  await act(async () => {
    const target = field(label);
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(target, value);
    target.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
beforeEach(async () => {
  activeWorks = [makeWork('work-1', 'Protect the writer’s existing words.')];
  (useLivingWorks as jest.Mock).mockImplementation(() => ({ phase: 'ready', works: activeWorks, reload }));
  (apiFetch as jest.Mock).mockResolvedValue({ ok: true, status: 200 });
  jest.clearAllMocks();
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => { root.render(React.createElement(WorkInspiration, { manuscriptId: MID, onBringToQuestion })); });
});
afterEach(async () => {
  await act(async () => { root.unmount(); });
  host.remove();
});
test('optional reflections preserve a prior statement and require explicit save', async () => {
  await click('Edit your statement');
  expect(field('Your Work statement').value).toBe('Protect the writer’s existing words.');
  await type('Fire · Vision', 'A vivid new world');
  await type('Water · Meaning', 'Grief, tenderness, return');
  await type('Aether · Deeper intention', 'Hope without certainty');
  expect(apiFetch).not.toHaveBeenCalled();
  await click('Add these reflections to my statement');
  const composed = field('Your Work statement').value;
  expect(composed).toContain('Protect the writer’s existing words.\n\nFire · Vision:\nA vivid new world');
  expect(composed).toContain('Water · Meaning:\nGrief, tenderness, return');
  expect(composed).toContain('Aether · Deeper intention:\nHope without certainty');
  expect(apiFetch).not.toHaveBeenCalled();
  await click('Save inspiration & intention');
  expect(apiFetch).toHaveBeenCalledTimes(1);
  const [url, options] = (apiFetch as jest.Mock).mock.calls[0];
  expect(url).toBe('/api/sovereign/living-works/work-1');
  expect(options.method).toBe('PATCH');
  expect(JSON.parse(options.body)).toEqual({ purpose: composed });
  expect(reload).toHaveBeenCalled();
});
test('a writer must explicitly bring a saved statement into MAIA', async () => {
  expect(onBringToQuestion).not.toHaveBeenCalled();
  await click('Bring this into my question');
  expect(onBringToQuestion).toHaveBeenCalledWith('Protect the writer’s existing words.');
  expect(apiFetch).not.toHaveBeenCalled();
});
test('an ambiguous Work relationship is never guessed or written into', async () => {
  activeWorks = [makeWork('work-1'), makeWork('work-2')];
  await act(async () => { root.render(React.createElement(WorkInspiration, { manuscriptId: MID, onBringToQuestion })); });
  expect(host.textContent).toContain('belongs to several Works');
  expect(buttons().some(b => b.textContent?.includes('Edit your statement'))).toBe(false);
  expect(apiFetch).not.toHaveBeenCalled();
});
test('a failed save keeps the authored draft and does not claim success', async () => {
  (apiFetch as jest.Mock).mockResolvedValue({ ok: false, status: 503 });
  await click('Edit your statement');
  await type('Your Work statement', 'Keep this unsaved meaning.');
  await click('Save inspiration & intention');
  expect(field('Your Work statement').value).toBe('Keep this unsaved meaning.');
  expect(host.textContent).toContain('could not be saved');
  expect(reload).not.toHaveBeenCalled();
});
test('too-long reflections cannot silently exceed the existing Work statement limit', async () => {
  await click('Edit your statement');
  await type('Fire · Vision', 'x'.repeat(700));
  await type('Water · Meaning', 'y'.repeat(700));
  await type('Earth · Mission, method, medicine', 'z'.repeat(700));
  expect(button('Add these reflections to my statement').disabled).toBe(true);
  expect(apiFetch).not.toHaveBeenCalled();
});

test('an unsaved draft cannot be submitted into a different Work after context changes', async () => {
  await click('Edit your statement');
  await type('Your Work statement', 'Belongs only to work one.');
  activeWorks = [makeWork('work-2', 'Another writer’s different intention.')];
  await act(async () => { root.render(React.createElement(WorkInspiration, { manuscriptId: MID, onBringToQuestion })); });
  await click('Save inspiration & intention');
  expect(apiFetch).not.toHaveBeenCalled();
  expect(host.textContent).toContain('different Work');
});
