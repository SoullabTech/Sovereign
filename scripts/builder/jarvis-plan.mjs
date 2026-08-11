// JARVIS — planner contract + bounded work graph (Alpha).
//
// This module owns ONE thing: turning an objective into an INSPECTABLE work
// graph, and refusing graphs that are not bounded. It executes nothing.
//
// Founder law honoured here (JARVIS MULTI-RUN PLANNER + ROUTER INTEGRATION §1):
//   "Do not hide decomposition inside model chain-of-thought. Return an
//    explicit machine-readable work graph."
//
// Consequence, stated plainly: **decomposition in Alpha is not model-driven.**
// A plan comes from one of two places —
//   (a) an explicit plan authored by the founder / Claude Code, or
//   (b) a registered RECIPE: a named, deterministic decomposition.
// When neither applies, the planner REFUSES with PLAN_UNRESOLVED. It does not
// guess a decomposition, because a guessed graph would be exactly the hidden
// chain-of-thought §1 forbids. Model-driven decomposition is the BETA seam.

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CAPABILITIES } from './deterministic.mjs';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const PLANNING_STRATEGIES = Object.freeze(['explicit', 'recipe', 'model']);

/** Authority scopes a step may declare. Alpha grants read-only only. */
export const AUTHORITY_SCOPES = Object.freeze(['read-only', 'repo-write', 'founder-decision']);

export const STEP_ID_RE = /^[a-z0-9][a-z0-9-]{1,47}$/;

// ── §2 bounding rule ─────────────────────────────────────────────────────────
//
// "Reject decomposition such as: 'Step 1: finish MAIA.'"
//
// These are lexical refusals, not comprehension. A lexical refusal is honest
// about what it is: it catches the named failure shape and nothing more. It
// cannot certify that a step that PASSES is well-bounded — only that it is not
// one of the shapes we know to be unbounded.
const UNBOUNDED_PHRASES = [
  /\bfinish\b/i,
  /\bmake it work\b/i,
  /\bfix (all|everything)\b/i,
  /\b(all|everything) of (it|the)\b/i,
  /\bimprove\b/i,
  /\boptimi[sz]e\b/i,
  /\bclean ?up\b/i,
  /\bhandle\b/i,
  /\bas needed\b/i,
  /\bwhatever\b/i,
  /\betc\.?$/i,
];

/** A step objective must be one objective. These conjunctions signal two. */
const MULTI_OBJECTIVE = [/\band then\b/i, /;\s*\S/, /\bafter that\b/i];

const MIN_OBJECTIVE_CHARS = 12;
const MAX_OBJECTIVE_CHARS = 240;

/**
 * Check declared arguments against the REAL capability schema, at plan time.
 *
 * Without this, a plan validates cleanly and then dies mid-execution on a
 * misnamed argument — which is exactly the class of "looked fine, wasn't" that
 * an inspectable plan is supposed to eliminate. A plan that names a capability
 * must name it correctly, or it is not inspectable, only readable.
 */
function argErrors(name, args) {
  const spec = CAPABILITIES[name]?.args ?? {};
  const errs = [];
  for (const [k, s] of Object.entries(spec)) {
    if (s.required && (args[k] === undefined || args[k] === null)) errs.push(`'${name}' requires argument '${k}'`);
  }
  for (const k of Object.keys(args)) {
    if (!spec[k]) errs.push(`'${name}' has no argument '${k}' (accepts: ${Object.keys(spec).join(', ') || 'none'})`);
  }
  return errs;
}

/**
 * Validate one step against the bounding rule. Returns { ok, errors[] }.
 * Every error names the rule it broke so a rejected plan teaches.
 */
export function validateStep(step, knownStepIds) {
  const errors = [];
  const str = (k) => typeof step?.[k] === 'string' && step[k].trim().length > 0;

  if (!step || typeof step !== 'object' || Array.isArray(step)) {
    return { ok: false, errors: ['step must be a JSON object'] };
  }

  if (!str('step_id')) errors.push('step_id: required non-empty string');
  else if (!STEP_ID_RE.test(step.step_id)) errors.push(`step_id: must match ${STEP_ID_RE}`);

  if (!str('objective')) {
    errors.push('objective: required non-empty string');
  } else {
    const o = step.objective.trim();
    if (o.length < MIN_OBJECTIVE_CHARS) {
      errors.push(`objective: too short (${o.length} < ${MIN_OBJECTIVE_CHARS}) — a bounded objective names an action and a target`);
    }
    if (o.length > MAX_OBJECTIVE_CHARS) {
      errors.push(`objective: too long (${o.length} > ${MAX_OBJECTIVE_CHARS}) — split it`);
    }
    for (const re of UNBOUNDED_PHRASES) {
      if (re.test(o)) errors.push(`objective: UNBOUNDED — matched ${re}. A step must name a finishable act, not an open-ended intention.`);
    }
    for (const re of MULTI_OBJECTIVE) {
      if (re.test(o)) errors.push(`objective: MULTI_OBJECTIVE — matched ${re}. One step, one objective (§2).`);
    }
  }

  if (!str('completion_criterion')) {
    errors.push('completion_criterion: required — a step with no completion criterion cannot be verified, only believed');
  }
  if (!str('stop_condition')) {
    errors.push('stop_condition: required — name what makes this step give up rather than grind');
  }

  // ── exactly one authority scope ────────────────────────────────────────────
  const auth = step.authority;
  if (!auth || typeof auth !== 'object') {
    errors.push('authority: required object { scope }');
  } else if (!AUTHORITY_SCOPES.includes(auth.scope)) {
    errors.push(`authority.scope: must be one of ${AUTHORITY_SCOPES.join(', ')}`);
  }

  // ── result contract ────────────────────────────────────────────────────────
  const rc = step.result_contract;
  if (!rc || typeof rc !== 'object') {
    errors.push('result_contract: required object { requires_evidence, requires_tests }');
  } else {
    if (typeof rc.requires_evidence !== 'boolean') errors.push('result_contract.requires_evidence: required boolean');
    if (typeof rc.requires_tests !== 'boolean') errors.push('result_contract.requires_tests: required boolean');
  }

  // ── §7 verification must be DECLARED, including its absence ────────────────
  const v = step.verification;
  if (!v || typeof v !== 'object') {
    errors.push('verification: required — declare a verifier, or declare { kind: "none", reason } explicitly (§7)');
  } else if (v.kind === 'none') {
    if (!(typeof v.reason === 'string' && v.reason.trim())) {
      errors.push('verification.kind=none: requires a reason. An undeclared absence of proof is how a claim becomes its own evidence.');
    }
  } else if (v.kind === 'capability') {
    if (!Object.prototype.hasOwnProperty.call(CAPABILITIES, v.capability)) {
      errors.push(`verification.capability: '${v.capability}' is not in the deterministic registry`);
    } else {
      for (const e of argErrors(v.capability, v.args ?? {})) errors.push(`verification.args: ${e}`);
    }
    if (v.expect == null || typeof v.expect !== 'object') {
      errors.push('verification.expect: required object, e.g. { contains: "..." } or { equals: "..." } or { min_count: 1 }');
    }
  } else {
    errors.push(`verification.kind: must be 'capability' or 'none' (got '${v.kind}')`);
  }

  // ── routing declaration ────────────────────────────────────────────────────
  // The step declares its SHAPE; the router decides the lane. A step that
  // declares a capability must declare a real one.
  if (step.capability != null) {
    if (!Object.prototype.hasOwnProperty.call(CAPABILITIES, step.capability)) {
      errors.push(`capability: '${step.capability}' is not in the deterministic registry — a plan may not invent a capability`);
    } else {
      for (const e of argErrors(step.capability, step.capability_args ?? {})) errors.push(`capability_args: ${e}`);
    }
  }
  if (step.bounded_for_local != null && typeof step.bounded_for_local !== 'boolean') {
    errors.push('bounded_for_local: must be boolean when present');
  }

  // ── dependencies ───────────────────────────────────────────────────────────
  const deps = step.depends_on ?? [];
  if (!Array.isArray(deps)) {
    errors.push('depends_on: must be an array when present');
  } else {
    for (const d of deps) {
      if (typeof d !== 'string') { errors.push('depends_on: entries must be strings'); continue; }
      if (d === step.step_id) errors.push(`depends_on: '${d}' depends on itself`);
      else if (knownStepIds && !knownStepIds.has(d)) errors.push(`depends_on: '${d}' is not a step in this plan`);
    }
  }

  // ── §9 failure policy ──────────────────────────────────────────────────────
  const FAIL_POLICIES = ['retry', 'escalate', 'block'];
  if (step.on_failure != null && !FAIL_POLICIES.includes(step.on_failure)) {
    errors.push(`on_failure: must be one of ${FAIL_POLICIES.join(', ')}`);
  }
  if (step.max_retries != null) {
    if (!Number.isInteger(step.max_retries) || step.max_retries < 0 || step.max_retries > 2) {
      errors.push('max_retries: integer 0..2 (Alpha refuses unlimited automatic retry — §9)');
    }
  }

  return { ok: errors.length === 0, errors };
}

/** Kahn topological order. Returns { ok, order[] } or { ok:false, cycle[] }. */
export function topoOrder(steps) {
  const ids = steps.map((s) => s.step_id);
  const indeg = new Map(ids.map((i) => [i, 0]));
  const out = new Map(ids.map((i) => [i, []]));
  for (const s of steps) {
    for (const d of s.depends_on ?? []) {
      if (!indeg.has(d)) continue;
      indeg.set(s.step_id, indeg.get(s.step_id) + 1);
      out.get(d).push(s.step_id);
    }
  }
  const q = ids.filter((i) => indeg.get(i) === 0);
  const order = [];
  while (q.length) {
    const n = q.shift();
    order.push(n);
    for (const m of out.get(n)) {
      indeg.set(m, indeg.get(m) - 1);
      if (indeg.get(m) === 0) q.push(m);
    }
  }
  if (order.length !== ids.length) {
    return { ok: false, cycle: ids.filter((i) => !order.includes(i)) };
  }
  return { ok: true, order };
}

/**
 * Validate a whole plan. A plan that does not pass this is never executed.
 * @returns {{ok:boolean, errors:string[], order?:string[]}}
 */
export function validatePlan(plan) {
  const errors = [];
  if (!plan || typeof plan !== 'object') return { ok: false, errors: ['plan must be a JSON object'] };

  for (const k of ['plan_id', 'objective', 'canonical_sha', 'planning_strategy']) {
    if (!(typeof plan[k] === 'string' && plan[k].trim())) errors.push(`${k}: required non-empty string`);
  }
  if (plan.planning_strategy && !PLANNING_STRATEGIES.some((s) => plan.planning_strategy === s || plan.planning_strategy.startsWith(`${s}:`))) {
    errors.push(`planning_strategy: must be one of ${PLANNING_STRATEGIES.join(', ')} (optionally 'recipe:<name>')`);
  }
  if (!AUTHORITY_SCOPES.includes(plan.authority_scope)) {
    errors.push(`authority_scope: must be one of ${AUTHORITY_SCOPES.join(', ')}`);
  }
  if (!Array.isArray(plan.steps) || plan.steps.length === 0) {
    errors.push('steps: required non-empty array');
    return { ok: false, errors };
  }

  const ids = new Set();
  for (const s of plan.steps) {
    if (s && typeof s.step_id === 'string') {
      if (ids.has(s.step_id)) errors.push(`step_id: duplicate '${s.step_id}'`);
      ids.add(s.step_id);
    }
  }
  for (const s of plan.steps) {
    const r = validateStep(s, ids);
    for (const e of r.errors) errors.push(`step '${s?.step_id ?? '(unnamed)'}': ${e}`);
  }

  // A step may never claim authority the PLAN does not hold.
  const rank = { 'read-only': 0, 'repo-write': 1, 'founder-decision': 2 };
  for (const s of plan.steps) {
    const sc = s?.authority?.scope;
    if (sc && rank[sc] > rank[plan.authority_scope]) {
      errors.push(`step '${s.step_id}': authority.scope '${sc}' exceeds plan authority_scope '${plan.authority_scope}'`);
    }
  }

  if (errors.length) return { ok: false, errors };

  const t = topoOrder(plan.steps);
  if (!t.ok) return { ok: false, errors: [`dependency cycle among: ${t.cycle.join(', ')}`] };

  return { ok: true, errors: [], order: t.order };
}

// ── recipes: deterministic, named decompositions ─────────────────────────────

const shortSha = (repo) => {
  try {
    return execFileSync('git', ['-C', repo, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch { return 'unknown'; }
};

/**
 * RECIPE: runtime-canonical-audit  (read-only)
 *
 * The §12 safe Alpha objective: "Determine which JARVIS runtime source is
 * canonical and verify that the local worker is reachable."
 *
 * Deliberately mixed-lane so the router consumer edge is exercised for real:
 * four deterministic steps and one bounded local-model step, with a real
 * dependency join before the final reading.
 */
function recipeRuntimeCanonicalAudit({ repo }) {
  const sha = shortSha(repo);
  return {
    objective: 'Determine which JARVIS runtime source is canonical and verify that the local worker is reachable.',
    authority_scope: 'read-only',
    canonical_sha: sha,
    steps: [
      {
        step_id: 'head-sha',
        objective: 'Resolve the git HEAD commit of the checkout the runtime would build from.',
        depends_on: [],
        capability: 'git.rev_parse',
        capability_args: { ref: 'HEAD' },
        authority: { scope: 'read-only' },
        completion_criterion: 'A 40-character hex sha is returned on stdout.',
        stop_condition: 'git rev-parse exits non-zero (not a git checkout).',
        result_contract: { requires_evidence: true, requires_tests: false },
        verification: { kind: 'capability', capability: 'git.rev_parse', args: { ref: 'HEAD' }, expect: { matches: '^[0-9a-f]{40}$' } },
        on_failure: 'block',
      },
      {
        step_id: 'locate-runtime-source',
        objective: 'Locate the jarvis-runtime.mjs source file inside this checkout.',
        depends_on: [],
        capability: 'repo.find_file',
        capability_args: { pattern: '*jarvis-runtime.mjs' },
        authority: { scope: 'read-only' },
        completion_criterion: 'git ls-files lists at least one tracked path ending in jarvis-runtime.mjs.',
        stop_condition: 'No file of that name exists in the checkout.',
        result_contract: { requires_evidence: true, requires_tests: false },
        verification: { kind: 'capability', capability: 'verify.file_exists', args: { path: 'scripts/builder/jarvis-runtime.mjs' }, expect: { contains: 'true' } },
        on_failure: 'block',
      },
      {
        step_id: 'runtime-source-history',
        objective: 'Read the commit history of scripts/builder/jarvis-runtime.mjs to establish custody.',
        depends_on: ['locate-runtime-source'],
        capability: 'git.file_history',
        capability_args: { file: 'scripts/builder/jarvis-runtime.mjs', max_count: 5 },
        authority: { scope: 'read-only' },
        completion_criterion: 'At least one commit line is returned for that path.',
        stop_condition: 'The path is untracked — meaning the runtime source is NOT under version control.',
        result_contract: { requires_evidence: true, requires_tests: false },
        verification: { kind: 'capability', capability: 'verify.count_matches', args: { file: 'scripts/builder/jarvis-runtime.mjs', pattern: 'createServer' }, expect: { min_count: 1 } },
        on_failure: 'block',
      },
      {
        step_id: 'worker-reachability',
        objective: 'Name the local worker default host constant and its health entry point.',
        depends_on: [],
        bounded_for_local: true,
        authority: { scope: 'read-only' },
        completion_criterion: 'The result cites the DEFAULT_HOST constant and the exported health function, both with line citations inside the materialized fragments.',
        stop_condition: 'The local worker is unreachable or the fragments do not contain the named symbols.',
        result_contract: { requires_evidence: true, requires_tests: false },
        verification: { kind: 'capability', capability: 'verify.count_matches', args: { file: 'scripts/builder/jarvis-local-worker.mjs', pattern: 'export async function health' }, expect: { min_count: 1 } },
        packet: {
          expected_output: 'Two named symbols with file:line citations. READ-ONLY. No recommendations.',
          established_facts: ['Your authority is READ-ONLY.', 'Cite only what appears in the fragments you were given.'],
          context_selectors: [
            { ref: 'scripts/builder/jarvis-local-worker.mjs', why: 'default host constant',
              selector: { type: 'anchor', find: 'const DEFAULT_HOST', mode: 'lines', after: 0 } },
            { ref: 'scripts/builder/jarvis-local-worker.mjs', why: 'health entry point',
              selector: { type: 'anchor', find: 'export async function health', mode: 'declaration' } },
          ],
          allowed_files: ['scripts/builder/jarvis-local-worker.mjs'],
        },
        on_failure: 'escalate',
        max_retries: 1,
      },
      {
        step_id: 'custody-reading',
        objective: 'Count the runtime source files committed under scripts/builder to size the fabric.',
        depends_on: ['head-sha', 'runtime-source-history', 'worker-reachability'],
        capability: 'repo.grep',
        capability_args: { pattern: 'jarvis-runtime-pipeline', max_results: 20 },
        authority: { scope: 'read-only' },
        completion_criterion: 'At least one grep hit naming the pipeline module is returned.',
        stop_condition: 'The pipeline module is not referenced anywhere under scripts/builder.',
        result_contract: { requires_evidence: true, requires_tests: false },
        verification: { kind: 'capability', capability: 'verify.file_exists', args: { path: 'scripts/builder/jarvis-runtime-pipeline.mjs' }, expect: { contains: 'true' } },
        on_failure: 'block',
      },
    ],
  };
}

/**
 * RECIPE: governance-boundary-probe  (read-only + one deliberate boundary)
 *
 * The §13 synthetic objective. Two independent branches: one safe branch that
 * must complete while the governed branch is paused, and one step whose
 * authority scope is deliberately beyond what the runtime will grant.
 */
function recipeGovernanceBoundaryProbe({ repo }) {
  const sha = shortSha(repo);
  return {
    objective: 'Probe the governance boundary: establish head provenance, and separately request an act that requires founder authority.',
    authority_scope: 'founder-decision',
    canonical_sha: sha,
    steps: [
      {
        step_id: 'safe-head',
        objective: 'Resolve the git HEAD commit on the independent safe branch.',
        depends_on: [],
        capability: 'git.rev_parse',
        capability_args: { ref: 'HEAD' },
        authority: { scope: 'read-only' },
        completion_criterion: 'A 40-character hex sha is returned.',
        stop_condition: 'Not a git checkout.',
        result_contract: { requires_evidence: true, requires_tests: false },
        verification: { kind: 'capability', capability: 'git.rev_parse', args: { ref: 'HEAD' }, expect: { matches: '^[0-9a-f]{40}$' } },
        on_failure: 'block',
      },
      {
        step_id: 'safe-followup',
        objective: 'Confirm the runtime store module exists, downstream of the safe head step.',
        depends_on: ['safe-head'],
        capability: 'verify.file_exists',
        capability_args: { path: 'scripts/builder/jarvis-runtime-store.mjs' },
        authority: { scope: 'read-only' },
        completion_criterion: 'The capability reports true for that path.',
        stop_condition: 'The store module is absent from the checkout.',
        result_contract: { requires_evidence: true, requires_tests: false },
        verification: { kind: 'capability', capability: 'verify.count_matches', args: { file: 'scripts/builder/jarvis-runtime-store.mjs', pattern: 'export function saveRun' }, expect: { min_count: 1 } },
        on_failure: 'block',
      },
      {
        step_id: 'governed-decision',
        objective: 'Decide whether the orphan runtime on port 8787 may be replaced as the canonical production runtime.',
        depends_on: [],
        // No capability, not bounded_for_local → router returns C3.
        authority: { scope: 'founder-decision', boundary: 'Cutover of the canonical production runtime is a founder act, not an inference.' },
        completion_criterion: 'A founder resolution (APPROVE / REFUSE / AMEND) is recorded against this step.',
        stop_condition: 'No founder resolution is available.',
        result_contract: { requires_evidence: true, requires_tests: false },
        verification: { kind: 'none', reason: 'A founder decision is authority, not a measurable fact; there is no deterministic verifier for it.' },
        on_failure: 'escalate',
      },
      {
        step_id: 'downstream-of-decision',
        objective: 'Record the post-cutover runtime provenance, which depends on the cutover decision.',
        depends_on: ['governed-decision'],
        capability: 'git.rev_parse',
        capability_args: { ref: 'HEAD' },
        authority: { scope: 'read-only' },
        completion_criterion: 'A sha is recorded after the decision is resolved.',
        stop_condition: 'The decision is refused.',
        result_contract: { requires_evidence: true, requires_tests: false },
        verification: { kind: 'capability', capability: 'git.rev_parse', args: { ref: 'HEAD' }, expect: { matches: '^[0-9a-f]{40}$' } },
        on_failure: 'block',
      },
    ],
  };
}

export const RECIPES = Object.freeze({
  'runtime-canonical-audit': recipeRuntimeCanonicalAudit,
  'governance-boundary-probe': recipeGovernanceBoundaryProbe,
});

let planSeq = 0;
const newPlanId = () => `p-${Date.now().toString(36)}-${(planSeq++).toString(36)}`;

/**
 * Build a plan.
 *
 * @param {object} input
 * @param {string} [input.recipe]     - a name in RECIPES
 * @param {object} [input.plan]       - an explicit plan object (planning_strategy 'explicit')
 * @param {string} [input.objective]  - free-text objective; ONLY resolvable via an explicit recipe
 * @param {string} [input.repo]       - repo root (defaults to this checkout)
 * @returns {{ok:true, plan:object}|{ok:false, refusal:string, detail:string}}
 */
export function buildPlan(input = {}) {
  const repo = input.repo ?? REPO_ROOT;

  if (input.plan) {
    const plan = { plan_id: newPlanId(), created_at: new Date().toISOString(), repo, ...input.plan };
    plan.planning_strategy = plan.planning_strategy ?? 'explicit';
    const v = validatePlan(plan);
    return v.ok ? { ok: true, plan, order: v.order } : { ok: false, refusal: 'PLAN_INVALID', detail: v.errors.join('\n') };
  }

  if (input.recipe) {
    const fn = RECIPES[input.recipe];
    if (!fn) {
      return { ok: false, refusal: 'PLAN_UNRESOLVED', detail: `no recipe named '${input.recipe}'. Known: ${Object.keys(RECIPES).join(', ')}` };
    }
    const body = fn({ repo });
    const plan = {
      plan_id: newPlanId(),
      created_at: new Date().toISOString(),
      repo,
      planning_strategy: `recipe:${input.recipe}`,
      ...body,
      ...(input.objective ? { requested_objective: input.objective } : {}),
    };
    const v = validatePlan(plan);
    return v.ok ? { ok: true, plan, order: v.order } : { ok: false, refusal: 'PLAN_INVALID', detail: v.errors.join('\n') };
  }

  // §1 — the refusal that keeps the planner honest.
  return {
    ok: false,
    refusal: 'PLAN_UNRESOLVED',
    detail:
      'No explicit plan and no recipe were supplied. Alpha does NOT decompose a free-text objective — ' +
      'a guessed decomposition is the hidden chain-of-thought §1 forbids. ' +
      `Supply --plan <file>, or one of: ${Object.keys(RECIPES).join(', ')}. ` +
      'Model-driven decomposition is the BETA seam and is deliberately not implemented.',
  };
}
