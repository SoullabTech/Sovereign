/**
 * H1-COHORT-GATE-01 · fixtures, and the real canon machinery the laws run on.
 *
 * Where canon is pure it is imported, never copied: "ordinary pre-H1
 * resolution" in these laws IS resolveSituatedWorkContext / resolveStudioArrival
 * / modeEntryTarget at the census baseline, so a gate cannot pass by agreeing
 * with a paraphrase of them.
 *
 * The seven delivery paths (§4 ruling) are modelled from the census (§1.2): the
 * legacy redirect and the MAIA return use the real canon functions; the
 * controllers' query-copying navigations are inline in components, so their
 * observable shape (copy the whole query, set a mode) is reproduced here.
 */
import type { LivingWork } from '../../../app/writers-studio/useLivingWorks';
import type { CurrentManuscript } from '../../../app/writers-studio/useCurrentManuscript';
import type { ArrivalManuscript } from '../../../app/writers-studio/situatedWork';
import { STUDIO_WORK_PARAM } from '../../../app/writers-studio/situatedWork';
import { canonicalStudioRoute } from '../../../lib/writersStudio/canonicalStudioRoute';
import type { Env, World } from './contract';

export const ADMITTED = '11111111-1111-4111-8111-111111111111';
export const OUTSIDER = '22222222-2222-4222-8222-222222222222';
export const LAB_ONLY = '33333333-3333-4333-8333-333333333333';

export const OPEN: Env = { H1_ARRIVAL_ENABLED: 'true', H1_ARRIVAL_MEMBER_IDS: ADMITTED };

const work = (id: string, manuscriptIds: string[]): LivingWork => ({
  id, title: `Work ${id}`, purpose: null, form: null, stage: null, manuscriptState: null,
  createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z',
  expressions: manuscriptIds.map((m) => ({ expressionType: 'manuscript', expressionId: m, declaredAt: '2026-09-01T00:00:00Z' })),
  materials: [],
});
const ms = (id: string): CurrentManuscript =>
  ({ id, title: `Manuscript ${id}`, createdAt: '2026-09-01T00:00:00Z', sectionCount: 1, charCount: 10,
     keepCount: 0, lastMemberDraftActivityAt: null, draftCharCount: 10, hasDraftWriting: true, hasWriting: true } as unknown as CurrentManuscript);
const held = (id: string): ArrivalManuscript => ({ id, title: `Manuscript ${id}` });

/**
 * W1 declares M1 · W2 declares M1 and M2 (so M1 is AMBIGUOUS without context)
 * · W3 declares M3 and M4 (a multi-manuscript Work: #1538 requires choice).
 */
export const W1 = work('w1', ['m1']);
export const W2 = work('w2', ['m1', 'm2']);
export const W3 = work('w3', ['m3', 'm4']);

export const WORLD: World = {
  phase: 'ready',
  works: [W1, W2, W3],
  heldPhase: 'ready',
  held: ['m1', 'm2', 'm3', 'm4'].map(held),
  manuscripts: ['m1', 'm2', 'm3', 'm4'].map(ms),
  resume: W3,
};
export const WORLD_NO_RESUME: World = { ...WORLD, resume: null };

/** Requests whose `work=` claim is VALID for the member, so honouring it would show. */
export const CLAIMS: Array<{ label: string; search: string }> = [
  { label: 'develop on ambiguous M1 claiming W2', search: `?mode=develop&m=m1&${STUDIO_WORK_PARAM}=w2` },
  { label: 'review on ambiguous M1 claiming W1', search: `?mode=review&m=m1&${STUDIO_WORK_PARAM}=w1` },
  { label: 'write on ambiguous M1 claiming W2', search: `?mode=write&m=m1&${STUDIO_WORK_PARAM}=w2` },
  { label: 'home claiming multi-manuscript W3', search: `?${STUDIO_WORK_PARAM}=w3` },
  { label: 'home claiming single W1', search: `?from=house&${STUDIO_WORK_PARAM}=w1` },
];

/** The same request with the `work=` parameter absent. */
export function withoutWork(search: string): string {
  const q = new URLSearchParams(search);
  q.delete(STUDIO_WORK_PARAM);
  const s = q.toString();
  return s ? `?${s}` : '';
}

export function hasWork(search: string): boolean {
  return new URLSearchParams(search).has(STUDIO_WORK_PARAM);
}

/** The seven delivery paths a `work=` can arrive by (§4 ruling). Each returns the Studio search. */
export const DELIVERIES: Array<{ label: string; deliver: (search: string) => string }> = [
  { label: 'typed / bookmarked', deliver: (s) => s },
  { label: 'forwarded through Home (onArrivalMode copies the query)', deliver: (s) => copyAndSet(s, { mode: 'write' }) },
  { label: 'forwarded through Develop (updateQuery copies the query)', deliver: (s) => copyAndSet(s, { s: 'section-1' }) },
  { label: 'forwarded through Review (goMode copies the query)', deliver: (s) => copyAndSet(s, { mode: 'review', reviewRun: 'run-1' }) },
  { label: 'legacy redirect /writers-studio/rebuild (canonicalStudioRoute keeps the query)', deliver: legacyRedirect },
  { label: 'workspace return address (pathname + search)', deliver: (s) => new URL(`/writers-studio${s}`, 'http://x').search },
  { label: 'MAIA return= carrying a Studio URL', deliver: maiaReturn },
];

function copyAndSet(search: string, set: Record<string, string>): string {
  const q = new URLSearchParams(search);
  for (const [k, v] of Object.entries(set)) q.set(k, v);
  return `?${q.toString()}`;
}

function legacyRedirect(search: string): string {
  const d = canonicalStudioRoute('/writers-studio/rebuild', search);
  if (d.kind !== 'canonical') throw new Error('legacy route did not canonicalise');
  return new URL(d.href, 'http://x').search;
}

/**
 * The MAIA round trip: the Studio URL travels in `return=` and comes back as a
 * link. Same-origin check as useStudioHandoff.safeReturnHref (reproduced, as
 * that module is a client hook): any `/writers-studio…` path keeps its query.
 */
function maiaReturn(search: string): string {
  const back = `/writers-studio${search}`;
  const handoff = `/maia?return=${encodeURIComponent(back)}`;
  const raw = new URLSearchParams(handoff.slice(handoff.indexOf('?'))).get('return');
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) throw new Error('return rejected');
  return new URL(raw, 'http://x').search;
}
