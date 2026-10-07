/** F-only Host boundary: real committed server and dependencies, synthetic homes only.
 * Sends raw HTTP to loopback so duplicate/missing Host and absent Origin are actually exercised.
 * Does not resolve a test DNS name, access the real pilot, or collect human judgments.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createConnection, createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { blankSheet, seal, snapshot } from './pilot';
import { sha256Hex } from './human-f-durability';

type Reply = { status: number; text: string };
let total = 0; let failed = 0;
const check = (name: string, pass: boolean): void => {
  total += 1; if (!pass) failed += 1;
  console.log((pass ? 'PASS' : 'FAIL') + '  ' + name);
};
const pause = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const root = mkdtempSync(join(tmpdir(), 'jev-F-HOST-SYNTHETIC-'));
let child: ChildProcess | undefined;
let port = 0;
async function unusedPort(): Promise<number> {
  const server = createServer();
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const a = server.address();
      if (!a || typeof a === 'string') { server.close(); reject(new Error('test port unavailable')); return; }
      server.close(() => resolve(a.port));
    });
  });
}
function decodeReply(raw: Buffer): Reply {
  const split = raw.indexOf('\r\n\r\n');
  if (split < 0) throw new Error('missing HTTP response header');
  const header = raw.subarray(0, split).toString('ascii');
  const status = Number(/^HTTP\/1\.[01] (\d{3})/.exec(header)?.[1]);
  if (!Number.isInteger(status)) throw new Error('invalid HTTP status');
  let body = raw.subarray(split + 4);
  if (/\r\ntransfer-encoding:\s*chunked/i.test(header) && body.length) {
    const chunks: Buffer[] = [];
    let cursor = 0;
    for (;;) {
      const end = body.indexOf('\r\n', cursor);
      if (end < 0) throw new Error('truncated chunk length');
      const n = Number.parseInt(body.subarray(cursor, end).toString('ascii').split(';')[0] ?? '', 16);
      if (!Number.isInteger(n) || n < 0 || end + 2 + n > body.length) throw new Error('invalid chunk length');
      if (n === 0) break;
      chunks.push(body.subarray(end + 2, end + 2 + n));
      cursor = end + 2 + n + 2;
    }
    body = Buffer.concat(chunks);
  }
  return { status, text: body.toString('utf8') };
}
function request(method: string, path: string, headers: string[], body = '', version = '1.1'): Promise<Reply> {
  return new Promise((resolve, reject) => {
    const socket = createConnection({ host: '127.0.0.1', port });
    const parts: Buffer[] = [];
    socket.setTimeout(5000, () => socket.destroy(new Error('synthetic HTTP timeout')));
    socket.once('error', reject);
    socket.on('data', (b: Buffer) => parts.push(b));
    socket.once('connect', () => socket.write([
      `${method} ${path} HTTP/${version}`, ...headers, 'Connection: close',
      ...(body ? ['Content-Type: application/json', `Content-Length: ${Buffer.byteLength(body)}`] : []), '', body,
    ].join('\r\n')));
    socket.once('end', () => {
      try { resolve(decodeReply(Buffer.concat(parts))); } catch (e) { reject(e); }
    });
  });
}
function hashes(dir: string): string {
  const out: Record<string, string> = {};
  const walk = (d: string, rel: string): void => {
    if (!existsSync(d)) return;
    for (const f of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, f.name); const key = rel + f.name;
      if (f.isDirectory()) walk(p, key + '/');
      else if (f.isFile()) out[key] = sha256Hex(readFileSync(p));
      else throw new Error('unexpected synthetic filesystem entry');
    }
  };
  walk(dir, '');
  return JSON.stringify(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}
async function main(): Promise<void> {
  const home = join(root, 'home'); const units = join(home, 'work-units-v2');
  const pilot = join(root, 'pilot'); const backup = join(root, 'backup');
  mkdirSync(units, { recursive: true }); mkdirSync(pilot);
  for (let i = 0; i < 2; i += 1) {
    const id = 'v2-SYNTHETIC-host-' + i;
    writeFileSync(join(units, id + '.json'), JSON.stringify({ work_unit: {
      identity: { id, objective: 'SYNTHETIC_HOST_ROUTING_SENTINEL', task_shape: 'CODE_GROUNDED', work_class: 'IMPLEMENTATION' },
      custody: { evidence_class: 'E1_REPOSITORY_LOCAL' }, routing_request: {}, context: {},
      scope: { allowed_paths: ['lib/synthetic.ts'] }, authority: { repository_read: true, network_external: false },
      routing: { route_record: {} }, evaluation: { acceptance_conditions: [], falsification_conditions: [], stop_conditions: [] },
      state: { lifecycle_state: 'DONE' },
    } }));
  }
  const { manifest, index } = snapshot(home, 2);
  const p = blankSheet(manifest, 'A', 'P');
  for (const e of p.entries) e.value = e.target === 'Q_DEPTH' ? 2 : true;
  const f = blankSheet(manifest, 'A', 'F', seal(manifest, p, 1));
  const source = join(pilot, 'kelly-F-sheet.json'); const working = join(pilot, 'kelly-F-sheet-working.json');
  writeFileSync(source, JSON.stringify(f, null, 2));
  writeFileSync(join(pilot, 'manifest.json'), JSON.stringify(manifest));
  writeFileSync(join(pilot, 'local-index.json'), JSON.stringify(index));
  port = await unusedPort();
  child = spawn(process.execPath, [require.resolve('tsx/cli'), join(__dirname, 'human-f-ui-server.ts'),
    '--home', home, '--manifest', join(pilot, 'manifest.json'), '--index', join(pilot, 'local-index.json'),
    '--sheet', source, '--working', working, '--backup-dir', backup, '--port', String(port),
  ], { detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = ''; let spawnError: Error | undefined;
  child.once('error', (e) => { spawnError = e; });
  child.stdout?.on('data', (b) => { log += String(b); });
  child.stderr?.on('data', (b) => { log += String(b); });
  for (let i = 0; i < 300 && !log.includes('BOUNDARY='); i += 1) {
    if (spawnError || child.exitCode !== null) throw spawnError ?? new Error('synthetic server exited: ' + log);
    await pause(50);
  }
  if (!log.includes('BOUNDARY=')) throw new Error('synthetic server did not start');
  const local = `Host: 127.0.0.1:${port}`; const origin = `Origin: http://127.0.0.1:${port}`;
  const evil = `Host: rebind.invalid:${port}`;
  for (const host of [`127.0.0.1:${port}`, `localhost:${port}`, `LOCALHOST:${port}`]) {
    const r = await request('GET', '/api/state', ['hOsT: ' + host]);
    const o = JSON.parse(r.text);
    check('H00-valid-host-' + host.split(':')[0], r.status === 200 && o.state.completed_cases === 0 && o.custody.disk_verified === true);
  }
  check('H00-real-assets', (await request('GET', '/', [local])).status === 200
    && (await request('GET', '/app.js', [local])).status === 200
    && (await request('GET', '/style.css', [local])).status === 200);
  const baseline = hashes(root);
  const denied = async (name: string, headers: string[], path = '/api/state', method = 'GET', body = '', version = '1.1'): Promise<void> => {
    const r = await request(method, path, headers, body, version);
    check(name, r.status === 403 && (method === 'HEAD' || r.text === '{"ok":false,"error":"INVALID_HOST"}\n'));
  };
  await denied('H01-untrusted-no-origin', [evil]);
  await denied('H02-untrusted-with-local-origin', [evil, origin]);
  await denied('H03-localhost-suffix', [`Host: localhost.rebind.invalid:${port}`]);
  await denied('H04-wrong-port', [`Host: localhost:${port === 65535 ? port - 1 : port + 1}`]);
  await denied('H05-port-required', ['Host: localhost']);
  await denied('H06-comma-hosts', [`Host: localhost:${port}, rebind.invalid:${port}`]);
  await denied('H07-userinfo-not-a-host', [`Host: localhost:${port}@rebind.invalid`]);
  await denied('H08-trailing-dot-not-allowlisted', [`Host: localhost.:${port}`]);
  await denied('H09-short-ip-not-allowlisted', [`Host: 127.1:${port}`]);
  await denied('H10-integer-ip-not-allowlisted', [`Host: 2130706433:${port}`]);
  await denied('H11-other-loopback-not-allowlisted', [`Host: 127.0.0.2:${port}`]);
  await denied('H12-forwarded-host-cannot-authorize', [evil, `X-Forwarded-Host: localhost:${port}`, `Forwarded: host=localhost:${port}`]);
  await denied('H13-duplicate-valid-first', [local, evil]);
  await denied('H14-duplicate-invalid-first', [evil, local]);
  await denied('H15-duplicate-identical', [local, local]);
  await denied('H16-empty-host', ['Host:']);
  // HTTP/1.0 reaches our handler without Node's HTTP/1.1 mandatory-Host precheck.
  await denied('H17-missing-host', [], '/api/state', 'GET', '', '1.0');
  for (const path of ['/', '/app.js', '/style.css', '/health', '/api/custody', '/not-found']) {
    await denied('H18-all-paths-' + path, [evil], path);
  }
  await denied('H19-options-also-gated', [evil], '/api/state', 'OPTIONS');
  await denied('H20-head-also-gated', [evil], '/api/state', 'HEAD');
  const answers = { Q_DEPTH: { value: 3, ambiguous: false, note: null }, Q_RISK: { value: true, ambiguous: false, note: null },
    Q_SUFFICIENT: { value: false, ambiguous: false, note: null }, Q_LLM_NEEDED: { value: true, ambiguous: false, note: null } };
  const payload = JSON.stringify({ pilot_id: manifest.units[0]!.pilot_id, answers });
  await denied('H21-untrusted-post-refused', [evil, origin], '/api/save', 'POST', payload);
  await denied('H22-host-checked-before-json-body', [evil], '/api/save', 'POST', '{invalid-json');
  check('H23-rejected-requests-change-no-files', hashes(root) === baseline && !existsSync(working));
  const crossed = await request('GET', '/api/state', [local, 'Origin: http://rebind.invalid']);
  check('H24-existing-origin-refusal-preserved', crossed.status === 403 && JSON.parse(crossed.text).error === 'forbidden');
  const save = await request('POST', '/api/save', [local, origin], payload);
  const saved = JSON.parse(save.text);
  check('H25-allowed-save-retains-durable-semantics', save.status === 200 && saved.state.completed_cases === 1
    && saved.custody.working_sha256 === sha256Hex(readFileSync(working))
    && saved.custody.working_sha256 === saved.custody.rolling_sha256);
  rmSync(working); // Our synthetic file only. The bad Host must not reach custody.verify() and repair it.
  const beforeRepair = hashes(root);
  await denied('H26-host-refuses-before-custody', [evil], '/api/custody');
  check('H27-bad-host-cannot-trigger-disk-repair', !existsSync(working) && hashes(root) === beforeRepair);
  const good = await request('GET', '/api/custody', [local]);
  const goodBody = JSON.parse(good.text);
  check('H28-allowed-custody-still-repairs', good.status === 200 && goodBody.custody.completed_cases_from_disk === 1 && existsSync(working));
  const startup = readFileSync(join(backup, 'events.jsonl'), 'utf8').split('\n').filter(Boolean).map((x) => JSON.parse(x))
    .find((e) => e.event === 'F_SERVER_STARTED');
  check('H29-startup-source-identity-complete', !!startup && Object.values(startup.code_identity.files).every((h) => typeof h === 'string' && /^[a-f0-9]{64}$/.test(h)));
  console.log('STARTUP_IDENTITY=' + JSON.stringify({
    git_head: startup?.code_identity?.git_head ?? null,
    git_dirty_paths_in_pilot_dir: startup?.code_identity?.git_dirty_paths_in_pilot_dir ?? null,
    missing_files: Object.entries(startup?.code_identity?.files ?? {}).filter(([, h]) => h === 'MISSING').map(([name]) => name),
  }));
}
(async () => {
  try { await main(); }
  catch (e) { failed += 1; console.error('HARNESS_ERROR', e instanceof Error ? e.message : String(e)); }
  finally {
    if (child?.pid) {
      const id = child.pid;
      try { process.kill(-id, 'SIGTERM'); } catch { /* our test process already exited */ }
      await pause(200);
      try { process.kill(-id, 'SIGKILL'); } catch { /* our test process group is gone */ }
    }
    rmSync(root, { recursive: true, force: true });
  }
  console.log(`\n${total} checks · ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
})();
