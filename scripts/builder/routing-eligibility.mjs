/**
 * JARVIS — routing eligibility.
 *
 * JOP-04 RB-6A. Registration declares what an instrument IS. It never grants
 * permission to route that instrument.
 *
 *   REGISTERED  --necessary-->  ROUTING JUDGMENT  -->  ROUTABLE | NOT ROUTABLE
 *
 * This module produces the one fact routing needs that it CANNOT derive from
 * the capability registry. It is deliberately unforgeable by assertion: the
 * brand is a module-private Symbol, so `{ satisfied: true }` is not a routing
 * eligibility no matter how confidently a caller says it is.
 *
 * ⛔ THIS IS NOT AUTHORITY. It answers "may this be CONSIDERED for placement?"
 *    — never "may this execute?". Execution authority is RB-6B and does not
 *    exist yet: a routed C0 invocation still executes without separately
 *    constituted invocation authority. That is intentional at this stage.
 */

/** Module-private. Not Symbol.for() — a global registry key would be forgeable. */
const BRAND = Symbol('jarvis.routing-eligibility');

/**
 * Bases that would make this fact a restatement of registry membership.
 * Declaring one is refused outright: the whole point is that routing consumes
 * something the registry cannot tell it.
 */
export const FORBIDDEN_BASES = Object.freeze([
  'registry_membership', 'capability_registered', 'CAPABILITIES', 'is_registered', 'registered',
]);

export function declareRoutingEligibility({ satisfied, basis, declared_by } = {}) {
  if (typeof satisfied !== 'boolean') throw new Error('routing eligibility: `satisfied` must be a boolean');
  if (typeof basis !== 'string' || !basis.trim()) throw new Error('routing eligibility: `basis` is required');
  if (FORBIDDEN_BASES.includes(basis)) {
    throw new Error(`routing eligibility: basis '${basis}' restates registry membership; routing must consume a fact the registry cannot supply`);
  }
  if (typeof declared_by !== 'string' || !declared_by.trim()) throw new Error('routing eligibility: `declared_by` is required');
  return Object.freeze({ [BRAND]: true, satisfied, basis, declared_by, declared_at: new Date().toISOString() });
}

export function isRoutingEligibility(value) {
  return Boolean(value) && typeof value === 'object' && value[BRAND] === true;
}

/** Routing consideration requires a genuine, satisfied declaration. Absent ⇒ not routable. */
export function isRoutable(value) {
  return isRoutingEligibility(value) && value.satisfied === true;
}
