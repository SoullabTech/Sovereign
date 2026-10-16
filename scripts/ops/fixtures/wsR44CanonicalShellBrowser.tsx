/**
 * R44 · Browser-only fixture rendering the ACTUAL canonical React Shell.
 * Deliberately not a real Writer controller, account, Next route or KMS client.
 * Fictional text and a server-read-only protected review, never Apply/Undo.
 */
import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Shell} from '../../../app/writers-studio/full-redesign/Shell';
import {WRITE_GEOMETRY} from '../../../app/writers-studio/full-redesign/tokens';
import {exactTextareaPassageR41,type ExactPassageR41}
 from '../../../lib/writersStudio/exactLiveSelectionR41';
const ORIGINAL='🍂 First lantern glows. Second lantern glows.\n\n';
const SECTION='55555555-5555-4555-8555-555555555551';
const ALTERNATIVE='66666666-6666-4666-8666-666666666666';
declare global {
 interface Window{
  __r44Mounts?:number;
  __r44Selection?:ExactPassageR41|null;
  __r44Read?:{kind:string;originalPassage:string;proposedPassage:string;canWrite:boolean}|null;
 }
}
function Work({onCanvas,canvas}:{onCanvas:()=>void;canvas:boolean}){
 const [selected,setSelected]=useState<ExactPassageR41|null>(null);
 const [preview,setPreview]=useState<Window['__r44Read']>(null);
 const [message,setMessage]=useState('Choose a passage in the manuscript.');
 const field=useRef<HTMLTextAreaElement>(null);
 useEffect(()=>{window.__r44Mounts=(window.__r44Mounts??0)+1;},[]);
 useEffect(()=>{window.__r44Selection=selected;},[selected]);
 useEffect(()=>{window.__r44Read=preview;},[preview]);
 const observe=()=>{
  if(!field.current)return;
  const locus=exactTextareaPassageR41(
   ORIGINAL,field.current.value,
   field.current.selectionStart,field.current.selectionEnd);
  setSelected(locus);
  setPreview(null);
  setMessage(locus?'Selected exactly. Read in context before any change.':'No exact, current passage is selected.');
 };
 const read=async()=>{
  if(!selected)return;
  const response=await fetch('/fixture-preview',{
   method:'POST',credentials:'same-origin',
   headers:{'content-type':'application/json','x-r44-fixture-csrf':'fictional-local-readonly'},
   body:JSON.stringify({sectionId:SECTION,selected,
    expectedGeneration:1,chosenAlternativeId:ALTERNATIVE}),
  });
  if(!response.ok){setMessage('Review refused; manuscript unchanged.');return;}
  const data=await response.json();
  setPreview(data);
  setMessage('Fictional, read-only protected preview. The manuscript is unchanged.');
 };
 return <section id="r44-work" data-r44-work style={{padding:'22px 26px',maxWidth:960,margin:'0 auto'}}>
   <p style={{fontSize:12,letterSpacing:1.4,opacity:.65}}>FICTIONAL WRITING • LOCAL BROWSER REVIEW</p>
   <h1 style={{fontFamily:'Georgia,serif',fontSize:31,margin:'10px 0 22px'}}>The River Manuscript</h1>
   <p style={{lineHeight:1.7,opacity:.85}}>Select the second occurrence of “lantern glows” to inspect the exact passage.</p>
   <textarea id="r44-body" aria-label="Fictional manuscript section"
     ref={field} defaultValue={ORIGINAL} onSelect={observe} onMouseUp={observe} onKeyUp={observe}
     rows={6} spellCheck={false} style={{display:'block',width:'100%',minHeight:160,
      fontFamily:'Georgia,serif',fontSize:21,lineHeight:1.7,padding:20,
      resize:'vertical',background:'var(--fr-panel)',color:'var(--fr-ink)',
      border:'1px solid var(--fr-line)',borderRadius:12}}/>
   <p data-r44-selection={selected?'exact':'none'} id="r44-selection"
     style={{fontSize:13,margin:'14px 0'}}>
       {selected?'Exact selected passage: '+selected.text+
        ' (codepoints '+selected.start+'–'+selected.end+')':'No authorized passage selected'}
   </p>
   <button type="button" id="r44-read" disabled={!selected}
     onClick={()=>void read()} style={{padding:'11px 16px',background:'var(--fr-action-soft)',
        border:'1px solid var(--fr-action-line)',borderRadius:9}}>Read in context</button>
   <button type="button" id="r44-canvas" onClick={onCanvas}
     style={{marginLeft:12,textDecoration:'underline'}}>
       {canvas?'Close Full Canvas':'Full Canvas'}
   </button>
   <p id="r44-message" role="status" aria-live="polite">{message}</p>
   {preview&&<section id="r44-preview"
     style={{marginTop:12,padding:20,border:'1px solid var(--fr-line)',
       borderRadius:10,background:'var(--fr-maia-card)'}}>
      <p><strong>Original:</strong> {preview.originalPassage}</p>
      <p><strong>Alternative:</strong> {preview.proposedPassage}</p>
      <p>Review only. No author approval has been established.</p>
      <button id="r44-apply" type="button" disabled>Apply unavailable until authorization</button>
    </section>}
  </section>;
}
function App(){
 const [canvas,setCanvas]=useState(false);
 const [mode,setMode]=useState<'write'|'develop'|'review'|'home'>('write');
 return <div className="fr-root fr-page" style={{height:'100dvh'}}>
  <Shell mode={mode} appearance="day" geometry={{...WRITE_GEOMETRY,
      manuscriptWidth:300,maiaWidth:355,manuscriptFloor:176,maiaFloor:250,
      gapLeft:12,gapRight:12,padLeft:12,padRight:12}}
   memberInitial="F" workTitle="The River Manuscript"
   canvas={canvas} onSelectMode={setMode}
   manuscript={<nav style={{padding:18}} aria-label="Fictional outline">
    <h2>Outline</h2><p>1. The River</p><p>2. The Forest</p></nav>}
   work={<Work onCanvas={()=>setCanvas(v=>!v)} canvas={canvas}/>}
   maia={<aside style={{padding:19}}>
     <h2 style={{fontFamily:'Georgia,serif'}}>MAIA</h2>
     <p>Fictional review only. Two equally available alternatives.</p>
     <p>A. lantern shimmers</p><p>B. lantern shines</p>
     <p>No external model is contacted.</p></aside>}
  />
 </div>;
}
const target=document.getElementById('root');
if(!target)throw Error('R44_fictional_root_missing');
createRoot(target).render(<App/>);
