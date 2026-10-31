/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
const mockApi = jest.fn();
jest.mock('@/lib/http/apiBase', () => ({ apiFetch: (...args: unknown[]) => mockApi(...args) }));
import P4R1CoverStudy from '@/app/dev/writers-studio-pc3-live/P4R1CoverStudy';
import P4R1InteriorProof from '@/app/dev/writers-studio-pc3-live/P4R1InteriorProof';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
beforeEach(() => {
  mockApi.mockReset(); host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); });
const coverProof = { title: 'Your writing', manuscriptTitle: null, sourceAuthority: 'working_draft', sourceRevision: '1' };
const currentDraft = { state: 'section_aware', manuscriptId: 'fiction-m', title: null, version: 1, sections: [
  { draftSectionId: 'fiction-s', position: 0, heading: null, body: 'Fictional prose stays intact.', editable: true },
]};
async function open(component: typeof P4R1CoverStudy | typeof P4R1InteriorProof, data: unknown, workTitle?: string) {
  mockApi.mockResolvedValue({ok:true,json:async()=>data});
  await act(async () => root.render(React.createElement(component, {manuscriptId:'fiction-m',workTitle})));
  expect(mockApi).not.toHaveBeenCalled();
  const details = host.querySelector<HTMLDetailsElement>('details')!;
  await act(async () => { details.open = true; details.dispatchEvent(new Event('toggle')); });
  return details;
}
it('uses the verified Work name for an unnamed manuscript in both preview surfaces', async () => {
  await open(P4R1InteriorProof,currentDraft,'Window and Rain');
  expect(host.querySelector('.p4r1-interior-toolbar strong')?.textContent).toBe('Window and Rain');
  expect(host.textContent).toContain('Fictional prose stays intact.');
  act(() => root.unmount()); root=createRoot(host); mockApi.mockClear();
  await open(P4R1CoverStudy,coverProof,'Window and Rain');
  expect(host.querySelector('[data-cover-front-title]')?.textContent).toBe('Window and Rain');
});
it.each(['An Author-Given Manuscript Title','Your writing'])('preserves explicit expression title %s instead of replacing it with the Work name', async (title) => {
  await open(P4R1CoverStudy,{...coverProof,title,manuscriptTitle:title},'Different Work Title');
  expect(host.querySelector('[data-cover-front-title]')?.textContent).toBe(title);
});
it('keeps the existing safe fallback when no unambiguous Work name is supplied', async () => {
  await open(P4R1CoverStudy,coverProof);
  expect(host.querySelector('[data-cover-front-title]')?.textContent).toBe('Your writing');
});
it('does not reset an edited cover when Work title metadata changes', async () => {
  await open(P4R1CoverStudy,coverProof,'Initial Work Name');
  const title=host.querySelector<HTMLInputElement>('input[aria-label="Cover title"]')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(title,'My cover title');
    title.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await act(async () => root.render(React.createElement(P4R1CoverStudy,{
    manuscriptId:'fiction-m',workTitle:'Renamed Work',
  })));
  expect(title.value).toBe('My cover title');
  expect(mockApi).toHaveBeenCalledTimes(1);
});
it('does not replace a titled manuscript in the interior proof', async () => {
  await open(P4R1InteriorProof,{...currentDraft,title:'A manuscript title'},'A Work title');
  expect(host.querySelector('.p4r1-interior-toolbar strong')?.textContent).toBe('A manuscript title');
});
it('rejects malformed title metadata rather than using it to initialize a cover', async () => {
  const details=await open(P4R1CoverStudy,{...coverProof,manuscriptTitle:17},'A Work title');
  expect(details.dataset.coverStatus).toBe('held');
  expect(host.querySelector('[data-cover-front-title]')).toBeNull();
});
