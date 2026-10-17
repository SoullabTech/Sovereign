'use client';
/** R77P — local fictitious private-pending suggestion read. NOT a MAIA answer. */
import {useState} from 'react';
const ENABLED=process.env.NEXT_PUBLIC_R77P_LOCAL_REVIEW_FIXTURE==='fictional-only';
type Locus={sectionId:string;start:number;end:number;text:string;generation:number};
type PrivateRead={
 kind:'r77p_fictional_private_review_only';
 proposedPassage:string;servedProvider:string;servedModel:string;
 canApply:false;canUndo:false;publishedVersion:false;
 fictionalModelResponse:true;releaseApproved:false;
};
export default function R77pConfidentialPreview(props:{
 manuscriptId:string;selected:Locus|null;hasUnsavedWork:boolean;
}){
 const [pendingId,setPendingId]=useState<string|null>(null);
 const [open,setOpen]=useState<PrivateRead|null>(null);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 if(!ENABLED||typeof window==='undefined'||
   window.location.hostname!=='127.0.0.1')return null;
 async function stage(){
  if(!props.selected||props.hasUnsavedWork||busy)return;
  setBusy(true);setMessage('');setOpen(null);setPendingId(null);
  try{
   const r=await fetch('/api/writers-studio/r77p-private-preview',{
    method:'POST',credentials:'same-origin',cache:'no-store',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({
     kind:'stage_fictional_private_candidate',
     manuscriptId:props.manuscriptId,
     sectionId:props.selected.sectionId,
    }),
   });
   const data=await r.json().catch(()=>null);
   if(r.ok&&data?.kind==='r77p_fictional_candidate_sealed'&&
     typeof data.pendingId==='string'){
    setPendingId(data.pendingId);
    setMessage('Fictional pending suggestion sealed. No manuscript edit or Apply permission.');
   }else setMessage('Cannot seal this pending example. Nothing in the manuscript was changed.');
  }catch{setMessage('Local private preview unavailable. Nothing changed.');}
  finally{setBusy(false);}
 }
 async function read(){
  if(!pendingId||busy)return;
  setBusy(true);setMessage('');
  try{
   const url='/api/writers-studio/r77p-private-preview?'+
    new URLSearchParams({manuscriptId:props.manuscriptId,pendingId});
   const r=await fetch(url,{cache:'no-store',credentials:'same-origin'});
   const data=await r.json().catch(()=>null);
   if(r.ok&&data?.kind==='r77p_fictional_private_review_only'&&
     data.canApply===false&&data.publishedVersion===false){
    setOpen(data as PrivateRead);
   }else{
    setOpen(null);
    setMessage('Current membership, consent or private custody was not verified. No text is shown.');
   }
  }catch{
   setOpen(null);setMessage('Protected read was unavailable. Nothing changed.');
  }finally{setBusy(false);}
 }
 return <section data-r77p-private-preview style={{margin:'12px 0',padding:'12px',
   border:'1px solid currentColor',borderRadius:9}}>
  <p style={{fontSize:12,marginBottom:6}}>
   <strong>Fictional confidential suggestion preview.</strong> No MAIA model was called.
  </p>
  {props.selected&&!pendingId?<>
   <p style={{fontSize:12}}>The selected passage stays yours. This experiment only tests private review.</p>
   <button type="button" disabled={props.hasUnsavedWork||busy}
     onClick={()=>void stage()}>
    {busy?'Sealing a fictional suggestion…':'Seal a fictional private suggestion'}
   </button>
  </>:!props.selected&&!pendingId?
   <p style={{fontSize:12}}>Select an exact passage to rehearse private review.</p>:null}
  {pendingId&&!open?<button type="button" disabled={busy}
   onClick={()=>void read()}>
   {busy?'Verifying encrypted pending text…':'Read sealed fictional suggestion'}
  </button>:null}
  {open?<div data-r77p-private-revealed>
   <p><strong>Private suggested wording (fictional test only)</strong></p>
   <blockquote>{open.proposedPassage}</blockquote>
   <p style={{fontSize:12}}>Synthetic server-observed provider: {open.servedProvider}
    {' · '}model: {open.servedModel}</p>
   <p role="status"><strong>Apply unavailable.</strong> This pending candidate
    is not a published proposal and cannot change the manuscript.</p>
  </div>:null}
  {message?<p role="status">{message}</p>:null}
 </section>;
}
