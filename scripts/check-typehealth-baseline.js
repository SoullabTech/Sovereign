#!/usr/bin/env node
/**
 * scripts/check-typehealth-baseline.js
 *
 * The enforced no-regression TypeScript gate. `npm run typecheck`.
 *
 * Runs the application-wide ship config (tsconfig.ship.json) and compares the
 * resulting diagnostics against a checked-in baseline, failing only when a
 * change makes type health WORSE.
 *
 * Why a baseline: as of 2026-07-30 the ship config reports 239 pre-existing
 * errors. A bare `tsc` gate would be red on day one and would simply be
 * bypassed. See docs/ops/TYPECHECK_GATE_COVERAGE_AUDIT_2026-07-30.md.
 *
 * FAILS when:
 *   1. NEW        — a diagnostic identity not present in the baseline appears
 *   2. INCREASED  — an existing diagnostic identity occurs more times than baselined
 *   3. COVERAGE   — a path the baseline had in the program is no longer in the
 *                   program, while the file still exists on disk (i.e. it was
 *                   excluded/narrowed out rather than legitimately deleted)
 *
 * PASSES (and reports) when:
 *   - diagnostics are fixed or occur fewer times  (baseline may shrink freely)
 *   - files are deleted from disk and thus leave the program
 *   - new paths enter the program
 *
 * Diagnostic identity is NOT a count. Each diagnostic is keyed on:
 *      file  |  TS code  |  normalized message
 * plus an occurrence count per key. A count-only baseline would let one error
 * vanish while a different one appears and still report "no regression".
 *
 * Line numbers are deliberately excluded from the identity key: they shift on
 * every insertion above a diagnostic and would produce constant false
 * regressions. Lines are still recorded per key (`lines`) for diagnosis.
 *
 * Re-baselining is a GOVERNED ACT, not a way to make the gate green. `--update`
 * alone refuses to write: it prints a before/after summary and exits non-zero.
 * Writing additionally requires `--accept-current`, and the summary names
 * exactly which errors would be blessed.
 *
 * Usage:
 *   node scripts/check-typehealth-baseline.js                            # enforce
 *   node scripts/check-typehealth-baseline.js --update                   # dry run: show what would change
 *   node scripts/check-typehealth-baseline.js --update --accept-current  # actually rewrite
 *   node scripts/check-typehealth-baseline.js --json                     # machine-readable result
 */

'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const PROJECT = 'tsconfig.ship.json';
const BASELINE_PATH = path.join(REPO_ROOT, 'typecheck-baseline.json');
const BASELINE_VERSION = 1;

const argv = process.argv.slice(2);
const UPDATE = argv.includes('--update');
const ACCEPT = argv.includes('--accept-current');
const JSON_OUT = argv.includes('--json');

// ---------------------------------------------------------------- tsc runners

function runTsc(extraArgs) {
  const args = ['tsc', '-p', PROJECT, '--noEmit', '--pretty', 'false', ...extraArgs];
  const res = spawnSync('npx', args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    env: { ...process.env, FORCE_COLOR: '0' },
  });
  if (res.error) {
    throw new Error(`Failed to spawn tsc: ${res.error.message}`);
  }
  return `${res.stdout || ''}${res.stderr || ''}`;
}

/** Paths in the compilation program, repo-relative, excluding node_modules. */
function collectProgramPaths() {
  // --listFilesOnly skips type checking entirely, so this is cheap.
  const out = runTsc(['--listFilesOnly']);
  const paths = new Set();
  for (const raw of out.split('\n')) {
    const line = raw.trim();
    if (!line || line.includes('node_modules')) continue;
    if (!path.isAbsolute(line)) continue;
    const rel = path.relative(REPO_ROOT, line);
    if (rel.startsWith('..')) continue;
    paths.add(toPosix(rel));
  }
  return paths;
}

// ------------------------------------------------------------------- parsing

const DIAG_RE = /^(.+?)\((\d+),(\d+)\): (error|warning) (TS\d+): (.*)$/;

function toPosix(p) {
  return p.split(path.sep).join('/');
}

/**
 * Strip anything environment-specific so the same defect produces the same
 * string on any machine and in any worktree.
 */
function normalizeMessage(msg) {
  return msg
    .split(REPO_ROOT)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

function collectDiagnostics() {
  const out = runTsc([]);
  /** @type {Map<string, {file:string, code:string, message:string, count:number, lines:number[]}>} */
  const byKey = new Map();
  let total = 0;

  for (const raw of out.split('\n')) {
    // Indented lines are continuations of the preceding diagnostic.
    if (!raw || /^\s/.test(raw)) continue;
    const m = DIAG_RE.exec(raw.replace(/\r$/, ''));
    if (!m) continue;
    const [, rawFile, lineStr, , severity, code, rawMessage] = m;
    if (severity !== 'error') continue;

    const abs = path.isAbsolute(rawFile) ? rawFile : path.join(REPO_ROOT, rawFile);
    const file = toPosix(path.relative(REPO_ROOT, abs));
    const message = normalizeMessage(rawMessage);
    const key = `${file}|${code}|${message}`;

    total += 1;
    const existing = byKey.get(key);
    if (existing) {
      existing.count += 1;
      existing.lines.push(Number(lineStr));
    } else {
      byKey.set(key, { file, code, message, count: 1, lines: [Number(lineStr)] });
    }
  }

  if (total === 0 && /error TS\d+/.test(out)) {
    // Diagnostics were emitted in a shape we failed to parse — refuse to
    // silently report a clean run.
    throw new Error(
      'tsc emitted diagnostics that this script could not parse. Refusing to report a pass.\n' +
        out.split('\n').slice(0, 20).join('\n')
    );
  }

  return { byKey, total };
}

// ------------------------------------------------------------------ baseline

function serializeBaseline(byKey, programPaths) {
  const diagnostics = [...byKey.values()]
    .sort((a, b) =>
      a.file.localeCompare(b.file) || a.code.localeCompare(b.code) || a.message.localeCompare(b.message)
    )
    .map((d) => ({
      file: d.file,
      code: d.code,
      message: d.message,
      count: d.count,
      lines: [...d.lines].sort((x, y) => x - y),
    }));

  return {
    $schema: 'typecheck-baseline/v1',
    version: BASELINE_VERSION,
    project: PROJECT,
    note:
      'Generated by scripts/check-typehealth-baseline.js --update. Diagnostic identity is ' +
      'file|code|message with a per-key count; line numbers are recorded for diagnosis but ' +
      'are not part of the identity. Regenerate only to record FIXES or intentional coverage ' +
      'changes — never to absorb a new error.',
    totalErrors: diagnostics.reduce((n, d) => n + d.count, 0),
    diagnostics,
    coverage: [...programPaths].sort(),
  };
}

function loadBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) {
    return null;
  }
  const parsed = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
  if (parsed.version !== BASELINE_VERSION) {
    throw new Error(
      `Baseline version ${parsed.version} is not supported (expected ${BASELINE_VERSION}). ` +
        'Regenerate with: npm run typecheck:baseline'
    );
  }
  return parsed;
}

function writeBaseline(payload) {
  fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

// ---------------------------------------------------------------- comparison

function keyOf(d) {
  return `${d.file}|${d.code}|${d.message}`;
}

function compare(current, baseline) {
  const baseByKey = new Map(baseline.diagnostics.map((d) => [keyOf(d), d]));
  const baseCoverage = new Set(baseline.coverage || []);

  const introduced = [];
  const increased = [];
  const fixed = [];
  const decreased = [];

  for (const [key, cur] of current.byKey) {
    const prev = baseByKey.get(key);
    if (!prev) {
      introduced.push(cur);
    } else if (cur.count > prev.count) {
      increased.push({ ...cur, baselineCount: prev.count });
    } else if (cur.count < prev.count) {
      decreased.push({ ...cur, baselineCount: prev.count });
    }
  }

  for (const [key, prev] of baseByKey) {
    if (!current.byKey.has(key)) fixed.push(prev);
  }

  const coverageLost = [];
  const coverageDeleted = [];
  for (const p of baseCoverage) {
    if (current.programPaths.has(p)) continue;
    if (fs.existsSync(path.join(REPO_ROOT, p))) {
      // The file is still here but no longer compiled: the program was narrowed.
      coverageLost.push(p);
    } else {
      coverageDeleted.push(p);
    }
  }

  const coverageGained = [...current.programPaths].filter((p) => !baseCoverage.has(p));

  return {
    introduced,
    increased,
    fixed,
    decreased,
    coverageLost: coverageLost.sort(),
    coverageDeleted: coverageDeleted.sort(),
    coverageGained: coverageGained.sort(),
  };
}

// ------------------------------------------------------------------ reporting

function fmt(d) {
  const where = d.lines && d.lines.length ? `:${d.lines.slice(0, 3).join(',')}` : '';
  const times = d.count > 1 ? ` (x${d.count})` : '';
  return `  ${d.file}${where}  ${d.code}: ${d.message}${times}`;
}

function listTruncated(items, limit, render) {
  const shown = items.slice(0, limit).map(render);
  if (items.length > limit) shown.push(`  … and ${items.length - limit} more`);
  return shown.join('\n');
}

// ------------------------------------------------------- guarded re-baseline

/**
 * Re-baselining is a governed act. A bare `--update` refuses to write: it shows
 * the full before/after and exits non-zero. `--accept-current` is the explicit
 * acknowledgement required to bless the current state.
 */
function runUpdate(current) {
  const { byKey, total, programPaths } = current;
  const existing = loadBaseline();
  const payload = serializeBaseline(byKey, programPaths);

  if (!existing) {
    if (!ACCEPT) {
      console.error(
        `No baseline exists at ${path.relative(REPO_ROOT, BASELINE_PATH)}.\n\n` +
          `  Would record : ${total} error(s), ${byKey.size} identities, ${programPaths.size} files\n\n` +
          'Creating the first baseline is a governed act. Re-run with:\n' +
          '  npm run typecheck:baseline -- --accept-current\n'
      );
      return 1;
    }
    writeBaseline(payload);
    console.log(
      `✅  Baseline created: ${path.relative(REPO_ROOT, BASELINE_PATH)}\n` +
        `    ${total} error(s), ${byKey.size} identities, ${programPaths.size} files`
    );
    return 0;
  }

  const d = compare(current, existing);
  const blessesNewErrors = d.introduced.length > 0 || d.increased.length > 0;
  const blessesCoverageLoss = d.coverageLost.length > 0;

  console.log(
    'Re-baseline — before / after\n' +
      `  errors        : ${existing.totalErrors}  ->  ${total}\n` +
      `  identities    : ${existing.diagnostics.length}  ->  ${byKey.size}\n` +
      `  program files : ${(existing.coverage || []).length}  ->  ${programPaths.size}\n`
  );

  if (d.fixed.length || d.decreased.length) {
    console.log(`  ✨ removing ${d.fixed.length} fixed identit(ies), ${d.decreased.length} reduced`);
  }
  if (d.coverageDeleted.length) {
    console.log(`  🗑  dropping ${d.coverageDeleted.length} path(s) deleted from disk`);
  }
  if (d.coverageGained.length) {
    console.log(`  📈 adding ${d.coverageGained.length} path(s) newly in the program`);
  }
  console.log('');

  if (blessesNewErrors) {
    console.error(
      `⚠️  THIS WOULD BLESS ${d.introduced.length} NEW and ${d.increased.length} INCREASED diagnostic(s):`
    );
    console.error(listTruncated(d.introduced, 25, fmt));
    console.error(
      listTruncated(d.increased, 25, (x) => `${fmt(x)}  [baseline x${x.baselineCount}]`)
    );
    console.error(
      '\n    The baseline records PRE-EXISTING debt. Absorbing a newly introduced error\n' +
        '    into it defeats the gate. Fix the diagnostics instead.\n'
    );
  }
  if (blessesCoverageLoss) {
    console.error(
      `⚠️  THIS WOULD BLESS ${d.coverageLost.length} path(s) leaving the program while still on disk:`
    );
    console.error(listTruncated(d.coverageLost, 25, (p) => `  ${p}`));
    console.error('\n    Only accept this if the narrowing is intentional and reviewed.\n');
  }

  if (!ACCEPT) {
    console.error(
      'Refusing to write. Re-baselining is a governed act, not a way to make the gate green.\n' +
        'If the summary above is what you intend to record, re-run with:\n' +
        '  npm run typecheck:baseline -- --accept-current\n'
    );
    return 1;
  }

  writeBaseline(payload);
  console.log(
    `✅  Baseline written: ${path.relative(REPO_ROOT, BASELINE_PATH)}\n` +
      `    ${total} error(s), ${byKey.size} identities, ${programPaths.size} files` +
      (blessesNewErrors || blessesCoverageLoss
        ? '\n\n⚠️  This baseline blessed new errors and/or coverage loss (see above).\n' +
          '    Say so explicitly in the commit message and the PR.'
        : '')
  );
  return 0;
}

// ----------------------------------------------------------------------- main

function main() {
  const programPaths = collectProgramPaths();
  const { byKey, total } = collectDiagnostics();
  const current = { byKey, total, programPaths };

  if (UPDATE) {
    return runUpdate(current);
  }

  const baseline = loadBaseline();
  if (!baseline) {
    console.error(
      `❌  No baseline found at ${path.relative(REPO_ROOT, BASELINE_PATH)}.\n` +
        '    Create one with: npm run typecheck:baseline'
    );
    return 1;
  }

  const result = compare(current, baseline);
  const failed =
    result.introduced.length > 0 || result.increased.length > 0 || result.coverageLost.length > 0;

  if (JSON_OUT) {
    console.log(
      JSON.stringify(
        {
          ok: !failed,
          project: PROJECT,
          currentErrors: total,
          baselineErrors: baseline.totalErrors,
          ...result,
        },
        null,
        2
      )
    );
    return failed ? 1 : 0;
  }

  console.log(
    `TypeScript no-regression gate — ${PROJECT}\n` +
      `  program files : ${programPaths.size} (baseline ${(baseline.coverage || []).length})\n` +
      `  errors        : ${total} (baseline ${baseline.totalErrors})\n`
  );

  if (result.introduced.length) {
    console.error(`❌  NEW diagnostics (${result.introduced.length}):`);
    console.error(listTruncated(result.introduced, 40, fmt));
    console.error('');
  }
  if (result.increased.length) {
    console.error(`❌  INCREASED occurrences (${result.increased.length}):`);
    console.error(
      listTruncated(result.increased, 40, (d) => `${fmt(d)}  [baseline x${d.baselineCount}]`)
    );
    console.error('');
  }
  if (result.coverageLost.length) {
    console.error(
      `❌  COVERAGE LOST (${result.coverageLost.length}) — these files still exist on disk but\n` +
        `    left the ${PROJECT} program. The gate was narrowed:`
    );
    console.error(listTruncated(result.coverageLost, 40, (p) => `  ${p}`));
    console.error('');
  }

  if (result.fixed.length || result.decreased.length) {
    const fixedCount =
      result.fixed.reduce((n, d) => n + d.count, 0) +
      result.decreased.reduce((n, d) => n + (d.baselineCount - d.count), 0);
    console.log(
      `✨  ${fixedCount} error(s) fixed since the baseline ` +
        `(${result.fixed.length} identities gone, ${result.decreased.length} reduced).\n` +
        '    Lock it in with: npm run typecheck:baseline\n'
    );
  }
  if (result.coverageGained.length) {
    console.log(`📈  ${result.coverageGained.length} new file(s) entered the program.\n`);
  }
  if (result.coverageDeleted.length) {
    console.log(
      `🗑   ${result.coverageDeleted.length} baselined file(s) were deleted from disk (not a regression).\n`
    );
  }

  if (failed) {
    console.error(
      'Gate FAILED. Fix the diagnostics above.\n' +
        'Do NOT run `npm run typecheck:baseline` to absorb a new error — the baseline records\n' +
        'pre-existing debt only. Full inventory: npm run typecheck:full\n'
    );
    return 1;
  }

  console.log('✅  No TypeScript regressions.');
  return 0;
}

try {
  process.exit(main());
} catch (err) {
  console.error(`❌  ${err.message}`);
  process.exit(1);
}
