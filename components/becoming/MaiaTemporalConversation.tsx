'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { buildTemporalRepairPrompt, buildTemporalSynthesisPrompt } from '@/lib/becoming/temporalSynthesis';
import type { TemporalContextEnvelope } from '@/lib/becoming/temporalContext';

type ChatTurn = { id: string; role: 'member' | 'maia'; text: string };

export function MaiaTemporalConversation({ envelope }: { envelope: TemporalContextEnvelope }) {
  const handoff = useMemo(() => buildTemporalSynthesisPrompt(envelope), [envelope]);
  const sessionIdRef = useRef(`becoming-across-time-${crypto.randomUUID()}`);
  const [opened,setOpened]=useState(false);
  const [shared,setShared]=useState(false);
  const [turns,setTurns]=useState<ChatTurn[]>([]);
  const [input,setInput]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const latestRef=useRef<HTMLElement>(null);

  useEffect(()=>{
    if(!opened)return;
    const frame=requestAnimationFrame(()=>latestRef.current?.scrollIntoView({behavior:'smooth',block:'center'}));
    return()=>cancelAnimationFrame(frame);
  },[opened,turns.length]);

  async function ask(message:string,initial=false,correction=false) {
    const text=message.trim(); if(!text||busy)return;
    setBusy(true); setError('');
    if(!initial){setTurns(current=>[...current,{id:crypto.randomUUID(),role:'member',text}]);setInput('');}
    try {
      const history=turns.map(turn=>({role:turn.role==='member'?'user':'assistant',content:turn.text}));
      if(shared) history.unshift({role:'user',content:handoff});
      const priorMaia=[...turns].reverse().find(turn=>turn.role==='maia')?.text ?? '';
      const outgoing=correction&&priorMaia ? buildTemporalRepairPrompt(priorMaia,text) : text;
      const response=await apiFetch('/api/becoming/temporal',{
        method:'POST',
        headers:{'Content-Type':'application/json','X-Becoming-Temporal':'1'},
        body:JSON.stringify({
          message:outgoing,
          sessionId:sessionIdRef.current,
          conversationHistory:history,
        }),
      });
      const data=await response.json().catch(()=>null);
      if(!response.ok||typeof data?.message!=='string'||!data.message.trim()) throw new Error(data?.error||'MAIA did not return a response.');
      setShared(true);
      setTurns(current=>[...current,{id:crypto.randomUUID(),role:'maia',text:data.message.trim()}]);
    } catch(err) {
      setError(err instanceof Error?err.message:'The MAIA connection did not complete.');
    } finally { setBusy(false); }
  }

  async function begin() { setOpened(true); if(shared||busy)return; await ask(handoff,true); }
  return <section className="temporal-maia" aria-label="Explore selected time field with MAIA">
    {!opened?<>
      <p className="eyebrow paper-eyebrow">OPTIONAL · WITH MAIA</p>
      <h2>Look across what you chose.</h2>
      <p className="intro">MAIA can sit with only these selected journeys and what you wrote about today, then offer one possible connection for you to accept, complicate, or reject.</p>
      <p className="maia-consent-note">Nothing here becomes a memory, thread, identity, or new House object. Imagined futures remain imagined.</p>
      <details className="optional-detail"><summary>See exactly what MAIA will receive</summary><pre className="handoff-preview">{handoff}</pre></details>
      <button className="primary" disabled={busy||envelope.items.length===0} onClick={()=>void begin()}>{busy?'Bringing the field to MAIA…':'Ask MAIA what it notices'}</button>
    </>:<div className="maia-conversation" aria-busy={busy}>
      <div className="maia-conversation-head"><div><p className="eyebrow paper-eyebrow">ACROSS TIME · WITH MAIA</p><h2>What might connect?</h2></div><span className="metadata">Selected by you · conversation only</span></div>
      <div className="maia-turns" aria-live="polite">{turns.map((turn,index)=><article className={'maia-turn '+turn.role} key={turn.id} ref={index===turns.length-1?latestRef:undefined}><span className="metadata">{turn.role==='maia'?'MAIA':'You'}</span><p>{turn.text}</p></article>)}</div>
      {busy&&<p className="maia-thinking" role="status">{turns.length===0?'MAIA is looking across what you selected…':'MAIA is reconsidering…'}</p>}
      {error&&<p className="error" role="alert">{error}</p>}
      {shared&&<div className="maia-followup"><p className="maia-continuity-note">You can agree, complicate it, or tell MAIA it is wrong. Your correction outranks the hypothesis.</p><label htmlFor="temporal-maia-followup">What fits—or does not?</label><textarea id="temporal-maia-followup" rows={4} value={input} onChange={e=>setInput(e.target.value)} disabled={busy} placeholder="That fits… / That is not true anymore… / Something else matters more…"/><div className="journey-actions split"><button disabled={busy||!input.trim()} onClick={()=>void ask(input,false,true)}>This doesn’t fit</button><button className="primary" disabled={busy||!input.trim()} onClick={()=>void ask(input)}>{busy?'MAIA is reflecting…':'Respond to MAIA'}</button></div></div>}
    </div>}
  </section>;
}
