import { type ReaderFactory, type World, type Request, type Event } from './contract';

const S = (id: string, subject: string, over: Partial<Extract<Event, { kind: 'settle' }>> = {}): Event => ({
  kind: 'settle', id, member: 'A', work: 'W1', room: 'develop', subject, saidIn: `I settled ${subject}`, versionRef: 'v1', ...over });
const world = (events: Event[], over: Partial<World> = {}): World =>
  ({ work: 'W1', events, currentVersion: { s1: 'v1', s2: 'v1' }, mode: 'ordinary', unchangedSubjects: [], ...over });
const ask = (over: Partial<Request> = {}): Request =>
  ({ member: 'A', room: 'passage_desk', via: 'fresh', candidateSuggestions: ['s1', 's2'], ...over });

export interface Law { id: string; statement: string; check: (f: ReaderFactory) => string | null }
const fail = (c: boolean, msg: string) => (c ? null : msg);

export const LAWS: Law[] = [
  { id: 'L1a-survives-room', statement: 'A decision made in one room is presented in another.',
    check: (f) => { const o = f()(world([S('d1', 's1', { room: 'develop' })]), ask({ room: 'work_conversation' }));
      return fail(o.presented.some((p) => p.id === 'd1'), 'not presented in another room'); } },
  { id: 'L1b-survives-return', statement: 'A decision survives a return (recovered session).',
    check: (f) => { const o = f()(world([S('d1', 's1')]), ask({ via: 'recovered' }));
      return fail(o.presented.some((p) => p.id === 'd1'), 'lost on return'); } },
  { id: 'L2-never-inferred', statement: 'Unchanged wording or silence creates no decision.',
    check: (f) => { const o = f()(world([], { unchangedSubjects: ['s1', 's2'] }), ask());
      return fail(o.presented.length === 0 && o.inferredCreated.length === 0, 'a decision was inferred'); } },
  { id: 'L3a-withdrawn-gone', statement: 'A withdrawn decision is not presented and suppresses nothing.',
    check: (f) => { const o = f()(world([S('d1', 's1'), { kind: 'withdraw', id: 'w1', member: 'A', work: 'W1', targetId: 'd1' }]), ask());
      return fail(o.presented.length === 0 && o.offered.includes('s1'), 'withdrawn decision still active'); } },
  { id: 'L3b-no-revival', statement: 'A withdrawn decision is never silently revived by a later unrelated decision.',
    check: (f) => { const o = f()(world([S('d1', 's1'), { kind: 'withdraw', id: 'w1', member: 'A', work: 'W1', targetId: 'd1' }, S('d2', 's2')]), ask());
      return fail(!o.presented.some((p) => p.id === 'd1') && o.offered.includes('s1'), 'withdrawn decision revived'); } },
  { id: 'L4-not-a-rubric', statement: 'A decision orients; it is never restated as a claim about the text or used to grade it.',
    check: (f) => { const o = f()(world([S('d1', 's1')]), ask()); return fail(!o.usedAsRubric, 'used as a rubric'); } },
  { id: 'L5a-stale-flagged', statement: 'If the text moved since the decision, it is presented as possibly no longer applying.',
    check: (f) => { const o = f()(world([S('d1', 's1')], { currentVersion: { s1: 'v2', s2: 'v1' } }), ask());
      return fail(o.presented.find((p) => p.id === 'd1')?.stale === true, 'stale decision not flagged'); } },
  { id: 'L5b-stale-not-enforced', statement: 'A stale decision does not suppress suggestions.',
    check: (f) => { const o = f()(world([S('d1', 's1')], { currentVersion: { s1: 'v2', s2: 'v1' } }), ask());
      return fail(o.offered.includes('s1'), 'a stale decision still suppresses'); } },
  { id: 'L6a-member-isolation', statement: "Another member's decisions never appear.",
    check: (f) => { const o = f()(world([S('d1', 's1', { member: 'B' })]), ask()); return fail(o.presented.length === 0 && o.offered.includes('s1'), 'crossed members'); } },
  { id: 'L6b-work-isolation', statement: "Another Work's decisions never appear.",
    check: (f) => { const o = f()(world([S('d1', 's1', { work: 'W2' })]), ask()); return fail(o.presented.length === 0 && o.offered.includes('s1'), 'crossed Works'); } },
  { id: 'L6c-sanctuary', statement: 'In Sanctuary nothing is presented and nothing is created.',
    check: (f) => { const o = f()(world([S('d1', 's1')], { mode: 'sanctuary' }), ask());
      return fail(o.presented.length === 0 && o.inferredCreated.length === 0, 'sanctuary leaked a decision'); } },
  { id: 'L7a-not-reoffered', statement: 'A current decision is not re-offered unprompted.',
    check: (f) => { const o = f()(world([S('d1', 's1')]), ask()); return fail(!o.offered.includes('s1') && o.offered.includes('s2'), 'refused suggestion re-offered, or others suppressed'); } },
  { id: 'L7b-still-discussable', statement: 'A decision never forbids discussion; an explicit revisit lifts the suppression.',
    check: (f) => { const o = f()(world([S('d1', 's1')]), ask({ revisit: 's1' }));
      return fail(o.discussable.includes('s1') && o.offered.includes('s1'), 'discussion forbidden or revisit ignored'); } },
];
