// JARVIS-SVE-01 / SVE-01 — S1 Specification Contract.
// Pure, deterministic, DOM-free, filesystem-free, clock-free, randomness-free.
// Converts an explicit, structured human specification into an immutable
// machine-readable record. It never grants authority, binds an environment,
// binds verification, routes work, or executes anything.
//
// Seam: HUMAN LANGUAGE → O1 intent (authority-empty) → S1 spec (this file,
// authority-empty, non-executing) → SVE-02 / SVE-03 / Work Unit (not wired).
'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JarvisSveSpecContract = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const SVE_SPEC_VERSION = 'sve.spec.v1';

  const STANDING = Object.freeze({
    ADMITTED: 'ADMITTED',
    REFUSED: 'REFUSED',
  });

  // Field vocabulary of an admitted sve.spec.v1 record, in canonical order.
  // `version` is carried on every record; the rest is human-supplied meaning.
  const TEXT_FIELDS = Object.freeze([
    'spec_id',
    'intent',
    'current_state',
    'target_state',
    'checkpoint',
  ]);

  // List fields that must carry at least one explicit entry. Absence is never
  // read as "anything" (scope), "everything else allowed" (exclusions),
  // "looks good" (success), "continue" (stop) or "no basis" (authority).
  const REQUIRED_LIST_FIELDS = Object.freeze([
    'scope',
    'exclusions',
    'authority_basis',
    'success_criteria',
    'failure_criteria',
    'stop_conditions',
  ]);

  // Declarative lists that must be present and well-formed but may be
  // explicitly empty: an empty list is an explicit statement, not a default.
  const DECLARATIVE_LIST_FIELDS = Object.freeze([
    'inputs',
    'expected_outputs',
  ]);

  const SVE_SPEC_FIELDS = Object.freeze([
    'version',
    'spec_id',
    'intent',
    'current_state',
    'target_state',
    'scope',
    'exclusions',
    'authority_basis',
    'inputs',
    'expected_outputs',
    'success_criteria',
    'failure_criteria',
    'stop_conditions',
    'checkpoint',
  ]);

  // Fields that would convert an authority reference into executable
  // permission. An S1 record has no mechanism for this; naming one refuses.
  const AUTHORITY_GRANT_FIELDS = Object.freeze([
    'grants',
    'authority_grants',
    'authorized_acts',
    'write_permission',
    'merge_permission',
    'deploy_permission',
    'production_permission',
    'provider_permission',
    'network_permission',
  ]);

  // Concepts that belong to later SVE stages. Naming one at S1 top level
  // refuses with the stage it belongs to, so S1 never becomes an envelope.
  const LATER_STAGE_FIELDS = Object.freeze({
    success_evidence: 'SVE-02',
    falsifiers: 'SVE-02',
    invariants: 'SVE-02',
    world_state_evidence: 'SVE-02',
    critic: 'SVE-02',
    critic_requirement: 'SVE-02',
    independent_review: 'SVE-02',
    abort_law: 'SVE-02',
    repair_boundary: 'SVE-02',
    verifier_results: 'SVE-02',
    canonical: 'SVE-03',
    canonical_sha: 'SVE-03',
    branch: 'SVE-03',
    worktree: 'SVE-03',
    model: 'SVE-03',
    models: 'SVE-03',
    provider: 'SVE-03',
    providers: 'SVE-03',
    tools: 'SVE-03',
    runtime: 'SVE-03',
    external_systems: 'SVE-03',
    environment: 'SVE-03',
    route: 'SVE-04',
    routing: 'SVE-04',
    execution: 'SVE-04',
    lifecycle: 'SVE-04',
    orchestration: 'SVE-04',
    witness: 'SVE-04',
    adjudication: 'SVE-04',
    merge: 'C0',
    deploy: 'C0',
    production: 'C0',
    canonicalization: 'C0',
    learning: 'L0',
  });

  const REFUSAL = Object.freeze({
    INVALID_INPUT: 'INVALID_INPUT',
    VERSION_MISMATCH: 'VERSION_MISMATCH',
    MISSING_SPEC_ID: 'MISSING_SPEC_ID',
    MISSING_INTENT: 'MISSING_INTENT',
    MISSING_CURRENT_STATE: 'MISSING_CURRENT_STATE',
    MISSING_TARGET_STATE: 'MISSING_TARGET_STATE',
    MISSING_SCOPE: 'MISSING_SCOPE',
    MISSING_EXCLUSIONS: 'MISSING_EXCLUSIONS',
    MISSING_AUTHORITY_BASIS: 'MISSING_AUTHORITY_BASIS',
    MISSING_INPUTS: 'MISSING_INPUTS',
    MISSING_EXPECTED_OUTPUTS: 'MISSING_EXPECTED_OUTPUTS',
    MISSING_SUCCESS_CRITERIA: 'MISSING_SUCCESS_CRITERIA',
    MISSING_FAILURE_CRITERIA: 'MISSING_FAILURE_CRITERIA',
    MISSING_STOP_CONDITIONS: 'MISSING_STOP_CONDITIONS',
    MISSING_CHECKPOINT: 'MISSING_CHECKPOINT',
    INVALID_FIELD_TYPE: 'INVALID_FIELD_TYPE',
    AUTHORITY_GRANT_FIELD: 'AUTHORITY_GRANT_FIELD',
    LATER_STAGE_FIELD: 'LATER_STAGE_FIELD',
    UNKNOWN_FIELD: 'UNKNOWN_FIELD',
  });

  const MISSING_CODE_BY_FIELD = Object.freeze({
    spec_id: REFUSAL.MISSING_SPEC_ID,
    intent: REFUSAL.MISSING_INTENT,
    current_state: REFUSAL.MISSING_CURRENT_STATE,
    target_state: REFUSAL.MISSING_TARGET_STATE,
    scope: REFUSAL.MISSING_SCOPE,
    exclusions: REFUSAL.MISSING_EXCLUSIONS,
    authority_basis: REFUSAL.MISSING_AUTHORITY_BASIS,
    inputs: REFUSAL.MISSING_INPUTS,
    expected_outputs: REFUSAL.MISSING_EXPECTED_OUTPUTS,
    success_criteria: REFUSAL.MISSING_SUCCESS_CRITERIA,
    failure_criteria: REFUSAL.MISSING_FAILURE_CRITERIA,
    stop_conditions: REFUSAL.MISSING_STOP_CONDITIONS,
    checkpoint: REFUSAL.MISSING_CHECKPOINT,
  });

  const FIXED_CONSTRAINTS = Object.freeze([
    'This specification record grants no authority.',
    'authority_basis names the basis under which the specification was authored; it is not a grant.',
    'Verification binding belongs to SVE-02; environment binding belongs to SVE-03.',
    'Nothing in this record is executed, routed, verified or bound by SVE-01.',
  ]);

  // The only representational normalization defined for S1: leading and
  // trailing whitespace is trimmed. Internal text is preserved verbatim so
  // that human wording is never rewritten by the contract.
  function normalizeText(value) {
    return typeof value === 'string' ? value.trim() : null;
  }

  function isPlainObject(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  }

  function deepFreeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.freeze(value);
      for (const key of Object.keys(value)) deepFreeze(value[key]);
    }
    return value;
  }

  function blocker(code, field, message) {
    return Object.freeze({ code, field, message });
  }

  function readText(input, field, blockers) {
    const raw = input[field];
    if (raw === undefined || raw === null) {
      blockers.push(blocker(MISSING_CODE_BY_FIELD[field], field, `${field} is required and was not supplied.`));
      return null;
    }
    if (typeof raw !== 'string') {
      blockers.push(blocker(REFUSAL.INVALID_FIELD_TYPE, field, `${field} must be a string.`));
      return null;
    }
    const text = normalizeText(raw);
    if (!text) {
      blockers.push(blocker(MISSING_CODE_BY_FIELD[field], field, `${field} is empty; SVE-01 does not supply it.`));
      return null;
    }
    return text;
  }

  function readList(input, field, blockers, { allowEmpty }) {
    const raw = input[field];
    if (raw === undefined || raw === null) {
      blockers.push(blocker(MISSING_CODE_BY_FIELD[field], field, `${field} is required and was not supplied.`));
      return null;
    }
    if (!Array.isArray(raw)) {
      blockers.push(blocker(REFUSAL.INVALID_FIELD_TYPE, field, `${field} must be an array of strings.`));
      return null;
    }
    const items = [];
    for (let i = 0; i < raw.length; i += 1) {
      const item = raw[i];
      if (typeof item !== 'string') {
        blockers.push(blocker(REFUSAL.INVALID_FIELD_TYPE, field, `${field}[${i}] must be a string.`));
        return null;
      }
      const text = normalizeText(item);
      if (!text) {
        blockers.push(blocker(REFUSAL.INVALID_FIELD_TYPE, field, `${field}[${i}] is empty.`));
        return null;
      }
      items.push(text);
    }
    if (items.length === 0 && !allowEmpty) {
      blockers.push(blocker(MISSING_CODE_BY_FIELD[field], field, `${field} must name at least one explicit entry; SVE-01 supplies no default.`));
      return null;
    }
    return Object.freeze(items);
  }

  function classifyForeignKeys(input, blockers) {
    for (const key of Object.keys(input)) {
      if (SVE_SPEC_FIELDS.includes(key)) continue;
      if (AUTHORITY_GRANT_FIELDS.includes(key)) {
        blockers.push(blocker(REFUSAL.AUTHORITY_GRANT_FIELD, key, `${key} would turn an authority reference into a grant; an S1 record has no such field.`));
      } else if (Object.prototype.hasOwnProperty.call(LATER_STAGE_FIELDS, key)) {
        blockers.push(blocker(REFUSAL.LATER_STAGE_FIELD, key, `${key} belongs to ${LATER_STAGE_FIELDS[key]}, not to the S1 specification.`));
      } else {
        blockers.push(blocker(REFUSAL.UNKNOWN_FIELD, key, `${key} is not a field of ${SVE_SPEC_VERSION}.`));
      }
    }
  }

  function refused(blockers) {
    return deepFreeze({
      ok: false,
      version: SVE_SPEC_VERSION,
      standing: STANDING.REFUSED,
      spec: null,
      blockers: blockers.slice(),
      constraints: FIXED_CONSTRAINTS.slice(),
    });
  }

  // Admit an explicit human specification as an immutable sve.spec.v1 record.
  // All blockers are collected, not first-failed, so a refusal names every
  // reason and a witness can show a fixture died for the intended law.
  function admitSpec(input) {
    const blockers = [];

    if (!isPlainObject(input)) {
      blockers.push(blocker(REFUSAL.INVALID_INPUT, null, 'A specification must be a plain object.'));
      return refused(blockers);
    }

    if (input.version !== undefined && input.version !== SVE_SPEC_VERSION) {
      blockers.push(blocker(REFUSAL.VERSION_MISMATCH, 'version', `version ${JSON.stringify(input.version)} is not ${SVE_SPEC_VERSION}; historical versions are not reinterpreted.`));
    }

    classifyForeignKeys(input, blockers);

    const spec_id = readText(input, 'spec_id', blockers);
    const intent = readText(input, 'intent', blockers);
    const current_state = readText(input, 'current_state', blockers);
    const target_state = readText(input, 'target_state', blockers);
    const scope = readList(input, 'scope', blockers, { allowEmpty: false });
    const exclusions = readList(input, 'exclusions', blockers, { allowEmpty: false });
    const authority_basis = readList(input, 'authority_basis', blockers, { allowEmpty: false });
    const inputs = readList(input, 'inputs', blockers, { allowEmpty: true });
    const expected_outputs = readList(input, 'expected_outputs', blockers, { allowEmpty: true });
    const success_criteria = readList(input, 'success_criteria', blockers, { allowEmpty: false });
    const failure_criteria = readList(input, 'failure_criteria', blockers, { allowEmpty: false });
    const stop_conditions = readList(input, 'stop_conditions', blockers, { allowEmpty: false });
    const checkpoint = readText(input, 'checkpoint', blockers);

    if (blockers.length > 0) return refused(blockers);

    const spec = deepFreeze({
      version: SVE_SPEC_VERSION,
      spec_id,
      intent,
      current_state,
      target_state,
      scope,
      exclusions,
      authority_basis,
      inputs,
      expected_outputs,
      success_criteria,
      failure_criteria,
      stop_conditions,
      checkpoint,
    });

    return deepFreeze({
      ok: true,
      version: SVE_SPEC_VERSION,
      standing: STANDING.ADMITTED,
      spec,
      blockers: [],
      constraints: FIXED_CONSTRAINTS.slice(),
    });
  }

  // Deterministic serialization in canonical field order. Two admitted records
  // with identical meaning serialize identically regardless of the key order
  // of the input object, the process, or the environment.
  function serializeSpec(spec) {
    if (!isPlainObject(spec) && !(spec && typeof spec === 'object')) return null;
    const ordered = {};
    for (const field of SVE_SPEC_FIELDS) ordered[field] = spec[field];
    return JSON.stringify(ordered);
  }

  return {
    SVE_SPEC_VERSION,
    STANDING,
    REFUSAL,
    SVE_SPEC_FIELDS,
    TEXT_FIELDS,
    REQUIRED_LIST_FIELDS,
    DECLARATIVE_LIST_FIELDS,
    AUTHORITY_GRANT_FIELDS,
    LATER_STAGE_FIELDS,
    FIXED_CONSTRAINTS,
    normalizeText,
    admitSpec,
    serializeSpec,
  };
});
