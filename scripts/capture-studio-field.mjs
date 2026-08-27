/**
 * Capture a Writer's Studio field at the reference viewport.
 *
 * WRITERS-STUDIO-V2 — visual acceptance is part of the build loop, not a
 * review afterwards. A field is finished when its screenshot and its reference
 * read as the same product; that comparison needs a screenshot taken at the
 * SAME viewport, by a command anyone can run the same way twice.
 *
 *   node scripts/capture-studio-field.mjs <field> [--url=http://localhost:3000] [--sha=<sha>]
 *
 * Fields and their routes are declared below so the capture cannot drift from
 * what acceptance compares against.
 *
 * Requires the app to be RUNNING and reachable at --url. This is why the
 * capture does not happen in a remote Claude Code session: that container has
 * no database and no env files, so there is nothing to point a browser at. Run
 * it where the stack runs — the dev machine, or against production.
 */
import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

/** The reference viewport. Every reference image was composed at this width. */
const VIEWPORT = { width: 1680, height: 1050, deviceScaleFactor: 2 };

const FIELDS = {
  'work-home': '/writers-studio',
  'writing-field': '/writers-studio/canvas',
  'structure-versions': '/writers-studio/canvas?panel=structure',
  'developmental-review': '/writers-studio/canvas?panel=review',
  'materials-studio': '/writers-studio/canvas?panel=materials',
};

const [field, ...rest] = process.argv.slice(2);
const arg = (name, fallback) =>
  rest.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=') ?? fallback;

if (!field || !FIELDS[field]) {
  console.error(`usage: node scripts/capture-studio-field.mjs <field> [--url=...] [--sha=...]`);
  console.error(`fields: ${Object.keys(FIELDS).join(' · ')}`);
  process.exit(1);
}

const base = arg('url', 'http://localhost:3000').replace(/\/+$/, '');
const sha = arg('sha', 'working');
const outDir = 'docs/design/writer-studio/implementations';
mkdirSync(outDir, { recursive: true });
const out = join(outDir, `${field}-${sha}.png`);

const browser = await puppeteer.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
try {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  const url = `${base}${FIELDS[field]}`;
  console.log(`[capture] ${url} at ${VIEWPORT.width}×${VIEWPORT.height}@${VIEWPORT.deviceScaleFactor}x`);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });
  /* The Studio loads its manuscript after mount. A capture taken before that
     photographs a loading state and calls it the field. */
  await page.waitForFunction(() => !document.body.innerText.includes('reading the draft'), {
    timeout: 30_000,
  }).catch(() => console.warn('[capture] draft-ready probe timed out — capturing anyway'));
  await page.screenshot({ path: out });
  console.log(`[capture:ok] ${out}`);
} finally {
  await browser.close();
}
