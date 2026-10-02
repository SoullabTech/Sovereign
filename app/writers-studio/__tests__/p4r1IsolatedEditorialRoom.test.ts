/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import IsolatedEditorialRoom from '@/app/dev/writers-studio-pc3-live/IsolatedEditorialRoom';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function renderRoom(overrides: Partial<React.ComponentProps<typeof IsolatedEditorialRoom>> = {}) {
  act(() => root.render(
    React.createElement(
      IsolatedEditorialRoom,
      {
        appearance: 'night',
        title: 'Threshold',
        currentText: 'Selected passage.',
        sectionBody: 'Before.\n\nSelected passage.\n\nAfter.',
        busy: false,
        editingLatitude: 1,
        onEditingLatitude: jest.fn(),
        mayRemoveParagraphs: false,
        onMayRemoveParagraphs: jest.fn(),
        mayProposeImmediately: false,
        onMayProposeImmediately: jest.fn(),
        onClose: jest.fn(),
        ...overrides,
      },
      React.createElement(
        'div',
        { className: 'p4r1-dance' },
        React.createElement('div', { className: 'p4r1-dance-options' }, 'Directions'),
        React.createElement('div', { className: 'p4r1-dance-working' }, 'Working'),
        React.createElement('div', { className: 'p4r1-dance-depth' }, 'Depth'),
      ),
    ),
  ));
}

test('layout presets, tools, preferences and reset all change only isolated presentation state', () => {
  renderRoom();
  const room = container.querySelector('[data-isolated-editorial]') as HTMLElement;
  expect(room.dataset.layout).toBe('balanced');
  expect(room.dataset.readingSize).toBe('large');
  expect(room.dataset.lineSpacing).toBe('open');
  expect(room.dataset.showDirections).toBe('true');
  expect(room.dataset.showWorking).toBe('true');
  expect(room.dataset.showDepth).toBe('true');
  expect(container.textContent).toContain('Revision · Touch');
  expect(container.textContent).toContain('Revision latitude');

  const button = (text: string) =>
    Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.trim().startsWith(text))!;

  act(() => button('Passage wide').click());
  expect(room.dataset.layout).toBe('passage');

  act(() => button('MAIA wide').click());
  expect(room.dataset.layout).toBe('maia');

  act(() => button('Stacked').click());
  expect(room.dataset.layout).toBe('stacked');

  const checkboxes = Array.from(container.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];
  act(() => {
    checkboxes[0].click();
    checkboxes[1].click();
    checkboxes[2].click();
  });
  expect(room.dataset.showDirections).toBe('false');
  expect(room.dataset.showWorking).toBe('false');
  expect(room.dataset.showDepth).toBe('false');

  const largest = Array.from(container.querySelectorAll('input[type="radio"]'))
    .find((input) => (input as HTMLInputElement).value === 'largest') as HTMLInputElement;
  act(() => largest.click());
  expect(room.dataset.readingSize).toBe('largest');

  const moreOpen = Array.from(container.querySelectorAll('label'))
    .find((label) => label.textContent?.trim() === 'More open')
    ?.querySelector('input') as HTMLInputElement;
  act(() => moreOpen.click());
  expect(room.dataset.lineSpacing).toBe('more-open');

  act(() => button('Reset view').click());
  expect(room.dataset.layout).toBe('balanced');
  expect(room.dataset.readingSize).toBe('large');
  expect(room.dataset.lineSpacing).toBe('open');
  expect(room.dataset.showDirections).toBe('true');
  expect(room.dataset.showWorking).toBe('true');
  expect(room.dataset.showDepth).toBe('true');
});

test('double-clicking the divider returns the custom split to balanced', () => {
  renderRoom();
  const room = container.querySelector('[data-isolated-editorial]') as HTMLElement;
  const divider = container.querySelector('.p4r1-isolated-divider') as HTMLButtonElement;

  act(() => divider.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })));
  expect(room.dataset.layout).toBe('balanced');
});


test('focus layout and presentation choices survive reopening during the same browser session', () => {
  renderRoom();

  const button = (text: string) =>
    Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.trim().startsWith(text))!;

  act(() => button('Passage wide').click());

  const largest = Array.from(container.querySelectorAll('input[type="radio"]'))
    .find((input) => (input as HTMLInputElement).value === 'largest') as HTMLInputElement;
  act(() => largest.click());

  const depthToggle = Array.from(container.querySelectorAll('label'))
    .find((label) => label.textContent?.includes('Craft depth'))
    ?.querySelector('input') as HTMLInputElement;
  act(() => depthToggle.click());

  expect(window.sessionStorage.getItem('writers-studio:p4r1:focus-view')).toContain('"layout":"passage"');
  expect(window.sessionStorage.getItem('writers-studio:p4r1:focus-view')).toContain('"readingSize":"largest"');
  expect(window.sessionStorage.getItem('writers-studio:p4r1:focus-view')).toContain('"showCraftDepth":false');

  act(() => root.unmount());
  root = createRoot(container);
  renderRoom();

  const room = container.querySelector('[data-isolated-editorial]') as HTMLElement;
  expect(room.dataset.layout).toBe('passage');
  expect(room.dataset.readingSize).toBe('largest');
  expect(room.dataset.showDepth).toBe('false');
});


test('Preferences exposes the author-set revision latitude and paragraph permission', () => {
  const onEditingLatitude = jest.fn();
  const onMayRemoveParagraphs = jest.fn();
  renderRoom({ onEditingLatitude, onMayRemoveParagraphs });

  const slider = container.querySelector('#p4r1-editing-latitude') as HTMLInputElement;
  expect(slider).toBeTruthy();
  expect(slider.value).toBe('1');
  expect(slider.getAttribute('aria-valuetext')).toBe('Touch');

  expect(slider.min).toBe('1');
  expect(slider.max).toBe('5');

  const paragraph = Array.from(container.querySelectorAll('label'))
    .find((label) => label.textContent?.includes('Allow paragraph-removal proposals'))
    ?.querySelector('input') as HTMLInputElement;
  act(() => paragraph.click());
  expect(onMayRemoveParagraphs).toHaveBeenCalledWith(true);
});


test('Working style exposes pace and explanation sliders with a live plain-language preview', () => {
  renderRoom();
  const room = container.querySelector('[data-isolated-editorial]') as HTMLElement;
  const pace = container.querySelector('#p4r1-working-pace') as HTMLInputElement;
  const explanation = container.querySelector('#p4r1-explanation-depth') as HTMLInputElement;

  expect(room.dataset.workingPace).toBe('intimate');
  expect(room.dataset.explanationDepth).toBe('guided');
  expect(container.textContent).toContain('How much MAIA shows at once');
  expect(container.textContent).toContain('How MAIA explains what she sees');
  expect(container.textContent).toContain('MAIA would say');

  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(explanation, '0');
    explanation.dispatchEvent(new Event('input', { bubbles: true }));
    explanation.dispatchEvent(new Event('change', { bubbles: true }));
  });
  expect(room.dataset.explanationDepth).toBe('plain');
  expect(container.textContent).toContain('Use everyday language and concrete examples.');

  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(pace, '2');
    pace.dispatchEvent(new Event('input', { bubbles: true }));
    pace.dispatchEvent(new Event('change', { bubbles: true }));
  });
  expect(room.dataset.workingPace).toBe('mapped');
  expect(window.localStorage.getItem('writers-studio:working-style:v1')).toContain('"pace":"mapped"');
});
