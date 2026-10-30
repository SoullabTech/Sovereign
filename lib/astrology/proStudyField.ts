/**
 * FG08 — non-prescriptive professional chart-method lessons.
 * Static teaching and derived in-memory owner-chart facts only.
 * No belief scoring, client psychology, credentials or model call.
 */
import type { ResearchSnapshot } from './proResearchSnapshot';

export const STUDY_LESSONS = [
  {
    id: 'positions', title: 'Reading a position', level: 'Foundations',
    concept: 'An ecliptic longitude locates a point on a circle measured from 0° Aries. Sign and degree are two ways of displaying that same coordinate.',
    observation: 'Compare a sign-degree position with its 0–360° ecliptic longitude.',
    boundary: 'A coordinate is a calculation, not evidence of temperament or destiny.',
  },
  {
    id: 'houses', title: 'Houses and conventions', level: 'Methods',
    concept: 'Different house divisions partition the local sky differently. A chart may also report a 5° pre-angular-cusp convention distinct from strict geometric membership.',
    observation: 'Compare the reported and geometric house fields for any selected point.',
    boundary: 'This preview does not certify Placidus or Koch. Do not treat a changed house label as a changed planetary position.',
  },
  {
    id: 'aspects', title: 'Aspects and orbs', level: 'Geometry',
    concept: 'An aspect describes an angular relationship between two points. Its orb measures the deviation from the configured target angle.',
    observation: 'Inspect the narrowest reported orb, then change the display-only filter in Research.',
    boundary: 'The list is calculator-reported. A display filter does not calculate applying/separating phase or prove a psychological interpretation.',
  },
  {
    id: 'motion', title: 'Apparent motion', level: 'Time',
    concept: 'Retrograde is apparent motion seen from Earth. Near a station, sampling windows can disagree or be too small to resolve direction confidently.',
    observation: 'Notice which bodies are direct, retrograde, near-station uncertain or not evaluated.',
    boundary: 'A legacy retrograde boolean of false is not proof of direct motion near a station.',
  },
  {
    id: 'interpretation', title: 'Meaning and multiple lenses', level: 'Inquiry',
    concept: 'Different astrological traditions may interpret the same configuration differently. Calculation, symbolic tradition and first-person meaning are separate kinds of claims.',
    observation: 'Place at least two possible interpretations alongside your own lived account without forcing agreement.',
    boundary: 'Neither a chart nor a model determines a person’s identity, developmental stage or fate.',
  },
] as const;

export type StudyLessonId = typeof STUDY_LESSONS[number]['id'];

export function isStudyLessonId(value: unknown): value is StudyLessonId {
  return typeof value === 'string' && STUDY_LESSONS.some(lesson => lesson.id === value);
}

export function studyChartObservation(
  id: StudyLessonId,
  snapshot: ResearchSnapshot | null,
): string {
  if (!snapshot) return 'Your personal chart is not open. The lesson can be read without it.';
  switch (id) {
    case 'positions':
      return snapshot.positions.length
        ? 'Your chart includes ' + snapshot.positions.length +
          ' validated points. Open Research to compare their sign-degree positions with 0–360° longitude.'
        : 'No verified positions are available.';
    case 'houses':
      return snapshot.countWithHouseConventionDifference + ' currently verified positions differ between reported and geometric house conventions.';
    case 'aspects':
      return snapshot.aspects.length
        ? 'Your calculator reported ' + snapshot.aspects.length +
          ' validated aspects; the narrowest has an orb of ' + snapshot.aspects[0].orb.toFixed(2) + '°.'
        : 'No validated aspects are reported in the currently open chart.';
    case 'motion':
      return snapshot.motionUncertainCount + ' apparent-motion results are uncertain or not evaluated.';
    case 'interpretation':
      return 'Your verified chart is available for personal inquiry. No chart data is sent to an AI or another member by this Study room.';
  }
}
