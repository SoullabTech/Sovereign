'use client';

/**
 * R54: actual PC3 Writer panel for deliberate Apply/Undo.
 * DEFAULT OFF in PC3 view and UNMOUNTED by its production controller.
 * The browser owns NO member identity, Work key, Source or proposal wording;
 * the caller supplies only a separately verified server transport.
 *
 * This is a presentation contract, NOT authentication, KMS, or a route.
 */
import {useCallback,useEffect,useRef,useState} from 'react';

export const R54_REAL_PC3_AUTHOR_JOURNEY_ENABLED=false as const;
export const R54_PROTOCOL='soullab.ws.r54.held-pc3-author-journey.v1' as const;
const TOKEN=/^[A-Za-z0-9_-]{43}$/;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export type R54Locus={sectionId:string;start:number;end:number;text:string;generation:number};
export type R54Alternative={id:string;label:string};
type Refused={kind:'refused';reason:string;releaseApproved:false};
export type R54Review={kind:'fictional_author_review';reviewToken:string;generation:number;
 sectionId:string;alternativeId:string;originalPassage:string;proposedPassage:string;
 canAutoApply:false;releaseApproved:false};
export type R54Apply={kind:'fictional_author_apply_saved';generation:number;
 durableClaimSpent:true;canAutoRetry:false;releaseApproved:false};
export type R54UndoReview={kind:'fictional_author_undo_review';undoToken:string;
 appliedGeneration:number;restoresGeneration:number;canAutoUndo:false;releaseApproved:false};
export type R54Undo={kind:'fictional_author_undo_saved';generation:number;
 durableClaimSpent:true;canAutoRetry:false;releaseApproved:false};
export type R54Transport={
 review(input:{kind:'review_exact_passage';expectedGeneration:number;sectionId:string;
  selected:{start:number;end:number;text:string};chosenAlternativeId:string}):
   Promise<R54Review|Refused>;
 apply(input:{kind:'apply_reviewed_change';opaqueToken:string}):Promise<R54Apply|Refused>;
 reviewUndo(input:{kind:'review_last_apply_for_undo'}):Promise<R54UndoReview|Refused>;
 undo(input:{kind:'undo_reviewed_change';opaqueToken:string}):Promise<R54Undo|Refused>;
 reopen():Promise<{generation:number;sectionId:string;body:string;
  action:'start'|'save'|'checkpoint'|'restore';restoredFrom:number|null}|Refused>;
};
export type R54PanelProps={
 selected:R54Locus|null;liveSectionText:string;
 alternatives:readonly R54Alternative[];transport:R54Transport;
 /** Server-verified CURRENT encrypted head, not browser history guessing. */
 lastAppliedGeneration?:number|null;
 /** Only a trusted owning controller may reconcile actual manuscript DOM. */
 onVerifiedRevision:(a:{generation:number;sectionId:string;
  body:string;action:'apply'|'undo'})=>void;
};
type Phase='choose'|'reviewing'|'reviewed'|'applying'|'applied'|
 'undo_reviewing'|'undo_reviewed'|'undoing'|'undone'|'held';
type State={
 phase:Phase;choice:string|null;preview:R54Review|null;
 undoToken:string|null;generation:number|null;restoreGeneration:number|null;
 notice:string;
};
const initial=():State=>({
 phase:'choose',choice:null,preview:null,undoToken:null,generation:null,
 restoreGeneration:null,
 notice:'Choose an option to review. Nothing changes until you approve it.',
});
const refused=(v:unknown):v is Refused=>!!v&&typeof v==='object'&&
 (v as {kind?:unknown}).kind==='refused';
const style={padding:'10px 14px',borderRadius:9,
 border:'1px solid var(--fr-line,#aeb6b9)',background:'var(--fr-panel,#fff)',
 color:'var(--fr-ink,#222)',font:'inherit',cursor:'pointer'};
const exact=(p:R54PanelProps)=>{
 const x=p.selected;
 return !!x&&UUID.test(x.sectionId)&&
  Number.isSafeInteger(x.generation)&&x.generation>0&&
  Number.isSafeInteger(x.start)&&Number.isSafeInteger(x.end)&&
  x.start>=0&&x.end>x.start&&x.text.trim().length>0&&
  Array.from(p.liveSectionText).slice(x.start,x.end).join('')===x.text&&
  p.alternatives.length>=2&&p.alternatives.length<=4&&
  p.alternatives.every(a=>UUID.test(a.id)&&a.label.trim()&&a.label.length<=80)&&
  new Set(p.alternatives.map(a=>a.id)).size===p.alternatives.length;
};
export function P4R1ProtectedAuthorJourneyR54(props:R54PanelProps){
 const [state,setState]=useState<State>(initial);
 const nonce=useRef(0);
 const present=useRef(true);
 const priorBody=useRef(props.liveSectionText);
 const verifiedAppliedBody=useRef<string|null>(null);
 // A successful verified Apply legitimately changes live manuscript text.
 // Preserve the separate Undo review while that authenticated new version
 // replaces the old body. A foreign/unverified body change still stops actions.
 const stamp=JSON.stringify([props.selected,
  props.alternatives.map(x=>x.id)]);
 const current=useRef(stamp);
 useEffect(()=>{present.current=true;return()=>{
  present.current=false;nonce.current+=1;
 };},[]);
 useEffect(()=>{current.current=stamp;nonce.current+=1;
  priorBody.current=props.liveSectionText;
  verifiedAppliedBody.current=null;
  setState(initial());},[stamp]);
 const alive=(id:number,was:string)=>
  present.current&&id===nonce.current&&was===current.current;
 const originallyCurrent=exact(props);
 const afterSaveCurrent=verifiedAppliedBody.current!==null&&
  verifiedAppliedBody.current===props.liveSectionText&&
  ['applied','undo_reviewing','undo_reviewed','undoing'].includes(state.phase);
 const persistedUndoCurrent=Number.isSafeInteger(props.lastAppliedGeneration)&&
  (props.lastAppliedGeneration??0)>=2&&
  ['choose','undo_reviewing','undo_reviewed','undoing'].includes(state.phase);
 const valid=originallyCurrent||afterSaveCurrent||persistedUndoCurrent;
 const busy=['reviewing','applying','undo_reviewing','undoing'].includes(state.phase);
 const hold=(message:string)=>setState(s=>({...s,
  phase:'held',preview:null,undoToken:null,notice:message}));
 const choose=useCallback((id:string)=>{
  if(!originallyCurrent||state.phase!=='choose'||busy)return;
  if(!props.alternatives.some(a=>a.id===id))return;
  nonce.current+=1;priorBody.current=props.liveSectionText;
  verifiedAppliedBody.current=null;
  setState({...initial(),choice:id});
 },[valid,state.phase,busy,props.alternatives]);
 async function review(){
  if(!originallyCurrent||!props.selected||!state.choice||state.phase!=='choose')return;
  const id=++nonce.current,was=stamp,x=props.selected;
  setState(s=>({...s,phase:'reviewing',notice:'Reading your words in context…'}));
  try{
   const r=await props.transport.review({
    kind:'review_exact_passage',sectionId:x.sectionId,
    expectedGeneration:x.generation,
    selected:{start:x.start,end:x.end,text:x.text},
    chosenAlternativeId:state.choice,
   });
   if(!alive(id,was))return;
   if(refused(r)||r.kind!=='fictional_author_review'||
    r.releaseApproved!==false||r.canAutoApply!==false||
    r.generation!==x.generation||r.sectionId!==x.sectionId||
    r.alternativeId!==state.choice||r.originalPassage!==x.text||
    !r.proposedPassage.trim()||!TOKEN.test(r.reviewToken)){
    hold('This review is not current. Nothing was changed.');return;
   }
   setState(s=>({...s,phase:'reviewed',preview:r,
    notice:'Compare the wording. Apply is a separate choice.'}));
  }catch{if(alive(id,was))hold('Review unavailable. Your writing is unchanged.');}
 }
 async function apply(){
  const x=state.preview;
  if(state.phase!=='reviewed'||!x||!valid)return;
  const id=++nonce.current,was=stamp;
  setState(s=>({...s,phase:'applying',
   notice:'Confirming your protected revision…'}));
  try{
   const r=await props.transport.apply({
    kind:'apply_reviewed_change',opaqueToken:x.reviewToken});
   if(!alive(id,was))return;
   if(refused(r)||r.kind!=='fictional_author_apply_saved'||
      r.generation!==x.generation+1||r.canAutoRetry!==false||
      r.durableClaimSpent!==true||r.releaseApproved!==false){
    hold('The edit is not confirmed. Do not retry automatically.');return;
   }
   const reopened=await props.transport.reopen();
   if(!alive(id,was))return;
   if(refused(reopened)||reopened.generation!==r.generation||
      reopened.sectionId!==x.sectionId||
      reopened.action!=='save'||!reopened.body.includes(x.proposedPassage)){
    hold('Saved Work could not be reopened and verified.');return;
   }
   verifiedAppliedBody.current=reopened.body;
   setState(s=>({...s,phase:'applied',preview:null,generation:r.generation,
    notice:'Saved in the protected working draft. Undo is a separate choice.'}));
   props.onVerifiedRevision({action:'apply',generation:r.generation,
    sectionId:reopened.sectionId,body:reopened.body});
  }catch{if(alive(id,was))hold('Edit outcome uncertain. Do not retry automatically.');}
 }
 async function reviewUndo(){
  const savedGeneration=state.generation??props.lastAppliedGeneration;
  if(!savedGeneration||!['applied','choose'].includes(state.phase))return;
  const id=++nonce.current,was=stamp;
  setState(s=>({...s,phase:'undo_reviewing',
   notice:'Checking the version you would restore…'}));
  try{
   const r=await props.transport.reviewUndo({
    kind:'review_last_apply_for_undo'});
   if(!alive(id,was))return;
   if(refused(r)||r.kind!=='fictional_author_undo_review'||
    r.appliedGeneration!==savedGeneration||
    r.restoresGeneration>=r.appliedGeneration||
    r.releaseApproved!==false||r.canAutoUndo!==false||
    !TOKEN.test(r.undoToken)){
    hold('Undo review is not current. Nothing was changed.');return;
   }
   setState(s=>({...s,phase:'undo_reviewed',undoToken:r.undoToken,
    generation:savedGeneration,restoreGeneration:r.restoresGeneration,
    notice:'Restore the earlier wording as a new protected version?'}));
  }catch{if(alive(id,was))hold('Undo review unavailable. Nothing was changed.');}
 }
 async function undo(){
  if(state.phase!=='undo_reviewed'||!state.undoToken)return;
  const id=++nonce.current,was=stamp,token=state.undoToken;
  setState(s=>({...s,phase:'undoing',undoToken:null,
   notice:'Confirming the protected restoration…'}));
  try{
   const r=await props.transport.undo({
    kind:'undo_reviewed_change',opaqueToken:token});
   if(!alive(id,was))return;
   if(refused(r)||r.kind!=='fictional_author_undo_saved'||
    r.generation!==(state.generation??0)+1||
    r.releaseApproved!==false||r.durableClaimSpent!==true||
    r.canAutoRetry!==false){
    hold('Undo is not confirmed. Do not retry automatically.');return;
   }
   const reopened=await props.transport.reopen();
   if(!alive(id,was))return;
   if(refused(reopened)||reopened.generation!==r.generation||
    reopened.action!=='restore'||
    reopened.restoredFrom!==state.restoreGeneration||
    (props.selected!==null&&reopened.sectionId!==props.selected.sectionId)||
    (state.phase==='undo_reviewed'&&props.lastAppliedGeneration==null&&
     reopened.body!==priorBody.current)){
    hold('Restored writing could not be verified.');return;
   }
   setState(s=>({...s,phase:'undone',generation:r.generation,
    notice:'Original wording restored as a new protected revision.'}));
   props.onVerifiedRevision({action:'undo',generation:r.generation,
    sectionId:reopened.sectionId,body:reopened.body});
  }catch{if(alive(id,was))hold('Undo outcome uncertain. Do not retry automatically.');}
 }
 return <section data-r54-pc3-author-journey data-r54-phase={state.phase}
  aria-label="Review this passage" style={{
   margin:'14px 0',padding:16,borderRadius:12,
   border:'1px solid var(--fr-line,#aeb6b9)',
   background:'var(--fr-panel,#fff)',color:'var(--fr-ink,#222)',
  }}>
  <p style={{fontSize:12,letterSpacing:1,opacity:.7}}>
   THIS PASSAGE · YOUR CHOICE
  </p>
  {!valid?<p>{state.phase==='undone'
   ?'The original wording is back. Select another passage whenever you are ready.'
   :'Select an exact, current passage before editing.'}</p>:<>
   {originallyCurrent&&<p>Current words: <strong data-r54-original>{props.selected?.text}</strong></p>}
   {originallyCurrent&&<div role="group" aria-label="Choose a revision to review">
    {props.alternatives.map((a,i)=><button key={a.id} type="button"
      data-r54-choice={a.id} aria-pressed={state.choice===a.id}
      disabled={state.phase!=='choose'||busy} onClick={()=>choose(a.id)}
      style={{...style,margin:'0 8px 8px 0',
       borderColor:state.choice===a.id?'currentColor':undefined}}>
      {'Option '+(i+1)+': '+a.label}
    </button>)}
   </div>}
   {originallyCurrent&&state.phase==='choose'&&<button type="button" id="r54-review"
     style={style} disabled={!state.choice} onClick={()=>void review()}>
     Read this revision in context
   </button>}
   {state.phase==='reviewed'&&state.preview&&<div data-r54-preview
    style={{padding:12,border:'1px solid var(--fr-line,#ccc)',borderRadius:10}}>
    <p>Original: <strong data-r54-before>{state.preview.originalPassage}</strong></p>
    <p>Proposed: <strong data-r54-after>{state.preview.proposedPassage}</strong></p>
    <button type="button" id="r54-apply" style={{...style,
      background:'var(--fr-action-soft,#e9eeed)',
      borderColor:'var(--fr-action-line,#637983)'}}
     onClick={()=>void apply()}>Apply this revision</button>
    <button type="button" id="r54-dismiss" style={{...style,marginLeft:8}}
     onClick={()=>{nonce.current+=1;setState(initial());}}>
     Keep my original words</button>
   </div>}
   {(state.phase==='applied'||(state.phase==='choose'&&
     !!props.lastAppliedGeneration))&&<button type="button" id="r54-review-undo"
    style={style} onClick={()=>void reviewUndo()}>Review Undo</button>}
   {state.phase==='undo_reviewed'&&<button type="button" id="r54-undo"
    style={{...style,background:'var(--fr-action-soft,#e9eeed)',
      borderColor:'var(--fr-action-line,#637983)'}}
    onClick={()=>void undo()}>Confirm Undo</button>}
  </>}
  <p id="r54-status" role="status" aria-live="polite"
   style={{fontSize:13,margin:'12px 0 0'}}>{
     state.phase==='choose'&&!originallyCurrent
      ?props.lastAppliedGeneration
        ?'Your revision is saved. Review Undo to restore earlier wording.'
        :'Your writing is unchanged. Select a passage whenever you are ready.'
      :state.notice
   }</p>
 </section>;
}
