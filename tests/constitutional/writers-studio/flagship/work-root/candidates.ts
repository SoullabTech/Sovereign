import type { ArrivalFacts, ArrivalMachine, ResumeState, SelectionAuthority, State } from './contract';
import { ReferenceArrival } from './reference';
const wrap = (over: (orig: ArrivalMachine) => Partial<ArrivalMachine>): (() => ArrivalMachine) => () => {
  const b = new ReferenceArrival(); const orig: ArrivalMachine = { coldStart: b.coldStart.bind(b), selectWork: b.selectWork.bind(b), arrive: b.arrive.bind(b), keepWriting: b.keepWriting.bind(b), commissions: b.commissions.bind(b), resumeRows: b.resumeRows.bind(b), writeResume: b.writeResume.bind(b) };
  return Object.assign(b, over(orig));
};
const mut = (s: State, f: (o: NonNullable<Extract<State, { output: unknown }>['output']>) => Partial<Extract<State, { output: unknown }>['output']>): State => 'output' in s ? { ...s, output: { ...s.output, ...f(s.output) } } as State : s;
export const REFERENCE = (): ArrivalMachine => new ReferenceArrival();
export const DEFEAT_CANDIDATES: Readonly<Record<string, () => ArrivalMachine>> = {
  'D-O1_HOME_RESURRECTION': wrap((o) => ({ arrive: (s, f) => mut(o.arrive(s, f), (x) => ({ modes: ['home', ...x.modes] })) })),
  'D-O2_DASHBOARD_FIRST': wrap((o) => ({ arrive: (s, f) => mut(o.arrive(s, f), (x) => ({ regions: ['dashboard', ...x.regions] })) })),
  'D-O3_TUTORIAL_GATE': wrap((o) => ({ arrive: (s, f) => mut(o.arrive(s, f), () => ({ tutorialRequired: true })) })),
  'D-O4_SKILL_LEVEL_GATE': wrap((o) => ({ arrive: (s, f) => mut(o.arrive(s, f), () => ({ asksSkillLevel: true })) })),
  'D-O5_AUTO_READ': wrap((o) => { let n = 0; return { arrive: (s, f) => { n += 1; return o.arrive(s, f); }, commissions: () => n }; }),
  'D-O6_FABRICATED_RECOGNITION': wrap((o) => ({ arrive: (s, f) => mut(o.arrive(s, f), () => ({ recognition: { source: 'work-fact', text: 'This is a book about grief and belonging.' } })) })),
  'D-O7_GLOBAL_LAST_WORK': wrap((o) => ({ coldStart: (r: ResumeState | null) => r ? o.selectWork(r.workId, 'route' as SelectionAuthority) : o.coldStart(r) })),
  'D-O8_INFERRED_LAST_INTENT': wrap((o) => ({ arrive: (s, f) => mut(o.arrive(s, f), (x) => f.resume ? ({ copy: [...x.copy, 'You were working on voice last time.'] }) : ({})) })),
  'D-O9_IMPORT_MISATTRIBUTION': wrap((o) => ({ arrive: (s, f) => mut(o.arrive(s, f), (x) => f.imported ? ({ copy: x.copy.map((t) => t.replace(/identified 9 chapters/i, 'You named these 9 movements')) }) : ({})) })),
  'D-O10_UNREAD_BLOCKS': wrap((o) => ({ arrive: (s, f) => mut(o.arrive(s, f), (x) => !f.hasReading ? ({ regions: x.regions.filter((r) => r !== 'manuscript'), actions: ['Read this Work first'], copy: ['MAIA cannot help until she has read this Work.'] }) : ({})) })),
  'D-O11_STALE_AUTO_REFRESH': wrap((o) => { let n = 0; return { arrive: (s, f) => { if (f.readingStale) n += 1; return o.arrive(s, f); }, commissions: () => n }; }),
  'D-O12_ONBOARDING_INSIGHT': wrap((o) => ({ arrive: (s, f) => mut(o.arrive(s, f), (x) => x.discovery ? ({}) : ({ discovery: { observationId: 'dobs_welcome', text: 'Your voice is strongest in the opening.', sectionId: 'ds-1', provenance: 'maia-observation' as const } })) })),
  'D-O13_WORK_ROOT_DASHBOARD': wrap((o) => ({ arrive: (s, f) => mut(o.arrive(s, f), (x) => ({ regions: ['dashboard', 'work', ...x.regions.slice(1)] })) })),
  'D-O14_RESUME_SURVEILLANCE': wrap((o) => { const rows = new Map<string, ResumeState[]>(); return { writeResume: (r) => { const k = `${r.memberId}:${r.workId}`; rows.set(k, [...(rows.get(k) ?? []), r]); }, resumeRows: (m, w) => rows.get(`${m}:${w}`)?.length ?? 0, coldStart: o.coldStart }; }),
  'D-O15_KEEP_WRITING_OPENS_MAIA': wrap((o) => { let n = 0; return { keepWriting: (s: State, f: ArrivalFacts) => { n += 1; return o.keepWriting(s, f); }, commissions: () => n }; }),
};
export const NAMED_KILL: Readonly<Record<string, string>> = {
  'D-O1_HOME_RESURRECTION': 'F8-O4-no-false-home', 'D-O2_DASHBOARD_FIRST': 'F8-O1-work-before-explanation', 'D-O3_TUTORIAL_GATE': 'F8-O7-no-tutorial-required',
  'D-O4_SKILL_LEVEL_GATE': 'F8-O6-no-expertise-test', 'D-O5_AUTO_READ': 'F8-O9-arrival-commissions-nothing', 'D-O6_FABRICATED_RECOGNITION': 'F8-O8-recognition-uses-lawful-sources',
  'D-O7_GLOBAL_LAST_WORK': 'F8-O11-cold-start-never-guesses', 'D-O8_INFERRED_LAST_INTENT': 'F8-O10-returning-copy-needs-durable-fact', 'D-O9_IMPORT_MISATTRIBUTION': 'F8-O12-import-honesty',
  'D-O10_UNREAD_BLOCKS': 'F8-O13-unread-is-inhabitable', 'D-O11_STALE_AUTO_REFRESH': 'F8-O14-stale-disclosed-not-refreshed', 'D-O12_ONBOARDING_INSIGHT': 'F8-O15-discovery-only-from-admitted',
  'D-O13_WORK_ROOT_DASHBOARD': 'F8-O1-work-before-explanation', 'D-O14_RESUME_SURVEILLANCE': 'F8-O16-resume-is-one-row-and-review-cta-is-honest', 'D-O15_KEEP_WRITING_OPENS_MAIA': 'F8-O5-keep-writing-enters-write-at-place',
};
export const CLASSIFIED: Readonly<Record<string, readonly string[]>> = {
  /* Home in the mode list is also a fourth mode — O3 and O4 are the same fact from two sides. */
  'D-O1_HOME_RESURRECTION': ['F8-O3-three-modes-only'],
  /* ⭐ An arrival that reads makes EVERY commission count non-zero: the stale
     law's check and Keep writing's check both read the same counter. */
  'D-O5_AUTO_READ': ['F8-O5-keep-writing-enters-write-at-place', 'F8-O14-stale-disclosed-not-refreshed'],
  /* ⭐ Refreshing on stale arrival is one of the six arrivals O9 sums. */
  'D-O11_STALE_AUTO_REFRESH': ['F8-O9-arrival-commissions-nothing'],
  /* blocking the unread Work also removes Keep writing from the actions O5 reads */
  'D-O10_UNREAD_BLOCKS': [],
};
