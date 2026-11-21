#!/usr/bin/env node
/**
 * Browser-level check of the press harness (trial.mjs settle/pressAndObserve + classify.mjs) against a tiny local page that
 * misbehaves the way the product's pages did in the run of record. The unit tables cannot see this: the faults were in WHEN the
 * harness pressed and WHICH requests it credited, and both depend on timing in a real browser.
 *
 *   node tests/e2e/journey-ledger/lib/fixture-check.mjs
 *
 * Exit 0: every scenario was judged as expected · 1: a scenario was misjudged (the harness credits a press with what it did not
 * cause, or presses a page that is still moving) · 64: no browser could be driven, so nothing is claimed (never green).
 * No database, no product, no network beyond 127.0.0.1; a few tens of seconds.
 *
 * Each scenario replays what the persona does: the page is opened and waited on, the parent press (if any) is made and waited
 * on, then one control is pressed through pressAndObserve. `flight` is the persona's trial-long request tracker.
 */
import http from 'node:http';
import { findChromium, launch, newContext, gotoRetrying, enumerateControls, settle, pressAndObserve, trackInFlight } from './trial.mjs';
import { classifyTrial } from './classify.mjs';
import { PASS, DEAD_END, NOT_RUN } from './ledger.mjs';

const WORDS = '<h1>Fixture studio</h1><p>This page exists to be pressed. It has enough words on it to count as a rendered page, and nothing else.</p>';
const page = (body, script = '') => `<!doctype html><meta charset=utf-8><title>fixture</title><body>${WORDS}${body}<script>${script}</script>`;

// A name longer than the 80 characters the harness shows of a label (F8f-h): the comparison of a disabled control's explanation with
// its own name must be made on the whole name, not on what is shown of it.
const LONG = 'Save everything you have written so far into your private working copy of this book, today';
if (LONG.length <= 80) throw new Error('fixture error: LONG must be longer than the 80 characters a label is shown at');
const SHOWN = LONG.slice(0, 80);   // what enumerateControls calls the control (its label); the scenario finds the control by it

// What each route does. `delay` is how long the server holds the answer.
const PAGES = {
  // F1: "Just let me write". Pressing Begin shows Home at once; the Work-creation request takes 2.2 s; then the address changes
  // (the router.push that follows the response). Home itself is inert here, so pressing it must NOT be credited with that landing.
  '/f1': page('<button id=begin>Begin</button><div id=after></div>', `
    document.getElementById('begin').onclick = async () => {
      document.getElementById('after').innerHTML = '<button>Home</button>';
      await fetch('/api/create');
      history.pushState({}, '', '/f1?mode=write&m=w1');
    };`),
  // Control for F1: a button whose own handler changes the address and the text at once. It must still be a PASS.
  '/f1real': page('<button id=go>Go</button><p id=x></p>', `
    document.getElementById('go').onclick = () => { document.getElementById('x').textContent = 'You are now in the opened view, which has words of its own.'; history.pushState({}, '', '/f1real?opened=1'); };`),
  // F2a: the page asks for something of its own on load (like the import room's unfinished-uploads list) and the answer lands late.
  '/f2a': page('<button id=dev>Develop</button>', `fetch('/api/late');`),
  // F2b: like F2a, but the answer is held until the click is seen (a beacon, which the harness does not count as a request), so
  // it lands ~150 ms AFTER the press every time. The request STARTED before the press; dating it by its answer would credit it.
  '/f2b': page('<button id=dev>Develop</button>', `
    fetch('/api/held');
    document.addEventListener('click', () => navigator.sendBeacon('/api/clicked'));`),
  // F2c: an unrelated beacon 900 ms after ANY click; Save is a button that really sends a request, Develop is inert.
  '/f2c': page('<button id=dev>Develop</button><button id=save>Save</button>', `
    document.addEventListener('click', () => setTimeout(() => fetch('/api/beacon'), 900));
    document.getElementById('save').onclick = () => { fetch('/api/save', { method: 'POST' }); };`),
  // F3: a request that does not finish while the press is made (a hung call): the page never settles.
  '/f3': page('<button id=dev>Develop</button>', `fetch('/api/forever');`),
  // F6: a control that is listed and never pressed: a link off the product is not followed.
  '/f6': page('<a href="https://example.org/x">Elsewhere</a>'),
  // F8: a disabled control "says why" only with text that is not its own name.
  '/f8a': page('<button disabled title="Save">Save</button>'),
  '/f8b': page('<button disabled title="Write a sentence first">Save</button>'),
  '/f8c': page('<button disabled title="Archive"><svg width="16" height="16"></svg></button>'),
  '/f8d': page('<button disabled aria-label="Save the draft" title="Save">Save</button>'),
  '/f8e': page('<button disabled title="Save" aria-description="Write something first">Save</button>'),
  // F8f-h: a name longer than 80 characters. The title repeats it (f8f, and f8g where the title is the ONLY name), or says more (f8h).
  '/f8f': page(`<button disabled title="${LONG}">${LONG}</button>`),
  '/f8g': page(`<button disabled title="${LONG}"><svg width="16" height="16"></svg></button>`),
  '/f8h': page(`<button disabled title="${LONG}, once you have written a sentence">${LONG}</button>`),
};
const DELAYS = { '/api/create': 2200, '/api/late': 2600, '/api/save': 30, '/api/beacon': 20, '/api/forever': 12000 };

const held = [];     // answers to /api/held, released 150 ms after the page reports a click
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/api/held') { held.push(res); res.on('close', () => { const i = held.indexOf(res); if (i >= 0) held.splice(i, 1); }); return undefined; }
  if (u.pathname === '/api/clicked') { res.writeHead(204); res.end(); setTimeout(() => { for (const r of held.splice(0)) { r.writeHead(200, { 'content-type': 'application/json' }); r.end('{}'); } }, 150); return undefined; }
  if (PAGES[u.pathname]) { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(PAGES[u.pathname]); }
  if (DELAYS[u.pathname] !== undefined) {
    const t = setTimeout(() => { res.writeHead(200, { 'content-type': 'application/json' }); res.end('{}'); }, DELAYS[u.pathname]);
    req.on('close', () => clearTimeout(t));
    return undefined;
  }
  res.writeHead(404); return res.end('no');
});

const SCENARIOS = [
  // [name, path, parent label | null, control label, want, options passed to pressAndObserve, evidence must match, was a click delivered?]
  ['F1  Home pressed after Begin, while the Work is still being made, is not credited with the landing', '/f1', 'Begin', 'Home', DEAD_END, {}, /nothing happened/, true],
  ['F1c a button whose own handler changes the address and the text is still a PASS', '/f1real', null, 'Go', PASS, {}, /led to \/f1real\?opened=1/, true],
  ['F2a an inert button is a DEAD END when the page’s own request (started before the press) answers during the window', '/f2a', null, 'Develop', DEAD_END, {}, /nothing happened/, true],
  ['F2b ...and when it answers just AFTER the press and the harness never saw it start (no tracker handed in): never credited', '/f2b', null, 'Develop', DEAD_END, { noFlight: true, stillMs: 200 }, /not started by the press|nothing happened/, true],
  ['F2c an inert button is a DEAD END when an unrelated beacon fires 900 ms after the click, and the evidence names it', '/f2c', null, 'Develop', DEAD_END, {}, /not counted, not started by the press: GET \/api\/beacon/, true],
  ['F2d a button that really sends a request (and shows nothing else) is a PASS: the request is the press’s', '/f2c', null, 'Save', PASS, {}, /POST \/api\/save answered HTTP 200/, true],
  ['F3  a press made while a request never finishes is NOT RUN, never a verdict', '/f3', null, 'Develop', NOT_RUN, { stillCapMs: 1500 }, /still moving/, true],
  // F6: only a control a click was delivered to is pressed; the rest are listed, not pressed.
  ['F6  a link off the product is not followed, and is NOT pressed', '/f6', null, 'Elsewhere', NOT_RUN, {}, /points off the product/, false],
  // F8: a disabled control that only repeats its own name does not say why; one that explains does. Neither is pressed.
  ['F8a a disabled button whose title repeats its label does not say why: NOT RUN', '/f8a', null, 'Save', NOT_RUN, {}, /nothing on it says why/, false],
  ['F8b a disabled button whose title differs from its label says why: PASS', '/f8b', null, 'Save', PASS, {}, /says why: "Write a sentence first"/, false],
  ['F8c an icon button whose only name IS its title does not say why: NOT RUN', '/f8c', null, 'Archive', NOT_RUN, {}, /nothing on it says why/, false],
  ['F8d a title that repeats the visible text under a longer aria-label does not say why: NOT RUN', '/f8d', null, 'Save the draft', NOT_RUN, {}, /nothing on it says why/, false],
  ['F8e when the title repeats the name but an aria-description explains, it says why: PASS', '/f8e', null, 'Save', PASS, {}, /says why: "Write something first"/, false],
  ['F8f a title that repeats a name LONGER than 80 characters does not say why: NOT RUN (the repeat must not look different because the name is shown clipped)', '/f8f', null, SHOWN, NOT_RUN, {}, /nothing on it says why/, false],
  ['F8g ...nor when that title is the control\u2019s only name (an icon button)', '/f8g', null, SHOWN, NOT_RUN, {}, /nothing on it says why/, false],
  ['F8h a title that continues a long name with an actual explanation says why: PASS', '/f8h', null, SHOWN, PASS, {}, /says why: "Save everything you have written/, false],
];

/** A person waits for a control that mounts late (the F1 page shows Home only after Begin is pressed); so does this check. */
async function waitForLabel(p, label, ms) {
  const t0 = Date.now();
  for (;;) {
    const c = (await enumerateControls(p)).controls.find(x => x.label === label);
    if (c) return c;
    if (Date.now() - t0 >= ms) return null;
    await p.waitForTimeout(400);
  }
}

async function run() {
  if (!findChromium()) { console.log('COULD NOT RUN: no Chromium found (set JL_CHROMIUM, or install one Playwright can drive); nothing is claimed'); return 64; }
  let browser;
  try { browser = await launch(); } catch (e) { console.log(`COULD NOT RUN: the browser did not start (${String(e.message).split('\n')[0]}); nothing is claimed`); return 64; }
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://localhost:${server.address().port}`;
  const origin = new URL(base).origin;
  let bad = 0;
  try {
    for (const [name, path, parent, label, want, opts, evidenceRe, wantPressed] of SCENARIOS) {
      const blocked = [];
      const ctx = await newContext(browser, base, blocked);
      const p = await ctx.newPage();
      let got = null; let evidence = ''; let pressed = null;
      try {
        const flight = trackInFlight(p, origin);
        await gotoRetrying(p, path);
        await settle(p, { quietMs: 1500, capMs: 30000 });
        if (parent) {
          const { controls } = await enumerateControls(p);
          const pc = controls.find(c => c.label === parent);
          await p.locator(`[data-jl="${pc.idx}"]`).click();
          await settle(p, { quietMs: 1000, capMs: 15000, inflight: flight });     // the persona's replay settle
        }
        const c = await waitForLabel(p, label, 10000);
        if (!c) { got = 'control missing'; }
        else {
          const { noFlight, ...rest } = opts;
          const obs = await pressAndObserve(p, ctx, c, { base, modelLog: '/nonexistent/jl-model.log', windowMs: 2500, flight: noFlight ? null : flight, ...rest });
          ({ status: got, evidence } = classifyTrial(obs));
          pressed = obs.pressed;
        }
      } catch (e) { got = `error: ${String(e.message).split('\n')[0]}`; }
      finally { await ctx.close().catch(() => {}); }
      const ok = got === want && evidenceRe.test(evidence) && pressed === wantPressed;
      if (!ok) bad += 1;
      console.log(`${ok ? 'ok     ' : 'WRONG  '} ${name}\n         got ${got}${got === want ? '' : `, wanted ${want}`}; click delivered: ${pressed}${pressed === wantPressed ? '' : ` (wanted ${wantPressed})`}: ${evidence.slice(0, 200)}`);
    }
  } finally {
    await browser.close().catch(() => {});
    server.closeAllConnections?.();
    await new Promise(r => server.close(r));
  }
  console.log(bad === 0 ? `\nall ${SCENARIOS.length} scenarios judged as expected` : `\n${bad} of ${SCENARIOS.length} scenarios misjudged`);
  return bad === 0 ? 0 : 1;
}
process.exit(await run());
