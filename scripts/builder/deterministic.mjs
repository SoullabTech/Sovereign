import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

// ── HOST DEFAULTS (D4) ─────────────────────────────────────────────────────────────────
// Omission belongs to the CALLER; default resolution belongs to the HOST.
// ⭐ ONE table, read by BOTH describeInvocation() and the handlers, so the DESCRIBED
//    execution plan cannot drift from the ACT actually performed. A second copy would let
//    the record be truthful about a plan the runtime does not follow.
export const HOST_DEFAULTS = Object.freeze({
  'git.rev_parse':        { ref: 'HEAD' },
  'git.show_stat':        { ref: 'HEAD' },
  'git.diff_stat':        { ref1: 'HEAD~1', ref2: 'HEAD' },
  'git.branch_contains':  { commit: 'HEAD' },
  'repo.grep':            { max_results: 200 },
  'inventory.migrations': { dir: 'database/migrations' },
  'inventory.routes':     { dir: 'app' },
});

/** Effective value for one field: the caller's term when supplied, else the host default. */
function eff(name, args, field) {
  const supplied = args?.[field];
  if (supplied !== undefined && supplied !== null) return supplied;
  return HOST_DEFAULTS[name]?.[field];
}

// ── D1 · LITERAL PATH IDENTITY ─────────────────────────────────────────────────────────
// A path is an identity; a pathspec is a selection program. Caller path text carries
// identity, never selection authority — and a magic-LOOKING name must still be REACHABLE,
// so the mechanism neutralizes pathspec interpretation rather than rejecting the spelling.
const LITERAL = '--literal-pathspecs';

// ── ARGUMENT ROLE (D1 · D5 · D6) ───────────────────────────────────────────────────────
// ⭐ A term's ROLE is assigned by the capability contract. It is NEVER read off the value.
//    Path containment applies to the arguments that ARE paths — not to every string whose
//    characters happen to look path-like. `repo.grep.pattern` and `repo.locate_symbol.symbol`
//    are a GREP_PATTERN and a SYMBOL even when they contain '../', and must be adjudicated
//    as such. ⛔ Inference-by-characters is the architecture the rulings superseded.
//
// ⛔ This narrows WHICH arguments are path-adjudicated. It does NOT weaken containment for
//    the arguments that are paths: every entry below keeps exactly the behaviour it had.
// ⭐ Declared OUTSIDE the args schemas on purpose — the schema objects stay byte-identical,
//    so no out-of-scope capability's declaration is disturbed by this correction.
const PATH_ROLE_ARGUMENTS = Object.freeze({
  'git.log':              ['path'],
  'git.file_history':     ['file'],
  'repo.find_file':       ['pattern'],   // D1: reclassified PATH (literal identity)
  'inventory.migrations': ['dir'],
  'inventory.routes':     ['dir'],
  'verify.file_exists':   ['path'],
  'verify.sha256':        ['path'],
  'verify.count_matches': ['file'],      // `pattern` here is a JS_REGEX, never a path
});

// ── WHOLE-SYMBOL POLICY (D6) ───────────────────────────────────────────────────────────
// Host-authored, applied by US to candidate lines — never delegated to a matcher flag, so no
// underlying tool grammar can narrow the caller's admitted domain.
//
// A literal occurrence is a WHOLE symbol unless it would be a FRAGMENT of a longer run of
// word constituents: the boundary fails only when the adjacent character AND the symbol's own
// edge character are both word constituents.
//
// ⭐ Derived from the symbol's OWN characters — no punctuation allowlist, no special case for
//    '+', '-', '.', '*'. And no symbol is excluded from the domain: one whose edge is not a
//    word constituent is always boundary-satisfied on that side, which is exactly why `+foo`
//    is findable inside `x+foo` while `alpha.beta` is still not found inside `prefixalpha.beta`.
const WORD_CONSTITUENT = /[\p{L}\p{N}_]/u;
const isWordChar = (ch) => ch !== undefined && WORD_CONSTITUENT.test(ch);

function occursAsWholeSymbol(content, symbol) {
  if (symbol === '') return false;
  const leftEdgeIsWord = isWordChar(symbol[0]);
  const rightEdgeIsWord = isWordChar(symbol[symbol.length - 1]);
  let from = 0;
  for (;;) {
    const i = content.indexOf(symbol, from);
    if (i === -1) return false;
    const j = i + symbol.length;
    const leftOk = i === 0 || !(leftEdgeIsWord && isWordChar(content[i - 1]));
    const rightOk = j === content.length || !(rightEdgeIsWord && isWordChar(content[j]));
    if (leftOk && rightOk) return true;
    from = i + 1;
  }
}

/** git grep --null emits `path\0line\0content` per record. */
function recordContent(record) {
  const parts = record.split('\0');
  return parts.length >= 3 ? parts.slice(2).join('\0') : '';
}

// ── D3 · GLOBAL RESULT BOUND ───────────────────────────────────────────────────────────
// `max_results` bounds the number of RESULT RECORDS returned by the INVOCATION — not per
// file, not a scan budget. It TRUNCATES the capability's existing ordered stream, so
// results(N) is always a prefix of results(M) for N < M.
// ⛔ No ranking, scoring, sampling, deduplication or file preference is introduced: the
//    only operation is taking the first N records of the stream the capability already has.
function boundRecords(output, max) {
  const records = String(output).split('\n').filter((line) => line !== '');
  return records.slice(0, max).join('\n');
}

export const CAPABILITIES = {
  'git.rev_parse': {
    args: {
      ref: { type: 'string', required: false, maxLength: 1000 }
    },
    handler: (args, cwd) => {
      const ref = eff('git.rev_parse', args, 'ref');
      const output = execFileSync('git', ['rev-parse', ref], { cwd, encoding: 'utf8' });
      return { exit_code: 0, stdout: output.trim() };
    }
  },
  'git.log': {
    // D2 (A · SCHEMA WRONG): `format` is NOT an authorized caller term. It is absent from the
    // schema, so the registry validator refuses it as an unexpected argument — REFUSED, never
    // accepted-and-ignored, never stripped, never canonicalized to {} (D2.6).
    // ⛔ D2.3: the observable output stays exactly as it is. Removing the field is not licence
    //    to change fields, ordering, date treatment, quoting or record order.
    args: {
      max_count: { type: 'number', required: false, min: 1, max: 10000 },
      path: { type: 'string', required: false, maxLength: 1000 }
    },
    handler: (args, cwd) => {
      const cmd = [LITERAL, 'log', '--pretty=format:"%H %an %ad %s"', '--date=short'];
      if (args.max_count) cmd.push(`-${args.max_count}`);
      if (args.path) cmd.push('--', args.path);
      const output = execFileSync('git', cmd, { cwd, encoding: 'utf8' });
      return { exit_code: 0, stdout: output.trim() };
    }
  },
  'git.show_stat': {
    args: {
      ref: { type: 'string', required: false, maxLength: 1000 }
    },
    handler: (args, cwd) => {
      const ref = eff('git.show_stat', args, 'ref');
      const output = execFileSync('git', ['show', '--stat', ref], { cwd, encoding: 'utf8' });
      return { exit_code: 0, stdout: output.trim() };
    }
  },
  'git.diff_stat': {
    args: {
      ref1: { type: 'string', required: false, maxLength: 1000 },
      ref2: { type: 'string', required: false, maxLength: 1000 }
    },
    handler: (args, cwd) => {
      const ref1 = eff('git.diff_stat', args, 'ref1');
      const ref2 = eff('git.diff_stat', args, 'ref2');
      const output = execFileSync('git', ['diff', '--stat', ref1, ref2], { cwd, encoding: 'utf8' });
      return { exit_code: 0, stdout: output.trim() };
    }
  },
  'git.branch_contains': {
    args: {
      branch: { type: 'string', required: true, maxLength: 1000 },
      commit: { type: 'string', required: false, maxLength: 1000 }
    },
    handler: (args, cwd) => {
      const commit = eff('git.branch_contains', args, 'commit');
      try {
        execFileSync('git', ['merge-base', '--is-ancestor', commit, args.branch], { cwd, encoding: 'utf8' });
        return { exit_code: 0, stdout: 'true' };
      } catch (error) {
        if (error.status === 1) {
          return { exit_code: 0, stdout: 'false' };
        }
        throw error;
      }
    }
  },
  'git.file_history': {
    args: {
      file: { type: 'string', required: true, maxLength: 1000 },
      max_count: { type: 'number', required: false, min: 1, max: 10000 }
    },
    handler: (args, cwd) => {
      const cmd = [LITERAL, 'log', '--oneline'];
      if (args.max_count) cmd.push(`-${args.max_count}`);
      cmd.push('--', args.file);
      const output = execFileSync('git', cmd, { cwd, encoding: 'utf8' });
      return { exit_code: 0, stdout: output.trim() };
    }
  },
  'repo.grep': {
    args: {
      pattern: { type: 'string', required: true, maxLength: 1000 },
      max_results: { type: 'number', required: false, min: 1, max: 200 }
    },
    handler: (args, cwd) => {
      const max_results = eff('repo.grep', args, 'max_results');
      if (max_results > 200) {
        throw new Error('max_results cannot exceed 200');
      }
      // D5: the pattern language is POSIX BRE, PINNED BY THIS CONTRACT. `--basic-regexp`
      // leaves ambient `grep.patternType` with zero authority over what the caller's
      // expression MEANS. The caller authors the expression; the contract authors the language.
      const cmd = ['grep', '--basic-regexp', '-r', '--line-number', '--null', args.pattern, '.'];
      try {
        const output = execFileSync('git', cmd, { cwd, encoding: 'utf8' });
        return { exit_code: 0, stdout: boundRecords(output, max_results) };
      } catch (err) {
        // `git grep` exits 1 for "no matches" — that is a valid ZERO-RESULT
        // outcome, not a failure. Any other exit code is a real error and
        // must still propagate. Bounded fix — see
        // docs/ops/JARVIS_ROUTE_A_CUSTODY_ADOPTION_PROOF_2026-08-11.md.
        if (err.status === 1) {
          return { exit_code: 0, stdout: '' };
        }
        throw err;
      }
    }
  },
  'repo.find_file': {
    args: {
      pattern: { type: 'string', required: true, maxLength: 1000 }
    },
    handler: (args, cwd) => {
      const cmd = [LITERAL, 'ls-files', args.pattern];
      const output = execFileSync('git', cmd, { cwd, encoding: 'utf8' });
      return { exit_code: 0, stdout: output.trim() };
    }
  },
  'repo.locate_symbol': {
    args: {
      symbol: { type: 'string', required: true, maxLength: 1000 }
    },
    handler: (args, cwd) => {
      // D6: the caller supplies a LITERAL symbol.
      //   `--fixed-strings`  caller punctuation is SOUGHT, never executed as matcher syntax,
      //                      and the flavour is pinned so ambient config has no authority.
      //   `-e <symbol> --`   the symbol occupies a VALUE position, never an option position,
      //                      so a leading '-' is sought rather than parsed. General: no
      //                      character is special-cased.
      // ⛔ NO matcher flag decides what counts as a whole symbol. `--word-regexp` was removed
      //    because it imports git's word-character grammar and thereby NARROWS the caller's
      //    admitted domain — reporting a present symbol like `+foo` as ABSENT, which is a
      //    confident wrong answer rather than an error. The whole-symbol policy is applied
      //    HERE, by the host, over literal candidates.
      const cmd = ['grep', '--fixed-strings', '-r', '--line-number', '--null', '-e', args.symbol, '--', '.'];
      try {
        const output = execFileSync('git', cmd, { cwd, encoding: 'utf8' });
        const whole = output
          .split('\n')
          .filter((record) => record !== '')
          .filter((record) => occursAsWholeSymbol(recordContent(record), args.symbol));
        return { exit_code: 0, stdout: whole.join('\n') };
      } catch (err) {
        // F-D: absence is an ANSWER, not a failure to answer. git represents "no matches"
        // with status 1; that is transport, not public meaning. ⛔ NARROW BY CONSTRUCTION —
        // only status 1 normalizes. Every other status (a non-repository, a tool failure)
        // still propagates, so a genuine failure can never be returned as zero records.
        if (err.status === 1) {
          return { exit_code: 0, stdout: '' };
        }
        throw err;
      }
    }
  },
  'check.run': {
    args: {
      test_type: { type: 'enum', required: true, enum: ['typecheck', 'test', 'lint'] }
    },
    handler: (args, cwd) => {
      const output = execFileSync('node', [join(cwd, 'scripts/builder/run-check.mjs'), args.test_type], { cwd, encoding: 'utf8' });
      return { exit_code: 0, stdout: output.trim() };
    }
  },
  'inventory.migrations': {
    args: {
      dir: { type: 'string', required: false, maxLength: 1000 }
    },
    handler: (args, cwd) => {
      const dir = eff('inventory.migrations', args, 'dir');
      const output = execFileSync('git', [LITERAL, 'ls-files', dir], { cwd, encoding: 'utf8' });
      return { exit_code: 0, stdout: output.trim() };
    }
  },
  'inventory.routes': {
    args: {
      dir: { type: 'string', required: false, maxLength: 1000 }
    },
    handler: (args, cwd) => {
      const dir = eff('inventory.routes', args, 'dir');
      const output = execFileSync('git', [LITERAL, 'ls-files', dir], { cwd, encoding: 'utf8' });
      return { exit_code: 0, stdout: output.trim() };
    }
  },
  'verify.file_exists': {
    args: {
      path: { type: 'string', required: true, maxLength: 1000 }
    },
    handler: (args, cwd) => {
      try {
        const fullPath = resolve(cwd, args.path);
        if (!fullPath.startsWith(cwd)) {
          throw new Error('Path resolves outside cwd');
        }
        readFileSync(fullPath, 'utf8');
        return { exit_code: 0, stdout: 'true' };
      } catch (error) {
        return { exit_code: 1, stdout: 'false' };
      }
    }
  },
  'verify.sha256': {
    args: {
      path: { type: 'string', required: true, maxLength: 1000 }
    },
    handler: (args, cwd) => {
      const fullPath = resolve(cwd, args.path);
      if (!fullPath.startsWith(cwd)) {
        throw new Error('Path resolves outside cwd');
      }
      const content = readFileSync(fullPath);
      const hash = createHash('sha256').update(content).digest('hex');
      return { exit_code: 0, stdout: hash };
    }
  },
  'verify.count_matches': {
    args: {
      pattern: { type: 'string', required: true, maxLength: 1000 },
      file: { type: 'string', required: true, maxLength: 1000 }
    },
    handler: (args, cwd) => {
      const fullPath = resolve(cwd, args.file);
      if (!fullPath.startsWith(cwd)) {
        throw new Error('Path resolves outside cwd');
      }
      const content = readFileSync(fullPath, 'utf8');
      const matches = content.match(new RegExp(args.pattern, 'g'));
      const count = matches ? matches.length : 0;
      return { exit_code: 0, stdout: count.toString() };
    }
  }
};

// ── D4 · THE OBSERVATION SEAM ──────────────────────────────────────────────────────────
// A PURE, read-only description of one invocation: what the CALLER authored, what the HOST
// resolved, and the effective terms execution will use. It executes nothing.
//
//   caller_terms      exactly what the caller supplied — an omitted field is ABSENT here,
//                     never backfilled. Omission is a caller-authored absence.
//   host_terms        only fields the HOST resolved, each carrying source: 'host_default'.
//   effective_terms   caller terms merged over host resolution — the values execution uses.
//
// ⭐ Both come from HOST_DEFAULTS, the same table the handlers read, so this describes the
//    act actually performed rather than documenting an execution plan nobody follows.
// ⛔ `{}` and `{ ref: 'HEAD' }` remain DIFFERENT canonical invocations that presently share
//    one effective execution. Identical effect is not identical authorship.
export function describeInvocation(name, args = {}) {
  const capability = CAPABILITIES[name];
  if (!capability) {
    throw new Error(`Unknown capability: ${name}`);
  }
  // ⭐ ONE admission judgment, shared with runCapability(). An inadmissible request is not an
  //    invocation and will not be described as one: a record that disagreed with the executor
  //    about what an act even IS could not ground act identity.
  validateSchema(name, args);

  const caller_terms = {};
  for (const argName in capability.args) {
    const value = args[argName];
    if (value !== undefined && value !== null) caller_terms[argName] = value;
  }

  const host_terms = {};
  const defaults = HOST_DEFAULTS[name] || {};
  for (const field in defaults) {
    if (caller_terms[field] === undefined) {
      host_terms[field] = { value: defaults[field], source: 'host_default' };
    }
  }

  const effective_terms = { ...caller_terms };
  for (const field in host_terms) effective_terms[field] = host_terms[field].value;

  return { capability: name, caller_terms, host_terms, effective_terms };
}

// ── SCHEMA ADMISSION (D4) ──────────────────────────────────────────────────────────────
// The single judgement of whether a request is an admissible invocation. Both the observation
// seam and the executor consume it, so they cannot disagree about what an act is.
// ⛔ Schema admission ONLY — it confers no execution permission and decides no authority.
export function validateSchema(name, args) {
  const capability = CAPABILITIES[name];
  if (!capability) {
    throw new Error(`Unknown capability: ${name}`);
  }
  const validatedArgs = {};

  // Validate arguments against schema
  for (const argName in capability.args) {
    const argSchema = capability.args[argName];
    const value = args[argName];

    if (argSchema.required && (value === undefined || value === null)) {
      throw new Error(`Missing required argument: ${argName}`);
    }

    if (value !== undefined && value !== null) {
      // Type validation
      if (argSchema.type === 'string') {
        if (typeof value !== 'string') {
          throw new Error(`Argument ${argName} must be a string`);
        }
        if (value.length > (argSchema.maxLength || 1000)) {
          throw new Error(`Argument ${argName} exceeds maximum length`);
        }
      } else if (argSchema.type === 'number') {
        if (typeof value !== 'number') {
          throw new Error(`Argument ${argName} must be a number`);
        }
        if (argSchema.min !== undefined && value < argSchema.min) {
          throw new Error(`Argument ${argName} must be at least ${argSchema.min}`);
        }
        if (argSchema.max !== undefined && value > argSchema.max) {
          throw new Error(`Argument ${argName} must be at most ${argSchema.max}`);
        }
      } else if (argSchema.type === 'enum') {
        if (!argSchema.enum.includes(value)) {
          throw new Error(`Argument ${argName} must be one of: ${argSchema.enum.join(', ')}`);
        }
      }

      validatedArgs[argName] = value;
    }
  }

  // Check for unexpected arguments
  for (const argName in args) {
    if (!capability.args[argName]) {
      throw new Error(`Unexpected argument: ${argName}`);
    }
  }

  return validatedArgs;
}

export function runCapability(name, args, cwd) {
  const capability = CAPABILITIES[name];
  if (!capability) {
    throw new Error(`Unknown capability: ${name}`);
  }

  const validatedArgs = validateSchema(name, args);

  // Validate paths are within cwd.
  // ⭐ Applied to the arguments the CONTRACT declares to be paths, never to every string whose
  //    characters look path-like. Unchanged behaviour for every path argument; a GREP_PATTERN
  //    or a SYMBOL is simply no longer adjudicated as a path because of how it is spelled.
  for (const argName of PATH_ROLE_ARGUMENTS[name] || []) {
    const value = args[argName];
    if (typeof value === 'string' && value) {
      if (value.startsWith('/') || value.includes('../') || value.includes('..\\')) {
        const fullPath = resolve(cwd, value);
        if (!fullPath.startsWith(cwd)) {
          throw new Error(`Path argument ${argName} resolves outside cwd`);
        }
      }
    }
  }

  return capability.handler(validatedArgs, cwd);
}