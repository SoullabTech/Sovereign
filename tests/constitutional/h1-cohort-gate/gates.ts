/**
 * H1-COHORT-GATE-01 · the conforming reference and the defeat candidates.
 *
 * ⛔ The reference is a TEST DOUBLE that proves the laws are jointly
 * satisfiable. It is not the implementation and must never be copied into
 * lib/ or app/ as one: no env reader, endpoint, hook or House change ships
 * from this file.
 *
 * Each candidate is the smallest competent embodiment of ONE wrong design and
 * must die on its named law. Extra kills are allowed only when classified,
 * with the reason narrowing would destroy the error it models.
 */
import { modeEntryTarget } from '../../../app/writers-studio/homeState';
import {
  readStudioWorkParam, resolveSituatedWorkContext, resolveStudioArrival, studioArrivalFromHouse,
} from '../../../app/writers-studio/situatedWork';
import { requestedManuscriptId } from '../../../app/writers-studio/canvasIdentity';
import type { AdmissionResponse, ClientState, Env, H1Gate, ReaderName, ReaderResult, World } from './contract';
import { ADMITTED } from './world';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function referenceAuthority(member: string | null, env: Env): boolean {
  if (!member || !UUID.test(member)) return false;
  if (env.H1_ARRIVAL_ENABLED !== 'true') return false;
  const ids = (env.H1_ARRIVAL_MEMBER_IDS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (ids.some((id) => !UUID.test(id))) return false;
  return ids.map((id) => id.toLowerCase()).includes(member.toLowerCase());
}

function referenceStudioAdmitted(r: AdmissionResponse): boolean {
  if (r.kind !== 'ok') return false;
  const b = r.body as { admitted?: unknown } | null;
  return typeof b === 'object' && b !== null && b.admitted === true;
}

/** The single reception choke point: only an admitted member's claim has authority. */
const admittedWork = (search: string, admitted: boolean) => (admitted ? readStudioWorkParam(search) : null);

function readersWith(work: (search: string, admitted: boolean) => string | null) {
  const situated = (search: string, admitted: boolean, w: World): ReaderResult =>
    resolveSituatedWorkContext(w.phase, w.works, requestedManuscriptId(search), work(search, admitted));
  return {
    home: (search: string, admitted: boolean, w: World): ReaderResult =>
      resolveStudioArrival(w.phase, w.works, w.heldPhase, w.held, work(search, admitted)),
    develop: situated,
    review: situated,
    writeEdit: situated,
  } satisfies Record<ReaderName, (s: string, a: boolean, w: World) => ReaderResult>;
}

export function makeReference(name = 'REFERENCE'): H1Gate {
  return {
    name,
    authority: referenceAuthority,
    houseAdmits: (m, env) => referenceAuthority(m, env),
    houseHref: (m, env, w) =>
      referenceAuthority(m, env) ? (w ? studioArrivalFromHouse(w) : '/writers-studio?from=house') : '/writers-studio',
    endpoint: (m, env) =>
      m ? { kind: 'ok', body: { admitted: referenceAuthority(m, env) } } : { kind: 'status', status: 401 },
    studioAdmitted: (r: AdmissionResponse, _client: ClientState) => referenceStudioAdmitted(r),
    readers: readersWith(admittedWork),
    modeEntry: (w) => modeEntryTarget(w.resume, w.manuscripts),
  };
}

export const REFERENCE = makeReference();

export interface Candidate {
  gate: H1Gate;
  killedBy: string;
  /** law → why the kill is an irreducible consequence of the modelled error */
  collateral?: Record<string, string>;
}

const honoursEveryClaim = (search: string) => readStudioWorkParam(search);
const FACET =
  'facet of the same error: this law also asks whether a non-admitted reader honours work=, and the candidate is defined by a reader that does';

export const CANDIDATES: Record<string, Candidate> = {
  'DC-H1 House-only gate (Studio honours typed work=)': {
    killedBy: 'F1 supplied-work equivalence',
    collateral: { 'F4 universal reader choke point': FACET, 'F5 fail closed': FACET, 'F9 authority ≠ URL mutation': FACET },
    gate: { ...makeReference('DC-H1'), readers: readersWith((s) => honoursEveryClaim(s)) },
  },
  'DC-H2 admission derived from client state': {
    killedBy: 'F2 server identity authority',
    gate: {
      ...makeReference('DC-H2'),
      studioAdmitted: (r, client) => {
        const q = new URLSearchParams(client.search);
        if (q.get('h1') === '1' || q.get('admitted') === 'true') return true;
        if (client.storage.h1Admitted === 'true') return true;
        if (client.claimedMemberId === ADMITTED) return true;
        return referenceStudioAdmitted(r);
      },
    },
  },
  'DC-H3 House keeps its own eligibility list': {
    killedBy: 'F3 single cohort authority',
    gate: (() => {
      const houseOwn = (m: string, env: Env) =>
        (env.H1_HOUSE_MEMBER_IDS ?? env.H1_ARRIVAL_MEMBER_IDS ?? '').split(',').map((s) => s.trim()).includes(m);
      return {
        ...makeReference('DC-H3'),
        houseAdmits: houseOwn,
        houseHref: (m: string, env: Env, w: string | null) =>
          houseOwn(m, env) ? (w ? studioArrivalFromHouse(w) : '/writers-studio?from=house') : '/writers-studio',
      };
    })(),
  },
  'DC-H4 one reader bypasses the choke point (Review reads work= directly)': {
    killedBy: 'F4 universal reader choke point',
    collateral: { 'F1 supplied-work equivalence': FACET, 'F5 fail closed': FACET, 'F9 authority ≠ URL mutation': FACET },
    gate: (() => {
      const g = makeReference('DC-H4');
      const bypass = readersWith((s) => honoursEveryClaim(s));
      return { ...g, readers: { ...g.readers, review: bypass.review } };
    })(),
  },
  'DC-H5 fail-open (missing config opens; loading counts as admitted)': {
    killedBy: 'F5 fail closed',
    gate: (() => {
      // Correct when the configuration is trustworthy; OPEN when it is missing or
      // malformed, and optimistic while the decision is still loading. (A first
      // version ignored the allowlist altogether: that is broad exposure, not
      // fail-open, and the matrix flagged it as unclassified collateral.)
      const failOpen = (m: string | null, env: Env): boolean => {
        if (!m || !UUID.test(m)) return false;
        const e = env.H1_ARRIVAL_ENABLED;
        if (e === 'false') return false;
        if (e !== 'true') return true;
        const ids = (env.H1_ARRIVAL_MEMBER_IDS ?? '').split(',').map((x) => x.trim()).filter(Boolean);
        if (ids.length === 0 || ids.some((id) => !UUID.test(id))) return true;
        return ids.map((id) => id.toLowerCase()).includes(m.toLowerCase());
      };
      return {
        ...makeReference('DC-H5'),
        authority: failOpen,
        houseAdmits: (m: string, env: Env) => failOpen(m, env),
        endpoint: (m: string | null, env: Env): AdmissionResponse =>
          (m ? { kind: 'ok', body: { admitted: failOpen(m, env) } } : { kind: 'status', status: 401 }),
        studioAdmitted: (r: AdmissionResponse) => r.kind === 'loading' || referenceStudioAdmitted(r),
      };
    })(),
  },
  'DC-H6 gate changes #1538 for non-admitted members': {
    killedBy: 'F6 population-neutral #1538',
    gate: {
      ...makeReference('DC-H6'),
      modeEntry: (w, admitted) => {
        const t = modeEntryTarget(w.resume, w.manuscripts);
        return !admitted && t.kind === 'choose' ? { kind: 'open', manuscriptId: t.manuscriptIds[0] ?? '' } : t;
      },
    },
  },
  'DC-H7 non-admitted no-Work House link still says from=house': {
    killedBy: 'F7 truthful House provenance',
    gate: {
      ...makeReference('DC-H7'),
      houseHref: (m, env, w) =>
        referenceAuthority(m, env) ? (w ? studioArrivalFromHouse(w) : '/writers-studio?from=house')
          : w ? '/writers-studio' : '/writers-studio?from=house',
    },
  },
  'DC-H9 strips work= from the URL instead of removing its authority': {
    killedBy: 'F9 authority ≠ URL mutation',
    collateral: { 'F4 universal reader choke point': FACET, 'F5 fail closed': FACET },
    gate: {
      ...makeReference('DC-H9'),
      normalizeUrl: (s, admitted) => {
        if (admitted) return s;
        const q = new URLSearchParams(s);
        q.delete('work');
        const t = q.toString();
        return t ? `?${t}` : '';
      },
      readers: readersWith((s) => honoursEveryClaim(s)),
    },
  },
  'DC-H10 gate invents its own fallback for non-admitted members': {
    killedBy: 'F10 no new fallback algorithm',
    gate: (() => {
      const g = makeReference('DC-H10');
      const sensible = (r: ReaderResult, w: World): ReaderResult => {
        if (r.kind === 'ambiguous') return { kind: 'work', work: r.works[0]!, authority: 'relationship_inferred' };
        if (r.kind === 'fallback' && w.resume) {
          const id = w.resume.expressions[0]?.expressionId ?? '';
          return { kind: 'one', work: w.resume, manuscript: { id, title: `Manuscript ${id}` } };
        }
        return r;
      };
      const wrap = (fn: (s: string, a: boolean, w: World) => ReaderResult) =>
        (s: string, a: boolean, w: World) => (a ? fn(s, a, w) : sensible(fn(s, a, w), w));
      return {
        ...g,
        readers: { home: wrap(g.readers.home), develop: wrap(g.readers.develop), review: wrap(g.readers.review), writeEdit: wrap(g.readers.writeEdit) },
      };
    })(),
  },
};

/**
 * Not a defeat candidate: canon as it stands at the census baseline (no gate).
 * The House always emits the arrival and every reader honours every claim.
 * It must FAIL the suite; if it passed, the suite could not see the defect
 * this lane exists to close.
 */
export const CANON_TODAY: H1Gate = {
  ...makeReference('CANON_TODAY'),
  authority: (m) => !!m,
  houseAdmits: () => true,
  houseHref: (_m, _env, w) => (w ? studioArrivalFromHouse(w) : '/writers-studio?from=house'),
  endpoint: (m) => (m ? { kind: 'ok', body: { admitted: true } } : { kind: 'status', status: 401 }),
  studioAdmitted: () => true,
  readers: readersWith((s) => honoursEveryClaim(s)),
};
