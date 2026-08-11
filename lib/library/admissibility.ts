/**
 * HOUSE-SOURCE ADMISSIBILITY — the member-facing compositional gate.
 *
 * Two different boundaries live in this service. Do not merge them:
 *
 *   PLATFORM_ONLY_PREDICATE  = universal ownership/SAFETY invariant.
 *                              Applies to ALL callers, unconditionally.
 *   admission gate (here)    = member-facing compositional SCOPE.
 *                              Applies only to searchAdmitted().
 *
 * ADMISSION IDENTITY (founder ruling 2026-08-11):
 *
 *     source_id + source_checksum + scope + latest append-only judgment
 *
 * => admission is SOURCE-VERSION-SPECIFIC and PURPOSE-SPECIFIC.
 *
 * The checksum equality in the join is the load-bearing line of this file. It
 * makes "a changed source does not inherit prior admission" a structural fact
 * rather than an operational promise: if the bytes change, the checksum changes,
 * the join fails, and the admission goes inert with no sweep job and no operator
 * memory involved.
 *
 * Spec: docs/specs/HOUSE_SOURCE_ADMISSIBILITY_RECORD_PLAN_2026-08-11.md
 * Migration: database/migrations/20260812000001_house_source_admissibility.sql
 */

/** Append-only judgment states. Absence of a row IS `unreviewed` — the gate
 *  tests for `admitted`, so both absence and any non-admitted state fail closed. */
export type AdmissibilityState = 'unreviewed' | 'admitted' | 'excluded' | 'superseded';

export const ADMISSIBILITY_STATES: readonly AdmissibilityState[] = [
  'unreviewed', 'admitted', 'excluded', 'superseded',
] as const;

/**
 * Purpose of an admission. CHECK-constrained in the schema: widening this
 * vocabulary requires a migration, which is a ledgered, reviewed, never-editable
 * act. That is deliberate — it makes "a new scope needs a governance decision" a
 * structural fact. No other surface inherits a member_wisdom_retrieval admission.
 */
export type AdmissionScope = 'member_wisdom_retrieval';

export const ADMISSION_SCOPES: readonly AdmissionScope[] = ['member_wisdom_retrieval'] as const;

export const DEFAULT_ADMISSION_SCOPE: AdmissionScope = 'member_wisdom_retrieval';

/**
 * What MAIA may DO with an admitted source — distinct from whether she may
 * consult it at all.
 *
 * ⚠️ `unrestricted` means broad permission WITHIN the admitted scope. It does
 * NOT mean public domain, relinquished copyright, transferred ownership, or
 * third-party licensing. The author retains copyright in full. Any UI, log line,
 * or export rendering this value must not imply otherwise.
 */
export type UseConstraint = 'synthesis_only' | 'synthesis_and_short_quote' | 'unrestricted';

export const USE_CONSTRAINTS: readonly UseConstraint[] = [
  'synthesis_only', 'synthesis_and_short_quote', 'unrestricted',
] as const;

/** Most restrictive value, so an undeliberate row fails safe. */
export const DEFAULT_USE_CONSTRAINT: UseConstraint = 'synthesis_only';

export function isAdmissibilityState(v: unknown): v is AdmissibilityState {
  return typeof v === 'string' && (ADMISSIBILITY_STATES as readonly string[]).includes(v);
}

export function isAdmissionScope(v: unknown): v is AdmissionScope {
  return typeof v === 'string' && (ADMISSION_SCOPES as readonly string[]).includes(v);
}

export function isUseConstraint(v: unknown): v is UseConstraint {
  return typeof v === 'string' && (USE_CONSTRAINTS as readonly string[]).includes(v);
}

/**
 * The admission gate, as a SQL JOIN.
 *
 * A JOIN rather than an EXISTS subquery so the checksum binding is visible at
 * the point of use — someone reading the query sees what makes an admission
 * inert, instead of having to trust a helper.
 *
 * Semantics, line by line:
 *   - same source
 *   - the admitted checksum still equals the source's CURRENT checksum
 *     (content changed => no match => ineligible, automatically)
 *   - the judgment being consulted is an admission
 *   - for the requested purpose
 *   - and it is the LATEST judgment for that (source, scope) — so a later
 *     'excluded' or 'superseded' row supersedes an earlier admission without
 *     anything being updated or deleted
 *
 * @param scopeParam the bound-parameter placeholder for the scope (e.g. `$3`).
 *                   Never interpolate a scope value directly.
 */
export function admissionGateJoin(scopeParam: string): string {
  return `
        JOIN library_source_admissions a
          ON a.source_id = s.id
         AND a.source_checksum = s.checksum
         AND a.admissibility_state = 'admitted'
         AND a.scope = ${scopeParam}
         AND a.version = (
               SELECT MAX(a2.version) FROM library_source_admissions a2
                WHERE a2.source_id = s.id AND a2.scope = a.scope
             )`;
}

/** Columns the gate makes available to callers that need to honour output policy. */
export const ADMISSION_SELECT_COLUMNS = `
          a.use_constraint,
          a.admitted_title,
          a.admitted_author`;

export interface AdmissionRecord {
  id: string;
  source_id: string;
  source_checksum: string;
  admissibility_state: AdmissibilityState;
  admitted_by: string | null;
  admitted_at: string | null;
  admission_basis: string;
  admitted_title: string | null;
  admitted_author: string | null;
  scope: AdmissionScope;
  use_constraint: UseConstraint;
  version: number;
  created_at: string;
}
