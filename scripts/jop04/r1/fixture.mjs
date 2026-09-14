// JOP-04 R1/R1a · hermetic Git fixture.
//
// ⭐ R1 REQUIREMENT: D1 · D2.3 · D3 · D5 · D6 are NEVER exercised against the JOP repository.
//    Deterministic authors, dates, filenames and contents mean instrument prose, new commits and
//    new documentation cannot move the behaviour being judged. The self-documentation species
//    (five incidents) is retired by construction, not by discipline.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ENV = {
  ...process.env,
  GIT_AUTHOR_NAME: 'R1 Fixture', GIT_AUTHOR_EMAIL: 'fixture@example.invalid',
  GIT_COMMITTER_NAME: 'R1 Fixture', GIT_COMMITTER_EMAIL: 'fixture@example.invalid',
  GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_SYSTEM: '/dev/null',
};
const at = (iso) => ({ ...ENV, GIT_AUTHOR_DATE: iso, GIT_COMMITTER_DATE: iso });

// ── D1 subjects ────────────────────────────────────────────────────────────────────────
// TWO literal subjects, because D1 forbids BOTH selection injection AND namespace annexation.
export const LITERAL_GLOB_FILE = 'app/*.ts';               // wildcard-looking NAME
export const LITERAL_MAGIC_FILE = ':(literal)app/a.ts';    // git-MAGIC-looking NAME
export const ORDINARY_FILE = 'app/a.ts';                   // the control the magic form would annex

// ── D6 subjects ────────────────────────────────────────────────────────────────────────
export const SYMBOL = 'alpha.beta';
export const LOOKALIKE = 'alphaXbeta';                     // matches only if '.' is regex syntax
export const EMBED_LEFT = 'prefixalpha.beta';              // matches only if search is substring
export const EMBED_RIGHT = 'alpha.betaSuffix';             // matches only if search is substring

// ── other subjects ─────────────────────────────────────────────────────────────────────
export const BRE_PATTERN = 'ZEBRA\\|QUAGGA';               // BRE alternation · ERE/fixed: literal
export const MANY_TOKEN = 'REPETEND';
export const MANY_COUNT = 12;

export const C_ORDINARY = 'fixture: ordinary files app/a.ts and app/b.ts';
export const C_GLOB     = 'fixture: the wildcard-named literal subject, alone';
export const C_MAGIC    = 'fixture: the magic-named literal subject, alone';
export const C_SYMBOL   = 'fixture: symbol, lookalike and embedded-literal controls';
export const C_BULK     = 'fixture: repetition and a migrations directory';

export function buildFixture({ patternType = 'extended' } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jop04-r1-'));
  const g = (args, env = ENV) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', env });
  const w = (rel, body) => {
    const p = path.join(root, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, body);
  };

  g(['init', '-q', '-b', 'main']);
  g(['config', 'user.name', 'R1 Fixture']);
  g(['config', 'user.email', 'fixture@example.invalid']);
  // ⭐ D5/D6.4: the fixture repo deliberately declares an ambient dialect. Varying it must not
  //    change what a contract-pinned capability means.
  g(['config', 'grep.patternType', patternType]);

  // commit 1 — ordinary files only (the controls)
  w(ORDINARY_FILE, `export const a = 1;\n// ${LOOKALIKE} is not the symbol\nZEBRA\n`);
  w('app/b.ts', `export const b = 2;\nQUAGGA\n`);
  g(['add', '-A']); g(['commit', '-q', '-m', C_ORDINARY], at('2020-01-01T00:00:00+00:00'));

  // commit 2 — the wildcard-named literal subject, ALONE so commit-returning capabilities discriminate
  w(LITERAL_GLOB_FILE, `// a real file literally named app/*.ts\nexport const wildcardNamed = true;\n`);
  g(['add', '-A']); g(['commit', '-q', '-m', C_GLOB], at('2020-01-02T00:00:00+00:00'));

  // commit 3 — the MAGIC-named literal subject, ALONE.
  // ⛔ Under git pathspec magic, ':(literal)app/a.ts' denotes the ORDINARY file app/a.ts.
  //    Under literal identity it denotes THIS file. That is namespace annexation, and a repair
  //    that special-cases only globbing passes the wildcard arm and fails here.
  w(LITERAL_MAGIC_FILE, `// a real file literally named :(literal)app/a.ts\nexport const magicNamed = true;\n`);
  g(['add', '-A']); g(['commit', '-q', '-m', C_MAGIC], at('2020-01-03T00:00:00+00:00'));

  // commit 4 — D6 subjects, one per line so each control is separately observable
  w('src/sym.ts', [
    `const target = { ${SYMBOL} };            // SUBJECT — the literal whole symbol`,
    `const regexControl = ${LOOKALIKE};       // must NOT match: '.' as regex syntax`,
    `const leftControl = ${EMBED_LEFT};       // must NOT match: substring on the left`,
    `const rightControl = ${EMBED_RIGHT};     // must NOT match: substring on the right`,
    '',
  ].join('\n'));
  g(['add', '-A']); g(['commit', '-q', '-m', C_SYMBOL], at('2020-01-04T00:00:00+00:00'));

  // commit 5 — repetition + a migrations dir for the default-bearing inventory capabilities
  w('many.txt', Array.from({ length: MANY_COUNT }, (_, i) => `line ${i} ${MANY_TOKEN}`).join('\n') + '\n');
  w('database/migrations/0001_init.sql', '-- fixture migration\n');
  g(['add', '-A']); g(['commit', '-q', '-m', C_BULK], at('2020-01-05T00:00:00+00:00'));

  return { root, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

/** A directory that is NOT a git repository — the F-D.5 genuine-failure arm. */
export function buildNonRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jop04-r1-nonrepo-'));
  fs.writeFileSync(path.join(root, 'plain.txt'), `${MANY_TOKEN}\n`);
  return { root, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}
