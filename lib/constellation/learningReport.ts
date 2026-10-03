import {
  BETA_FEEDBACK_LABEL,
  BETA_FEEDBACK_SIGNALS,
  isBetaFeedbackSignal,
  type BetaFeedbackSignal,
} from '../writersStudio/betaFeedback';

/** A display floor, not a claim of anonymity or statistical significance. */
export const MIN_FEEDBACK_CONTRIBUTORS = 5;
const WINDOW_DAYS = 28;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface LearningWindow {
  start: string;
  endExclusive: string;
  days: number;
}

/** Fixed completed-day window. Callers cannot select revealing small cohorts. */
export function learningWindow(now: Date): LearningWindow {
  if (!Number.isFinite(now.getTime())) throw new Error('Invalid learning report clock');
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return {
    start: new Date(end - WINDOW_DAYS * DAY_MS).toISOString(),
    endExclusive: new Date(end).toISOString(),
    days: WINDOW_DAYS,
  };
}

export type FeedbackRead =
  | { kind: 'read'; groups: readonly unknown[] }
  | { kind: 'unavailable' };

interface FeedbackGroup {
  signal: BetaFeedbackSignal;
  submissions: number;
  contributors: number;
}

export interface FeedbackMeasure {
  id: BetaFeedbackSignal;
  label: string;
  state: 'observed' | 'withheld' | 'unavailable';
  submissions: number | null;
}

export interface UnmeasuredQuestion {
  id: string;
  label: string;
  state: 'not_measured';
  reason: string;
}

export interface LearningReport {
  schema: 'constellation-learning.v1';
  generatedAt: string;
  window: LearningWindow;
  source: {
    state: 'observed' | 'unavailable';
    name: string;
    unit: 'feedback submissions';
    population: string;
    attribution: 'not_collected';
  };
  summary: string;
  feedback: FeedbackMeasure[];
  unmeasured: UnmeasuredQuestion[];
}

const UNMEASURED: readonly UnmeasuredQuestion[] = [
  { id: 'campaign_attribution', label: 'Which invitations brought people here?', state: 'not_measured',
    reason: 'The existing feedback source does not record campaign attribution. A chosen doorway is not a permanent identity.' },
  { id: 'arrival', label: 'Who crossed a doorway?', state: 'not_measured',
    reason: 'No admitted arrival-count source is connected to this report. Page views are not reconstructed from private records.' },
  { id: 'meaningful_first_act', label: 'Did people begin useful work?', state: 'not_measured',
    reason: 'A visit, account, or button press does not establish useful work. That needs its own agreed evidence and member participation.' },
  { id: 'return', label: 'Did people return to that work?', state: 'not_measured',
    reason: 'This report does not join people across sessions or infer return from retained conversations.' },
  { id: 'referral', label: 'Were cross-room invitations helpful?', state: 'not_measured',
    reason: 'Referral instructions are not evidence that an invitation occurred, was accepted, or was useful. No referral-outcome source is connected.' },
  { id: 'contribution', label: 'Did people choose to contribute?', state: 'not_measured',
    reason: 'Contribution requires an explicit act and its own evidence. Interest, continued use, or a subscription cannot stand in for it.' },
];

/** Reject a malformed aggregate whole; never silently turn lost coverage into zero. */
function parseGroups(values: readonly unknown[]): FeedbackGroup[] | null {
  if (!Array.isArray(values) || values.length > BETA_FEEDBACK_SIGNALS.length) return null;
  const seen = new Set<BetaFeedbackSignal>();
  const groups: FeedbackGroup[] = [];
  for (const value of values) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const row = value as Record<string, unknown>;
    if (Object.keys(row).length !== 3 ||
      Object.keys(row).some(key => !['signal', 'submissions', 'contributors'].includes(key)) ||
      !isBetaFeedbackSignal(row.signal) || seen.has(row.signal)) return null;
    const { submissions, contributors } = row;
    if (typeof submissions !== 'number' || typeof contributors !== 'number' ||
      !Number.isSafeInteger(submissions) || !Number.isSafeInteger(contributors) ||
      submissions < 0 || contributors < 0 || contributors > submissions ||
      (submissions === 0) !== (contributors === 0)) return null;
    seen.add(row.signal);
    groups.push({ signal: row.signal, submissions, contributors });
  }
  return groups;
}

/** Pure minimization boundary. No raw record, private text, or contributor count survives. */
export function buildLearningReport(read: FeedbackRead, now: Date = new Date()): LearningReport {
  const window = learningWindow(now);
  const groups = read.kind === 'read' ? parseGroups(read.groups) : null;
  const bySignal = new Map((groups ?? []).map(group => [group.signal, group]));
  const feedback: FeedbackMeasure[] = BETA_FEEDBACK_SIGNALS.map(id => {
    const group = bySignal.get(id);
    const state = groups === null ? 'unavailable'
      : group && group.submissions > 0 && group.contributors < MIN_FEEDBACK_CONTRIBUTORS
        ? 'withheld' : 'observed';
    return {
      id, label: BETA_FEEDBACK_LABEL[id], state,
      submissions: state === 'observed' ? (group?.submissions ?? 0) : null,
    };
  });
  const hasDisclosedFeedback = feedback.some(item => item.state === 'observed' && (item.submissions ?? 0) > 0);
  const hasWithheldFeedback = feedback.some(item => item.state === 'withheld');
  const summary = groups === null
    ? 'Feedback could not be read. Nothing here is being reported as zero.'
    : hasDisclosedFeedback
      ? 'Writers have shared feedback we can examine. These are their chosen descriptions, not proof of editorial improvement or campaign performance.'
      : hasWithheldFeedback
        ? 'Some feedback is held below the display floor. There is not enough shareable evidence here to draw a product conclusion.'
        : 'No beta feedback submissions were recorded in this window. That does not mean nobody used the Studio or found it useful.';
  return {
    schema: 'constellation-learning.v1', generatedAt: now.toISOString(), window,
    source: {
      state: groups === null ? 'unavailable' : 'observed',
      name: 'Writer’s Studio · explicit beta feedback',
      unit: 'feedback submissions',
      population: 'A self-selected sample of eligible writers who deliberately submitted a beta note; not all visitors or members.',
      attribution: 'not_collected',
    },
    summary, feedback,
    unmeasured: UNMEASURED.map(question => ({ ...question })),
  };
}
