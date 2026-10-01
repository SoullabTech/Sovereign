/**
 * H1 — the governed Writer's Studio arrival seam (frozen path, falsifier F8).
 *
 * H1-COHORT-GATE-01 · R2 (founder ruling 2026-10-01): this module is the ONE
 * place a Studio `work=` is interpreted. Everything else either supplies facts
 * to it or consumes what it produces:
 *
 *     URL ──▶ h1Arrival.ts ──▶ resolved arrival ──▶ Home · Write · Review · Develop
 *                  ▲
 *                  └── admission fact ── useHouseStudioH1WorkClaim (transport/state only)
 *
 * It answers one question — *is this supplied Work context authorized?* — and
 * returns the claimed Work id, or null. It never answers "if not, which Work
 * instead?": the existing resolvers (resolveStudioArrival /
 * resolveSituatedWorkContext) receive null and resolve exactly as before H1 (F10).
 *
 * The cohort authority is lib/access/houseStudioH1Access.ts (#1551) and nothing
 * here decides eligibility; the hook brings its verdict across as a fact.
 *
 * ⛔ Transport stays ignorant: query-copying navigations, workspace returns,
 * legacy redirects and MAIA `return=` keep carrying `work=`. Nothing here
 * rewrites a URL on arrival (F9). Removing H1 authority does not require
 * removing H1 syntax.
 *
 * ⛔ Closed during uncertainty (F5): until admission has RESOLVED to
 * `admitted: true`, a `work=` carries exactly the authority it has for a
 * non-admitted member — none.
 *
 * Server-safe (no hooks): the House imports `houseWritingHref` from here.
 */
import { STUDIO_WORK_PARAM, readStudioWorkParam, type StudioSearchParams } from './situatedWork';

/** The admission FACT, as the client knows it. Nothing about who else is admitted, or why. */
export type H1Admission = { admitted: boolean; resolved: boolean };

/** Before the server has answered. Same authority as `admitted: false`. */
export const H1_UNRESOLVED: H1Admission = Object.freeze({ admitted: false, resolved: false });

/** What came back from GET /api/house-studio/admission, as the client observed it. */
export type H1AdmissionOutcome =
  | { kind: 'response'; ok: boolean; body: unknown }
  | { kind: 'failed' };

/** Only a successful response whose body says exactly `admitted: true` admits. */
export function settleH1Admission(outcome: H1AdmissionOutcome): H1Admission {
  if (outcome.kind !== 'response' || !outcome.ok) return { admitted: false, resolved: true };
  const body = outcome.body;
  const admitted =
    typeof body === 'object' && body !== null && (body as { admitted?: unknown }).admitted === true;
  return { admitted, resolved: true };
}

/** True only for a resolved, admitted member. Every other state carries no H1 authority. */
export function hasH1Authority(admission: H1Admission): boolean {
  return admission.resolved && admission.admitted;
}

/**
 * Does this request carry a Work claim the admission fact would decide? The
 * hook uses this to know whether to ask the server at all; it never sees the
 * claim itself.
 */
export function h1AdmissionNeeded(search: StudioSearchParams | null): boolean {
  return search !== null && readStudioWorkParam(search) !== null;
}

/**
 * The single reception choke point. The claimed Work id when the member holds
 * H1 authority; otherwise null. Validating the claim (is it the member's Work,
 * does it declare this manuscript) remains the resolvers' job, unchanged.
 */
export function admittedStudioWorkParam(
  search: StudioSearchParams,
  admission: H1Admission,
): string | null {
  return hasH1Authority(admission) ? readStudioWorkParam(search) : null;
}

/**
 * The resolved arrival every Studio controller consumes.
 *
 *   workId   the authorized Work context, or null (→ ordinary pre-H1 resolution)
 *   pending  a claim is present and admission has not yet resolved
 *
 * `pending` is PRESENTATION TIMING, not authority: while it is true `workId` is
 * already null, so a controller that renders through it resolves exactly as
 * before H1. Home holds "Opening…" on it (unchanged from #1551); the other modes
 * render the ordinary resolution and re-resolve when admission lands.
 */
export function resolveH1Arrival(
  search: StudioSearchParams | null,
  admission: H1Admission,
): { workId: string | null; pending: boolean } {
  if (!search) return { workId: null, pending: false };
  return {
    workId: admittedStudioWorkParam(search, admission),
    pending: h1AdmissionNeeded(search) && !admission.resolved,
  };
}

/** The same Studio query with the Work claim removed — leaving an arrival, not resolving one. */
export function withoutStudioWork(search: string): string {
  const next = new URLSearchParams(search);
  next.delete(STUDIO_WORK_PARAM);
  return next.toString();
}

/**
 * The House's Writing doorway. Admitted: the governed H1 arrival (built by the
 * House with `studioArrivalFromHouse`), or the House-origin link when no living
 * Work is asking. Not admitted: exactly the ordinary crossing — no `from=house`,
 * no `work=` — so the URL never pretends H1 happened (F7).
 */
export function houseWritingHref(
  admitted: boolean,
  livingWorkId: string | null,
  arrival: (workId: string) => string,
): string {
  if (!admitted) return '/writers-studio';
  return livingWorkId ? arrival(livingWorkId) : '/writers-studio?from=house';
}
