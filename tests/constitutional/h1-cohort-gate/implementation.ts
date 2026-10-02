/**
 * H1-COHORT-GATE-01 · the REAL implementation, seen through the falsifier seam.
 *
 * R2 (convergence): the cohort authority is canon's #1551
 * `lib/access/houseStudioH1Access.ts`, the endpoint core is its
 * `houseStudioH1AdmissionResponse`, and the arrival is produced only by the
 * governed seam `app/writers-studio/h1Arrival.ts`. Nothing here is a double.
 *
 * ⚠️ The frozen laws (61f77602) name the cohort configuration with ABSTRACT keys
 * `H1_ARRIVAL_ENABLED` / `H1_ARRIVAL_MEMBER_IDS`. They are fixtures, not runtime
 * names: `configOf` maps them onto the authority's one configuration
 * (HOUSE_STUDIO_H1_*). Any other key in a law's env — e.g. F3's
 * `H1_HOUSE_MEMBER_IDS`, `LAB_ACCESS_MEMBER_IDS` — is deliberately NOT mapped, so a
 * second eligibility source still has nowhere to enter.
 *
 * `controllerWiring()` checks the four shipped controllers consume the seam's
 * resolved arrival exactly as composed here, so this gate cannot drift from them.
 */
import {
  decideHouseStudioH1, houseStudioH1AdmissionResponse, type HouseStudioH1Config,
} from '../../../lib/access/houseStudioH1Access';
import {
  H1_UNRESOLVED, hasH1Authority, houseWritingHref, resolveH1Arrival, settleH1Admission,
  type H1Admission,
} from '../../../app/writers-studio/h1Arrival';
import { modeEntryTarget } from '../../../app/writers-studio/homeState';
import {
  resolveSituatedWorkContext, resolveStudioArrival, studioArrivalFromHouse,
} from '../../../app/writers-studio/situatedWork';
import { requestedManuscriptId } from '../../../app/writers-studio/canvasIdentity';
import type { AdmissionResponse, Env, H1Gate, ReaderResult, World } from './contract';
import { stripComments, type SourceMap } from './structural';

const configOf = (env: Env): HouseStudioH1Config => ({
  enabled: env.H1_ARRIVAL_ENABLED,
  memberIds: env.H1_ARRIVAL_MEMBER_IDS,
});

/** What the hook settles to for each observed response. */
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
const carried = (search: string, admitted: boolean) => resolveH1Arrival(search, stateOf(admitted)).workId;

const situated = (search: string, admitted: boolean, w: World): ReaderResult =>
  resolveSituatedWorkContext(w.phase, w.works, requestedManuscriptId(search), carried(search, admitted));

export const IMPLEMENTATION: H1Gate = {
  name: 'IMPLEMENTATION',
  authority: (m, env) => decideHouseStudioH1(m, configOf(env)),
  houseAdmits: (m, env) => decideHouseStudioH1(m, configOf(env)),
  houseHref: (m, env, w) => houseWritingHref(decideHouseStudioH1(m, configOf(env)), w, studioArrivalFromHouse),
  endpoint: (m, env) => {
    const r = houseStudioH1AdmissionResponse(m, configOf(env));
    return r.status === 200 ? { kind: 'ok', body: r.body } : { kind: 'status', status: r.status };
  },
  studioAdmitted: (r) => hasH1Authority(clientAdmission(r)),
  readers: {
    home: (search, admitted, w) =>
      resolveStudioArrival(w.phase, w.works, w.heldPhase, w.held, carried(search, admitted)),
    develop: situated,
    review: situated,
    writeEdit: situated,
  },
  modeEntry: (w) => modeEntryTarget(w.resume, w.manuscripts),
};

const HOOK_CALL = 'const h1 = useHouseStudioH1WorkClaim(h1AdmissionNeeded(params));';
const CONTROLLERS: Record<string, RegExp> = {
  'app/dev/writers-studio-pc3-live/P4R1HomeController.tsx':
    /const \{ workId: carriedWorkId, pending: h1AdmissionChecking \} = resolveH1Arrival\(params, h1\);[\s\S]*?resolveStudioArrival\([^;]*carriedWorkId,?\s*\)/,
  'app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx':
    /const \{ workId: carriedWorkId \} = resolveH1Arrival\(params, h1\);[\s\S]*?resolveSituatedWorkContext\([^;]*carriedWorkId,?\s*\)/,
  'app/dev/writers-studio-pc3-live/P4R1ReviewController.tsx':
    /const \{ workId: carriedWorkId \} = resolveH1Arrival\(params, h1\);[\s\S]*?resolveSituatedWorkContext\([^;]*carriedWorkId,?\s*\)/,
  'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx':
    /const \{ workId: carriedWorkId \} = resolveH1Arrival\(params, h1\);[\s\S]*?resolveSituatedWorkContext\([^;]*carriedWorkId,?\s*\)/,
};

/** Every Studio reader takes the admission fact from the hook and the arrival from the seam. */
export function controllerWiring(files: SourceMap): string | null {
  for (const [path, re] of Object.entries(CONTROLLERS)) {
    const src = files[path];
    if (src === undefined) return `${path} is missing`;
    const code = stripComments(src);
    if (!code.includes(HOOK_CALL)) return `${path} does not take the admission fact through the seam's h1AdmissionNeeded`;
    if (!re.test(code)) return `${path} does not resolve through the seam's resolved arrival`;
    if ((code.match(/resolveH1Arrival\(/g) ?? []).length !== 1) return `${path} resolves the arrival more than once`;
  }
  return null;
}
