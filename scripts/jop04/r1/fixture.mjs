// JOP-04 R1 · hermetic Git fixture.
//
// ⭐ R1 REQUIREMENT, not a suggestion: D1 · D2.3 · D3 · D5 · D6 are NEVER exercised against the
//    JOP repository. A deterministic temporary repository is built with fixed authors, dates,
//    filenames and contents, so that
//        instrument prose changes · new commits · new matching documentation · history growth
//    cannot change the behavioural fixture being judged. This retires the self-documentation
//    species (five incidents) by construction rather than by discipline.

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

export const LITERAL_GLOB_FILE = 'app/*.ts';   // a real file whose NAME looks like a glob
export const SYMBOL = 'alpha.beta';            // punctuation-bearing literal symbol
export const LOOKALIKE = 'alphaXbeta';         // matches `alpha.beta` only if '.' is regex syntax
export const BRE_PATTERN = 'ZEBRA\\|QUAGGA';   // BRE alternation · ERE/fixed: literal 'ZEBRA|QUAGGA'
export const MANY_TOKEN = 'REPETEND';          // appears on many lines, for the D3 prefix law
export const MANY_COUNT = 12;
export const ORDINARY_COMMIT = 'fixture: ordinary files app/a.ts and app/b.ts';
export const LITERAL_COMMIT = 'fixture: the file literally named app-star-ts, alone';

export function buildFixture() {
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
  // ⭐ D5: the fixture repository deliberately declares a NON-BRE ambient dialect.
  g(['config', 'grep.patternType', 'extended']);

  // --- commit 1 : ORDINARY files only -----------------------------------------------
  // ⭐ The literal wildcard-named file gets its OWN commit (below). Commit-level capabilities
  //    (git.log, git.file_history) report COMMITS, not filenames, so if both lived in one
  //    commit the output could not discriminate literal identity from glob selection — and the
  //    D1 arms for those two capabilities would pass vacuously. Found in the first pre-repair
  //    run: a known defect showing GREEN means the witness cannot judge that repair.
  w('app/a.ts', `export const a = 1;\n// ${LOOKALIKE} is not the symbol\nZEBRA\n`);
  w('app/b.ts', `export const b = 2;\nQUAGGA\n`);
  g(['add', '-A']);
  g(['commit', '-q', '-m', ORDINARY_COMMIT], at('2020-01-01T00:00:00+00:00'));

  // --- commit 1b : the literal wildcard-named file, ALONE ------------------------------
  w(LITERAL_GLOB_FILE, `// a real file literally named app/*.ts\nexport const literalGlobFile = true;\n`);
  g(['add', '-A']);
  g(['commit', '-q', '-m', LITERAL_COMMIT], at('2020-01-01T12:00:00+00:00'));

  // --- commit 2 : the symbol fixture --------------------------------------------------
  w('src/sym.ts', `export const ${SYMBOL.replace('.', '_')} = 0;\nconst holder = { ${SYMBOL} };\n// ${LOOKALIKE}\n`);
  g(['add', '-A']);
  g(['commit', '-q', '-m', 'fixture: punctuation-bearing symbol and a regex lookalike'], at('2020-01-02T00:00:00+00:00'));

  // --- commit 3 : repetition for the D3 prefix law + a migrations dir -------------------
  w('many.txt', Array.from({ length: MANY_COUNT }, (_, i) => `line ${i} ${MANY_TOKEN}`).join('\n') + '\n');
  w('database/migrations/0001_init.sql', '-- fixture migration\n');
  g(['add', '-A']);
  g(['commit', '-q', '-m', 'fixture: repetition and a migrations directory'], at('2020-01-03T00:00:00+00:00'));

  return { root, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

/** A directory that is NOT a git repository — the F-D.5 genuine-failure arm. */
export function buildNonRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jop04-r1-nonrepo-'));
  fs.writeFileSync(path.join(root, 'plain.txt'), `${MANY_TOKEN}\n`);
  return { root, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}
