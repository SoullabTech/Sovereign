/**
 * R51 isolated browser: REAL P4R1 EditorialDancePanel mounted inside REAL
 * canonical React Shell and REAL R41 Unicode passage selection.
 *
 * Deliberately NOT the complete P4R1WriteEditController or live Next route.
 * All Work, alternatives, session and REST endpoints are INVENTED and
 * loopback-only. Browser can send the chosen wording ONLY to "Save my version",
 * NEVER to "Apply" or "Undo" (opaque-token request bodies only).
 */
import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Shell} from '../../../app/writers-studio/full-redesign/Shell';
import {WRITE_GEOMETRY} from '../../../app/writers-studio/full-redesign/tokens';
import EditorialDancePanel from '../../../app/dev/writers-studio-pc3-live/EditorialDancePanel';
import {exactTextareaPassageR41,type ExactPassageR41}
 from '../../../lib/writersStudio/exactLiveSelectionR41';
import type {RebuildEditorialThread,RebuildEditorialVersion}
 from '../../../lib/writersStudio/rebuild/editorialCollaboration';

const SOURCE='🍂 First lantern glows. Second lantern glows.\n\n';
const SELECTED='lantern glows';
const WORK='33333333-3333-4333-8333-33333333333f';
const SECTION='66666666-6666-4666-8666-666666666661';
const VERSION_A='88888888-8888-4888-8888-888888888881';
const VERSION_B='88888888-8888-4888-8888-888888888882';
const MEMBER_VERSION='99999999-9999-4999-8999-999999999991';
const INITIAL:RebuildEditorialThread={
 threadId:'77777777-7777-4777-8777-777777777777',
 chainId:'77777777-7777-4777-8777-777777777778',
 locusText:SELECTED,targetSectionId:SECTION,
 sectionLabel:'The River',legacyLocus:false,turns:[],
 headVersionId:VERSION_A,application:null,
 versions:[
  {id:VERSION_A,author:'maia',wording:'lantern shimmers',supersedes:null,
    rationale:'Editorial purpose: gentler movement.\nWhat changed: glows to shimmers.\nWhy: a quieter shift.\nReader effect: may feel softer.\nWhat I protected: the river image.'},
  {id:VERSION_B,author:'maia',wording:'lantern shines',supersedes:VERSION_A,
    rationale:'Editorial purpose: direct brightness.'},
 ],
};
declare global {
 interface Window {
  __r51Selection?:ExactPassageR41|null;
  __r51Manuscript?:string;
  __r51SessionPosture?:{resolved:boolean;sanctuary:boolean};
  __r51Applied?:string|null;
  __r51SavedVersion?:string|null;
  __r51Error?:string|null;
 }
}
const fetchJson=async(url:string,init?:RequestInit)=>{
 const response=await fetch(url,{credentials:'same-origin',cache:'no-store',...init});
 const data=await response.json();
 if(!response.ok)throw Error(data.reason??('fixture_http_'+response.status));
 return data;
};
const post=(url:string,body:unknown)=>fetchJson(url,{
 method:'POST',headers:{'content-type':'application/json',
  'x-r51-editorial-fixture-csrf':'r51-fixture-only-not-authority'},
 body:JSON.stringify(body),
});
function Work({canvas,onCanvas}:{canvas:boolean;onCanvas:()=>void}){
 const [selected,setSelected]=useState<ExactPassageR41|null>(null);
 const [text,setText]=useState(SOURCE);
 const [thread,setThread]=useState<RebuildEditorialThread>(INITIAL);
 const [selectedId,setSelectedId]=useState<string>(VERSION_A);
 const [appliedId,setAppliedId]=useState<string|null>(null);
 const [posture,setPosture]=useState({resolved:true,sanctuary:false});
 const [busy,setBusy]=useState(false);
 const [status,setStatus]=useState('Choose the second repeated phrase in your manuscript.');
 const manuscript=useRef<HTMLTextAreaElement>(null);
 useEffect(()=>{
  window.__r51Selection=selected;
  window.__r51Manuscript=text;
  window.__r51SessionPosture=posture;
  window.__r51Applied=appliedId;
  window.__r51SavedVersion=thread.versions.find(x=>x.author==='member')?.id??null;
 },[selected,text,posture,appliedId,thread]);
 const observe=()=>{
  const el=manuscript.current;
  if(!el)return;
  const loc=exactTextareaPassageR41(SOURCE,el.value,
    el.selectionStart,el.selectionEnd);
  setSelected(loc);
  if(!loc)setStatus('That passage no longer matches the original. Nothing was changed.');
 };
 const version=thread.versions.find(x=>x.id===selectedId)??null;
 const saveMember=async(draft:{
  threadId:string;sectionId:string;text:string;
  supersedes:string;purpose?:string;
 })=>{
  if(posture.sanctuary||!selected||selected.text!==SELECTED)return false;
  try{
   const data=await post('/fictional-save-member',{...draft});
   if(data.kind!=='fictional_member_version_saved')throw Error('bad_member_save');
   const next:RebuildEditorialVersion={
    id:data.versionId,author:'member',wording:draft.text,
    supersedes:draft.supersedes,rationale:'Saved by the fictional writer.',
   };
   setThread(prev=>({...prev,headVersionId:next.id,
    versions:[...prev.versions,next]}));
   setSelectedId(next.id);
   setStatus('Your personal version is saved, but no manuscript edit was applied.');
   return true;
  }catch(e){
   setStatus('Your version could not be saved. No manuscript edit occurred.');
   window.__r51Error=String(e);return false;
  }
 };
 const apply=async()=>{
  if(posture.sanctuary||!version||version.author!=='member'||!selected){
   setStatus('Apply held. No editorial permission in this posture.');return;
  }
  setBusy(true);
  try{
   // The immutable reviewed candidate is retained exclusively in the fake
   // server, not sent as a replacement from this browser Apply action.
   const prepared=await fetchJson('/fictional-prepare');
   const r=await post('/fictional-apply',{
    kind:'apply_reviewed_change',opaqueToken:prepared.opaqueToken,
   });
   if(r.kind!=='fictional_durably_claimed_encrypted_apply')
    throw Error('unconfirmed_apply');
   setText(SOURCE.slice(0,SOURCE.lastIndexOf(SELECTED))+
    version.wording+SOURCE.slice(SOURCE.lastIndexOf(SELECTED)+SELECTED.length));
   setAppliedId(version.id);
   setStatus('Fictional Apply confirmed. A separately approved Undo remains available.');
  }catch(e){
   window.__r51Error=String(e);
   setStatus('Apply refused. The manuscript remains unchanged.');
  }finally{setBusy(false);}
 };
 const undo=async()=>{
  setBusy(true);
  try{
   const token=await fetchJson('/fictional-prepare-undo');
   const r=await post('/fictional-undo',{
    kind:'undo_reviewed_change',opaqueToken:token.opaqueToken,
   });
   if(r.kind!=='fictional_durable_undo_confirmed')
    throw Error('unconfirmed_undo');
   setText(SOURCE);setAppliedId(null);
   setStatus('Fictional Undo restored the exact prior manuscript text.');
  }catch(e){
   window.__r51Error=String(e);
   setStatus('Undo held. The manuscript remains as it was.');
  }finally{setBusy(false);}
 };
 return (
  <div data-r51-work style={{padding:'20px 24px'}}>
   <small>R51 HELD TEST · INVENTED MANUSCRIPT AND LOCAL APPROVAL</small>
   <h1 style={{fontFamily:'Georgia,serif'}}>The River — Writer’s Studio</h1>
   <p>Select the second occurrence of “lantern glows.” Review, save,
    and read your own version in context before Apply becomes available.</p>
   <textarea id="r51-manuscript" data-r51-original
    ref={manuscript} value={text} rows={5} readOnly spellCheck={false}
    aria-label="Fictional manuscript"
    onSelect={observe} onMouseUp={observe} onKeyUp={observe}
    style={{width:'100%',minHeight:112,fontFamily:'Georgia,serif',fontSize:19,
     background:'var(--fr-panel)',color:'var(--fr-ink)',padding:14,
     borderRadius:12,border:'1px solid var(--fr-line)'}}/>
   <div style={{display:'flex',gap:12,padding:'12px 0',alignItems:'center'}}>
    <button type="button" id="r51-full-canvas" onClick={onCanvas}>
     {canvas?'Leave Full Canvas':'Full Canvas'}</button>
    <button type="button" id="r51-sanctuary" onClick={()=>
     setPosture(p=>({resolved:true,sanctuary:!p.sanctuary}))}>
      {posture.sanctuary?'Return to Ordinary':'Enter Sanctuary'}
    </button>
    <output id="r51-selected" aria-live="polite">
      {selected?.text??'No exact passage selected'}
    </output>
   </div>
   {selected && <EditorialDancePanel
    manuscriptTitle="The River"
    currentText={selected.text}
    sectionBody={SOURCE}
    passageLocus={{start:selected.start,end:selected.end,text:selected.text}}
    thread={thread}
    version={version}
    lastMaiaTurn={null}
    appliedVersionId={appliedId}
    busy={busy}
    message={null}
    undoMessage={null}
    sessionPosture={posture as never}
    onChooseSessionPosture={(sanctuary)=>setPosture({resolved:true,sanctuary})}
    onSelectVersion={setSelectedId}
    onSend={()=>setStatus('No model was contacted in this fictional UI test.')}
    onSaveMember={saveMember as never}
    onApply={()=>void apply()}
    onUndo={()=>void undo()}
    onKeep={()=>setStatus('Your original remains yours. Nothing changed.')}
    onDepth={()=>{}}/>}
   <p id="r51-status" role="status" aria-live="polite">{status}</p>
  </div>
 );
}
function App(){
 const [canvas,setCanvas]=useState(false);
 const [mode,setMode]=useState<'write'|'develop'|'review'|'home'>('write');
 return <div className="fr-root fr-page p4r1-root" style={{height:'100dvh'}}>
  <Shell mode={mode} appearance="day"
   geometry={{...WRITE_GEOMETRY,manuscriptWidth:300,maiaWidth:355,
    manuscriptFloor:176,maiaFloor:250,gapLeft:12,gapRight:12,
    padLeft:12,padRight:12}}
   memberInitial="F" workTitle="The River — Fictional"
   canvas={canvas} onSelectMode={setMode}
   manuscript={<nav style={{padding:18}} aria-label="Fictional outline">
    <h2>Outline</h2><p>The River</p><p>The Hill</p>
   </nav>}
   work={<Work canvas={canvas} onCanvas={()=>setCanvas(v=>!v)}/>}
   maia={<aside style={{padding:20}}>
    <h2>MAIA</h2><p>Fictional editorial alternatives.</p>
    <p>No external AI service is contacted.</p>
   </aside>}/>
 </div>;
}
const target=document.getElementById('root');
if(!target)throw Error('R51_missing_test_root');
createRoot(target).render(<App/>);
