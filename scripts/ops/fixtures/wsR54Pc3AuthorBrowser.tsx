/**
 * R54 local-only browser fixture imports the ACTUAL canonical Shell,
 * actual R41 exact selector and actual PC3 R54 author-action panel.
 *
 * This is NOT a production PC3 controller, route, member, MAIA model or KMS.
 * All text is invented, and all POSTs go to one ephemeral local server.
 */
import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Shell} from '../../../app/writers-studio/full-redesign/Shell';
import {WRITE_GEOMETRY} from '../../../app/writers-studio/full-redesign/tokens';
import {
 P4R1ProtectedAuthorJourneyR54,type R54Locus,type R54Transport,
} from '../../../app/dev/writers-studio-pc3-live/P4R1ProtectedAuthorJourneyR54';
import {exactTextareaPassageR41}
 from '../../../lib/writersStudio/exactLiveSelectionR41';

const S1='66666666-6666-4666-8666-666666666661';
const PICK='88888888-8888-4888-8888-888888888881';
const OTHER='88888888-8888-4888-8888-888888888882';
const opts=[
 {id:PICK,label:'More luminous'},
 {id:OTHER,label:'More playful'},
] as const;
type PageState={generation:number;sectionId:string;body:string;
 action:'start'|'save'|'restore';restoredFrom:number|null};
type WindowFixture=Window&{
 __r54State?:PageState|null;__r54Selected?:R54Locus|null;
 __r54Mounts?:number;
};
async function transact(uri:string,body:unknown){
 const res=await fetch(uri,{
  method:'POST',credentials:'same-origin',
  headers:{'content-type':'application/json',
   'x-r54-fictional-csrf':'fictional-single-host-browser'},
  body:JSON.stringify(body),
 });
 const json=await res.json();
 if(!res.ok)return {kind:'refused',reason:'fixture_operation_refused',
  releaseApproved:false} as const;
 return json;
}
const api:R54Transport={
 review:v=>transact('/r54/review',v),
 apply:v=>transact('/r54/apply',v),
 reviewUndo:v=>transact('/r54/undo-review',v),
 undo:v=>transact('/r54/undo',v),
 reopen:async()=>{
  const res=await fetch('/r54/state',{credentials:'same-origin'});
  if(!res.ok)return {kind:'refused',reason:'fixture_snapshot_refused',
   releaseApproved:false};
  return res.json();
 },
};
function Work(){
 const [doc,setDoc]=useState<PageState|null>(null);
 const [selected,setSelected]=useState<R54Locus|null>(null);
 const [error,setError]=useState('');
 useEffect(()=>{
  (window as WindowFixture).__r54Mounts=((window as WindowFixture).__r54Mounts??0)+1;
  let active=true;
  void fetch('/r54/state',{credentials:'same-origin'}).then(async r=>{
   if(!r.ok)throw Error('fictional view refused');
   return r.json() as Promise<PageState>;
  }).then(v=>{
   if(active)setDoc(v);
  }).catch(()=>{
   if(active)setError('The fictional manuscript is unavailable.');
  });
  return()=>{active=false;};
 },[]);
 useEffect(()=>{
  (window as WindowFixture).__r54Selected=selected;
 },[selected]);
 useEffect(()=>{(window as WindowFixture).__r54State=doc;},[doc]);
 const observe=(field:HTMLTextAreaElement)=>{
  if(!doc)return;
  const locus=exactTextareaPassageR41(
   doc.body,field.value,field.selectionStart,field.selectionEnd);
  setSelected(locus?{...locus,sectionId:S1,generation:doc.generation}:null);
 };
 if(error)return <p role="alert">{error}</p>;
 if(!doc)return <p role="status">Opening the protected fictional manuscript…</p>;
 return <div id="r54-work" data-r54-fictional-work
   style={{padding:'16px 26px',maxWidth:850,margin:'0 auto'}}>
   <p style={{fontSize:12,letterSpacing:1.2,opacity:.65}}>
    FICTIONAL AUTHOR WORK · LOCAL REHEARSAL
   </p>
   <h1 style={{fontFamily:'Georgia,serif',fontSize:31}}>
    The River Manuscript
   </h1>
   <p>Choose exact words in the manuscript and compare a suggested revision.</p>
   <textarea id="r54-body" readOnly rows={5}
    aria-label="Fictional manuscript section"
    value={doc.body}
    onSelect={e=>observe(e.currentTarget)}
    onMouseUp={e=>observe(e.currentTarget)}
    onKeyUp={e=>observe(e.currentTarget)}
    style={{display:'block',width:'100%',padding:18,boxSizing:'border-box',
     lineHeight:1.65,fontSize:20,fontFamily:'Georgia,serif',
     borderRadius:12,border:'1px solid var(--fr-line,#b8bec3)',
     background:'var(--fr-panel,#fff)',color:'var(--fr-ink,#222)',
     minHeight:145}}/>
   <p id="r54-generation">
    {'Protected working version '+doc.generation}
   </p>
   <p id="r54-selection" data-r54-selection={selected?'exact':'none'}>
    {selected?'Selected: '+selected.text:'Select a passage or review your last edit.'}
   </p>
   <P4R1ProtectedAuthorJourneyR54
     selected={selected}
     liveSectionText={doc.body}
     alternatives={opts}
     lastAppliedGeneration={doc.action==='save'?doc.generation:null}
     transport={api}
     onVerifiedRevision={({generation,body,action})=>{
      setDoc({generation,sectionId:S1,body,
       action:action==='apply'?'save':'restore',
       restoredFrom:action==='undo'?1:null});
      setSelected(null);
     }}
   />
 </div>;
}
function App(){
 const [canvas,setCanvas]=useState(false);
 const [mode,setMode]=useState<'home'|'write'|'develop'|'review'>('write');
 return <div className="fr-root fr-page" style={{height:'100dvh'}}>
   <Shell mode={mode} appearance="day"
    geometry={{...WRITE_GEOMETRY,manuscriptWidth:300,maiaWidth:355,
     manuscriptFloor:176,maiaFloor:250,gapLeft:12,gapRight:12,
     padLeft:12,padRight:12}}
    memberInitial="F" workTitle="The River Manuscript"
    canvas={canvas} onSelectMode={setMode}
    manuscript={<nav style={{padding:18}} aria-label="Fictional outline">
      <h2>Outline</h2><p>1. The River</p><p>2. The Forest</p>
    </nav>}
    work={<div><button id="r54-canvas" type="button"
       style={{margin:12}} onClick={()=>setCanvas(x=>!x)}>
       {canvas?'Close Full Canvas':'Full Canvas'}
      </button><Work/></div>}
    maia={<aside style={{padding:16}}>
      <h2>MAIA</h2>
      <p>Two alternatives are equally available to explore.</p>
      <p>The author chooses whether and when to Apply.</p>
      <p>No external model is contacted.</p>
    </aside>}
   />
 </div>;
}
const mount=document.getElementById('root');
if(!mount)throw Error('R54_FAKE_BROWSER_ROOT_MISSING');
createRoot(mount).render(<App/>);
