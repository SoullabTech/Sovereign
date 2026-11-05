'use client';

import { useMemo, useState } from 'react';
import type { BirthChart } from '@/lib/astrology/proEphemerisCalculator';
import { createProResearchSnapshot } from '@/lib/astrology/proResearchSnapshot';
import { STUDY_LESSONS, studyChartObservation, type StudyLessonId } from '@/lib/astrology/proStudyField';
import { TECHNIQUE_LESSONS } from '@/lib/astrology/proTechniqueLessons';
import styles from './pro-study-workbench.module.css';

/** Private chart is provided only after FG01 authenticated + visible re-verification. */
export default function ProStudyWorkbench({ chart }: { chart: BirthChart | null }) {
  const [track, setTrack] = useState<'foundations' | 'techniques'>('foundations');
  const [lessonId, setLessonId] = useState<StudyLessonId>('positions');
  const [techniqueId, setTechniqueId] = useState(TECHNIQUE_LESSONS[0].id);
  const [revealed, setRevealed] = useState(false);
  const technique = TECHNIQUE_LESSONS.find(item => item.id === techniqueId) || TECHNIQUE_LESSONS[0];
  const lesson = STUDY_LESSONS.find(item => item.id === lessonId) || STUDY_LESSONS[0];
  const snapshot = useMemo(() => chart ? createProResearchSnapshot(chart) : null, [chart]);

  return (
    <section id="study" className={styles.workbench} aria-labelledby="pro-study-heading">
      <div className={styles.heading}>
        <span className={styles.eyebrow}>STUDY · METHOD BEFORE MEANING</span>
        <h3 id="pro-study-heading">The chart as a field of inquiry</h3>
        <p>Foundations: five short lessons on professional distinctions. Techniques: one
          lesson per Pro tool, with practice in the tool and a self-check. Bring in your
          own verified chart when you choose, without treating symbolism as a verdict.</p>
      </div>
      <div className={styles.lessonList} role="tablist" aria-label="Study track">
        <button type="button" role="tab" aria-selected={track === 'foundations'}
          className={track === 'foundations' ? styles.selected : ''} onClick={() => setTrack('foundations')}>Foundations</button>
        <button type="button" role="tab" aria-selected={track === 'techniques'}
          className={track === 'techniques' ? styles.selected : ''} onClick={() => setTrack('techniques')}>Techniques</button>
      </div>
      {track === 'techniques' ? (
        <>
          <div className={styles.lessonList} role="tablist" aria-label="Technique lessons">
            {TECHNIQUE_LESSONS.map(item => (
              <button key={item.id} type="button" role="tab" aria-selected={techniqueId === item.id}
                aria-controls="pro-technique-lesson"
                className={techniqueId === item.id ? styles.selected : ''}
                onClick={() => { setTechniqueId(item.id); setRevealed(false); }}>
                {item.title}
              </button>
            ))}
          </div>
          <article id="pro-technique-lesson" className={styles.lesson} role="tabpanel">
            <span className={styles.eyebrow}>{technique.level}</span>
            <h4>{technique.title}</h4>
            <p className={styles.concept}>{technique.concept}</p>
            <ul className={styles.points}>
              {technique.points.map(point => <li key={point}>{point}</li>)}
            </ul>
            <div className={styles.activity}>
              <h5>Practise in Pro</h5>
              <ol className={styles.steps}>
                {technique.practice.map(step => <li key={step}>{step}</li>)}
              </ol>
            </div>
            <div className={styles.ownerChart}>
              <h5>Check yourself</h5>
              <p>{technique.check.question}</p>
              {revealed
                ? <p className={styles.answer}>{technique.check.answer}</p>
                : <button type="button" className={styles.reveal} onClick={() => setRevealed(true)}>Show answer</button>}
            </div>
            <p className={styles.boundary}><strong>Method boundary:</strong> {technique.boundary}</p>
          </article>
        </>
      ) : (<>
      <div className={styles.lessonList} role="tablist" aria-label="Study topics">
        {STUDY_LESSONS.map(item => (
          <button key={item.id} id={'pro-study-tab-' + item.id}
            type="button" role="tab" aria-selected={lessonId === item.id}
            aria-controls="pro-study-lesson"
            className={lessonId === item.id ? styles.selected : ''}
            onClick={() => setLessonId(item.id)}>
            {item.title}
          </button>
        ))}
      </div>
      <article id="pro-study-lesson" className={styles.lesson}
        role="tabpanel" aria-labelledby={'pro-study-tab-' + lesson.id}>
        <span className={styles.eyebrow}>{lesson.level}</span>
        <h4>{lesson.title}</h4>
        <p className={styles.concept}>{lesson.concept}</p>
        <div className={styles.activity}>
          <h5>Observe</h5>
          <p>{lesson.observation}</p>
        </div>
        <div className={styles.ownerChart} role="note">
          <h5>With your chart</h5>
          <p>{studyChartObservation(lesson.id, snapshot)}</p>
        </div>
        <p className={styles.boundary}><strong>Method boundary:</strong> {lesson.boundary}</p>
      </article>
      </>)}
      <p className={styles.privateNote}>This Study room neither stores responses nor communicates chart facts to MAIA.
        Closing or blurring your private chart removes chart-specific observations.</p>
    </section>
  );
}
