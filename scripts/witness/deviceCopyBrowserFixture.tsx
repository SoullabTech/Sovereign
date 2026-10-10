/** Synthetic Write-toolbar witness; never touches a real manuscript. */
import React from 'react';
import { createRoot } from 'react-dom/client';
import SaveDeviceCopy from '@/app/dev/writers-studio-pc3-live/SaveDeviceCopy';

const sections = [
  { draftSectionId:'synthetic-2', sourceSectionId:'test2', position:2,
    heading:'Chapter Two', headingDepth:1, headingSignal:'markdown',
    headingPrefix:'Chapter Two\n\n', body:'Old saved body.', editable:true },
  { draftSectionId:'synthetic-1', sourceSectionId:'test1', position:1,
    heading:'Opening', headingDepth:1, headingSignal:'markdown',
    headingPrefix:'Opening\n\n', body:'Original first passage.', editable:true },
];

const props = {
  manuscriptId:'synthetic-manuscript', title:'Synthetic Writer', workTitle:'Synthetic Work',
  version:3, sections,
  latestBody:(id:string) => id === 'synthetic-2' ? 'Unsaved new ending.\nLast line.' : 'Original first passage.',
  hasUnsavedWork:()=>true,
};

function Witness() {
  return <div className="p4r1-root">
    <div data-studio-topbar-accessories="" />
    <SaveDeviceCopy {...props} />
  </div>;
}
createRoot(document.getElementById('root')!).render(<Witness/>);
