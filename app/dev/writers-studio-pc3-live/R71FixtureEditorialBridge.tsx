'use client';
/**
 * R71 local-fictional-only bridge inside the actual PC3 Writer's Studio.
 * Reuses the R54 author-review controls; does not mount the legacy editorial
 * runtime or impersonate MAIA. There is no real provider inference here.
 */
import {useEffect,useMemo,useState} from 'react';
import {P4R1ProtectedAuthorJourneyR54,type R54Locus,
 type R54Alternative,type R54Transport} from './P4R1ProtectedAuthorJourneyR54';

const FIXTURE=process.env.NEXT_PUBLIC_R71_AUTHOR_EDITORIAL_FIXTURE==='fictional-only';
type Summary={lastAppliedGeneration:number|null;alternatives:R54Alternative[]};
type Refused={kind:'refused';reason:string;releaseApproved:false};
const deny=(reason:string):Refused=>({kind:'refused',reason,releaseApproved:false});
export default function R71FixtureEditorialBridge(props:{
 manuscriptId:string;selected:R54Locus|null;liveSectionText:string;
 hasUnsavedWork:boolean;onVerifiedRevision:()=>void;
}){
 const [ready,setReady]=useState<Summary|null>(null);
 const [unavailable,setUnavailable]=useState(false);
 const manuscriptId=props.manuscriptId;
 useEffect(()=>{
  if(!FIXTURE||window.location.hostname!=='127.0.0.1')return;
  let active=true;
  void fetch('/api/writers-studio/r71-fixture-author?'+
   new URLSearchParams({manuscriptId,mode:'state'}),{cache:'no-store'})
    .then(r=>r.ok?r.json():null).then(payload=>{
     if(!active)return;
     if(!payload||!Array.isArray(payload.alternatives)){
      setUnavailable(true);return;
     }
     setReady({lastAppliedGeneration:payload.lastAppliedGeneration??null,
      alternatives:payload.alternatives});
    }).catch(()=>{if(active)setUnavailable(true);});
  return ()=>{active=false;};
 },[manuscriptId]);
 const transport=useMemo<R54Transport>(()=>{
  const post=async (details:Record<string,unknown>)=>{
   try{
    const r=await fetch('/api/writers-studio/r71-fixture-author',{
     method:'POST',credentials:'same-origin',cache:'no-store',
     headers:{'content-type':'application/json'},
     body:JSON.stringify({...details,manuscriptId}),
    });
    const data=await r.json().catch(()=>null);
    return r.ok&&data?data:deny(data?.reason??'server_refusal');
   }catch{return deny('transport_unavailable');}
  };
  return {
   review:async input=>post(input),
   apply:async input=>post(input),
   reviewUndo:async input=>post(input),
   undo:async input=>post(input),
   reopen:async()=>{
    try{
     const r=await fetch('/api/writers-studio/r71-fixture-author?'+
      new URLSearchParams({manuscriptId,mode:'reopen'}),{cache:'no-store'});
     return r.ok?await r.json():deny('cannot_reopen');
    }catch{return deny('cannot_reopen');}
   },
  } as R54Transport;
 },[manuscriptId]);
 if(!FIXTURE||typeof window==='undefined'||window.location.hostname!=='127.0.0.1')return null;
 return <div data-r71-fixture-author-panel style={{margin:'10px 0'}}>
  <p style={{fontSize:12,marginBottom:8}}>
   Fictional editorial acceptance only — these examples are not MAIA responses.
  </p>
  {props.hasUnsavedWork?<p role="status">Finish saving the current writing before reviewing another version.</p>
   :unavailable?<p role="status">The fictional protected editor is unavailable. No change is possible.</p>
   :ready?<P4R1ProtectedAuthorJourneyR54
      key={manuscriptId+':'+(props.selected?.sectionId??'undo')+':'+(props.selected?.generation??0)}
      selected={props.selected} liveSectionText={props.liveSectionText}
      alternatives={ready.alternatives} transport={transport}
      lastAppliedGeneration={ready.lastAppliedGeneration}
      onVerifiedRevision={()=>props.onVerifiedRevision()}/>
   :<p role="status">Checking local fictional author review…</p>}
 </div>;
}
