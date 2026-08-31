/**
 * Route surface audit — outside the House.
 *
 * Produces the five-state classification Kelly ruled:
 *   exists · technically reachable (web/native) · intentionally exposed ·
 *   intentionally withheld · not yet adjudicated
 *
 * DISCIPLINE: existence and reachability are facts recoverable from the tree.
 * INTENTIONAL EXPOSURE IS NOT. It is a product decision, and the only honest
 * static evidence for it is an authored artifact that names the route: a
 * navigation surface that links it, or an access rule that classifies it.
 * Absent that, the answer is "not yet adjudicated" — never inferred from the
 * fact that a route happens to resolve.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';

const ROOT = process.argv[2];
const APP = path.join(ROOT, 'app');

// ── 1. Enumerate real page routes ────────────────────────────────────────────
function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (e === 'page.tsx' || e === 'page.ts') acc.push(p);
  }
  return acc;
}
const pageFiles = walk(APP);

function toRoute(file) {
  let r = file.slice(APP.length).replace(/\/page\.tsx?$/, '');
  r = r.split('/').filter(s => !/^\(.*\)$/.test(s)).join('/'); // strip route groups
  return r === '' ? '/' : r;
}
const all = [...new Set(pageFiles.map(toRoute))].sort();
const dynamic = all.filter(r => r.includes('['));
const staticRoutes = all.filter(r => !r.includes('['));

// ── 2. accessMatrix rules ────────────────────────────────────────────────────
const amSrc = readFileSync(path.join(ROOT, 'config/accessMatrix.ts'), 'utf8');
const amExact = [...amSrc.matchAll(/exact:\s*'([^']+)'/g)].map(m => m[1]);
const amPrefix = [...amSrc.matchAll(/prefix:\s*'([^']+)'/g)].map(m => m[1]);
const amRegex = [...amSrc.matchAll(/regex:\s*\/([^/]+)\//g)].map(m => m[1]);
function amRule(route) {
  if (amExact.includes(route)) return 'exact';
  const p = amPrefix.find(x => route === x || route.startsWith(x.endsWith('/') ? x : x + '/'));
  if (p) return `prefix:${p}`;
  const rx = amRegex.find(x => { try { return new RegExp(x).test(route); } catch { return false; } });
  if (rx) return `regex`;
  return null;
}

// ── 3. Native bundle (Capacitor strip) ───────────────────────────────────────
const cap = readFileSync(path.join(ROOT, 'scripts/capacitor-patch-routes.sh'), 'utf8');
function shArr(name) {
  const m = cap.match(new RegExp(name + '=\\(([^)]*)\\)', 's'));
  return m ? [...m[1].matchAll(/"([^"]+)"/g)].map(x => x[1]) : [];
}
const TOP = shArr('MOBILE_TOP_LEVEL');
const LABTOOLS_KEEP = shArr('MOBILE_LABTOOLS_KEEP');
const ACCOUNT_KEEP = shArr('MOBILE_ACCOUNT_KEEP');
const MAIA_KEEP = shArr('MOBILE_MAIA_KEEP');
function inNativeBundle(route) {
  const segs = route.replace(/^\//, '').split('/').filter(Boolean);
  if (segs.length === 0) return true;
  const [top, sub] = segs;
  if (!TOP.includes(top)) return false;
  if (top === 'labtools' && sub) return LABTOOLS_KEEP.includes(sub);
  if (top === 'account' && sub) return ACCOUNT_KEEP.includes(sub);
  if (top === 'maia' && sub) return MAIA_KEEP.includes(sub);
  return true;
}

// ── 4. Runtime mobile allowlist ──────────────────────────────────────────────
const mob = readFileSync(path.join(ROOT, 'lib/mobile/mobileAllowlist.ts'), 'utf8');
const mobEntries = [...mob.matchAll(/'(\/[^']*)'/g)].map(m => m[1]);
function inMobileAllowlist(route) {
  return mobEntries.some(e => route === e || (e !== '/' && route.startsWith(e + '/')));
}

// ── 5. Authored navigation references (the ONLY evidence for exposure) ───────
// Collect every string literal used as an href / router.push / Link target
// across the authored surface, then ask whether a route appears in that set.
const NAV_DIRS = ['app', 'components', 'lib'];
const navRefs = new Set();
function scanNav(dir) {
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (/node_modules|__tests__|\.next|\.capacitor-mobile-backup/.test(p)) continue;
      scanNav(p);
    } else if (/\.(tsx?|jsx?)$/.test(e)) {
      const src = readFileSync(p, 'utf8');
      for (const m of src.matchAll(/(?:href|route|to|push\(|replace\()\s*[:=]?\s*['"`](\/[A-Za-z0-9\-_/]*)['"`]/g)) {
        navRefs.add(m[1].replace(/\/$/, '') || '/');
      }
    }
  }
}
for (const d of NAV_DIRS) scanNav(path.join(ROOT, d));

// ── 6. Classify ──────────────────────────────────────────────────────────────
const KIND = r =>
  /^\/(test|debug|demo|dev|_|sandbox)|test$|-test$|-demo$/.test(r) ? 'dev/harness'
  : /^\/(studio|team|founder|admin|labtools|book-studio)/.test(r) ? 'internal/steward'
  : /^\/(maia|journal|account|now-what|press|wisdom-keepers|commons|astrology)/.test(r) ? 'member'
  : 'other';

const rows = staticRoutes.map(route => {
  const rule = amRule(route);
  const linked = navRefs.has(route);
  const native = inNativeBundle(route);
  const mobileOk = inMobileAllowlist(route);

  // Intentional exposure — authored evidence only.
  let exposure;
  if (linked && rule) exposure = 'exposed (linked + ruled)';
  else if (linked) exposure = 'exposed (linked, no access rule)';
  else if (rule) exposure = 'ruled, not linked';
  else exposure = 'NOT ADJUDICATED';

  return { route, kind: KIND(route), rule: rule || '—', linked, native, mobileOk, exposure };
});

const notAdjudicated = rows.filter(r => r.exposure === 'NOT ADJUDICATED');
const unmapped = rows.filter(r => r.rule === '—');
const linkedNoRule = rows.filter(r => r.linked && r.rule === '—');

// ── 7. Emit ──────────────────────────────────────────────────────────────────
const out = [];
const p = s => out.push(s);
p(`TOTAL page files: ${pageFiles.length}`);
p(`Distinct routes: ${all.length}  (static ${staticRoutes.length} · dynamic ${dynamic.length})`);
p(`accessMatrix rules parsed: exact ${amExact.length} · prefix ${amPrefix.length} · regex ${amRegex.length}`);
p(`Unmapped (no accessMatrix rule): ${unmapped.length}`);
p(`NOT ADJUDICATED (no rule AND not linked anywhere): ${notAdjudicated.length}`);
p(`Linked but no access rule: ${linkedNoRule.length}`);
p(`In native bundle: ${rows.filter(r => r.native).length}`);
p('');
p('BY KIND (not-adjudicated only):');
for (const k of ['dev/harness', 'internal/steward', 'member', 'other']) {
  p(`  ${k}: ${notAdjudicated.filter(r => r.kind === k).length}`);
}
p('');
p('--- NOT ADJUDICATED, full list ---');
for (const r of notAdjudicated) p(`${r.native ? 'N' : '-'}${r.mobileOk ? 'M' : '-'} [${r.kind}] ${r.route}`);
p('');
p('--- LINKED BUT NO ACCESS RULE (reachable by design, ungoverned) ---');
for (const r of linkedNoRule) p(`${r.native ? 'N' : '-'}${r.mobileOk ? 'M' : '-'} [${r.kind}] ${r.route}`);
console.log(out.join('\n'));
