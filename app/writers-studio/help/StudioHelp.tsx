'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { readCurrentSanctuaryPosture } from '@/lib/sanctuary/currentClientPosture';
import { HELP_RELEASE, HELP_TOPICS, SURFACE_LABEL, UNKNOWN_HELP_CONTEXT, helpTopic, surfaceNotice, type HelpContext, type HelpTopicId } from '@/lib/writersStudio/help/catalogue';
import { matchHelpTopics, validateMatchedTopics } from '@/lib/writersStudio/help/match';
import { captureHelpContext } from './context';
import './help.css';

type Answer={ ids:HelpTopicId[]; source:'guide'|'maia'|'fallback'; context:HelpContext };
type Session={ key:string; canAsk:boolean; release:string };
const common:HelpTopicId[]=['save','marks','focus','failure'];

function Illustration({kind}:{kind:'marks'|'states'|'focus'}) {
  return <figure className="studio-help-illustration" aria-label="Instructional illustration, not your manuscript">
    {kind==='marks'? <><div className="studio-help-example"><span>Markup</span><p>We <del>become</del> <ins>are</ins> present.</p></div><div className="studio-help-example"><span>Preview · when that replacement is chosen</span><p>We are present.</p></div></>:
      kind==='states'? <div className="studio-help-states"><span>Shape<br/><small>Working copy</small></span><b aria-hidden="true">→</b><span>Save<br/><small>Retained version</small></span><b aria-hidden="true">→</b><span>Apply<br/><small>Manuscript</small></span></div>:
      <div className="studio-help-focus-example"><p>Surrounding writing stays in place.</p><blockquote>The focus bracket identifies the passage you have chosen.</blockquote><p>The next paragraph remains context.</p></div>}
    <figcaption>Illustration only. No words are changed by opening Help.</figcaption>
  </figure>;
}
export default function StudioHelp() {
  const path=usePathname(), params=useSearchParams();
  // Used only to clear temporary help on a different place, never transmitted.
  const place=[path,params?.get('m'),params?.get('s'),params?.get('mode'),params?.get('developCraft')].join('|');
  const [slot,setSlot]=useState<HTMLElement|null>(null);
  const [open,setOpen]=useState(false);
  const [tab,setTab]=useState<'ask'|'topics'|'quick'>('ask');
  const [question,setQuestion]=useState('');
  const [search,setSearch]=useState('');
  const [answer,setAnswer]=useState<Answer|null>(null);
  const [notice,setNotice]=useState<string|null>(null);
  const [busy,setBusy]=useState(false);
  const [downloading,setDownloading]=useState(false);
  const [context,setContext]=useState<HelpContext>(UNKNOWN_HELP_CONTEXT);
  const [session,setSession]=useState<Session|null>(null);
  const [checking,setChecking]=useState(false);
  const dialog=useRef<HTMLDialogElement|null>(null), trigger=useRef<HTMLButtonElement|null>(null), input=useRef<HTMLTextAreaElement|null>(null);
  const authRequest=useRef<AbortController|null>(null);
  const request=useRef<AbortController|null>(null), requestSeq=useRef(0), authSeq=useRef(0), sessionRef=useRef<Session|null>(null);
  const selection=useRef<Range[]>([]);
  const invalidateRequest=useCallback(()=>{requestSeq.current++;request.current?.abort();request.current=null;setBusy(false);},[]);
  const clearPrivateHelp=useCallback(()=>{invalidateRequest();setQuestion('');setSearch('');setAnswer(null);setNotice(null);},[invalidateRequest]);

  useEffect(()=>{
    let current:HTMLElement|null=null;
    const find=()=>{
      // At narrow widths the Studio bar may scroll off-screen. Keep the same
      // Help entry reachable without moving or remounting the writing itself.
      const found=window.innerWidth>=1100
        ?document.querySelector<HTMLElement>('[data-studio-topbar-accessories]'):null;
      if(found!==current){current=found;setSlot(found);}
    };
    find();const observer=new MutationObserver(find);observer.observe(document.body,{childList:true,subtree:true});
    window.addEventListener('resize',find);
    return ()=>{observer.disconnect();window.removeEventListener('resize',find);};
  },[]);

  const checkSession=useCallback(async()=>{
    const seq=++authSeq.current;authRequest.current?.abort();
    const abort=new AbortController();authRequest.current=abort;
    const timeout=setTimeout(()=>abort.abort(),6000);setChecking(true);
    try {
      const r=await apiFetch('/api/writers-studio/help',{method:'GET',cache:'no-store',signal:abort.signal});
      const b=await r.json().catch(()=>null);
      if(seq!==authSeq.current)return;
      const next=r.ok && typeof b?.sessionScope==='string' && typeof b?.release==='string'
        ?{key:b.sessionScope,canAsk:b.canAsk===true,release:b.release}:null;
      if(sessionRef.current?.key!==next?.key)clearPrivateHelp();
      sessionRef.current=next;setSession(next);
    }catch{
      if(seq!==authSeq.current)return;
      clearPrivateHelp();sessionRef.current=null;setSession(null);
    }finally{clearTimeout(timeout);if(seq===authSeq.current)setChecking(false);}
  },[clearPrivateHelp]);

  useEffect(()=>{
    clearPrivateHelp();setContext(captureHelpContext());
  },[place,clearPrivateHelp]);

  useEffect(()=>{
    if(!open)return;
    const recheck=()=>void checkSession();
    const storage=(event:StorageEvent)=>{
      if(event.key===null || ['maia_session_token','maia_member_id','maia_settings'].includes(event.key)){
        clearPrivateHelp();recheck();
      }
    };
    const onSettings=()=>{invalidateRequest();};
    window.addEventListener('focus',recheck);window.addEventListener('storage',storage);window.addEventListener('maia-settings-changed',onSettings);
    return ()=>{window.removeEventListener('focus',recheck);window.removeEventListener('storage',storage);window.removeEventListener('maia-settings-changed',onSettings);};
  },[open,checkSession,clearPrivateHelp,invalidateRequest]);

  useEffect(()=>{
    const d=dialog.current;if(!d)return;
    if(open && !d.open){d.showModal();input.current?.focus({preventScroll:true});}
    if(!open && d.open)d.close();
  },[open]);
  useEffect(()=>()=>{requestSeq.current++;authSeq.current++;authRequest.current?.abort();request.current?.abort();},[]);

  const close=()=>{
    invalidateRequest();setOpen(false);
    requestAnimationFrame(()=>{
      const s=window.getSelection();
      const ranges=selection.current.filter(r=>r.startContainer.isConnected && r.endContainer.isConnected);
      if(s && ranges.length){s.removeAllRanges();for(const r of ranges)s.addRange(r);}
      trigger.current?.focus({preventScroll:true});
    });
  };
  const show=()=>{
    const selected=window.getSelection();selection.current=selected?Array.from({length:selected.rangeCount},(_,i)=>selected.getRangeAt(i).cloneRange()):[];
    setContext(captureHelpContext());setOpen(true);void checkSession();
  };
  const openTopic=(id:HelpTopicId)=>{invalidateRequest();setNotice(null);setAnswer({ids:[id],source:'guide',context:captureHelpContext()});setTab('ask');};

  const ask=async()=>{
    const q=question.trim();if(!q || busy || checking)return;
    const now=captureHelpContext();setContext(now);setAnswer(null);setNotice(null);
    const match=matchHelpTopics(q,now);
    if(match.confident){setAnswer({ids:match.ids,source:'guide',context:now});return;}
    const posture=readCurrentSanctuaryPosture();
    if(!posture.resolved || posture.sanctuary || !session?.canAsk || session.release!==HELP_RELEASE){
      if(match.ids.length)setAnswer({ids:match.ids.slice(0,2),source:'guide',context:now});
      setNotice(session?.release && session.release!==HELP_RELEASE?'This tab and the Help service use different guide versions. Keep your writing safe; use the local topics rather than guessing at new controls.':
        !posture.resolved || posture.sanctuary?'I’m staying with the guide under your current privacy setting. Choose a topic below or make the question more specific.':
        'The MAIA guide matcher is unavailable for this session. The local topics and quick start are still here.');return;
    }
    const seq=++requestSeq.current,controller=new AbortController(),owner=session.key;
    request.current=controller;setBusy(true);
    const timer=setTimeout(()=>controller.abort(),25_000);
    try{
      const r=await apiFetch('/api/writers-studio/help',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({release:HELP_RELEASE,question:q,context:now,sanctuary:false})});
      const body=await r.json().catch(()=>null);
      if(seq!==requestSeq.current || sessionRef.current?.key!==owner)return;
      const ids=validateMatchedTopics({topicIds:body?.topicIds});
      const currentPosture=readCurrentSanctuaryPosture();
      if(!currentPosture.resolved || currentPosture.sanctuary){setNotice('The privacy setting changed. Use the local guide; the pending answer is not displayed.');return;}
      if(r.status===401 || (body?.sessionScope && body.sessionScope!==owner)){clearPrivateHelp();sessionRef.current=null;setSession(null);setNotice('Your session changed. Local help is available; sign in again before using MAIA.');return;}
      if(!r.ok || body?.release!==HELP_RELEASE || !ids){
        setNotice(body?.refusal==='guide_version_mismatch'?'This tab and the Help service use different guide versions. No live answer is being assumed current.':
          'MAIA could not match that question just now. Nothing in your writing was changed. Choose a local guide topic below.');
        if(match.ids.length)setAnswer({ids:match.ids.slice(0,2),source:'fallback',context:now});return;
      }
      if(!ids.length){setNotice('I don’t have a verified guide answer for that yet. Is the question about choosing words, saving, moving between passages, or reviewing?');return;}
      setAnswer({ids,source:'maia',context:now});
    }catch{
      if(seq===requestSeq.current){setNotice('The guide match did not finish. Local topics remain available; do not refresh or repeat a manuscript action to fix Help.');if(match.ids.length)setAnswer({ids:match.ids.slice(0,2),source:'fallback',context:now});}
    }finally{clearTimeout(timer);if(seq===requestSeq.current){setBusy(false);request.current=null;}}
  };

  const download=async(document:'handbook'|'quick')=>{
    if(downloading)return;setDownloading(true);setNotice(null);
    try{
      const r=await apiFetch('/api/writers-studio/help/guide?document='+document,{method:'GET'});
      if(!r.ok)throw Error('guide_unavailable');
      const blob=await r.blob();if(!blob.type.includes('application/pdf'))throw Error('not_pdf');
      const url=URL.createObjectURL(blob),a=window.document.createElement('a');
      a.href=url;a.download=document==='handbook'?'Writers-Studio-Handbook-Review-0.9.pdf':'Writers-Studio-Quick-Start-Review-0.9.pdf';
      a.click();setTimeout(()=>URL.revokeObjectURL(url),60_000);
    }catch{setNotice('The PDF is not available for this session. Use the local topics or quick-start steps here.');}
    finally{setDownloading(false);}
  };
  const button=<button ref={trigger} type="button" className={'studio-help-trigger'+(slot?'':' studio-help-fallback')} onClick={show} aria-haspopup="dialog" aria-expanded={open}><span aria-hidden="true">?</span> Help</button>;
  const topics=search.trim()?matchHelpTopics(search,context).ids.map(id=>helpTopic(id)!).filter(Boolean):HELP_TOPICS;

  return <>
    {slot?createPortal(button,slot):button}
    <dialog ref={dialog} className="studio-help-dialog" aria-labelledby="studio-help-title" tabIndex={-1}
      onKeyDown={event=>{
        if(event.key!=='Tab')return;
        const focusable=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),[tabindex="0"]'))
          .filter(node=>node.getClientRects().length>0);
        const first=focusable[0],last=focusable[focusable.length-1];
        if(!first){event.preventDefault();event.currentTarget.focus();return;}
        if(event.shiftKey && (document.activeElement===first || document.activeElement===event.currentTarget)){
          event.preventDefault();last.focus();
        }else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
      }} onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===e.currentTarget)close();}}>
      <div className="studio-help-sheet">
        <header className="studio-help-header"><div><span>MAIA · STUDIO HELP</span><h2 id="studio-help-title">Help with Writer’s Studio</h2><p>{SURFACE_LABEL[context.surface]} · guidance, not an edit</p></div><button type="button" onClick={close} aria-label="Close Studio Help">Close</button></header>
        <nav className="studio-help-tabs" aria-label="Help sections">
          {([['ask','Ask MAIA'],['topics','Topics'],['quick','Quick start']] as const).map(([key,label])=><button key={key} type="button" aria-pressed={tab===key} onClick={()=>setTab(key)}>{label}</button>)}
        </nav>
        <div className="studio-help-content">
          {tab==='ask'?<>
            <label htmlFor="studio-help-question">What would you like help with?</label>
            <textarea ref={input} id="studio-help-question" value={checking?'':question} disabled={checking} onChange={e=>setQuestion(e.target.value)} maxLength={1000} rows={3} placeholder="Why is that word still crossed out?" onKeyDown={e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();void ask();}}}/>
            <p className="studio-help-small">Your writing is not attached. Common answers use the guide on this device. For an unfamiliar question, Ask MAIA may send only your question and screen labels through the configured service.</p>
            <div className="studio-help-ask-row"><button type="button" className="studio-help-primary" onClick={()=>void ask()} disabled={busy||checking||!question.trim()}>{busy?'Finding the right guidance…':'Ask MAIA about Studio'}</button>{busy?<button type="button" onClick={()=>{invalidateRequest();setNotice('Stopped waiting for Help. A dispatched request may still finish; your writing is unchanged.');}}>Stop waiting</button>:null}</div>
            {checking?<p role="status">Checking this help session…</p>:null}
            {answer && !checking?<div className="studio-help-answer" aria-live="polite"><p className="studio-help-attribution">{answer.source==='maia'?'MAIA matched your question to this Studio guide.':answer.source==='fallback'?'From the Studio guide · live matching did not complete':'From the Studio guide · no model request'}</p>{answer.ids.map(id=>{const topic=helpTopic(id)!;const note=surfaceNotice(answer.context,id);return <article key={id}>
              <h3>{topic.title}</h3>{note?<p className="studio-help-context-note">{note}</p>:null}<p>{topic.summary}</p><ol>{topic.steps.map(step=><li key={step}>{step}</li>)}</ol><p className="studio-help-boundary">{topic.boundary}</p>{topic.illustration?<Illustration kind={topic.illustration}/>:null}{topic.page?<p className="studio-help-small">Illustrated handbook · review edition 0.9 · page {topic.page}</p>:null}
            </article>;})}</div>:null}
            {!answer&&!busy?<div className="studio-help-common"><h3>Common questions</h3>{common.map(id=><button type="button" key={id} onClick={()=>openTopic(id)}>{helpTopic(id)!.title}</button>)}</div>:null}
          </>:tab==='topics'?<>
            <label htmlFor="studio-help-search">Find a help topic</label><input id="studio-help-search" value={checking?'':search} disabled={checking} maxLength={200} onChange={e=>setSearch(e.target.value)} placeholder="Save, focus, layout, sources…"/>
            <div className="studio-help-topic-list">{topics.map(t=><button type="button" key={t.id} onClick={()=>openTopic(t.id)}><small>{t.group}</small><b>{t.title}</b><span>{t.summary}</span></button>)}</div>
            {!topics.length?<p>No matching topic yet. Try “save”, “focus”, or “review”, or ask MAIA in your own words.</p>:null}
          </>:<>
            <h3>Your first useful session</h3><p>Use sample writing first. You can stop after saving; keeping the original is a useful decision too.</p>
            <ol className="studio-help-quick"><li><b>Open your Work.</b> Check the title. Choose Write, Develop or Review for the task in front of you.</li><li><b>Choose one passage.</b> In Craft, select its words and choose Work here. Check the focus bracket.</li><li><b>Ask for one useful thing.</b> Discuss, request a small suggestion, or write your own version.</li><li><b>Make it yours.</b> Use this, Keep mine or Write it gives you a choice over each proposed change.</li><li><b>Read, save and return.</b> Use Preview and Save my version. Confirm saving before leaving. Reopen through Saved working versions in Choose passage.</li></ol>
            <Illustration kind="states"/><p className="studio-help-boundary">Direct manuscript typing uses the writing view’s own saving process. Craft Save and Apply are separate. This distinction matters more than memorizing every control.</p>
            <button type="button" onClick={()=>openTopic('failure')}>What to do when a result is uncertain</button>
          </>}
          {notice?<p className="studio-help-notice" role="status">{notice}</p>:null}
        </div>
        <footer className="studio-help-footer"><div><button type="button" disabled={downloading} onClick={()=>void download('handbook')}>Illustrated handbook PDF</button><button type="button" disabled={downloading} onClick={()=>void download('quick')}>Quick-start PDF</button></div><p>Handbook reference: Beta Review 0.9. Help topics describe their applicable surface; they do not certify the pilot release. <button type="button" onClick={()=>openTopic('report')}>Report a problem safely</button></p></footer>
      </div>
    </dialog>
  </>;
}
