/**
 * H1-COHORT-GATE-01 · the frozen falsifier laws (founder ruling, §4 + additions).
 *
 * Each law returns null when it holds, or a reason string when it is broken.
 * A law is evidence only if some wrong design breaks it (matrix.ts proves that).
 *
 *   F1  supplied-work equivalence     F6  population-neutral #1538
 *   F2  server identity authority     F7  truthful House provenance
 *   F3  single cohort authority       F8  producer containment (structural.ts)
 *   F4  universal reader choke point  F9  authority ≠ URL mutation
 *   F5  fail closed                   F10 no new fallback algorithm
 *
 * F10 is the founder's added invariant ("H1 admission can change which explicit
 * context is authoritative; it cannot create a new fallback resolution
 * algorithm"). It needs its own law: a gate that replaces the fallback for
 * EVERY non-admitted member passes F1, because with and without `work=` it
 * returns the same invented answer.
 */
import { modeEntryTarget } from '../../../app/writers-studio/homeState';
import { resolveSituatedWorkContext, resolveStudioArrival, studioArrivalFromHouse } from '../../../app/writers-studio/situatedWork';
import { requestedManuscriptId } from '../../../app/writers-studio/canvasIdentity';
import type { AdmissionResponse, ClientState, Env, H1Gate, ReaderName, ReaderResult, World } from './contract';
import { ADMITTED, CLAIMS, DELIVERIES, LAB_ONLY, OPEN, OUTSIDER, WORLD, WORLD_NO_RESUME, W3, hasWork, withoutWork } from './world';

export type Law = (g: H1Gate) => string | null;

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const READERS: ReaderName[] = ['home', 'develop', 'review', 'writeEdit'];
const NO_CLIENT: ClientState = { search: '', storage: {} };

/** What the Studio believes for a member, through the gate's own carrier. */
function studioBelief(g: H1Gate, member: string | null, env: Env, client: ClientState = NO_CLIENT): boolean {
  return g.studioAdmitted(g.endpoint(member, env), client);
}

/** Canon's pre-H1 resolution for a request (the claim removed), reader by reader. */
export function canonPreH1(reader: ReaderName, search: string, world: World): ReaderResult {
  if (reader === 'home') return resolveStudioArrival(world.phase, world.works, world.heldPhase, world.held, null);
  return resolveSituatedWorkContext(world.phase, world.works, requestedManuscriptId(search), null);
}

export const LAWS: Record<string, Law> = {
  /** A non-admitted member's supplied work= resolves exactly as its absence, by every delivery path. */
  'F1 supplied-work equivalence': (g) => {
    const admitted = studioBelief(g, OUTSIDER, OPEN);
    for (const c of CLAIMS) for (const d of DELIVERIES) for (const r of READERS) {
      const arrive = (s: string) => (g.normalizeUrl ? g.normalizeUrl(s, admitted) : s);
      const withW = g.readers[r](arrive(d.deliver(c.search)), admitted, WORLD);
      const without = g.readers[r](arrive(d.deliver(withoutWork(c.search))), admitted, WORLD);
      if (!same(withW, without)) return `${r} via ${d.label} (${c.label}): supplied work= changed the result`;
    }
    return null;
  },

  /** No URL, storage or claimed identity grants admission; the endpoint uses verified identity only. */
  'F2 server identity authority': (g) => {
    const tampered: ClientState[] = [
      { search: '?h1=1', storage: {} },
      { search: '?admitted=true&work=w2', storage: {} },
      { search: '', storage: { h1Admitted: 'true', h1_arrival: '1' } },
      { search: '', storage: {}, claimedMemberId: ADMITTED },
    ];
    for (const client of tampered) {
      if (studioBelief(g, OUTSIDER, OPEN, client)) return `client state admitted an outsider: ${JSON.stringify(client)}`;
      if (studioBelief(g, null, OPEN, client)) return `client state admitted a signed-out request: ${JSON.stringify(client)}`;
    }
    return null;
  },

  /** House and Studio consume one decision: over a grid they always agree with the authority. */
  'F3 single cohort authority': (g) => {
    const envs: Env[] = [
      OPEN, {}, { H1_ARRIVAL_ENABLED: 'false', H1_ARRIVAL_MEMBER_IDS: ADMITTED },
      { H1_ARRIVAL_ENABLED: 'true', H1_ARRIVAL_MEMBER_IDS: `${ADMITTED},${OUTSIDER}` },
      { H1_ARRIVAL_ENABLED: 'true', H1_ARRIVAL_MEMBER_IDS: OUTSIDER },
      { ...OPEN, H1_HOUSE_MEMBER_IDS: OUTSIDER, LAB_ACCESS_MEMBER_IDS: OUTSIDER },
    ];
    for (const env of envs) for (const m of [ADMITTED, OUTSIDER, LAB_ONLY]) {
      const a = g.authority(m, env);
      if (g.houseAdmits(m, env) !== a) return `House decided ${!a} where the authority decided ${a} (${m.slice(0, 4)}, ${JSON.stringify(env)})`;
      if (studioBelief(g, m, env) !== a) return `Studio believed ${!a} where the authority decided ${a} (${m.slice(0, 4)}, ${JSON.stringify(env)})`;
    }
    return null;
  },

  /** Each reader on its own: a non-admitted work= has no authority. */
  'F4 universal reader choke point': (g) => {
    for (const c of CLAIMS) for (const r of READERS) {
      if (!same(g.readers[r](c.search, false, WORLD), g.readers[r](withoutWork(c.search), false, WORLD))) {
        return `reader ${r} honoured work= for a non-admitted member (${c.label})`;
      }
    }
    return null;
  },

  /** Loading, errors, malformed responses and absent or malformed config all mean not admitted. */
  'F5 fail closed': (g) => {
    const responses: AdmissionResponse[] = [
      { kind: 'loading' }, { kind: 'status', status: 401 }, { kind: 'status', status: 403 },
      { kind: 'status', status: 500 }, { kind: 'network-error' }, { kind: 'timeout' },
      { kind: 'ok', body: null }, { kind: 'ok', body: {} }, { kind: 'ok', body: { admitted: 'true' } },
      { kind: 'ok', body: { admitted: 1 } }, { kind: 'ok', body: 'admitted' }, { kind: 'ok', body: { admitted: false } },
    ];
    for (const r of responses) if (g.studioAdmitted(r, NO_CLIENT)) return `response ${JSON.stringify(r)} was treated as admitted`;
    const configs: Env[] = [
      {}, { H1_ARRIVAL_MEMBER_IDS: ADMITTED }, { H1_ARRIVAL_ENABLED: 'yes', H1_ARRIVAL_MEMBER_IDS: ADMITTED },
      { H1_ARRIVAL_ENABLED: 'TRUE', H1_ARRIVAL_MEMBER_IDS: ADMITTED }, { H1_ARRIVAL_ENABLED: 'true' },
      { H1_ARRIVAL_ENABLED: 'true', H1_ARRIVAL_MEMBER_IDS: '' },
      { H1_ARRIVAL_ENABLED: 'true', H1_ARRIVAL_MEMBER_IDS: `${ADMITTED},not-a-uuid` },
    ];
    for (const env of configs) for (const m of [ADMITTED, OUTSIDER]) {
      if (g.authority(m, env)) return `config ${JSON.stringify(env)} admitted ${m.slice(0, 4)}`;
    }
    if (g.authority(null, OPEN)) return 'a missing identity was admitted';
    // the founder's rule: never a transient moment where work= is honoured before admission resolves
    const whileLoading = g.studioAdmitted({ kind: 'loading' }, NO_CLIENT);
    for (const c of CLAIMS) for (const r of READERS) {
      if (!same(g.readers[r](c.search, whileLoading, WORLD), g.readers[r](withoutWork(c.search), whileLoading, WORLD))) {
        return `work= acquired authority while admission was loading (${r}, ${c.label})`;
      }
    }
    return null;
  },

  /** #1538 is universal: mode entry and multi-manuscript arrival never depend on the cohort. */
  'F6 population-neutral #1538': (g) => {
    for (const world of [WORLD, WORLD_NO_RESUME]) for (const admitted of [true, false]) {
      if (!same(g.modeEntry(world, admitted), modeEntryTarget(world.resume, world.manuscripts))) {
        return `mode entry differs from canon #1538 for admitted=${admitted}`;
      }
    }
    const arrival = g.readers.home(`?work=${W3.id}`, true, WORLD);
    if (arrival.kind !== 'several') return `admitted arrival on a multi-manuscript Work was "${arrival.kind}", not a choice`;
    return null;
  },

  /** A non-admitted House emits exactly the ordinary crossing; it never pretends H1 happened. */
  'F7 truthful House provenance': (g) => {
    for (const w of ['w1', null]) {
      const href = g.houseHref(OUTSIDER, OPEN, w);
      if (href !== '/writers-studio') return `non-admitted House emitted ${href} (living Work: ${w})`;
    }
    if (g.houseHref(ADMITTED, OPEN, 'w1') !== studioArrivalFromHouse('w1')) return 'admitted House did not emit the governed arrival';
    if (g.houseHref(ADMITTED, OPEN, null) !== '/writers-studio?from=house') return 'admitted no-Work House link changed';
    return null;
  },

  /** Authority is removed without rewriting the URL, and readers ignore work= on the untouched URL. */
  'F9 authority ≠ URL mutation': (g) => {
    for (const c of CLAIMS) {
      if (g.normalizeUrl) {
        for (const admitted of [true, false]) {
          if (g.normalizeUrl(c.search, admitted) !== c.search) return `the design rewrites the URL on arrival (${c.label})`;
        }
      }
      if (!hasWork(c.search)) return 'fixture lost its work=';
      for (const r of READERS) {
        if (!same(g.readers[r](c.search, false, WORLD), g.readers[r](withoutWork(c.search), false, WORLD))) {
          return `reader ${r} honours work= on the original, unrewritten URL (${c.label})`;
        }
      }
    }
    return null;
  },

  /** Rejecting work= hands control back to canon's pre-H1 resolution, unchanged. */
  'F10 no new fallback algorithm': (g) => {
    for (const world of [WORLD, WORLD_NO_RESUME]) for (const c of CLAIMS) for (const r of READERS) {
      const s = withoutWork(c.search);
      if (!same(g.readers[r](s, false, world), canonPreH1(r, s, world))) {
        return `non-admitted ${r} differs from canon pre-H1 resolution (${c.label})`;
      }
    }
    return null;
  },
};
