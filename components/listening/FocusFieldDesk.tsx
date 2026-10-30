'use client';

import { useMemo, useState } from 'react';
import {
  FOCUS_FEEDBACK_TAGS,
  FOCUS_MUSICAL_WORLDS,
  FOCUS_NEEDS,
  FOCUS_PRESET_MINUTES,
  FOCUS_STIMULATION_LEVELS,
  FOCUS_TASK_KINDS,
  focusRemainingMs,
  type FocusDuration,
  type FocusFeedbackOutcome,
  type FocusFeedbackTag,
  type FocusMusicalWorld,
  type FocusNeed,
  type FocusStimulation,
  type FocusTaskKind,
} from '@/lib/listening/focusFieldSession';
import { suggestFocusWorlds } from '@/lib/listening/focusFieldGuide';
import { usePersistentListening } from './PersistentListeningProvider';
import styles from '@/app/listen/listen.module.css';

const TASK_LABELS: Record<FocusTaskKind, string> = {
  writing: 'Writing', reading: 'Reading', coding: 'Coding', studying: 'Studying',
  administration: 'Administration', 'creative-work': 'Creative work',
  thinking: 'Thinking', 'open-work': 'Open work session',
};
const NEED_LABELS: Record<FocusNeed, string> = {
  arrive: 'Arrive', steady: 'Steady', deep: 'Deep', activate: 'Activate',
  create: 'Create', reset: 'Reset',
};
const NEED_LINES: Record<FocusNeed, string> = {
  arrive: 'Settle sensory noise and begin without pressure.',
  steady: 'Moderate, consistent support for sustained ordinary work.',
  deep: 'Long, restrained attention for reading, writing, analysis or code.',
  activate: 'More pulse and movement when quiet sound leaves you wandering.',
  create: 'Spacious, associative movement for generative work.',
  reset: 'A short clearing interval between periods of effort.',
};
const WORLD_LABELS: Record<FocusMusicalWorld, string> = {
  classical: 'Classical', ambient: 'Ambient', cinematic: 'Cinematic',
  electronic: 'Downtempo / electronic', organic: 'Organic / acoustic',
  nature: 'Nature-integrated', rhythmic: 'Rhythmic / percussive',
};
const STIMULATION_LABELS: Record<FocusStimulation, string> = {
  low: 'Low', medium: 'Medium', high: 'High',
};
const FEEDBACK_LABELS: Record<FocusFeedbackTag, string> = {
  'needed-more-energy': 'Needed more energy',
  'needed-less-movement': 'Needed less movement',
  'music-too-noticeable': 'Music became too noticeable',
  'style-worked-well': 'This style worked well',
  'session-too-short': 'Session felt too short',
  'session-too-long': 'Session felt too long',
};

function formatClock(milliseconds: number | null): string {
  if (milliseconds === null) return 'Untimed';
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function FocusFieldDesk() {
  const transport = usePersistentListening();
  const [entryMode, setEntryMode] = useState<'guide-me' | 'browse'>('guide-me');
  const [task, setTask] = useState<FocusTaskKind>('writing');
  const [taskLabel, setTaskLabel] = useState('');
  const [focusNeed, setFocusNeed] = useState<FocusNeed>('deep');
  const [musicalWorld, setMusicalWorld] = useState<FocusMusicalWorld>('ambient');
  const [stimulation, setStimulation] = useState<FocusStimulation>('medium');
  const [durationMode, setDurationMode] = useState<'preset' | 'custom' | 'untimed'>('preset');
  const [presetMinutes, setPresetMinutes] = useState<25 | 50 | 90>(50);
  const [customMinutes, setCustomMinutes] = useState(45);
  const [feedbackTags, setFeedbackTags] = useState<FocusFeedbackTag[]>([]);
  const [message, setMessage] = useState(
    'Choose a session. This review starts a private in-memory clock; rights-cleared focus channels are the next gate.',
  );

  const guide = useMemo(
    () => suggestFocusWorlds({ task, focusNeed, stimulation }),
    [task, focusNeed, stimulation],
  );
  const chooseEntryMode = (mode: 'guide-me' | 'browse') => {
    setEntryMode(mode);
    if (mode === 'guide-me') setMusicalWorld(guide.primary);
  };
  const chooseTask = (next: FocusTaskKind) => {
    setTask(next);
    if (entryMode === 'guide-me')
      setMusicalWorld(suggestFocusWorlds({ task: next, focusNeed, stimulation }).primary);
  };
  const chooseFocusNeed = (next: FocusNeed) => {
    setFocusNeed(next);
    if (entryMode === 'guide-me')
      setMusicalWorld(suggestFocusWorlds({ task, focusNeed: next, stimulation }).primary);
  };
  const chooseStimulation = (next: FocusStimulation) => {
    setStimulation(next);
    if (entryMode === 'guide-me')
      setMusicalWorld(suggestFocusWorlds({ task, focusNeed, stimulation: next }).primary);
  };
  const session = transport?.focusSession ?? null;
  const remaining = session && transport
    ? focusRemainingMs(session, new Date(transport.focusClockMs))
    : null;
  const sessionActive = session?.status === 'running' || session?.status === 'paused';
  const sessionTerminal = session?.status === 'completed' || session?.status === 'stopped';

  const duration: FocusDuration = durationMode === 'untimed'
    ? { mode: 'untimed', minutes: null }
    : durationMode === 'custom'
      ? { mode: 'custom', minutes: customMinutes }
      : { mode: 'preset', minutes: presetMinutes };

  const start = () => {
    if (!transport) {
      setMessage('Focus Field requires a verified private Listening session.');
      return;
    }
    const started = transport.startFocusSession({
      task,
      taskLabel,
      focusNeed,
      musicalWorld,
      stimulation,
      duration,
      entryMode,
    });
    setMessage(started
      ? 'Focus session started. Music never starts automatically; choose an admitted field separately.'
      : 'Stop or finish the current focus session before starting another.');
  };

  const retune = (next: Partial<{
    focusNeed: FocusNeed;
    musicalWorld: FocusMusicalWorld;
    stimulation: FocusStimulation;
  }>) => {
    if (!transport?.retuneFocusSession(next)) return;
    if (next.focusNeed) setFocusNeed(next.focusNeed);
    if (next.musicalWorld) setMusicalWorld(next.musicalWorld);
    if (next.stimulation) setStimulation(next.stimulation);
    setMessage('The session changed without resetting its clock or task.');
  };

  const toggleFeedbackTag = (tag: FocusFeedbackTag) => {
    setFeedbackTags(current => current.includes(tag)
      ? current.filter(value => value !== tag)
      : current.length < 4 ? [...current, tag] : current);
  };
  const recordFeedback = (outcome: FocusFeedbackOutcome) => {
    if (!transport?.recordFocusFeedback(outcome, feedbackTags)) return;
    setMessage('Private session feedback recorded in memory only. It is not MAIA memory or a productivity score.');
  };

  return (
    <section id="focus-field" className={styles.focusField} aria-labelledby="focus-field-title">
      <div className={styles.sectionHead}>
        <div>
          <span className={styles.smallcaps}>FOCUS FIELD · REVIEW FOUNDATION</span>
          <h2 id="focus-field-title">What kind of attention do you need?</h2>
        </div>
        <span className={styles.focusPrivacy}>No work inspection · no productivity score</span>
      </div>
      <p className={styles.muted}>
        Focus need and musical taste stay separate. Choose what supports this session today—nothing here assigns you a fixed attention type.
      </p>

      {!sessionActive && !sessionTerminal && (
        <>
          <div className={styles.focusForm}>
            <fieldset className={styles.focusFieldset}>
              <legend>What are you doing?</legend>
              <div className={styles.focusChoiceGrid}>
                {FOCUS_TASK_KINDS.map(value => (
                  <button key={value} type="button" aria-pressed={task === value}
                    className={task === value ? styles.focusChoiceActive : styles.focusChoice}
                    onClick={() => chooseTask(value)}>{TASK_LABELS[value]}</button>
                ))}
              </div>
            </fieldset>

            <fieldset className={styles.focusFieldset}>
              <legend>What support would help?</legend>
              <div className={styles.focusNeedGrid}>
                {FOCUS_NEEDS.map(value => (
                  <button key={value} type="button" aria-pressed={focusNeed === value}
                    className={focusNeed === value ? styles.focusNeedActive : styles.focusNeed}
                    onClick={() => chooseFocusNeed(value)}>
                    <strong>{NEED_LABELS[value]}</strong><span>{NEED_LINES[value]}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className={styles.focusFieldset}>
              <legend>How long?</legend>
              <div className={styles.focusInlineChoices}>
                {FOCUS_PRESET_MINUTES.map(minutes => (
                  <button key={minutes} type="button"
                    aria-pressed={durationMode === 'preset' && presetMinutes === minutes}
                    className={durationMode === 'preset' && presetMinutes === minutes
                      ? styles.focusChoiceActive : styles.focusChoice}
                    onClick={() => { setDurationMode('preset'); setPresetMinutes(minutes); }}>
                    {minutes} minutes
                  </button>
                ))}
                <button type="button" aria-pressed={durationMode === 'custom'}
                  className={durationMode === 'custom' ? styles.focusChoiceActive : styles.focusChoice}
                  onClick={() => setDurationMode('custom')}>Custom</button>
                <button type="button" aria-pressed={durationMode === 'untimed'}
                  className={durationMode === 'untimed' ? styles.focusChoiceActive : styles.focusChoice}
                  onClick={() => setDurationMode('untimed')}>No timer</button>
              </div>
              {durationMode === 'custom' && (
                <label className={styles.focusTextLabel} htmlFor="focus-custom-minutes">
                  Custom minutes (5–240)
                  <input id="focus-custom-minutes" type="number" min="5" max="240" step="1"
                    value={customMinutes}
                    onChange={event => setCustomMinutes(Math.max(5, Math.min(240, Number(event.target.value) || 5)))} />
                </label>
              )}
            </fieldset>

          </div>

          <details className={styles.focusTune}>
            <summary>Tune session</summary>
          <div className={styles.focusDoors} role="group" aria-label="Focus Field entry">
            <button type="button" aria-pressed={entryMode === 'guide-me'}
              className={entryMode === 'guide-me' ? styles.focusDoorActive : styles.focusDoor}
              onClick={() => chooseEntryMode('guide-me')}>
              <strong>Guide me</strong><span>Use this session’s visible choices to suggest musical worlds.</span>
            </button>
            <button type="button" aria-pressed={entryMode === 'browse'}
              className={entryMode === 'browse' ? styles.focusDoorActive : styles.focusDoor}
              onClick={() => chooseEntryMode('browse')}>
              <strong>Browse</strong><span>Choose the focus state and musical world yourself.</span>
            </button>
          </div>

            <div className={styles.focusForm}>
              <label className={styles.focusTextLabel} htmlFor="focus-task-label">
                Optional private label
                <input id="focus-task-label" maxLength={120} value={taskLabel}
                  onChange={event => setTaskLabel(event.target.value)}
                  placeholder="Chapter 4, budget review, open studio…" />
              </label>
            <fieldset className={styles.focusFieldset}>
              <legend>How much stimulation?</legend>
              <div className={styles.focusInlineChoices}>
                {FOCUS_STIMULATION_LEVELS.map(value => (
                  <button key={value} type="button" aria-pressed={stimulation === value}
                    className={stimulation === value ? styles.focusChoiceActive : styles.focusChoice}
                    onClick={() => chooseStimulation(value)}>{STIMULATION_LABELS[value]}</button>
                ))}
              </div>
            </fieldset>

            {entryMode === 'guide-me' ? (
              <fieldset className={styles.focusFieldset}>
                <legend>Transparent suggestion</legend>
                <p className={styles.focusExplanation}>{guide.explanation}</p>
                <div className={styles.focusSuggestionRow}>
                  {[guide.primary, ...guide.alternatives].map((world, index) => (
                    <button key={world} type="button" aria-pressed={musicalWorld === world}
                      className={musicalWorld === world ? styles.focusWorldActive : styles.focusWorld}
                      onClick={() => setMusicalWorld(world)}>
                      <span>{index === 0 ? 'Suggested' : 'Alternative'}</span>
                      <strong>{WORLD_LABELS[world]}</strong>
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : (
              <fieldset className={styles.focusFieldset}>
                <legend>What do you want to hear?</legend>
                <div className={styles.focusWorldGrid}>
                  {FOCUS_MUSICAL_WORLDS.map(world => (
                    <button key={world} type="button" aria-pressed={musicalWorld === world}
                      className={musicalWorld === world ? styles.focusWorldActive : styles.focusWorld}
                      onClick={() => setMusicalWorld(world)}>
                      <strong>{WORLD_LABELS[world]}</strong>
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
            </div>
          </details>

          <div className={styles.focusStartRow}>
            <div>
              <strong>{NEED_LABELS[focusNeed]} · {WORLD_LABELS[musicalWorld]}</strong>
              <span>{TASK_LABELS[task]} · {STIMULATION_LABELS[stimulation]} stimulation · {duration.mode === 'untimed' ? 'Untimed' : `${duration.minutes} minutes`}</span>
            </div>
            <button type="button" className={styles.play} onClick={start}
              disabled={!transport}>Start focus session</button>
          </div>
        </>
      )}

      {session && (sessionActive || sessionTerminal) && (
        <div className={styles.focusActiveSession} data-focus-field-session={session.status}>
          <div className={styles.focusClock} aria-live="polite">
            <span>{session.status === 'running' ? 'In focus' : session.status === 'paused' ? 'Paused' : session.status === 'completed' ? 'Complete' : 'Stopped'}</span>
            <strong>{formatClock(remaining)}</strong>
          </div>
          <div className={styles.focusSessionSummary}>
            <h3>{session.plan.taskLabel || TASK_LABELS[session.plan.task]}</h3>
            <p>{NEED_LABELS[session.plan.focusNeed]} · {WORLD_LABELS[session.plan.musicalWorld]} · {STIMULATION_LABELS[session.plan.stimulation]} stimulation</p>
            {session.status === 'paused' && <p>A fresh member action is required. Sound and timer never restart themselves.</p>}
          </div>

          {sessionActive && (
            <>
              <div className={styles.focusRetune}>
                <label>Musical world
                  <select value={session.plan.musicalWorld}
                    onChange={event => retune({ musicalWorld: event.target.value as FocusMusicalWorld })}>
                    {FOCUS_MUSICAL_WORLDS.map(world => <option value={world} key={world}>{WORLD_LABELS[world]}</option>)}
                  </select>
                </label>
                <label>Stimulation
                  <select value={session.plan.stimulation}
                    onChange={event => retune({ stimulation: event.target.value as FocusStimulation })}>
                    {FOCUS_STIMULATION_LEVELS.map(value => <option value={value} key={value}>{STIMULATION_LABELS[value]}</option>)}
                  </select>
                </label>
              </div>
              <div className={styles.focusActions}>
                <p className={styles.focusExplanation}>
                  Pause and Stop for this session are in the player below.
                </p>
              </div>
            </>
          )}

          {sessionTerminal && (
            <div className={styles.focusFeedback}>
              <h3>How did this field work for you?</h3>
              <div className={styles.focusInlineChoices}>
                {FOCUS_FEEDBACK_TAGS.map(tag => (
                  <button type="button" key={tag} aria-pressed={feedbackTags.includes(tag)}
                    className={feedbackTags.includes(tag) ? styles.focusChoiceActive : styles.focusChoice}
                    onClick={() => toggleFeedbackTag(tag)}>{FEEDBACK_LABELS[tag]}</button>
                ))}
              </div>
              <div className={styles.focusActions}>
                {(['helped', 'neutral', 'distracting'] as const).map(outcome => (
                  <button type="button" key={outcome} onClick={() => recordFeedback(outcome)}>
                    {outcome === 'helped' ? 'Helped' : outcome === 'neutral' ? 'Neutral' : 'Distracting'}
                  </button>
                ))}
                <button type="button" className={styles.secondary}
                  onClick={() => { transport?.clearFocusSession(); setFeedbackTags([]); setMessage('Ready for another member-directed focus session.'); }}>
                  New session
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <p className={styles.focusStatus} role="status" aria-live="polite">{message}</p>
      <p className={styles.focusBoundaryNote}>
        Session state stays only in this authenticated in-memory field. It is not global MAIA memory and contains no page content, keystrokes, biometrics, productivity score or audio entitlement.
      </p>
    </section>
  );
}
