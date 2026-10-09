'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { useAtmosphere } from '@/app/writers-studio/atmosphere/StudioAtmosphere';
import { Shell } from '@/app/writers-studio/full-redesign/Shell';
import { HOME_GEOMETRY } from '@/app/writers-studio/full-redesign/tokens';
import type { StudioMode } from '@/app/writers-studio/full-redesign/types';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import { fullPrefaceReading } from '@/lib/writersStudio/listen/fullPrefaceReading';
import {
  createMonoCaptureRoute,
  type InputChannel,
  type MonoCaptureRoute,
} from '@/lib/writersStudio/listen/monoCaptureRoute';
import {
  browserCaptureInfo,
  outputFormatLabel,
  preferredRecorderMime,
  recordingConstraints,
  type BrowserCaptureInfo,
} from '@/lib/writersStudio/listen/browserCaptureInfo';
import styles from './ListenPilot.module.css';

type Source = { state: string; title?: string | null; version?: number; sections?: RebuildSection[] };
const COMPLETE_PREFACE_ID = 'listen:entire-preface';
type Take = {
  id: number;
  blob: Blob;
  url: string;
  filename: string;
  sourceSectionIds: readonly string[];
  sourceVersion: number | null;
  capture: BrowserCaptureInfo;
  inputChannel: InputChannel;
  outputChannels: number;
  durationSeconds: number;
};
function formatDuration(seconds: number): string {
  return Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
}

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
  const [inputChannel, setInputChannel] = useState<InputChannel>(1);
  const [routedOutput, setRoutedOutput] = useState<{ channel: InputChannel; outputChannels: number; rateHz: number } | null>(null);
  const [captureInfo, setCaptureInfo] = useState<BrowserCaptureInfo | null>(null);
  const [inspecting, setInspecting] = useState(false);
  const media = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const monoRouteRef = useRef<MonoCaptureRoute | null>(null);
  const chunks = useRef<Blob[]>([]);
  const takesRef = useRef<Take[]>([]);

  useEffect(() => { takesRef.current = takes; }, [takes]);
  useEffect(() => () => {
    if (media.current?.state === 'recording') media.current.stop();
    stream.current?.getTracks().forEach((t) => t.stop());
    if (monoRouteRef.current) void monoRouteRef.current.close().catch(() => {});
    takesRef.current.forEach((t) => URL.revokeObjectURL(t.url));
  }, []);
  useEffect(() => {
    const protectUnsaved = (event: BeforeUnloadEvent) => {
      if (takesRef.current.length > 0 || media.current?.state === 'recording') {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', protectUnsaved);
    return () => window.removeEventListener('beforeunload', protectUnsaved);
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
        setSectionId(fullPrefaceReading(s.sections) ? COMPLETE_PREFACE_ID : first.draftSectionId);
      } catch (e) { if (live) setError(e instanceof Error ? e.message : 'Unable to read manuscript.'); }
    })();
    return () => { live = false; };
  }, [manuscriptId, params]);

  const section = source?.sections?.find((s) => s.draftSectionId === sectionId);
  const wholePreface = useMemo(
    () => source?.sections ? fullPrefaceReading(source.sections) : null,
    [source],
  );
  const isWholePreface = sectionId === COMPLETE_PREFACE_ID && wholePreface !== null;
  const readingSections = useMemo(
    () => isWholePreface ? [...wholePreface!.sections] : section ? [section] : [],
    [isWholePreface, wholePreface, section],
  );
  const words = readingSections.reduce((total, s) => total + (s.body.match(/\S+/g)?.length ?? 0), 0);
  const selectedTitle = isWholePreface ? 'Preface — complete reading' : (section?.heading || 'passage');
  const changeMode = (mode: StudioMode) => {
    if (recording) return;
    if (takes.length && !window.confirm('Your recordings have not been saved to the server. Download them before leaving Listen. Leave anyway?')) return;
    const next = new URLSearchParams(params?.toString() ?? '');
    next.set('mode', mode);
    router.push('/writers-studio?' + next.toString());
  };
  const refreshMics = async () => {
    if (recording || inspecting) return;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError('A secure browser connection (localhost or HTTPS) is required for microphone inspection.');
      return;
    }
    setInspecting(true);
    let probe: MediaStream | null = null;
    try {
      // Source hardware settings can only be inspected AFTER microphone permission.
      probe = await navigator.mediaDevices.getUserMedia({ audio: recordingConstraints(mic) });
      const track = probe.getAudioTracks()[0];
      setCaptureInfo(browserCaptureInfo(track?.getSettings() ?? {}, preferredRecorderMime()));
      setMics((await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'audioinput'));
      setError('');
    } catch {
      setError('Could not inspect microphone. Check browser permissions and your selected input.');
    } finally {
      probe?.getTracks().forEach((t) => t.stop());
      setInspecting(false);
    }
  };
  const start = async () => {
    if (!readingSections.some((s) => s.body.trim()) || recording || inspecting) return;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Use HTTPS or localhost in a browser with microphone recording.');
      return;
    }
    try {
      const audio = await navigator.mediaDevices.getUserMedia({ audio: recordingConstraints(mic) });
      stream.current = audio;
      chunks.current = [];
      const routed = await createMonoCaptureRoute(audio, inputChannel);
      monoRouteRef.current = routed;
      setRoutedOutput({ channel: routed.inputChannel, outputChannels: routed.outputChannels, rateHz: routed.outputRateHz });
      const mime = preferredRecorderMime();
      const rec = new MediaRecorder(routed.stream, mime ? { mimeType: mime } : undefined);
      media.current = rec;
      const capture = browserCaptureInfo(audio.getAudioTracks()[0]?.getSettings() ?? {}, rec.mimeType);
      setCaptureInfo(capture);
      const title = selectedTitle.replace(/[^a-z0-9_-]+/gi, '-').slice(0, 60);
      const sourceSectionIds = readingSections.map((s) => s.draftSectionId);
      const sourceVersion = source?.version ?? null;
      let recordingStartMs = 0;
      rec.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data); };
      rec.onstop = () => {
        const durationSeconds = Math.max(0, Math.round((Date.now() - recordingStartMs) / 1000));
        audio.getTracks().forEach((t) => t.stop());
        if (monoRouteRef.current === routed) monoRouteRef.current = null;
        void routed.close().catch(() => {});
        stream.current = null;
        media.current = null;
        const blob = new Blob(chunks.current, { type: rec.mimeType || 'audio/webm' });
        if (blob.size) {
          setTakes((old) => [...old, {
            id: Date.now(), blob, url: URL.createObjectURL(blob),
            filename: title + '-v' + (sourceVersion ?? 'unknown') + '-' + Date.now() + (blob.type.includes('mp4') ? '.m4a' : '.webm'),
            sourceSectionIds,
            sourceVersion,
            capture,
            inputChannel: routed.inputChannel,
            outputChannels: routed.outputChannels,
            durationSeconds,
          }]);
        } else setError('No audio captured.');
        setRecording(false);
      };
      rec.onerror = () => setError('Recording error. Stop and try again.');
      rec.start(1000);
      recordingStartMs = Date.now();
      setRecording(true);
      setError('');
      // Do not probe the microphone again while the recording is active.
    } catch (cause) {
      stream.current?.getTracks().forEach((t) => t.stop());
      stream.current = null;
      if (monoRouteRef.current) void monoRouteRef.current.close().catch(() => {});
      monoRouteRef.current = null;
      setRecording(false);
      setError(cause instanceof Error ? cause.message : 'Microphone or mono routing unavailable.');
    }
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
                      {wholePreface && (
                        <button type="button" className={styles.inlineButton}
                          disabled={recording || isWholePreface}
                          onClick={() => setSectionId(COMPLETE_PREFACE_ID)}>
                          {isWholePreface ? 'Full Preface selected' : 'Read full Preface'} <span aria-hidden="true">↗</span>
                        </button>
                      )}
                    </div>
                    <label className={styles.fieldLabel} htmlFor="listen-section">Choose a reading</label>
                    <select id="listen-section" className={styles.select}
                      disabled={recording}
                      value={sectionId}
                      onChange={(e) => setSectionId(e.target.value)}>
                      {wholePreface && (
                        <option value={COMPLETE_PREFACE_ID}>Complete Preface — {wholePreface.sections.length} sections, one reading</option>
                      )}
                      {source.sections.map((s, i) => (
                        <option key={s.draftSectionId} value={s.draftSectionId}>{s.heading || 'Passage ' + (i + 1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.manuscriptBody}>
                    <h2 className={styles.manuscriptHeading}>{selectedTitle}</h2>
                    <article className={styles.manuscriptText} data-reading-scope={isWholePreface ? 'whole-preface' : 'single-section'}>
                      {readingSections.length > 0 ? readingSections.map((part, i) => (
                        <section className={styles.readingSection} key={part.draftSectionId} data-source-section-id={part.draftSectionId}>
                          {isWholePreface && i > 0 && part.heading && (
                            <h3 className={styles.readingSectionHeading}>{part.heading}</h3>
                          )}
                          <div className={styles.readingTextBody}>
                            {part.body || (isWholePreface ? '' : 'This section has no text. Choose another passage above.')}
                          </div>
                        </section>
                      )) : 'Choose a manuscript passage to begin.'}
                    </article>
                  </div>
                  <div className={styles.readingFoot}>
                    {words} words across {readingSections.length} original {readingSections.length === 1 ? 'section' : 'sections'} · {isWholePreface ? 'Scroll continuously through the Preface' : 'Individual passage'} · Source unchanged
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
                    <button type="button" className={styles.secondaryButton} disabled={recording || inspecting} onClick={() => void refreshMics()}>
                      {inspecting ? 'Inspecting microphone…' : 'Check microphone & format'}
                    </button>
                    {!!mics.length && (
                      <>
                        <label htmlFor="listen-mic" className={styles.fieldLabel} style={{ marginTop: 16 }}>Microphone input</label>
                        <select id="listen-mic" className={styles.select} value={mic}
                          disabled={recording || inspecting} onChange={(e) => { setMic(e.target.value); setCaptureInfo(null); }}>
                          <option value="">System default</option>
                          {mics.map((m, i) => <option key={m.deviceId || i} value={m.deviceId}>{m.label || 'Microphone ' + (i + 1)}</option>)}
                        </select>
                      </>
                    )}
                    <div className={styles.channelPicker}>
                      <label htmlFor="listen-input-channel" className={styles.fieldLabel}>Which Scarlett input has your microphone?</label>
                      <select
                        id="listen-input-channel"
                        value={inputChannel}
                        className={styles.select}
                        disabled={recording || inspecting}
                        onChange={(e) => { setInputChannel(Number(e.target.value) as InputChannel); setRoutedOutput(null); }}
                      >
                        <option value={1}>Input 1 (left) — microphone in first jack</option>
                        <option value={2} disabled={captureInfo?.microphoneChannels === 1}>Input 2 (right) — microphone in second jack</option>
                      </select>
                      <p className={styles.channelHelp}>Listen captures the selected physical input as one centered mono channel. Use Input 1 for the microphone used in your first Preface take.</p>
                    </div>
                    <div className={styles.formatPanel} data-capture-format-panel>
                      <h4 className={styles.formatHeading}>Recording specifications</h4>
                      <dl className={styles.formatFacts}>
                        <div><dt>Reported microphone rate</dt><dd>{captureInfo?.microphoneSampleRateHz ? (captureInfo.microphoneSampleRateHz / 1000).toLocaleString() + ' kHz' : 'Not reported yet'}</dd></div>
                        <div><dt>Microphone channels</dt><dd>{captureInfo?.microphoneChannels ?? 'Not reported yet'}</dd></div>
                        <div><dt>Output file</dt><dd>{outputFormatLabel(captureInfo?.outputMimeType ?? preferredRecorderMime())}</dd></div>
                        <div><dt>Output routing</dt><dd>{routedOutput ? 'Input ' + routedOutput.channel + ' → ' + routedOutput.outputChannels + ' channel mono' : 'Input ' + inputChannel + ' → mono when recording'}</dd></div>
                        <div><dt>24-bit PCM WAV</dt><dd>Not available in this pilot</dd></div>
                      </dl>
                      {captureInfo?.microphoneSampleRateHz && captureInfo.microphoneSampleRateHz !== 48000 && (
                        <p className={styles.formatWarning} role="status">
                          Your input is reporting {(captureInfo.microphoneSampleRateHz / 1000).toLocaleString()} kHz, not 48 kHz. Check the interface rate in macOS Audio MIDI Setup, then inspect again.
                        </p>
                      )}
                      {captureInfo?.microphoneChannels && captureInfo.microphoneChannels !== 1 && (
                        <p className={styles.formatInfo}>
                          Your interface exposes {captureInfo.microphoneChannels} physical input channels. The new mono route selects input {inputChannel} and records it centered instead of leaving the opposite speaker silent.
                        </p>
                      )}
                      <p className={styles.formatExplanation}>We request a 48 kHz mono microphone feed with processing off, but your browser and hardware decide the actual input settings. A reported input rate does not make the compressed recording a 24-bit WAV master.</p>
                    </div>
                    <div className={styles.recordControls}>
                      <button type="button" className={styles.primaryButton}
                        disabled={recording || inspecting || !readingSections.some((s) => s.body.trim())} onClick={() => void start()}>●&nbsp; Start recording</button>
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
                        <p className={styles.takeDetail}>Manuscript v{t.sourceVersion ?? 'unknown'} · {t.sourceSectionIds.length} source {t.sourceSectionIds.length === 1 ? 'section' : 'sections'} · {formatDuration(t.durationSeconds)} recorded · Input {t.inputChannel} → {t.outputChannels}-channel mono · {outputFormatLabel(t.capture.outputMimeType)}</p>
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
