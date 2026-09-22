// JARVIS Orchestration & Operator — O2 Work Graph.
// Pure, deterministic, DOM-free. Converts one CLEAR O1 intent into a bounded
// DAG of planned Work Unit descriptors. It grants no authority, routes no
// providers, creates no W0.v2 lifecycle state, and executes nothing.
'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JarvisOperatorWorkGraph = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const VERSION = 'o2.work-graph.v1';
  const INTENT_VERSION = 'o1.intent.v1';
  const PLANNED_WORK_UNIT_VERSION = 'o2.planned-work-unit.v1';

  const INTENT_LEVELS = Object.freeze([
    'UNDERSTAND',
    'PREPARE',
    'CHANGE',
    'RELEASE',
  ]);

  const KIND = Object.freeze({
    INSPECT: 'INSPECT',
    SYNTHESIZE: 'SYNTHESIZE',
    PROPOSE: 'PROPOSE',
    MODIFY: 'MODIFY',
    VERIFY: 'VERIFY',
    RELEASE_READINESS: 'RELEASE_READINESS',
  });

  const MAX_WORK_UNITS = 6;

  const PLANNED_WORK_UNIT_KEYS = Object.freeze([
    'planned_work_unit_version',
    'work_unit_id',
    'ordinal',
    'kind',
    'objective',
    'parent_objective',
    'depends_on',
    'produces',
    'planned_only',
  ]);

  const STAGE = Object.freeze({
    [KIND.INSPECT]: Object.freeze({
      objective: 'Inspect evidence relevant to the governed objective.',
      produces: 'bounded evidence set',
    }),
    [KIND.SYNTHESIZE]: Object.freeze({
      objective: 'Synthesize what the evidence establishes about the governed objective.',
      produces: 'evidence-grounded finding',
    }),
    [KIND.PROPOSE]: Object.freeze({
      objective: 'Prepare a bounded proposal for the governed objective.',
      produces: 'bounded proposal',
    }),
    [KIND.MODIFY]: Object.freeze({
      objective: 'Construct a bounded candidate change for the governed objective.',
      produces: 'candidate change',
    }),
    [KIND.VERIFY]: Object.freeze({
      objective: 'Verify the relevant candidate or evidence against the governed objective.',
      produces: 'verification evidence',
    }),
    [KIND.RELEASE_READINESS]: Object.freeze({
      objective: 'Establish the next consequential release boundary without crossing it.',
      produces: 'release-readiness finding',
    }),
  });

  const CONSTRAINTS = Object.freeze([
    'O2 consumes only a CLEAR O1 intent.',
    'O2 produces planned descriptors, not canonical W0.v2 Work Units.',
    'O2 grants no authority.',
    'O2 selects no provider or model.',
    'O2 performs no execution, mutation, integration, deployment, or production act.',
    'O3 owns authority planning for each planned Work Unit.',
  ]);

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
    return value;
  }

  function uniqueText(values) {
    if (!Array.isArray(values)) return [];
    return [...new Set(values.filter((v) => typeof v === 'string').map((v) => v.trim()).filter(Boolean))];
  }

  function stableHash(value) {
    let hash = 0x811c9dc5;
    const text = String(value);
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  function blocker(code, detail) {
    return Object.freeze({ code, detail });
  }

  function validateIntent(intent) {
    const blocks = [];
    if (!intent || typeof intent !== 'object' || Array.isArray(intent)) {
      return [blocker('O1_INTENT_REQUIRED', 'A structured O1 intent record is required.')];
    }
    if (intent.version !== INTENT_VERSION) {
      blocks.push(blocker('O1_VERSION_REQUIRED', 'O2 accepts only o1.intent.v1.'));
    }
    if (intent.standing !== 'CLEAR') {
      blocks.push(blocker('CLEAR_INTENT_REQUIRED', 'O2 refuses AMBIGUOUS or INVALID intent.'));
    }
    if (typeof intent.objective !== 'string' || !intent.objective.trim()) {
      blocks.push(blocker('OBJECTIVE_REQUIRED', 'A nonblank O1 objective is required.'));
    }
    if (!INTENT_LEVELS.includes(intent.requested_level)) {
      blocks.push(blocker('INTENT_LEVEL_REQUIRED', 'O1 requested_level is not recognized.'));
    }

    const signals = uniqueText(intent.level_signals);
    if (!signals.length || signals.some((signal) => !INTENT_LEVELS.includes(signal))) {
      blocks.push(blocker('LEVEL_SIGNALS_REQUIRED', 'O1 level_signals must contain only recognized intent levels.'));
    } else if (!signals.includes(intent.requested_level)) {
      blocks.push(blocker('REQUESTED_LEVEL_SIGNAL_REQUIRED', 'requested_level must be represented in level_signals.'));
    }

    const grants = intent.authority?.grants;
    if (!Array.isArray(grants) || grants.length !== 0 || intent.authority?.inferred !== false) {
      blocks.push(blocker('INTENT_AUTHORITY_CONTAMINATION', 'O2 refuses an O1 record that carries or infers authority.'));
    }
    return blocks;
  }

  function stageKinds(intent) {
    const signals = uniqueText(intent.level_signals);
    let kinds;
    if (signals.includes('CHANGE')) {
      kinds = [KIND.INSPECT, KIND.SYNTHESIZE, KIND.PROPOSE, KIND.MODIFY, KIND.VERIFY];
    } else if (signals.includes('PREPARE')) {
      kinds = [KIND.INSPECT, KIND.SYNTHESIZE, KIND.PROPOSE];
    } else if (signals.includes('UNDERSTAND')) {
      kinds = [KIND.INSPECT, KIND.SYNTHESIZE];
    } else {
      // A pure RELEASE intent may point at an already-existing candidate.
      // O2 therefore checks evidence/readiness instead of inventing mutation.
      kinds = [KIND.INSPECT, KIND.VERIFY];
    }

    if (signals.includes('RELEASE')) kinds.push(KIND.RELEASE_READINESS);
    return kinds;
  }

  function makeGraphId(intent) {
    const signals = uniqueText(intent.level_signals).join(',');
    return `o2-${stableHash(`${intent.version}|${intent.objective}|${intent.requested_level}|${signals}`)}`;
  }

  function compileWorkGraph(intent) {
    const blockers = validateIntent(intent);
    if (blockers.length) {
      return deepFreeze({
        ok: false,
        standing: 'REFUSED',
        graph: null,
        blockers,
      });
    }

    const graphId = makeGraphId(intent);
    const kinds = stageKinds(intent);
    if (kinds.length > MAX_WORK_UNITS) {
      return deepFreeze({
        ok: false,
        standing: 'REFUSED',
        graph: null,
        blockers: [blocker('WORK_GRAPH_TOO_LARGE', `O2 V1 is bounded to ${MAX_WORK_UNITS} planned Work Units.`)],
      });
    }

    const workUnits = kinds.map((kind, index) => {
      const workUnitId = `${graphId}-w${index + 1}`;
      const dependency = index === 0 ? [] : [`${graphId}-w${index}`];
      return {
        planned_work_unit_version: PLANNED_WORK_UNIT_VERSION,
        work_unit_id: workUnitId,
        ordinal: index + 1,
        kind,
        objective: STAGE[kind].objective,
        parent_objective: intent.objective,
        depends_on: dependency,
        produces: STAGE[kind].produces,
        planned_only: true,
      };
    });

    const edges = [];
    for (const unit of workUnits) {
      for (const dependency of unit.depends_on) {
        edges.push({ from: dependency, to: unit.work_unit_id });
      }
    }

    const graph = {
      version: VERSION,
      standing: 'READY',
      graph_id: graphId,
      intent: {
        version: intent.version,
        objective: intent.objective,
        requested_level: intent.requested_level,
        level_signals: uniqueText(intent.level_signals),
        continuation: {
          requested: intent.continuation?.requested === true,
          inherited: intent.continuation?.inherited === true,
        },
      },
      work_units: workUnits,
      edges,
      topological_order: workUnits.map((unit) => unit.work_unit_id),
      effects: {
        authority: 'none',
        routing: 'none',
        execution: 'none',
        integration: 'none',
      },
      constraints: [...CONSTRAINTS],
    };

    const graphBlockers = validateGraph(graph);
    if (graphBlockers.length) {
      return deepFreeze({
        ok: false,
        standing: 'REFUSED',
        graph: null,
        blockers: graphBlockers,
      });
    }

    return deepFreeze({
      ok: true,
      standing: 'READY',
      graph,
      blockers: [],
    });
  }

  function validateGraph(graph) {
    const blocks = [];
    if (!graph || graph.version !== VERSION || graph.standing !== 'READY') {
      return [blocker('INVALID_GRAPH', 'O2 graph version/standing is invalid.')];
    }
    if (!Array.isArray(graph.work_units) || graph.work_units.length < 1 || graph.work_units.length > MAX_WORK_UNITS) {
      blocks.push(blocker('INVALID_WORK_UNIT_COUNT', 'O2 graph must contain 1-6 planned Work Units.'));
      return blocks;
    }

    const ids = graph.work_units.map((unit) => unit.work_unit_id);
    const idSet = new Set(ids);
    if (idSet.size !== ids.length) blocks.push(blocker('DUPLICATE_WORK_UNIT_ID', 'Planned Work Unit ids must be unique.'));

    for (const unit of graph.work_units) {
      if (unit.planned_work_unit_version !== PLANNED_WORK_UNIT_VERSION || unit.planned_only !== true) {
        blocks.push(blocker('PLANNED_DESCRIPTOR_REQUIRED', 'O2 may emit only planned Work Unit descriptors.'));
      }
      if (!Object.values(KIND).includes(unit.kind)) {
        blocks.push(blocker('UNKNOWN_WORK_KIND', 'Planned Work Unit kind is not recognized.'));
      }
      for (const field of Object.keys(unit)) {
        if (!PLANNED_WORK_UNIT_KEYS.includes(field)) {
          blocks.push(blocker(
            'PLANNED_DESCRIPTOR_AUTHORITY_WIDENING',
            `O2 planned Work Units may carry only O2-owned fields; refused field: ${field}`,
          ));
        }
      }
      if (!Array.isArray(unit.depends_on)) {
        blocks.push(blocker('DEPENDENCIES_REQUIRED', 'Each planned Work Unit requires an explicit depends_on list.'));
        continue;
      }
      for (const dep of unit.depends_on) {
        if (!idSet.has(dep)) blocks.push(blocker('UNKNOWN_DEPENDENCY', `Unknown dependency: ${dep}`));
        if (dep === unit.work_unit_id) blocks.push(blocker('SELF_DEPENDENCY', 'A Work Unit cannot depend on itself.'));
      }
    }

    if (!Array.isArray(graph.topological_order)
      || graph.topological_order.length !== ids.length
      || graph.topological_order.some((id, index) => id !== ids[index])) {
      blocks.push(blocker('TOPOLOGICAL_ORDER_INVALID', 'O2 V1 topological order must exactly match deterministic Work Unit order.'));
    }

    const position = new Map(graph.topological_order.map((id, index) => [id, index]));
    for (const unit of graph.work_units) {
      for (const dep of unit.depends_on) {
        if ((position.get(dep) ?? Infinity) >= (position.get(unit.work_unit_id) ?? -1)) {
          blocks.push(blocker('DEPENDENCY_CYCLE_OR_ORDER', 'Every dependency must precede its dependent Work Unit.'));
        }
      }
    }

    const effects = graph.effects || {};
    if (effects.authority !== 'none'
      || effects.routing !== 'none'
      || effects.execution !== 'none'
      || effects.integration !== 'none') {
      blocks.push(blocker('O2_SIDE_EFFECT_DECLARATION_INVALID', 'O2 graph must declare no authority/routing/execution/integration effect.'));
    }
    return blocks;
  }

  return {
    VERSION,
    INTENT_VERSION,
    PLANNED_WORK_UNIT_VERSION,
    INTENT_LEVELS,
    KIND,
    MAX_WORK_UNITS,
    PLANNED_WORK_UNIT_KEYS,
    CONSTRAINTS,
    stableHash,
    validateIntent,
    stageKinds,
    makeGraphId,
    validateGraph,
    compileWorkGraph,
  };
});
