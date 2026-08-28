// Capture the shipped arrival surface as evidence. Read-only: loads pages and
// screenshots them, submits nothing. See capture-arrival.md.
//
//   node docs/design/arrival/capture-arrival.mjs <baseUrl> <outDir>
//
// Requires playwright (or playwright-core plus a browser) in the environment
// you run it from — the Mac Studio, not the Claude Code container.

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [base = 'http://localhost:3000', out = './out'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

// Both phases: /signin opens on password, /signup on email (UnifiedAuth.tsx:185).
const ROUTES = [
  { slug: 'signin-password', path: '/signin' },
  { slug: 'signin-welcomeback', path: '/signin?username=demo' },
  { slug: 'signup-email', path: '/signup' },
];

const VIEWS = [
  { n: '390', w: 390, h: 844 },
  { n: '768', w: 768, h: 1024 },
  { n: '1440', w: 1440, h: 900 },
  { n: '1728', w: 1728, h: 1080 },
];

const browser = await chromium.launch();
const notes = [];

for (const r of ROUTES) {
  for (const v of VIEWS) {
    for (const reduced of [false, true]) {
      if (reduced && v.n !== '1440') continue;
      const ctx = await browser.newContext({
        viewport: { width: v.w, height: v.h },
        deviceScaleFactor: 2,
        reducedMotion: reduced ? 'reduce' : 'no-preference',
      });
      const page = await ctx.newPage();
      page.on('pageerror', e => notes.push(`${r.slug}/${v.n}: PAGEERROR ${e.message}`));
      page.on('console', m => { if (m.type() === 'error') notes.push(`${r.slug}/${v.n}: ${m.text()}`); });

      await page.goto(base + r.path, { waitUntil: 'networkidle' });

      // First-paint frame, before the async biometric availability check can
      // land — this is the frame the orientation floor is about.
      await page.screenshot({ path: join(out, `${r.slug}-${v.n}-firstpaint.png`) });

      // Settled frame, after any late-arriving control.
      await page.waitForTimeout(2500);
      const suffix = reduced ? `${v.n}-reduced` : v.n;
      await page.screenshot({ path: join(out, `${r.slug}-${suffix}.png`) });

      // Did anything reflow between the two? This is the biometric-button question.
      const bio = await page.evaluate(() =>
        [...document.querySelectorAll('button')]
          .some(b => /touch id|face id|biometric/i.test(b.textContent || '')));
      const h = await page.evaluate(() => document.body.scrollHeight);
      notes.push(`${r.slug}/${suffix}: biometricButton=${bio} bodyHeight=${h}`);

      await ctx.close();
    }
  }
}

await browser.close();
console.log(notes.join('\n'));
console.log(`\nCaptures written to ${out}`);
