/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { WriteManuscriptRail, type WriteChapterView } from '@/app/writers-studio/full-redesign/WriteRoom';

const chapters: WriteChapterView[] = [
  {id:'untitled',label:'Untitled section',role:'other',depth:null},
  {id:'title-a',label:'Elemental Alchemy',role:'other',depth:1},
  {id:'title-b',label:'Elemental Alchemy',role:'other',depth:1},
  {id:'contents',label:'Contents',role:'other',depth:1},
  {id:'part-1',label:'Part One — The Ground',role:'part',depth:1},
  {id:'ch-1',label:'Chapter 1: Journey Begins',role:'chapter',depth:1},
  {id:'c1-move',label:'A Vivid Dream',role:'section',depth:3},
  {id:'part-2',label:'Part Two — The Elements',role:'part',depth:1},
  {id:'ch-5',label:'Chapter 5: Fire',role:'chapter',depth:1},
  {id:'fire-1',label:'Tending the Fire',role:'section',depth:3},
  {id:'bibliography',label:'Bibliography',role:'other',depth:1},
  {id:'bib-1',label:'Chapter 5: Fire',role:'section',depth:3},
  {id:'bib-2',label:'Chapter 6: Water',role:'section',depth:3},
];

describe('Source-preserving manuscript navigation', () => {
  let host:HTMLDivElement;
  let root:Root;
  let onOpen: jest.Mock;
  beforeEach(async()=>{
    (globalThis as Record<string,unknown>).IS_REACT_ACT_ENVIRONMENT=true;
    host=document.createElement('div');
    document.body.appendChild(host);
    root=createRoot(host);
    onOpen=jest.fn();
    await act(async()=>root.render(React.createElement(WriteManuscriptRail,{
      fixture:{heading:'Manuscript',currentChapterId:'ch-1',chapters},
      onOpenChapter:onOpen,
    })));
  });
  afterEach(async()=>{await act(async()=>root.unmount());host.remove()});
  const opening=()=>host.querySelector<HTMLElement>('[data-outline-disclosure="opening"]')!;
  const bibliography=()=>host.querySelector<HTMLElement>('[data-outline-disclosure="bibliography"]')!;
  const click=async(el:Element)=>{await act(async()=>(el as HTMLElement).click())};
  it('folds duplicate title pages and untitled source while retaining authored Part/Chapter navigation',async()=>{
    expect(opening().getAttribute('data-open')).toBe('false');
    expect(host.querySelectorAll('.fr-write-context-children')).toHaveLength(0);
    expect(host.querySelectorAll('.fr-write-chapter-group')).toHaveLength(2);
    expect(host.textContent).toContain('Chapter 5');
    await click(opening().querySelector('button')!);
    expect(opening().querySelectorAll('.fr-write-context-children button')).toHaveLength(4);
    expect(opening().querySelectorAll('[data-chapter="title-a"]')).toHaveLength(1);
    expect(opening().querySelectorAll('[data-chapter="title-b"]')).toHaveLength(1);
    await click(opening().querySelector('[data-chapter="title-b"]')!);
    expect(onOpen).toHaveBeenCalledWith('title-b');
  });
  it('folds bibliography references separately without converting them into real Chapters',async()=>{
    expect(bibliography().getAttribute('data-open')).toBe('false');
    expect(host.querySelectorAll('.fr-write-chapter-group')).toHaveLength(2);
    await click(bibliography().querySelector('button')!);
    expect(bibliography().querySelectorAll('.fr-write-context-children button')).toHaveLength(3);
    await click(bibliography().querySelector('[data-chapter="bib-1"]')!);
    expect(onOpen).toHaveBeenCalledWith('bib-1');
  });
  it('searches the entire stored outline even when both disclosures remain folded',async()=>{
    const search=host.querySelector<HTMLInputElement>('input[type="search"]')!;
    await act(async()=>{
      const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!;
      setter.call(search,'Elemental Alchemy');
      search.dispatchEvent(new Event('input',{bubbles:true}));
    });
    const matches=host.querySelector('[data-outline-search-results]');
    expect(matches).toBeTruthy();
    expect(matches!.querySelectorAll('[data-chapter="title-a"],[data-chapter="title-b"]')).toHaveLength(2);
    expect(onOpen).not.toHaveBeenCalled();
  });
  it('keeps the manuscript source and section IDs completely unchanged',()=>{
    expect(chapters.map(c=>c.id)).toEqual(['untitled','title-a','title-b','contents','part-1','ch-1','c1-move','part-2','ch-5','fire-1','bibliography','bib-1','bib-2']);
    expect(chapters[1].label).toBe('Elemental Alchemy');
    expect(chapters[2].label).toBe('Elemental Alchemy');
  });
});
