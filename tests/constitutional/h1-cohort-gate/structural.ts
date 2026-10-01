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
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export type SourceMap = Record<string, string>;

/** Proposed governed module (§3.4). Named here so the law can be stated before it exists. */
export const CHOKE_POINT_MODULE = 'app/writers-studio/h1Arrival.ts';
export const DEFINING_MODULE = 'app/writers-studio/situatedWork.ts';
export const HOUSE_MODULE = 'app/house/page.tsx';
/**
 * F8 lineage (H1-COHORT-GATE-01 · R2, founder ruling 2026-10-01): frozen at
 * `61f77602` as 'canUseH1Arrival(' — the name the R1 design proposed. Canon
 * admitted the same authority under #1551 as canUseHouseStudioH1, so R2
 * SUBSTITUTES THE NAME ONLY. The invariant is unchanged: the House emits the
 * H1 arrival only after consulting the one cohort authority.
 */
export const AUTHORITY_CALL = 'canUseHouseStudioH1(';

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

/**
 * The same source map, read from a commit instead of the working tree. The
 * canon witness must be canon AT THE CENSUS BASELINE: once the implementation
 * lands, the working tree is no longer canon-without-a-gate.
 */
export const CENSUS_BASELINE = '71859c3a';

export function repositorySourcesAt(rev: string, root = process.cwd()): SourceMap {
  const git = (...args: string[]) =>
    execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  const out: SourceMap = {};
  const paths = git('ls-tree', '-r', '--name-only', rev, '--', 'app', 'components', 'lib').split('\n');
  for (const p of paths) {
    if (!/\.tsx?$/.test(p) || /\.test\.tsx?$/.test(p)) continue;
    if (p.split('/').some((seg) => seg === 'node_modules' || seg === '__tests__' || seg.startsWith('.'))) continue;
    out[p] = git('show', `${rev}:${p}`);
  }
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
  [HOUSE_MODULE]: `const href = canUseHouseStudioH1(member.id) ? studioArrivalFromHouse(work.id) : '/writers-studio';`,
};

/** DC-H8: the latent producer gains a caller outside the governed path. */
export const DC_H8_SOURCES: SourceMap = {
  ...REFERENCE_SOURCES,
  'components/maia/ResumeWritingCard.tsx': `import { situatedManuscriptAddress } from '@/app/writers-studio/situatedWork';
export const href = situatedManuscriptAddress(m.id, w.id);`,
};

/* ══════════════════════════════════════════════════════════════════════════
   F11 · the admission hook is a fact supplier, never a second semantic authority
   (H1-COHORT-GATE-01 · R2, founder ruling 2026-10-01; numbered F11 because F9
   is already the frozen "authority ≠ URL mutation" law).

   The hook may fetch admission and expose { admitted, resolved }. Only the
   governed seam may read `work=` or produce the resolved arrival. A hook that
   reads the claim and decides whether to expose it is a second place capable
   of interpreting the crossing — even when h1Arrival.ts also exists.
   ══════════════════════════════════════════════════════════════════════════ */

export const HOOK_MODULE = 'app/writers-studio/useHouseStudioH1WorkClaim.ts';

/** Studio/House modules that may consume the arrival but never interpret `work=`. */
export const ARRIVAL_CONSUMERS = [
  HOOK_MODULE,
  HOUSE_MODULE,
  'app/dev/writers-studio-pc3-live/P4R1HomeController.tsx',
  'app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx',
  'app/dev/writers-studio-pc3-live/P4R1ReviewController.tsx',
  'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx',
];

const CLAIM_READS: Array<[RegExp, string]> = [
  [/\breadStudioWorkParam\b/, 'readStudioWorkParam'],
  [/\bSTUDIO_WORK_PARAM\b/, 'STUDIO_WORK_PARAM'],
  [/\.get\(\s*['"`]work['"`]\s*\)/, ".get('work')"],
  [/\.has\(\s*['"`]work['"`]\s*\)/, ".has('work')"],
];

export function hookFactOnly(files: SourceMap): string | null {
  const hook = files[HOOK_MODULE];
  if (hook === undefined) return `${HOOK_MODULE} is missing`;
  const code = stripComments(hook);
  for (const [re, label] of CLAIM_READS) if (re.test(code)) return `the admission hook reads the claim (${label})`;
  for (const name of ['resolveStudioArrival', 'resolveSituatedWorkContext', 'admittedStudioWorkParam', 'resolveH1Arrival']) {
    if (new RegExp(`\\b${name}\\b`).test(code)) return `the admission hook produces the arrival (${name})`;
  }
  if (/\bworkId\b/.test(code)) return 'the admission hook exposes a Work id';
  for (const path of ARRIVAL_CONSUMERS) {
    const src = files[path];
    if (src === undefined) continue;
    const c = stripComments(src);
    for (const [re, label] of CLAIM_READS) if (re.test(c)) return `${path} interprets work= itself (${label})`;
  }
  return null;
}

/* ── One authority (R2 acceptance 1 + 2) ─────────────────────────────────── */

export const AUTHORITY_MODULE = 'lib/access/houseStudioH1Access.ts';
export const ENDPOINT_MODULE = 'app/api/house-studio/admission/route.ts';

export function oneAuthority(files: SourceMap): string | null {
  for (const retired of ['canUseH1Arrival', 'H1_ARRIVAL_ENABLED', 'H1_ARRIVAL_MEMBER_IDS', 'h1-arrival/admission', 'useH1Arrival']) {
    const hits = Object.entries(files).filter(([, src]) => stripComments(src).includes(retired)).map(([p]) => p);
    if (hits.length) return `retired H1 authority surface "${retired}" still present: ${hits.join(', ')}`;
  }
  const envReaders = Object.entries(files)
    .filter(([, src]) => /HOUSE_STUDIO_H1_(ENABLED|MEMBER_IDS)/.test(stripComments(src)))
    .map(([p]) => p);
  if (envReaders.join() !== AUTHORITY_MODULE) return `H1 cohort env read outside the one authority: ${envReaders.join(', ') || '(nowhere)'}`;
  const endpoints = Object.keys(files).filter((p) => /admission\/route\.ts$/.test(p) && /h1|house-studio/i.test(p));
  if (endpoints.join() !== ENDPOINT_MODULE) return `H1 admission endpoints: ${endpoints.join(', ')}`;
  const deciders = Object.entries(files)
    .filter(([p, src]) => p !== AUTHORITY_MODULE && /\b(decideHouseStudioH1|parseHouseStudioH1Cohort)\s*\(/.test(stripComments(src)))
    .map(([p]) => p);
  if (deciders.length) return `H1 eligibility evaluated outside the authority module: ${deciders.join(', ')}`;
  return null;
}

/** F11 conforming shape. */
export const F11_REFERENCE_SOURCES: SourceMap = {
  ...REFERENCE_SOURCES,
  [HOOK_MODULE]: `import { settleH1Admission } from './h1Arrival';
export function useHouseStudioH1WorkClaim(needed) { /* fetch, settle */ return admission; }`,
};

/** DC-H11: the seam exists, and the hook ALSO reads work= and decides whether to expose it. */
export const DC_H11_SOURCES: SourceMap = {
  ...F11_REFERENCE_SOURCES,
  [HOOK_MODULE]: `import { readStudioWorkParam } from './situatedWork';
export function useHouseStudioH1WorkClaim(search) {
  const claim = readStudioWorkParam(search);
  return { workId: admitted ? claim : null };
}`,
};

/** DC-H11b: the hook stays clean but a controller re-reads the raw claim beside the seam. */
export const DC_H11B_SOURCES: SourceMap = {
  ...F11_REFERENCE_SOURCES,
  'app/dev/writers-studio-pc3-live/P4R1ReviewController.tsx': `const { workId } = resolveH1Arrival(params, h1);
const raw = params.get('work');`,
};
