'use client';
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { validateLocalAudio } from '@/lib/listening/localAudio';
import { usePersistentListening } from '@/components/listening/PersistentListeningProvider';
import { isMaiaSpeechActive } from '@/lib/listening/maiaSpeechFocus';
import {
  BETWEEN_TIDES_FOUNDER_STUDY, chapterAt, isBetweenTidesFounderAudition,
  listeningTime,
} from '@/lib/listening/founderListeningJourney';
import styles from './listen.module.css';

type LocalSelection = { url: string; name: string; format: string; bytes: number };
type Props = { audioRef: RefObject<HTMLAudioElement | null>; onBegin: () => void };

function FounderChapters({
  fileName, duration, elapsed, onSeek,
}: {
  fileName: string;
  duration: number | null;
  elapsed: number;
  onSeek: (seconds: number) => void;
}) {
  if (!isBetweenTidesFounderAudition(fileName, duration)) return null;
  const active=chapterAt(elapsed);
  return <div className={styles.longformScore} data-listen16-founder-score="true">
    <div className={styles.longformHeading}>
      <span className={styles.smallcaps}>{BETWEEN_TIDES_FOUNDER_STUDY.status}</span>
      <h3>{BETWEEN_TIDES_FOUNDER_STUDY.title}</h3>
      <p>This original study unfolds in five movements. Choose a passage to seek
        privately within the selected file. Seeking never starts the music.</p>
    </div>
    <div className={styles.chapterMap} role="group" aria-label="Between the Tides chapter navigation">
      {BETWEEN_TIDES_FOUNDER_STUDY.chapters.map((chapter,index)=>
        <button type="button" key={chapter.id}
          data-listen16-chapter={chapter.id}
          aria-current={active.id===chapter.id ? 'true' : undefined}
          className={active.id===chapter.id ? styles.activeChapter : styles.chapterItem}
          aria-label={`Seek to ${chapter.label} at ${listeningTime(chapter.startSeconds)}`}
          onClick={()=>onSeek(chapter.startSeconds)}>
          <span className={styles.chapterNumber}>{String(index+1).padStart(2,'0')} · {listeningTime(chapter.startSeconds)}</span>
          <strong>{chapter.label}</strong>
          <span>{chapter.intention}</span>
        </button>)}
    </div>
    <p className={styles.chapterFootnote}>
      This cue sheet is descriptive, not music-rights verification or a source authenticity certificate.
      Your selected recording stays on this device.
    </p>
  </div>;
}

/** Only the member's File object is played. No upload, service worker cache,
 * metadata extraction, account sync, microphone or recording analysis. */
export default function LocalAudioDesk({ audioRef, onBegin }: Props) {
  const persistent = usePersistentListening();
  const [selection, setSelection] = useState<LocalSelection | null>(null);
  const [standaloneDuration, setStandaloneDuration] = useState<number | null>(null);
  const [standaloneElapsed, setStandaloneElapsed] = useState(0);
  const [status, setStatus] = useState('No local audio selected.');
  const objectUrl = useRef<string | null>(null);
  const release = () => {
    audioRef.current?.pause();
    audioRef.current?.removeAttribute('src');
    if (objectUrl.current) { URL.revokeObjectURL(objectUrl.current); objectUrl.current = null; }
  };
  useEffect(() => () => {
    audioRef.current?.pause();
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
  }, [audioRef]);
  const choose = (file: File | null) => {
    if (!file) return;
    const accepted = validateLocalAudio(file);
    if (accepted.allowed === false) { setStatus(accepted.reason); return; }
    release();
    setStandaloneDuration(null);
    setStandaloneElapsed(0);
    const url = URL.createObjectURL(file);
    objectUrl.current = url;
    setSelection({ url, name: accepted.name, format: accepted.label, bytes: file.size });
    setStatus('Ready to play on this device. Choose play; your file never leaves this browser.');
  };
  const clear = () => {
    release(); setSelection(null); setStandaloneDuration(null); setStandaloneElapsed(0);
    setStatus('Local audio removed from this tab.');
  };
  const start = () => {
    if (isMaiaSpeechActive()) {
      audioRef.current?.pause();
      setStatus('MAIA is speaking. Stop or finish MAIA before playing music.');
      return;
    }
    onBegin();
    window.dispatchEvent(new Event('ws-stop-maia-reading'));
    setStatus('Playing your local file only; no upload or recording occurs.');
  };
  // Shared shell is the sole owner of the media File and audio element.
  // The room supplies a picker and controls; returning from navigation never
  // creates another player. Original standalone local player remains below.
  if (persistent) return <section className={styles.panel} aria-labelledby="member-audio-title">
    <span className={styles.smallcaps}>PRIVATE · DEVICE-LOCAL LISTENING</span>
    <h2 id="member-audio-title">Play your own music</h2>
    <p className={styles.muted}>Choose music on this device. The selection stays in browser memory as you move through Soullab. Nothing is uploaded or analyzed.</p>
    <label className={styles.fileLabel} htmlFor="member-audio-file">Choose local audio
      <input id="member-audio-file" type="file" accept=".flac,.wav,.mp3,.m4a,.aac,.ogg,.opus,audio/*"
        onChange={e=>{ const file=e.currentTarget.files?.[0]; if(file){const result=persistent.selectLocalFile(file);setStatus(result.message);} e.currentTarget.value=''; }} />
    </label>
    {persistent.snapshot.kind === 'local-file' && <div className={styles.localAudioCard}>
      <strong>{persistent.snapshot.title}</strong>
      <p className={styles.muted}>{persistent.snapshot.fileFormat} source · actual output format depends on the browser, OS, and connected device</p>
      <button type="button" className={styles.addButton}
        onClick={()=>persistent.snapshot.playback === 'playing' ? persistent.pause() : void persistent.playLocalFile()}>
        {persistent.snapshot.playback === 'playing' ? 'Pause local recording':'Play local recording'}
      </button>
      <button type="button" className={styles.danger} onClick={()=>persistent.removeLocalFile()}>Remove local recording</button>
      <FounderChapters fileName={persistent.snapshot.title}
        duration={persistent.snapshot.durationSeconds}
        elapsed={persistent.snapshot.elapsedSeconds}
        onSeek={seconds=>{ if(!persistent.seekTo(seconds)) setStatus('Wait for the recording to load before seeking.'); }}/>
    </div>}
    <p role="status" aria-live="polite" className={styles.muted}>{status}</p>
  </section>;
  return <section className={styles.panel} aria-labelledby="member-audio-title">
    <span className={styles.smallcaps}>PRIVATE · DEVICE-LOCAL LISTENING</span>
    <div className={styles.sectionHead}><div><h2 id="member-audio-title">Play your own music</h2></div></div>
    <p className={styles.muted}>Choose a recording you already possess or have permission to use. Soullab reads it only in this tab, never uploads it, and cannot play it for other members.</p>
    <div className={styles.importRow}>
      <label className={styles.fileLabel} htmlFor="member-audio-file">Choose local audio
        <input id="member-audio-file" type="file" accept=".flac,.wav,.mp3,.m4a,.aac,.ogg,.opus,audio/*"
          onChange={e => { choose(e.currentTarget.files?.[0] || null); e.currentTarget.value = ''; }} />
      </label>
      <span className={styles.muted}>FLAC · WAV · MP3 · M4A · AAC · Ogg · Opus (up to 512 MB)</span>
    </div>
    {selection && <div className={styles.localAudioCard}>
      <div><strong>{selection.name}</strong><p className={styles.muted}>{selection.format} container · {(selection.bytes / (1024 * 1024)).toFixed(1)} MB · decoding depends on your browser</p></div>
      <audio ref={audioRef} className={styles.nativeAudio} controls preload="metadata" src={selection.url}
        onLoadedMetadata={()=>{const duration=audioRef.current?.duration;
          setStandaloneDuration(duration&&Number.isFinite(duration)&&duration>0 ? duration : null);}}
        onTimeUpdate={()=>setStandaloneElapsed(audioRef.current?.currentTime ?? 0)}
        onPlay={start} onError={() => setStatus('This browser could not decode the selected file. Try a supported format or another browser.')} />
      <button className={styles.danger} type="button" onClick={clear}>Remove local file</button>
      <FounderChapters fileName={selection.name} duration={standaloneDuration}
        elapsed={standaloneElapsed}
        onSeek={seconds=>{if(audioRef.current && standaloneDuration!==null) {
          audioRef.current.currentTime=Math.min(Math.max(seconds,0),standaloneDuration);
          setStandaloneElapsed(audioRef.current.currentTime);
        }}}/>
    </div>}
    <p className={styles.muted} role="status" aria-live="polite">{status}</p>
    <p className={styles.quality}>A FLAC filename is not proof of lossless output. Device routing and resampling remain outside this prototype's control.</p>
  </section>;
}
