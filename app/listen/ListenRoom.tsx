'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  useListeningBoundaryStatus,
  usePersistentListening,
} from '@/components/listening/PersistentListeningProvider';
import { isMaiaSpeechActive } from '@/lib/listening/maiaSpeechFocus';
import { SOULLAB_AUDIO_FOCUS_EVENT, audioFocusSource } from '@/lib/listening/audioFocus';
import { MAX_RESTORE_BYTES, parseCSV, parseM3U, recognizedPlaylistUrl, restoreMemberShelf, tidyText } from '@/lib/listening/portableCollections';
import LocalAudioDesk from './LocalAudioDesk';
import ReceptiveFieldDesk from './ReceptiveFieldDesk';
import PrivateBackupDesk from './PrivateBackupDesk';
import FocusFieldDesk from '@/components/listening/FocusFieldDesk';
import type { MemberCollection, TrackReference } from '@/lib/listening/portableCollections';
import styles from './listen.module.css';

type Mood = 'focus' | 'create' | 'drift' | 'rest';
const journeys: Record<Mood, { label: string; title: string; subtitle: string; description: string; gradient: string; frequencies: number[] }> = {
  focus: { label:'Deep focus', title:'Between the Tides', subtitle:'Long-form attention', description:'Space for sustained attention, quietly held. No algorithm asking you to be productive.',gradient:'focus',frequencies:[110,164.81,220] },
  create:{ label:'Creative flow', title:'Velvet Current', subtitle:'Movement & imagination', description:'Subtle movement for drawing, writing, dreaming and bringing something new into being.',gradient:'create',frequencies:[130.81,196,261.63] },
  drift:{ label:'Chill out',title:'The Blue Hour',subtitle:'Downtempo & atmosphere',description:'An invitation to saunter, feel the evening unfold, and linger between ideas.',gradient:'drift',frequencies:[98,146.83,196] },
  rest:{ label:'Deep rest',title:'Moonwater',subtitle:'Stillness without demand',description:'For unhurried listening, ease, reflection and the passage into sleep.',gradient:'rest',frequencies:[82.41,123.47,164.81] },
};
const nav = [
  {title:'Focus Field',href:'#focus-field'},
  {title:'House',href:'/home'},
  {title:'Writer’s Studio',href:'/writers-studio'},
  {title:'Explore Soullab',href:'/explore'},
];
const moodKeys: Mood[] = ['focus','create','drift','rest'];

type SketchHandle = { context: AudioContext; oscillators: OscillatorNode[]; master: GainNode };
function createSketch(frequencies: number[], volume: number): SketchHandle {
  // User-initiated, LOW-gain synthetic Web Audio preview only. No commercial
  // recording, protected media, FLAC claim or account/provider audio involved.
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.setValueAtTime(0.0001, context.currentTime);
  master.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * 0.027), context.currentTime + 2.2);
  const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 660;
  filter.connect(master); master.connect(context.destination);
  const oscillators = frequencies.map((f, i) => {
    const osc = context.createOscillator();
    const v = context.createGain();
    osc.type = i === 1 ? 'triangle' : 'sine';
    osc.frequency.value = f; osc.detune.value = i === 1 ? 2.4 : -1.1;
    v.gain.value = i === 0 ? 0.24 : i === 1 ? 0.14 : 0.09;
    osc.connect(v); v.connect(filter); osc.start(); return osc;
  });
  return { context, oscillators, master };
}
function releaseSketch(sketch: SketchHandle) {
  // Stops on navigation/unmount, mood changes and explicit Pause.
  const { context, master, oscillators } = sketch;
  try { master.gain.cancelScheduledValues(context.currentTime); master.gain.setTargetAtTime(0.00001,context.currentTime,0.08); } catch {}
  for (const o of oscillators) { try { o.stop(context.currentTime + 0.35); } catch {} }
  // Close the audio context after a short fade; never leave it running on unmount.
  void new Promise(r => setTimeout(r, 410)).then(() => context.close().catch(()=>undefined));
}
function download(filename: string, text: string, type: string) {
  const blob = new Blob([text],{type}); const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function fileExtension(name: string) { return name.toLowerCase().split('.').pop() || ''; }
function makeId() { return typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now()); }

export default function ListenRoom() {
  // Source-owner optional shared shell; standalone room remains usable.
  const persistent = usePersistentListening();
  const boundaryStatus = useListeningBoundaryStatus();
  const standalone = boundaryStatus === 'standalone';
  const transportReady = Boolean(persistent) || standalone;
  const boundaryMessage = boundaryStatus === 'checking'
    ? 'Verifying your private listening session…'
    : boundaryStatus === 'unavailable'
      ? 'Listening is temporarily unavailable because the session could not be verified.'
      : 'Your listening session is not available. Sign in again to continue.';
  const [mood, setMood] = useState<Mood>('drift');
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(45);
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [collections, setCollections] = useState<MemberCollection[]>([]);
  const [note, setNote] = useState('');
  const [showJournal, setShowJournal] = useState(false);
  const [status, setStatus] = useState('Ready for your listening journey.');
  const sketch = useRef<SketchHandle | null>(null);
  const memberAudioRef = useRef<HTMLAudioElement>(null);
  const player = journeys[mood];
  const isPlaying = persistent
    ? persistent.snapshot.playback === 'playing' && persistent.snapshot.kind === 'sketch' && persistent.snapshot.mood === mood
    : playing;
  const shownStatus = persistent?.snapshot.kind === 'sketch' ? persistent.snapshot.message : status;

  const stop = useCallback(() => {
    if (sketch.current) { releaseSketch(sketch.current); sketch.current = null; }
    setPlaying(false);
  }, []);
  // Standalone fallback still obeys MAIA focus; the real stable-root provider
  // handles this when present, so do not attach a duplicate listener.
  useEffect(() => {
    if (persistent || !standalone) return;
    const onFocus=(event: Event) => {
      if(audioFocusSource(event) === 'maia-voice') {
        stop();
        memberAudioRef.current?.pause();
        setStatus('MAIA is speaking. Music was paused.');
      }
    };
    window.addEventListener(SOULLAB_AUDIO_FOCUS_EVENT, onFocus);
    return () => window.removeEventListener(SOULLAB_AUDIO_FOCUS_EVENT, onFocus);
  }, [persistent, standalone, stop]);
  useEffect(() => () => { if(sketch.current) releaseSketch(sketch.current); sketch.current=null; }, []);
  // A member-initiated journey stays active when they switch tabs to write or code.
  // Explicit Pause, changing journeys and unmount still stop it. Browsers may
  // independently suspend background audio, especially on mobile devices.
  const selectMood=(next:Mood)=>{if(persistent) persistent.pause(); else if(standalone) stop(); setMood(next);setStatus(`Selected ${journeys[next].label}.`);};
  const toggle=async()=>{
    if (persistent) {
      if (isPlaying) { persistent.pause(); return; }
      const started = await persistent.playSketch(mood, player.frequencies);
      if (!started) setStatus('Audio is currently busy in this Soullab tab or another tab, or audio coordination is unavailable. Try again after it stops.');
      return;
    }
    if (!standalone) {
      setStatus(boundaryMessage);
      return;
    }
    if (playing) { stop(); return; }
    if (isMaiaSpeechActive()) {
      setStatus('MAIA is speaking. Stop or finish MAIA before playing music.');
      return;
    }
    try {
      // Keep the two audio surfaces mutually exclusive.
      memberAudioRef.current?.pause();
      // Cooperate with Writer's existing STOP event when both surfaces share a document.
      window.dispatchEvent(new Event('ws-stop-maia-reading'));
      const instance=createSketch(player.frequencies,volume/100);
      sketch.current=instance;
      await instance.context.resume();
      if(isMaiaSpeechActive()) {
        stop(); setStatus('MAIA is speaking. Stop or finish MAIA before playing music.');
        return;
      }
      setPlaying(true);
      setStatus('Playing a locally synthesized sound sketch. This is not commercial music or mastered FLAC.');
    } catch {stop();setStatus('Your browser could not start audio. Try again after enabling sound.');}
  };
  const changeVolume=(n:number)=>{
    if(persistent) { persistent.setVolume(n); return; }
    setVolume(n);
    if(sketch.current){const {context,master}=sketch.current;master.gain.setTargetAtTime(Math.max(0.00001,(n/100)*0.027),context.currentTime,0.10);}
  };
  const addLink=()=>{
    if(collections.length>=30){setStatus('Export or clear collections before adding more than 30.');return;}
    const valid=recognizedPlaylistUrl(link);
    if(!valid){setStatus('Use an HTTPS playlist link from a supported provider.');return;}
    const display=tidyText(name,100) || `${valid.service} playlist`;
    setCollections(c=>[{id:makeId(),name:display,provider:valid.service,link:valid.href,tracks:[]},...c]);
    setLink('');setName('');setStatus(`Added ${display}. The playlist link opens in ${valid.service}; no song files are imported.`);
  };
  const importFile=async(file:File|null)=>{
    if(!file)return;
    if(file.size>1024*1024){setStatus('Playlist must be 1 MB or smaller.');return;}
    if(collections.length>=30){setStatus('Collection limit reached.');return;}
    try {
      const ext=fileExtension(file.name);
      if(!['csv','m3u','m3u8'].includes(ext)){setStatus('Please choose a CSV or M3U file.');return;}
      const input=await file.text();
      const tracks:TrackReference[] = ext==='csv'?parseCSV(input):parseM3U(input);
      if(!tracks.length){setStatus('No usable track titles were found.');return;}
      const display=tidyText(file.name.replace(/\.[^.]+$/,''),100);
      setCollections(c=>[{id:makeId(),name:display,provider:null,link:null,tracks},...c]);
      setStatus(`Imported ${tracks.length} track references, not recordings, from ${file.name}.`);
    } catch(e) {setStatus(e instanceof Error?e.message:'Could not read playlist.');}
  };
  const restoreShelf = async (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_RESTORE_BYTES) { setStatus('Listening export exceeds the 5 MB limit.'); return; }
    try {
      const restored = restoreMemberShelf(await file.text());
      if ((collections.length || note) && !window.confirm('Replace the current tab collection and reflection with this export?')) return;
      setCollections(restored.collections); setNote(restored.journal);
      setStatus(`Restored ${restored.collections.length} private collections in this tab, without server access.`);
    } catch (e) { setStatus(e instanceof Error ? e.message : 'Could not restore this listening export.'); }
  };
  const exportShelf=()=>{
    download('soullab-listening-room-export.json',JSON.stringify({format:'SOULLAB_LISTEN_03_MEMBER_EXPORT',collections,journal:note},null,2),'application/json');
    setStatus('A readable JSON copy was exported to your device. Use encrypted backup for private reflections.');
  };
  const clearShelf=()=>{if(!window.confirm('Clear imported playlists and private journal from this browser tab?'))return;setCollections([]);setNote('');setStatus('This tab’s collection and journal have been cleared.');};
  return <main className={styles.shell}>
    <aside className={styles.rail} aria-label="Listening Room navigation">
      <div className={styles.brand}><span className={styles.sunmark} aria-hidden="true">◒</span><div><span className={styles.wordmark}>SOULLAB</span><span className={styles.descriptor}>LISTENING ROOM</span></div><Link href="/home" className={styles.mobileHomeLink} aria-label="Return to Soullab Home">Home</Link></div>
      <div className={styles.navTitle}>Explore</div>
      <nav className={styles.nav} aria-label="Soullab">{nav.map(item=><Link key={item.href} href={item.href}>{item.title}<span aria-hidden="true">↗</span></Link>)}</nav>
      <div className={styles.navTitle}>Listening journeys</div>
      <div className={styles.moodList}>{moodKeys.map(key=><button className={mood===key?styles.activeMood:styles.moodButton} type="button" aria-pressed={mood===key} key={key} onClick={()=>selectMood(key)}><span className={styles.moodDot} aria-hidden="true" />{journeys[key].label}</button>)}</div>
      <div className={styles.railFoot}>For the life you live.<br/>For the world we make.</div>
    </aside>
    <div className={styles.main}>
      <div className={styles.topline}><span>SOULLAB / SOUND & PRESENCE</span><span className={styles.review}>ISOLATED REVIEW · NOT PUBLIC</span></div>
      <section className={`${styles.hero} ${styles[player.gradient]}`} aria-labelledby="listen-title">
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>A SOULLAB LISTENING JOURNEY</div>
          <h1 id="listen-title">{player.title}</h1>
          <p className={styles.subtitle}>{player.subtitle}</p>
          <p className={styles.intro}>{player.description}</p>
          <div className={styles.keywords}><span>Ambient</span><span>Contemplative</span><span>Human-centered</span><span>Unhurried</span></div>
          <div className={styles.heroButtons}>
            <button
              className={styles.play}
              type="button"
              onClick={()=>void toggle()}
              aria-pressed={isPlaying}
              aria-label={transportReady
                ? isPlaying ? 'Pause sound sketch' : 'Listen to sound sketch'
                : boundaryStatus === 'checking'
                  ? 'Listening transport is verifying your session'
                  : 'Listening transport unavailable'}
              data-listening-boundary-status={boundaryStatus}
              disabled={!transportReady}
            >
              {!transportReady
                ? boundaryStatus === 'checking' ? '…  Verifying private listening' : 'Listening unavailable'
                : isPlaying ? 'Ⅱ  Pause sound sketch' : '▶  Listen to sound sketch'}
            </button>
            <button className={styles.secondary} type="button" onClick={()=>setShowJournal(x=>!x)} aria-expanded={showJournal}>Personal reflection</button>
          </div>
          <p className={styles.quality}>LIVE SYNTHESIS · LOW-VOLUME STUDY · NOT A MASTERED OR LICENSED RECORDING</p>
          {persistent && <p role="status" aria-live="polite">{status}</p>}
          {!persistent && !standalone && <p role="status" aria-live="polite">{boundaryMessage}</p>}
        </div>
        <div className={styles.orb} aria-hidden="true" />
      </section>
      <div className={styles.body}>
        <FocusFieldDesk />
        <section aria-labelledby="moods-title"><div className={styles.sectionHead}><div><span className={styles.smallcaps}>CHOOSE YOUR ATMOSPHERE</span><h2 id="moods-title">Where would you like to go?</h2></div></div>
          <div className={styles.tileGrid}>{moodKeys.map(key=><button type="button" key={key} onClick={()=>selectMood(key)} className={`${styles.tile} ${styles['tile'+key]} ${mood===key?styles.selectedTile:''}`} aria-pressed={mood===key}><span>{journeys[key].label}</span><small>{journeys[key].subtitle}</small></button>)}</div>
        </section>
        {transportReady ? <ReceptiveFieldDesk journey={mood} onSelectJourney={selectMood}
          onPlay={next=>persistent
            ? persistent.playSketch(next,journeys[next].frequencies)
            : Promise.resolve(false)}/> : <section className={styles.panel} aria-live="polite">
          <span className={styles.smallcaps}>PRIVATE LISTENING</span>
          <h2>Preparing your Sound Field</h2>
          <p className={styles.muted}>{boundaryMessage}</p>
        </section>}
        {showJournal&&<section className={styles.panel} aria-labelledby="journal-title"><span className={styles.smallcaps}>PRIVATE · THIS TAB ONLY</span><h2 id="journal-title">What did you notice?</h2><label htmlFor="listen-note">A listening reflection, without MAIA interpretation</label><textarea id="listen-note" rows={3} value={note} onChange={e=>setNote(e.target.value.slice(0,4000))} placeholder="An image, a feeling, or nothing at all…"/><p className={styles.muted}>No server storage, microphone access, or AI analysis. Save an encrypted backup below to keep it privately.</p></section>}
        <section className={styles.panel} aria-labelledby="library-title"><div className={styles.sectionHead}><div><span className={styles.smallcaps}>YOUR MUSIC, YOUR WAY</span><h2 id="library-title">Bring your collections</h2></div><button className={styles.ghost} type="button" onClick={exportShelf}>Export plain JSON ↗</button></div>
          <p className={styles.muted}>Add a playlist link from Spotify, TIDAL, Apple Music, Qobuz or SoundCloud; or import a CSV/M3U list of titles. Soullab does not access streaming accounts or copy recordings.</p>
          <div className={styles.formRow}><label htmlFor="list-name">Collection name <input id="list-name" value={name} maxLength={100} onChange={e=>setName(e.target.value)} placeholder="Existential Bliss"/></label><label htmlFor="list-url">Playlist URL <input id="list-url" value={link} maxLength={2048} onChange={e=>setLink(e.target.value)} placeholder="https://open.spotify.com/playlist/…"/></label><button type="button" className={styles.addButton} onClick={addLink}>Add link</button></div>
          <div className={styles.importRow}><label className={styles.fileLabel} htmlFor="import-playlist">Import CSV / M3U <input id="import-playlist" type="file" accept=".csv,.m3u,.m3u8,text/csv" onChange={e=>{void importFile(e.target.files?.[0]||null);e.currentTarget.value='';}} /></label>
            <label className={styles.fileLabel} htmlFor="restore-shelf">Restore Soullab export <input id="restore-shelf" type="file" accept=".json,application/json" onChange={e=>{void restoreShelf(e.currentTarget.files?.[0]||null);e.currentTarget.value='';}} /></label>
            <span className={styles.muted}>Metadata only · up to 1,000 tracks per collection</span></div>
          <div className={styles.collectionList}>{collections.length?collections.map(c=><article className={styles.collection} key={c.id}><div><strong>{c.name}</strong><small>{c.provider||'User-supplied track list'} · {c.tracks.length} references</small>{c.tracks.length>0&&<span className={styles.trackPreview}>{c.tracks.slice(0,3).map(t=>t.title).join(' · ')}{c.tracks.length>3?'…':''}</span>}</div>{c.link&&<a href={c.link} target="_blank" rel="noopener noreferrer" aria-label={`Open ${c.name} on ${c.provider}`}>Open in {c.provider} ↗</a>}</article>):<p className={styles.empty}>Your collections will appear here. They remain in this tab until you export them.</p>}</div>
          <div className={styles.shelfFoot}><span>Not saved to an account or browser storage. No tracking or hidden synchronization.</span><button className={styles.danger} onClick={clearShelf} type="button">Clear tab data</button></div>
        </section>
        <PrivateBackupDesk collections={collections} journal={note} onRestore={data=>{setCollections(data.collections);setNote(data.journal);setStatus(`Unlocked ${data.collections.length} collections from your private backup.`);}} />
        {transportReady && <LocalAudioDesk audioRef={memberAudioRef} onBegin={stop} />}
        <section className={styles.article} aria-labelledby="rights-title"><span className={styles.smallcaps}>QUALITY & STEWARDSHIP</span><h2 id="rights-title">Sound deserves attention.</h2><p>Real Soullab recordings will have documented master and composition rights, truthful audio-source labels, and optional lossless playback where supported. Until those rights, private storage and recovery safeguards are approved, this review page offers synthesized studies, device-local files and external links only.</p></section>
      </div>
      {!persistent && standalone && <div className={styles.bottomPlayer} role="region" aria-label="Listening controls"><div><span className={styles.playerTitle}>{player.title}</span><span className={styles.playerSub}>Original sound sketch · browser synthesis</span></div><button className={styles.roundControl} type="button" onClick={()=>void toggle()} aria-label={isPlaying?'Pause original sound sketch':'Play original sound sketch'}>{isPlaying?'Ⅱ':'▶'}</button><label htmlFor="listen-volume" className={styles.volumeLabel}>Volume <input id="listen-volume" type="range" min="0" max="100" value={volume} onChange={e=>changeVolume(Number(e.target.value))}/></label><span className={styles.status} role="status" aria-live="polite">{shownStatus}</span></div>}
    </div>
  </main>;
}
