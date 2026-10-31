'use client';

import { useState } from 'react';
import { usePersistentListening } from '@/components/listening/PersistentListeningProvider';
import { FOCUS_SOUND_OPTIONS, focusSoundLabel } from '@/lib/listening/focusSoundChoices';
import styles from './listen.module.css';

// Sound for a Focus session. Deliberately OUTSIDE FocusFieldDesk: the Focus session itself has no media
// authority (LISTEN-48/49). Choosing here starts nothing; Play is a separate member action (here, or in the
// player bar while a session runs) and goes through the one persistent player like every other sound.
export default function FocusSoundPicker() {
  const transport = usePersistentListening();
  const [message, setMessage] = useState('');
  const soundId = transport?.focusSoundChoice ?? 'none';
  const option = FOCUS_SOUND_OPTIONS.find(item => item.id === soundId) ?? FOCUS_SOUND_OPTIONS[0];
  const sessionLive = transport?.focusSession?.status === 'running' || transport?.focusSession?.status === 'paused';

  const play = async () => {
    if (!transport || soundId === 'none') return;
    const started = await transport.playFocusSound();
    setMessage(started
      ? 'Sound is playing. Pause and Stop are in the player below; the focus timer is separate.'
      : 'Sound did not start. Another Soullab audio experience may be active, or the media is unavailable.');
  };

  return (
    <section className={styles.focusSound} aria-labelledby="focus-sound-title" data-focus-sound-picker="true">
      <h3 id="focus-sound-title">Sound for this session</h3>
      <div className={styles.focusInlineChoices} role="radiogroup" aria-label="Sound for this session">
        {FOCUS_SOUND_OPTIONS.map(item => (
          <button key={item.id} type="button" role="radio" aria-checked={soundId === item.id}
            data-focus-sound={item.id}
            className={soundId === item.id ? styles.focusChoiceActive : styles.focusChoice}
            onClick={() => { transport?.setFocusSoundChoice(item.id); setMessage(''); }}>{item.label}</button>
        ))}
      </div>
      <p className={styles.focusExplanation}>
        {option.line}. Nothing plays until you press Play{sessionLive ? ' — here or in the player bar below' : ''}.
      </p>
      {soundId !== 'none' && (
        <button type="button" className={styles.play} data-focus-play-sound="true"
          onClick={() => void play()} disabled={!transport}>
          {`▶  Play ${focusSoundLabel(soundId)}`}{sessionLive ? '' : ' (no timer running)'}
        </button>
      )}
      {message && <p className={styles.focusStatus} role="status" aria-live="polite">{message}</p>}
    </section>
  );
}
