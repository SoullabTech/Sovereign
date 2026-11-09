import { type Ask, type ReaderFactory, type World } from './contract';

const sections = [
  { id: 's1', chapter: 'ch1' }, { id: 's2', chapter: 'ch2' }, { id: 's3', chapter: 'ch3' },
];
const base = (over: Partial<World> = {}): World => ({
  work: 'W1', sections,
  saved: { s1: { rev: 1, text: 'Alder keeps the lamp.' }, s2: { rev: 1, text: 'The ferry leaves at dusk.' }, s3: { rev: 1, text: 'Marrow counts the oars.' } },
  events: [], mode: 'ordinary', priorReadingExists: false, ...over,
});
const grantWork = { kind: 'grant', id: 'g1', member: 'A', work: 'W1', level: 'work' } as const;
const ask = (over: Partial<Ask> = {}): Ask => ({ member: 'A', thread: 't1', via: 'fresh', chapter: 'ch2', ...over });
const ids = (r: ReturnType<ReturnType<ReaderFactory>>) => r.supplied.map((s) => s.sectionId).sort().join(',');

export interface Law { id: string; run: (f: ReaderFactory) => boolean }
export const LAWS: readonly Law[] = [
  { id: 'T1-follow-up-gets-saved-chapter-with-scope', run: (f) => {
    const r = f()(base({ events: [grantWork] }), ask()); return ids(r) === 's2' && r.supplied[0]?.text === 'The ferry leaves at dusk.'; } },
  { id: 'T2-consecutive-asks-keep-access', run: (f) => {
    const rd = f(), w = base({ events: [grantWork] });
    return ids(rd(w, ask())) === 's2' && ids(rd(w, ask({ chapter: 'ch3' }))) === 's3' && ids(rd(w, ask({ chapter: 'ch1' }))) === 's1'; } },
  { id: 'T3-recovered-thread-restores-text', run: (f) => ids(f()(base({ events: [grantWork] }), ask({ via: 'recovered' }))) === 's2' },
  { id: 'T4a-current-revision-not-stale', run: (f) => {
    const w = base({ events: [grantWork], saved: { ...base().saved, s2: { rev: 2, text: 'The ferry leaves at dawn.' } } });
    const r = f()(w, ask({ priorQuotedRev: { s2: 1 } })); return r.supplied[0]?.rev === 2 && r.supplied[0]?.text.includes('dawn'); } },
  { id: 'T4b-moved-text-is-acknowledged', run: (f) => {
    const w = base({ events: [grantWork], saved: { ...base().saved, s2: { rev: 2, text: 'x' } } });
    return f()(w, ask({ priorQuotedRev: { s2: 1 } })).movedNotes.includes('s2'); } },
  { id: 'T5a-revoked-gives-no-body', run: (f) => ids(f()(base({ events: [grantWork, { kind: 'revoke', id: 'r1', member: 'A', work: 'W1' }] }), ask())) === '' },
  { id: 'T5b-revocation-effective-mid-thread', run: (f) => {
    const rd = f(); const g = base({ events: [grantWork] });
    const first = ids(rd(g, ask())); const after = base({ events: [grantWork, { kind: 'revoke', id: 'r1', member: 'A', work: 'W1' }] });
    return first === 's2' && ids(rd(after, ask())) === '' && ids(rd(after, ask({ via: 'recovered' }))) === ''; } },
  { id: 'T6-no-scope-crosses-members', run: (f) => ids(f()(base({ events: [grantWork] }), ask({ member: 'B' }))) === '' },
  { id: 'T7-sanctuary-suspends-scope', run: (f) => ids(f()(base({ events: [grantWork], mode: 'sanctuary' }), ask())) === '' },
  { id: 'T9a-every-crossing-receipted-with-scope-event', run: (f) => {
    const r = f()(base({ events: [grantWork] }), ask({ chapter: 'ch1' }));
    return r.supplied.length > 0 && r.supplied.every((s) => r.receipts.some((x) => x.sectionId === s.sectionId && x.rev === s.rev && x.scopeEventId === 'g1')); } },
  { id: 'T9b-no-scope-no-body-no-receipt', run: (f) => { const r = f()(base(), ask()); return r.supplied.length === 0 && r.receipts.length === 0; } },
  { id: 'T10-scope-never-inferred', run: (f) => ids(f()(base({ priorReadingExists: true }), ask())) === '' },
  { id: 'T10b-chapter-scope-bounds-reading', run: (f) =>
    ids(f()(base({ events: [{ kind: 'grant', id: 'g2', member: 'A', work: 'W1', level: 'chapter', chapters: ['ch2'] }] }), ask({ chapter: 'ch3' }))) === '' },
  { id: 'T11-conversational-read-is-not-coverage', run: (f) => f()(base({ events: [grantWork] }), ask()).coverageDischarged === false },
];
