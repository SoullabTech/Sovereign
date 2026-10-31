/**
 * ACAD-2 defeat candidates: each is the smallest competent WRONG core, swapping exactly one
 * decision of the reference. A surviving candidate repairs the SUITE, never the candidate.
 */
import type { AcademyCore, Idea, Moment } from './contract';
import { admitted, checkIdeaShape, checkLibrary, makeReference, selectIdeas, toMoment } from './reference';

export interface Candidate { id: string; name: string; target: string; core: AcademyCore; collateral: Record<string, string> }
const ref = makeReference();
const shape = { rejectForbidden: true, rejectReviewText: true };
const lib = { dangling: true, symmetry: true, oppositeTiers: true, sharedSource: true };

export const CANDIDATES: Candidate[] = [
  { id: 'DC-1', name: 'anchor-blind offer', target: 'AF1', collateral: {},
    core: { ...ref, offer: (a) => ({ moments: a.library.filter((i) => ref.offerable(i, a.ratifications)).sort((x, y) => (x.ideaId < y.ideaId ? -1 : 1)).map((i) => toMoment(i, a)), proposalAdditions: [] }) } },
  { id: 'DC-2', name: 'per-facet re-pick (guided shows only the first)', target: 'AF2',
    collateral: { AF11: 'irreducible: AF11 runs in the default (guided) facet, where per-facet re-picking drops the second idea; same divergence seen through another fixture. Removing it would make the candidate stop re-picking per facet.' },
    core: { ...ref, offer: (a) => { const r = ref.offer(a); return a.facet === 'guided' ? { ...r, moments: r.moments.slice(0, 1) } : r; } } },
  { id: 'DC-3', name: 'level field tolerated', target: 'AF3', collateral: {},
    core: { ...ref, validateIdea: (raw) => checkIdeaShape(raw, { ...shape, rejectForbidden: false }) } },
  { id: 'DC-4', name: 'one-way links tolerated', target: 'AF4a', collateral: {},
    core: { ...ref, validateLibrary: (l) => checkLibrary(l, { ...lib, symmetry: false }) } },
  { id: 'DC-5', name: 'dangling links tolerated', target: 'AF4b', collateral: {},
    core: { ...ref, validateLibrary: (l) => checkLibrary(l, { ...lib, dangling: false }) } },
  { id: 'DC-6', name: 'same-tier links tolerated', target: 'AF4c', collateral: {},
    core: { ...ref, validateLibrary: (l) => checkLibrary(l, { ...lib, oppositeTiers: false }) } },
  { id: 'DC-7', name: 'linked pair may diverge in source', target: 'AF5', collateral: {},
    core: { ...ref, validateLibrary: (l) => checkLibrary(l, { ...lib, sharedSource: false }) } },
  { id: 'DC-8', name: 'moment omits visible source', target: 'AF6', collateral: {},
    core: { ...ref, offer: (a) => { const r = ref.offer(a); return { ...r, moments: r.moments.map((m): Moment => ({ ...m, source: '' })) }; } } },
  { id: 'DC-9', name: 'decline is recorded as a signal in the reading', target: 'AF7', collateral: {},
    core: { ...ref, decline: (s, id) => ({ reading: [...s.reading, `declined:${id}`], proposals: [...s.proposals] }) } },
  { id: 'DC-10', name: 'founder review alone admits', target: 'AF8', collateral: {},
    core: { ...ref, offerable: (i, r) => admitted(i, r, { requireBeta: false }) } },
  { id: 'DC-11', name: 'technique injected into proposal guidance', target: 'AF9', collateral: {},
    core: { ...ref, offer: (a) => { const r = ref.offer(a); return { ...r, proposalAdditions: r.moments.map((m) => m.technique) }; } } },
  { id: 'DC-12', name: 'stored approved flag honoured', target: 'AF10', collateral: {},
    core: { ...ref, offerable: (i, r) => (i as Idea & { approved?: boolean }).approved === true || ref.offerable(i, r) } },
  { id: 'DC-13', name: 'selection ranked by match count', target: 'AF11', collateral: {},
    core: { ...ref, offer: (a) => {
      const picked = selectIdeas(a, (i) => ref.offerable(i, a.ratifications)).sort((x, y) => y.anchorRequirement.length - x.anchorRequirement.length);
      return { moments: picked.map((i) => toMoment(i, a)), proposalAdditions: [] };
    } } },
  { id: 'DC-14', name: 'review may carry the writer\'s passage', target: 'AF12', collateral: {},
    core: { ...ref, validateIdea: (raw) => checkIdeaShape(raw, { ...shape, rejectReviewText: false }) } },
  { id: 'DC-15', name: 'reviewer votes averaged into a consensus', target: 'AF13', collateral: {},
    core: { ...ref, reviewSummary: (i) => ({ ...ref.reviewSummary(i), consensus: i.reviews.filter((r) => r.verdict === 'describes').length / Math.max(1, i.reviews.length) }) } },
  { id: 'DC-16', name: 'selection filtered by writer level', target: 'AF14', collateral: {},
    core: { ...ref, offer: (a) => (a.writerProfile?.level === 'novice' ? { moments: [], proposalAdditions: [] } : ref.offer(a)) } },
  { id: 'DC-17', name: 'Learning facet adds MAIA-written elaboration', target: 'AF15', collateral: {},
    core: { ...ref, offer: (a) => { const r = ref.offer(a); return a.facet !== 'learning' ? r : { ...r, moments: r.moments.map((m) => ({ ...m, elaboration: `Here is why ${m.technique}` } as Moment)) }; } } },
  { id: 'DC-18', name: 'detached course (no way back to the passage)', target: 'AF16', collateral: {},
    core: { ...ref, offer: (a) => { const r = ref.offer(a); return { ...r, moments: r.moments.map((m): Moment => ({ ...m, canReturn: false })) }; } } },
];
