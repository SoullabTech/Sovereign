/**
 * LAB-IA-01 · Lab Tools information-architecture census — DIAGNOSIS ONLY.
 *
 * Emits one row per /labtools surface with the evidence needed to classify it,
 * and CLASSIFIES NOTHING. Every classification cell is left blank on purpose:
 * the allowed values (MEMBER | LAB | STUDIO | STEWARD | RETIRE | UNCLEAR) are a
 * founder determination, and an instrument that pre-fills them would be
 * smuggling product judgement into architecture.
 *
 * THE GOVERNING QUESTIONS (founder, 2026-09-04) are deliberately NOT "is this
 * mature?" — maturity is a judgement that produces arguments. They are:
 *
 *     Whose data does this surface hold or act on?
 *     Who is the surface actually for?
 *
 * Both are answerable from evidence: data ownership from whether the API the
 * page calls is member-scoped, audience from the declared access rule and the
 * runtime gate above it. A member-owned experiment can still belong in the
 * House; a mature internal diagnostic can still belong in Steward. The two axes
 * are independent, which is why they are separate columns.
 *
 * This also absorbs the older "~14 /labtools free declarations" finding — the
 * access-matrix rule and the runtime gate appear as adjacent columns here, so
 * a declaration that disagrees with its enforcement is visible in the same row
 * rather than tracked as a second census.
 *
 * ⛔ Records only. No moves, no UI, no persistence, no recommendations. In
 * particular it records whether a surface creates per-member state today; it
 * does not propose creating any.
 *
 * Run: npx tsx scripts/lab-ia-01-census.ts --out docs/programme/LAB-IA-01_CENSUS.md
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
import path from 'path';

const REPO = path.resolve(__dirname, '..');
const read = (p: string) => (existsSync(path.join(REPO, p)) ? readFileSync(path.join(REPO, p), 'utf8') : '');

/** Every app/labtools/<name> route that has a page. */
function labtoolsRoutes(): string[] {
  const dir = path.join(REPO, 'app/labtools');
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

/** Source of a route's page, following the common file names. */
function pageSource(name: string): string {
  for (const f of ['page.tsx', 'page.ts']) {
    const s = read(`app/labtools/${name}/${f}`);
    if (s) return s;
  }
  // nested-only surfaces (e.g. admin/*) — concatenate one level down
  const dir = path.join(REPO, 'app/labtools', name);
  if (!existsSync(dir)) return '';
  let out = '';
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) out += read(`app/labtools/${name}/${e.name}/page.tsx`);
  }
  return out;
}

/** The registry entry whose path is this route, if any. */
const registry = read('config/toolRegistry.ts');
function registryEntry(route: string): Record<string, string> {
  const i = registry.indexOf(`path: '${route}'`);
  if (i === -1) return {};
  const start = registry.lastIndexOf('{', i);
  const block = registry.slice(start, registry.indexOf('},', i) + 1);
  const field = (k: string) => (block.match(new RegExp(`${k}:\\s*'([^']*)'`)) || [])[1] || '';
  return {
    id: field('id'),
    label: field('label'),
    category: field('category'),
    domain: field('domain'),
    minTier: field('minTier'),
    short: field('shortDescription'),
  };
}

/** The access-matrix rule that would match this route. */
const matrix = read('config/accessMatrix.ts');
function matrixRule(route: string): string {
  const exact = matrix.match(new RegExp(`\\{[^}]*exact:\\s*'${route.replace(/\//g, '\\/')}'[^}]*\\}`));
  if (exact) {
    const tier = (exact[0].match(/minTier:\s*'([a-z]+)'/) || [])[1] || '—';
    const roles = (exact[0].match(/rolesAnyOf:\s*\[([^\]]*)\]/) || [])[1];
    return roles ? `${tier} + roles[${roles.replace(/['\s]/g, '')}]` : tier;
  }
  const pre = matrix.match(/\{[^}]*prefix:\s*'\/labtools'[^}]*\}/);
  if (pre) {
    const tier = (pre[0].match(/minTier:\s*'([a-z]+)'/) || [])[1] || '—';
    return `${tier} (via /labtools catch-all)`;
  }
  return 'unmapped';
}

/** APIs the page calls, and whether each is member-scoped. */
function apis(src: string): { list: string[]; memberScoped: 'yes' | 'no' | 'n/a' | 'mixed' } {
  const found = [...src.matchAll(/['"`](\/api\/[a-zA-Z0-9\/_\-\[\]$.{}]+)['"`]/g)]
    .map((m) => m[1].replace(/\$\{[^}]*\}/g, ':id').replace(/\/$/, ''));
  const list = [...new Set(found)].slice(0, 4);
  if (!list.length) return { list, memberScoped: 'n/a' };
  const verdicts = list.map((a) => {
    const base = a.split('/').slice(0, 4).join('/').replace(/:id.*/, '');
    for (const cand of [`app${base}/route.ts`, `app${a}/route.ts`]) {
      const s = read(cand);
      if (s) return /requireMemberId|getCurrentSession/.test(s) ? 'yes' : 'no';
    }
    return '?';
  });
  const uniq = [...new Set(verdicts)];
  return { list, memberScoped: uniq.length === 1 ? (uniq[0] as any) : 'mixed' };
}

/** Does the page write anything? */
const writes = (src: string) => (/method:\s*['"](POST|PATCH|PUT|DELETE)['"]/.test(src) ? 'yes' : 'no');

const house = read('lib/navigation/houseDestinations.ts');
const keep = (read('scripts/capacitor-patch-routes.sh').match(/MOBILE_LABTOOLS_KEEP=\(([^)]*)\)/) || [])[1] || '';
const layoutGate = /requireLabAccess/.test(read('app/labtools/layout.tsx'))
  ? 'requireLabAccess()'
  : /requireFounder/.test(read('app/labtools/layout.tsx'))
    ? 'requireFounder()'
    : 'none';

const rows = labtoolsRoutes().map((name) => {
  const route = `/labtools/${name}`;
  const src = pageSource(name);
  const reg = registryEntry(route);
  const api = apis(src);
  const own = api.memberScoped === 'yes' ? 'member' : api.memberScoped === 'n/a' ? 'none/static' : 'unclear';
  const ownGate = /requireFounder|requireAdmin/.test(src) ? ' + own gate' : '';
  return [
    route,
    reg.id || '—',
    reg.category ? `${reg.category}${reg.domain && reg.domain !== reg.category ? `/${reg.domain}` : ''}` : '—',
    matrixRule(route),
    layoutGate + ownGate,
    api.list.length ? api.list.join('<br>') : '—',
    own,
    '',                                   // intended user — evidence-thin, left for the ruling
    writes(src),
    api.memberScoped,
    house.includes(`'${route}'`) ? 'yes' : 'no',
    keep.includes(`"${name}"`) ? 'in iOS bundle' : '—',
    '',                                   // CLASSIFICATION — deliberately blank
  ];
});

const HEAD = ['route', 'tool id', 'category/domain', 'declared access', 'runtime gate',
  'primary API', 'data ownership', 'intended user', 'creates state', 'member-scoped API',
  'in House', 'native', 'CLASSIFICATION'];

const out = [
  `# LAB-IA-01 · Lab Tools census — diagnosis only`, '',
  `Generated by \`scripts/lab-ia-01-census.ts\`. **Every CLASSIFICATION cell is blank by design.**`,
  `Allowed values, for the founder ruling that follows: \`MEMBER\` · \`LAB\` · \`STUDIO\` · \`STEWARD\` · \`RETIRE\` · \`UNCLEAR\`.`, '',
  `Governing questions: **whose data does this hold or act on**, and **who is it actually for** — not "is it mature".`, '',
  `\`${rows.length}\` surfaces · runtime gate on \`app/labtools/layout.tsx\`: \`${layoutGate}\``, '',
  `| ${HEAD.join(' | ')} |`,
  `|${HEAD.map(() => '---').join('|')}|`,
  ...rows.map((r) => `| ${r.join(' | ')} |`),
  '',
  `## Reading the columns`, '',
  `- **declared access** is \`config/accessMatrix.ts\`; **runtime gate** is what actually refuses. Where they disagree, the row is the evidence — this is the "~14 free declarations" finding, in place rather than tracked separately.`,
  `- **data ownership** is derived from whether the API the page calls resolves a member identity. \`none/static\` means the page calls no API at all.`,
  `- **intended user** is left blank: no column in the codebase states it, and inferring it from access rules would beg the question the census exists to answer.`,
  `- **creates state** records what exists today. It proposes nothing.`, '',
  `## Constraint carried into any later act`, '',
  `> Lab access must remain complete without contribution. Feedback is optional, never required, never socially coerced, and never the price of belonging.`, '',
].join('\n');

const outArg = process.argv.indexOf('--out');
if (outArg !== -1) {
  require('fs').writeFileSync(path.join(REPO, process.argv[outArg + 1]), out);
  console.log(`${rows.length} surfaces → ${process.argv[outArg + 1]}`);
} else {
  console.log(out);
}
