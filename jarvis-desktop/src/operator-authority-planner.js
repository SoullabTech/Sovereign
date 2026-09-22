// JARVIS Orchestration & Operator — O3 Authority Planner.
// Pure, deterministic, DOM-free. Consumes one valid O2 graph plus an explicit
// held-authority envelope and computes requirements/gates without granting,
// routing, executing, integrating, deploying, or mutating anything.
'use strict';

(function (root, factory) {
  const isCommonJs = typeof module === 'object' && module.exports;
  const O0 = isCommonJs ? require('./operator-constitution.js') : root.JarvisOperatorConstitution;
  const O2 = isCommonJs ? require('./operator-work-graph.js') : root.JarvisOperatorWorkGraph;
  const api = factory(O0, O2);
  if (isCommonJs) module.exports = api;
  else root.JarvisOperatorAuthorityPlanner = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (O0, O2) {
  if (!O0 || !O2) throw new Error('O3 requires canonical O0 and O2 contracts.');

  const VERSION = 'o3.authority-plan.v1';
  const GRAPH_VERSION = 'o2.work-graph.v1';

  const GRAPH_KEYS = Object.freeze([
    'version',
    'standing',
    'graph_id',
    'intent',
    'work_units',
    'edges',
    'topological_order',
    'effects',
    'constraints',
  ]);

  const INPUT_KEYS = Object.freeze(['heldAuthorities']);

  const REQUIREMENTS = Object.freeze({
    INSPECT: Object.freeze(['repo.read']),
    SYNTHESIZE: Object.freeze([]),
    PROPOSE: Object.freeze([]),
    MODIFY: Object.freeze(['repo.read', 'repo.write:worktree']),
    VERIFY: Object.freeze(['repo.read', 'verify.run']),
    RELEASE_READINESS: Object.freeze([]),
  });

  const EFFECTS = Object.freeze({
    authority: 'none',
    routing: 'none',
    execution: 'none',
    integration: 'none',
  });

  const CONSTRAINTS = Object.freeze([
    'O3 grants no authority.',
    'O3 consumes only a valid O2 graph.',
    'Held authority is explicit input evidence, never inferred from intent, graph shape, environment, credentials, or capability.',
    'Per-node requirements contain only semantic minimum authority; ambient held authority is not inherited by a node.',
    'O4 may select only capabilities that fit the governed authority plan or return an authority gate.',
    'Release readiness is not release authority; actual PR/merge/deploy/production acts remain later consequential boundaries.',
  ]);

  const AUTHORITY_TO_ACTION = Object.freeze(Object.fromEntries(
    Object.entries(O0.ACTION_RULES).map(([action, rule]) => [rule.authority, action]),
  ));

  const KNOWN_AUTHORITIES = Object.freeze(
    [...new Set(Object.values(O0.ACTION_RULES).map((rule) => rule.authority))],
  );

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.freeze(value);
    for (const key of Reflect.ownKeys(value)) {
      deepFreeze(value[key]);
    }
    return value;
  }

  function blocker(code, detail, path = null) {
    return Object.freeze({ code, detail, path });
  }

  function uniqueAuthorities(values) {
    if (!Array.isArray(values)) return [];
    return [...new Set(values.filter((v) => typeof v === 'string').map((v) => v.trim()).filter(Boolean))];
  }

  function extraOwnKeys(value, allowedKeys) {
    if (!value || typeof value !== 'object') return [];
    return Reflect.ownKeys(value).filter((key) => typeof key !== 'string' || !allowedKeys.includes(key));
  }

  function validateO2ConsumptionBoundary(graph) {
    const blocks = [];
    const o2Blocks = O2.validateGraph(graph);
    if (o2Blocks.length) {
      blocks.push(blocker(
        'INVALID_O2_GRAPH',
        'O3 accepts only a graph that satisfies the canonical O2 validator.',
        'graph',
      ));
      return blocks;
    }

    if (graph.version !== GRAPH_VERSION) {
      blocks.push(blocker('O2_VERSION_REQUIRED', 'O3 accepts only o2.work-graph.v1.', 'graph.version'));
    }

    for (const key of extraOwnKeys(graph, GRAPH_KEYS)) {
      blocks.push(blocker(
        'O2_GRAPH_ENVELOPE_WIDENING',
        `O3 refuses graph-envelope fields outside canonical O2 output: ${String(key)}`,
        'graph',
      ));
    }

    for (const unit of graph.work_units) {
      for (const key of extraOwnKeys(unit, O2.PLANNED_WORK_UNIT_KEYS)) {
        blocks.push(blocker(
          'O2_NODE_ENVELOPE_WIDENING',
          `O3 refuses planned-node fields outside canonical O2 output: ${String(key)}`,
          unit.work_unit_id,
        ));
      }
    }

    return blocks;
  }

  function validateAuthorityInput(input = {}) {
    const blocks = [];
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return [blocker('AUTHORITY_INPUT_REQUIRED', 'O3 authority input must be structured.')];
    }

    for (const key of extraOwnKeys(input, INPUT_KEYS)) {
      blocks.push(blocker(
        'AUTHORITY_INPUT_WIDENING',
        `O3 accepts only heldAuthorities input; refused field: ${String(key)}`,
      ));
    }

    if (input.heldAuthorities != null && !Array.isArray(input.heldAuthorities)) {
      blocks.push(blocker('HELD_AUTHORITIES_MUST_BE_ARRAY', 'heldAuthorities must be an array.'));
      return blocks;
    }

    for (const authority of uniqueAuthorities(input.heldAuthorities || [])) {
      if (!KNOWN_AUTHORITIES.includes(authority)) {
        blocks.push(blocker(
          'UNKNOWN_HELD_AUTHORITY',
          `O3 refuses an unknown held authority: ${authority}`,
          'heldAuthorities',
        ));
      }
    }

    return blocks;
  }

  function requirementsForKind(kind) {
    const requirements = REQUIREMENTS[kind];
    return Array.isArray(requirements) ? [...requirements] : null;
  }

  function decideRequirement(authority, heldAuthorities) {
    const action = AUTHORITY_TO_ACTION[authority];
    if (!action) {
      return {
        authority,
        action: null,
        decision: O0.DECISION.STOP,
        operatorRequired: true,
        reason: 'No O0 action rule exists for required authority.',
      };
    }
    const decision = O0.decide({
      action,
      heldAuthorities,
      requiredAuthorities: [authority],
    });
    return {
      authority,
      action,
      decision: decision.decision,
      operatorRequired: decision.operatorRequired,
      reason: decision.reason,
    };
  }

  function planAuthority(graph, input = {}) {
    const blockers = [
      ...validateO2ConsumptionBoundary(graph),
      ...validateAuthorityInput(input),
    ];

    if (blockers.length) {
      return deepFreeze({
        ok: false,
        standing: 'REFUSED',
        authority_plan: null,
        blockers,
      });
    }

    const heldAuthorities = uniqueAuthorities(input.heldAuthorities || []);
    const heldSet = new Set(heldAuthorities);
    const byId = new Map(graph.work_units.map((unit) => [unit.work_unit_id, unit]));

    const entries = graph.topological_order.map((workUnitId) => {
      const unit = byId.get(workUnitId);
      const requiredAuthorities = requirementsForKind(unit.kind);
      if (!requiredAuthorities) {
        return {
          work_unit_id: unit.work_unit_id,
          ordinal: unit.ordinal,
          kind: unit.kind,
          required_authorities: [],
          held_relevant_authorities: [],
          missing_authorities: [],
          requirement_decisions: [],
          decision: O0.DECISION.STOP,
          operator_required: true,
          consequence_boundary: false,
          reason: 'No O3 requirement rule exists for this O2 kind.',
        };
      }

      const heldRelevant = requiredAuthorities.filter((authority) => heldSet.has(authority));
      const missingAuthorities = requiredAuthorities.filter((authority) => !heldSet.has(authority));
      const requirementDecisions = requiredAuthorities.map(
        (authority) => decideRequirement(authority, heldAuthorities),
      );
      const operatorRequired = missingAuthorities.length > 0
        || requirementDecisions.some((decision) => decision.operatorRequired);
      const decision = operatorRequired
        ? O0.DECISION.NEEDS_OPERATOR_AUTHORITY
        : O0.DECISION.CONTINUE;

      return {
        work_unit_id: unit.work_unit_id,
        ordinal: unit.ordinal,
        kind: unit.kind,
        required_authorities: requiredAuthorities,
        held_relevant_authorities: heldRelevant,
        missing_authorities: missingAuthorities,
        requirement_decisions: requirementDecisions,
        decision,
        operator_required: operatorRequired,
        consequence_boundary: unit.kind === O2.KIND.RELEASE_READINESS,
        reason: operatorRequired
          ? 'One or more semantic minimum authorities are not presently held.'
          : (unit.kind === O2.KIND.RELEASE_READINESS
            ? 'Release readiness may be assessed, but no release authority is granted.'
            : 'Semantic minimum authority requirements are satisfied.'),
      };
    });

    const gated = entries.filter((entry) => entry.operator_required);
    const consequenceBoundaries = entries
      .filter((entry) => entry.consequence_boundary)
      .map((entry) => entry.work_unit_id);

    const authorityPlan = {
      version: VERSION,
      standing: 'READY',
      graph_id: graph.graph_id,
      objective: graph.intent.objective,
      held_authorities: heldAuthorities,
      entries,
      summary: {
        all_within_authority: gated.length === 0,
        gated_work_unit_ids: gated.map((entry) => entry.work_unit_id),
        first_gate_work_unit_id: gated.length ? gated[0].work_unit_id : null,
        consequence_boundary_work_unit_ids: consequenceBoundaries,
      },
      effects: { ...EFFECTS },
      constraints: [...CONSTRAINTS],
    };

    return deepFreeze({
      ok: true,
      standing: 'READY',
      authority_plan: authorityPlan,
      blockers: [],
    });
  }

  return {
    VERSION,
    GRAPH_VERSION,
    GRAPH_KEYS,
    INPUT_KEYS,
    REQUIREMENTS,
    EFFECTS,
    CONSTRAINTS,
    AUTHORITY_TO_ACTION,
    KNOWN_AUTHORITIES,
    extraOwnKeys,
    validateO2ConsumptionBoundary,
    validateAuthorityInput,
    requirementsForKind,
    planAuthority,
  };
});
