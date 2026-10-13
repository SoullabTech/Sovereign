/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import SaveDeviceCopy from '../../dev/writers-studio-pc3-live/SaveDeviceCopy';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let node: HTMLDivElement;
let topbar: HTMLDivElement;
let blob: Blob | undefined;
const latestBody = jest.fn((id: string) => id === 's1' ? 'A new stanza\nA second breath' : 'Other section');
const sample = [
  { draftSectionId: 's1', sourceSectionId: 'a', position: 1, heading: 'Poem One', headingDepth: 1,
    headingSignal: 'markdown', headingPrefix: 'Poem One\n\n', body: 'Old server text', editable: true },
  { draftSectionId: 's2', sourceSectionId: 'b', position: 2, heading: 'Poem Two', headingDepth: 1,
    headingSignal: 'markdown', headingPrefix: 'Poem Two\n\n', body: 'Other section', editable: true },
];
const props = {
  manuscriptId: 'my-manuscript', title: 'My Poems', workTitle: 'The Book',
  version: 6, sections: sample, latestBody, hasUnsavedWork: () => true,
};
const button = (s: string) => {
  const found = Array.from(topbar.querySelectorAll('button')).find(x => x.textContent?.includes(s));
  if (!found) throw new Error('Missing button ' + s);
  return found;
};
beforeEach(async () => {
  jest.clearAllMocks();
  blob = undefined;
  (URL as any).createObjectURL = jest.fn((source: Blob) => { blob = source; return 'blob:test-device-copy'; });
  (URL as any).revokeObjectURL = jest.fn();
  jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  node = document.createElement('div');
  node.className = 'p4r1-root';
  topbar = document.createElement('div');
  topbar.setAttribute('data-studio-topbar-accessories', '');
  node.append(topbar);
  document.body.append(node);
  root = createRoot(node);
  // The topbar host is a child of the same React root in production; in this
  // fixture it stays a stable, external shell slot for the portal.
  await act(async () => {
    root.render(React.createElement(React.Fragment, null,
      React.createElement('div', { 'data-studio-topbar-accessories': true }),
      React.createElement(SaveDeviceCopy, props),
    ));
  });
  topbar = node.querySelector('[data-studio-topbar-accessories]')!;
});
afterEach(async () => {
  await act(async () => root.unmount());
  node.remove();
  jest.restoreAllMocks();
});
test('Save a copy is visible, optional, and never auto-downloads', async () => {
  expect(button('Save a copy')).toBeDefined();
  expect(URL.createObjectURL).not.toHaveBeenCalled();
  await act(async () => button('Save a copy').click());
  expect(topbar.textContent).toContain('Plain text');
  expect(topbar.textContent).toContain('Markdown');
  expect(topbar.textContent).toContain('Section archive');
  expect(topbar.textContent).toContain('Studio re-import not certified');
});
test('an explicit browser download uses the latest in-tab manuscript without any network request', async () => {
  const previousFetch = globalThis.fetch;
  const fetchSpy = jest.fn();
  (globalThis as any).fetch = fetchSpy;
  await act(async () => button('Save a copy').click());
  await act(async () => button('Plain text').click());
  expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  expect(blob?.size).toBeGreaterThan(10);
  expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
  expect(topbar.textContent).toContain('Verify it appears on your device');
  expect(topbar.textContent).toContain('Studio may still be saving');
  expect(fetchSpy).not.toHaveBeenCalled();
  (globalThis as any).fetch = previousFetch;
});
test('an archive download does not claim that reimport is supported', async () => {
  await act(async () => button('Save a copy').click());
  expect(topbar.textContent).toContain('Studio re-import not certified');
  await act(async () => button('Section archive').click());
  expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  expect(topbar.textContent).toContain('.json');
});
test('a failed browser download is never described as successfully saved', async () => {
  (URL.createObjectURL as jest.Mock).mockImplementationOnce(() => { throw Error('Browser refused download'); });
  await act(async () => button('Save a copy').click());
  await act(async () => button('Markdown').click());
  expect(topbar.textContent).toContain('Browser refused download');
  expect(topbar.textContent).not.toContain('Download requested');
  expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();
});
test('the menu follows the exact manuscript rather than carrying a prior one', async () => {
  await act(async () => button('Save a copy').click());
  expect(topbar.querySelector('.p4r1-device-copy-menu')).not.toBeNull();
  await act(async () => root.render(React.createElement(React.Fragment, null,
    React.createElement('div', { 'data-studio-topbar-accessories': true }),
    React.createElement(SaveDeviceCopy, { ...props, manuscriptId: 'another-work' }),
  )));
  expect(topbar.querySelector('.p4r1-device-copy-menu')).toBeNull();
});
