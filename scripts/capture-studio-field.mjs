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
 * The app must be reachable at --url. Pass `--serve` and this script starts it,
 * waits for it, captures, and shuts it down again — one command, one terminal.
 * Three separate capture attempts were lost to a dev server that had been
 * stopped before the capture ran, which is a coordination problem the tool
 * should not have handed to a person in the first place.
 *
 * None of this can happen in a remote Claude Code session: that container has
 * no database and no env files, so there is nothing to point a browser at. Run
 * it where the stack runs.
 */
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
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

const serve = rest.includes('--serve');

/** Is something already answering there? Then do not start a second one. */
async function alreadyUp(origin) {
  try {
    await fetch(origin, { signal: AbortSignal.timeout(1500) });
    return true;
  } catch {
    return false;
  }
}

/**
 * Start the dev server and wait for it to answer.
 *
 * Detached so the whole process group can be killed afterwards — `npm run dev`
 * spawns next, and killing only npm leaves the server holding the port, which
 * would break the NEXT capture in a way that looks like this one succeeded.
 */
async function startServer(origin) {
  console.log('[capture] starting the app (--serve) ...');
  const child = spawn('npm', ['run', 'dev'], { detached: true, stdio: 'pipe' });
  let out = '';
  child.stdout.on('data', (d) => {
    out += d.toString();
  });
  child.stderr.on('data', (d) => {
    out += d.toString();
  });

  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await alreadyUp(origin)) {
      console.log('[capture] app is up.');
      return child;
    }
    if (child.exitCode !== null) {
      console.error(`[capture] The app exited before it was ready (code ${child.exitCode}).`);
      console.error(out.split('\n').slice(-25).join('\n'));
      process.exit(1);
    }
  }
  console.error('[capture] The app did not become ready within 120s. Last output:');
  console.error(out.split('\n').slice(-25).join('\n'));
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    /* already gone */
  }
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
const origin = new URL(targetUrl()).origin;
let server = null;
if (serve && !(await alreadyUp(origin))) {
  server = await startServer(origin);
} else if (serve) {
  /* Reusing a server this script did not start is a real hazard: it may have
     been launched from a different checkout, or before the last `git pull`, and
     then the capture is of code that is not the code under review. That is the
     same stale-artifact failure as an all-CACHED deploy reporting a fresh SHA —
     plausible, and wrong. Next's dev server recompiles per request, so a server
     started in THIS working tree is fine; one started elsewhere is not, and
     from here the two are indistinguishable. So: say so, loudly. */
  console.warn('');
  console.warn('[capture] WARNING: something is already serving at', origin);
  console.warn('[capture] Using it rather than starting another — but this script did not');
  console.warn('[capture] start it and cannot tell which checkout or commit it is serving.');
  console.warn('[capture] If it predates your last pull, the capture is of older code.');
  console.warn('[capture] To be certain, stop it and re-run:  lsof -ti:3000 | xargs kill');
  console.warn('');
}

/**
 * A crashed run leaves Chrome holding the profile, and puppeteer then refuses
 * to launch. The error is accurate but says nothing about what to do, and the
 * lock is invisible — the window may not even be on screen.
 */
async function launch() {
  try {
    return await puppeteer.launch(launchOptions);
  } catch (err) {
    const m = err instanceof Error ? err.message : String(err);
    if (/already running for/.test(m)) {
      console.error('[capture] A browser is still holding the capture profile — almost always');
      console.error('[capture] left behind by a run that crashed. Close it, or:');
      console.error('[capture]   pkill -f "Chrome for Testing"');
      console.error('[capture] The profile itself is fine; only the lock is stale.');
      process.exit(1);
    }
    throw err;
  }
}

const launchOptions = {
  executablePath: browser0.path,
  headless: !headful,
  userDataDir: PROFILE_DIR,
  defaultViewport: headful ? null : VIEWPORT,
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    /* A persistent profile means Chrome runs its first-run and default-browser
       flows, which open and close tabs underneath the automation. That is what
       detached the navigating frame. */
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-session-crashed-bubble',
    '--hide-crash-restore-bubble',
    `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
  ],
};

const browser = await launch();
try {
  /* Reuse the page Chrome already opened rather than adding one.
     `browser.newPage()` races Chrome's own startup tabs when a profile is
     restored — the new page is created, Chrome tidies up its startup state,
     and the page we are mid-navigation on is the one that gets closed. That is
     exactly "Navigating frame was detached". */
  const existing = await browser.pages();
  const page = existing.find((p) => !p.isClosed()) ?? (await browser.newPage());
  await page.bringToFront().catch(() => {});
  await page.setViewport(VIEWPORT);
  const url = targetUrl();
  console.log(`[capture] ${url} at ${VIEWPORT.width}×${VIEWPORT.height}@${VIEWPORT.deviceScaleFactor}x`);
  /**
   * Navigate, tolerating one detachment.
   *
   * A profile-restoring Chrome can close the page out from under the first
   * navigation. That is a startup race, not a fact about the app, so it is
   * retried once on a fresh page rather than reported as a failure — and only
   * once, so a genuinely broken page still fails instead of looping.
   */
  async function navigate(target) {
    try {
      return await target.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      if (/detached|Target closed|Session closed/i.test(m)) {
        console.log('[capture] the page was closed during startup — retrying once.');
        const fresh = await browser.newPage();
        await fresh.setViewport(VIEWPORT);
        page2 = fresh;
        return await fresh.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });
      }
      throw err;
    }
  }

  let page2 = page;
  try {
    await navigate(page);
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

  /**
   * What the room ACTUALLY rendered. Three outcomes, never conflated.
   *
   * This used to be one boolean — "is the signed-out panel showing?" — and a
   * boolean cannot tell the two failures apart. If the Canvas threw to the
   * error boundary, that text is absent, the boolean reads false, and the
   * harness walks straight past it and photographs the crash under a
   * `[capture:ok]` line. A crash would have been filed as the field.
   *
   * That is the worst shape a witness can take: plausible evidence is more
   * dangerous than obvious failure when provenance is uncertain. So the state
   * is classified, and each class is said out loud.
   */
  const ROOM_CRASH = 'Something Went Wrong'; // app/error.tsx · app/global-error.tsx
  const ROOM_SIGNED_OUT = 'opens only to you'; // app/writers-studio/canvas/page.tsx
  async function readRoomState(target) {
    return await target.evaluate(
      (crash, out) => {
        const t = document.body.innerText;
        if (t.includes(crash)) return 'crash';
        if (t.includes(out)) return 'signed-out';
        return 'field';
      },
      ROOM_CRASH,
      ROOM_SIGNED_OUT,
    );
  }

  /**
   * Witness 1 — observed on the FIRST load, before any sign-in.
   *
   * The proof `ac02a22ba` needs is not "the harness stopped because it was
   * signed out". It is the whole chain:
   *
   *   fresh browser
   *     -> WriterCanvas reaches its unauthorized state
   *     -> the intended sign-in invitation renders
   *     -> no React error boundary
   *
   * A generic stop before rendering witnesses nothing. This runs before the
   * headful sign-in prompt precisely so the pre-session render is seen, whether
   * or not the run goes on to capture afterwards.
   */
  const firstLoad = await readRoomState(page2);
  if (firstLoad === 'signed-out') {
    console.log('[witness-1] PASS  unauthorized -> sign-in invitation rendered, no error boundary');
  } else if (firstLoad === 'crash') {
    console.log('[witness-1] FAIL  the error boundary rendered on first load, not the invitation.');
  } else {
    console.log('[witness-1] n/a   this profile already held a session; the room opened to the field.');
  }

  /* A capture of the signed-out panel is not a capture of the field, and it
     looks enough like a real screen to be mistaken for one. Refuse it. */
  if (headful) {
    console.log('');
    console.log('[capture] A window is open against the persistent profile.');
    console.log('[capture] Sign in there if you are not already, then press Enter here.');
    console.log('[capture] This is a one-time step — later captures reuse the session.');
    await new Promise((resolve) => process.stdin.once('data', resolve));
    await page2.reload({ waitUntil: 'networkidle0', timeout: 60_000 });
  }

  const state = await readRoomState(page2);
  if (state === 'crash') {
    console.error('[capture] The room threw to the error boundary. This is NOT a capture');
    console.error('[capture] failure — it is the field failing, and it must not be filed as');
    console.error('[capture] an image. Refusing.');
    console.error('[capture] Read the app terminal for the thrown error before anything else.');
    process.exit(1);
  }
  if (state === 'signed-out') {
    console.error('[capture] The Studio is showing its signed-out panel — this browser has no');
    console.error('[capture] session, so the capture would not be of the field. Sign in with a');
    console.error('[capture] profile this run can use, or capture with CHROMIUM_PATH pointed at');
    console.error('[capture] Sign in once with:');
    console.error(`[capture]   node scripts/capture-studio-field.mjs ${field} --headful`);
    process.exit(1);
  }
  /* The Studio loads its manuscript after mount. A capture taken before that
     photographs a loading state and calls it the field. */
  await page2.waitForFunction(() => !document.body.innerText.includes('reading the draft'), {
    timeout: 30_000,
  }).catch(() => console.warn('[capture] draft-ready probe timed out — capturing anyway'));
  /* The viewport is the contract. Two captures are comparable only because it
     cannot vary between them, so it is verified rather than trusted — a
     silently smaller one would drop a breakpoint and send the divergence pass
     hunting a layout bug that is really a window size. */
  const actual = await page2.evaluate(() => ({
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

  await page2.screenshot({ path: out });
  console.log(`[capture:ok] ${out}`);
} finally {
  await browser.close();
  if (server) {
    console.log('[capture] stopping the app it started.');
    try {
      /* The whole group: `npm run dev` spawns next, and killing only npm
         leaves the server holding the port — which would break the next
         capture in a way that looks like this one succeeded. */
      process.kill(-server.pid, 'SIGTERM');
    } catch {
      /* already gone */
    }
  }
}
