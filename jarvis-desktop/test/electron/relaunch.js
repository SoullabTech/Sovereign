// JARVIS-STAB-07 — second launch. A genuinely new Electron process, same store.
// Proves the run and its evidence reconstruct after the app was quit.
const { app, ipcMain } = require('electron');
const fs = require('node:fs');

const OUT = process.env.JARVIS_PROOF_OUT;
const EXPECT = JSON.parse(process.env.JARVIS_EXPECT);
const results = [];
const check = (name, ok, detail) => results.push({ name, ok: !!ok, detail: ok ? null : String(detail ?? '').slice(0, 400) });

async function invoke(channel, ...args) {
  const h = ipcMain._invokeHandlers.get(channel);
  if (!h) throw new Error(`channel '${channel}' is not registered`);
  return h({}, ...args);
}

app.whenReady().then(async () => {
  try {
    const listed = await invoke('jarvis:list-runs', { limit: 50 });
    check('a RELAUNCHED app reads the durable store', listed.custody, listed.reason);
    const r1 = listed.runs.find((r) => r.run_id === EXPECT.run_id);
    const r2 = listed.runs.find((r) => r.run_id === EXPECT.run2);
    check('the first run reconstructs after quit', !!r1, JSON.stringify(listed.runs.map((r) => r.run_id)));
    check('its task survives the quit', r1 && r1.task.description === 'STAB-07 Electron walk — bounded C3 task', JSON.stringify(r1 && r1.task));
    check('its lane and status survive', r1 && r1.lane === 'C3' && r1.state === 'ROUTED_NOT_EXECUTED', r1 && r1.state);
    check('its handoff base survives', r1 && r1.handoff && !!r1.handoff.bases.candidate_sha);
    check('its evidence survives, still CURRENT and CONFIRMED',
      r1 && r1.evidence && r1.evidence.currency === 'CURRENT' && r1.evidence.currency_confirmed === true,
      JSON.stringify(r1 && r1.evidence && { c: r1.evidence.currency, k: r1.evidence.currency_confirmed }));
    check('claim AND non_claim both survive',
      r1 && r1.evidence.claim && r1.evidence.non_claim && /does NOT establish/.test(r1.evidence.non_claim));
    check('the drifted run is STILL HISTORICAL after a relaunch',
      r2 && r2.evidence && r2.evidence.currency === 'HISTORICAL', JSON.stringify(r2 && r2.evidence && r2.evidence.currency));
    check('drift did not silently become current on reload', r2 && !!r2.evidence.base_drift);
    check('routing determinism holds across both launches', listed.determinism.deterministic, JSON.stringify(listed.determinism.violations));
    check('no run was left claiming to be in flight',
      listed.runs.every((r) => !['ROUTED', 'EXECUTING'].includes(r.state)), JSON.stringify(listed.runs.map((r) => r.state)));
    fs.writeFileSync(OUT, JSON.stringify({ results }, null, 2));
  } catch (e) {
    results.push({ name: 'relaunch harness completed without throwing', ok: false, detail: `${e.message}\n${e.stack}`.slice(0, 800) });
    try { fs.writeFileSync(OUT, JSON.stringify({ results }, null, 2)); } catch { /* nothing left */ }
  }
  app.exit(0);
});
