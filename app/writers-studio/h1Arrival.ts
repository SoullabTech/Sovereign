/**
 * H1-COHORT-GATE-01 · the H1 authority seam (frozen path, falsifier law F8).
 *
 * This module OWNS the interpretation of a Studio `work=`. Every Studio reader
 * asks it one question:
 *
 *     Is this supplied Work context authorized?
 *
 * and gets back the claimed Work id, or null. It never answers "if not, which
 * Work should we use instead?" — that is the existing Studio resolution
 * machinery's job (resolveStudioArrival / resolveSituatedWorkContext), which
 * receives null and resolves exactly as it would have before H1 (F10):
 *
 *     URL work claim → this seam → authorized Work id OR null → existing resolution
 *
 * ⛔ Transport stays ignorant. Develop/Review query preservation, workspace
 * return addresses, legacy redirects and MAIA `return=` keep carrying `work=`;
 * nothing here rewrites a URL (F9). Removing H1 authority does not require
 * removing H1 syntax.
 *
 * ⛔ Closed during uncertainty (F5). Until admission has RESOLVED to
 * `admitted: true` from the server, a `work=` has exactly the authority it has
 * for a non-admitted member: none.
 *
 * Server-safe (no hooks): the House imports `houseWritingHref` from here. The
 * client hook lives in useH1Arrival.ts.
 */
import { readStudioWorkParam } from './situatedWork';

/** What the browser may know. Nothing about who else is admitted, or why. */
export type H1Admission = { admitted: boolean; resolved: boolean };

/** The state before the server has answered. Same authority as `admitted: false`. */
export const H1_UNRESOLVED: H1Admission = Object.freeze({ admitted: false, resolved: false });

/** What came back from the admission endpoint, as the client observed it. */
export type H1AdmissionOutcome =
  | { kind: 'response'; ok: boolean; body: unknown }
  | { kind: 'failed' };

/** Settle an outcome. Only a successful response whose body says exactly `admitted: true` admits. */
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
 * The single reception choke point. The claimed Work id when the member holds
 * H1 authority; otherwise null, so the caller resolves exactly as before H1.
 * Validation of the claim (is it the member's Work, does it declare this
 * manuscript) remains the resolvers' job, unchanged.
 */
export function admittedStudioWorkParam(
  search: string | URLSearchParams,
  admission: H1Admission,
): string | null {
  return hasH1Authority(admission) ? readStudioWorkParam(search) : null;
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
