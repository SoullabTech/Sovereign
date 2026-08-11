// JARVIS Desktop — C0 capability form logic.
//
// Pure, DOM-free, dependency-free. Loaded two ways:
//   * renderer  — plain <script> tag, attaches to window.JarvisCapabilityForm
//   * main/test — require('./capability-form.js')
//
// SCOPE DISCIPLINE. This module does not know what any capability MEANS. It
// only reshapes the registry's own `args` schema into something a form can
// render, and mirrors the registry's own validation locally so obviously
// invalid input is caught before it reaches the router. It invents no
// descriptions, no categories, no argument semantics, and no defaults. The
// registry in scripts/builder/deterministic.mjs remains authoritative — this
// is a lens over it, never a second catalog.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JarvisCapabilityForm = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /**
   * Reshape the live CAPABILITIES object into a serializable manifest.
   *
   * Only fields the registry actually declares survive. A capability with no
   * `args` yields an empty argument list — which the UI must present as
   * "no machine-readable schema", not as "no arguments allowed".
   */
  function buildManifest(capabilities) {
    if (!capabilities || typeof capabilities !== 'object') return [];
    return Object.keys(capabilities)
      .sort()
      .map((name) => {
        const spec = capabilities[name] || {};
        const argSpecs = spec.args && typeof spec.args === 'object' ? spec.args : null;
        return {
          name,
          // `has_schema` is the honest signal the UI branches on: false means
          // the registry told us nothing, so Advanced JSON is the only input.
          has_schema: argSpecs !== null,
          args: argSpecs
            ? Object.keys(argSpecs).map((argName) => {
                const a = argSpecs[argName] || {};
                const out = { name: argName, type: a.type, required: a.required === true };
                if (a.maxLength !== undefined) out.maxLength = a.maxLength;
                if (a.min !== undefined) out.min = a.min;
                if (a.max !== undefined) out.max = a.max;
                if (Array.isArray(a.enum)) out.enum = a.enum.slice();
                return out;
              })
            : [],
        };
      });
  }

  function findCapability(manifest, name) {
    if (!Array.isArray(manifest) || typeof name !== 'string') return null;
    return manifest.find((c) => c.name === name) || null;
  }

  function isRegistered(manifest, name) {
    return findCapability(manifest, name) !== null;
  }

  /**
   * Validate an already-typed args object against a manifest entry.
   * Mirrors runCapability()'s checks — it does not replace them.
   */
  function validateTypedArgs(entry, args) {
    const errors = [];
    if (!entry) return { ok: false, errors: ['No capability selected.'] };
    if (!args || typeof args !== 'object' || Array.isArray(args)) {
      return { ok: false, errors: ['Arguments must be a JSON object.'] };
    }

    const known = new Set(entry.args.map((a) => a.name));
    for (const key of Object.keys(args)) {
      if (!known.has(key)) {
        errors.push(
          entry.has_schema
            ? `Unexpected argument: ${key}`
            : `Capability ${entry.name} declares no argument schema — cannot validate ${key} locally.`
        );
      }
    }

    for (const a of entry.args) {
      const value = args[a.name];
      if (value === undefined || value === null) {
        if (a.required) errors.push(`Missing required argument: ${a.name}`);
        continue;
      }
      if (a.type === 'string') {
        if (typeof value !== 'string') errors.push(`Argument ${a.name} must be a string`);
        else if (value.length > (a.maxLength || 1000)) errors.push(`Argument ${a.name} exceeds maximum length (${a.maxLength || 1000})`);
      } else if (a.type === 'number') {
        if (typeof value !== 'number' || !Number.isFinite(value)) errors.push(`Argument ${a.name} must be a number`);
        else {
          if (a.min !== undefined && value < a.min) errors.push(`Argument ${a.name} must be at least ${a.min}`);
          if (a.max !== undefined && value > a.max) errors.push(`Argument ${a.name} must be at most ${a.max}`);
        }
      } else if (a.type === 'enum') {
        if (!a.enum || !a.enum.includes(value)) errors.push(`Argument ${a.name} must be one of: ${(a.enum || []).join(', ')}`);
      }
    }

    return { ok: errors.length === 0, errors };
  }

  /**
   * Turn raw form strings into the typed args object the registry expects.
   *
   * A blank field is an ABSENT argument, never an empty string — otherwise
   * every optional field would silently override the capability's own default
   * (e.g. inventory.routes' `dir` defaulting to 'app').
   */
  function coerceFormValues(entry, rawValues) {
    const args = {};
    const errors = [];
    if (!entry) return { ok: false, args, errors: ['No capability selected.'] };
    const raw = rawValues && typeof rawValues === 'object' ? rawValues : {};

    for (const a of entry.args) {
      const rawValue = raw[a.name];
      const text = rawValue === undefined || rawValue === null ? '' : String(rawValue).trim();
      if (text === '') continue; // absent, not empty
      if (a.type === 'number') {
        const n = Number(text);
        if (!Number.isFinite(n)) {
          errors.push(`Argument ${a.name} must be a number`);
          continue;
        }
        args[a.name] = n;
      } else {
        args[a.name] = text;
      }
    }

    if (errors.length) return { ok: false, args, errors };
    const check = validateTypedArgs(entry, args);
    return { ok: check.ok, args, errors: check.errors };
  }

  /** Parse the Advanced JSON field. Blank means "no arguments". */
  function parseAdvancedArgs(text) {
    const s = typeof text === 'string' ? text.trim() : '';
    if (s === '') return { ok: true, args: {}, errors: [] };
    let parsed;
    try {
      parsed = JSON.parse(s);
    } catch (e) {
      return { ok: false, args: null, errors: [`Arguments are not valid JSON: ${e.message}`] };
    }
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, args: null, errors: ['Arguments must be a JSON object, e.g. {"dir":"app/api"}'] };
    }
    return { ok: true, args: parsed, errors: [] };
  }

  /**
   * The single pre-submit gate for a C0 task.
   *
   * Returns the task payload UNCHANGED from what is valid today —
   * { capability, args } — or a list of local errors and no task. An invalid
   * C0 input never becomes a router call just to discover it was invalid.
   */
  function validateSubmission(input) {
    const { manifest, capabilityName, mode, rawValues, advancedText } = input || {};
    const name = typeof capabilityName === 'string' ? capabilityName.trim() : '';

    if (name === '') return { ok: false, task: null, errors: ['Select a capability.'] };
    if (!isRegistered(manifest, name)) {
      return {
        ok: false,
        task: null,
        errors: [`'${name}' is not a registered deterministic capability. Choose one from the list.`],
      };
    }

    const entry = findCapability(manifest, name);
    let result;
    if (mode === 'advanced') {
      const parsed = parseAdvancedArgs(advancedText);
      if (!parsed.ok) return { ok: false, task: null, errors: parsed.errors };
      const check = validateTypedArgs(entry, parsed.args);
      result = { ok: check.ok, args: parsed.args, errors: check.errors };
    } else {
      result = coerceFormValues(entry, rawValues);
    }

    if (!result.ok) return { ok: false, task: null, errors: result.errors };
    return { ok: true, task: { capability: name, args: result.args }, errors: [] };
  }

  /**
   * How a result's verification should be WORDED. Kept here so the wording is
   * derived from the response, never from presentation convenience: an
   * execution-only check may not be rendered as result correctness.
   */
  function describeVerification(verification) {
    if (!verification) return 'NOT VERIFIED';
    if (verification.kind === 'execution') {
      return verification.pass
        ? `EXECUTION VERIFIED · RESULT ${String(verification.correctness || 'unverified').toUpperCase()}`
        : 'EXECUTION VERIFICATION FAILED';
    }
    return verification.pass ? 'RESULT VERIFIED' : 'RESULT VERIFICATION FAILED';
  }

  return {
    buildManifest,
    findCapability,
    isRegistered,
    validateTypedArgs,
    coerceFormValues,
    parseAdvancedArgs,
    validateSubmission,
    describeVerification,
  };
});
