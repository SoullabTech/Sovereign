'use client';

import Link from 'next/link';
import { usePersistentListening } from '@/components/listening/PersistentListeningProvider';
import {
  NIGHT_GROUND_EXTENDED_NIGHT,
  OPEN_GROUND,
  SOUND_STUDIO_WORKS,
  formatExperienceTime,
} from '@/lib/listening/soundStudioExperience';
import styles from './listen.module.css';

export type StudioView = 'now' | 'focus' | 'fields' | 'shelf' | 'studio' | 'lab';
export type StudioNavigate = (view: StudioView, workId?: string) => void;

// SOUND-STUDIO-UIUX-02 · Now: the daily entrance. Two deliberate actions reach
// sound from here (choose a support, then Begin). Nothing starts on arrival and
// nothing is remembered: "Continue" reflects only the session the member
// already holds in the single persistent player.
const SUPPORTS: ReadonlyArray<{ id: string; title: string; line: string; view: StudioView; workId?: string }> = [
  { id: 'focus', title: 'Focus', line: 'Steady support while you work', view: 'focus' },
  { id: 'rest', title: 'Rest & Sleep', line: 'Night Ground, held through the night', view: 'fields', workId: NIGHT_GROUND_EXTENDED_NIGHT.id },
  { id: 'journey', title: 'Journey', line: 'Longer fields to travel in', view: 'fields' },
  { id: 'listen', title: 'Listen', line: 'Simply be with sound', view: 'fields', workId: OPEN_GROUND.id },
];

export default function SoundStudioNow({ onNavigate }: { onNavigate: StudioNavigate }) {
  const transport = usePersistentListening();
  const snapshot = transport?.snapshot;
  const held = snapshot?.experienceId
    ? SOUND_STUDIO_WORKS.find(work => work.id === snapshot.experienceId)
    : undefined;

  return (
    <section className={styles.nowField} aria-labelledby="now-title" data-sound-studio-now="true">
      <header>
        <span className={styles.smallcaps}>SOULLAB SOUND STUDIO</span>
        <h2 id="now-title">What would support you now?</h2>
        <p>Sound begins only when you choose. Stop is always one tap away.</p>
      </header>

      {held && (
        <button type="button" className={styles.nowContinue}
          onClick={() => onNavigate('fields', held.id)}
          data-sound-studio-continue={held.id}>
          <span>Continue</span>
          <strong>{held.title}</strong>
          <small>
            {snapshot?.playback === 'playing' ? 'Playing' : 'Paused'}
            {snapshot?.passage ? ` · ${snapshot.passage}` : ''}
            {snapshot?.elapsedMs ? ` · ${formatExperienceTime(snapshot.elapsedMs)}` : ''}
          </small>
        </button>
      )}

      <div className={styles.nowSupports} role="group" aria-label="Ways to begin">
        {SUPPORTS.map(item => (
          <button key={item.id} type="button" className={styles.nowSupport}
            data-sound-studio-support={item.id}
            onClick={() => onNavigate(item.view, item.workId)}>
            <strong>{item.title}</strong>
            <span>{item.line}</span>
          </button>
        ))}
      </div>

      <div className={styles.nowMore}>
        <button type="button" onClick={() => onNavigate('fields')}>Browse all fields</button>
        <button type="button" onClick={() => onNavigate('shelf')}>Open my Shelf</button>
        <Link href="/maia">Ask MAIA</Link>
      </div>
    </section>
  );
}
