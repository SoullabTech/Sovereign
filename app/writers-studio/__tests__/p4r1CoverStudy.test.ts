/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const mockApi = jest.fn();
jest.mock('@/lib/http/apiBase',()=>({ apiFetch: (...args: unknown[])=>mockApi(...args) }));
import P4R1CoverStudy from '@/app/dev/writers-studio-pc3-live/P4R1CoverStudy';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const book={ready:true,title:'Fictional Lantern Book',sectionCount:2,sourceAuthority:'working_draft',
  sourceRevision:'9',issues:[],publicationBoundary:'No file is published'};
let host: HTMLDivElement,root:Root;
beforeEach(()=>{mockApi.mockReset();host=document.createElement('div');document.body.append(host);root=createRoot(host)});
afterEach(()=>{act(()=>root.unmount());host.remove()});
function render(bookId='fiction-manuscript'){
  act(()=>root.render(React.createElement(P4R1CoverStudy,{manuscriptId:bookId})));
  const details=host.querySelector<HTMLDetailsElement>('[data-governed-cover-study]');
  expect(details).not.toBeNull();
  return details!;
}
async function expand(el:HTMLDetailsElement){
  await act(async()=>{el.open=true;el.dispatchEvent(new Event('toggle'));await Promise.resolve();await Promise.resolve()});
}

it('reads verified member title only after author opens, no automatic cover design export', async()=>{
  mockApi.mockResolvedValue({ok:true,json:async()=>book});
  const details=render();
  expect(mockApi).not.toHaveBeenCalled();
  expect(host.querySelector('[data-cover-front-title]')).toBeNull();
  await expand(details);
  expect(mockApi).toHaveBeenCalledTimes(1);
  expect(mockApi).toHaveBeenCalledWith('/api/sovereign/manuscripts/fiction-manuscript/render',
    expect.objectContaining({method:'GET',cache:'no-store',signal:expect.any(AbortSignal)}));
  expect(details.dataset.coverStatus).toBe('ready');
  expect(host.querySelector('[data-cover-front-title]')?.textContent).toBe('Fictional Lantern Book');
  expect(host.textContent).toContain('Working Draft · revision 9');
  expect(host.textContent).toContain('Spine pending verified PDF');
  expect(host.textContent).toContain('closing or leaving loses these choices');
});

it('lets author change front and back composition in session without saved/HTTP body writes',async()=>{
  mockApi.mockResolvedValue({ok:true,json:async()=>book});
  const details=render();
  await expand(details);
  const title=host.querySelector<HTMLInputElement>('input[aria-label="Cover title"]')!;
  const byline=host.querySelector<HTMLInputElement>('input[aria-label="Cover author"]')!;
  const copy=host.querySelector<HTMLTextAreaElement>('textarea[aria-label="Back cover description"]')!;
  await act(async()=>{
    for(const [el,value] of [[title,'My Fictional Title'],[byline,'Invented Author'],[copy,'A private fictional blurb']] as const) {
      const native=Object.getOwnPropertyDescriptor((el instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype:HTMLInputElement.prototype),'value')!.set!;
      native.call(el,value);
      el.dispatchEvent(new Event('input',{bubbles:true}));
    }
  });
  expect(host.querySelector('[data-cover-front-title]')?.textContent).toBe('My Fictional Title');
  expect(host.querySelector('[data-cover-front-author]')?.textContent).toBe('Invented Author');
  expect(host.querySelector('[data-cover-back-copy]')?.textContent).toBe('A private fictional blurb');
  expect(mockApi).toHaveBeenCalledTimes(1);
  const source=require('node:fs').readFileSync(
    require('node:path').join(process.cwd(),'app/dev/writers-studio-pc3-live/P4R1CoverStudy.tsx'),'utf8');
  expect(source).not.toContain('localStorage');
  expect(source).not.toContain('dangerouslySetInnerHTML');
  expect(source).not.toContain("method: 'POST'");
  expect(source).not.toContain('createObjectURL');
});

it('supports author-owned Undo/Redo, reversible title movement, independent Kindle edition', async()=> {
  mockApi.mockResolvedValue({ok:true,json:async()=>book});
  const details=render();
  await expand(details);
  const input=host.querySelector<HTMLInputElement>('input[aria-label="Cover title"]')!;
  const setAuthorText=(value:string)=>{
    const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!;
    setter.call(input,value);
    input.dispatchEvent(new Event('input',{bubbles:true}));
  };
  const button=(name:string)=>Array.from(host.querySelectorAll<HTMLButtonElement>('button'))
    .find(b=>b.textContent?.trim()===name)!;
  expect(button('Undo cover edit').disabled).toBe(true);
  await act(async()=>setAuthorText('Author-edited Paperback Title'));
  expect(host.querySelector('[data-cover-front-title]')?.textContent?.trim()).toBe('Author-edited Paperback Title');
  expect(button('Undo cover edit').disabled).toBe(false);
  await act(async()=>button('Undo cover edit').click());
  expect(host.querySelector('[data-cover-front-title]')?.textContent?.trim()).toBe('Fictional Lantern Book');
  await act(async()=>button('Redo cover edit').click());
  expect(host.querySelector('[data-cover-front-title]')?.textContent?.trim()).toBe('Author-edited Paperback Title');
  await act(async()=>button('Title ↑').click());
  expect(host.querySelector('[data-cover-front-title]')?.getAttribute('data-cover-title-offset')).toBe('-12');
  await act(async()=>button('Undo cover edit').click());
  expect(host.querySelector('[data-cover-front-title]')?.getAttribute('data-cover-title-offset')).toBe('0');

  const kindle=Array.from(host.querySelectorAll<HTMLInputElement>('input[type=radio]'))[2]!;
  await act(async()=>kindle.click());
  expect(input.value).toBe('Fictional Lantern Book');
  await act(async()=>setAuthorText('Independent Kindle Title'));
  const paperback=Array.from(host.querySelectorAll<HTMLInputElement>('input[type=radio]'))[0]!;
  await act(async()=>paperback.click());
  expect(input.value).toBe('Author-edited Paperback Title');
  await act(async()=>{details.open=false;details.dispatchEvent(new Event('toggle'))});
  expect(details.dataset.coverStatus).toBe('closed');
  expect(host.textContent).not.toContain('Independent Kindle Title');
  expect(host.textContent).not.toContain('Author-edited Paperback Title');
});

it('warns before closing an unsaved cover and before a reload', async()=>{
  mockApi.mockResolvedValue({ok:true,json:async()=>book});
  const details=render();
  await expand(details);
  const title=host.querySelector<HTMLInputElement>('input[aria-label="Cover title"]')!;
  const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!;
  await act(async()=>{
    setter.call(title,'Private invented cover still being edited');
    title.dispatchEvent(new Event('input',{bubbles:true}));
  });
  const unload=new Event('beforeunload',{cancelable:true});
  expect(window.dispatchEvent(unload)).toBe(false);
  expect(unload.defaultPrevented).toBe(true);
  const confirm=jest.spyOn(window,'confirm').mockReturnValue(false);
  const summary=details.querySelector('summary')!;
  const click=new MouseEvent('click',{bubbles:true,cancelable:true});
  await act(async()=>summary.dispatchEvent(click));
  expect(confirm).toHaveBeenCalledWith(expect.stringContaining('unsaved edits'));
  expect(click.defaultPrevented).toBe(true);
  expect(details.dataset.coverStatus).toBe('ready');
  confirm.mockRestore();
});

it('distinguishes paperback, hardcover and Kindle without inventing spine or KDP certification',async()=>{
  mockApi.mockResolvedValue({ok:true,json:async()=>book});
  const details=render();
  await expand(details);
  const cover=host.querySelector<HTMLElement>('.p4r1-cover-display')!;
  expect(cover.dataset.coverTarget).toBe('paperback');
  await act(async()=>{host.querySelector<HTMLInputElement>('input[type=radio][name="cover-edition-fiction-manuscript"]:nth-of-type(1)')?.click()});
  const hard=Array.from(host.querySelectorAll<HTMLInputElement>('input[type=radio]'))[1]!;
  await act(async()=>hard.click());
  expect(cover.dataset.coverTarget).toBe('hardcover');
  expect(host.textContent).toContain('own official template');
  const kindle=Array.from(host.querySelectorAll<HTMLInputElement>('input[type=radio]'))[2]!;
  await act(async()=>kindle.click());
  expect(cover.dataset.coverTarget).toBe('kindle');
  expect(host.querySelector('[data-cover-back-copy]')).toBeNull();
  expect(host.textContent).toContain('separate front-cover image');
  expect(host.textContent).not.toContain('Spine pending verified PDF');
});

it('refuses unverifiable member identity and wrong preflight authority, clears session on close',async()=>{
  mockApi.mockResolvedValueOnce({ok:false,status:401,json:async()=>({error:'unauthorized'})})
    .mockResolvedValueOnce({ok:true,json:async()=>({...book,sourceAuthority:'unknown'})})
    .mockResolvedValueOnce({ok:true,json:async()=>book});
  const details=render();
  await expand(details);
  expect(details.dataset.coverStatus).toBe('held');
  expect(host.querySelector('[data-cover-front-title]')).toBeNull();
  await act(async()=>{details.open=false;details.dispatchEvent(new Event('toggle'))});
  await expand(details);
  expect(details.dataset.coverStatus).toBe('held');
  await act(async()=>{details.open=false;details.dispatchEvent(new Event('toggle'))});
  await expand(details);
  expect(details.dataset.coverStatus).toBe('ready');
  await act(async()=>{details.open=false;details.dispatchEvent(new Event('toggle'))});
  expect(host.querySelector('[data-cover-front-title]')).toBeNull();
  expect(details.dataset.coverStatus).toBe('closed');
});
