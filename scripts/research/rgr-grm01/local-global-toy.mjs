/**
 * RGR-GRM-01: finite local-to-global compatibility *toy*.
 *
 * No learning, no model, no member data, no files, no provider and no geometry claim.
 * This is a three-variable finite Boolean CSP demonstration, not sheaf cohomology.
 * It distinguishes local satisfiability, pairwise projected compatibility,
 * and the existence/number of full assignments satisfying every local relation.
 */
export const VARIABLES = Object.freeze(['a', 'b', 'c']);
export const BOOL = Object.freeze([0, 1]);

export const CASES = Object.freeze([
  Object.freeze({
    id: 'coherent_cycle',
    constraints: Object.freeze([
      Object.freeze({ op: 'eq', x: 'a', y: 'b' }),
      Object.freeze({ op: 'eq', x: 'b', y: 'c' }),
      Object.freeze({ op: 'eq', x: 'a', y: 'c' }),
    ]),
    expected: Object.freeze({ local: true, pairwise: true, global_count: 2 }),
  }),
  Object.freeze({
    id: 'frustrated_cycle',
    constraints: Object.freeze([
      Object.freeze({ op: 'eq', x: 'a', y: 'b' }),
      Object.freeze({ op: 'eq', x: 'b', y: 'c' }),
      Object.freeze({ op: 'neq', x: 'a', y: 'c' }),
    ]),
    expected: Object.freeze({ local: true, pairwise: true, global_count: 0 }),
  }),
  Object.freeze({
    id: 'underdetermined',
    constraints: Object.freeze([Object.freeze({ op: 'eq', x: 'a', y: 'b' })]),
    expected: Object.freeze({ local: true, pairwise: true, global_count: 4 }),
  }),
  Object.freeze({
    id: 'overt_conflict',
    constraints: Object.freeze([
      Object.freeze({ op: 'fixed', x: 'a', value: 0 }),
      Object.freeze({ op: 'fixed', x: 'a', value: 1 }),
    ]),
    expected: Object.freeze({ local: true, pairwise: false, global_count: 0 }),
  }),
]);

function assertVariables(variables) {
  if (!Array.isArray(variables) || variables.length === 0 || variables.length > 8
    || new Set(variables).size !== variables.length
    || variables.some((x) => !/^[a-z][a-z0-9]*$/.test(String(x)))) {
    throw new TypeError('INVALID_VARIABLE_UNIVERSE');
  }
}

function validateConstraint(c, universe) {
  if (!c || typeof c !== 'object' || Array.isArray(c)) throw new TypeError('BAD_CONSTRAINT');
  const fields = Object.keys(c).sort().join(',');
  if (c.op === 'fixed') {
    if (fields !== 'op,value,x' || !universe.includes(c.x) || !BOOL.includes(c.value))
      throw new TypeError('INVALID_FIXED_CONSTRAINT');
  } else if (c.op === 'eq' || c.op === 'neq') {
    if (fields !== 'op,x,y' || !universe.includes(c.x) || !universe.includes(c.y) || c.x === c.y)
      throw new TypeError('INVALID_PAIR_CONSTRAINT');
  } else throw new TypeError('UNKNOWN_CONSTRAINT');
}

function scope(c) { return c.op === 'fixed' ? [c.x] : [c.x, c.y]; }

function assignments(names) {
  const all = [];
  for (let n = 0; n < 2 ** names.length; n += 1) {
    const a = {};
    for (let j = 0; j < names.length; j += 1) a[names[j]] = (n >> j) & 1;
    all.push(a);
  }
  return all;
}

function satisfies(c, assignment) {
  if (c.op === 'fixed') return assignment[c.x] === c.value;
  if (c.op === 'eq') return assignment[c.x] === assignment[c.y];
  return assignment[c.x] !== assignment[c.y];
}

/** All locally allowed assignments for a single constraint, including its own domain. */
export function localSolutions(c, variables = VARIABLES) {
  assertVariables(variables);
  validateConstraint(c, variables);
  return assignments(scope(c)).filter((a) => satisfies(c, a));
}

/**
 * Pairwise compatibility of possible local sections restricted to the common
 * overlap. This weak comparator DOES NOT solve the global CSP.
 */
export function pairwiseCompatible(constraints, variables = VARIABLES) {
  assertVariables(variables);
  for (const c of constraints) validateConstraint(c, variables);
  for (let i = 0; i < constraints.length; i += 1) {
    for (let j = i + 1; j < constraints.length; j += 1) {
      const a = constraints[i], b = constraints[j];
      const common = scope(a).filter((v) => scope(b).includes(v));
      if (!common.length) continue;
      const left = localSolutions(a, variables);
      const right = localSolutions(b, variables);
      if (!left.some((l) => right.some((r) => common.every((v) => l[v] === r[v])))) return false;
    }
  }
  return true;
}

/** Exhaustive symbolic baseline; never called 'sheaf cohomology' or neural RGR. */
export function globalSolutions(constraints, variables = VARIABLES) {
  assertVariables(variables);
  if (!Array.isArray(constraints) || constraints.length > 20) throw new TypeError('INVALID_CONSTRAINT_SET');
  for (const c of constraints) validateConstraint(c, variables);
  return assignments(variables).filter((a) => constraints.every((c) => satisfies(c, a)));
}

export function analyze(constraints, variables = VARIABLES) {
  if (!Array.isArray(constraints) || constraints.length > 20) throw new TypeError('INVALID_CONSTRAINT_SET');
  const local = constraints.every((c) => localSolutions(c, variables).length > 0);
  const pairwise = pairwiseCompatible(constraints, variables);
  const solutions = globalSolutions(constraints, variables);
  return Object.freeze({
    local, pairwise, global_count: solutions.length,
    globally_compatible: solutions.length > 0,
    underdetermined: solutions.length > 1,
  });
}

/** Relabel variable names everywhere. A surface change must preserve the solution count. */
export function renameVariables(constraints, mapping, variables = VARIABLES) {
  assertVariables(variables);
  if (Object.keys(mapping).length !== variables.length || !variables.every((x) => Object.hasOwn(mapping, x))
    || new Set(Object.values(mapping)).size !== variables.length
    || !variables.every((x) => variables.includes(mapping[x]))) {
    throw new TypeError('INVALID_VARIABLE_PERMUTATION');
  }
  for (const c of constraints) validateConstraint(c, variables);
  return constraints.map((c) => c.op === 'fixed'
    ? { op: 'fixed', x: mapping[c.x], value: c.value }
    : { op: c.op, x: mapping[c.x], y: mapping[c.y] });
}
