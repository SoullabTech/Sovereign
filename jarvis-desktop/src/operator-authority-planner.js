// JARVIS Orchestration & Operator — O3 Authority Planner.
// Pure, deterministic, DOM-free. Consumes one valid O2 graph plus an explicit
// held-authority envelope and computes requirements/gates without granting,
// routing, executing, integrating, deploying, or mutating anything.
'use strict';

(function (root, factory) {
  const isCommonJs = typeof module === 'object' && module.exports;
  const O0 = isCommonJs ? require('./operator-constitution.js') : root.JarvisOperatorConstitution;
  const O2 = isCommonJs ? require('./operator-work-graph.js') : root.JarvisOperatorWorkGraph;
  // A proxy cannot be recognized from ordinary JavaScript: every reflective
  // operation on one runs caller-controlled trap code. Only a host predicate
  // reads the internal slot without invoking a trap. Where the host provides
  // none, O3 has no way to establish that input is inert and refuses.
  let isProxyValue = null;
  if (isCommonJs) {
    try {
      const nodeTypes = require('util').types;
      if (nodeTypes && typeof nodeTypes.isProxy === 'function') isProxyValue = nodeTypes.isProxy;
    } catch (error) {
      isProxyValue = null;
    }
  }
  const api = factory(O0, O2, isProxyValue);
  if (isCommonJs) module.exports = api;
  else root.JarvisOperatorAuthorityPlanner = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (O0, O2, hostIsProxy) {
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

  function snapshotPath(parent, key, isArray) {
    if (typeof key === 'symbol') return `${parent}[symbol]`;
    if (isArray && /^(?:0|[1-9]\d*)$/.test(String(key))) return `${parent}[${key}]`;
    return `${parent}.${String(key)}`;
  }

  // The detector is a constructor parameter, not an ambient lookup, so the
  // detector-absent path is itself falsifiable.
  function makeInertSnapshotter(detector) {
    const detectProxy = typeof detector === 'function' ? detector : null;

    return function createInertSnapshotWith(value, rootPath = 'input') {
      const blockers = [];
      const ancestors = new WeakSet();

      function walk(current, path) {
        if (current === null) return null;

        const type = typeof current;
        if (type === 'string' || type === 'number' || type === 'boolean' || type === 'undefined') {
          return current;
        }
        if (type !== 'object') {
          blockers.push(blocker(
            'INERT_SNAPSHOT_UNSUPPORTED_VALUE',
            `Only plain data values are permitted at the O3 boundary; refused ${type} value.`,
            path,
          ));
          return null;
        }

        // WeakSet membership is trap-free, so this precedes the proxy gate safely.
        if (ancestors.has(current)) {
          blockers.push(blocker(
            'INERT_SNAPSHOT_CYCLE',
            'Cyclic input is not permitted at the O3 boundary.',
            path,
          ));
          return null;
        }

        // Nothing below this gate may touch the value reflectively until it is
        // established that no trap can run. Array.isArray, getPrototypeOf and
        // getOwnPropertyDescriptors all invoke caller code on a proxy, and all
        // three throw on a revoked one.
        if (!detectProxy) {
          blockers.push(blocker(
            'INERT_SNAPSHOT_DETECTOR_UNAVAILABLE',
            'O3 cannot establish that input is free of proxies in this environment and refuses to inspect it.',
            path,
          ));
          return null;
        }
        if (detectProxy(current) === true) {
          blockers.push(blocker(
            'INERT_SNAPSHOT_PROXY_REFUSED',
            'Proxy-backed input is not permitted at the O3 boundary; inspecting it would execute caller-controlled code.',
            path,
          ));
          return null;
        }

        let isArray;
        let prototype;
        let descriptors;
        try {
          isArray = Array.isArray(current);
          prototype = Object.getPrototypeOf(current);
          descriptors = Object.getOwnPropertyDescriptors(current);
        } catch (error) {
          blockers.push(blocker(
            'INERT_SNAPSHOT_INTROSPECTION_FAILED',
            'Input could not be safely inspected as inert data.',
            path,
          ));
          return null;
        }

        const plainPrototype = isArray
          ? prototype === Array.prototype
          : prototype === Object.prototype || prototype === null;
        if (!plainPrototype) {
          blockers.push(blocker(
            'INERT_SNAPSHOT_NON_PLAIN_OBJECT',
            'Only plain objects and arrays are permitted at the O3 boundary.',
            path,
          ));
        }

        const keys = Reflect.ownKeys(descriptors);
        for (const key of keys) {
          if (typeof key === 'symbol') {
            blockers.push(blocker(
              'INERT_SNAPSHOT_SYMBOL_KEY',
              'Symbol-keyed input is not permitted at the O3 boundary.',
              snapshotPath(path, key, isArray),
            ));
            continue;
          }
          const descriptor = descriptors[key];
          if (Object.prototype.hasOwnProperty.call(descriptor, 'get')
            || Object.prototype.hasOwnProperty.call(descriptor, 'set')) {
            blockers.push(blocker(
              'INERT_SNAPSHOT_ACCESSOR_REFUSED',
              'Accessor properties are not permitted at the O3 boundary.',
              snapshotPath(path, key, isArray),
            ));
          }
        }

        const lengthDescriptor = isArray ? descriptors.length : null;
        const length = isArray && lengthDescriptor && typeof lengthDescriptor.value === 'number'
          ? lengthDescriptor.value
          : 0;
        const snapshot = isArray ? new Array(length) : {};

        ancestors.add(current);
        for (const key of keys) {
          if (typeof key === 'symbol' || (isArray && key === 'length')) continue;
          const descriptor = descriptors[key];
          if (Object.prototype.hasOwnProperty.call(descriptor, 'get')
            || Object.prototype.hasOwnProperty.call(descriptor, 'set')) {
            continue;
          }

          const childPath = snapshotPath(path, key, isArray);
          const child = walk(descriptor.value, childPath);
          Object.defineProperty(snapshot, key, {
            value: child,
            enumerable: descriptor.enumerable === true,
            writable: true,
            configurable: true,
          });
        }
        ancestors.delete(current);
        return snapshot;
      }

      let snapshot;
      try {
        snapshot = walk(value, rootPath);
      } catch (error) {
        return deepFreeze({
          ok: false,
          value: null,
          blockers: [blocker(
            'INERT_SNAPSHOT_INTROSPECTION_FAILED',
            'Input could not be safely inspected as inert data.',
            rootPath,
          )],
        });
      }
      if (blockers.length) {
        return deepFreeze({ ok: false, value: null, blockers });
      }
      return deepFreeze({ ok: true, value: deepFreeze(snapshot), blockers: [] });
    };
  }

  const createInertSnapshot = makeInertSnapshotter(hostIsProxy);
  const PROXY_DETECTION_AVAILABLE = typeof hostIsProxy === 'function';

  const UNAVAILABLE_CODE = 'O3_UNAVAILABLE_NO_TRAP_FREE_PROXY_PREDICATE';
  const UNAVAILABLE_REASON = 'O3 requires a trap-free host proxy predicate to establish that authority evidence is inert. This host provides none, so O3 is not a working authority planner here.';

  // Where no predicate exists O3 does not export a planner that quietly refuses
  // every object. It reports itself unavailable, so no caller can mistake a
  // fail-closed surface for a functioning one.
  function unavailablePlanAuthority() {
    return deepFreeze({
      ok: false,
      standing: 'UNAVAILABLE',
      authority_plan: null,
      blockers: [blocker(UNAVAILABLE_CODE, UNAVAILABLE_REASON, 'host')],
    });
  }

  if (!PROXY_DETECTION_AVAILABLE) {
    return deepFreeze({
      VERSION,
      AVAILABLE: false,
      PROXY_DETECTION_AVAILABLE: false,
      UNAVAILABLE_CODE,
      UNAVAILABLE_REASON,
      planAuthority: unavailablePlanAuthority,
    });
  }

  function ownKeyDeepEqual(actual, expected) {
    if (Object.is(actual, expected)) return true;
    if (!actual || !expected || typeof actual !== 'object' || typeof expected !== 'object') return false;
    if (Array.isArray(actual) !== Array.isArray(expected)) return false;

    const actualKeys = Reflect.ownKeys(actual);
    const expectedKeys = Reflect.ownKeys(expected);
    if (actualKeys.length !== expectedKeys.length) return false;

    for (const key of expectedKeys) {
      if (!actualKeys.some((actualKey) => Object.is(actualKey, key))) return false;
      if (!ownKeyDeepEqual(actual[key], expected[key])) return false;
    }
    return true;
  }

  function canonicalReplayIntent(graph) {
    const embedded = graph?.intent;
    if (!embedded || typeof embedded !== 'object' || Array.isArray(embedded)) return null;
    return {
      version: embedded.version,
      standing: 'CLEAR',
      objective: embedded.objective,
      requested_level: embedded.requested_level,
      level_signals: Array.isArray(embedded.level_signals) ? [...embedded.level_signals] : embedded.level_signals,
      continuation: {
        requested: embedded.continuation?.requested === true,
        inherited: embedded.continuation?.inherited === true,
      },
      authority: {
        grants: [],
        inferred: false,
        mentions: [],
      },
    };
  }

  function canonicalReplayGraph(graph) {
    const replayIntent = canonicalReplayIntent(graph);
    if (!replayIntent) return null;
    const replay = O2.compileWorkGraph(replayIntent);
    return replay?.ok === true ? replay.graph : null;
  }

  function validateCanonicalGraphIntegrity(graph) {
    const expected = canonicalReplayGraph(graph);
    if (!expected) {
      return [blocker(
        'O2_CANONICAL_REPLAY_FAILED',
        'O3 could not reconstruct a canonical O2 graph from the embedded governed intent.',
        'graph.intent',
      )];
    }
    if (!ownKeyDeepEqual(graph, expected)) {
      return [blocker(
        'O2_CANONICAL_GRAPH_INTEGRITY_MISMATCH',
        'Supplied O2 graph is not structurally identical to canonical O2 replay from its embedded governed intent.',
        'graph',
      )];
    }
    return [];
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

    blocks.push(...validateCanonicalGraphIntegrity(graph));
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

    if (Array.isArray(input.heldAuthorities)) {
      for (let index = 0; index < input.heldAuthorities.length; index += 1) {
        const authority = input.heldAuthorities[index];
        if (typeof authority !== 'string' || authority.trim().length === 0) {
          blocks.push(blocker(
            'MALFORMED_HELD_AUTHORITY',
            'Every heldAuthorities entry must be nonblank text.',
            `heldAuthorities[${index}]`,
          ));
        }
      }

      const allowedArrayKeys = new Set(['length']);
      for (let index = 0; index < input.heldAuthorities.length; index += 1) {
        allowedArrayKeys.add(String(index));
      }
      for (const key of Reflect.ownKeys(input.heldAuthorities)) {
        if (typeof key !== 'string' || !allowedArrayKeys.has(key)) {
          blocks.push(blocker(
            'HELD_AUTHORITIES_ARRAY_WIDENING',
            `heldAuthorities array carries an unexpected own property: ${String(key)}`,
            'heldAuthorities',
          ));
        }
      }
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
    const graphSnapshot = createInertSnapshot(graph, 'graph');
    const inputSnapshot = createInertSnapshot(input, 'authority_input');
    const snapshotBlockers = [
      ...graphSnapshot.blockers,
      ...inputSnapshot.blockers,
    ];

    if (snapshotBlockers.length) {
      return deepFreeze({
        ok: false,
        standing: 'REFUSED',
        authority_plan: null,
        blockers: snapshotBlockers,
      });
    }

    const inertGraph = graphSnapshot.value;
    const inertInput = inputSnapshot.value;
    const blockers = [
      ...validateO2ConsumptionBoundary(inertGraph),
      ...validateAuthorityInput(inertInput),
    ];

    if (blockers.length) {
      return deepFreeze({
        ok: false,
        standing: 'REFUSED',
        authority_plan: null,
        blockers,
      });
    }

    const heldAuthorities = uniqueAuthorities(inertInput.heldAuthorities || []);
    const heldSet = new Set(heldAuthorities);
    const byId = new Map(inertGraph.work_units.map((unit) => [unit.work_unit_id, unit]));

    const entries = inertGraph.topological_order.map((workUnitId) => {
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
      graph_id: inertGraph.graph_id,
      objective: inertGraph.intent.objective,
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
    AVAILABLE: true,
    GRAPH_VERSION,
    GRAPH_KEYS,
    INPUT_KEYS,
    REQUIREMENTS,
    EFFECTS,
    CONSTRAINTS,
    AUTHORITY_TO_ACTION,
    KNOWN_AUTHORITIES,
    extraOwnKeys,
    snapshotPath,
    PROXY_DETECTION_AVAILABLE,
    makeInertSnapshotter,
    createInertSnapshot,
    ownKeyDeepEqual,
    canonicalReplayIntent,
    canonicalReplayGraph,
    validateCanonicalGraphIntegrity,
    validateO2ConsumptionBoundary,
    validateAuthorityInput,
    requirementsForKind,
    planAuthority,
  };
});
