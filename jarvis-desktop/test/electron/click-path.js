// JARVIS-STAB-07b — the founder click path.
//
// STAB-07 drove the registered ipcMain handlers directly. That proved main
// registers them and that they behave, but it could not prove the INTERFACE
// reaches them: a button wired to nothing, or to a channel that does not exist,
// passes an in-process IPC walk untouched. It found exactly that — ingestReceipt
// was on the preload bridge and no renderer code called it.
//
// So this harness clicks. Real BrowserWindow, real index.html, real preload with
// contextIsolation, real renderer.js. Nothing is invoked on the renderer's
// behalf: every step below is a DOM event, and what is asserted is what the
// founder would see on screen plus what ended up in the canonical store.
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const OUT = process.env.JARVIS_PROOF_OUT;
const AIN = process.env.AIN_DELEGATION_HOME;
const results = [];
const check = (name, ok, detail) => results.push({ name, ok: !!ok, detail: ok ? null : String(detail ?? '').slice(0, 400) });

// Injected into the page. Polls rather than guessing at timings: the renderer's
// init is asynchronous, and a fixed sleep would make this proof flaky in a way
// that teaches nothing.
const DRIVER = `
(async () => {
  const wait = async (fn, ms = 15000) => {
    const t0 = Date.now();
    for (;;) {
      try { const v = fn(); if (v) return v; } catch (e) { /* not ready */ }
      if (Date.now() - t0 > ms) throw new Error('timed out waiting for: ' + fn.toString().slice(0, 120));
      await new Promise((r) => setTimeout(r, 50));
    }
  };
  const q = (sel) => document.querySelector(sel);
  const txt = (sel) => (q(sel) || {}).innerText || '';
  const out = {};

  out.bridge = typeof window.jarvis === 'object' && typeof window.jarvis.ingestReceipt === 'function';
  out.no_node = typeof window.require === 'undefined' && typeof window.process === 'undefined';

  // ── submit a bounded C3 task, by clicking ────────────────────────────────
  (await wait(() => q('nav button[data-view="work"]'))).click();
  const lane = await wait(() => q('#lane-hint'));
  lane.value = 'c3';
  lane.dispatchEvent(new Event('change'));
  (await wait(() => q('#description'))).value = 'STAB-07b click-path bounded task';
  q('#ho-unit').value = 'CLICK-PATH-01';
  q('#ho-allowed').value = 'jarvis-desktop/**';
  q('#ho-acceptance').value = 'the click path completes';
  q('#submit').click();

  out.result = await wait(() => txt('#result').includes('Run ID') && txt('#result'));
  out.run_id = (out.result.match(/r-[0-9a-f]{10}/) || [])[0] || null;

  // ── Open in Claude Code, by clicking ─────────────────────────────────────
  (await wait(() => q('#open-in-cc'))).click();
  out.handoff = await wait(() => txt('#handoff-out').includes('Packet') && txt('#handoff-out'));

  // ── the run appears in durable history, by clicking ──────────────────────
  (await wait(() => q('nav button[data-view="runs"]'))).click();
  out.runs_before = await wait(() => txt('#main').includes(out.run_id) && txt('#main'));
  out.has_ingest_button = !!q('button.ingest[data-run="' + out.run_id + '"]');
  return out;
})()
`;

const INGEST = (runId) => `
(async () => {
  const wait = async (fn, ms = 15000) => {
    const t0 = Date.now();
    for (;;) {
      try { const v = fn(); if (v) return v; } catch (e) {}
      if (Date.now() - t0 > ms) throw new Error('timed out');
      await new Promise((r) => setTimeout(r, 50));
    }
  };
  const q = (s) => document.querySelector(s);
  const btn = await wait(() => q('button.ingest[data-run="${runId}"]'));
  btn.click();
  // Scoped to THIS run. Reading #main would match any other run's evidence card
  // and report a pass for work this click never did — which is exactly what the
  // first version of this proof did.
  return await wait(() => {
    const err = q('#ingest-out-${runId}');
    const errTxt = err ? err.innerText.trim() : '';
    if (errTxt) return 'REFUSED::' + errTxt;
    const card = q('#run-${runId}');
    const cardTxt = card ? card.innerText : '';
    if (cardTxt.includes('Evidence currency')) return 'ACCEPTED::' + cardTxt;
    return null;
  });
})()
`;

app.whenReady().then(async () => {
  try {
    const win = await new Promise((resolve) => {
      const t = setInterval(() => {
        const w = BrowserWindow.getAllWindows()[0];
        if (w) { clearInterval(t); resolve(w); }
      }, 50);
    });
    if (win.webContents.isLoading()) await new Promise((r) => win.webContents.once('did-finish-load', r));

    const d = await win.webContents.executeJavaScript(DRIVER);

    check('the preload bridge is present in the real page', d.bridge);
    check('the renderer has no node access', d.no_node);
    check('clicking Submit produced a run', !!d.run_id, d.result.slice(0, 200));
    check('the run id is shown on screen', d.result.includes(d.run_id));
    check('custody is shown as RECORDED', /RECORDED/.test(d.result), d.result.slice(0, 300));
    check('the C3 lane is shown', /C3/.test(d.result));
    check('routed_not_executed is shown — the UI promises no execution', /routed_not_executed/.test(d.result));
    check('clicking Open in Claude Code wrote a packet', /Packet/.test(d.handoff) && /COPIED/.test(d.handoff), d.handoff.slice(0, 200));
    check('the packet path is shown on screen', /\/packets\//.test(d.handoff), d.handoff.slice(0, 200));
    check('the packet is really on disk where the UI says', (() => {
      const m = d.handoff.match(/(\S+\/packets\/\S+\.txt)/);
      return m && fs.existsSync(m[1]);
    })(), d.handoff.slice(0, 200));
    check('the run is listed in the Runs view', d.runs_before.includes(d.run_id));
    check('an un-evidenced run offers an ingest action', d.has_ingest_button);

    // ── a REFUSAL, seen on screen ────────────────────────────────────────────
    const rp = path.join(AIN, 'runtime', 'receipts', `${d.run_id}.json`);
    fs.mkdirSync(path.dirname(rp), { recursive: true });
    const runFile = path.join(AIN, 'runtime', 'runs', `${d.run_id}.json`);
    const before = fs.readFileSync(runFile, 'utf8');
    fs.writeFileSync(rp, JSON.stringify({ run_id: d.run_id, claim: 'I did it' }), 'utf8');
    const refused = await win.webContents.executeJavaScript(INGEST(d.run_id));
    check('clicking ingest on a bad receipt shows the refusal ON SCREEN',
      refused.startsWith('REFUSED::') && /MISSING_REQUIRED_FIELD/.test(refused), refused.slice(0, 300));
    check('the refusal names non_claim as the reason', /non_claim/.test(refused), refused.slice(0, 400));
    check('the persisted run is byte-identical after a refused click',
      fs.readFileSync(runFile, 'utf8') === before);

    // ── acceptance, seen on screen ───────────────────────────────────────────
    const base = JSON.parse(before).handoff.bases.candidate_sha;
    fs.writeFileSync(rp, JSON.stringify({
      run_id: d.run_id, base_sha: base, branch: 'click-path', tests: 'n/a',
      observations: [{ field: 'production_sha', value: '64c2b7c07', freshness: 'CARRIED', verified_at: '2026-08-26T18:04:00Z', verified_by: 'prior deploy witness' }],
      claim: 'The click path reached the store.',
      non_claim: 'It establishes nothing about the packaged macOS app.',
      next_boundary: 'PKG-01',
    }), 'utf8');
    const accepted = await win.webContents.executeJavaScript(INGEST(d.run_id));
    check('clicking ingest on a good receipt renders the evidence',
      accepted.startsWith('ACCEPTED::') && /Evidence currency/.test(accepted), accepted.slice(0, 300));
    check('currency is rendered CURRENT', /CURRENT/.test(accepted), accepted.slice(0, 400));
    check('the claim is on screen', /The click path reached the store/.test(accepted));
    check('the NOT-established bound is on screen', /establishes nothing about the packaged/.test(accepted));
    check('the evidence really reached the store',
      JSON.parse(fs.readFileSync(runFile, 'utf8')).evidence_received === true);
    check('and its currency was confirmed, not left provisional',
      JSON.parse(fs.readFileSync(runFile, 'utf8')).evidence.currency_confirmed === true);

    fs.writeFileSync(OUT, JSON.stringify({ results, run_id: d.run_id }, null, 2));
  } catch (e) {
    results.push({ name: 'click-path harness completed without throwing', ok: false, detail: `${e.message}\n${e.stack}`.slice(0, 900) });
    try { fs.writeFileSync(OUT, JSON.stringify({ results }, null, 2)); } catch { /* nothing left */ }
  }
  app.exit(0);
});
