#!/usr/bin/env node
/**
 * Local-fonts production network witness — INSTRUMENT v2
 * ======================================================
 *
 * Establishes, against the DEPLOYED browser plane of soullab.life, exactly:
 *
 *   "The production site's runtime Google Fonts dependency has been removed
 *    and witnessed."
 *
 * and nothing wider. Record:
 *   docs/ops/MAIA_LOCAL_FONTS_SOVEREIGNTY_ACCEPTANCE_2026-09-05.md
 *
 * ── WHY v2 ───────────────────────────────────────────────────────────────
 * v1 ran against 8369594f3 and returned FAIL. The verdict was right; its
 * stated reason was wrong. v1's W3 inferred "typography fell back" from "no
 * vendored family rendered", and so misread Inter on /maia/privacy — which is
 * origin-served via next/font — as a third-party failure, while its own
 * network log recorded zero Google requests on both surfaces.
 *
 * The real defect was scope: v1 observed two pages and generalized to an
 * origin. An origin sweep found a live <link> to fonts.googleapis.com in
 * /now-what/preview.html, which v1 never visited.
 *
 * v2 corrects the false negative in W3 and simultaneously TIGHTENS the gate
 * through W4. Criteria were declared before this run, not after it — the
 * subject still FAILs under v2, which is the signature of a correction rather
 * than a rewrite-to-pass. See docs/canon/CLAIM_STATE_AUTHORITY.md rule 5.
 *
 * ── WHAT IT MEASURES ─────────────────────────────────────────────────────
 *   W1   every network-fetched font resolves to the AIN origin
 *   W2   zero requests to fonts.googleapis.com / fonts.gstatic.com
 *   W3   same-origin runtime font delivery, and vendored faces rasterize
 *   W4a  no Google Fonts reference in browser-deliverable served production
 *        assets or documents                        ← claim evidence
 *   W4b  no latent Google Fonts re-entry vector in browser-targetable source
 *                                                   ← preventive governance
 *
 * W4a and W4b are both required for closure but support DIFFERENT claims.
 * Latent source is not evidence that today's browser calls Google; it is
 * evidence that the repository retains an easy re-entry path.
 *
 * ── W3, PRECISELY ────────────────────────────────────────────────────────
 * Not "every rendered face must be origin-served" — a legitimate system face
 * requires no network at all and is neither a third-party failure nor
 * evidence of vendored-font reach.
 *
 *   Every NETWORK-FETCHED font must be same-origin. Both /fonts/... and
 *   /_next/static/media/... count as same-origin runtime font delivery.
 *
 *   Every sampled intended webfont must actually rasterize text
 *   (CSS.getPlatformFontsForNode, glyphCount > 0; custom where expected).
 *
 *   Across the witness surfaces, >=1 sampled rendered face must be backed by
 *   a deliberately vendored /fonts/... family.
 *
 * So /_next/static/media/ is same-origin RUNTIME EVIDENCE. It is NOT evidence
 * of /fonts vendoring, and the build provenance behind it (next/font contacts
 * Google at build time) is accounted separately and is out of this witness's
 * scope — the public accounting treats build-time contact as a different
 * plane. v1's label "build-plane, NOT evidence" was wrong on the first half.
 *
 * ── SCOPE ────────────────────────────────────────────────────────────────
 * The browser plane of the production site — not merely member routes. The
 * public row says "the production site"; a visitor's browser makes the same
 * external request whether the document is Next-rendered or static.
 *
 *   IN   browser-served soullab.life surfaces · public static HTML ·
 *        Next app/client assets · latent browser CSS/source (W4b ratchet)
 *   OUT  server-side PDF rendering · worker-only generated server HTML ·
 *        build-time framework acquisition
 *
 * Those remain real and are accounted separately. This witness does not
 * claim they vanished.
 *
 * ── VALIDITY GUARDS ──────────────────────────────────────────────────────
 * A witness that can pass vacuously is worse than none, because it produces
 * a record.
 *
 *   W0a/W0b  SUBJECT. Production GIT_COMMIT read before the first navigation
 *            and after the last observation. A mismatch is INVALID — not FAIL
 *            and not PASS. A result must know which commit it describes.
 *   CACHE    Fresh profile + Network.setCacheDisabled before first navigation.
 *            A warm cache issues zero Google requests regardless of what the
 *            server sends, so W2 would measure the browser.
 *   SW       Network.setBypassServiceWorker, also pre-navigation. A worker can
 *            satisfy a resource without the network.
 *   REACH    >0 font responses AND >0 vendored /fonts/... responses across
 *            surfaces. Zero is instrument failure, not a pass.
 *   MEMBER   A member surface is navigated alongside /accounted-for. A
 *            redirect to sign-in means it was not reached: INVALID.
 *
 * ── USAGE ────────────────────────────────────────────────────────────────
 *   WITNESS_EXPECT_SHA=<sha> node scripts/witness/local-fonts-production-witness.mjs
 *
 * ENV
 *   WITNESS_ORIGIN       default https://soullab.life
 *   WITNESS_SSH_HOST     default soullab@minisforum
 *   WITNESS_CONTAINER    default maia-sovereign
 *   WITNESS_EXPECT_SHA   assert the deployed SHA is this one
 *   WITNESS_MEMBER_PATH  default /maia/privacy
 *   WITNESS_EXTRA_PATHS  comma-separated additional surfaces to observe
 *   WITNESS_REPO_ROOT    default: the repo containing this script
 *   WITNESS_SKIP_SHA=1   read no SHA (run is NOT SUBJECT-BOUND; never for an
 *                        acceptance-record witness)
 *
 * EXIT  0 PASS · 1 FAIL · 2 INVALID
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const INSTRUMENT_VERSION = '2';

const ORIGIN = process.env.WITNESS_ORIGIN ?? 'https://soullab.life';
const SSH_HOST = process.env.WITNESS_SSH_HOST ?? 'soullab@minisforum';
const CONTAINER = process.env.WITNESS_CONTAINER ?? 'maia-sovereign';
const EXPECT_SHA = process.env.WITNESS_EXPECT_SHA ?? null;
const SKIP_SHA = process.env.WITNESS_SKIP_SHA === '1';

// The member surface must be a route an unauthenticated browser actually
// reaches. NOT /begin — at these SHAs app/begin/page.tsx is redirect('/signin'),
// so pointing here reports INVALID for a mechanical reason, not a finding.
// /maia/privacy is public in config/accessMatrix.ts, carries no redirect, and
// renders through app/layout.tsx.
const MEMBER_PATH = process.env.WITNESS_MEMBER_PATH ?? '/maia/privacy';

// In scope per the v2 declaration: the browser plane of the production site,
// which includes static HTML served from the same origin.
const EXTRA_PATHS = (process.env.WITNESS_EXTRA_PATHS ?? '/now-what/preview.html')
  .split(',').map((s) => s.trim()).filter(Boolean);

const REPO_ROOT =
  process.env.WITNESS_REPO_ROOT ??
  resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** Families vendored by this repair — app/fonts.css. */
const VENDORED_FAMILIES = [
  'Atkinson Hyperlegible', 'Crimson Pro', 'IBM Plex Sans',
  'Source Sans Pro', 'Spectral',
];

const GOOGLE_FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const GOOGLE_RE = /fonts\.(googleapis|gstatic)\.com/;
// A reference is FETCHABLE only inside url(), href= or src=. A prose mention
// (public/fonts/LICENSES.md names the hosts to say we no longer call them)
// is reported as informational and never fails a gate.
const FETCHABLE_RE = /(url\(|href\s*=|src\s*=)[^)\n>]{0,200}?fonts\.(googleapis|gstatic)\.com/i;
const FONT_EXT = /\.(woff2?|ttf|otf|eot)(\?|$)/i;
const SIGNIN_PATH = /\/(signin|sign-in|login|auth|begin-journey)\b/i;

// Browser-deliverable roots inside the running container.
const SERVED_ROOTS = ['/app/public', '/app/.next/static'];
// Browser-targetable source in the repo, for the W4b ratchet.
const SOURCE_ROOTS = ['app', 'components', 'public', 'styles', 'lib'];

// W4b classifies rather than excludes. Every hit is printed; only the CLIENT
// plane gates. Nothing is silently dropped — a sweep that hides what it
// decided not to count is not a ratchet, it is a filter.
//
// SERVER: declared OUT of this witness. app/api/** is the server route plane;
// lib/manuscript/render/** is server-side PDF generation (pandoc → Paged.js →
// Puppeteer, via app/api/book-studio/render), whose HTML is never delivered to
// a member's browser as a production web surface.
// DOCS: markdown is not source capable of being brought into the deployed
// client by an import or a link.
const SERVER_PLANE = [/^app\/api\//, /^lib\/manuscript\/render\//];
const DOCS_PLANE = [/\.mdx?$/i];
const planeOf = (file) =>
  SERVER_PLANE.some((re) => re.test(file)) ? 'server'
  : DOCS_PLANE.some((re) => re.test(file)) ? 'docs'
  : 'client';

const originHost = new URL(ORIGIN).host;

/* ── subject binding ─────────────────────────────────────────────────── */

function ssh(cmd, label, { allowEmpty = false } = {}) {
  const out = execFileSync('ssh', [SSH_HOST, cmd], {
    encoding: 'utf8', timeout: 60_000,
  }).trim();
  if (!out && !allowEmpty) throw new Error(`${label}: empty result`);
  return out;
}

function readProductionSha(label) {
  if (SKIP_SHA) return null;
  try {
    return ssh(`docker exec ${CONTAINER} printenv GIT_COMMIT`, label);
  } catch (err) {
    throw new Error(
      `could not read production GIT_COMMIT (${label}): ${err.message}\n` +
        'The subject cannot be bound, so no result would know what it describes.',
    );
  }
}

/* ── W4a — served production sweep ───────────────────────────────────── */

/**
 * Grep the container's browser-deliverable roots. This catches references
 * that are SERVED but not requested by the surfaces we happened to visit —
 * exactly the class of defect that made v1 generalize two pages to an origin.
 */
function sweepServed() {
  const roots = SERVED_ROOTS.join(' ');
  const raw = ssh(
    `docker exec ${CONTAINER} sh -c "grep -rlE 'fonts\\.(googleapis|gstatic)\\.com' ${roots} 2>/dev/null || true"`,
    'served sweep', { allowEmpty: true },
  );
  const files = raw ? raw.split('\n').map((s) => s.trim()).filter(Boolean) : [];
  const classified = [];
  for (const file of files) {
    const body = ssh(
      `docker exec ${CONTAINER} sh -c "grep -nE 'fonts\\.(googleapis|gstatic)\\.com' '${file}' 2>/dev/null | head -5 || true"`,
      'served line', { allowEmpty: true },
    );
    classified.push({ file, fetchable: FETCHABLE_RE.test(body), sample: body.split('\n')[0] ?? '' });
  }
  return classified;
}

/* ── W4b — re-entry ratchet ──────────────────────────────────────────── */

function sweepSource() {
  const roots = SOURCE_ROOTS.map((r) => `'${r}'`).join(' ');
  let raw = '';
  try {
    raw = execFileSync(
      'sh',
      ['-c',
       `cd '${REPO_ROOT}' && grep -rlE 'fonts\\.(googleapis|gstatic)\\.com' ${roots} 2>/dev/null ` +
       `| grep -v node_modules || true`],
      { encoding: 'utf8', timeout: 60_000 },
    ).trim();
  } catch {
    return null; // unreadable checkout — reported, never silently passed
  }
  const files = raw ? raw.split('\n').filter(Boolean) : [];
  return files.map((file) => {
    let body = '';
    try {
      body = execFileSync('sh',
        ['-c', `cd '${REPO_ROOT}' && grep -nE 'fonts\\.(googleapis|gstatic)\\.com' '${file}' | head -5`],
        { encoding: 'utf8', timeout: 20_000 }).trim();
    } catch { /* empty */ }
    // A constructed URL is a vector too: lib/theme/themeCssVars.ts builds
    // `https://fonts.googleapis.com/css2?...` in a module a client component
    // imports. It matches no href=/url() literal, so FETCHABLE_RE alone would
    // miss the most dangerous case in the tree.
    const constructed = /['\`]https:\/\/fonts\.(googleapis|gstatic)\.com/.test(body);
    return {
      file,
      plane: planeOf(file),
      fetchable: FETCHABLE_RE.test(body) || constructed,
      sample: body.split('\n')[0] ?? '',
    };
  });
}

/* ── observation ─────────────────────────────────────────────────────── */

async function observe(browser, url) {
  const page = await browser.newPage();
  const cdp = await page.createCDPSession();

  // Both must be in force BEFORE the first navigation, or the network log
  // describes a cache/worker rather than production.
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.setBypassServiceWorker', { bypass: true });

  const responses = [];
  const requestedUrls = [];
  cdp.on('Network.requestWillBeSent', (e) => requestedUrls.push(e.request.url));
  cdp.on('Network.responseReceived', (e) =>
    responses.push({
      url: e.response.url,
      status: e.response.status,
      fromCache: Boolean(e.response.fromDiskCache || e.response.fromPrefetchCache),
      type: e.type,
    }));

  let navError = null;
  let documentHtml = '';
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60_000 });
    await page.evaluate(() => (document.fonts ? document.fonts.ready : null));
    await new Promise((r) => setTimeout(r, 1500));
    documentHtml = await page.content();
  } catch (err) {
    navError = err.message;
  }

  const finalUrl = page.url();

  // W3 — what the renderer ACTUALLY used. document.fonts.check() is not an
  // acceptable substitute: it can return true for a family that does not exist.
  const platformFonts = new Map();
  if (!navError) {
    try {
      await cdp.send('DOM.enable');
      await cdp.send('CSS.enable');
      const { root } = await cdp.send('DOM.getDocument', { depth: -1, pierce: false });
      const { nodeIds } = await cdp.send('DOM.querySelectorAll', {
        nodeId: root.nodeId,
        selector: 'h1, h2, h3, p, li, td, th, span, a, button',
      });
      for (const nodeId of nodeIds.slice(0, 120)) {
        let used;
        try {
          ({ fonts: used } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId }));
        } catch { continue; } // node detached mid-walk; not a finding
        for (const f of used ?? []) {
          if (!f.glyphCount) continue;
          const prev = platformFonts.get(f.familyName) ?? { glyphCount: 0, isCustomFont: false };
          platformFonts.set(f.familyName, {
            glyphCount: prev.glyphCount + f.glyphCount,
            isCustomFont: prev.isCustomFont || Boolean(f.isCustomFont),
          });
        }
      }
    } catch (err) {
      navError ??= `render inspection failed: ${err.message}`;
    }
  }

  await page.close();

  const isFont = (r) => r.type === 'Font' || FONT_EXT.test(r.url);
  const hostOf = (u) => { try { return new URL(u).host; } catch { return ''; } };
  const pathOf = (u) => { try { return new URL(u).pathname; } catch { return ''; } };
  const fontResponses = responses.filter(isFont);
  const sameOrigin = (r) => hostOf(r.url) === originHost;

  return {
    url, finalUrl, navError,
    // Every request to a Google font host regardless of resource type — the
    // css2 stylesheet is a Stylesheet, not a Font, and must still count.
    googleRequests: requestedUrls.filter((u) => GOOGLE_FONT_HOSTS.includes(hostOf(u))),
    fontResponses,
    // Deliberately vendored by this repair.
    vendored: fontResponses.filter((r) => sameOrigin(r) && pathOf(r.url).startsWith('/fonts/')),
    // Same-origin runtime evidence, but NOT evidence of /fonts vendoring.
    // Build provenance behind it is accounted separately.
    nextFontMedia: fontResponses.filter(
      (r) => sameOrigin(r) && pathOf(r.url).startsWith('/_next/static/media/')),
    offOrigin: fontResponses.filter((r) => !sameOrigin(r)),
    servedFromCache: fontResponses.filter((r) => r.fromCache),
    // W4a on the delivered document itself, not just on disk in the container.
    docGoogleRef: FETCHABLE_RE.test(documentHtml),
    platformFonts,
  };
}

/* ── report ──────────────────────────────────────────────────────────── */

const pad = (s, n) => String(s).padEnd(n);
const mark = (ok) => (ok ? 'PASS' : 'FAIL');

async function run() {
  const failures = [];
  const invalid = [];

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log(`║   Local Fonts — Production Witness · INSTRUMENT v${pad(INSTRUMENT_VERSION, 11)}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`  origin: ${ORIGIN}`);
  console.log(`  run at: ${new Date().toISOString()}`);
  console.log('');

  /* W0a */
  let preSha = null;
  try { preSha = readProductionSha('before'); }
  catch (err) { invalid.push(err.message); }
  if (EXPECT_SHA && preSha && preSha !== EXPECT_SHA) {
    invalid.push(`deployed SHA ${preSha} != expected ${EXPECT_SHA}`);
  }

  const userDataDir = mkdtempSync(join(tmpdir(), 'maia-fonts-witness-'));
  let browser;
  const observations = [];
  try {
    browser = await puppeteer.launch({
      headless: true,
      userDataDir, // fresh profile: no carried-over font cache
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
    for (const path of ['/accounted-for', MEMBER_PATH, ...EXTRA_PATHS]) {
      observations.push(await observe(browser, `${ORIGIN}${path}`));
    }
  } catch (err) {
    invalid.push(`browser run failed: ${err.message}`);
  } finally {
    if (browser) await browser.close().catch(() => {});
    rmSync(userDataDir, { recursive: true, force: true });
  }

  /* W4a — served sweep, and W4b — source ratchet */
  let served = null;
  if (!SKIP_SHA) {
    try { served = sweepServed(); }
    catch (err) { invalid.push(`served sweep failed: ${err.message}`); }
  }
  const source = sweepSource();
  if (source === null) invalid.push(`could not read repo source at ${REPO_ROOT} for the re-entry ratchet`);

  /* W0b */
  let postSha = null;
  if (!SKIP_SHA) {
    try { postSha = readProductionSha('after'); }
    catch (err) { invalid.push(err.message); }
  }
  if (preSha && postSha && preSha !== postSha) {
    invalid.push(`subject changed mid-witness: ${preSha} → ${postSha}. ` +
      'A concurrent deploy replaced what was being measured.');
  }

  console.log('SUBJECT');
  console.log(`  pre-navigation sha   ${preSha ?? (SKIP_SHA ? 'NOT READ (skipped)' : 'UNREADABLE')}`);
  console.log(`  post-observation sha ${postSha ?? (SKIP_SHA ? 'NOT READ (skipped)' : 'UNREADABLE')}`);
  console.log(`  subject stable       ${SKIP_SHA
    ? 'NOT BOUND — this run cannot support an acceptance record'
    : mark(Boolean(preSha) && preSha === postSha)}`);
  console.log('');

  console.log('INSTRUMENT');
  console.log(`  version              v${INSTRUMENT_VERSION}`);
  console.log('  browser profile      FRESH (no carried-over font cache)');
  console.log('  browser cache        DISABLED before first navigation');
  console.log('  service workers      BYPASSED before first navigation');
  console.log(`  surfaces             ${observations.length}`);
  console.log('');

  let totalFonts = 0;
  let totalVendored = 0;
  let anyVendoredRenderedAnywhere = false;

  for (const o of observations) {
    const isMember = o.url.endsWith(MEMBER_PATH);
    console.log(`SURFACE  ${o.url}`);
    console.log(`  final url            ${o.finalUrl}`);
    if (o.navError) {
      invalid.push(`${o.url}: ${o.navError}`);
      console.log(`  navigation           INVALID — ${o.navError}`);
      console.log('');
      continue;
    }
    // Applies to every surface: a run that measured the sign-in page measured
    // neither subject, whichever navigation slid.
    if (SIGNIN_PATH.test(new URL(o.finalUrl).pathname)) {
      invalid.push(`${o.url} redirected to ${o.finalUrl} — that surface was not reached`);
      console.log('  surface reached      INVALID — redirected to sign-in');
    } else if (isMember) {
      console.log('  member surface       REACHED');
    }

    totalFonts += o.fontResponses.length;
    totalVendored += o.vendored.length;

    console.log('  NETWORK');
    console.log(`    font responses         ${o.fontResponses.length}`);
    console.log(`    /fonts/...             ${o.vendored.length}   same-origin · vendored by this repair`);
    console.log(`    /_next/static/media    ${o.nextFontMedia.length}   same-origin runtime · NOT /fonts evidence`);
    console.log(`    off-origin fonts       ${o.offOrigin.length}`);
    console.log(`    fonts.googleapis.com   ${o.googleRequests.filter((u) => u.includes('googleapis')).length}`);
    console.log(`    fonts.gstatic.com      ${o.googleRequests.filter((u) => u.includes('gstatic')).length}`);
    if (o.servedFromCache.length) {
      console.log(`    served from cache      ${o.servedFromCache.length}   ← cache guard leaked`);
      invalid.push(`${o.url}: ${o.servedFromCache.length} font responses came from cache`);
    }
    if (o.docGoogleRef) {
      console.log('    document reference     PRESENT   ← W4a: delivered HTML references a Google font host');
      failures.push(`${o.url}: delivered document contains a fetchable Google Fonts reference`);
    }
    if (o.googleRequests.length) {
      failures.push(`${o.url}: ${o.googleRequests.length} request(s) to Google font hosts`);
      for (const u of o.googleRequests.slice(0, 10)) console.log(`      ! ${u}`);
    }
    if (o.offOrigin.length) {
      failures.push(`${o.url}: ${o.offOrigin.length} font response(s) not from ${originHost}`);
      for (const r of o.offOrigin.slice(0, 10)) console.log(`      ! ${r.url}`);
    }

    console.log('  RENDER');
    if (o.platformFonts.size === 0) {
      invalid.push(`${o.url}: no platform fonts observed — render inspection did not reach the page`);
      console.log('    (none observed — INVALID)');
    }
    for (const [family, info] of [...o.platformFonts.entries()].sort()) {
      const isVendored = VENDORED_FAMILIES.includes(family);
      // A system/local OS face is neither third-party failure nor evidence of
      // vendored-font reach.
      const kind = isVendored ? 'vendored' : info.isCustomFont ? 'webfont ' : 'system  ';
      console.log(`    ${pad(family, 26)} ${kind}  ${info.isCustomFont ? 'custom font' : 'platform   '}  ${info.glyphCount} glyphs`);
      if (isVendored) anyVendoredRenderedAnywhere = true;
    }
    console.log('');
  }

  /* W3 vendored-reach + REACH */
  console.log('W3  RENDER / ORIGIN');
  console.log(`  network-fetched fonts all same-origin   ${mark(observations.every((o) => o.offOrigin.length === 0))}`);
  console.log(`  >=1 vendored /fonts face rasterized     ${mark(anyVendoredRenderedAnywhere)}`);
  if (!anyVendoredRenderedAnywhere && totalFonts > 0) {
    failures.push('no deliberately vendored /fonts/... family rasterized on any surface');
  }
  console.log('');

  console.log('REACH');
  console.log(`  total font responses   ${totalFonts}`);
  console.log(`  total /fonts responses ${totalVendored}`);
  if (totalFonts === 0) invalid.push('zero font responses across all surfaces — instrument failure, not a pass');
  if (totalVendored === 0) invalid.push(
    'zero vendored /fonts/... responses — the witness did not reach its subject; ' +
    'a clean Google count here proves nothing');
  console.log('');

  /* W4a */
  console.log('W4a SERVED PRODUCTION            ← claim evidence');
  if (served === null) {
    console.log('  (not swept — SHA reading skipped)');
    invalid.push('served sweep not performed; W4a is unestablished');
  } else {
    const fetchable = served.filter((f) => f.fetchable);
    const prose = served.filter((f) => !f.fetchable);
    console.log(`  roots                  ${SERVED_ROOTS.join(' ')}`);
    console.log(`  fetchable references   ${fetchable.length}`);
    console.log(`  prose mentions         ${prose.length}   (informational — never gates)`);
    for (const f of fetchable) console.log(`      ! ${f.file}  ${f.sample.slice(0, 90)}`);
    for (const f of prose) console.log(`      · ${f.file}`);
    if (fetchable.length) {
      failures.push(`${fetchable.length} browser-deliverable production asset(s) reference a Google font host`);
    }
  }
  console.log('');

  /* W4b */
  console.log('W4b RE-ENTRY RATCHET             ← preventive governance, not runtime evidence');
  if (source === null) {
    console.log('  (repo unreadable)');
  } else {
    const client = source.filter((f) => f.fetchable && f.plane === 'client');
    const server = source.filter((f) => f.fetchable && f.plane === 'server');
    const docs = source.filter((f) => f.fetchable && f.plane === 'docs');
    const prose = source.filter((f) => !f.fetchable);
    console.log(`  roots                  ${SOURCE_ROOTS.join(' ')}`);
    console.log(`  client-plane vectors   ${client.length}   ← gates closure`);
    for (const f of client) console.log(`      ! ${f.file}  ${f.sample.slice(0, 88)}`);
    console.log(`  server-plane refs      ${server.length}   (declared OUT — reported, does not gate)`);
    for (const f of server) console.log(`      · ${f.file}`);
    console.log(`  documentation refs     ${docs.length}   (not deliverable source — does not gate)`);
    for (const f of docs) console.log(`      · ${f.file}`);
    console.log(`  prose mentions         ${prose.length}   (informational — does not gate)`);
    for (const f of prose) console.log(`      · ${f.file}`);
    if (client.length) {
      failures.push(
        `${client.length} browser-targetable source file(s) retain a Google Fonts re-entry vector ` +
        '(not evidence the dependency was active — evidence the path back is open)');
    }
  }
  console.log('');

  /* verdict */
  let code = 0, verdict = 'PASS';
  if (invalid.length) { code = 2; verdict = 'INVALID'; }
  else if (failures.length) { code = 1; verdict = 'FAIL'; }

  if (invalid.length) {
    console.log('INVALID — the instrument did not validly reach its subject.');
    console.log('This licenses nothing in either direction; the claim keeps the state it held.');
    for (const m of invalid) console.log(`  · ${m}`);
    console.log('');
  }
  if (failures.length) {
    console.log('FAILURES:');
    for (const m of failures) console.log(`  · ${m}`);
    console.log('');
  }

  console.log(`RESULT                 ${verdict}`);
  console.log('');
  if (code === 0) {
    console.log('This PASS licenses exactly one claim:');
    console.log('  "The production site\'s runtime Google Fonts dependency has been');
    console.log(`   removed and witnessed." — production subject ${preSha}, instrument v${INSTRUMENT_VERSION}`);
    console.log('');
    console.log('It does NOT establish build-plane independence, hermeticity, offline');
    console.log('operation, server-side generation independence, or that cognition is');
    console.log('local. Those remain NOT TESTED and are accounted separately.');
    console.log('');
    console.log('Per docs/canon/CLAIM_STATE_AUTHORITY.md: this establishes what state is');
    console.log('warranted. It does not itself edit the public record.');
  } else {
    console.log('No claim is licensed. The /accounted-for typeface row stays External today.');
  }
  console.log('');
  return code;
}

run()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error('');
    console.error(`INVALID — witness aborted: ${err.message}`);
    console.error('');
    process.exit(2);
  });
