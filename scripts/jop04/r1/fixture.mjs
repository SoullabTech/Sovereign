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

// ── R1c · SYMBOL DOMAIN FIXTURE ────────────────────────────────────────────────────────
// ⭐ A SEPARATE repository, deliberately NOT the pinned fixture. The D2.3 pin is an exact
//    byte value over git.log output, so ANY change to buildFixture()'s commits would move
//    the commit SHAs and break a sealed pin this act is not authorized to re-seal.
//    New boundaries therefore get their own subject rather than disturbing the pinned one.
//
// D6 permits ARBITRARY literal symbol strings and forbids an accidental lexical grammar.
// These vectors are legitimate symbols from real languages that a word-character grammar,
// or an argv parser, mishandles:
//   x+foo      `+foo` sits with a WORD character on its left — a word-boundary rule reports
//              it ABSENT although it is present. A confident wrong answer, not an error.
//   p->next    `->next` begins with '-', so an unguarded argv position consumes it as an
//              OPTION rather than seeking it.
export const DOMAIN_WORD_NEIGHBOUR = '+foo';   // present in the tree, left neighbour is a word char
export const DOMAIN_DASH_LEADING = '->next';   // a real symbol that looks like an option
export const DOMAIN_ABSENT = '@@no_such_symbol@@';

// R1d · a NON-BMP (astral) Unicode letter. U+1D49C is a Unicode Letter, so it is a word
// constituent — but in UTF-16 it is TWO code units, and `symbol[0]` returns a lone high
// surrogate that no \p{L} test will match. A boundary policy that indexes code UNITS
// therefore misclassifies its own stated notion of a word constituent at the symbol's edges.
// ⛔ The character is only a falsifier for code-unit indexing; the law is general —
//    Unicode classification must operate on CODE POINTS, never on UTF-16 halves.
export const DOMAIN_ASTRAL = '\u{1D49C}';           // 𝒜
export const MARK_ASTRAL_STANDALONE = 'ASTRAL_STANDALONE';
export const MARK_ASTRAL_EMBEDDED = 'ASTRAL_EMBEDDED';

// R1e · the CONTENT side of the same law. The astral vectors above exercise only the SYMBOL's
// edges; a repair that fixed just those (`[...symbol][0]`) would still read the characters
// ADJACENT TO THE OCCURRENCE as code units. Here the symbol is an ordinary BMP letter and the
// surrogate pair sits in the CONTENT, immediately beside it:
//   𝒜Ƶ   content[i-1] is the LOW surrogate of 𝒜  → misread as non-word → left wrongly accepted
//   Ƶ𝒜   content[j]   is the HIGH surrogate of 𝒜 → misread as non-word → right wrongly accepted
// Either way the symbol matches as a FRAGMENT of a longer word-constituent run.
export const DOMAIN_BMP = '\u01B5';                  // Ƶ · a BMP Unicode letter
export const MARK_BMP_STANDALONE = 'BMP_STANDALONE';
export const MARK_BMP_ASTRAL_LEFT = 'BMP_ASTRAL_LEFT';
export const MARK_BMP_ASTRAL_RIGHT = 'BMP_ASTRAL_RIGHT';

export function buildSymbolDomainFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jop04-r1c-'));
  const g = (args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', env: ENV });
  g(['init', '-q', '-b', 'main']);
  g(['config', 'user.name', 'R1c Fixture']);
  g(['config', 'user.email', 'fixture@example.invalid']);
  fs.mkdirSync(path.join(root, 'src'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src', 'domain.c'), [
    'int a = x+foo;        /* WORD-NEIGHBOUR — left of the symbol is a word character */',
    'int b = p->next;      /* DASH-LEADING  — a symbol that looks like an option */',
    `int c = ${DOMAIN_ASTRAL};          /* ${MARK_ASTRAL_STANDALONE} — non-word neighbours both sides */`,
    `int d = x${DOMAIN_ASTRAL};         /* ${MARK_ASTRAL_EMBEDDED} — a word constituent sits to its left */`,
    `int e = ${DOMAIN_BMP};          /* ${MARK_BMP_STANDALONE} — non-word neighbours both sides */`,
    `int f = ${DOMAIN_ASTRAL}${DOMAIN_BMP};         /* ${MARK_BMP_ASTRAL_LEFT} — a LETTER to its left, stored as a surrogate pair */`,
    `int g = ${DOMAIN_BMP}${DOMAIN_ASTRAL};         /* ${MARK_BMP_ASTRAL_RIGHT} — a LETTER to its right, stored as a surrogate pair */`,
    '',
  ].join('\n'));
  g(['add', '-A']);
  g(['commit', '-q', '-m', 'r1c: symbol-domain vectors'], ENV);
  return { root, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}
