'use client';

import { useState } from 'react';
import { usePersistentListening } from '@/components/listening/PersistentListeningProvider';
import { OPEN_GROUND } from '@/lib/listening/soundStudioExperience';
import styles from './listen.module.css';

// Sound for a Focus session. Deliberately OUTSIDE FocusFieldDesk: the Focus session itself has no media
// authority (LISTEN-48/49). Choosing here starts nothing; Play is a separate member action and goes through
// the one persistent player like every other sound.
type SoundId = 'none' | 'open-ground' | 'deep-focus' | 'creative-flow';
const OPTIONS: ReadonlyArray<{ id: SoundId; label: string; line: string }> = [
  { id: 'none', label: 'No sound', line: 'A silent timer' },
  { id: 'open-ground', label: 'Open Ground', line: 'A sustained tonal world, 6 minutes' },
  { id: 'deep-focus', label: 'Deep focus', line: 'A synthesized study at low volume' },
  { id: 'creative-flow', label: 'Creative flow', line: 'A synthesized study at low volume' },
];
// The same low-volume synthesized studies offered in Lab.
const SKETCHES = {
  'deep-focus': { mood: 'focus' as const, frequencies: [110, 164.81, 220] },
  'creative-flow': { mood: 'create' as const, frequencies: [130.81, 196, 261.63] },
};

export default function FocusSoundPicker() {
  const transport = usePersistentListening();
  const [soundId, setSoundId] = useState<SoundId>('none');
  const [message, setMessage] = useState('');
  const option = OPTIONS.find(item => item.id === soundId) ?? OPTIONS[0];
  const sessionLive = transport?.focusSession?.status === 'running' || transport?.focusSession?.status === 'paused';

  const play = async () => {
    if (!transport || soundId === 'none') return;
    let started = false;
    if (soundId === 'open-ground') {
      if (OPEN_GROUND.manifest) started = await transport.playExperienceMedia(OPEN_GROUND.manifest);
    } else {
      started = await transport.playSketch(SKETCHES[soundId].mood, [...SKETCHES[soundId].frequencies]);
    }
    setMessage(started
      ? 'Sound is playing. Pause and Stop are in the player below; the focus timer is separate.'
      : 'Sound did not start. Another Soullab audio experience may be active, or the media is unavailable.');
  };

  return (
    <section className={styles.focusSound} aria-labelledby="focus-sound-title" data-focus-sound-picker="true">
      <h3 id="focus-sound-title">Sound for this session</h3>
      <div className={styles.focusInlineChoices} role="radiogroup" aria-label="Sound for this session">
        {OPTIONS.map(item => (
          <button key={item.id} type="button" role="radio" aria-checked={soundId === item.id}
            data-focus-sound={item.id}
            className={soundId === item.id ? styles.focusChoiceActive : styles.focusChoice}
            onClick={() => { setSoundId(item.id); setMessage(''); }}>{item.label}</button>
        ))}
      </div>
      <p className={styles.focusExplanation}>{option.line}. Nothing plays until you press Play.</p>
      {soundId !== 'none' && (
        <button type="button" className={styles.play} data-focus-play-sound="true"
          onClick={() => void play()} disabled={!transport}>
          {`▶  Play ${option.label}`}{sessionLive ? '' : ' (no timer running)'}
        </button>
      )}
      {message && <p className={styles.focusStatus} role="status" aria-live="polite">{message}</p>}
    </section>
  );
}
