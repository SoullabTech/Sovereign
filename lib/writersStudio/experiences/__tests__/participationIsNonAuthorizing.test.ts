import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

/**
 * §XII — participation confers participation and nothing else.
 *
 * The witness proves this against a database; this proves it in CI, on every commit, with no
 * database at all — because the way this law will actually be broken is by someone writing a
 * convenient join months from now, not by a schema change.
 *
 * A comment promising the boundary cannot enforce it, so comments are stripped before scanning.
 * (The C21 precedent: a file that documents its own compliance must not read as the violation.)
 */

const REPO = join(__dirname, '../../../..');
const ROOTS = ['app', 'lib'];

/** Tables holding a member's private creative material. */
const PRIVATE_TABLES = [
  'living_works',
  'member_manuscripts',
  'manuscript_sections',
  'manuscript_working_drafts',
  'manuscript_draft_sections',
  'member_reflections',
  'memory_atoms',
];

const strip = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1 ');

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '__tests__' || entry === '.next') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (/\.tsx?$/.test(full) && !/\.test\.tsx?$/.test(full)) yield full;
  }
}

describe('Experience participation is non-authorizing', () => {
  it('no shipped file reaches a member’s private material from participation', () => {
    const offenders: string[] = [];
    for (const root of ROOTS) {
      for (const file of walk(join(REPO, root))) {
        const code = strip(readFileSync(file, 'utf8'));
        if (!code.includes('writer_experience_participations')) continue;
        for (const table of PRIVATE_TABLES) {
          if (new RegExp(`\\b${table}\\b`).test(code)) {
            offenders.push(`${relative(REPO, file)} mentions both participation and ${table}`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('no sharing, roster or access surface has been built into the Experience namespace', () => {
    const migration = readFileSync(
      join(REPO, 'database/migrations/20260908000002_writer_experiences.sql'), 'utf8');
    const created = [...migration.matchAll(/CREATE TABLE IF NOT EXISTS ([a-z_]+)/g)].map((m) => m[1]);
    const suspicious = created.filter((t) => /(shar|grant|access|visib|roster)/.test(t));
    expect(suspicious).toEqual([]);
  });

  it('participation carries no reference to a movement — there is no place to store a position', () => {
    const migration = readFileSync(
      join(REPO, 'database/migrations/20260908000002_writer_experiences.sql'), 'utf8');
    const block = migration.slice(
      migration.indexOf('CREATE TABLE IF NOT EXISTS writer_experience_participations'));
    const table = block.slice(0, block.indexOf(');'));
    expect(table).not.toMatch(/movement/i);
    expect(table).not.toMatch(/(current|complet|progress|percent|score|level|rank|streak)/i);
  });
});
