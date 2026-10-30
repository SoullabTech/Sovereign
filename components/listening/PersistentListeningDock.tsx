'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { FocusSession } from '@/lib/listening/focusFieldSession';
import { formatExperienceTime, soundProgress } from '@/lib/listening/soundStudioExperience';
import type { ListeningSnapshot } from './PersistentListeningProvider';
import styles from './persistentListeningDock.module.css';

type Props = {
  snapshot: ListeningSnapshot;
  volume: number;
  displayed: boolean;
  focusSession: FocusSession | null;
  focusRemainingLabel: string;
  onPauseMusic: () => void;
  onResumeMusic: () => void;
  onStopMusic: () => void;
  onVolume: (volume: number) => void;
  onPauseFocus: () => void;
  onResumeFocus: () => void;
  onStopFocus: () => void;
};

const COMPANION_LEVELS = [
  { id: 'under', label: 'Under', value: 12, description: 'Very quiet beneath foreground music' },
  { id: 'soft', label: 'Soft', value: 22, description: 'A gentle companion level' },
  { id: 'present', label: 'Present', value: 35, description: 'Clearly audible without becoming the foreground' },
] as const;
const FADE_DURATION_MS = 12_000;
const FADE_STEPS = 24;

export default function PersistentListeningDock({
  snapshot, volume, displayed, focusSession, focusRemainingLabel,
  onPauseMusic, onResumeMusic, onStopMusic, onVolume,
  onPauseFocus, onResumeFocus, onStopFocus,
}: Props) {
  const [mixOpen, setMixOpen] = useState(false);
  const [companionMode, setCompanionMode] = useState(false);
  const [fading, setFading] = useState(false);
  const lastAudibleVolume = useRef(volume > 0 ? volume : 22);
  const fadeTimer = useRef<number | null>(null);
  const audioDisplayed = snapshot.kind !== 'none' || snapshot.message.startsWith('MAIA is speaking.');
  const focusDisplayed = Boolean(focusSession && (focusSession.status === 'running' || focusSession.status === 'paused'));
  const progress = soundProgress(snapshot.durationMs, snapshot.elapsedMs ?? 0);
  const passage = snapshot.passage || (snapshot.experienceId ? 'Ready' : null);

  useEffect(() => {
    if (volume > 0 && !fading) lastAudibleVolume.current = volume;
  }, [volume, fading]);

  useEffect(() => () => {
    if (fadeTimer.current !== null) window.clearInterval(fadeTimer.current);
  }, []);

  const cancelFade = () => {
    if (fadeTimer.current !== null) {
      window.clearInterval(fadeTimer.current);
      fadeTimer.current = null;
    }
    setFading(false);
  };

  const setFieldVolume = (next: number) => {
    cancelFade();
    if (next > 0) lastAudibleVolume.current = next;
    onVolume(next);
  };

  const stopNow = () => {
    cancelFade();
    onStopMusic();
  };

  const pauseNow = () => {
    cancelFade();
    onPauseMusic();
  };

  const toggleMute = () => {
    if (volume > 0) {
      lastAudibleVolume.current = volume;
      setFieldVolume(0);
      return;
    }
    setFieldVolume(lastAudibleVolume.current || 22);
  };

  const toggleCompanionMode = () => {
    const next = !companionMode;
    setCompanionMode(next);
    setMixOpen(true);
    if (next && (volume === 0 || volume > 28)) setFieldVolume(22);
  };

  const fadeAndStop = () => {
    cancelFade();
    if (volume <= 0) {
      onStopMusic();
      return;
    }
    const restoreVolume = volume;
    let step = 0;
    setFading(true);
    fadeTimer.current = window.setInterval(() => {
      step += 1;
      const remaining = Math.max(0, 1 - step / FADE_STEPS);
      onVolume(Math.round(restoreVolume * remaining));
      if (step < FADE_STEPS) return;
      if (fadeTimer.current !== null) window.clearInterval(fadeTimer.current);
      fadeTimer.current = null;
      onStopMusic();
      onVolume(restoreVolume);
      setFading(false);
    }, FADE_DURATION_MS / FADE_STEPS);
  };

  return (
    <div data-listen10-persistent-dock="true"
      data-listen-companion-mode={companionMode ? 'on' : 'off'}
      role="region" aria-label="Persistent Soullab listening controls"
      className={styles.dock}
      style={{ display: displayed ? 'flex' : 'none' }}>
      {audioDisplayed && (
        <Link className={styles.identity} href="/listen#sound-studio"
          aria-label="Return to Sound Studio">
          <strong data-listen10-title="true">{snapshot.title}</strong>
          <span data-listen10-state="true">
            {snapshot.subtitle || (snapshot.kind === 'local-file'
              ? `${snapshot.fileFormat} file · device local`
              : 'Original sound field')} · {snapshot.playback}
          </span>
        </Link>
      )}

      {audioDisplayed && snapshot.durationMs && (
        <div className={styles.passage} data-listen62-passage={snapshot.passage || ''}>
          <b>{passage}</b>
          <span className={styles.passageProgress} aria-hidden="true"><i style={{ width: `${progress * 100}%` }}/></span>
          <span>{formatExperienceTime(snapshot.elapsedMs ?? 0)} / {formatExperienceTime(snapshot.durationMs)}</span>
        </div>
      )}

      {focusDisplayed && focusSession && (
        <div className={styles.focus} data-focus-field-dock="true">
          <strong>Focus Field · {focusSession.plan.taskLabel || focusSession.plan.task}</strong>
          <div>{focusSession.plan.focusNeed} · {focusSession.plan.musicalWorld} · {focusSession.status} · {focusRemainingLabel}</div>
          <Link href="/listen#focus-field">Open Focus Field</Link>
        </div>
      )}

      <div className={styles.controls}>
        {focusDisplayed && focusSession?.status === 'running' && (
          <button type="button" className={styles.focusControl}
            onClick={onPauseFocus} aria-label="Pause Focus Field session">Pause focus</button>
        )}
        {focusDisplayed && focusSession?.status === 'paused' && (
          <button type="button" className={styles.focusControl}
            onClick={onResumeFocus} aria-label="Resume Focus Field session by member action">Resume focus</button>
        )}
        {focusDisplayed && (
          <button type="button" className={styles.focusControl}
            onClick={onStopFocus} aria-label="Stop Focus Field session">Stop focus</button>
        )}
        {audioDisplayed && snapshot.playback === 'playing' && (
          <button type="button" className={styles.control}
            onClick={pauseNow} aria-label="Pause persistent music">Pause</button>
        )}
        {audioDisplayed && snapshot.playback !== 'playing' && snapshot.kind !== 'none' && (
          <button type="button" className={styles.control}
            onClick={onResumeMusic} aria-label="Resume persistent music">Resume</button>
        )}
        {audioDisplayed && (
          <button type="button" className={styles.stop}
            onClick={stopNow} aria-label="Stop and clear persistent music">Stop</button>
        )}
        {audioDisplayed && (
          <button type="button" className={styles.mixToggle}
            data-listen-companion-toggle="true"
            aria-expanded={mixOpen} aria-controls="soullab-companion-controls"
            aria-label={`${mixOpen ? 'Close' : 'Open'} companion and volume controls`}
            onClick={() => setMixOpen(value => !value)}>
            Mix {Math.round(volume)}%
          </button>
        )}
      </div>

      {audioDisplayed && (
        <label className={styles.volume}>Soullab volume
          <input aria-label="Persistent music volume" type="range" min="0" max="100"
            value={volume} onChange={event => setFieldVolume(Number(event.target.value))}/>
        </label>
      )}
      {audioDisplayed && <Link className={styles.openField} href="/listen#sound-studio">Open field</Link>}
      {audioDisplayed && <span role="status" className={styles.message}>{snapshot.message}</span>}

      {audioDisplayed && mixOpen && (
        <section id="soullab-companion-controls" className={styles.mixPanel}
          data-listen-companion-panel="true" aria-label="Companion listening controls">
          <div className={styles.mixHeader}>
            <div>
              <strong>Soullab field</strong>
              <span>Other music stays in its original app. These controls change only Soullab.</span>
            </div>
            <button type="button" className={styles.companionSwitch}
              data-listen-companion-enable="true" aria-pressed={companionMode}
              onClick={toggleCompanionMode}>
              {companionMode ? 'Companion mode on' : 'Play alongside another app'}
            </button>
          </div>

          <label className={styles.mixVolume}>
            <span>Field volume <output>{Math.round(volume)}%</output></span>
            <input aria-label="Soullab field volume" type="range" min="0" max="100"
              value={volume} onChange={event => setFieldVolume(Number(event.target.value))}/>
          </label>

          <div className={styles.presets} aria-label="Companion volume levels">
            {COMPANION_LEVELS.map(level => (
              <button key={level.id} type="button" className={styles.preset}
                data-listen-companion-preset={level.id}
                aria-pressed={volume === level.value}
                title={level.description}
                onClick={() => setFieldVolume(level.value)}>
                <strong>{level.label}</strong><span>{level.value}%</span>
              </button>
            ))}
            <button type="button" className={styles.preset}
              data-listen-companion-mute="true" aria-pressed={volume === 0}
              onClick={toggleMute}>
              <strong>{volume === 0 ? 'Restore' : 'Mute'}</strong>
              <span>{volume === 0 ? `${lastAudibleVolume.current}%` : '0%'}</span>
            </button>
            <button type="button" className={styles.fade}
              data-listen-companion-fade="true" disabled={fading}
              onClick={fadeAndStop}>
              {fading ? 'Fading…' : 'Fade 12s & stop'}
            </button>
          </div>

          <p className={styles.mixBoundary}>
            Soullab does not read, analyze, pause, or control the other app. MAIA speech still pauses this field and never resumes it automatically.
          </p>
        </section>
      )}
    </div>
  );
}
