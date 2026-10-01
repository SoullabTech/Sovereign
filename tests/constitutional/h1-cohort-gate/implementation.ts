/**
 * H1-COHORT-GATE-01 · the REAL implementation, seen through the falsifier seam.
 *
 * Unlike gates.ts, nothing here is a double: authority, endpoint, admission
 * settlement, the reception choke point and the House doorway are the shipped
 * modules. The only composition done here is the one each Studio controller
 * does — choke point → canon resolver — and `controllerWiring()` checks the
 * controllers really do it, so this gate cannot drift from them silently.
 */
import { canUseH1Arrival, h1AdmissionResponse } from '../../../lib/access/h1ArrivalAccess';
import {
  H1_UNRESOLVED, admittedStudioWorkParam, hasH1Authority, houseWritingHref, settleH1Admission,
  type H1Admission,
} from '../../../app/writers-studio/h1Arrival';
import { modeEntryTarget } from '../../../app/writers-studio/homeState';
import {
  resolveSituatedWorkContext, resolveStudioArrival, studioArrivalFromHouse,
} from '../../../app/writers-studio/situatedWork';
import { requestedManuscriptId } from '../../../app/writers-studio/canvasIdentity';
import type { AdmissionResponse, H1Gate, ReaderResult, World } from './contract';
import { stripComments, type SourceMap } from './structural';

/** What the client hook settles to for each observed response. */
export function clientAdmission(r: AdmissionResponse): H1Admission {
  switch (r.kind) {
    case 'loading': return H1_UNRESOLVED;
    case 'ok': return settleH1Admission({ kind: 'response', ok: true, body: r.body });
    // A non-2xx carrying an admitting body must still close.
    case 'status': return settleH1Admission({ kind: 'response', ok: false, body: { admitted: true } });
    case 'network-error':
    case 'timeout': return settleH1Admission({ kind: 'failed' });
  }
}

const stateOf = (admitted: boolean): H1Admission => ({ admitted, resolved: true });

const situated = (search: string, admitted: boolean, w: World): ReaderResult =>
  resolveSituatedWorkContext(
    w.phase, w.works, requestedManuscriptId(search), admittedStudioWorkParam(search, stateOf(admitted)),
  );

export const IMPLEMENTATION: H1Gate = {
  name: 'IMPLEMENTATION',
  authority: (m, env) => canUseH1Arrival(m, env),
  houseAdmits: (m, env) => canUseH1Arrival(m, env),
  houseHref: (m, env, w) => houseWritingHref(canUseH1Arrival(m, env), w, studioArrivalFromHouse),
  endpoint: (m, env) => {
    const r = h1AdmissionResponse(m, env);
    return r.status === 200 ? { kind: 'ok', body: r.body } : { kind: 'status', status: r.status };
  },
  studioAdmitted: (r) => hasH1Authority(clientAdmission(r)),
  readers: {
    home: (search, admitted, w) =>
      resolveStudioArrival(w.phase, w.works, w.heldPhase, w.held, admittedStudioWorkParam(search, stateOf(admitted))),
    develop: situated,
    review: situated,
    writeEdit: situated,
  },
  modeEntry: (w) => modeEntryTarget(w.resume, w.manuscripts),
};

const CONTROLLERS: Record<string, RegExp> = {
  'app/dev/writers-studio-pc3-live/P4R1HomeController.tsx':
    /carriedWorkId = params \? admittedStudioWorkParam\(params, h1\) : null;[\s\S]*resolveStudioArrival\([\s\S]*?carriedWorkId,?\s*\)/,
  'app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx':
    /resolveSituatedWorkContext\([^)]*params \? admittedStudioWorkParam\(params, h1\) : null/,
  'app/dev/writers-studio-pc3-live/P4R1ReviewController.tsx':
    /resolveSituatedWorkContext\([^)]*params \? admittedStudioWorkParam\(params, h1\) : null/,
  'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx':
    /resolveSituatedWorkContext\([^)]*params \? admittedStudioWorkParam\(params, h1\) : null/,
};

/** Every Studio reader feeds the canon resolver from the choke point, with the hook's state. */
export function controllerWiring(files: SourceMap): string | null {
  for (const [path, re] of Object.entries(CONTROLLERS)) {
    const src = files[path];
    if (src === undefined) return `${path} is missing`;
    const code = stripComments(src);
    if (!code.includes('const h1 = useH1Arrival();')) return `${path} does not take admission from useH1Arrival`;
    if (!re.test(code)) return `${path} does not resolve through admittedStudioWorkParam`;
  }
  return null;
}
