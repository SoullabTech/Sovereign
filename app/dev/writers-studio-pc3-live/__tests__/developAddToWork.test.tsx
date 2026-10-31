/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DevelopAddToWork } from '../DevelopAddToWork';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const works = [{ id: 'w1', title: 'Elemental Alchemy' }, { id: 'w2', title: null }] as any;
let root: Root, container: HTMLDivElement;
const props = { works, busy: false, error: null as string | null, onAddToWork: jest.fn(), onMakeWork: jest.fn() };
const render = (p = props) => act(() => root.render(React.createElement(DevelopAddToWork, p)));
const btn = (name: string) => Array.from(container.querySelectorAll('button')).find(b => b.textContent === name) as HTMLButtonElement;
const type = (value: string) => act(() => {
  const input = container.querySelector('input') as HTMLInputElement;
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
});
beforeEach(() => { props.onAddToWork.mockReset(); props.onMakeWork.mockReset(); container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
afterEach(() => { act(() => root.unmount()); container.remove(); });

describe('Develop: add this writing to a Work', () => {
  it('says plainly what is missing and what will not happen', () => {
    render();
    expect(container.textContent).toContain('This writing isn’t part of a Work yet.');
    expect(container.textContent).toContain('Nothing is read or changed.');
  });
  it('offers Make this a Work, and Add to a Work only when the author has Works', () => {
    render(); expect(btn('Make this a Work')).toBeTruthy(); expect(btn('Add to a Work')).toBeTruthy();
    render({ ...props, works: [] }); expect(btn('Add to a Work')).toBeUndefined();
  });
  it('Add to a Work lists the author’s Works and declares the one chosen (an untitled Work stays untitled)', () => {
    render(); act(() => btn('Add to a Work').click());
    const items = Array.from(container.querySelectorAll('ul button')).map(b => b.textContent);
    expect(items).toEqual(['Elemental Alchemy', 'Untitled Work']);
    act(() => (container.querySelectorAll('ul button')[0] as HTMLButtonElement).click());
    expect(props.onAddToWork).toHaveBeenCalledWith('w1');
  });
  it('Make this a Work needs a name the author types; nothing is invented', () => {
    render(); act(() => btn('Make this a Work').click());
    const submit = () => container.querySelector('form button[type="submit"]') as HTMLButtonElement;
    expect(submit().disabled).toBe(true);
    act(() => { (container.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
    expect(props.onMakeWork).not.toHaveBeenCalled();
    type('  Elemental Alchemy  ');
    expect(submit().disabled).toBe(false);
    act(() => { (container.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
    expect(props.onMakeWork).toHaveBeenCalledWith('Elemental Alchemy');
  });
  it('is inert while a declaration is in flight, and shows a failure without claiming success', () => {
    render({ ...props, busy: true, error: 'We couldn’t add this writing to that Work. Nothing was changed. Please try again.' });
    expect(btn('Make this a Work').disabled).toBe(true);
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('Nothing was changed');
  });
});

describe('wiring', () => {
  const root = join(__dirname, '..');
  const view = readFileSync(join(root, 'P4R1DevelopView.tsx'), 'utf8');
  const controller = readFileSync(join(root, 'P4R1DevelopController.tsx'), 'utf8');
  it('the panel replaces the dead-end message ONLY when no Work declares the writing', () => {
    expect(view).toMatch(/!props\.work && props\.workContextKind === 'none' \? \(\s*<DevelopAddToWork/);
    expect(view).toContain('could not be confirmed'); // unknown/ambiguous keep their honest message
  });
  it('declares through the existing expressions route as the manuscript, then re-reads the Works', () => {
    expect(controller).toContain("'/api/sovereign/living-works/' + workId + '/expressions'");
    expect(controller).toContain("expressionType: 'manuscript'");
    expect(controller).toMatch(/await declareManuscript\(workId\);\s*await reloadWorks\(\);/);
  });
});
