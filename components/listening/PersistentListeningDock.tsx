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
  looping: boolean;
  loopAvailable: boolean;
  displayed: boolean;
  focusSession: FocusSession | null;
  focusRemainingLabel: string;
  onPauseMusic: () => void;
  onResumeMusic: () => void;
  onStopMusic: () => void;
  onVolume: (volume: number) => void;
  onLooping: (enabled: boolean) => void;
  onCompanionMode?: (enabled: boolean) => void;
  volumeAdjustable?: boolean;
  focusSoundLabel?: string | null;
  onPlayFocusSound?: () => void;
  onPauseFocus: () => void;
  onResumeFocus: () => void;
  onStopFocus: () => void;
};

type SleepAction = 'fade' | 'stop';

const COMPANION_LEVELS = [
  { id: 'under', label: 'Under', value: 12, description: 'Very quiet beneath foreground music' },
  { id: 'soft', label: 'Soft', value: 22, description: 'A gentle companion level' },
  { id: 'present', label: 'Present', value: 35, description: 'Clearly audible without becoming the foreground' },
] as const;
const FADE_DURATION_MS = 12_000;
const FADE_STEPS = 24;

export default function PersistentListeningDock({
  snapshot, volume, looping, loopAvailable, displayed, focusSession, focusRemainingLabel,
  onPauseMusic, onResumeMusic, onStopMusic, onVolume, onLooping, onCompanionMode, volumeAdjustable = true, focusSoundLabel = null, onPlayFocusSound,
  onPauseFocus, onResumeFocus, onStopFocus,
}: Props) {
  const [mixOpen, setMixOpen] = useState(false);
  const [companionMode, setCompanionMode] = useState(false);
  const [fading, setFading] = useState(false);
  // Sleep timer: member-set only, ends in a terminal Stop, never resumes anything.
  const [sleep, setSleep] = useState<{ endsAt: number; label: string; action: SleepAction } | null>(null);
  const [sleepAction, setSleepAction] = useState<SleepAction>('fade');
  const [clockTime, setClockTime] = useState('');
  const [, setTick] = useState(0);
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

  // Always call the latest fade/stop so a timer set long ago never acts on stale state.
  const boundary = useRef<() => void>(() => undefined);
  boundary.current = () => {
    if (!sleep) return;
    const action = sleep.action;
    setSleep(null);
    if (action === 'fade') fadeAndStop(); else stopNow();
  };
  useEffect(() => {
    if (!sleep) return;
    const timer = window.setInterval(() => {
      if (Date.now() >= sleep.endsAt) boundary.current();
      else setTick(value => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sleep]);
  // Stopping or clearing the field ends the timer; it can never restart sound.
  useEffect(() => {
    if (snapshot.kind === 'none' && sleep) setSleep(null);
  }, [snapshot.kind, sleep]);

  const armSleep = (endsAt: number, label: string) => {
    setSleep({ endsAt, label, action: volumeAdjustable ? sleepAction : 'stop' });
  };
  const armSleepMinutes = (minutes: number) =>
    armSleep(Date.now() + minutes * 60_000, `${minutes} minutes`);
  const armSleepClock = () => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(clockTime);
    if (!match) return;
    const target = new Date();
    target.setHours(Number(match[1]), Number(match[2]), 0, 0);
    if (target.getTime() <= Date.now() + 30_000) target.setDate(target.getDate() + 1);
    armSleep(target.getTime(), `${match[1].padStart(2, '0')}:${match[2]}`);
  };
  const sleepRemainingLabel = (endsAt: number) => {
    const seconds = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${String(minutes).padStart(2, '0')}m` : `${minutes}m ${String(seconds % 60).padStart(2, '0')}s`;
  };

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
    onCompanionMode?.(next);
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
      data-listen-continuation={snapshot.continuation ?? 'none'}
      role="region" aria-label="Persistent Soullab listening controls"
      data-dock-expanded={mixOpen ? 'true' : 'false'}
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
          <span>{snapshot.continuation === 'until-stop'
            ? `${formatExperienceTime(snapshot.elapsedMs ?? 0)} · Until Stop`
            : `${formatExperienceTime(snapshot.elapsedMs ?? 0)} / ${formatExperienceTime(snapshot.durationMs)}`}
          </span>
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
        {focusDisplayed && focusSoundLabel && snapshot.kind === 'none' && onPlayFocusSound && (
          <button type="button" className={styles.control} data-focus-dock-play-sound="true"
            onClick={onPlayFocusSound} aria-label={`Play ${focusSoundLabel}`}>▶ {focusSoundLabel}</button>
        )}
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
            aria-label={`${mixOpen ? 'Close' : 'Open'} companion, volume, and loop controls`}
            onClick={() => setMixOpen(value => !value)}>
            {mixOpen ? 'Less' : 'More'}
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
              <strong data-listen-sheet-title="true">{snapshot.title}</strong>
              <span>{snapshot.subtitle}</span>
              <strong>Soullab field</strong>
              <span>Other music stays in its original app. These controls change only Soullab.</span>
            </div>
            <button type="button" className={styles.companionSwitch}
              data-listen-companion-enable="true" aria-pressed={companionMode}
              onClick={toggleCompanionMode}>
              {companionMode ? 'Companion mode on' : 'Play alongside another app'}
            </button>
          </div>

          {volumeAdjustable ? (
            <>
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
            {snapshot.continuation === 'until-stop' && (
              <div className={styles.preset} data-listen-extended-night="true">
                <strong>Core repeats</strong><span>Until Stop</span>
              </div>
            )}
            {loopAvailable && (
              <button type="button" className={styles.preset}
                data-listen-companion-loop="true" aria-pressed={looping}
                onClick={() => onLooping(!looping)}>
                <strong>{looping ? 'Loop on' : 'Loop piece'}</strong>
                <span>{looping ? 'Repeats' : 'Once'}</span>
              </button>
            )}
            <button type="button" className={styles.fade}
              data-listen-companion-fade="true" disabled={fading}
              onClick={fadeAndStop}>
              {fading ? 'Fading…' : 'Fade 12s & stop'}
            </button>
          </div>
            </>
          ) : (
            <p className={styles.mixBoundary} data-listen-volume-fixed="true">
              This device sets the level of this sound: use your phone's volume buttons. Soullab cannot change it, so there is no volume slider or fade here.
            </p>
          )}

          <div className={styles.sleepTimer} data-listen-sleep-timer="true" role="group" aria-label="Sleep timer">
            <div className={styles.sleepHead}>
              <strong>Sleep timer</strong>
              <span>{sleep
                ? `${sleep.action === 'fade' ? 'Fade begins' : 'Stops'} in ${sleepRemainingLabel(sleep.endsAt)} · ${sleep.label}`
                : 'Until I Stop — nothing ends this field but you.'}</span>
            </div>
            <div className={styles.presets}>
              {[15, 30, 60, 90].map(minutes => (
                <button key={minutes} type="button" className={styles.preset}
                  data-listen-sleep-minutes={minutes}
                  aria-pressed={sleep?.label === `${minutes} minutes`}
                  onClick={() => armSleepMinutes(minutes)}>
                  <strong>{minutes} min</strong>
                </button>
              ))}
              <button type="button" className={styles.preset} data-listen-sleep-off="true"
                aria-pressed={!sleep} onClick={() => setSleep(null)}>
                <strong>Until I Stop</strong>
              </button>
            </div>
            <div className={styles.sleepClock}>
              <label>At a clock time
                <input type="time" value={clockTime} onChange={event => setClockTime(event.target.value)} />
              </label>
              <button type="button" className={styles.preset} onClick={armSleepClock} disabled={!clockTime}>
                <strong>Set</strong>
              </button>
            </div>
            {volumeAdjustable && <div className={styles.presets} role="radiogroup" aria-label="When the timer ends">
              <button type="button" role="radio" aria-checked={sleepAction === 'fade'} className={styles.preset}
                onClick={() => { setSleepAction('fade'); setSleep(current => current ? { ...current, action: 'fade' } : current); }}>
                <strong>Fade 12 seconds, then Stop</strong>
              </button>
              <button type="button" role="radio" aria-checked={sleepAction === 'stop'} className={styles.preset}
                onClick={() => { setSleepAction('stop'); setSleep(current => current ? { ...current, action: 'stop' } : current); }}>
                <strong>Stop immediately</strong>
              </button>
            </div>}
            <p className={styles.mixBoundary}>
              The timer ends in Stop and nothing else. It plays no guidance, never starts a Dawn Return, and never resumes sound after an interruption. Changing it takes your action.
            </p>
          </div>

          <p className={styles.mixBoundary}>
            {snapshot.continuation === 'until-stop'
              ? 'Extended Night repeats only the continuous music core after Nicole and the descent have ended. Stop clears all continuation. MAIA speech pauses the field and never resumes it automatically.'
              : 'Soullab does not read, analyze, pause, or control the other app. Loop repeats only this exact permitted piece after it ends; Stop clears looping. MAIA speech still pauses this field and never resumes it automatically.'}
          </p>
        </section>
      )}
    </div>
  );
}
