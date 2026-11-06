'use client';

import { useEffect, useState } from 'react';
import { usePersistentListening } from '@/components/listening/PersistentListeningProvider';
import { suggestFocusWorlds } from '@/lib/listening/focusFieldGuide';
import { FOCUS_TIME_DISPLAYS, focusTimeLabel } from '@/lib/listening/focusTimeDisplay';
import type { FocusTimeDisplay } from '@/lib/listening/focusTimeDisplay';
import { focusDurationMs, focusElapsedMs } from '@/lib/listening/focusFieldSession';
import styles from './listen.module.css';

// ADHD support: a member-opened section of Focus. It offers ways Focus can behave when starting,
// keeping track of time, finishing and coming back are hard. It never diagnoses, screens, scores,
// infers or remembers anything about the member, and it is not a mode, a badge or a profile.
// Like FocusSoundPicker it sits beside FocusFieldDesk, which stays audio-free; every action here is the
// member's own tap and starts no sound.

const TIME_LABELS: Record<FocusTimeDisplay, { label: string; line: string }> = {
  countdown: { label: 'Countdown', line: 'Minutes and seconds remaining' },
  gentle: { label: 'Gentle', line: 'Early, middle, nearly there' },
  none: { label: 'Nothing', line: 'No time on screen' },
};

export default function FocusAdhdSupport() {
  const transport = usePersistentListening();
  const [quiet, setQuiet] = useState(false);
  const [message, setMessage] = useState('');
  const session = transport?.focusSession ?? null;
  const running = session?.status === 'running';
  const paused = session?.status === 'paused';
  const completed = session?.status === 'completed';

  // Quiet screen: fewer ornaments and no motion while Focus is open. Stop and Pause stay.
  useEffect(() => {
    if (quiet) document.body.setAttribute('data-quiet-ui', '1');
    else document.body.removeAttribute('data-quiet-ui');
    return () => document.body.removeAttribute('data-quiet-ui');
  }, [quiet]);

  const startWithSuggestion = () => {
    if (!transport) { setMessage('A verified private Listening session is required.'); return; }
    const task = 'open-work' as const;
    const focusNeed = 'arrive' as const;
    const stimulation = 'low' as const;
    const started = transport.startFocusSession({
      task, taskLabel: '', focusNeed, stimulation,
      musicalWorld: suggestFocusWorlds({ task, focusNeed, stimulation }).primary,
      duration: { mode: 'custom', minutes: 10 }, entryMode: 'guide-me',
    });
    setMessage(started
      ? 'A 10-minute session has started. No sound plays unless you choose it. You can keep going afterwards.'
      : 'A session is already running. Stop or finish it first.');
  };

  const fiveMore = () => {
    if (!transport || !session || !completed) return;
    const plan = session.plan;
    const started = transport.startFocusSession({
      task: plan.task, taskLabel: plan.taskLabel, focusNeed: plan.focusNeed,
      musicalWorld: plan.musicalWorld, stimulation: plan.stimulation,
      duration: { mode: 'custom', minutes: 5 }, entryMode: plan.entryMode,
    });
    setMessage(started ? 'Five more minutes, started by you.' : 'Could not start another session.');
  };

  const comeBack = () => {
    if (transport?.resumeFocusSession()) setMessage('You are back. Nothing resumed until you chose to.');
  };

  const position = transport && session
    ? focusTimeLabel(transport.focusTimeDisplay === 'countdown' ? 'gentle' : transport.focusTimeDisplay, {
        elapsedMs: focusElapsedMs(session, new Date(transport.focusClockMs)),
        totalMs: focusDurationMs(session.plan.duration), countdownLabel: '',
      })
    : '';

  return (
    <section className={styles.focusAdhd} aria-labelledby="focus-adhd-title" data-adhd-section="true">
      <details>
        <summary id="focus-adhd-title">ADHD support</summary>
        <p className={styles.focusExplanation}>
          For when starting, keeping track of time, finishing or coming back is hard. These are choices about how
          Focus behaves. You do not have to say anything about yourself to use them.
        </p>

        <div className={styles.adhdBlock}>
          <h3>Starting is hard</h3>
          <button type="button" className={styles.play} data-adhd-start="true"
            onClick={startWithSuggestion} disabled={!transport || running || paused}>
            Start a 10-minute session with a suggestion
          </button>
          <p className={styles.focusExplanation}>One tap. It starts a quiet timer only; you can keep going or stop.</p>
        </div>

        <div className={styles.adhdBlock}>
          <h3>Keeping track of time</h3>
          <div className={styles.focusInlineChoices} role="radiogroup" aria-label="How Focus shows time">
            {FOCUS_TIME_DISPLAYS.map(mode => (
              <button key={mode} type="button" role="radio" data-adhd-time={mode}
                aria-checked={transport?.focusTimeDisplay === mode}
                className={transport?.focusTimeDisplay === mode ? styles.focusChoiceActive : styles.focusChoice}
                onClick={() => transport?.setFocusTimeDisplay(mode)}>{TIME_LABELS[mode].label}</button>
            ))}
          </div>
          <p className={styles.focusExplanation}>
            {transport ? TIME_LABELS[transport.focusTimeDisplay].line : TIME_LABELS.countdown.line}.
            {running && position ? <> <strong data-adhd-position="true">{position}</strong></> : null}
          </p>
        </div>

        {paused && session && (
          <div className={styles.adhdBlock}>
            <h3>Coming back</h3>
            <p className={styles.focusExplanation}>
              You were on: {session.plan.taskLabel || session.plan.task}. Nothing resumes by itself.
            </p>
            <button type="button" className={styles.play} data-adhd-come-back="true" onClick={comeBack}>Come back</button>
          </div>
        )}

        {completed && session && (
          <div className={styles.adhdBlock}>
            <h3>Finishing</h3>
            <p className={styles.focusExplanation}>This session is complete. It will not continue unless you ask.</p>
            <button type="button" className={styles.secondary} data-adhd-five-more="true" onClick={fiveMore}>
              Five more minutes
            </button>
          </div>
        )}

        <div className={styles.adhdBlock}>
          <h3>A quieter screen</h3>
          <button type="button" role="switch" aria-checked={quiet} data-adhd-quiet="true"
            className={quiet ? styles.focusChoiceActive : styles.focusChoice}
            onClick={() => setQuiet(value => !value)}>
            {quiet ? 'Quiet screen on' : 'Quiet screen off'}
          </button>
          <p className={styles.focusExplanation}>Fewer decorations and no motion. Pause and Stop stay where they are.</p>
        </div>

        {message && <p className={styles.focusStatus} role="status" aria-live="polite">{message}</p>}
        <p className={styles.focusBoundaryNote}>
          This is not a diagnosis, a screening or a treatment, and nothing here is scored or remembered beyond this session.
        </p>
      </details>
    </section>
  );
}
