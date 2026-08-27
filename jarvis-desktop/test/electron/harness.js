// JARVIS-STAB-07 (Electron half) — in-process harness.
//
// This file is loaded INSIDE the real Electron main process, by the real
// `electron .`-equivalent entry, AFTER src/main.js has registered its IPC
// handlers. It drives those handlers through the same channel names the preload
// exposes, then reports.
//
// WHY IN-PROCESS AND NOT A UI ROBOT. The claim being proved is that the
// renderer → preload → main → canonical-store path uses the stabilized custody
// machinery. Clicking pixels would prove the same handlers plus a layout, and
// would fail for reasons that have nothing to do with custody. What is exercised
// here is: the real Electron runtime, the real main.js module (not a re-import
// of its parts), the real registered ipcMain handlers, the real store on disk.
//
// WHAT THIS DOES NOT PROVE, stated so it is not assumed: that the DOM wires the
// buttons to those channels. That is asserted separately and statically by the
// preload/renderer checks in verify.mjs.
const { app, ipcMain } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const OUT = process.env.JARVIS_PROOF_OUT;
const REPO = process.env.JARVIS_REPO_ROOT;
const results = [];
const check = (name, ok, detail) => results.push({ name, ok: !!ok, detail: ok ? null : String(detail ?? '').slice(0, 400) });

// Invoke a registered handler exactly as ipcRenderer.invoke would reach it.
// _invokeHandlers is Electron's own registry — going through it proves the
// handler was really REGISTERED by main.js, rather than calling a function we
// imported ourselves and merely hoping main registered the same one.
async function invoke(channel, ...args) {
  const h = ipcMain._invokeHandlers.get(channel);
  if (!h) throw new Error(`channel '${channel}' is not registered in this Electron main process`);
  return h({}, ...args);
}

const git = (...a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8' }).trim();

async function walk() {
  // ── the IPC surface really registered by the real main process ────────────
  const registered = [...ipcMain._invokeHandlers.keys()].filter((k) => k.startsWith('jarvis:')).sort();
  check('main.js registers exactly the reviewed channels',
    JSON.stringify(registered) === JSON.stringify([
      'jarvis:capabilities', 'jarvis:choose-repo', 'jarvis:clear-repo', 'jarvis:governance-action',
      'jarvis:handoff-packet', 'jarvis:ingest-receipt', 'jarvis:list-runs', 'jarvis:mechanism-status',
      'jarvis:repo-config', 'jarvis:reveal-workspace', 'jarvis:run-work-unit', 'jarvis:status',
      'jarvis:submit-task',
    ]), registered.join(', '));

  const status = await invoke('jarvis:status');
  check('the app resolved a repository substrate', !!status, 'no status returned');

  // ── 2. submit a real bounded task through the real handler ────────────────
  const task = { description: 'STAB-07 Electron walk — bounded C3 task' };
  const res = await invoke('jarvis:submit-task', task);
  check('C3 is selected', res.execution_lane === 'C3', JSON.stringify(res).slice(0, 200));
  check('C3 is still routed_not_executed — no auto-invocation', res.status === 'routed_not_executed', res.status);
  check('the run is under custody', res.custody && res.custody.recorded === true, JSON.stringify(res.custody));
  check('a durable run_id was issued', /^r-[0-9a-f]{10}$/.test(res.run_id || ''), res.run_id);
  const RUN_ID = res.run_id;

  // ── 3. the canonical run is persisted, on disk, by the real app ───────────
  const AIN = process.env.AIN_DELEGATION_HOME;
  const runFile = path.join(AIN, 'runtime', 'runs', `${RUN_ID}.json`);
  check('the real app persisted the run to the canonical store', fs.existsSync(runFile), runFile);
  const listed = await invoke('jarvis:list-runs', { limit: 50 });
  check('the run is served back through jarvis:list-runs',
    listed.custody && listed.runs.some((r) => r.run_id === RUN_ID), JSON.stringify(listed).slice(0, 200));

  // ── 7/8. Open in Claude Code → packet on disk + clipboard ─────────────────
  const BASE = git('rev-parse', '--short', 'HEAD');
  const hp = await invoke('jarvis:handoff-packet', {
    run_id: RUN_ID, unit: 'STAB-07-WALK', allowed: ['jarvis-desktop/**'],
    forbidden: ['no deploy'], acceptance: ['walk completes'], stop_condition: 'walk ends',
  });
  check('the handoff packet was produced', hp.ok, hp.reason);
  check('the packet is on disk', hp.path && fs.existsSync(hp.path), hp.path);
  const onDisk = hp.path ? fs.readFileSync(hp.path, 'utf8') : '';
  const { clipboard } = require('electron');
  check('clipboard content corresponds to THIS run', clipboard.readText() === onDisk && onDisk.includes(RUN_ID));
  check('the packet names the real current head as its base', hp.packet.candidate_sha.value === BASE, `${hp.packet.candidate_sha.value} vs ${BASE}`);
  check('the packet states the unit and its bounds',
    onDisk.includes('STAB-07-WALK') && onDisk.includes('jarvis-desktop/**') && onDisk.includes('no deploy'));
  check('the issued base was recorded on the run',
    JSON.parse(fs.readFileSync(runFile, 'utf8')).handoff.bases.candidate_sha === BASE);

  // ── 9/10. an invalid receipt through the founder's own path ───────────────
  const receiptPath = path.join(AIN, 'runtime', 'receipts', `${RUN_ID}.json`);
  fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
  const before = fs.readFileSync(runFile, 'utf8');
  fs.writeFileSync(receiptPath, JSON.stringify({ run_id: RUN_ID, base_sha: BASE, claim: 'I did the thing' }), 'utf8');
  const bad = await invoke('jarvis:ingest-receipt', { run_id: RUN_ID });
  check('an invalid receipt is visibly refused', bad.ok === false && bad.violations.some((v) => v.code === 'MISSING_REQUIRED_FIELD'), JSON.stringify(bad).slice(0, 300));
  check('the persisted run is byte-identical after refusal', fs.readFileSync(runFile, 'utf8') === before);

  const malformed = { run_id: RUN_ID, base_sha: 'main', claim: 'a', non_claim: 'b' };
  fs.writeFileSync(receiptPath, JSON.stringify(malformed), 'utf8');
  const mal = await invoke('jarvis:ingest-receipt', { run_id: RUN_ID });
  check('a ref used as base_sha is refused by the real app',
    mal.ok === false && mal.violations.some((v) => v.code === 'BASE_SHA_MALFORMED'), JSON.stringify(mal.violations));

  // ── 11/12. a valid receipt ────────────────────────────────────────────────
  const valid = {
    run_id: RUN_ID, base_sha: git('rev-parse', 'HEAD'),
    branch: 'claude/jarvis-app-stabilization-1jwcen', tests: '197 passed, 0 failed',
    pr: null, diff_summary: 'walk only',
    observations: [{ field: 'production_sha', value: '64c2b7c07', freshness: 'CARRIED', verified_at: '2026-08-26T18:04:00Z', verified_by: 'prior deploy witness' }],
    claim: 'The Electron walk exercised the custody path end to end.',
    non_claim: 'It does NOT establish that the DOM wires the buttons, nor anything about production.',
    next_boundary: 'packaging',
  };
  fs.writeFileSync(receiptPath, JSON.stringify(valid), 'utf8');
  const good = await invoke('jarvis:ingest-receipt', { run_id: RUN_ID });
  check('a valid receipt is ingested by the real app', good.ok, JSON.stringify(good).slice(0, 300));
  check('claim and non_claim are both surfaced',
    good.evidence.claim === valid.claim && good.evidence.non_claim === valid.non_claim);
  check('currency is CURRENT and CONFIRMED — the bracket closed in the real app',
    good.evidence.currency === 'CURRENT' && good.evidence.currency_confirmed === true, JSON.stringify(good.evidence.currency));
  check('the carried production fact kept its freshness through the real app',
    good.evidence.observations.find((o) => o.field === 'production_sha').freshness_label === 'NOT RE-READ THIS RUN');
  check('no reconciliation blocker on clean evidence', good.reconciliation.length === 0, JSON.stringify(good.reconciliation));
  check("the console's own history was not rewritten", good.run.state === 'ROUTED_NOT_EXECUTED', good.run.state);

  // ── 13. base drift through the real app ───────────────────────────────────
  const res2 = await invoke('jarvis:submit-task', { description: 'STAB-07 drift case' });
  const RUN2 = res2.run_id;
  await invoke('jarvis:handoff-packet', { run_id: RUN2, unit: 'STAB-07-DRIFT' });
  const baseAtHandoff = git('rev-parse', 'HEAD');
  git('commit', '-q', '--allow-empty', '-m', 'STAB-07 walk moves the head');
  const movedTo = git('rev-parse', '--short', 'HEAD');
  fs.writeFileSync(path.join(AIN, 'runtime', 'receipts', `${RUN2}.json`), JSON.stringify({ ...valid, run_id: RUN2, base_sha: baseAtHandoff }), 'utf8');
  const drift = await invoke('jarvis:ingest-receipt', { run_id: RUN2 });
  check('drifted evidence is still ACCEPTED by the real app', drift.ok, JSON.stringify(drift.violations));
  check('…but classified HISTORICAL', drift.evidence.currency === 'HISTORICAL', drift.evidence.currency);
  check('…and the summary states its base BEFORE the claim',
    /^\[EVIDENCE ABOUT .*NOT THE CURRENT HEAD\]/.test(drift.evidence.summary), drift.evidence.summary);
  check('…and it raises a reconciliation blocker', drift.reconciliation.length === 1 && drift.reconciliation[0].id === 'evidence:base_drift', JSON.stringify(drift.reconciliation));
  check('…naming the head it is not about', drift.evidence.base_drift.current_base === movedTo);

  fs.writeFileSync(OUT, JSON.stringify({ results, run_id: RUN_ID, run2: RUN2 }, null, 2));
}

app.whenReady().then(async () => {
  try { await walk(); }
  catch (e) {
    results.push({ name: 'harness completed without throwing', ok: false, detail: `${e.message}\n${e.stack}`.slice(0, 800) });
    try { fs.writeFileSync(OUT, JSON.stringify({ results }, null, 2)); } catch { /* nothing left to do */ }
  }
  app.exit(0);
});
