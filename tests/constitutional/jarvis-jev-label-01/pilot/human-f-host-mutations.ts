/** Mutation witness against the actual F HTTP server. Scratch copies and synthetic labels only.
 * An exception, timeout, missing mutation anchor or anonymous suite crash is NOT a named kill.
 */
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const gate = `    if (!allowedHost(req)) {
      return reply(res, 403, 'application/json', '{"ok":false,"error":"INVALID_HOST"}\\n');
    }
`;
const oldPortCheck = "hosts[0]?.toLowerCase() === 'localhost:' + port || hosts[0] === '127.0.0.1:' + port";
const mutations = [
  { id: 'MH1-host-check-bypassed', mustFail: 'H01-untrusted-no-origin', edits: [['if (!allowedHost(req)) {', 'if (false && !allowedHost(req)) {']] },
  { id: 'MH2-any-localhost-port', mustFail: 'H04-wrong-port', edits: [[oldPortCheck, "hosts[0]?.toLowerCase().startsWith('localhost:') === true || hosts[0] === '127.0.0.1:' + port"]] },
  { id: 'MH3-duplicate-host-accepted', mustFail: 'H13-duplicate-valid-first', edits: [['return hosts.length === 1 && (', 'return hosts.length >= 1 && (']] },
  { id: 'MH4-only-post-is-gated', mustFail: 'H01-untrusted-no-origin', edits: [[gate, ''], ["    if (req.method === 'POST' && url.pathname === '/api/save') {", gate + "    if (req.method === 'POST' && url.pathname === '/api/save') {"]] },
];
const root = mkdtempSync(join(tmpdir(), 'jev-F-HOST-MUTATIONS-SYNTHETIC-'));
const labelDir = resolve(__dirname, '..');
const modules = dirname(dirname(require.resolve('tsx/package.json')));
let failed = 0; let killedCount = 0;
function scratch(name: string): string {
  const dir = join(root, name);
  cpSync(labelDir, dir, { recursive: true });
  symlinkSync(modules, join(dir, 'node_modules'), 'dir');
  return dir;
}
function run(dir: string) {
  const r = spawnSync(process.execPath, [require.resolve('tsx/cli'), join(dir, 'pilot', 'human-f-host-verify.ts')],
    { cwd: dir, encoding: 'utf8', timeout: 90000, maxBuffer: 2 * 1024 * 1024 });
  const out = (r.stdout ?? '') + (r.stderr ?? '');
  return { code: r.status, error: r.error, signal: r.signal, out,
    failures: out.split('\n').filter((l) => l.startsWith('FAIL  ')),
    complete: /38 checks · \d+ failed/.test(out) && !out.includes('HARNESS_ERROR') };
}
try {
  const ref = run(scratch('reference'));
  const green = ref.code === 0 && !ref.error && !ref.signal && ref.complete && ref.failures.length === 0;
  console.log((green ? 'PASS' : 'FAIL') + '  unmutated real-server reference completes all 38 checks');
  if (!green) { failed += 1; console.log(ref.out); }
  for (const m of mutations) {
    const dir = scratch(m.id); const path = join(dir, 'pilot', 'human-f-ui-server.ts');
    let text = readFileSync(path, 'utf8'); let missing = false;
    for (const edit of m.edits) {
      const [from, to] = edit as [string, string];
      if (text.split(from).length !== 2) { missing = true; break; }
      text = text.replace(from, to);
    }
    if (missing) { console.log('FAIL  ' + m.id + ' mutation anchor absent or non-unique'); failed += 1; continue; }
    writeFileSync(path, text);
    const r = run(dir);
    const named = r.failures.some((l) => l === 'FAIL  ' + m.mustFail);
    const killed = green && r.code === 1 && !r.error && !r.signal && r.complete && named;
    console.log((killed ? 'KILL' : 'LIVE') + '  ' + m.id + ' on ' + m.mustFail
      + ' [exit=' + r.code + '; suite_complete=' + r.complete + '; named=' + named + ']');
    if (killed) killedCount += 1;
    else { failed += 1; console.log(r.out); }
  }
} catch (e) { failed += 1; console.error('MATRIX_ERROR', e); }
finally { rmSync(root, { recursive: true, force: true }); }
console.log(`\n${killedCount}/${mutations.length} Host mutations killed on their named check; ${failed} witness failures`);
process.exitCode = failed ? 1 : 0;
