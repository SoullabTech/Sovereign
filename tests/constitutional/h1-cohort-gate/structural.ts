/**
 * H1-COHORT-GATE-01 · F8 producer containment (structural).
 *
 * The census (§1) found exactly one live producer of a Studio `work=`
 * (studioArrivalFromHouse, called by the House), one latent producer with no
 * caller (situatedManuscriptAddress), and one raw reader
 * (readStudioWorkParam). F8 holds when:
 *
 *   (a) situatedManuscriptAddress is referenced only from its own module or the
 *       governed choke-point module;
 *   (b) readStudioWorkParam is referenced only from its own module or the
 *       governed choke-point module, so no reader bypasses the choke point;
 *   (c) studioArrivalFromHouse is referenced only from its own module and the
 *       House, and the House consults the one authority.
 *
 * The checker runs over a map of path → source, so it can be pointed at the
 * real repository (the canon witness) or at synthetic source maps (reference
 * and defeat candidate). Comments are stripped before scanning: a file that
 * documents a rule must never fail for naming it.
 */
import fs from 'node:fs';
import path from 'node:path';

export type SourceMap = Record<string, string>;

/** Proposed governed module (§3.4). Named here so the law can be stated before it exists. */
export const CHOKE_POINT_MODULE = 'app/writers-studio/h1Arrival.ts';
export const DEFINING_MODULE = 'app/writers-studio/situatedWork.ts';
export const HOUSE_MODULE = 'app/house/page.tsx';
export const AUTHORITY_CALL = 'canUseH1Arrival(';

export function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function referencesTo(files: SourceMap, name: string): string[] {
  const re = new RegExp(`\\b${name}\\b`);
  return Object.entries(files).filter(([, src]) => re.test(stripComments(src))).map(([p]) => p).sort();
}

export function producerContainment(files: SourceMap): string | null {
  const allowedInternal = new Set([DEFINING_MODULE, CHOKE_POINT_MODULE]);
  for (const name of ['situatedManuscriptAddress', 'readStudioWorkParam']) {
    const outside = referencesTo(files, name).filter((p) => !allowedInternal.has(p));
    if (outside.length) return `${name} referenced outside the governed path: ${outside.join(', ')}`;
  }
  const arrival = referencesTo(files, 'studioArrivalFromHouse').filter((p) => p !== DEFINING_MODULE);
  const stray = arrival.filter((p) => p !== HOUSE_MODULE);
  if (stray.length) return `studioArrivalFromHouse referenced outside the House: ${stray.join(', ')}`;
  const house = files[HOUSE_MODULE];
  if (arrival.includes(HOUSE_MODULE) && house !== undefined && !stripComments(house).includes(AUTHORITY_CALL)) {
    return 'the House emits studioArrivalFromHouse without consulting the authority';
  }
  return null;
}

/** Every .ts/.tsx under app/, components/ and lib/, excluding tests. */
export function repositorySources(root = process.cwd()): SourceMap {
  const out: SourceMap = {};
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const rel = path.posix.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name === '__tests__' || e.name.startsWith('.')) continue;
        walk(rel);
      } else if (/\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) {
        out[rel] = fs.readFileSync(path.join(root, rel), 'utf8');
      }
    }
  };
  for (const top of ['app', 'components', 'lib']) if (fs.existsSync(path.join(root, top))) walk(top);
  return out;
}

const DEFINITIONS = `export function situatedManuscriptAddress() {}
export function readStudioWorkParam() {}
export function studioArrivalFromHouse() {}`;

/** The conforming shape: every governed name reached only through its governed caller. */
export const REFERENCE_SOURCES: SourceMap = {
  [DEFINING_MODULE]: DEFINITIONS,
  [CHOKE_POINT_MODULE]: `import { readStudioWorkParam } from './situatedWork';
export const admittedStudioWorkParam = (p, admitted) => (admitted ? readStudioWorkParam(p) : null);`,
  'app/dev/writers-studio-pc3-live/P4R1ReviewController.tsx': `import { admittedStudioWorkParam } from '@/app/writers-studio/h1Arrival';
// readStudioWorkParam is never called here; this comment must not fail the law.
const w = admittedStudioWorkParam(params, admitted);`,
  [HOUSE_MODULE]: `const href = canUseH1Arrival(member.id) ? studioArrivalFromHouse(work.id) : '/writers-studio';`,
};

/** DC-H8: the latent producer gains a caller outside the governed path. */
export const DC_H8_SOURCES: SourceMap = {
  ...REFERENCE_SOURCES,
  'components/maia/ResumeWritingCard.tsx': `import { situatedManuscriptAddress } from '@/app/writers-studio/situatedWork';
export const href = situatedManuscriptAddress(m.id, w.id);`,
};
