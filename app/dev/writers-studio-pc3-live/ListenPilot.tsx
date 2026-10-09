'use client';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';

type Source = { state: string; title?: string; version?: number; sections?: RebuildSection[] };
type Take = { id: number; blob: Blob; url: string; filename: string };
export default function ListenPilot() {
  const params = useSearchParams();
  const manuscriptId = params.get('m') || '';
  const [source, setSource] = useState<Source | null>(null);
  const [sectionId, setSectionId] = useState('');
  const [error, setError] = useState('');
  const [recording, setRecording] = useState(false);
  const [takes, setTakes] = useState<Take[]>([]);
  const [notes, setNotes] = useState('');
  const [mic, setMic] = useState('');
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const media = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const takesRef = useRef<Take[]>([]);
  useEffect(() => { takesRef.current = takes; }, [takes]);
  useEffect(() => () => {
    if (media.current?.state === 'recording') media.current.stop();
    stream.current?.getTracks().forEach(t => t.stop());
    takesRef.current.forEach(t => URL.revokeObjectURL(t.url));
  }, []);
  useEffect(() => {
    let live = true;
    if (!manuscriptId) { setError('Open Listen with an identified manuscript.'); return; }
    void (async () => {
      try {
        const r = await apiFetch('/api/writers-studio/rebuild/context?manuscriptId=' + encodeURIComponent(manuscriptId));
        if (!r.ok) throw new Error(r.status === 401 ? 'Sign in to read your manuscript.' : 'The manuscript could not be loaded.');
        const s = await r.json() as Source;
        if (s.state !== 'section_aware' || !s.sections?.length) throw new Error('This manuscript is not section-addressable. No sections were guessed.');
        if (!live) return;
        const requested = params.get('section') || params.get('s');
        const first = s.sections.find(x => x.draftSectionId === requested) || s.sections.find(x => /^preface$/i.test(x.heading?.trim() || '')) || s.sections[0]!;
        setSource(s); setSectionId(first.draftSectionId);
      } catch(e) { if (live) setError(e instanceof Error ? e.message : 'Unable to read manuscript.'); }
    })();
    return () => { live = false; };
  }, [manuscriptId, params]);
  const section = source?.sections?.find(s => s.draftSectionId === sectionId);
  const refreshMics = async () => {
    try { setMics((await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'audioinput')); } catch { setError('Could not list microphones.'); }
  };
  const start = async () => {
    if (!section?.body || recording) return;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { setError('Use HTTPS or localhost in a browser with microphone recording.'); return; }
    try {
      const s = await navigator.mediaDevices.getUserMedia({audio: mic ? {deviceId: { ideal: mic }} : true});
      stream.current = s; chunks.current = [];
      const mime = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find(t => MediaRecorder.isTypeSupported(t));
      const rec = new MediaRecorder(s, mime ? {mimeType:mime}:undefined);
      media.current = rec;
      const title = (section.heading || 'passage').replace(/[^a-z0-9_-]+/gi,'-').slice(0,60);
      rec.ondataavailable = e => { if(e.data.size) chunks.current.push(e.data); };
      rec.onstop = () => {
        s.getTracks().forEach(t => t.stop()); stream.current = null; media.current = null;
        const blob = new Blob(chunks.current,{type:rec.mimeType || 'audio/webm'});
        if (blob.size) setTakes(old => [...old,{id:Date.now(),blob,url:URL.createObjectURL(blob),filename:title + (blob.type.includes('mp4')?'.m4a':'.webm')}]);
        else setError('No audio captured.');
        setRecording(false);
      };
      rec.onerror = () => setError('Recording error. Stop and try again.');
      rec.start(1000); setRecording(true); setError(''); void refreshMics();
    } catch { setError('Microphone unavailable or permission denied.'); }
  };
  const download = (url:string,name:string) => { const a=document.createElement('a');a.href=url;a.download=name;a.click(); };
  const base='/dev/writers-studio-pc3-live?m='+encodeURIComponent(manuscriptId);
  return <main data-listening-studio-pilot style={{maxWidth:1120,margin:'auto',padding:32,color:'#272f2b',fontFamily:'system-ui,sans-serif'}}>
    <nav style={{display:'flex',gap:20,marginBottom:26}} aria-label="Studio modes">
      <a href={base+'&mode=develop'}>Develop</a><a href={base+'&mode=write'}>Write</a><a href={base+'&mode=review'}>Review</a><strong>Listen · Pilot</strong>
    </nav>
    <small>SOULLAB PRESS · AUTHOR VOICE STUDIO</small>
    <h1 style={{fontFamily:'Georgia,serif',fontSize:34}}>Give your manuscript a voice.</h1>
    <p>This is a private browser-recording pilot, not a finished Descript integration. The manuscript is read-only. Recordings are never sent to the server. Download each take before leaving.</p>
    {error && <p role="alert" style={{color:'#9b3b30'}}>{error}</p>}
    {!source && !error && <p>Opening the manuscript…</p>}
    {source?.sections && <div style={{display:'grid',gridTemplateColumns:'minmax(0,3fr) minmax(280px,2fr)',gap:22}}>
      <section style={{border:'1px solid #d9d6cd',borderRadius:12,padding:24,background:'#fffdf8'}}>
        <small>READ-ONLY SOURCE · VERSION {source.version ?? 'CURRENT'}</small>
        <label htmlFor="listen-section" style={{display:'block',marginTop:16}}>Passage</label>
        <select id="listen-section" disabled={recording} value={sectionId} onChange={e=>setSectionId(e.target.value)} style={{width:'100%',padding:10,margin:'8px 0 22px'}}>
          {source.sections.map((s,i)=><option key={s.draftSectionId} value={s.draftSectionId}>{s.heading || 'Passage '+(i+1)}</option>)}
        </select>
        <h2 style={{fontFamily:'Georgia,serif'}}>{section?.heading || 'Passage'}</h2>
        <article style={{fontFamily:'Georgia,serif',fontSize:20,lineHeight:1.8,whiteSpace:'pre-wrap',maxHeight:'60vh',overflowY:'auto'}}>{section?.body || 'Select a passage with manuscript text.'}</article>
      </section>
      <section style={{borderRadius:12,padding:24,background:'#f1eee6'}}>
        <h2 style={{fontFamily:'Georgia,serif'}}>Record my voice</h2>
        <p>Speak naturally. Re-read mistakes; keep intentional silences.</p>
        <button type="button" onClick={()=>void refreshMics()}>Check microphones</button>
        {!!mics.length && <><label htmlFor="listen-mic" style={{display:'block',marginTop:12}}>Input</label><select id="listen-mic" value={mic} onChange={e=>setMic(e.target.value)} style={{width:'100%',padding:8}}><option value="">System default</option>{mics.map((m,i)=><option key={m.deviceId||i} value={m.deviceId}>{m.label || 'Microphone '+(i+1)}</option>)}</select></>}
        <div style={{display:'flex',gap:12,margin:'22px 0'}}><button type="button" disabled={recording||!section?.body} onClick={()=>void start()}>Start recording</button><button type="button" disabled={!recording} onClick={()=>media.current?.stop()}>Stop & keep take</button></div>
        <p role="status">{recording ? 'Recording in progress…' : 'Ready to record.'}</p>
        <h3>Your takes</h3>
        {takes.length===0 && <p>No takes yet.</p>}
        {takes.map(t=><div key={t.id} style={{borderTop:'1px solid #c5c1b8',paddingTop:12,marginTop:12}}>
          <strong>{t.filename}</strong><audio controls src={t.url} style={{width:'100%',marginTop:10}}/>
          <button type="button" onClick={()=>download(t.url,t.filename)}>Download original</button>
          <button type="button" onClick={()=>{URL.revokeObjectURL(t.url);setTakes(old=>old.filter(x=>x!==t));}} style={{marginLeft:10}}>Discard</button>
        </div>)}
        <h3>Performance notes</h3><textarea aria-label="Performance notes" value={notes} onChange={e=>setNotes(e.target.value)} rows={5} style={{width:'100%',padding:8}} placeholder="What needs more space?"/>
        <button type="button" disabled={!notes.trim()} onClick={()=>{const url=URL.createObjectURL(new Blob([notes],{type:'text/plain'}));download(url,'performance-notes.txt');setTimeout(()=>URL.revokeObjectURL(url),1000);}}>Download notes</button>
        <p style={{fontSize:13}}>Audio remains temporary until downloaded. No manuscript edits, uploads, Descript actions, or automatic MAIA judgments occur here.</p>
      </section>
    </div>}
  </main>;
}
