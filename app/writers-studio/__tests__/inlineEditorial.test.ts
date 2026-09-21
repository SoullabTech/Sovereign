/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { readOnlyBodyWithAnnotations } from '../canvas/WholeManuscriptSurface';
import RevisionDesk from '../insight/RevisionDesk';
import InlineWorkspace from '../insight/InlineWorkspace';
import ManuscriptPassage from '../insight/ManuscriptPassage';
import { highlightedBody } from '../rebuild/RebuildAuthoredBody';
import MaiaListen, { speechChunks } from '../insight/MaiaListen';
import { apiFetch } from '@/lib/http/apiBase';
jest.mock('../insight/insight.css', () => ({}));
jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root, container: HTMLDivElement;
beforeEach(() => { container = document.createElement('div'); document.body.append(container); root = createRoot(container); jest.clearAllMocks(); });
afterEach(() => { act(() => root.unmount()); container.remove(); });
test('moving and hiding the conversation keeps the same unsaved draft DOM', () => {
  const first = document.createElement('div'), second = document.createElement('div'); document.body.append(first, second);
  const draw = (anchor: HTMLElement | null, open: boolean) => act(() => root.render(React.createElement(InlineWorkspace, { anchor, open, children: React.createElement('textarea', { defaultValue: 'My words' }) })));
  draw(first, true); const draft = first.querySelector('textarea')!; draft.value = 'Still my unsaved words';
  draw(first, false); expect(first.firstElementChild?.hasAttribute('hidden')).toBe(true);
  draw(second, true); expect(second.querySelector('textarea')).toBe(draft); expect(draft.value).toBe('Still my unsaved words');
  draw(null, false); draw(first, true); expect(first.querySelector('textarea')).toBe(draft);
  act(() => root.unmount()); root = createRoot(container); first.remove(); second.remove();
});
test('opening a manuscript conversation reveals it once after its anchor arrives', () => {
  jest.useFakeTimers();
  const scroll = jest.fn();
  const prior = HTMLElement.prototype.scrollIntoView;
  HTMLElement.prototype.scrollIntoView = scroll;
  const anchor = document.createElement('div'); document.body.append(anchor);
  const draw = (target: HTMLElement | null, text: string, open = true) => act(() => root.render(
    React.createElement(InlineWorkspace, { anchor: target, open, revealKey: 'reading:note', children: text })
  ));
  try {
    draw(null, 'First'); act(() => jest.runOnlyPendingTimers()); expect(scroll).not.toHaveBeenCalled();
    draw(anchor, 'First'); act(() => jest.runOnlyPendingTimers()); expect(scroll).toHaveBeenCalledTimes(1);
    draw(anchor, 'MAIA replies'); act(() => jest.runOnlyPendingTimers()); expect(scroll).toHaveBeenCalledTimes(1);
    draw(anchor, 'MAIA replies', false); draw(anchor, 'MAIA replies');
    act(() => jest.runOnlyPendingTimers()); expect(scroll).toHaveBeenCalledTimes(2);
  } finally {
    HTMLElement.prototype.scrollIntoView = prior; anchor.remove(); jest.useRealTimers();
  }
});
test('proposal stays at its exact unicode passage and conversation follows its paragraph', () => {
  const body = 'Before 🌿.\n\nChosen words. Rest of paragraph.\n\nFollowing paragraph.';
  const start = Array.from('Before 🌿.\n\n').length;
  act(() => root.render(React.createElement(ManuscriptPassage, { body, range: { start, end: start + 13 }, proposal: { original: 'Chosen words.', wording: 'New words.', changes: false }, children: React.createElement('aside', null, 'Conversation') })));
  expect(container.querySelector('[data-editorial-locus]')?.textContent).toBe('New words.');
  expect(container.querySelector('.ws-annotated-paragraph')?.textContent).toContain('Rest of paragraph.');
  expect(container.querySelector('aside')?.nextElementSibling?.textContent).toContain('Following paragraph.');
});
test('stale proposal is not projected over changed manuscript words', () => {
  act(() => root.render(React.createElement(ManuscriptPassage, { body:'Changed words.', range:null, proposal: { original:'Old words.',wording:'Proposal',changes:false }, children:React.createElement('aside') })));
  expect(container.textContent).toContain('Changed words.'); expect(container.textContent).not.toContain('Proposal');
});
test('long speech preserves all words without oversized requests', () => {
  const text = ('Wisdom 🌿 stays with experience. ').repeat(400).trim();
  const parts = speechChunks(text); expect(parts.length).toBeGreaterThan(1);
  expect(parts.every(p => p.length <= 3000)).toBe(true); expect(parts.join(' ')).toBe(text);
});
test('stopping a pending voice request prevents late playback', async () => {
  let finish!: (r: any) => void;
  (apiFetch as jest.Mock).mockReturnValue(new Promise(resolve => { finish = resolve; }));
  const audio = jest.fn(); (globalThis as any).Audio = audio;
  act(() => root.render(React.createElement(MaiaListen, { text:'Read these results.' })));
  expect(apiFetch).not.toHaveBeenCalled();
  await act(async () => container.querySelector('button')!.click());
  const signal = (apiFetch as jest.Mock).mock.calls[0][1].signal;
  act(() => container.querySelector('button')!.click()); expect(signal.aborted).toBe(true);
  await act(async () => { finish({ ok:true, blob:async () => new Blob(['audio']) }); });
  expect(audio).not.toHaveBeenCalled(); expect(container.textContent).toContain('Listen to MAIA');
});
test('leaving the active passage aborts voice preparation', async () => {
  (apiFetch as jest.Mock).mockReturnValue(new Promise(() => {}));
  act(() => root.render(React.createElement(MaiaListen, { text:'First passage', active:true })));
  await act(async () => container.querySelector('button')!.click());
  const signal = (apiFetch as jest.Mock).mock.calls[0][1].signal;
  act(() => root.render(React.createElement(MaiaListen, { text:'First passage', active:false })));
  expect(signal.aborted).toBe(true);
});

test('page conversation previews before apply and preserves a draft through discussion', () => {
  const onSend=jest.fn(), onApply=jest.fn(), onPreview=jest.fn();
  const version={id:'v1',author:'maia',wording:'Quieter words.',rationale:'A quieter ending',supersedes:null};
  const thread={threadId:'t1',targetSectionId:'s1',headVersionId:'v1',locusText:'Original words.',legacyLocus:false,versions:[version],turns:[]};
  act(() => root.render(React.createElement(RevisionDesk, {
    inline:true, showInspiration:false, manuscriptId:'m1',title:'My chapter',
    currentText:'Original words.',sectionBody:'Before.\n\nOriginal words.\n\nAfter.',
    thread,version,instruction:'Keep the warmth',onInstruction:jest.fn(),onSend,onApply,onPreview,
    onSelectVersion:jest.fn(),onSaveMember:jest.fn(),onKeep:jest.fn(),busy:false,message:null,response:null
  } as any)));
  const button=(text:string) => Array.from(container.querySelectorAll('button')).find(b=>b.textContent===text)!;
  expect(button('Use this revision').disabled).toBe(true);
  expect(container.querySelector('.wsi-page-tools')?.hasAttribute('hidden')).toBe(true);
  act(()=>button('Read in context').click());
  expect(onPreview).toHaveBeenLastCalledWith({original:'Original words.',wording:'Quieter words.',changes:true});
  expect(button('Use this revision').disabled).toBe(false);
  act(()=>button('Adjust wording').click());
  const draft=container.querySelector('.wsi-revision') as HTMLTextAreaElement;
  expect(draft.value).toBe('Quieter words.');
  expect(button('Use this revision').disabled).toBe(true);
  act(()=>button('Send').click());
  expect(onSend.mock.calls[0][0]).toContain('My unsaved working revision (for discussion, do not apply):\nQuieter words.');
  expect(container.querySelector('.wsi-revision')).toBe(draft);
  expect(onApply).not.toHaveBeenCalled();
});
test('craft teaching is explicit, passage-grounded, and does not create a revision', () => {
  const onSend = jest.fn();
  function TeachingConversation() {
    const [instruction, setInstruction] = React.useState('');
    return React.createElement(RevisionDesk, {
      inline:true, showInspiration:false, manuscriptId:'m1', title:'My chapter',
      currentText:'The door was open.', sectionBody:'Before.\n\nThe door was open.\n\nAfter.',
      thread:null, version:null, instruction, onInstruction:setInstruction, onSend,
      onApply:jest.fn(), onPreview:jest.fn(), onSelectVersion:jest.fn(),
      onSaveMember:jest.fn(), onKeep:jest.fn(), busy:false, message:null,
      response:'This detail arrives before the reader knows why it matters.'
    } as any);
  }
  act(() => root.render(React.createElement(TeachingConversation)));
  const button=(text:string) => Array.from(container.querySelectorAll('button')).find(b=>b.textContent===text)!;
  expect(container.textContent).toContain('Understand it before changing it.');
  act(() => button('Help me understand').click());
  const composer=container.querySelector<HTMLTextAreaElement>('textarea[aria-label="Discuss this passage"]')!;
  expect(composer.value).toContain('Teach me the craft principle');
  expect(composer.value).toContain('using only the supplied passage and observation');
  expect(container.textContent).not.toContain('Use this revision');
  act(() => button('Send').click());
  expect(onSend.mock.calls[0][0]).toContain('Distinguish evidence from interpretation');
  expect(onSend.mock.calls[0][0]).toContain('Do not test me');
});

test('margin note can close and reopen while the paragraph and preview stay in place', () => {
  const toggled=jest.fn();
  const draw=(open:boolean)=>act(()=>root.render(React.createElement(ManuscriptPassage,{
    body:'Before.\n\nOriginal words.\n\nAfter.',range:{start:9,end:24},
    proposal:{original:'Original words.',wording:'My new words.',changes:false},
    annotation:{label:'Voice and rhythm',open,onToggle:toggled},
    children:React.createElement('aside',{hidden:!open},'Conversation')
  })));
  draw(true);
  const marker=container.querySelector('button')!;
  expect(marker.getAttribute('aria-expanded')).toBe('true');
  act(()=>marker.click()); expect(toggled).toHaveBeenCalledTimes(1);
  draw(false);
  expect(container.querySelector('aside')?.hidden).toBe(true);
  expect(container.textContent).toContain('My new words.');
  expect(container.textContent).toContain('After.');
  expect(container.querySelector('button')?.getAttribute('aria-label')).toBe('Open note: Voice and rhythm');
  draw(true); expect(container.querySelector('aside')?.hidden).toBe(false);
});

test('overlapping manuscript notes preserve every code point and open their own observation', () => {
  const body='A 🌿 living page.';
  const first={key:'voice',label:'Voice',sectionId:'s1',range:{start:2,end:10}};
  const second={key:'flow',label:'Flow',sectionId:'s1',range:{start:4,end:14}};
  const select=jest.fn();
  act(()=>root.render(React.createElement('div',null,readOnlyBodyWithAnnotations(body,[first,second],select))));
  const prose=container.cloneNode(true) as HTMLElement;
  prose.querySelectorAll('.ws-development-margin').forEach(n=>n.remove());
  expect(prose.textContent).toBe(body);
  expect(container.querySelectorAll('mark').length).toBeGreaterThan(1);
  act(()=>container.querySelector<HTMLButtonElement>('[data-development-evidence-link="flow"]')!.click());
  expect(select).toHaveBeenLastCalledWith(second);
});
test('invalid annotation offsets never manufacture highlights', () => {
  act(()=>root.render(React.createElement('div',null,readOnlyBodyWithAnnotations('My words.',[
    {key:'bad',label:'Bad',sectionId:'s1',range:{start:0,end:100}}
  ]))));
  expect(container.textContent).toBe('My words.');
  expect(container.querySelector('mark')).toBeNull();
});


test('a section conversation does not highlight unselected prose, but its preview is marked', () => {
  const draw=(proposal: any)=>act(()=>root.render(React.createElement(ManuscriptPassage, {
    body:'A quotation in its own context.', range:null, highlight:false, proposal,
    children:React.createElement('aside',null,'Discuss this section')
  })));
  draw(null);
  expect(container.querySelector('.ws-marked-passage')).toBeNull();
  expect(container.textContent).toContain('A quotation in its own context.');
  draw({original:'A quotation in its own context.',wording:'A chosen revision.',changes:true});
  expect(container.querySelector('.ws-marked-passage ins')).not.toBeNull();
  expect(container.querySelector('[data-preview="true"]')).not.toBeNull();
});

test('the note marker belongs to the paragraph margin, never inside a selected word', () => {
  const body='Before.\n\nA soulful sentence.\n\nAfter.';
  act(()=>root.render(React.createElement(ManuscriptPassage, {body,range:{start:14,end:26},children:React.createElement('aside',null,'Note')})));
  const marker=container.querySelector('.ws-locus-marker')!;
  expect(marker.parentElement?.classList.contains('ws-annotated-paragraph')).toBe(true);
  expect(container.querySelector('[data-editorial-locus]')?.contains(marker)).toBe(false);
  const prose=container.cloneNode(true) as HTMLElement;
  prose.querySelectorAll('.ws-locus-marker, aside').forEach(node=>node.remove());
  expect(prose.textContent).toBe(body);
});
test('overlapping page highlights preserve poetry, unicode, and unmarked surrounding words', () => {
  const body='Water 🌊\nreturns\n\nto the shore.';
  act(()=>root.render(React.createElement('div',null,highlightedBody(body,[{start:2,end:10},{start:5,end:16},{start:-2,end:5}]))));
  expect(container.textContent).toBe(body);
  expect(container.querySelectorAll('button')).toHaveLength(0);
  expect(container.querySelectorAll('mark').length).toBeGreaterThan(0);
});
test('import markers are distinguished without deleting source text or classifying inline filename mentions', () => {
  const body='A sentence about ch014.xhtml in prose.\n\nch013.xhtml';
  act(()=>root.render(React.createElement(ManuscriptPassage,{body,range:null,children:null})));
  expect(container.querySelectorAll('.ws-import-marker')).toHaveLength(1);
  expect(container.querySelector('.ws-import-marker')?.textContent).toBe('ch013.xhtml');
  expect(container.querySelector('[data-editorial-locus]')?.textContent).toBe(body);
});
