'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { useAtmosphere } from '@/app/writers-studio/atmosphere/StudioAtmosphere';
import { Shell } from '@/app/writers-studio/full-redesign/Shell';
import { HOME_GEOMETRY } from '@/app/writers-studio/full-redesign/tokens';
import type { StudioMode } from '@/app/writers-studio/full-redesign/types';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import styles from './ListenPilot.module.css';

type Source = { state: string; title?: string | null; version?: number; sections?: RebuildSection[] };
type Take = { id: number; blob: Blob; url: string; filename: string };

export default function ListenPilot() {
  const params = useSearchParams();
  const router = useRouter();
  const { id: appearance } = useAtmosphere();
  const manuscriptId = params?.get('m') || '';
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
    stream.current?.getTracks().forEach((t) => t.stop());
    takesRef.current.forEach((t) => URL.revokeObjectURL(t.url));
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
        const requested = params?.get('section') || params?.get('s');
        const first = s.sections.find((x) => x.draftSectionId === requested)
          || s.sections.find((x) => /^preface$/i.test(x.heading?.trim() || ''))
          || s.sections[0]!;
        setSource(s);
        setSectionId(first.draftSectionId);
      } catch (e) { if (live) setError(e instanceof Error ? e.message : 'Unable to read manuscript.'); }
    })();
    return () => { live = false; };
  }, [manuscriptId, params]);

  const section = source?.sections?.find((s) => s.draftSectionId === sectionId);
  const preface = source?.sections?.find((s) => /^preface$/i.test(s.heading?.trim() || ''));
  const words = section?.body ? (section.body.match(/\S+/g)?.length ?? 0) : 0;
  const changeMode = (mode: StudioMode) => {
    if (recording) return;
    if (takes.length && !window.confirm('Your recordings have not been saved to the server. Download them before leaving Listen. Leave anyway?')) return;
    const next = new URLSearchParams(params?.toString() ?? '');
    next.set('mode', mode);
    router.push('/writers-studio?' + next.toString());
  };
  const refreshMics = async () => {
    try { setMics((await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'audioinput')); }
    catch { setError('Could not list microphones.'); }
  };
  const start = async () => {
    if (!section?.body || recording) return;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Use HTTPS or localhost in a browser with microphone recording.');
      return;
    }
    try {
      const audio = await navigator.mediaDevices.getUserMedia({ audio: mic ? { deviceId: { ideal: mic } } : true });
      stream.current = audio;
      chunks.current = [];
      const mime = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find((t) => MediaRecorder.isTypeSupported(t));
      const rec = new MediaRecorder(audio, mime ? { mimeType: mime } : undefined);
      media.current = rec;
      const title = (section.heading || 'passage').replace(/[^a-z0-9_-]+/gi, '-').slice(0, 60);
      rec.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data); };
      rec.onstop = () => {
        audio.getTracks().forEach((t) => t.stop());
        stream.current = null;
        media.current = null;
        const blob = new Blob(chunks.current, { type: rec.mimeType || 'audio/webm' });
        if (blob.size) {
          setTakes((old) => [...old, {
            id: Date.now(), blob, url: URL.createObjectURL(blob),
            filename: title + (blob.type.includes('mp4') ? '.m4a' : '.webm'),
          }]);
        } else setError('No audio captured.');
        setRecording(false);
      };
      rec.onerror = () => setError('Recording error. Stop and try again.');
      rec.start(1000);
      setRecording(true);
      setError('');
      void refreshMics();
    } catch { setError('Microphone unavailable or permission denied.'); }
  };
  const download = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
  };

  return (
    <Shell
      mode="write"
      appearance={appearance}
      geometry={HOME_GEOMETRY}
      memberInitial=""
      workTitle={source?.title ?? undefined}
      onSelectMode={changeMode}
      work={
        <div data-listening-studio-pilot className={styles.room}>
          <div className={styles.inner}>
            <div className={styles.header}>
              <div className={styles.headerContent}>
                <div className={styles.kicker}>Soullab Press <span aria-hidden="true">/</span> Author Voice Studio</div>
                <h1 className={styles.title}>Bring your manuscript to life.</h1>
                <p className={styles.description}>
                  A quiet place to read, record, and listen to your words. Your writing stays untouched.
                  Take your time with the voice that only you can give it.
                </p>
              </div>
              <div className={styles.statusTag}><span className={styles.statusDot} aria-hidden="true" /> Private recording pilot</div>
            </div>

            {error && <div role="alert" className={styles.alert}>{error}</div>}
            {!source && !error && <p role="status" className={styles.loading}>Opening your manuscript…</p>}

            {source?.sections && (
              <div className={styles.grid}>
                <section className={[styles.card, styles.readingCard].join(' ')} aria-label="Manuscript reading">
                  <div className={styles.readingHead}>
                    <div className={styles.readingTop}>
                      <div className={styles.eyebrow}>Your manuscript · Version {source.version ?? 'current'} · Read only</div>
                      {preface && (
                        <button type="button" className={styles.inlineButton}
                          disabled={recording || preface.draftSectionId === sectionId}
                          onClick={() => setSectionId(preface.draftSectionId)}>
                          Begin with Preface <span aria-hidden="true">↗</span>
                        </button>
                      )}
                    </div>
                    <label className={styles.fieldLabel} htmlFor="listen-section">Choose a passage</label>
                    <select id="listen-section" className={styles.select}
                      disabled={recording}
                      value={sectionId}
                      onChange={(e) => setSectionId(e.target.value)}>
                      {source.sections.map((s, i) => (
                        <option key={s.draftSectionId} value={s.draftSectionId}>{s.heading || 'Passage ' + (i + 1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.manuscriptBody}>
                    <h2 className={styles.manuscriptHeading}>{section?.heading || 'Manuscript passage'}</h2>
                    <article className={styles.manuscriptText}>
                      {section?.body || 'This section has no text. Choose another passage above.'}
                    </article>
                  </div>
                  <div className={styles.readingFoot}>
                    {words} words in this section · The source manuscript cannot be changed here
                  </div>
                </section>

                <section className={[styles.card, styles.recordingCard].join(' ')} aria-label="Recording controls">
                  <div className={styles.recordHeader}>
                    <div className={styles.micMark} aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="2.5" width="6" height="12" rx="3" />
                        <path d="M5.5 10.5a6.5 6.5 0 0 0 13 0M12 17v4m-4 0h8" />
                      </svg>
                    </div>
                    <div>
                      <h2 className={styles.recordHeading}>Record my voice</h2>
                      <p className={styles.recordLede}>Speak naturally. Keep the breaths and pauses that belong to the story.</p>
                    </div>
                  </div>
                  <div className={styles.recordBlock}>
                    <h3 className={styles.blockTitle}>1. Prepare</h3>
                    <button type="button" className={styles.secondaryButton} onClick={() => void refreshMics()}>Check microphones</button>
                    {!!mics.length && (
                      <>
                        <label htmlFor="listen-mic" className={styles.fieldLabel} style={{ marginTop: 16 }}>Microphone input</label>
                        <select id="listen-mic" className={styles.select} value={mic}
                          disabled={recording} onChange={(e) => setMic(e.target.value)}>
                          <option value="">System default</option>
                          {mics.map((m, i) => <option key={m.deviceId || i} value={m.deviceId}>{m.label || 'Microphone ' + (i + 1)}</option>)}
                        </select>
                      </>
                    )}
                    <div className={styles.recordControls}>
                      <button type="button" className={styles.primaryButton}
                        disabled={recording || !section?.body} onClick={() => void start()}>●&nbsp; Start recording</button>
                      <button type="button" className={styles.stopButton}
                        disabled={!recording} onClick={() => media.current?.stop()}>■&nbsp; Stop &amp; keep take</button>
                    </div>
                    <p className={styles.recordStatus} data-recording={recording ? 'true' : 'false'} role="status">
                      <span className={styles.recordStatusDot} aria-hidden="true" />
                      {recording ? 'Recording in progress — microphone active' : 'Ready when you are'}
                    </p>
                  </div>
                  <div className={styles.recordBlock}>
                    <h3 className={styles.blockTitle}>2. Listen to your takes</h3>
                    {takes.length === 0 && <div className={styles.empty}>Your recordings will appear here after you stop a take.</div>}
                    {takes.map((t) => (
                      <div key={t.id} className={styles.take}>
                        <strong>{t.filename}</strong>
                        <audio controls src={t.url} className={styles.audio} aria-label={'Listen to ' + t.filename} />
                        <div className={styles.takeActions}>
                          <button type="button" className={styles.secondaryButton} onClick={() => download(t.url, t.filename)}>Download original</button>
                          <button type="button" className={styles.quietButton} onClick={() => {
                            URL.revokeObjectURL(t.url);
                            setTakes((old) => old.filter((x) => x !== t));
                          }}>Discard</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.recordBlock}>
                    <h3 className={styles.blockTitle}>3. Make a note</h3>
                    <label className={styles.fieldLabel} htmlFor="listen-notes">How did this passage feel aloud?</label>
                    <textarea id="listen-notes" className={styles.textarea} value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4} placeholder="Where did the words need more space? What would you keep?" />
                    <button type="button" className={styles.secondaryButton} disabled={!notes.trim()}
                      onClick={() => {
                        const url = URL.createObjectURL(new Blob([notes], { type: 'text/plain' }));
                        download(url, 'performance-notes.txt');
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                      }}>Download notes</button>
                  </div>
                  <div className={styles.privacy}>
                    <span className={styles.privacySymbol} aria-hidden="true">◇</span>
                    <div><strong>Your voice stays in your hands.</strong> This pilot keeps recordings in this browser session only. Download each raw take before leaving. Descript transfer and persistent storage are not enabled.</div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      }
    />
  );
}
