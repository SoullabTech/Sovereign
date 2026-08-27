/**
 * Capture a Writer's Studio field at the reference viewport.
 *
 * WRITERS-STUDIO-V2 — visual acceptance is part of the build loop, not a
 * review afterwards. A field is finished when its screenshot and its reference
 * read as the same product; that comparison needs a screenshot taken at the
 * SAME viewport, by a command anyone can run the same way twice.
 *
 *   node scripts/capture-studio-field.mjs <field> [--m=<manuscriptId>] [--url=<origin>] [--sha=<sha>] [--headful]
 *
 * --headful opens a real window against a PERSISTENT profile and waits for you
 * to press Enter. Sign in once; every later capture reuses that session, so the
 * remaining fields are one command each. The profile lives in .capture-profile/
 * and is gitignored — it holds a real login.
 *
 * --url is an ORIGIN (http://localhost:3000). The route comes from the field.
 * Pass a full URL instead and it is used verbatim — the first version appended
 * its route to whatever it was given, so a complete URL became
 * ".../canvas?m=xyz/writers-studio/canvas" and the capture died on a 404.
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
import { existsSync, mkdirSync } from 'node:fs';
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

const urlArg = arg('url', 'http://localhost:3000').replace(/\/+$/, '');
const manuscript = arg('m', '') || arg('manuscript', '');
const sha = arg('sha', 'working');

/**
 * Build the target.
 *
 * If --url already names a path, it IS the target — appending the field's route
 * to it is how this script produced ".../canvas?m=xyz/writers-studio/canvas"
 * and failed. Otherwise treat it as an origin and add the field's route.
 */
function targetUrl() {
  let u;
  try {
    u = new URL(urlArg);
  } catch {
    console.error(`[capture] --url is not a URL: ${urlArg}`);
    process.exit(1);
  }
  const hasPath = u.pathname && u.pathname !== '/';
  if (hasPath) return u.toString();
  const withRoute = new URL(FIELDS[field], u.origin);
  if (manuscript) withRoute.searchParams.set('m', manuscript);
  return withRoute.toString();
}
const outDir = 'docs/design/writer-studio/implementations';
mkdirSync(outDir, { recursive: true });
const out = join(outDir, `${field}-${sha}.png`);

/**
 * Find a browser to drive.
 *
 * The first version of this script hard-coded /opt/pw-browsers/chromium — the
 * path inside a remote Claude Code container, which is exactly where this
 * script CANNOT run. On the machine that actually has the stack, that path does
 * not exist and the capture died on it.
 *
 * So: an explicit override first, then whatever puppeteer downloaded for
 * itself, then the browsers a developer machine actually has. If none resolve,
 * say which were tried rather than failing on one guess.
 */
function resolveBrowser() {
  if (process.env.CHROMIUM_PATH) return { path: process.env.CHROMIUM_PATH, how: 'CHROMIUM_PATH' };

  // puppeteer's own download, when the package manages a browser for us.
  try {
    const p = puppeteer.executablePath();
    if (p && existsSync(p)) return { path: p, how: 'puppeteer bundled' };
  } catch {
    /* puppeteer-core, or no browser downloaded — fall through to the system. */
  }

  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/opt/pw-browsers/chromium',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
  ];
  const found = candidates.find((c) => existsSync(c));
  if (found) return { path: found, how: 'system browser' };

  console.error('[capture] No browser found. Tried, in order:');
  console.error('  $CHROMIUM_PATH (unset)');
  console.error('  puppeteer.executablePath() — no downloaded browser');
  for (const c of candidates) console.error(`  ${c}`);
  console.error('');
  console.error('Fix with either:');
  console.error('  npx puppeteer browsers install chrome');
  console.error('  CHROMIUM_PATH="/path/to/your/browser" node scripts/capture-studio-field.mjs ...');
  process.exit(1);
}

const browser0 = resolveBrowser();
console.log(`[capture] browser: ${browser0.path}  (${browser0.how})`);

const headful = rest.includes('--headful');

/**
 * A persistent profile is what makes this usable more than once.
 *
 * Headless Chrome starts with an empty profile every run, so it arrives at the
 * Studio signed out — and the Studio, correctly, shows its signed-out panel
 * rather than someone's manuscript. Capturing that and comparing it to the
 * reference would be comparing the wrong screen.
 *
 * So the session is kept. `--headful` once to sign in, then every capture after
 * it is headless and silent.
 */
const PROFILE_DIR = '.capture-profile';

/**
 * `defaultViewport: null` makes the headful window usable to sign in with — but
 * it also hands the viewport to the OS window, and the viewport IS the capture
 * contract. A window the operating system decided to make 1280 wide would drop
 * the xl: breakpoint, Materials would vanish from the capture, and the pass
 * would spend its time on a divergence that only ever existed in the window
 * manager.
 *
 * So the window is asked for the contract's size too, and the viewport is
 * asserted after navigation rather than assumed.
 */
const browser = await puppeteer.launch({
  executablePath: browser0.path,
  headless: !headful,
  userDataDir: PROFILE_DIR,
  defaultViewport: headful ? null : VIEWPORT,
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
  ],
});
try {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  const url = targetUrl();
  console.log(`[capture] ${url} at ${VIEWPORT.width}×${VIEWPORT.height}@${VIEWPORT.deviceScaleFactor}x`);
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });
  } catch (err) {
    /* The commonest failure by far is "the app is not running". Say that,
       rather than a stack trace out of the CDP layer. */
    const msg = err instanceof Error ? err.message : String(err);
    if (/ERR_CONNECTION_REFUSED/.test(msg)) {
      console.error(`[capture] Nothing is listening at ${new URL(url).origin}.`);
      console.error('[capture] Start the app first, in its own terminal:');
      console.error('[capture]   npm run dev');
      process.exit(1);
    }
    throw err;
  }

  /* A capture of the signed-out panel is not a capture of the field, and it
     looks enough like a real screen to be mistaken for one. Refuse it. */
  if (headful) {
    console.log('');
    console.log('[capture] A window is open against the persistent profile.');
    console.log('[capture] Sign in there if you are not already, then press Enter here.');
    console.log('[capture] This is a one-time step — later captures reuse the session.');
    await new Promise((resolve) => process.stdin.once('data', resolve));
    await page.reload({ waitUntil: 'networkidle0', timeout: 60_000 });
  }

  const signedOut = await page.evaluate(() =>
    document.body.innerText.includes('opens only to you'),
  );
  if (signedOut) {
    console.error('[capture] The Studio is showing its signed-out panel — this browser has no');
    console.error('[capture] session, so the capture would not be of the field. Sign in with a');
    console.error('[capture] profile this run can use, or capture with CHROMIUM_PATH pointed at');
    console.error('[capture] Sign in once with:');
    console.error(`[capture]   node scripts/capture-studio-field.mjs ${field} --headful`);
    process.exit(1);
  }
  /* The Studio loads its manuscript after mount. A capture taken before that
     photographs a loading state and calls it the field. */
  await page.waitForFunction(() => !document.body.innerText.includes('reading the draft'), {
    timeout: 30_000,
  }).catch(() => console.warn('[capture] draft-ready probe timed out — capturing anyway'));
  /* The viewport is the contract. Two captures are comparable only because it
     cannot vary between them, so it is verified rather than trusted — a
     silently smaller one would drop a breakpoint and send the divergence pass
     hunting a layout bug that is really a window size. */
  const actual = await page.evaluate(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
    dpr: window.devicePixelRatio,
  }));
  if (actual.w !== VIEWPORT.width || actual.h !== VIEWPORT.height) {
    console.error(
      `[capture] Viewport is ${actual.w}×${actual.h}, not the contract's ` +
        `${VIEWPORT.width}×${VIEWPORT.height}. Refusing to capture: an image at the`,
    );
    console.error('[capture] wrong width is not comparable with the reference.');
    process.exit(1);
  }
  console.log(`[capture] viewport verified ${actual.w}×${actual.h}@${actual.dpr}x`);

  await page.screenshot({ path: out });
  console.log(`[capture:ok] ${out}`);
} finally {
  await browser.close();
}
