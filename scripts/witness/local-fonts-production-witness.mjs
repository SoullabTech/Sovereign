#!/usr/bin/env node
/**
 * Local-fonts production network witness
 * ======================================
 *
 * Establishes, against the DEPLOYED member path, exactly this claim:
 *
 *   "Google Fonts runtime dependency has been removed and witnessed
 *    on the live member path."
 *
 * and nothing wider. See:
 *   docs/ops/MAIA_LOCAL_FONTS_SOVEREIGNTY_ACCEPTANCE_2026-09-05.md
 *
 * The Mac Studio gates (G1a/G1b/G2/G3/G4a) witnessed the development host.
 * They do not transfer to production. This is production's own instrument.
 *
 * WHAT IT MEASURES
 *   W1  every font response resolves to the AIN origin
 *   W2  zero requests to fonts.googleapis.com / fonts.gstatic.com
 *   W3  vendored faces actually render (CDP CSS.getPlatformFontsForNode)
 *
 * WHY EACH VALIDITY GUARD EXISTS — a witness that can pass vacuously is
 * worse than no witness, because it produces a record.
 *
 *   W0a/W0b  SUBJECT STABILITY. The production GIT_COMMIT is read before the
 *            first navigation and again after the last observation. If they
 *            differ, a concurrent deploy changed the subject mid-measurement
 *            and the run is INVALID — not FAIL, not PASS. A result must know
 *            which commit it describes.
 *
 *   CACHE    A browser holding Google's stylesheet or woff2 files from before
 *            the repair issues zero Google requests no matter what the server
 *            sends. Without a cold cache, W2 measures the browser, not
 *            production. Fresh profile + Network.setCacheDisabled, both before
 *            the first navigation.
 *
 *   SW       A service worker can satisfy a resource without touching the
 *            network, making W2 look cleaner than production actually is.
 *            Network.setBypassServiceWorker, also before first navigation.
 *
 *   REACH    Zero font responses is instrument failure, not a pass. The run
 *            requires >0 font responses AND >0 vendored /fonts/... responses,
 *            so the witness proves it reached its subject rather than
 *            observing a page that loaded no fonts at all.
 *
 *   MEMBER   The repair lives in app/globals.css via app/layout.tsx, so the
 *            claim is about the member path as such, not about one page. A
 *            member surface is navigated alongside /accounted-for. If it
 *            redirects to sign-in, that surface was not reached and the run
 *            is INVALID.
 *
 * WHAT IT DOES NOT MEASURE — recorded so no reader infers more:
 *   - build-plane independence. `next/font/google` fetches from Google at
 *     BUILD time and self-hosts the result, so its faces are served from this
 *     origin too. Those arrive under /_next/static/media/ and are counted
 *     SEPARATELY: they are legitimate local assets but they are not evidence
 *     for this repair. Only /fonts/... responses are.
 *   - hermeticity, offline operation, or that cognition is local.
 *
 * USAGE
 *   node scripts/witness/local-fonts-production-witness.mjs
 *
 * ENV
 *   WITNESS_ORIGIN       default https://soullab.life
 *   WITNESS_SSH_HOST     default soullab@minisforum
 *   WITNESS_CONTAINER    default maia-sovereign
 *   WITNESS_EXPECT_SHA   optional; assert the deployed SHA is this one
 *   WITNESS_MEMBER_PATH  default /maia/privacy
 *   WITNESS_SKIP_SHA=1   read no SHA (renders the run NOT SUBJECT-BOUND;
 *                        never use for an acceptance-record witness)
 *
 * EXIT
 *   0  PASS
 *   1  FAIL     — production still depends on Google fonts at runtime
 *   2  INVALID  — the instrument did not validly reach its subject
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import puppeteer from 'puppeteer';

const ORIGIN = process.env.WITNESS_ORIGIN ?? 'https://soullab.life';
const SSH_HOST = process.env.WITNESS_SSH_HOST ?? 'soullab@minisforum';
const CONTAINER = process.env.WITNESS_CONTAINER ?? 'maia-sovereign';
const EXPECT_SHA = process.env.WITNESS_EXPECT_SHA ?? null;
// The second surface exists to prove the repair holds on the member path as
// such, not on one informational page. It must therefore be a route in the
// member namespace that an unauthenticated browser actually reaches.
//
// NOT /begin. At the deployed SHA app/begin/page.tsx is `redirect('/signin')`
// (deprecated 2026-05-16) — it is public in config/accessMatrix.ts, so it is
// never blocked, but it never arrives either. Pointing the witness there makes
// every run report INVALID for a mechanical reason rather than a finding.
//
// /maia/privacy is public in the access matrix, carries no redirect, and
// renders through app/layout.tsx — the layout that imports app/globals.css and
// therefore app/fonts.css. That is the surface the claim is about.
const MEMBER_PATH = process.env.WITNESS_MEMBER_PATH ?? '/maia/privacy';
const SKIP_SHA = process.env.WITNESS_SKIP_SHA === '1';

/** Families vendored by this repair — app/fonts.css. */
const VENDORED_FAMILIES = [
  'Atkinson Hyperlegible',
  'Crimson Pro',
  'IBM Plex Sans',
  'Source Sans Pro',
  'Spectral',
];

const GOOGLE_FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const FONT_EXT = /\.(woff2?|ttf|otf|eot)(\?|$)/i;
const SIGNIN_PATH = /\/(signin|sign-in|login|auth|begin-journey)\b/i;

const originHost = new URL(ORIGIN).host;

/* ── subject binding ─────────────────────────────────────────────────── */

function readProductionSha(label) {
  if (SKIP_SHA) return null;
  try {
    const out = execFileSync(
      'ssh',
      [SSH_HOST, `docker exec ${CONTAINER} printenv GIT_COMMIT`],
      { encoding: 'utf8', timeout: 30_000 },
    ).trim();
    if (!out) throw new Error('empty GIT_COMMIT');
    return out;
  } catch (err) {
    throw new Error(
      `could not read production GIT_COMMIT (${label}): ${err.message}\n` +
        'The subject cannot be bound, so no result would know what it describes.',
    );
  }
}

/* ── observation ─────────────────────────────────────────────────────── */

/**
 * Navigate one URL under cold-cache, service-worker-bypassed conditions and
 * record every response plus the platform fonts actually used to render.
 */
async function observe(browser, url) {
  const page = await browser.newPage();
  const cdp = await page.createCDPSession();

  // Order matters: both must be in force BEFORE the first navigation, or the
  // network log describes a cache/worker rather than production.
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
    }),
  );

  let navError = null;
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60_000 });
    // Fonts can be requested lazily as text paints; give the page a beat.
    await page.evaluate(() => (document.fonts ? document.fonts.ready : null));
    await new Promise((r) => setTimeout(r, 1500));
  } catch (err) {
    navError = err.message;
  }

  const finalUrl = page.url();

  // W3 — what the renderer ACTUALLY used, not what CSS asked for.
  // document.fonts.check() is not an acceptable substitute: it can return
  // true for a family that does not exist.
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
        } catch {
          continue; // node detached mid-walk; not a finding
        }
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
  const hostOf = (u) => {
    try {
      return new URL(u).host;
    } catch {
      return '';
    }
  };
  const pathOf = (u) => {
    try {
      return new URL(u).pathname;
    } catch {
      return '';
    }
  };

  const fontResponses = responses.filter(isFont);

  return {
    url,
    finalUrl,
    navError,
    // Every request to a Google font host, regardless of resource type —
    // the css2 stylesheet is a Stylesheet, not a Font, and must still count.
    googleRequests: requestedUrls.filter((u) => GOOGLE_FONT_HOSTS.includes(hostOf(u))),
    fontResponses,
    // Evidence FOR this repair.
    vendored: fontResponses.filter(
      (r) => hostOf(r.url) === originHost && pathOf(r.url).startsWith('/fonts/'),
    ),
    // Local and legitimate, but a different plane — next/font/google self-hosts
    // at build time. Counted separately so it can never stand in as evidence.
    nextFontMedia: fontResponses.filter(
      (r) => hostOf(r.url) === originHost && pathOf(r.url).startsWith('/_next/static/media/'),
    ),
    offOrigin: fontResponses.filter((r) => hostOf(r.url) !== originHost),
    servedFromCache: fontResponses.filter((r) => r.fromCache),
    platformFonts,
  };
}

/* ── report ──────────────────────────────────────────────────────────── */

const pad = (s, n) => String(s).padEnd(n);
const mark = (ok) => (ok ? 'PASS' : 'FAIL');

function main() {
  const failures = [];
  const invalid = [];

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   Local Fonts — Production Network Witness                   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`  origin: ${ORIGIN}`);
  console.log(`  run at: ${new Date().toISOString()}`);
  console.log('');

  return (async () => {
    /* W0a */
    let preSha = null;
    try {
      preSha = readProductionSha('before');
    } catch (err) {
      invalid.push(err.message);
    }
    if (EXPECT_SHA && preSha && preSha !== EXPECT_SHA) {
      invalid.push(`deployed SHA ${preSha} != expected ${EXPECT_SHA}`);
    }

    const userDataDir = mkdtempSync(join(tmpdir(), 'maia-fonts-witness-'));
    let browser;
    let observations = [];
    try {
      browser = await puppeteer.launch({
        headless: true,
        userDataDir, // fresh profile: no carried-over font cache
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
      });
      for (const path of ['/accounted-for', MEMBER_PATH]) {
        observations.push(await observe(browser, `${ORIGIN}${path}`));
      }
    } catch (err) {
      invalid.push(`browser run failed: ${err.message}`);
    } finally {
      if (browser) await browser.close().catch(() => {});
      rmSync(userDataDir, { recursive: true, force: true });
    }

    /* W0b */
    let postSha = null;
    if (!SKIP_SHA) {
      try {
        postSha = readProductionSha('after');
      } catch (err) {
        invalid.push(err.message);
      }
    }
    if (preSha && postSha && preSha !== postSha) {
      invalid.push(
        `subject changed mid-witness: ${preSha} → ${postSha}. ` +
          'A concurrent deploy replaced what was being measured.',
      );
    }

    console.log('SUBJECT');
    console.log(`  pre-navigation sha   ${preSha ?? (SKIP_SHA ? 'NOT READ (skipped)' : 'UNREADABLE')}`);
    console.log(`  post-observation sha ${postSha ?? (SKIP_SHA ? 'NOT READ (skipped)' : 'UNREADABLE')}`);
    console.log(
      `  subject stable       ${
        SKIP_SHA ? 'NOT BOUND — this run cannot support an acceptance record' : mark(Boolean(preSha) && preSha === postSha)
      }`,
    );
    console.log('');

    console.log('INSTRUMENT');
    console.log('  browser profile      FRESH (no carried-over font cache)');
    console.log('  browser cache        DISABLED before first navigation');
    console.log('  service workers      BYPASSED before first navigation');
    console.log('');

    let totalVendored = 0;
    let totalFonts = 0;

    for (const o of observations) {
      const reachedMember = o.url.endsWith(MEMBER_PATH);
      const redirectedToAuth = SIGNIN_PATH.test(new URL(o.finalUrl).pathname);

      console.log(`SURFACE  ${o.url}`);
      console.log(`  final url            ${o.finalUrl}`);
      if (o.navError) {
        invalid.push(`${o.url}: ${o.navError}`);
        console.log(`  navigation           INVALID — ${o.navError}`);
        console.log('');
        continue;
      }
      // Applies to BOTH surfaces, not just the member one: a run that measured
      // the sign-in page measured neither subject, whichever navigation slid.
      if (redirectedToAuth) {
        invalid.push(
          `${o.url} redirected to ${o.finalUrl} — that surface was not reached`,
        );
        console.log('  surface reached      INVALID — redirected to sign-in');
      } else if (reachedMember) {
        console.log('  member surface       REACHED');
      }

      totalFonts += o.fontResponses.length;
      totalVendored += o.vendored.length;

      console.log('  NETWORK');
      console.log(`    font responses         ${o.fontResponses.length}`);
      console.log(`    vendored /fonts/...    ${o.vendored.length}   ← evidence for this repair`);
      console.log(`    /_next/static/media    ${o.nextFontMedia.length}   (build-plane, NOT evidence)`);
      console.log(`    off-origin fonts       ${o.offOrigin.length}`);
      console.log(`    fonts.googleapis.com   ${o.googleRequests.filter((u) => u.includes('googleapis')).length}`);
      console.log(`    fonts.gstatic.com      ${o.googleRequests.filter((u) => u.includes('gstatic')).length}`);
      if (o.servedFromCache.length) {
        console.log(`    served from cache      ${o.servedFromCache.length}   ← cache guard leaked`);
        invalid.push(`${o.url}: ${o.servedFromCache.length} font responses came from cache`);
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
        const vendoredFamily = VENDORED_FAMILIES.includes(family);
        console.log(
          `    ${pad(family, 26)} ${vendoredFamily ? 'vendored' : 'system  '}  ` +
            `${info.isCustomFont ? 'custom font' : 'platform   '}  ${info.glyphCount} glyphs`,
        );
      }
      const anyVendoredRendered = [...o.platformFonts.keys()].some((f) =>
        VENDORED_FAMILIES.includes(f),
      );
      console.log(`    vendored faces render  ${mark(anyVendoredRendered)}`);
      if (!anyVendoredRendered && o.platformFonts.size > 0) {
        failures.push(`${o.url}: no vendored family rendered — typography fell back`);
      }
      console.log('');
    }

    /* REACH */
    console.log('REACH');
    console.log(`  total font responses   ${totalFonts}`);
    console.log(`  total vendored         ${totalVendored}`);
    if (totalFonts === 0) {
      invalid.push('zero font responses across all surfaces — instrument failure, not a pass');
    }
    if (totalVendored === 0) {
      invalid.push(
        'zero vendored /fonts/... responses — the witness did not reach its subject; ' +
          'a clean Google count here proves nothing',
      );
    }
    console.log('');

    /* verdict */
    let code = 0;
    let verdict = 'PASS';
    if (invalid.length) {
      code = 2;
      verdict = 'INVALID';
    } else if (failures.length) {
      code = 1;
      verdict = 'FAIL';
    }

    if (invalid.length) {
      console.log('INVALID — the instrument did not validly reach its subject:');
      for (const m of invalid) console.log(`  · ${m}`);
      console.log('');
    }
    if (failures.length) {
      console.log('FAILURES — production still depends on Google fonts at runtime:');
      for (const m of failures) console.log(`  · ${m}`);
      console.log('');
    }

    console.log(`RESULT                 ${verdict}`);
    console.log('');
    if (code === 0) {
      console.log('This PASS licenses exactly one claim:');
      console.log('  "Google Fonts runtime dependency has been removed and witnessed');
      console.log(`   on the live member path." — production subject ${preSha}`);
      console.log('');
      console.log('It does NOT establish build-plane independence, hermeticity, offline');
      console.log('operation, or that cognition is local. Those remain NOT TESTED.');
    } else {
      console.log('No claim is licensed. The /accounted-for typeface row stays External today.');
    }
    console.log('');
    return code;
  })();
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error('');
    console.error(`INVALID — witness aborted: ${err.message}`);
    console.error('');
    process.exit(2);
  });
