'use client';
/** R77P — local fictitious private-pending suggestion read. NOT a MAIA answer. */
import {useState} from 'react';
const ENABLED=process.env.NEXT_PUBLIC_R77P_LOCAL_REVIEW_FIXTURE==='fictional-only';
const R79=process.env.NEXT_PUBLIC_R79_PRIVATE_AUTHOR_FIXTURE==='fictional-only';
type Locus={sectionId:string;start:number;end:number;text:string;generation:number};
type PrivateRead={
 kind:'r77p_fictional_private_review_only';
 proposedPassage:string;servedProvider:string;servedModel:string;
 canApply:false;canUndo:false;publishedVersion:false;
 fictionalModelResponse:true;releaseApproved:false;
};
export default function R77pConfidentialPreview(props:{
 manuscriptId:string;selected:Locus|null;hasUnsavedWork:boolean;
 onVerifiedRevision?:()=>void;
}){
 const [pendingId,setPendingId]=useState<string|null>(null);
 const [open,setOpen]=useState<PrivateRead|null>(null);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [reviewToken,setReviewToken]=useState<string|null>(null);
 const [reviewed,setReviewed]=useState(false);
 const [applied,setApplied]=useState(false);
 if(!ENABLED||typeof window==='undefined'||
   window.location.hostname!=='127.0.0.1')return null;
 async function stage(){
  if(!props.selected||props.hasUnsavedWork||busy)return;
  setBusy(true);setMessage('');setOpen(null);setPendingId(null);
  setReviewToken(null);setReviewed(false);setApplied(false);
  try{
   const r=await fetch('/api/writers-studio/r77p-private-preview',{
    method:'POST',credentials:'same-origin',cache:'no-store',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({
     kind:'stage_fictional_private_candidate',
     manuscriptId:props.manuscriptId,
     sectionId:props.selected.sectionId,
     ...(R79?{
      expectedGeneration:props.selected.generation,
      selected:{start:props.selected.start,end:props.selected.end,
       text:props.selected.text},
     }:{}),
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
 async function reviewForApply(){
  const locus=props.selected;
  if(!R79||!open||!pendingId||!locus||busy||props.hasUnsavedWork)return;
  setBusy(true);setMessage('');setReviewToken(null);setReviewed(false);
  try{
   const r=await fetch('/api/writers-studio/r71-fixture-author',{
    method:'POST',credentials:'same-origin',cache:'no-store',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({
     kind:'review_exact_passage',manuscriptId:props.manuscriptId,
     sectionId:locus.sectionId,expectedGeneration:locus.generation,
     selected:{start:locus.start,end:locus.end,text:locus.text},
     chosenAlternativeId:pendingId,
    }),
   });
   const data=await r.json().catch(()=>null);
   if(r.ok&&data?.kind==='fictional_author_review'&&
    data.alternativeId===pendingId&&data.originalPassage===locus.text&&
    data.proposedPassage===open.proposedPassage&&
    data.generation===locus.generation&&data.canAutoApply===false&&
    typeof data.reviewToken==='string'&&
    /^[A-Za-z0-9_-]{43}$/.test(data.reviewToken)){
    setReviewToken(data.reviewToken);setReviewed(true);
    setMessage('Review verified. Apply is a separate deliberate action.');
   }else setMessage('This exact private review could not be authorized. Nothing changed.');
  }catch{setMessage('Protected review unavailable. Nothing changed.');}
  finally{setBusy(false);}
 }
 async function confirmApply(){
  const locus=props.selected;
  if(!R79||!reviewed||!reviewToken||!open||!locus||busy)return;
  setBusy(true);setMessage('');setReviewToken(null);setReviewed(false);
  try{
   const r=await fetch('/api/writers-studio/r71-fixture-author',{
    method:'POST',credentials:'same-origin',cache:'no-store',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({kind:'apply_reviewed_change',
     manuscriptId:props.manuscriptId,opaqueToken:reviewToken}),
   });
   const appliedResult=await r.json().catch(()=>null);
   if(!r.ok||appliedResult?.kind!=='fictional_author_apply_saved'||
    appliedResult.generation!==locus.generation+1||
    appliedResult.durableClaimSpent!==true||appliedResult.releaseApproved!==false){
    setMessage('Apply was not independently confirmed. Do not retry automatically.');
    return;
   }
   const re=await fetch('/api/writers-studio/r71-fixture-author?'+
    new URLSearchParams({manuscriptId:props.manuscriptId,mode:'reopen'}),{
    credentials:'same-origin',cache:'no-store',
   });
   const reopened=await re.json().catch(()=>null);
   if(!re.ok||reopened?.generation!==appliedResult.generation||
     reopened.action!=='save'||reopened.sectionId!==locus.sectionId||
     !reopened.body?.includes(open.proposedPassage)){
    setMessage('Saved state could not be reopened and verified.');
    return;
   }
   setApplied(true);
   setMessage('The exact author-selected wording was saved. Undo requires separate approval.');
   props.onVerifiedRevision?.();
  }catch{
   setMessage('Edit outcome uncertain. Do not automatically repeat Apply.');
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
   {R79&&!applied?<>
    <p><strong>This suggestion remains unpublished.</strong> The following
     author gesture is a fictional review of this exact passage, never an
     automatic MAIA edit.</p>
    {!reviewed?<button type="button" data-r79-review
      disabled={!props.selected||props.hasUnsavedWork||busy}
      onClick={()=>void reviewForApply()}>
      Review this exact private suggestion
    </button>:<div data-r79-exact-reviewed>
      <p>Original words: <strong>{props.selected?.text}</strong></p>
      <p>Suggested words: <strong>{open.proposedPassage}</strong></p>
      <button type="button" data-r79-apply disabled={busy}
       onClick={()=>void confirmApply()}>
       Apply this reviewed private suggestion
      </button>
      <button type="button" onClick={()=>{
       setReviewed(false);setReviewToken(null);
       setMessage('The original words are kept. Nothing changed.');
      }}>Keep my own words</button>
    </div>}
   </>:null}
   {R79?<p role="status">This is a fictional author-choice test.
     It does not publish a MAIA proposal or activate real inference.</p>
    :<p role="status"><strong>Apply unavailable.</strong> This pending candidate
      is not a published proposal and cannot change the manuscript.</p>}
  </div>:null}
  {message?<p role="status">{message}</p>:null}
 </section>;
}
