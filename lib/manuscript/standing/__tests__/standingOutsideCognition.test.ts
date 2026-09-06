/**
 * WS2-07 · BUILD-07F — D5 and D6 as properties of the program.
 *
 * ```text
 * standing        ──X──►  MAIA cognition        D5
 * MAIA / system   ──X──►  the standing writer   D6
 * ```
 *
 * Two directions of one boundary, and both are MODULE-GRAPH assertions —
 * following 07E's gate-7 method: strip comments, walk the actual imports, and
 * refuse the capability rather than trusting prose. A file that says "standing
 * never reaches MAIA" is not that property; a graph that cannot reach it is.
 *
 * THE GATE IS ITSELF FALSIFIED HERE. The walk takes its file reader as an
 * argument, so the same gate is run twice: once over the real tree, where it
 * must find nothing, and once over an OVERLAY in which a cognition module has
 * been given the forbidden import, where it must find exactly that. A gate that
 * has never failed against the code it guards is a tautology, and no deficient
 * module needs to exist on disk to prove this one can fail.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, resolve } from 'path';

const ROOT = join(__dirname, '..', '..', '..', '..');
const STANDING_DIR = join('lib', 'manuscript', 'standing');

/** The cognition roots named in design §9. Standing must be unreachable from every one. */
const COGNITION_ROOTS = [
  'lib/manuscript/developmentalReader/read.ts',
  'lib/manuscript/developmentalReader/render.ts',
  'lib/manuscript/developmentalReading/commission.ts',
  'lib/manuscript/developmentalReading/classify.ts',
  'lib/manuscript/ask/developmentalContext.ts',
  'lib/manuscript/ask/developmentalAskReader.ts',
  'lib/manuscript/ask/askReader.ts',
  'app/api/sovereign/manuscripts/[id]/ask/route.ts',
  /* When 07G synthesis exists, its root is added HERE — so that permitting
     standing into a writer-initiated conversation requires a deliberate
     architectural change rather than one convenient import. */
];

/**
 * The ONLY module permitted to reach the standing STORE (D6). The store is the
 * capability; `contract.ts` is types, and a type-only import of it carries no
 * ability to read or write a standing — so the allowlist governs the store, and
 * a separate check below holds contract imports to `import type`.
 */
const PERMITTED_STORE_IMPORTERS = [
  'app/api/sovereign/manuscripts/[id]/readings/[readingId]/standings/route.ts',
];

type Reader = (relPath: string) => string | null;

const stripComments = (src: string): string =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const realReader: Reader = (rel) => {
  const p = join(ROOT, rel);
  return existsSync(p) && statSync(p).isFile() ? stripComments(readFileSync(p, 'utf8')) : null;
};

/** An overlay reader: the real tree with named files replaced. Used only to
 *  falsify the gate — nothing is written to disk. */
const overlayReader = (overlay: Record<string, string>): Reader =>
  (rel) => (rel in overlay ? stripComments(overlay[rel]) : realReader(rel));

/**
 * EVERY MODULE-LOADING FORM THIS REPOSITORY PERMITS, not merely the common one.
 *
 * R3: a walker that recognised only `from '…'` proved that ONE syntax could not
 * reach standing — a convention, not the structural claim D5 and D6 were
 * accepted as. A dynamic `import()`, a `require()` (this repo uses one in
 * `lib/db/postgres`), a side-effect `import '…'` or a re-export would each have
 * walked straight past it. Each form below is falsified in its own test.
 */
const IMPORT_FORMS: readonly { readonly name: string; readonly pattern: RegExp }[] = [
  { name: "from '…'", pattern: /from\s+['"]([^'"]+)['"]/g },
  { name: "import('…')", pattern: /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g },
  { name: "require('…')", pattern: /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g },
  { name: "import '…' (side effect)", pattern: /\bimport\s+['"]([^'"]+)['"]/g },
];

const importsOf = (code: string): string[] =>
  IMPORT_FORMS.flatMap(({ pattern }) =>
    [...code.matchAll(new RegExp(pattern.source, 'g'))].map((m) => m[1]));

/** Resolve an import specifier to a repo-relative source path, or null when it
 *  leaves the repo (a package, or a file this walk does not own). */
function resolveSpec(fromRel: string, spec: string, read: Reader): string | null {
  const base = spec.startsWith('@/')
    ? spec.slice(2)
    : spec.startsWith('.')
      ? resolve(dirname(fromRel), spec).replace(`${resolve('.')}/`, '')
      : null;
  if (base === null) return null;
  for (const candidate of [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`, base]) {
    if (read(candidate) !== null) return candidate;
  }
  return null;
}

const reachesStanding = (rel: string): boolean => rel.startsWith(STANDING_DIR);
const isStore = (rel: string): boolean => rel === join(STANDING_DIR, 'store.ts');

/** Every path from `root` that arrives at the standing modules, transitively. */
function pathsToStanding(root: string, read: Reader): string[][] {
  const found: string[][] = [];
  const seen = new Set<string>();
  const walk = (rel: string, trail: string[]): void => {
    if (seen.has(rel)) return;
    seen.add(rel);
    const code = read(rel);
    if (code === null) return;
    for (const spec of importsOf(code)) {
      const target = resolveSpec(rel, spec, read);
      if (target === null) continue;
      if (reachesStanding(target)) { found.push([...trail, rel, target]); continue; }
      walk(target, [...trail, rel]);
    }
  };
  walk(root, []);
  return found;
}

/** Every file under lib/ and app/ that imports a standing module directly.
 *  `match` selects which standing module counts. */
function directImporters(
  read: Reader, match: (target: string) => boolean, extra: string[] = [],
): string[] {
  const files: string[] = [...extra];
  const walkDir = (rel: string): void => {
    const abs = join(ROOT, rel);
    if (!existsSync(abs)) return;
    for (const entry of readdirSync(abs)) {
      const child = `${rel}/${entry}`;
      if (statSync(join(ROOT, child)).isDirectory()) walkDir(child);
      else if (/\.tsx?$/.test(entry)) files.push(child);
    }
  };
  walkDir('lib');
  walkDir('app');
  return files.filter((rel) => {
    const code = read(rel);
    if (code === null) return false;
    return importsOf(code).some((spec) => {
      const target = resolveSpec(rel, spec, read);
      return target !== null && match(target) && !reachesStanding(rel);
    });
  });
}

describe('D5 · standing never reaches MAIA cognition', () => {
  it.each(COGNITION_ROOTS)('%s cannot reach the standing modules', (root) => {
    expect(pathsToStanding(root, realReader)).toEqual([]);
  });

  /* THE GATE, FALSIFIED. One cognition module is given the import it must not
     have; the same walk must report it. Without this, a gate that silently
     resolved nothing would pass forever. */
  it('FALSIFIER · reports the violation when a cognition module imports standing', () => {
    const target = 'lib/manuscript/ask/developmentalContext.ts';
    const doctored = `import { currentStandings } from '@/lib/manuscript/standing/store';\n${
      readFileSync(join(ROOT, target), 'utf8')}`;
    const paths = pathsToStanding(target, overlayReader({ [target]: doctored }));
    expect(paths.length).toBeGreaterThan(0);
    expect(paths[0][paths[0].length - 1]).toContain('standing/store');
  });

  /* THE FORMS, ONE FALSIFIER EACH. The claim is not "a static import cannot
     reach standing"; it is that standing is unreachable. A form the walker
     cannot see is a form the gate does not cover, so each is proved visible. */
  it.each([
    ["dynamic import", "const { currentStandings } = await import('@/lib/manuscript/standing/store');"],
    ["require", "const { recordStanding } = require('@/lib/manuscript/standing/store');"],
    ["side-effect import", "import '@/lib/manuscript/standing/store';"],
    ["re-export", "export * from '@/lib/manuscript/standing/store';"],
  ])('FALSIFIER · reports a %s of the standing store', (_form, line) => {
    const target = 'lib/manuscript/ask/developmentalContext.ts';
    const doctored = `${line}\n${readFileSync(join(ROOT, target), 'utf8')}`;
    expect(pathsToStanding(target, overlayReader({ [target]: doctored })).length)
      .toBeGreaterThan(0);
  });

  it('FALSIFIER · reports a violation reached transitively, not only directly', () => {
    const root = 'app/api/sovereign/manuscripts/[id]/ask/route.ts';
    const via = 'lib/manuscript/ask/developmentalAskReader.ts';
    const doctored = `import { currentStanding } from '@/lib/manuscript/standing/store';\n${
      readFileSync(join(ROOT, via), 'utf8')}`;
    expect(pathsToStanding(root, overlayReader({ [via]: doctored })).length).toBeGreaterThan(0);
  });
});

describe('D6 · only the authenticated member route can reach the standing writer', () => {
  it('no module outside the permitted set imports the standing store', () => {
    const importers = directImporters(realReader, isStore)
      .filter((f) => !f.includes('__tests__'));
    expect(importers.sort()).toEqual([...PERMITTED_STORE_IMPORTERS].sort());
  });

  it('the standing store is never imported by a MAIA or sovereign runtime module', () => {
    for (const f of directImporters(realReader, isStore)) {
      expect(f.startsWith('lib/maia/')).toBe(false);
      expect(f.startsWith('lib/sovereign/')).toBe(false);
    }
  });

  /* The surface needs the `Standing` type to render three labels. That is not a
     capability, and it must not become one: outside the standing modules and the
     one permitted route, every import of the contract is type-only, so no value
     — no parser, no constant — can be reached through it. */
  it('the contract is imported only as types outside the standing modules', () => {
    const contract = join(STANDING_DIR, 'contract.ts');
    const importers = directImporters(realReader, (t) => t === contract)
      .filter((f) => !PERMITTED_STORE_IMPORTERS.includes(f) && !f.includes('__tests__'));
    for (const f of importers) {
      const code = realReader(f) ?? '';
      const specs = [...code.matchAll(/import(\s+type)?[\s\S]*?from\s+['"]([^'"]+)['"]/g)];
      for (const m of specs) {
        if (!m[2].includes('standing/contract')) continue;
        expect(`${f} :: ${m[0].split('\n')[0]}`).toMatch(/import\s+type/);
      }
    }
  });

  it.each([
    ["dynamic import", "export const revert = async () => (await import('@/lib/manuscript/standing/store')).recordStanding;"],
    ["require", "export const revert = () => require('@/lib/manuscript/standing/store').recordStanding;"],
  ])('FALSIFIER · reports a system-side %s of the writer', (_form, body) => {
    const intruder = 'lib/maia/standingHousekeeping.ts';
    expect(directImporters(overlayReader({ [intruder]: body }), isStore, [intruder]))
      .toContain(intruder);
  });

  /* THE GATE, FALSIFIED — the other direction. A background module that could
     write a standing on the member's behalf must be seen. */
  it('FALSIFIER · reports a system-side module that reaches the writer', () => {
    const intruder = 'lib/maia/standingHousekeeping.ts';
    const read = overlayReader({
      [intruder]: `import { recordStanding } from '@/lib/manuscript/standing/store';
        export const revert = () => recordStanding('m', 'r', {
          observationKey: 'o1', standing: 'unresolved', expectedCurrentEventId: null });`,
    });
    const importers = directImporters(read, isStore, [intruder]);
    expect(importers).toContain(intruder);
  });
});

/**
 * THE TABLE ITSELF HAS ONE DOOR.
 *
 * The import allowlist above proves who may reach `standing/store.ts`. It does
 * NOT prove that standing is unreachable, because nothing stopped any module
 * from importing the generic `query` and naming the table directly:
 *
 * ```text
 * D5  a MAIA helper      → generic query → SELECT … FROM the standing table
 * D6  a background job   → generic query → INSERT INTO the standing table
 * ```
 *
 * Neither needs the store. So the companion invariant is stated over the TABLE
 * NAME in executable source: in `app/` and `lib/`, only the standing store may
 * name it. Tests are excluded — they are not the running program, and the gates
 * themselves must be able to say the name.
 *
 * Comments are stripped first: this lane's modules discuss the table at length,
 * and a check that counted prose would fail for the wrong reason.
 */
describe('D5/D6 · the standing table is nameable in exactly one runtime module', () => {
  const TABLE = 'developmental_observation_standing_events';

  /** Every executable file under lib/ and app/, tests excluded. */
  function runtimeFiles(read: Reader, extra: string[] = []): string[] {
    const files: string[] = [...extra];
    const walkDir = (rel: string): void => {
      const abs = join(ROOT, rel);
      if (!existsSync(abs)) return;
      for (const entry of readdirSync(abs)) {
        const child = `${rel}/${entry}`;
        if (statSync(join(ROOT, child)).isDirectory()) { if (entry !== '__tests__') walkDir(child); }
        else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) files.push(child);
      }
    };
    walkDir('lib');
    walkDir('app');
    return files.filter((rel) => (read(rel) ?? '').includes(TABLE));
  }

  it('no runtime module outside the store names the standing table', () => {
    expect(runtimeFiles(realReader)).toEqual([join(STANDING_DIR, 'store.ts')]);
  });

  /* THE GATE, FALSIFIED — both directions, and neither imports the store. */
  it('FALSIFIER · reports a raw SELECT of the standing table from a cognition module', () => {
    const intruder = 'lib/manuscript/ask/standingPeek.ts';
    const read = overlayReader({
      [intruder]: `import { query } from '@/lib/db/postgres';
        export const peek = (m: string) =>
          query(\`SELECT standing FROM ${TABLE} WHERE member_id = $1\`, [m]);`,
    });
    expect(runtimeFiles(read, [intruder])).toContain(intruder);
    /* And the import gate alone would NOT have seen it — which is the point. */
    expect(directImporters(read, isStore, [intruder])).not.toContain(intruder);
  });

  it('FALSIFIER · reports a raw INSERT into the standing table from a background module', () => {
    const intruder = 'lib/maia/standingSweeper.ts';
    const read = overlayReader({
      [intruder]: `import { query } from '@/lib/db/postgres';
        export const sweep = () =>
          query(\`INSERT INTO ${TABLE} (member_id, reading_id, observation_key, event_index, standing)
                  VALUES ($1, $2, $3, 0, 'unresolved')\`, []);`,
    });
    expect(runtimeFiles(read, [intruder])).toContain(intruder);
    expect(directImporters(read, isStore, [intruder])).not.toContain(intruder);
  });
});
