/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import ThemeMenu from '../../dev/writers-studio-p4r1/P4R1ThemeMenu';

const mockChoose = jest.fn();
jest.mock('@/app/writers-studio/atmosphere/StudioAtmosphere', () => ({
  useAtmosphere: () => ({ id: 'atelier', choose: mockChoose }),
}));
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let container: HTMLDivElement;
let mount: HTMLDivElement;
let root: Root;
const menu = () => container.querySelector<HTMLElement>('[data-p4r1-theme-menu]')!;
const slot = () => {
  const node = document.createElement('div');
  node.setAttribute('data-studio-topbar-accessories', '');
  container.prepend(node);
  return node;
};
const settle = async () => { await act(async () => { await Promise.resolve(); }); };
beforeEach(async () => {
  mockChoose.mockReset();
  container = document.createElement('div');
  container.className = 'p4r1-root';
  mount = document.createElement('div');
  container.append(mount);
  document.body.append(container);
  root = createRoot(mount);
  await act(async () => root.render(React.createElement(ThemeMenu)));
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});
test('preserves the existing loading/error fallback when there is no toolbar', () => {
  expect(menu()).not.toBeNull();
  expect(menu().closest('[data-studio-topbar-accessories]')).toBeNull();
  expect(menu().dataset.themeInTopbar).toBeUndefined();
  expect(menu().style.position).toBe('');
});
test('moves into the live toolbar without a fixed-position overlay or duplicate', async () => {
  let host!: HTMLDivElement;
  await act(async () => { host = slot(); });
  await settle();
  expect(host.contains(menu())).toBe(true);
  expect(menu().style.position).toBe('relative');
  // JSDOM drops positional 'auto'; physical Safari verifies the hit geometry.
  expect(menu().dataset.themeInTopbar).toBe('true');
  expect(container.querySelectorAll('[data-p4r1-theme-menu]')).toHaveLength(1);
});
test('follows a replaced room toolbar instead of staying on a detached host', async () => {
  let first!: HTMLDivElement;
  await act(async () => { first = slot(); });
  await settle();
  let second!: HTMLDivElement;
  await act(async () => { first.remove(); second = slot(); });
  await settle();
  expect(first.querySelector('[data-p4r1-theme-menu]')).toBeNull();
  expect(second.contains(menu())).toBe(true);
  await act(async () => { second.remove(); });
  await settle();
  expect(mount.contains(menu())).toBe(true);
  expect(menu().style.position).toBe('');
});
test('retains all theme choices and deliberate selection in the toolbar', async () => {
  await act(async () => { slot(); });
  await settle();
  await act(async () => menu().querySelector<HTMLButtonElement>('.p4r1-theme-trigger')!.click());
  const choices = Array.from(menu().querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'));
  expect(choices).toHaveLength(7);
  expect(mockChoose).not.toHaveBeenCalled();
  const day = choices.find(button => button.textContent?.trim() === 'Day')!;
  await act(async () => day.click());
  expect(mockChoose).toHaveBeenCalledWith('day');
  expect(menu().querySelector('[role="menu"]')).toBeNull();
});
