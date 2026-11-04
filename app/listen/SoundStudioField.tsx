'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useListeningBoundaryStatus, usePersistentListening } from '@/components/listening/PersistentListeningProvider';
import {
  NIGHT_GROUND,
  NIGHT_GROUND_EXTENDED_NIGHT,
  NIGHT_GROUND_MUSIC_ONLY,
  NIGHT_GROUND_NICOLE_FIRST_NIGHT,
  OPEN_GROUND,
  SOUND_STUDIO_DOORS,
  SOUND_STUDIO_WORKS,
  formatExperienceTime,
  soundPassageAt,
  soundProgress,
} from '@/lib/listening/soundStudioExperience';
import type { SoundStudioDoorID, SoundStudioWork } from '@/lib/listening/soundStudioExperience';
import styles from './listen.module.css';

// SOUND-STUDIO-UIUX-02: presentation only. The single persistent player, the
// manifests and every start/stop decision are unchanged; this file only decides
// what the member sees before, during and after listening.

const QUIET_AFTER_MS = 14_000;

// The Night Ground editions are one field with a choice of how the night holds
// the member. Labels are human; file architecture stays in "About this field".
const NIGHT_EDITIONS: ReadonlyArray<{ work: SoundStudioWork; label: string; line: string }> = [
  { work: NIGHT_GROUND_EXTENDED_NIGHT, label: 'Extended Night', line: 'Nicole once, then the music until Stop' },
  { work: NIGHT_GROUND_NICOLE_FIRST_NIGHT, label: 'First Night', line: 'Nicole once, then a finite 109 minutes' },
  { work: NIGHT_GROUND_MUSIC_ONLY, label: 'Music Only', line: 'No voice, the whole 109 minutes' },
  { work: NIGHT_GROUND, label: 'Guided Arrival', line: 'Bella, a 12-minute threshold' },
];

// One catalogue card stands for the whole Night Ground family.
const NIGHT_FAMILY = 'night-ground-family' as const;
type CatalogueItem = SoundStudioWork | typeof NIGHT_FAMILY;

function stateLabel(work: SoundStudioWork): string {
  return work.state === 'review' ? 'Ready for private review'
    : work.state === 'study' ? 'Authoring study' : 'Proposed work';
}

type Props = { initialWorkId?: string };

export default function SoundStudioField({ initialWorkId }: Props = {}) {
  const transport = usePersistentListening();
  const boundaryStatus = useListeningBoundaryStatus();
  const initialWork = SOUND_STUDIO_WORKS.find(work => work.id === initialWorkId);
  const [door, setDoor] = useState<SoundStudioDoorID>('experience');
  const [selectedID, setSelectedID] = useState((initialWork ?? OPEN_GROUND).id);
  const [immersive, setImmersive] = useState(Boolean(initialWork?.manifest));
  const [quiet, setQuiet] = useState(false);
  const [message, setMessage] = useState(
    initialWork?.manifest
      ? `${initialWork.title} is ready. Sound waits for your explicit Play.`
      : 'Choose a way into the field. Listening is complete participation; nothing starts automatically.',
  );

  const selected = useMemo(
    () => SOUND_STUDIO_WORKS.find(work => work.id === selectedID) ?? OPEN_GROUND,
    [selectedID],
  );
  const catalogue = useMemo(() => {
    const nightIds = new Set(NIGHT_EDITIONS.map(edition => edition.work.id));
    const list: CatalogueItem[] = [];
    let placed = false;
    for (const work of SOUND_STUDIO_WORKS) {
      if (nightIds.has(work.id)) {
        if (!placed) { list.push(NIGHT_FAMILY); placed = true; }
      } else list.push(work);
    }
    return list;
  }, []);
  const currentDoor = SOUND_STUDIO_DOORS.find(item => item.id === door) ?? SOUND_STUDIO_DOORS[0];
  const snapshot = transport?.snapshot;
  const isCurrent = snapshot?.experienceId === selected.id;
  const isPlaying = isCurrent && snapshot?.playback === 'playing';
  const elapsedMs = isCurrent ? snapshot?.elapsedMs ?? 0 : 0;
  const passage = isCurrent
    ? soundPassageAt(selected.passages, elapsedMs)
    : selected.passages[0] ?? null;
  const progress = isCurrent ? soundProgress(selected.durationMs, elapsedMs) : 0;
  const transportReady = Boolean(transport);
  const isNight = selected.kind.startsWith('Dream Field');
  const nightEdition = NIGHT_EDITIONS.some(edition => edition.work.id === selected.id);
  const untilStop = selected.manifest?.continuation !== undefined;
  const afterListening = elapsedMs > 0 && !isPlaying;

  // Night modality: after a quiet interval the field recedes. Any touch, key or
  // pointer movement brings the controls back; nothing about playback changes.
  // Entering a field brings its detail into view: Now → Begin stays two actions.
  const detailRef = useRef<HTMLElement | null>(null);
  const enteredFor = useRef<string | null>(null);
  useEffect(() => {
    if (!immersive) { enteredFor.current = null; return; }
    if (enteredFor.current === selectedID || !detailRef.current) return;
    enteredFor.current = selectedID;
    const calm = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    detailRef.current.scrollIntoView({ block: 'start', behavior: calm ? 'auto' : 'smooth' });
  }, [immersive, selectedID]);

  const quietTimer = useRef<number | null>(null);
  const wake = () => {
    setQuiet(false);
    if (quietTimer.current !== null) window.clearTimeout(quietTimer.current);
    quietTimer.current = null;
    if (isNight && isPlaying) {
      quietTimer.current = window.setTimeout(() => setQuiet(true), QUIET_AFTER_MS);
    }
  };
  useEffect(() => {
    if (isNight && isPlaying) {
      quietTimer.current = window.setTimeout(() => setQuiet(true), QUIET_AFTER_MS);
    } else {
      setQuiet(false);
    }
    return () => {
      if (quietTimer.current !== null) window.clearTimeout(quietTimer.current);
      quietTimer.current = null;
    };
  }, [isNight, isPlaying]);

  // Tell the shared player when this view already carries the controls, so it
  // can fold to a compact bar instead of repeating them. Presentation only.
  useEffect(() => {
    const live = immersive && isCurrent;
    if (live) document.body.setAttribute('data-sound-immersive-active', isNight ? 'night' : '1');
    return () => document.body.removeAttribute('data-sound-immersive-active');
  }, [immersive, isCurrent, isNight]);

  const begin = async () => {
    if (!transport) {
      setMessage(boundaryStatus === 'checking'
        ? 'Verifying your private listening session…'
        : 'A verified private Listening session is required before sound can begin.');
      return;
    }
    if (isPlaying) {
      transport.pause();
      setMessage('Paused by you. The experience remains available to resume.');
      return;
    }
    const started = selected.manifest
      ? await transport.playExperienceMedia(selected.manifest)
      : await transport.playSketch(
          selected.mood,
          [...selected.frequencies],
          {
            id: selected.id,
            title: selected.title,
            subtitle: selected.subtitle,
            durationMs: selected.durationMs,
            passages: selected.passages,
          },
        );
    setMessage(started
      ? selected.manifest
        ? `Playing the exact ${selected.manifest.editions.defaultReview.codecLabel} through the existing Soullab listening session.`
        : `Playing ${selected.title} through the existing Soullab listening session.`
      : 'Sound did not start. Another Soullab audio experience may be active, the media may be unavailable, or coordination is unavailable.');
  };

  return (
    <section id="sound-studio" className={styles.studioField} aria-labelledby="sound-studio-title"
      data-sound-studio-field="true" data-sound-studio-door={door}>
      <div className={styles.studioAtmosphere} aria-hidden="true">
        <span className={styles.studioGlowOne}/><span className={styles.studioGlowTwo}/>
      </div>

      <header className={styles.studioHeader}>
        <div>
          <span className={styles.smallcaps}>SOULLAB SOUND STUDIO · FIELDS</span>
          <h2 id="sound-studio-title">What brings you to sound today?</h2>
          <p>One studio, one listening authority, many ways to participate.</p>
        </div>
      </header>

      <div className={styles.studioDoorGrid} role="tablist" aria-label="Ways into Sound Studio">
        {SOUND_STUDIO_DOORS.map(item => (
          <button key={item.id} type="button" role="tab"
            id={`sound-door-${item.id}`}
            aria-selected={door === item.id}
            aria-controls="sound-studio-door-panel"
            data-sound-studio-door-button={item.id}
            className={door === item.id ? styles.studioDoorActive : styles.studioDoor}
            onClick={() => setDoor(item.id)}>
            <strong>{item.title}</strong>
          </button>
        ))}
      </div>

      <div id="sound-studio-door-panel" role="tabpanel"
        aria-labelledby={`sound-door-${currentDoor.id}`}
        className={styles.studioDoorPanel}>
        <h3>{currentDoor.invitation}</h3>
        <p>
          {door === 'experience' && 'Begin simply. Music-only listening is whole in itself; guidance, reflection and shaping remain optional.'}
          {door === 'explore' && 'Every experiment keeps an exact baseline, names what changed and leaves room for an unexpected result.'}
          {door === 'create' && 'Journey, sound, silence, voice and return can be composed together while each version preserves authorship.'}
          {door === 'professional' && 'Musicians, engineers, cultural stewards and researchers receive deeper tools without displacing the human encounter.'}
        </p>
      </div>

      <div className={styles.studioShelfHead}>
        <div><span className={styles.smallcaps}>FOUNDING SERIES · PRIVATE REVIEW</span><h3>Fields to know over time</h3></div>
        <p>Return is part of the composition. A familiar work may disclose something different on another day.</p>
      </div>

      <div className={styles.studioWorkGrid} data-sound-studio-shelf="true">
        {catalogue.map(work => {
          if (work === NIGHT_FAMILY) {
            return (
              <article key="night-ground-family"
                className={nightEdition ? styles.studioWorkSelected : styles.studioWork}
                data-sound-studio-work="night-ground-family">
                <div className={styles.studioWorkOrb} aria-hidden="true"/>
                <span>Ready for private review</span>
                <h3>Night Ground</h3>
                <p className={styles.studioWorkSubtitle}>A long-form night field</p>
                <p>Meditation, descent, and continuous night listening.</p>
                <button type="button" className={styles.studioWorkAction}
                  onClick={() => {
                    if (!nightEdition) setSelectedID(NIGHT_GROUND_EXTENDED_NIGHT.id);
                    setImmersive(true);
                    setMessage('Night Ground is ready. Choose how the night should hold you; sound waits for your explicit Play.');
                  }}>
                  Enter Night Ground
                </button>
              </article>
            );
          }
          const selectedWork = selected.id === work.id;
          return (
            <article key={work.id}
              className={selectedWork ? styles.studioWorkSelected : styles.studioWork}
              data-sound-studio-work={work.id}>
              <div className={styles.studioWorkOrb} aria-hidden="true"/>
              <span>{stateLabel(work)}</span>
              <h3>{work.title}</h3>
              <p className={styles.studioWorkSubtitle}>{work.subtitle}</p>
              <p>{work.description}</p>
              <div className={styles.studioWorkQualities}>
                {work.qualities.map(quality => <small key={quality}>{quality}</small>)}
              </div>
              <button type="button" className={styles.studioWorkAction}
                onClick={() => {
                  setSelectedID(work.id);
                  if (work.manifest) {
                    setImmersive(true);
                    setMessage(`${work.title} is ready with its exact reviewed media edition. Sound waits for your explicit Play.`);
                  } else {
                    setImmersive(false);
                    setMessage(`${work.title} is preserved as an authoring study. Manifest-bound experiences are the complete responsive prototypes in this build.`);
                  }
                }}>
                {work.manifest ? 'Enter experience' : 'View study'}
              </button>
            </article>
          );
        })}
      </div>

      {immersive && selected.manifest && (
        <section ref={detailRef} className={styles.immersiveExperience} aria-labelledby={`${selected.id}-title`}
          data-sound-studio-immersive={selected.id === OPEN_GROUND.id ? 'open-ground' : selected.id}
          data-night-mode={isNight ? 'true' : 'false'}
          data-quiet={isNight && isPlaying && quiet ? 'true' : 'false'}
          onPointerDown={wake} onKeyDown={wake} onPointerMove={quiet ? wake : undefined}>
          <div className={styles.immersiveVisual} aria-hidden="true">
            <div className={styles.immersiveHorizon}/><div className={styles.immersiveOrb}/>
          </div>
          <div className={styles.immersiveContent}>
            <div className={styles.immersiveTopline}>
              <span>{isNight ? 'DREAM FIELD 01' : 'SOULLAB SOUND FIELD'}</span>
              <button type="button" onClick={() => setImmersive(false)} aria-label={`Close ${selected.title} experience`}>Close</button>
            </div>
            <span className={styles.smallcaps}>{isNight ? 'A long-form night field' : selected.kind}</span>
            <h3 id={`${selected.id}-title`}>{selected.title}</h3>
            <p className={styles.immersiveInvitation}>
              {isNight
                ? 'Nicole opens the threshold once. The music continues without further guidance.'
                : selected.immersiveQuestion ?? selected.description}
            </p>

            {nightEdition && !isPlaying && (
              <fieldset className={styles.editionChooser}>
                <legend>How would you like the night to hold you?</legend>
                <div className={styles.editionRow}>
                  {NIGHT_EDITIONS.map(edition => (
                    <button key={edition.work.id} type="button"
                      data-sound-studio-edition={edition.work.id}
                      className={selected.id === edition.work.id ? styles.editionActive : styles.edition}
                      aria-pressed={selected.id === edition.work.id}
                      onClick={() => {
                        setSelectedID(edition.work.id);
                        setMessage(`${edition.label} is ready. Sound waits for your explicit Play.`);
                      }}>
                      <strong>{edition.label}</strong>
                      <span>{edition.line}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <div className={styles.immersiveStage} aria-live="polite">
              <span>{passage?.label ?? 'Ready'}</span>
              <strong>{passage?.invitation ?? 'Sound begins only when you choose.'}</strong>
            </div>
            <div className={styles.immersiveProgress} aria-label={`${Math.round(progress * 100)} percent complete`}>
              <span style={{width: `${progress * 100}%`}}/>
            </div>
            <div className={styles.immersiveTimes}>
              <span>{formatExperienceTime(elapsedMs)}</span>
              <span>{untilStop ? 'then until Stop' : selected.durationLabel ?? formatExperienceTime(selected.durationMs)}</span>
            </div>

            {/* One control set: before sound the field offers Begin; once this experience holds the
                player, Pause, Resume and Stop live in the shared player so they are never doubled. */}
            {!isCurrent ? (
              <div className={styles.immersiveActions}>
                <button type="button" className={styles.play} onClick={() => void begin()}
                  aria-label={`Play ${selected.title}`}
                  disabled={!transportReady && boundaryStatus !== 'checking'}>
                  {`▶  Begin ${selected.title}`}
                </button>
              </div>
            ) : (
              <p className={styles.immersiveHeld} aria-live="polite">
                {isPlaying ? 'Playing. Pause and Stop are in the player below.' : 'Paused. Resume or Stop in the player below.'}
              </p>
            )}

            {afterListening && (
              <div className={styles.returnRow} role="group" aria-label="When you are ready">
                <span>When you are ready</span>
                <button type="button" className={styles.ghost}
                  onClick={() => setMessage('Reflection remains optional. Continue listening, write privately, invite MAIA later, or simply return to life.')}>
                  After listening
                </button>
              </div>
            )}

            {/* Before sound, the status line guides. Once the field holds the player, the human line above
                says everything the member needs; the technical sentence moves to About this field. */}
            {!isCurrent && <p className={styles.immersiveStatus} role="status" aria-live="polite">{message}</p>}

            <details className={styles.aboutField}>
              <summary>About this field</summary>
              <div>
                <p>{selected.kind}</p>
                <p>{selected.description}</p>
                {isCurrent && <p data-sound-studio-technical-status="true">{message}</p>}
                <ol className={styles.immersivePassages} aria-label={`${selected.title} passages`}>
                  {selected.passages.map(item => (
                    <li key={item.id} data-current={passage?.id === item.id ? 'true' : 'false'}>
                      <span>{formatExperienceTime(item.startMs)}</span><strong>{item.label}</strong>
                    </li>
                  ))}
                </ol>
                <p className={styles.quality}>
                  {selected.qualityStatement ?? 'EXACT REVIEW MEDIA · EXISTING PERSISTENT PLAYER · RELEASE HOLD'}
                </p>
              </div>
            </details>
          </div>
        </section>
      )}

      {!immersive && <p className={styles.studioStatus} role="status" aria-live="polite">{message}</p>}
    </section>
  );
}
