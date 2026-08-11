import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

export const CAPABILITIES = {
  'git.rev_parse': {
    args: {
      ref: { type: 'string', required: false, maxLength: 1000 }
    },
    handler: (args, cwd) => {
      const ref = args.ref || 'HEAD';
      const output = execFileSync('git', ['rev-parse', ref], { cwd, encoding: 'utf8' });
      return { exit_code: 0, stdout: output.trim() };
    }
  },
  'git.log': {
    args: {
      format: { type: 'string', required: false, maxLength: 1000 },
      max_count: { type: 'number', required: false, min: 1, max: 10000 },
      path: { type: 'string', required: false, maxLength: 1000 }
    },
    handler: (args, cwd) => {
      const cmd = ['log', '--pretty=format:"%H %an %ad %s"', '--date=short'];
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
      const ref = args.ref || 'HEAD';
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
      const ref1 = args.ref1 || 'HEAD~1';
      const ref2 = args.ref2 || 'HEAD';
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
      const commit = args.commit || 'HEAD';
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
      const cmd = ['log', '--oneline'];
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
      const max_results = args.max_results || 200;
      if (max_results > 200) {
        throw new Error('max_results cannot exceed 200');
      }
      const cmd = ['grep', '-r', '--line-number', '--null', args.pattern, '.'];
      try {
        const output = execFileSync('git', cmd, { cwd, encoding: 'utf8' });
        return { exit_code: 0, stdout: output.trim() };
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
      const cmd = ['ls-files', args.pattern];
      const output = execFileSync('git', cmd, { cwd, encoding: 'utf8' });
      return { exit_code: 0, stdout: output.trim() };
    }
  },
  'repo.locate_symbol': {
    args: {
      symbol: { type: 'string', required: true, maxLength: 1000 }
    },
    handler: (args, cwd) => {
      const cmd = ['grep', '-r', '--line-number', '--null', `\\b${args.symbol}\\b`, '.'];
      const output = execFileSync('git', cmd, { cwd, encoding: 'utf8' });
      return { exit_code: 0, stdout: output.trim() };
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
      const dir = args.dir || 'database/migrations';
      const output = execFileSync('git', ['ls-files', dir], { cwd, encoding: 'utf8' });
      return { exit_code: 0, stdout: output.trim() };
    }
  },
  'inventory.routes': {
    args: {
      dir: { type: 'string', required: false, maxLength: 1000 }
    },
    handler: (args, cwd) => {
      const dir = args.dir || 'app';
      const output = execFileSync('git', ['ls-files', dir], { cwd, encoding: 'utf8' });
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

export function runCapability(name, args, cwd) {
  if (!CAPABILITIES[name]) {
    throw new Error(`Unknown capability: ${name}`);
  }

  const capability = CAPABILITIES[name];
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

  // Validate paths are within cwd
  for (const argName in capability.args) {
    const argSchema = capability.args[argName];
    if (argSchema.type === 'string' && argSchema.maxLength && args[argName]) {
      const value = args[argName];
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