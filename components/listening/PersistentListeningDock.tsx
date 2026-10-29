'use client';

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

export default function PersistentListeningDock({
  snapshot, volume, displayed, focusSession, focusRemainingLabel,
  onPauseMusic, onResumeMusic, onStopMusic, onVolume,
  onPauseFocus, onResumeFocus, onStopFocus,
}: Props) {
  const audioDisplayed = snapshot.kind !== 'none' || snapshot.message.startsWith('MAIA is speaking.');
  const focusDisplayed = Boolean(focusSession && (focusSession.status === 'running' || focusSession.status === 'paused'));
  const progress = soundProgress(snapshot.durationMs, snapshot.elapsedMs ?? 0);
  const passage = snapshot.passage || (snapshot.experienceId ? 'Ready' : null);

  return (
    <div data-listen10-persistent-dock="true"
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
            onClick={onPauseMusic} aria-label="Pause persistent music">Pause</button>
        )}
        {audioDisplayed && snapshot.playback !== 'playing' && snapshot.kind !== 'none' && (
          <button type="button" className={styles.control}
            onClick={onResumeMusic} aria-label="Resume persistent music">Resume</button>
        )}
        {audioDisplayed && (
          <button type="button" className={styles.stop}
            onClick={onStopMusic} aria-label="Stop and clear persistent music">Stop</button>
        )}
      </div>

      {audioDisplayed && (
        <label className={styles.volume}>Volume
          <input aria-label="Persistent music volume" type="range" min="0" max="100"
            value={volume} onChange={event => onVolume(Number(event.target.value))}/>
        </label>
      )}
      {audioDisplayed && <Link className={styles.openField} href="/listen#sound-studio">Open field</Link>}
      {audioDisplayed && <span role="status" className={styles.message}>{snapshot.message}</span>}
    </div>
  );
}
