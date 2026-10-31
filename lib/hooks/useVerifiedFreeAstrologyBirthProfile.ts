'use client';

/**
 * FG20 Free traditions: read an optional server-verified member birth record.
 *
 * Every Free tradition also allows deliberate public/manual exploration.
 * A browser-stored date, userId, timezone or previous interpretation is NEVER
 * authority to reopen a private member chart. The existing archived browser
 * data is left untouched for future user-authorized reconciliation.
 *
 * REVIEW-ONLY helper. Application source and credential providers are not
 * modified; full server session, derived memory and R20 need independent proof.
 */
import {useCallback,useEffect,useRef,useState} from 'react';
import {apiFetch} from '@/lib/http/apiBase';
import {normalizeBirthCoordinates} from '@/lib/astrology/birthCoordinates';

export type VerifiedBirthProfile=Readonly<{
  date:string;
  time:string|null;
  location:Readonly<{
    name:string;lat:number;lng:number;timezone:string;
  }>|null;
}>;
export type BirthProfileState=Readonly<{
  status:'checking'|'verified'|'signed-out'|'unavailable';
  memberId:string|null;
  birthData:VerifiedBirthProfile|null;
}>;

export const EMPTY_VERIFIED_BIRTH_STATE:BirthProfileState=
 Object.freeze({status:'checking',memberId:null,birthData:null});

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function normalizeServerProfileBirthData(raw:unknown):VerifiedBirthProfile|null{
 if(raw===null||typeof raw!=='object'||Array.isArray(raw))return null;
 const r=raw as Record<string,unknown>;
 const date=r.date;
 if(typeof date!=='string'||!/^(\d{4})-(\d{2})-(\d{2})$/.test(date))return null;
 const actual=new Date(date+'T12:00:00.000Z');
 if(!Number.isFinite(actual.valueOf())||
    actual.toISOString().slice(0,10)!==date)return null;

 let time:string|null=null;
 if(typeof r.time==='string'&&/^\d{2}:\d{2}/.test(r.time)){
  const candidate=r.time.slice(0,5);
  const [hours,minutes]=candidate.split(':').map(Number);
  if(hours<=23&&minutes<=59)time=candidate;
 }

 let location:VerifiedBirthProfile['location']=null;
 const place=r.location;
 if(place&&typeof place==='object'&&!Array.isArray(place)){
  const v=place as Record<string,unknown>;
  // Coordinates must be both present and finite; never substitute 0,0
  // for unknown place, and never invent UTC for an unknown birth timezone.
  const coords=normalizeBirthCoordinates(v.lat,v.lng);
  const timezone=typeof v.timezone==='string'?v.timezone.trim():'';
  const name=typeof v.name==='string'?v.name.trim():'';
  let validZone=false;
  if(timezone.length&&timezone.length<90)try{
   new Intl.DateTimeFormat('en-US',{timeZone:timezone}).format(new Date(0));
   validZone=true;
  }catch{/* unknown timezone is not accepted */}
  if(coords&&name&&validZone){
   location={name,lat:coords.lat,lng:coords.lng,timezone};
  }
 }
 return {date,time,location};
}
export function readVerifiedBirthProfileResponse(
 status:number,body:unknown,
):BirthProfileState{
 if(status===401||status===403)
  return {status:'signed-out',memberId:null,birthData:null};
 if(status!==200||!body||typeof body!=='object'||Array.isArray(body))
  return {status:'unavailable',memberId:null,birthData:null};
 const o=body as Record<string,unknown>;
 if(typeof o.id!=='string'||!UUID.test(o.id))
  return {status:'unavailable',memberId:null,birthData:null};
 // An authenticated member with no complete saved birth date may still
 // explore manually. Never reconstruct from another source.
 return {
  status:'verified',memberId:o.id,
  birthData:normalizeServerProfileBirthData(o.birthData),
 };
}

export function useVerifiedFreeAstrologyBirthProfile(){
 const [state,setState]=useState<BirthProfileState>(EMPTY_VERIFIED_BIRTH_STATE);
 const epoch=useRef(0);
 const controller=useRef<AbortController|null>(null);

 const revalidate=useCallback(async()=>{
  const request=++epoch.current;
  controller.current?.abort();
  const abort=new AbortController();
  controller.current=abort;
  // Drop private birth fields immediately while session authority is
  // unknown; last member's result may not remain on the visible page.
  setState(EMPTY_VERIFIED_BIRTH_STATE);
  try{
   const response=await apiFetch('/api/members/profile',{
     method:'GET',cache:'no-store',signal:abort.signal,
   });
   if(abort.signal.aborted||request!==epoch.current)return;
   const status=response.status;
   if(status!==200){
    setState(readVerifiedBirthProfileResponse(status,null));
    return;
   }
   const body=await response.json();
   if(abort.signal.aborted||request!==epoch.current)return;
   setState(readVerifiedBirthProfileResponse(status,body));
  }catch{
   if(!abort.signal.aborted&&request===epoch.current)
    setState({status:'unavailable',memberId:null,birthData:null});
  }finally{
   if(request===epoch.current)controller.current=null;
  }
 },[]);

 useEffect(()=>{
  void revalidate();
  const onFocus=()=>{void revalidate();};
  const onShow=()=>{void revalidate();};
  const onVisible=()=>{
   if(document.visibilityState==='visible')void revalidate();
  };
  const onStorage=(event:StorageEvent)=>{
   if(event.key===null||[
    'beta_user','memberId','maia_session_version','soullab_member',
   ].includes(event.key))void revalidate();
  };
  window.addEventListener('focus',onFocus);
  window.addEventListener('pageshow',onShow);
  document.addEventListener('visibilitychange',onVisible);
  window.addEventListener('storage',onStorage);
  return ()=>{
   ++epoch.current;
   controller.current?.abort();
   window.removeEventListener('focus',onFocus);
   window.removeEventListener('pageshow',onShow);
   document.removeEventListener('visibilitychange',onVisible);
   window.removeEventListener('storage',onStorage);
  };
 },[revalidate]);

 return {...state,revalidate};
}
