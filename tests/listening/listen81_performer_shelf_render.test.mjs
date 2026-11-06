// LISTEN-01 · "Listen to someone" — behaviour witness in jsdom (NOT a real browser, NOT a device).
// Renders the real components (bundled with esbuild, React 19) against fictional entries and fake
// platform players. The fake YouTube player has NO play/resume method at all, so any attempt by the
// component to start sound would throw — the strongest runtime witness available here that Soullab
// never starts a performer's sound. A real-browser (Chrome/WebKit) witness against the real
// platforms and a device witness remain OWED before any entry is shown to a member.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import * as esbuild from 'esbuild';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '../..');
const NOW = new Date('2026-11-06T12:00:00Z');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const entry = (over = {}) => ({
  id: 'fictional-performer-one', shelf: 'picks', name: 'Fictional Performer One',
  ownWords: 'Slow piano and low synth, recorded live in a room.',
  links: [
    { kind: 'youtube', url: 'https://www.youtube.com/watch?v=FICTIONAL01' },
    { kind: 'site', url: 'https://fictional-performer.example.org/music' },
  ],
  embed: { provider: 'youtube', ref: 'FICTIONAL01' },
  rights: { hosting: 'provider-hosted-pointer', embedPermitted: true, embedCheckedOn: '2026-11-06',
    nextCheckBy: '2027-02-06', signedOffBy: 'Fictional Signer', signedOffOn: '2026-11-06', lineageHeld: false },
  ...over,
});

let dom, mod, tmp, fetchCalls = 0;
const players = [];
const lockState = { held: false };

function installFakeLocks(on) {
  const locks = on ? {
    request: (name, opts, cb) => {
      if (opts && opts.ifAvailable && lockState.held) return Promise.resolve(cb(null));
      lockState.held = true;
      return Promise.resolve(cb({ name })).finally(() => { lockState.held = false; });
    },
  } : undefined;
  Object.defineProperty(dom.window.navigator, 'locks', { value: locks, configurable: true });
}
class FakeYouTubePlayer { // pause + destroy only: if the component ever tries to start sound this throws
  constructor(el, opts) {
    this.opts = opts; this.pauseCalls = 0; this.destroyed = false; players.push(this);
    el.setAttribute('data-fake-youtube', opts.videoId);
  }
  pauseVideo() { this.pauseCalls += 1; }
  destroy() { this.destroyed = true; }
}

before(async () => {
  dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://soullab.test/listen', pretendToBeVisual: true });
  const g = globalThis;
  for (const k of ['window', 'document', 'HTMLElement', 'Node', 'CustomEvent', 'MutationObserver', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame']) {
    Object.defineProperty(g, k, { value: k === 'window' ? dom.window : (k === 'document' ? dom.window.document : dom.window[k]), configurable: true, writable: true });
  }
  Object.defineProperty(g, 'navigator', { value: dom.window.navigator, configurable: true });
  dom.window.BroadcastChannel = g.BroadcastChannel;
  // The component code uses the bare `Event` / `CustomEvent` globals (Node's) with window.dispatchEvent
  // (jsdom's). CustomEvent is jsdom's here so `instanceof CustomEvent` holds as it does in a browser; the bare
  // Node `Event` stays (BroadcastChannel needs it) and is bridged into jsdom by the dispatch wrapper below.
  const origDispatch = dom.window.dispatchEvent.bind(dom.window);
  dom.window.dispatchEvent = ev => origDispatch(ev instanceof dom.window.Event ? ev
    : ev.detail !== undefined && ev.detail !== null ? new dom.window.CustomEvent(ev.type, { detail: ev.detail }) : new dom.window.Event(ev.type));
  g.IS_REACT_ACT_ENVIRONMENT = true;
  g.fetch = () => { fetchCalls += 1; throw new Error('the shelf must not use the network'); };
  dom.window.YT = { Player: FakeYouTubePlayer };
  installFakeLocks(true);

  // Inside the worktree (not os.tmpdir) so the bundle's `react` imports resolve to the real CommonJS React:
  // its act() then schedules with timers.setImmediate instead of leaking a MessageChannel per call.
  tmp = fs.mkdtempSync(path.join(root, '.listen81-'));
  const entrySource = [
    `import React from 'react'; import ReactDOMClient from 'react-dom/client';`,
    `export const h = React.createElement; export const act = React.act; export const createRoot = ReactDOMClient.createRoot;`,
    `export { default as PerformerShelf, PerformerNowEntry } from ${JSON.stringify(path.join(root, 'components/listening/PerformerShelf.tsx'))};`,
    `export { beginMaiaSpeechLease, endMaiaSpeechLease } from ${JSON.stringify(path.join(root, 'lib/listening/maiaSpeechFocus.ts'))};`,
    `export { SOULLAB_SESSION_END_EVENT, SOULLAB_AUDIO_FOCUS_EVENT, SOULLAB_AUDIO_TAB_CHANNEL } from ${JSON.stringify(path.join(root, 'lib/listening/audioFocus.ts'))};`,
  ].join('\n');
  const out = await esbuild.build({
    stdin: { contents: entrySource, resolveDir: root, loader: 'js' }, bundle: true, format: 'esm', platform: 'node', write: false, jsx: 'automatic',
    external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    plugins: [{
      name: 'listen81', setup(b) {
        b.onResolve({ filter: /^@\// }, a => b.resolve(path.join(root, a.path.slice(2)), { kind: a.kind, resolveDir: root }));
        b.onResolve({ filter: /\.module\.css$/ }, a => ({ path: a.path, namespace: 'css-stub' }));
        b.onLoad({ filter: /.*/, namespace: 'css-stub' }, () => ({ contents: 'export default new Proxy({}, { get: (_, k) => String(k) });', loader: 'js' }));
      },
    }],
    absWorkingDir: root,
  });
  const file = path.join(tmp, 'bundle.mjs');
  fs.writeFileSync(file, out.outputFiles[0].text);
  mod = await import(pathToFileURL(file).href);
});
after(async () => {
  dom.window.close();
  fs.rmSync(tmp, { recursive: true, force: true });
  if (typeof esbuild.stop === 'function') await esbuild.stop(); // not exposed by every esbuild version
});

async function mount(element) {
  const container = dom.window.document.createElement('div');
  dom.window.document.body.appendChild(container);
  const rootNode = mod.createRoot(container);
  await mod.act(async () => { rootNode.render(element); });
  return { container, rootNode, unmount: async () => { await mod.act(async () => { rootNode.unmount(); }); container.remove(); } };
}
const text = el => {
  const walker = dom.window.document.createTreeWalker(el, 4);
  const parts = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) { const t = n.nodeValue.trim(); if (t) parts.push(t); }
  return parts.join(' ').replace(/\s+([.,;:!?])/g, '$1');
};

// ---------------------------------------------------------------- the honest empty state

test('empty catalog: the teaser is plain text — no link, button, player, image or script, no network', async () => {
  const scriptsBefore = dom.window.document.querySelectorAll('script').length;
  const { container, unmount } = await mount(mod.h(mod.PerformerNowEntry, { catalog: [], now: NOW, onOpen: () => { throw new Error('must not open'); } }));
  assert.equal(container.querySelector('[data-performer-teaser="in-preparation"]') !== null, true);
  assert.match(text(container), /Listen to someone In preparation A shelf for the people behind the sound — each one credited, each linked to where they share their work\./);
  assert.equal(container.querySelectorAll('a, button, iframe, img, video, audio, script, input').length, 0);
  assert.equal(dom.window.document.querySelectorAll('script').length, scriptsBefore);
  assert.equal(fetchCalls, 0);
  await unmount();
});

test('the shipped (empty) catalog renders the same teaser and the shelf view shows no performer', async () => {
  const a = await mount(mod.h(mod.PerformerNowEntry, { onOpen: () => {} }));
  assert.equal(a.container.querySelector('[data-performer-teaser="in-preparation"]') !== null, true);
  await a.unmount();
  const b = await mount(mod.h(mod.PerformerShelf, {}));
  assert.match(text(b.container), /IN PREPARATION Listen to someone/);
  assert.equal(b.container.querySelectorAll('article, a, button, iframe').length, 0);
  await b.unmount();
});

test('an entry that fails the gate (overdue check) is hidden and the teaser returns', async () => {
  const overdue = entry({ rights: { ...entry().rights, embedCheckedOn: '2026-01-01', nextCheckBy: '2026-06-01' } });
  const { container, unmount } = await mount(mod.h(mod.PerformerNowEntry, { catalog: [overdue], now: NOW, onOpen: () => {} }));
  assert.equal(container.querySelector('[data-performer-teaser="in-preparation"]') !== null, true);
  assert.doesNotMatch(text(container), /Fictional Performer One/);
  await unmount();
});

// ---------------------------------------------------------------- a signed entry

test('an approved fictional entry: credit, our words, links, disclosure — and nothing is loaded yet', async () => {
  const before = dom.window.document.querySelectorAll('script, iframe').length;
  const { container, unmount } = await mount(mod.h(mod.PerformerShelf, { catalog: [entry()], now: NOW }));
  const t = text(container);
  assert.match(t, /WHAT WE’RE LISTENING TO/);
  assert.match(t, /Fictional Performer One/);
  assert.match(t, /Slow piano and low synth, recorded live in a room\./);
  assert.match(t, /Where to find more of their work/);
  assert.doesNotMatch(t, /support them/i);
  const anchors = [...container.querySelectorAll('a')];
  assert.deepEqual(anchors.map(a => a.textContent), ['YouTube', 'Their own site']);
  for (const a of anchors) { assert.equal(a.getAttribute('rel'), 'noopener noreferrer'); assert.equal(a.getAttribute('target'), '_blank'); assert.ok(a.getAttribute('href').startsWith('https://')); }
  assert.match(t, /Play here/);
  assert.match(t, /Playing this loads YouTube\./);
  assert.equal(container.querySelectorAll('img, iframe, video, audio').length, 0, 'no provider artwork or player before the member presses Play here');
  assert.equal(dom.window.document.querySelectorAll('script, iframe').length, before, 'nothing is requested from the platform on load');
  assert.equal(players.length, 0);
  await unmount();
});

test('Tier 2: the performer\'s own words are shown as theirs, under "In their own words"', async () => {
  const t2 = entry({ tierTwo: { grantOnFile: '2026-11-06', ownIntroduction: 'I make quiet music for long evenings.' } });
  const { container, unmount } = await mount(mod.h(mod.PerformerShelf, { catalog: [t2], now: NOW }));
  const fig = container.querySelector('figure');
  assert.ok(fig);
  assert.match(text(fig), /In their own words I make quiet music for long evenings\./);
  await unmount();
});

test('inside the native app the platform player is not offered; the links remain', async () => {
  dom.window.Capacitor = { isNativePlatform: () => true };
  const { container, unmount } = await mount(mod.h(mod.PerformerShelf, { catalog: [entry()], now: NOW }));
  assert.doesNotMatch(text(container), /Play here/);
  assert.equal(container.querySelectorAll('a').length, 2);
  delete dom.window.Capacitor;
  await unmount();
});

// ---------------------------------------------------------------- the audio contract in motion

async function press(container) {
  const button = [...container.querySelectorAll('button')].find(b => /Play here/.test(b.textContent));
  assert.ok(button, 'Play here button');
  await mod.act(async () => { button.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })); await sleep(20); });
  return players[players.length - 1];
}
const fireState = async (player, code) => { await mod.act(async () => { player.opts.events.onStateChange({ data: code }); await sleep(220); }); };

test('Play here loads only the platform player (autoplay off); the member presses ITS button; the lease is taken', async () => {
  installFakeLocks(true);
  const { container, unmount } = await mount(mod.h(mod.PerformerShelf, { catalog: [entry()], now: NOW }));
  const player = await press(container);
  assert.ok(player, 'fake player created');
  assert.equal(player.opts.videoId, 'FICTIONAL01');
  assert.equal(player.opts.playerVars.autoplay, 0);
  assert.equal(player.opts.host, 'https://www.youtube-nocookie.com');
  assert.equal(lockState.held, false, 'no lease while nothing plays');
  await fireState(player, 1); // the member pressed the platform's own play button
  assert.equal(lockState.held, true, 'the shared audio lease is held while it plays');
  assert.equal(player.pauseCalls, 0);
  await fireState(player, 2); // paused
  assert.equal(lockState.held, false, 'released on every non-playing state');
  await unmount();
  assert.equal(player.destroyed, true, 'unmount destroys the player');
});

test('first sound without the lease (busy, or no Web Locks) is paused at once and says why — fail closed', async () => {
  installFakeLocks(true);
  lockState.held = true; // another output (MAIA, Reader or the Sound Field) holds the lease
  const busy = await mount(mod.h(mod.PerformerShelf, { catalog: [entry()], now: NOW }));
  const p1 = await press(busy.container);
  await fireState(p1, 1);
  assert.equal(p1.pauseCalls, 1);
  assert.match(text(busy.container), /Another sound is playing, or this browser cannot share sound safely/);
  await busy.unmount();
  lockState.held = false;

  installFakeLocks(false); // browser without Web Locks
  const bare = await mount(mod.h(mod.PerformerShelf, { catalog: [entry()], now: NOW }));
  const p2 = await press(bare.container);
  await fireState(p2, 1);
  assert.equal(p2.pauseCalls, 1);
  await bare.unmount();
  installFakeLocks(true);
});

test('MAIA speaking pauses it even when the lease is free', async () => {
  installFakeLocks(true);
  const sym = Symbol('maia');
  mod.beginMaiaSpeechLease(sym);
  const { container, unmount } = await mount(mod.h(mod.PerformerShelf, { catalog: [entry()], now: NOW }));
  const p = await press(container);
  await fireState(p, 1);
  assert.equal(p.pauseCalls, 1);
  assert.match(text(container), /MAIA is speaking/);
  assert.equal(lockState.held, false);
  mod.endMaiaSpeechLease(sym);
  await unmount();
});

test('a MAIA / Reader / music preflight from another tab, and a focus request, pause it and free the lease', async () => {
  installFakeLocks(true);
  const { container, unmount } = await mount(mod.h(mod.PerformerShelf, { catalog: [entry()], now: NOW }));
  const p = await press(container);
  await fireState(p, 1);
  assert.equal(lockState.held, true);
  const other = new BroadcastChannel(mod.SOULLAB_AUDIO_TAB_CHANNEL);
  await mod.act(async () => { other.postMessage({ type: 'maia-speech-preflight', version: 2, tab: 'another-tab' }); await sleep(60); });
  other.close();
  assert.equal(p.pauseCalls, 1, 'paused by the MAIA preflight');
  assert.equal(lockState.held, false, 'lease released so MAIA can start');
  await fireState(p, 1); // the member presses play again — a new member act
  assert.equal(lockState.held, true);
  await mod.act(async () => { dom.window.dispatchEvent(new dom.window.CustomEvent(mod.SOULLAB_AUDIO_FOCUS_EVENT, { detail: { source: 'reader-narration' } })); await sleep(20); });
  assert.equal(p.pauseCalls, 2, 'paused by the Reader focus request');
  await unmount();
});

test('it never resumes by itself: after a pause no further sound arrives unless the member presses play', async () => {
  installFakeLocks(true);
  const { container, unmount } = await mount(mod.h(mod.PerformerShelf, { catalog: [entry()], now: NOW }));
  const p = await press(container);
  await fireState(p, 1);
  const other = new BroadcastChannel(mod.SOULLAB_AUDIO_TAB_CHANNEL);
  await mod.act(async () => { other.postMessage({ type: 'music-preflight', version: 2, tab: 'another-tab' }); await sleep(60); });
  other.close();
  const calls = p.pauseCalls;
  await mod.act(async () => { await sleep(300); });
  assert.equal(p.pauseCalls, calls);
  assert.equal(lockState.held, false);
  assert.equal(typeof p.playVideo, 'undefined', 'the fake player has no play method for the component to call');
  await unmount();
});

test('session end closes the player; a platform error falls back to the links', async () => {
  installFakeLocks(true);
  const a = await mount(mod.h(mod.PerformerShelf, { catalog: [entry()], now: NOW }));
  const p = await press(a.container);
  await fireState(p, 1);
  await mod.act(async () => { dom.window.dispatchEvent(new dom.window.Event(mod.SOULLAB_SESSION_END_EVENT)); await sleep(20); });
  assert.equal(p.destroyed, true);
  assert.equal(lockState.held, false);
  await a.unmount();

  const b = await mount(mod.h(mod.PerformerShelf, { catalog: [entry()], now: NOW }));
  const q = await press(b.container);
  await mod.act(async () => { q.opts.events.onError({ data: 153 }); await sleep(20); });
  assert.match(text(b.container), /could not start here\. You can listen on YouTube instead\./);
  assert.equal(b.container.querySelectorAll('a').length, 2, 'the links remain');
  await b.unmount();
  assert.equal(fetchCalls, 0, 'no network use by the shelf itself');
});
