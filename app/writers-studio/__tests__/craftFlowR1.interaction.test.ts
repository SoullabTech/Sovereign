/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import FocusTools, { type CraftFocusToolsR1Props } from '@/app/dev/writers-studio-pc3-live/CraftFocusToolsR1';
import { paragraphTargets } from '@/lib/writersStudio/craftFocusR1';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';

const sections: RebuildSection[] = [
  { draftSectionId: 'fire', sourceSectionId: null, position: 0, heading: 'Fire', headingDepth: 2, headingSignal: null, editable: true, body: 'Fire begins.\n\nFire then moves into Amplifying.' },
  { draftSectionId: 'water', sourceSectionId: null, position: 1, heading: 'Water', headingDepth: 2, headingSignal: null, editable: true, body: 'Water begins with Being.\n\nWater moves into Balancing.' },
];
const bodyOf = (id: string) => sections.find(s => s.draftSectionId === id)!.body;
const targets = paragraphTargets(sections, bodyOf, 2);

describe('A passage choice exposes the destination and the next action', () => {
  let host: HTMLDivElement, root: Root, props: CraftFocusToolsR1Props;
  beforeEach(async () => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    host=document.createElement('div');document.body.appendChild(host);root=createRoot(host);
    props={ sections, bodyOf, revisionNumber: 2, current: targets[1]!, busy:false, receipt:null,
      onMove:jest.fn(()=>true), onMoveAndSuggest:jest.fn(()=>true), onStay:jest.fn(), onAsk:jest.fn() };
    await render();
  });
  afterEach(async()=>{await act(async()=>root.unmount());host.remove();window.getSelection()?.removeAllRanges();});
  async function render() {
    await act(async()=>root.render(React.createElement(React.Fragment,null,
      React.createElement(FocusTools,props),
      React.createElement('section',{'data-craft-section-id':'water'},React.createElement('p',null,'Water begins with Being.')))));
  }
  async function click(text:string) {
    const b=[...host.querySelectorAll('button')].find(b=>b.textContent?.trim()===text);
    if(!b)throw Error('Missing '+text);
    await act(async()=>b.click());
  }
  async function selectWater() {
    const p=host.querySelector('[data-craft-section-id="water"] p')!;
    const range=document.createRange();range.selectNodeContents(p);
    await act(async()=>{window.getSelection()!.removeAllRanges();window.getSelection()!.addRange(range);document.dispatchEvent(new Event('selectionchange'));});
  }
  it('closes the stale Fire picker and names Water when Water is selected',async()=>{
    await click('Choose passage');expect(host.querySelector('select')?.value).toBe('fire');
    await selectWater();
    expect(host.querySelector('[aria-label="Choose a passage to focus on"]')).toBeNull();
    expect(host.querySelector('[data-craft-selection-candidate]')?.textContent).toContain('Selected in Water');
    expect(props.onMove).not.toHaveBeenCalled();expect(props.onMoveAndSuggest).not.toHaveBeenCalled();
    await click('Choose passage');expect(host.querySelector('select')?.value).toBe('water');
    await click('Work here');expect(props.onMove).toHaveBeenCalledWith(expect.objectContaining({sectionId:'water',text:'Water begins with Being.'}));
  });
  it('offers one explicit focus-and-edit act, never an automatic request on selection',async()=>{
    await selectWater();expect(props.onMoveAndSuggest).not.toHaveBeenCalled();
    await click('Work here & suggest an edit');
    expect(props.onMoveAndSuggest).toHaveBeenCalledTimes(1);
    expect(props.onMoveAndSuggest).toHaveBeenCalledWith(expect.objectContaining({sectionId:'water',start:0}));
  });
  it('advances directly to the next passage across the section boundary',async()=>{
    await click('Next passage');
    expect(props.onMove).toHaveBeenCalledWith(expect.objectContaining({sectionId:'water',text:'Water begins with Being.'}));
    expect(props.onAsk).not.toHaveBeenCalled();expect(props.onMoveAndSuggest).not.toHaveBeenCalled();
  });
  it('disables movement while a request is in progress',async()=>{
    props={...props,busy:true};await render();await click('Next passage');expect(props.onMove).not.toHaveBeenCalled();
  });
});
