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

  // O3R4 seals wire admission against post-load mutation of ambient JSON helpers.
  const SAFE_ARRAY_IS_ARRAY = Array.isArray;
  const SAFE_OBJECT_FREEZE = Object.freeze;
  const SAFE_OBJECT_IS_FROZEN = Object.isFrozen;
  const SAFE_OBJECT_IS = Object.is;
  const SAFE_REFLECT_OWN_KEYS = Reflect.ownKeys;
  const SAFE_OBJECT_CREATE = Object.create;
  const SAFE_OBJECT_KEYS = Object.keys;
  const SAFE_NUMBER = Number;
  const SAFE_NUMBER_IS_FINITE = Number.isFinite;
  const SAFE_STRING = String;
  const SAFE_FROM_CHAR_CODE = String.fromCharCode;
  const SAFE_CALL = Function.call;
  const SAFE_CHAR_CODE_AT = SAFE_CALL.bind(String.prototype.charCodeAt);
  const SAFE_SLICE = SAFE_CALL.bind(String.prototype.slice);
  const SAFE_HAS_OWN = SAFE_CALL.bind(Object.prototype.hasOwnProperty);
  const HEX = '0123456789abcdef';

  const VERSION = 'o3.authority-plan.v1';
  const REQUEST_VERSION = 'o3.authority-request.v1';
  const GRAPH_VERSION = 'o2.work-graph.v1';

  const REQUEST_KEYS = Object.freeze([
    'version',
    'graph',
    'authority_input',
  ]);

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
    if (!value || typeof value !== 'object' || SAFE_OBJECT_IS_FROZEN(value)) return value;
    SAFE_OBJECT_FREEZE(value);
    const keys = SAFE_REFLECT_OWN_KEYS(value);
    for (let index = 0; index < keys.length; index += 1) {
      deepFreeze(value[keys[index]]);
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

  function keyAllowed(key, allowedKeys) {
    if (typeof key !== 'string') return false;
    for (let index = 0; index < allowedKeys.length; index += 1) {
      if (allowedKeys[index] === key) return true;
    }
    return false;
  }

  function extraOwnKeys(value, allowedKeys) {
    if (!value || typeof value !== 'object') return [];
    const extras = [];
    const keys = SAFE_REFLECT_OWN_KEYS(value);
    for (let index = 0; index < keys.length; index += 1) {
      const key = keys[index];
      if (!keyAllowed(key, allowedKeys)) extras[extras.length] = key;
    }
    return extras;
  }

  function wireError(code, detail) {
    return { code, detail };
  }

  function hexNibble(code) {
    if (code >= 48 && code <= 57) return code - 48;
    if (code >= 65 && code <= 70) return code - 55;
    if (code >= 97 && code <= 102) return code - 87;
    return -1;
  }

  function decodeCanonicalJson(text) {
    let index = 0;

    function fail(code, detail) {
      throw wireError(code, detail);
    }

    function skipWhitespace() {
      while (index < text.length) {
        const code = SAFE_CHAR_CODE_AT(text, index);
        if (code === 32 || code === 9 || code === 10 || code === 13) index += 1;
        else break;
      }
    }

    function parseString() {
      if (text[index] !== '"') fail('AUTHORITY_REQUEST_JSON_INVALID', 'Expected JSON string.');
      index += 1;
      let out = '';
      while (index < text.length) {
        const code = SAFE_CHAR_CODE_AT(text, index);
        if (code === 34) {
          index += 1;
          return out;
        }
        if (code < 32) fail('AUTHORITY_REQUEST_JSON_INVALID', 'Unescaped control character in JSON string.');
        if (code !== 92) {
          out += text[index];
          index += 1;
          continue;
        }

        index += 1;
        if (index >= text.length) fail('AUTHORITY_REQUEST_JSON_INVALID', 'Truncated JSON escape.');
        const escape = text[index];
        index += 1;
        if (escape === '"' || escape === '\\' || escape === '/') out += escape;
        else if (escape === 'b') out += '\b';
        else if (escape === 'f') out += '\f';
        else if (escape === 'n') out += '\n';
        else if (escape === 'r') out += '\r';
        else if (escape === 't') out += '\t';
        else if (escape === 'u') {
          if (index + 4 > text.length) fail('AUTHORITY_REQUEST_JSON_INVALID', 'Truncated Unicode escape.');
          let value = 0;
          for (let offset = 0; offset < 4; offset += 1) {
            const nibble = hexNibble(SAFE_CHAR_CODE_AT(text, index + offset));
            if (nibble < 0) fail('AUTHORITY_REQUEST_JSON_INVALID', 'Invalid Unicode escape.');
            value = (value * 16) + nibble;
          }
          out += SAFE_FROM_CHAR_CODE(value);
          index += 4;
        } else {
          fail('AUTHORITY_REQUEST_JSON_INVALID', 'Invalid JSON escape.');
        }
      }
      fail('AUTHORITY_REQUEST_JSON_INVALID', 'Unterminated JSON string.');
    }

    function parseNumber() {
      const begin = index;
      if (text[index] === '-') index += 1;
      if (text[index] === '0') {
        index += 1;
        if (text[index] >= '0' && text[index] <= '9') {
          fail('AUTHORITY_REQUEST_JSON_INVALID', 'Leading zero in JSON number.');
        }
      } else {
        if (!(text[index] >= '1' && text[index] <= '9')) {
          fail('AUTHORITY_REQUEST_JSON_INVALID', 'Invalid JSON number.');
        }
        while (text[index] >= '0' && text[index] <= '9') index += 1;
      }

      if (text[index] === '.') {
        index += 1;
        if (!(text[index] >= '0' && text[index] <= '9')) {
          fail('AUTHORITY_REQUEST_JSON_INVALID', 'Invalid JSON fraction.');
        }
        while (text[index] >= '0' && text[index] <= '9') index += 1;
      }

      if (text[index] === 'e' || text[index] === 'E') {
        index += 1;
        if (text[index] === '+' || text[index] === '-') index += 1;
        if (!(text[index] >= '0' && text[index] <= '9')) {
          fail('AUTHORITY_REQUEST_JSON_INVALID', 'Invalid JSON exponent.');
        }
        while (text[index] >= '0' && text[index] <= '9') index += 1;
      }

      const number = SAFE_NUMBER(SAFE_SLICE(text, begin, index));
      if (!SAFE_NUMBER_IS_FINITE(number)) {
        fail('AUTHORITY_REQUEST_JSON_INVALID', 'JSON number must be finite.');
      }
      return number;
    }

    function parseArray() {
      const out = [];
      index += 1;
      skipWhitespace();
      if (text[index] === ']') {
        index += 1;
        return out;
      }
      while (index < text.length) {
        out[out.length] = parseValue();
        skipWhitespace();
        if (text[index] === ']') {
          index += 1;
          return out;
        }
        if (text[index] !== ',') fail('AUTHORITY_REQUEST_JSON_INVALID', 'Expected comma in JSON array.');
        index += 1;
        skipWhitespace();
      }
      fail('AUTHORITY_REQUEST_JSON_INVALID', 'Unterminated JSON array.');
    }

    function parseObject() {
      const out = SAFE_OBJECT_CREATE(null);
      index += 1;
      skipWhitespace();
      if (text[index] === '}') {
        index += 1;
        return out;
      }
      while (index < text.length) {
        if (text[index] !== '"') fail('AUTHORITY_REQUEST_JSON_INVALID', 'Expected JSON object key.');
        const key = parseString();
        if (SAFE_HAS_OWN(out, key)) {
          fail('AUTHORITY_REQUEST_DUPLICATE_KEY', 'Duplicate JSON object key: ' + key);
        }
        skipWhitespace();
        if (text[index] !== ':') fail('AUTHORITY_REQUEST_JSON_INVALID', 'Expected colon after JSON object key.');
        index += 1;
        skipWhitespace();
        out[key] = parseValue();
        skipWhitespace();
        if (text[index] === '}') {
          index += 1;
          return out;
        }
        if (text[index] !== ',') fail('AUTHORITY_REQUEST_JSON_INVALID', 'Expected comma in JSON object.');
        index += 1;
        skipWhitespace();
      }
      fail('AUTHORITY_REQUEST_JSON_INVALID', 'Unterminated JSON object.');
    }

    function parseValue() {
      skipWhitespace();
      const ch = text[index];
      if (ch === '"') return parseString();
      if (ch === '{') return parseObject();
      if (ch === '[') return parseArray();
      if (ch === '-' || (ch >= '0' && ch <= '9')) return parseNumber();
      if (SAFE_SLICE(text, index, index + 4) === 'true') {
        index += 4;
        return true;
      }
      if (SAFE_SLICE(text, index, index + 5) === 'false') {
        index += 5;
        return false;
      }
      if (SAFE_SLICE(text, index, index + 4) === 'null') {
        index += 4;
        return null;
      }
      fail('AUTHORITY_REQUEST_JSON_INVALID', 'Unexpected token in JSON input.');
    }

    const value = parseValue();
    skipWhitespace();
    if (index !== text.length) fail('AUTHORITY_REQUEST_JSON_INVALID', 'Trailing data after JSON value.');
    return value;
  }

  function hex4(code) {
    return HEX[(code >> 12) & 15]
      + HEX[(code >> 8) & 15]
      + HEX[(code >> 4) & 15]
      + HEX[code & 15];
  }

  function encodeJsonString(value) {
    let out = '"';
    for (let index = 0; index < value.length; index += 1) {
      const code = SAFE_CHAR_CODE_AT(value, index);
      if (code === 34) out += '\\"';
      else if (code === 92) out += '\\\\';
      else if (code === 8) out += '\\b';
      else if (code === 12) out += '\\f';
      else if (code === 10) out += '\\n';
      else if (code === 13) out += '\\r';
      else if (code === 9) out += '\\t';
      else if (code < 32 || (code >= 0xd800 && code <= 0xdfff)) out += '\\u' + hex4(code);
      else out += value[index];
    }
    return out + '"';
  }

  function sortedStringKeys(value) {
    const source = SAFE_OBJECT_KEYS(value);
    const keys = [];
    for (let index = 0; index < source.length; index += 1) {
      keys[keys.length] = source[index];
    }
    for (let i = 1; i < keys.length; i += 1) {
      const current = keys[i];
      let j = i - 1;
      while (j >= 0 && keys[j] > current) {
        keys[j + 1] = keys[j];
        j -= 1;
      }
      keys[j + 1] = current;
    }
    return keys;
  }

  function encodeCanonicalJson(value) {
    if (value === null) return 'null';
    if (value === true) return 'true';
    if (value === false) return 'false';
    if (typeof value === 'string') return encodeJsonString(value);
    if (typeof value === 'number') {
      if (!SAFE_NUMBER_IS_FINITE(value)) {
        throw wireError('AUTHORITY_REQUEST_UNSUPPORTED_VALUE', 'Canonical authority JSON permits only finite numbers.');
      }
      return SAFE_OBJECT_IS(value, -0) ? '0' : SAFE_STRING(value);
    }
    if (SAFE_ARRAY_IS_ARRAY(value)) {
      let out = '[';
      for (let index = 0; index < value.length; index += 1) {
        if (index > 0) out += ',';
        out += encodeCanonicalJson(value[index]);
      }
      return out + ']';
    }
    if (value && typeof value === 'object') {
      const keys = sortedStringKeys(value);
      let out = '{';
      for (let index = 0; index < keys.length; index += 1) {
        if (index > 0) out += ',';
        const key = keys[index];
        out += encodeJsonString(key) + ':' + encodeCanonicalJson(value[key]);
      }
      return out + '}';
    }
    throw wireError(
      'AUTHORITY_REQUEST_UNSUPPORTED_VALUE',
      'Canonical authority JSON cannot encode ' + typeof value + '.',
    );
  }

  function parseCanonicalAuthorityRequest(serializedRequest) {
    if (typeof serializedRequest !== 'string') {
      return deepFreeze({
        ok: false,
        request: null,
        blockers: [blocker(
          'SERIALIZED_AUTHORITY_REQUEST_REQUIRED',
          'O3 accepts only canonical serialized JSON text at its public authority-planning boundary.',
          'request',
        )],
      });
    }

    let request;
    try {
      request = decodeCanonicalJson(serializedRequest);
    } catch (error) {
      const code = error && error.code === 'AUTHORITY_REQUEST_DUPLICATE_KEY'
        ? 'AUTHORITY_REQUEST_DUPLICATE_KEY'
        : 'AUTHORITY_REQUEST_JSON_INVALID';
      return deepFreeze({
        ok: false,
        request: null,
        blockers: [blocker(
          code,
          error && error.detail ? error.detail : 'O3 authority request is not valid sealed JSON.',
          'request',
        )],
      });
    }

    if (!request || typeof request !== 'object' || SAFE_ARRAY_IS_ARRAY(request)) {
      return deepFreeze({
        ok: false,
        request: null,
        blockers: [blocker(
          'AUTHORITY_REQUEST_OBJECT_REQUIRED',
          'O3 authority request JSON must decode to one object envelope.',
          'request',
        )],
      });
    }

    let canonical;
    try {
      canonical = encodeCanonicalJson(request);
    } catch (error) {
      return deepFreeze({
        ok: false,
        request: null,
        blockers: [blocker(
          error && error.code ? error.code : 'AUTHORITY_REQUEST_JSON_INVALID',
          error && error.detail ? error.detail : 'O3 authority request cannot be canonically encoded.',
          'request',
        )],
      });
    }

    if (canonical !== serializedRequest) {
      return deepFreeze({
        ok: false,
        request: null,
        blockers: [blocker(
          'AUTHORITY_REQUEST_NON_CANONICAL_JSON',
          'O3 accepts one deterministic key-sorted canonical JSON byte representation only.',
          'request',
        )],
      });
    }

    const blocks = [];
    const requestKeys = SAFE_REFLECT_OWN_KEYS(request);
    for (let index = 0; index < requestKeys.length; index += 1) {
      const key = requestKeys[index];
      if (!keyAllowed(key, REQUEST_KEYS)) {
        blocks.push(blocker(
          'AUTHORITY_REQUEST_ENVELOPE_WIDENING',
          'O3 authority request carries an unexpected field: ' + SAFE_STRING(key),
          'request',
        ));
      }
    }

    for (let index = 0; index < REQUEST_KEYS.length; index += 1) {
      const key = REQUEST_KEYS[index];
      if (!SAFE_HAS_OWN(request, key)) {
        blocks.push(blocker(
          'AUTHORITY_REQUEST_FIELD_MISSING',
          'O3 authority request is missing required field: ' + key,
          'request.' + key,
        ));
      }
    }

    if (request.version !== REQUEST_VERSION) {
      blocks.push(blocker(
        'AUTHORITY_REQUEST_VERSION_REQUIRED',
        'O3 accepts only ' + REQUEST_VERSION + '.',
        'request.version',
      ));
    }

    if (blocks.length) {
      return deepFreeze({ ok: false, request: null, blockers: blocks });
    }

    return deepFreeze({
      ok: true,
      request: deepFreeze(request),
      blockers: [],
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

  function planAuthority(serializedRequest) {
    const parsed = parseCanonicalAuthorityRequest(serializedRequest);
    if (!parsed.ok) {
      return deepFreeze({
        ok: false,
        standing: 'REFUSED',
        authority_plan: null,
        blockers: parsed.blockers,
      });
    }

    const inertGraph = parsed.request.graph;
    const inertInput = parsed.request.authority_input;
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
    REQUEST_VERSION,
    REQUEST_KEYS,
    GRAPH_VERSION,
    GRAPH_KEYS,
    INPUT_KEYS,
    REQUIREMENTS,
    EFFECTS,
    CONSTRAINTS,
    AUTHORITY_TO_ACTION,
    KNOWN_AUTHORITIES,
    extraOwnKeys,
    decodeCanonicalJson,
    encodeCanonicalJson,
    parseCanonicalAuthorityRequest,
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
