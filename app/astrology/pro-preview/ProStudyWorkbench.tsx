'use client';

import { useMemo, useState } from 'react';
import type { BirthChart } from '@/lib/astrology/proEphemerisCalculator';
import { createProResearchSnapshot } from '@/lib/astrology/proResearchSnapshot';
import { STUDY_LESSONS, studyChartObservation, type StudyLessonId } from '@/lib/astrology/proStudyField';
import styles from './pro-study-workbench.module.css';

/** Private chart is provided only after FG01 authenticated + visible re-verification. */
export default function ProStudyWorkbench({ chart }: { chart: BirthChart | null }) {
  const [lessonId, setLessonId] = useState<StudyLessonId>('positions');
  const lesson = STUDY_LESSONS.find(item => item.id === lessonId) || STUDY_LESSONS[0];
  const snapshot = useMemo(() => chart ? createProResearchSnapshot(chart) : null, [chart]);

  return (
    <section id="study" className={styles.workbench} aria-labelledby="pro-study-heading">
      <div className={styles.heading}>
        <span className={styles.eyebrow}>STUDY · METHOD BEFORE MEANING</span>
        <h3 id="pro-study-heading">The chart as a field of inquiry</h3>
        <p>Learn professional distinctions through five short lessons. Bring in your
          own verified chart when you choose, without treating symbolism as a verdict.</p>
      </div>
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
      <p className={styles.privateNote}>This Study room neither stores responses nor communicates chart facts to MAIA.
        Closing or blurring your private chart removes chart-specific observations.</p>
    </section>
  );
}
