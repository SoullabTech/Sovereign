/** Mac readiness witness: REAL model, server, assets and browser; synthetic data only.
 * This does not read the real pilot, label any real case, or authorize sealing.
 * Adds a live-process torn-event-tail check missing from the original HTTP smoke.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { chromium, type Browser } from 'playwright';
import { blankSheet, seal, snapshot } from './pilot';
import { sha256Hex } from './human-f-durability';

const root = mkdtempSync(join(tmpdir(), 'jev-mac-readiness-SYNTHETIC-'));
let child: ChildProcess | undefined;
let browser: Browser | undefined;
let total = 0;
let failed = 0;
function check(name: string, pass: boolean): void {
  total += 1;
  if (!pass) failed += 1;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}`);
}
const pause = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
async function unusedPort(): Promise<number> {
  const s = createServer();
  return new Promise((resolve, reject) => {
    s.once('error', reject);
    s.listen(0, '127.0.0.1', () => {
      const a = s.address();
      if (!a || typeof a === 'string') { reject(new Error('no test port')); return; }
      s.close(() => resolve(a.port));
    });
  });
}
async function main(): Promise<void> {
  const home = join(root, 'home');
  const units = join(home, 'work-units-v2');
  const pilot = join(root, 'pilot');
  const backup = join(root, 'backup');
  mkdirSync(units, { recursive: true });
  mkdirSync(pilot);
  for (let i = 0; i < 2; i += 1) {
    const id = `v2-SYNTHETIC-readiness-${i}`;
    const work_unit = {
      identity: { id, objective: 'SYNTHETIC readiness fixture', task_shape: 'CODE_GROUNDED', work_class: 'IMPLEMENTATION' },
      custody: { evidence_class: 'E1_REPOSITORY_LOCAL' }, routing_request: {}, context: {},
      scope: { allowed_paths: ['lib/synthetic.ts'] }, authority: { repository_read: true, network_external: false },
      routing: { route_record: {} }, evaluation: { acceptance_conditions: [], falsification_conditions: [], stop_conditions: [] },
      state: { lifecycle_state: 'DONE' },
    };
    writeFileSync(join(units, id + '.json'), JSON.stringify({ work_unit }));
  }
  const { manifest, index } = snapshot(home, 2);
  const p = blankSheet(manifest, 'A', 'P');
  for (const e of p.entries) e.value = e.target === 'Q_DEPTH' ? 2 : true;
  const f = blankSheet(manifest, 'A', 'F', seal(manifest, p, 1));
  const source = join(pilot, 'kelly-F-sheet.json');
  const working = join(pilot, 'kelly-F-sheet-working.json');
  writeFileSync(source, JSON.stringify(f, null, 2));
  writeFileSync(join(pilot, 'manifest.json'), JSON.stringify(manifest));
  writeFileSync(join(pilot, 'local-index.json'), JSON.stringify(index));
  const port = await unusedPort();
  const base = `http://127.0.0.1:${port}`;
  const tsx = require.resolve('tsx/cli');
  const args = [tsx, join(__dirname, 'human-f-ui-server.ts'), '--home', home,
    '--manifest', join(pilot, 'manifest.json'), '--index', join(pilot, 'local-index.json'),
    '--sheet', source, '--working', working, '--backup-dir', backup, '--port', String(port)];
  child = spawn(process.execPath, args, { detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let serverLog = '';
  child.stdout?.on('data', (d) => { serverLog += String(d); });
  child.stderr?.on('data', (d) => { serverLog += String(d); });
  for (let i = 0; i < 200 && !serverLog.includes('BOUNDARY='); i += 1) {
    if (child.exitCode !== null) throw new Error('synthetic server exited: ' + serverLog);
    await pause(50);
  }
  if (!serverLog.includes('BOUNDARY=')) throw new Error('synthetic server failed to start');
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  const pageErrors: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  await page.clock.install();
  await page.goto(base);
  await page.waitForFunction(() => document.getElementById('custody')?.textContent?.includes('DISK VERIFIED'));
  check('browser loads real HTML, shared CSS and JS without stand-ins', pageErrors.length === 0 && await page.locator('#caseForm').isVisible());
  for (let i = 0; i < 2; i += 1) {
    await page.locator('input[name="Q_DEPTH"][value="3"]').check();
    for (const q of ['Q_RISK', 'Q_SUFFICIENT', 'Q_LLM_NEEDED']) await page.locator(`input[name="${q}"][value="true"]`).check();
    const response = page.waitForResponse((r) => r.url().endsWith('/api/save') && r.request().method() === 'POST');
    await page.locator('#nextBtn').click();
    check(`browser synthetic case ${i + 1} save accepted`, (await response).status() === 200);
  }
  await page.waitForFunction(() => document.getElementById('completeLabel')?.textContent?.startsWith('2 of 2'));
  check('browser completion agrees with non-null disk entries', JSON.parse(readFileSync(working, 'utf8')).entries.every((e: { value: unknown }) => e.value !== null));
  const hash = sha256Hex(readFileSync(working));
  check('browser custody identifies the actual working path and full SHA-256',
    (await page.locator('#custody').innerText()).includes(working)
    && (await page.locator('#custody').getAttribute('title'))?.includes(hash) === true);
  await page.reload();
  await page.waitForFunction(() => document.getElementById('completeLabel')?.textContent?.startsWith('2 of 2'));
  check('browser reload retains verified completion and hash', (await page.locator('#custody').innerText()).includes(hash.slice(0, 12)));
  rmSync(working);
  const poll = page.waitForResponse((r) => r.url().endsWith('/api/custody'));
  await page.clock.fastForward(30001);
  await poll;
  check('30-second browser poll repairs missing primary without losing bytes', existsSync(working) && sha256Hex(readFileSync(working)) === hash);
  const eventPath = join(backup, 'events.jsonl');
  const intactLog = readFileSync(eventPath);
  appendFileSync(eventPath, '{"torn":');
  const result = await fetch(base + '/api/custody');
  const resultBody = await result.json() as { error?: string; custody?: { disk_verified?: boolean } };
  check('live torn event tail refuses custody instead of reporting DISK VERIFIED', result.status === 409 && resultBody.error === 'EVENT_LOG_TORN_TAIL');
  console.log('TORN_TAIL_OBSERVED=' + JSON.stringify({ http_status: result.status, error: resultBody.error ?? null, disk_verified: resultBody.custody?.disk_verified ?? null }));
  // Restore synthetic test evidence only, then exercise loss of all three data copies.
  writeFileSync(eventPath, intactLog);
  rmSync(working);
  rmSync(join(backup, 'rolling-latest.json'));
  rmSync(join(backup, 'generations'), { recursive: true });
  const errorPoll = page.waitForResponse((r) => r.url().endsWith('/api/custody'));
  await page.clock.fastForward(30001);
  await errorPoll;
  await page.waitForFunction(() => document.getElementById('custody')?.classList.contains('bad'));
  check('browser shows red DISK NOT VERIFIED when all copies are missing', (await page.locator('#custody').innerText()).includes('DISK NOT VERIFIED'));
  check('browser does not throw JavaScript errors', pageErrors.length === 0);
}
(async () => {
  try { await main(); }
  catch (e) { failed += 1; console.error('WITNESS ERROR', e instanceof Error ? e.message : String(e)); }
  finally {
    await browser?.close();
    if (child?.pid) {
      try { process.kill(-child.pid, 'SIGTERM'); } catch { /* already exited */ }
      await pause(200);
      if (child.exitCode === null) try { process.kill(-child.pid, 'SIGKILL'); } catch { /* already exited */ }
    }
    rmSync(root, { recursive: true, force: true });
  }
  console.log(`\n${total} checks · ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
})();
