'use client';
/* Restricted iframe presentation of the accepted v3 field.
   Sandbox has an opaque origin, no forms, no top-level navigation, no device
   permissions, and no privileged MAIA Desktop preload. The real parent alone
   dispatches an audited, finite set of room links. */
import { useEffect, useMemo, useRef } from 'react';
import { LIVING_FIELD_V3_HTML } from './livingFieldV3Template';

const routes = {
  maia: '/maia',
  writing: '/writers-studio?from=house',
  people: '/relationships?from=house',
  body: '/practices',
  elemental: '/maia/community/elemental-alchemy',
  sky: '/astrology?from=house',
  memberMoments: '/maia/moments',
  keepCapture: '/maia/keep-capture',
} as const;
type Slot = keyof typeof routes;

type Props = {firstName:string; works:string[]; nonce:string};
function scriptValue(value:unknown): string {
  // Avoid breaking out of a literal script with a malicious user title.
  return JSON.stringify(value).replace(/</g,'\\u003c')
    .replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
}
function adapter({firstName,works,nonce}:Props) {
  const s = {firstName,works:works.slice(0,2),nonce};
  return `<script>(()=>{
   'use strict';
   const fixture=${scriptValue(s)};
   function update(){
     const title=document.getElementById('greeting');
     if(title&&fixture.firstName){
       const hour=new Date().getHours();
       const greeting=hour<5?'Welcome back':hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';
       const exact=greeting+', '+fixture.firstName+'.';
       if(title.textContent!==exact){
         title.replaceChildren(document.createTextNode(greeting+', '));
         const em=document.createElement('em');em.textContent=fixture.firstName+'.';title.appendChild(em);
       }
     }
     const work=typeof fixture.works[0]==='string'&&fixture.works[0].trim()
       ?fixture.works[0].trim():null;
     const writingTitle=work||'Your writing space';
     const strip=document.querySelector('.strip-slot[data-select="writing"] .strip-title');
     if(strip&&strip.textContent!==writingTitle)strip.textContent=writingTitle;
     const stripKicker=document.querySelector('.strip-slot[data-select="writing"] .strip-kicker');
     const kicker=work?'YOUR THREAD':'A PLACE TO BEGIN';
     if(stripKicker&&stripKicker.textContent!==kicker)stripKicker.textContent=kicker;
     if(focused()==='writing'){
       const fields={
         stageTitle:writingTitle,
         focusName:writingTitle,
         stageType:work?'YOUR CONTINUING THREAD':'YOUR WRITING SPACE',
         focusIndex:work?'01 / CREATIVE WORK':'01 / WRITING',
         stageDescription:work
           ?'A saved Work is available. Enter Writer’s Studio to choose where to continue.'
           :'No writing has been saved here yet. You can begin whenever you choose.',
         focusDesc:work
           ?'This Work belongs to your account. Writer’s Studio verifies access before opening it.'
           :'A place for your words and ideas. No manuscript is assumed.'
       };
       for(const [id,value] of Object.entries(fields)){
         const el=document.getElementById(id);
         if(el&&el.textContent!==value)el.textContent=value;
       }
       const action=document.getElementById('stageAction');
       if(action&&action.textContent?.trim()!=='Open Writer’s Studio ↗'){
         action.textContent='Open Writer’s Studio ↗';
       }
     }
     const disclosure=document.getElementById('keepsDisclosure');
     if(disclosure)disclosure.textContent='Session only · demonstration. These notes do not sync or encrypt and are not durable in this restricted field. Export before leaving. For protected records open Marked Moments or Keep/Capture.';
     const demoDisclosure=document.querySelector('.conversation-space .demo-disclosure');
     if(demoDisclosure)demoDisclosure.textContent='Session only · illustrative conversation. MAIA is not connected here. These local notes will not survive closing the field; export before leaving.';
     const keepActions=document.getElementById('drawerActions');
     if(disclosure&&keepActions&&!document.getElementById('memberMomentsDoor')){
       for(const [id,label,slot] of [['memberMomentsDoor','Open marked moments ↗','memberMoments'],['keepCaptureDoor','Open Keep/Capture ↗','keepCapture']]){
         const btn=document.createElement('button');btn.type='button';btn.id=id;btn.textContent=label;btn.dataset.qaDoor=slot;keepActions.prepend(btn);
       }
     }
   }
   function focused(){return document.querySelector('.field-v2')?.dataset.selected||'writing';}
   function request(slot){
     parent.postMessage({schema:'soullab.field.iframe-intent.v1',nonce:fixture.nonce,slot},'*');
   }
   document.addEventListener('click',e=>{
     const btn=e.target?.closest?.('button');if(!btn)return;
     let slot=btn.dataset.qaDoor;
     if(btn.id==='maiaCore'||btn.id==='maiaTop')slot='maia';
     if(btn.id==='stageAction'||btn.id==='focusBtn'){
       const place=focused();if(place!=='keeps')slot=place;
     }
     if(slot){
       e.preventDefault();e.stopImmediatePropagation();
       if(slot==='sound'){
         const status=document.querySelector('.safety-line');
         if(status)status.textContent='Sound Sanctuary remains within the field preview. Live playback and the external room are not admitted in this build.';
         return;
       }
       request(slot);
     }
   },true);
   const start=()=>{
     update();
     const dialog=document.getElementById('drawerTitle');
     if(dialog)new MutationObserver(()=>queueMicrotask(update)).observe(dialog,{childList:true,characterData:true,subtree:true});
     for(const id of ['stageTitle','focusName','stageDescription','focusDesc']){
       const element=document.getElementById(id);
       if(element)new MutationObserver(()=>queueMicrotask(update))
         .observe(element,{childList:true,characterData:true,subtree:true});
     }
     document.addEventListener('click',event=>{
       if(event.target?.closest?.('[data-select],[data-facet],[data-phase]'))
         setTimeout(update,0);
     });
   };
   if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
   else start();
  })();</script>`;
}
export function FieldV3Shell(props:Props) {
  const iframe=useRef<HTMLIFrameElement|null>(null);
  const srcDoc=useMemo(()=>LIVING_FIELD_V3_HTML.replace('</body>',adapter(props)+'</body>'),[props.firstName,props.works,props.nonce]);
  useEffect(()=>{
    const handler=(event:MessageEvent)=>{
      if(event.source!==iframe.current?.contentWindow||event.origin!=='null')return;
      const data=event.data;
      if(!data||data.schema!=='soullab.field.iframe-intent.v1'||data.nonce!==props.nonce||typeof data.slot!=='string')return;
      if(!Object.prototype.hasOwnProperty.call(routes,data.slot))return;
      // There are no browser-supplied URLs or Work IDs. Source routes still
      // apply their own admission, identity and consent checks.
      window.location.assign(routes[data.slot as Slot]);
    };
    window.addEventListener('message',handler);
    return()=>window.removeEventListener('message',handler);
  },[props.nonce]);
  return <main aria-label="Soullab Living Field" style={{margin:0,padding:0,width:'100%',height:'100dvh',background:'#0a1416'}}>
    <iframe ref={iframe} title="Your Soullab Living Field" srcDoc={srcDoc}
      sandbox="allow-scripts" referrerPolicy="no-referrer"
      style={{display:'block',width:'100%',height:'100%',border:0}}/>
  </main>;
}
