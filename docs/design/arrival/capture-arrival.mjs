// Capture the shipped arrival surfaces as evidence, and witness the suspected
// biometric reflow. Read-only: loads pages, measures, screenshots. Submits
// nothing, types nothing, clicks nothing.
//
//   node docs/design/arrival/capture-arrival.mjs <baseUrl> <outDir>
//
// Requires playwright in the environment you run it from — the Mac Studio, not
// the Claude Code container. See capture-arrival.md.
//
// WHY TWO PASSES
// The open finding (ARRIVAL-BIOMETRIC-REFLOW-01) is about a control that
// appears AFTER first paint, because bioAvailable is set by an async
// availability check in an effect after mount (UnifiedAuth.tsx:236-253). You
// cannot screenshot a moment you have not yet detected, so:
//   pass 1 — cheap DOM polling, finds WHEN the button appears and whether the
//            layout moved when it did
//   pass 2 — reload, screenshot at the four moments pass 1 named
// That yields the sequence the ruling asked for:
//   first paint · settled pre-biometric · biometric arrival · final stable

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [base = 'http://localhost:3000', out = './out'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

// /signin opens on the password phase, /signup on email (UnifiedAuth.tsx:185,
// commit 44b7a52). These are two different encounters, not one responsive
// composition — capture both or the blind spot stays.
const ROUTES = [
  { slug: 'signin-password',    path: '/signin',                encounter: 'return' },
  { slug: 'signin-welcomeback', path: '/signin?username=demo',  encounter: 'return' },
  { slug: 'signup-email',       path: '/signup',                encounter: 'first'  },
];

const WIDTHS = [
  { n: '390',  w: 390,  h: 844  },
  { n: '768',  w: 768,  h: 1024 },
  { n: '1440', w: 1440, h: 900  },
  { n: '1728', w: 1728, h: 1080 },
];

const BIO = /touch id|face id|biometric|fingerprint/i;
const POLL_MS = 50;
const POLL_LIMIT_MS = 6000;

// Runs in the page. Records layout-shift entries from first paint so the
// reflow question is answered by the browser's own instrument, not by eye.
const INSTALL_CLS = () => {
  window.__shifts = [];
  try {
    new PerformanceObserver(list => {
      for (const e of list.getEntries()) {
        if (!e.hadRecentInput) {
          window.__shifts.push({ t: Math.round(e.startTime), value: +e.value.toFixed(5) });
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch { /* non-Chromium: no layout-shift entries */ }
};

// A stable anchor whose Y position tells us whether the stack moved.
const PROBE = (bioSrc) => {
  const re = new RegExp(bioSrc, 'i');
  const buttons = [...document.querySelectorAll('button')];
  const bio = buttons.find(b => re.test(b.textContent || ''));
  // last control in the stack — if anything is inserted above it, this moves
  const last = buttons[buttons.length - 1];
  return {
    bio: !!bio,
    buttons: buttons.length,
    anchorY: last ? Math.round(last.getBoundingClientRect().top) : null,
    height: document.body.scrollHeight,
    cls: +(window.__shifts || []).reduce((a, s) => a + s.value, 0).toFixed(5),
    shifts: (window.__shifts || []).length,
  };
};

const browser = await chromium.launch();
const report = [];

for (const r of ROUTES) {
  for (const v of WIDTHS) {
    const ctxOpts = { viewport: { width: v.w, height: v.h }, deviceScaleFactor: 2 };

    // ── pass 1: when does it change, and does the layout move ──────────────
    let ctx = await browser.newContext(ctxOpts);
    let page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(`PAGEERROR ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.addInitScript(INSTALL_CLS);
    await page.goto(base + r.path, { waitUntil: 'domcontentloaded' });

    const samples = [];
    for (let t = 0; t <= POLL_LIMIT_MS; t += POLL_MS) {
      samples.push({ t, ...(await page.evaluate(PROBE, BIO.source)) });
      const s = samples[samples.length - 1];
      // stop early once the button is present and the layout has been still
      if (s.bio && samples.length > 8) {
        const recent = samples.slice(-8);
        if (recent.every(x => x.anchorY === s.anchorY && x.height === s.height)) break;
      }
      await page.waitForTimeout(POLL_MS);
    }
    const final = samples[samples.length - 1];
    const firstBio = samples.find(s => s.bio) ?? null;
    const preBio = firstBio ? samples[Math.max(0, samples.indexOf(firstBio) - 1)] : null;
    const shiftPx = firstBio && preBio && preBio.anchorY != null && firstBio.anchorY != null
      ? firstBio.anchorY - preBio.anchorY : 0;
    await ctx.close();

    // ── pass 2: screenshot the moments pass 1 named ────────────────────────
    const moments = [
      { name: 'firstpaint', at: 0 },
      ...(firstBio && firstBio.t > 0 ? [{ name: 'pre-biometric', at: Math.max(0, firstBio.t - POLL_MS) }] : []),
      ...(firstBio && firstBio.t > 0 ? [{ name: 'biometric-arrival', at: firstBio.t }] : []),
      { name: 'final', at: Math.max(final.t, 2500) },
    ];
    for (const m of moments) {
      ctx = await browser.newContext(ctxOpts);
      page = await ctx.newPage();
      await page.goto(base + r.path, { waitUntil: 'domcontentloaded' });
      if (m.at > 0) await page.waitForTimeout(m.at);
      await page.screenshot({ path: join(out, `${r.slug}-${v.n}-${m.name}.png`) });
      await ctx.close();
    }

    // reduced motion, one width, final state only — "does meaning change?"
    if (v.n === '1440') {
      ctx = await browser.newContext({ ...ctxOpts, reducedMotion: 'reduce' });
      page = await ctx.newPage();
      await page.goto(base + r.path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2500);
      await page.screenshot({ path: join(out, `${r.slug}-1440-reduced.png`) });
      await ctx.close();
    }

    const verdict =
      !firstBio                 ? 'no biometric control offered on this device/profile'
      : firstBio.t === 0        ? 'present at first paint — no late arrival'
      : shiftPx === 0           ? `arrived at ~${firstBio.t}ms, no layout displacement`
                                : `LATE + DISPLACED: arrived ~${firstBio.t}ms, stack moved ${shiftPx}px`;

    report.push({
      route: r.path, encounter: r.encounter, width: v.n,
      biometricAppearedMs: firstBio ? firstBio.t : null,
      stackShiftPx: shiftPx,
      cumulativeLayoutShift: final.cls,
      layoutShiftEvents: final.shifts,
      buttonsFinal: final.buttons,
      bodyHeight: final.height,
      errors,
      verdict,
    });
    console.log(`${r.slug.padEnd(20)} ${v.n.padEnd(5)} ${verdict}`);
  }
}

await browser.close();
writeFileSync(join(out, 'reflow-report.json'), JSON.stringify(report, null, 2));

const late = report.filter(r => /LATE \+ DISPLACED/.test(r.verdict));
console.log(`\nCaptures + reflow-report.json written to ${out}`);
console.log(late.length
  ? `\nARRIVAL-BIOMETRIC-REFLOW-01: CONFIRMED on ${late.length} of ${report.length} cells.`
  : `\nARRIVAL-BIOMETRIC-REFLOW-01: not reproduced in ${report.length} cells (this device/profile).`);
