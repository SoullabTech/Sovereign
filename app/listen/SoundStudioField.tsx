'use client';

import { useMemo, useState } from 'react';
import { useListeningBoundaryStatus, usePersistentListening } from '@/components/listening/PersistentListeningProvider';
import {
  OPEN_GROUND,
  SOUND_STUDIO_DOORS,
  SOUND_STUDIO_WORKS,
  formatExperienceTime,
  soundPassageAt,
  soundProgress,
} from '@/lib/listening/soundStudioExperience';
import type { SoundStudioDoorID, SoundStudioWork } from '@/lib/listening/soundStudioExperience';
import styles from './listen.module.css';

function stateLabel(work: SoundStudioWork): string {
  return work.state === 'review' ? 'Ready for private review'
    : work.state === 'study' ? 'Authoring study' : 'Proposed work';
}

export default function SoundStudioField() {
  const transport = usePersistentListening();
  const boundaryStatus = useListeningBoundaryStatus();
  const [door, setDoor] = useState<SoundStudioDoorID>('experience');
  const [selectedID, setSelectedID] = useState(OPEN_GROUND.id);
  const [immersive, setImmersive] = useState(false);
  const [message, setMessage] = useState(
    'Choose a way into the field. Listening is complete participation; nothing starts automatically.',
  );

  const selected = useMemo(
    () => SOUND_STUDIO_WORKS.find(work => work.id === selectedID) ?? OPEN_GROUND,
    [selectedID],
  );
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

  const stop = () => {
    transport?.stopMusic();
    setMessage('Stopped by you. Nothing will restart automatically.');
  };

  return (
    <section id="sound-studio" className={styles.studioField} aria-labelledby="sound-studio-title"
      data-sound-studio-field="true" data-sound-studio-door={door}>
      <div className={styles.studioAtmosphere} aria-hidden="true">
        <span className={styles.studioGlowOne}/><span className={styles.studioGlowTwo}/>
      </div>

      <header className={styles.studioHeader}>
        <div>
          <span className={styles.smallcaps}>SOULLAB SOUND STUDIO · NEUROPOD PROTOTYPE FIELD</span>
          <h2 id="sound-studio-title">What brings you to sound today?</h2>
          <p>
            Receive an experience, investigate what you hear, create a work, or enter the deeper professional and research field.
            One studio, one listening authority, many ways to participate.
          </p>
        </div>
        <div className={styles.studioContinuity}>
          <span>ONE LIVING FIELD</span>
          <strong>iPhone · iPad · Desktop</strong>
          <small>The same work and player, expressed for each device.</small>
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
            <span>{item.eyebrow}</span>
            <strong>{item.title}</strong>
            <small>{item.invitation}</small>
          </button>
        ))}
      </div>

      <div id="sound-studio-door-panel" role="tabpanel"
        aria-labelledby={`sound-door-${currentDoor.id}`}
        className={styles.studioDoorPanel}>
        <div>
          <span className={styles.smallcaps}>{currentDoor.eyebrow} · {currentDoor.title}</span>
          <h3>{currentDoor.invitation}</h3>
        </div>
        <div className={styles.studioPossibilities}>
          {currentDoor.possibilities.map(item => <span key={item}>{item}</span>)}
        </div>
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
        {SOUND_STUDIO_WORKS.map(work => {
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
                  if (work.id === OPEN_GROUND.id) {
                    setImmersive(true);
                    setMessage('Open Ground is ready with its exact reviewed AAC edition. Sound waits for your explicit Play.');
                  } else {
                    setImmersive(false);
                    setMessage(`${work.title} is preserved as an authoring study. Open Ground is the complete responsive prototype in this build.`);
                  }
                }}>
                {work.id === OPEN_GROUND.id ? 'Enter experience' : 'View study'}
              </button>
            </article>
          );
        })}
      </div>

      {immersive && selected.id === OPEN_GROUND.id && (
        <section className={styles.immersiveExperience} aria-labelledby="open-ground-title"
          data-sound-studio-immersive="open-ground">
          <div className={styles.immersiveVisual} aria-hidden="true">
            <div className={styles.immersiveHorizon}/><div className={styles.immersiveOrb}/>
          </div>
          <div className={styles.immersiveContent}>
            <div className={styles.immersiveTopline}>
              <span>FIELD 01 · MUSIC ONLY · PRIVATE REVIEW</span>
              <button type="button" onClick={() => setImmersive(false)} aria-label="Close Open Ground experience">Close</button>
            </div>
            <span className={styles.smallcaps}>A SUSTAINED TONAL WORLD</span>
            <h3 id="open-ground-title">Open Ground</h3>
            <p className={styles.immersiveInvitation}>
              What can a sustained tonal world reveal when we give it time, subtle internal movement and a carefully composed return?
            </p>
            <div className={styles.immersiveStage} aria-live="polite">
              <span>{passage?.label ?? 'Ready'}</span>
              <strong>{passage?.invitation ?? 'Sound begins only when you choose.'}</strong>
            </div>
            <div className={styles.immersiveProgress} aria-label={`${Math.round(progress * 100)} percent complete`}>
              <span style={{width: `${progress * 100}%`}}/>
            </div>
            <div className={styles.immersiveTimes}>
              <span>{formatExperienceTime(elapsedMs)}</span><span>{formatExperienceTime(selected.durationMs)}</span>
            </div>
            <ol className={styles.immersivePassages} aria-label="Open Ground passages">
              {selected.passages.map(item => (
                <li key={item.id} data-current={passage?.id === item.id ? 'true' : 'false'}>
                  <span>{formatExperienceTime(item.startMs)}</span><strong>{item.label}</strong>
                </li>
              ))}
            </ol>
            <div className={styles.immersiveActions}>
              <button type="button" className={styles.play} onClick={() => void begin()}
                aria-label={isPlaying ? 'Pause Open Ground' : elapsedMs > 0 ? 'Resume Open Ground' : 'Play Open Ground'}
                disabled={!transportReady && boundaryStatus !== 'checking'}>
                {isPlaying ? 'Ⅱ  Pause' : elapsedMs > 0 ? '▶  Resume' : '▶  Begin Open Ground'}
              </button>
              {isCurrent && <button type="button" className={styles.secondary}
                onClick={stop} aria-label="Stop Open Ground">Stop</button>}
              <button type="button" className={styles.ghost}
                onClick={() => setMessage('Reflection remains optional. Continue listening, write privately, invite MAIA later, or simply return to life.')}>After listening</button>
            </div>
            <p className={styles.immersiveStatus} role="status" aria-live="polite">{message}</p>
            <p className={styles.quality}>
              EXACT REVIEWED AAC EDITION · 24-BIT MASTER PRESERVED · EXISTING PERSISTENT PLAYER · NO BIOMETRICS · NO HIDDEN ANALYSIS
            </p>
          </div>
        </section>
      )}

      {!immersive && <p className={styles.studioStatus} role="status" aria-live="polite">{message}</p>}
    </section>
  );
}
