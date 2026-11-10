import { REFERENCE, activeDecisions, emptyOutcome, type ReaderFactory } from './contract';

/** Each candidate is the smallest competent embodiment of ONE named wrong design. */
export interface Candidate { id: string; error: string; mustFail: string; factory: ReaderFactory; classifiedCollateral?: Record<string, string> }
const ref = REFERENCE();

export const CANDIDATES: Candidate[] = [
  { id: 'DC-1-reoffers', error: 'ignores decisions when choosing suggestions', mustFail: 'L7a-not-reoffered',
    factory: () => (w, r) => { const o = ref(w, r); return { ...o, offered: [...r.candidateSuggestions] }; } },
  { id: 'DC-2-infers-from-unchanged', error: 'treats unchanged wording as a decision', mustFail: 'L2-never-inferred',
    factory: () => (w, r) => { const o = ref(w, r); for (const s of w.unchangedSubjects) { o.inferredCreated.push(s); o.presented.push({ id: `inf-${s}`, subject: s, saidIn: '', stale: false }); } return o; } },
  { id: 'DC-3-room-local', error: 'only the room where it was made sees it', mustFail: 'L1a-survives-room',
    factory: () => (w, r) => { const w2 = { ...w, events: w.events.filter((e) => e.kind === 'withdraw' || e.room === r.room) }; return ref(w2, r); },
    classifiedCollateral: {
      'L1b-survives-return': 'a room-local store also loses it for a recovered request in a different room',
      'L5a-stale-flagged': 'a decision invisible to the asking room leaves nothing to flag as stale',
      'L7a-not-reoffered': 'a decision invisible to the asking room necessarily lets the refused suggestion be re-offered',
    } },
  { id: 'DC-4-lost-on-return', error: 'decisions kept only in session state', mustFail: 'L1b-survives-return',
    factory: () => (w, r) => (r.via === 'recovered' ? emptyOutcome(r) : ref(w, r)),
    classifiedCollateral: { 'L7a-not-reoffered': 'losing the decision on return necessarily re-offers the refused suggestion' } },
  { id: 'DC-5-applies-to-changed-text', error: 'enforces a decision against text that has moved', mustFail: 'L5b-stale-not-enforced',
    factory: () => (w, r) => { const o = ref(w, r); for (const p of o.presented) if (p.stale) o.offered = o.offered.filter((s) => s !== p.subject); return o; } },
  { id: 'DC-6-never-flags-stale', error: 'ignores version binding', mustFail: 'L5a-stale-flagged',
    factory: () => (w, r) => { const o = ref(w, r); o.presented = o.presented.map((p) => ({ ...p, stale: false })); return o; } },
  { id: 'DC-7-shared-across-members', error: 'decisions keyed by Work only', mustFail: 'L6a-member-isolation',
    factory: () => (w, r) => { const w2 = { ...w, events: w.events.map((e) => ({ ...e, member: r.member })) }; return ref(w2, r); } },
  { id: 'DC-8-shared-across-works', error: 'decisions keyed by member only', mustFail: 'L6b-work-isolation',
    factory: () => (w, r) => { const w2 = { ...w, events: w.events.map((e) => ({ ...e, work: w.work })) }; return ref(w2, r); } },
  { id: 'DC-9-revives-withdrawn', error: 'withdraw only hides the latest, earlier settle returns', mustFail: 'L3b-no-revival',
    factory: () => (w, r) => { const w2 = { ...w, events: w.events.filter((e) => e.kind !== 'withdraw' || w.events.indexOf(e) === w.events.length - 1) }; return ref(w2, r); },
    classifiedCollateral: { 'L3a-withdrawn-gone': 'a withdraw that is not the last event is dropped, so a plain settle-then-withdraw also revives' } },
  { id: 'DC-10-rubric', error: 'restates the decision as a claim about the text', mustFail: 'L4-not-a-rubric',
    factory: () => (w, r) => { const o = ref(w, r); o.usedAsRubric = o.presented.length > 0; return o; } },
  { id: 'DC-11-works-in-sanctuary', error: 'ignores Sanctuary', mustFail: 'L6c-sanctuary',
    factory: () => (w, r) => ref({ ...w, mode: 'ordinary' }, r) },
  { id: 'DC-12-forbids-discussion', error: 'a decision makes the subject undiscussable', mustFail: 'L7b-still-discussable',
    factory: () => (w, r) => { const o = ref(w, r); for (const p of o.presented) o.discussable = o.discussable.filter((s) => s !== p.subject); return o; } },
  { id: 'DC-13-ignores-revisit', error: 'suppression cannot be lifted by the writer', mustFail: 'L7b-still-discussable',
    factory: () => (w, r) => ref(w, { ...r, revisit: undefined }) },
  { id: 'DC-14-revoke-ignored', error: 'withdrawal is not honoured', mustFail: 'L3a-withdrawn-gone',
    factory: () => (w, r) => ref({ ...w, events: w.events.filter((e) => e.kind !== 'withdraw') }, r),
    classifiedCollateral: { 'L3b-no-revival': 'ignoring every withdraw necessarily revives the withdrawn decision' } },
];
export { activeDecisions };
