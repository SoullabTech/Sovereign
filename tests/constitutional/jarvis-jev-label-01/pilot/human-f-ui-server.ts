/**
 * Local-only Kelly F-pass server.
 * Reads frozen manifest/index + source units only after P is sealed.
 * Writes only 0600 files outside the delegation home.
 *
 * R1 durability: the server keeps NO sheet in memory. Every /api/state re-reads and verifies the disk (working file,
 * rolling copy, write-once generation ledger, hash-chained content-free event log) and repairs any single-copy loss.
 * "N of 25 saved to disk" is the count read BACK from disk, never a counter. See human-f-durability.ts.
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { assertOutsideHome, type LocalIndex, type Manifest, type Sheet } from './pilot';
import {
  applyHumanFCase,
  assertHumanFSheet,
  humanFUiState,
  loadRoutingStates,
} from './human-f-ui-model';
import { Custody, DurabilityRefused, sha256Hex } from './human-f-durability';
import { HumanUiRefused, type HumanAnswer } from './human-ui-model';
import type { QuestionId } from '../core';

const argv = process.argv.slice(2);
const all = (name: string): string[] =>
  argv.flatMap((a, i) => (a === '--' + name && argv[i + 1] ? [argv[i + 1] as string] : []));
const one = (name: string): string => {
  const v = all(name)[0];
  if (!v) throw new Error('--' + name + ' required');
  return v;
};
const home = one('home');
const manifestPath = one('manifest');
const indexPath = one('index');
const sourcePath = one('sheet');
const workingPath = all('working')[0] ?? join(dirname(sourcePath), 'kelly-F-sheet-working.json');
// Placement of the safety copies is a deliberate act: required, never defaulted next to the working file.
const backupDir = one('backup-dir');
const port = Number(all('port')[0] ?? '3762');
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('invalid --port');
assertOutsideHome(home, workingPath);

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest;
const index = JSON.parse(readFileSync(indexPath, 'utf8')) as LocalIndex;
const fullStates = loadRoutingStates(home, manifest, index);

/** Content-free identity of the code actually running: hashes of every file the surface is built from, plus git state. */
function codeIdentity(): Record<string, unknown> {
  const names = [
    'human-f-ui-server.ts', 'human-f-ui-model.ts', 'human-f-ui-client.js', 'human-f-ui.html', 'human-f-ui.css',
    'human-f-durability.ts', 'human-f-finish.ts', 'human-ui-model.ts', 'human-ui.css', 'pilot.ts',
  ];
  const files: Record<string, string> = {};
  for (const n of names) {
    const p = join(__dirname, n);
    files[n] = existsSync(p) ? sha256Hex(readFileSync(p)) : 'MISSING';
  }
  let head: string | null = null;
  let dirtyPaths: number | null = null;
  try {
    head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: __dirname, encoding: 'utf8' }).trim();
    dirtyPaths = execFileSync('git', ['status', '--porcelain', '--', '.'], { cwd: __dirname, encoding: 'utf8' })
      .split('\n').filter(Boolean).length;
  } catch { /* not a git checkout: recorded as null */ }
  return { git_head: head, git_dirty_paths_in_pilot_dir: dirtyPaths, files, node: process.version };
}

const custody = new Custody({
  home,
  sourcePath,
  workingPath,
  backupDir,
  parse: (text: string): Sheet => {
    const s = JSON.parse(text) as Sheet;
    assertHumanFSheet(s);
    return s;
  },
  identity: codeIdentity,
});
const startReport = custody.start();

const asset = (name: string): string => readFileSync(join(__dirname, name), 'utf8');
const html = asset('human-f-ui.html');
const js = asset('human-f-ui-client.js');
const css = asset('human-ui.css') + '\n' + asset('human-f-ui.css');

function reply(
  res: ServerResponse,
  status: number,
  type: string,
  body: string,
  headers: Record<string, string> = {},
): void {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  res.end(body);
}
/** Reject rebinding hostnames before any route or custody read/repair.
 * Inspect raw headers: Node may discard duplicate Host values in req.headers.
 * This is a loopback-origin boundary, not authentication of local processes.
 */
function allowedHost(req: IncomingMessage): boolean {
  const hosts: string[] = [];
  for (let i = 0; i < req.rawHeaders.length; i += 2) {
    if (req.rawHeaders[i]?.toLowerCase() === 'host') hosts.push(req.rawHeaders[i + 1] ?? '');
  }
  return hosts.length === 1 && (
    hosts[0]?.toLowerCase() === 'localhost:' + port || hosts[0] === '127.0.0.1:' + port
  );
}

function sameOrigin(req: IncomingMessage): boolean {
  const origin = req.headers.origin;
  if (!origin) return true;
  return origin === 'http://127.0.0.1:' + port || origin === 'http://localhost:' + port;
}

async function bodyJson(req: IncomingMessage): Promise<unknown> {
  let raw = '';
  for await (const chunk of req) {
    raw += String(chunk);
    if (raw.length > 64_000) throw new HumanUiRefused('BODY_TOO_LARGE', 'request exceeds 64KB');
  }
  return JSON.parse(raw);
}

const server = createServer(async (req, res) => {
  try {
    if (!allowedHost(req)) {
      return reply(res, 403, 'application/json', '{"ok":false,"error":"INVALID_HOST"}\n');
    }
    const url = new URL(req.url ?? '/', 'http://127.0.0.1:' + port);
    if (req.method === 'GET' && url.pathname === '/') {
      return reply(res, 200, 'text/html; charset=utf-8', html, {
        'Content-Security-Policy':
          "default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; " +
          "img-src 'none'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'",
      });
    }
    if (req.method === 'GET' && url.pathname === '/style.css') {
      return reply(res, 200, 'text/css; charset=utf-8', css);
    }
    if (req.method === 'GET' && url.pathname === '/app.js') {
      return reply(res, 200, 'application/javascript; charset=utf-8', js);
    }
    if (req.method === 'GET' && url.pathname === '/health') {
      return reply(res, 200, 'application/json', '{"ok":true}\n');
    }
    if (!sameOrigin(req)) {
      return reply(res, 403, 'application/json', '{"ok":false,"error":"forbidden"}\n');
    }

    if (req.method === 'GET' && url.pathname === '/api/state') {
      const v = custody.verify();
      return reply(
        res,
        200,
        'application/json',
        JSON.stringify({ ok: true, state: humanFUiState(v.sheet, fullStates), custody: v.report }) + '\n',
      );
    }

    if (req.method === 'GET' && url.pathname === '/api/custody') {
      // Lightweight disk verification for the UI's periodic check (no routing states, no answers).
      const v = custody.verify();
      return reply(res, 200, 'application/json', JSON.stringify({ ok: true, custody: v.report }) + '\n');
    }

    if (req.method === 'POST' && url.pathname === '/api/save') {
      const b = await bodyJson(req) as {
        pilot_id?: string;
        answers?: Partial<Record<QuestionId, HumanAnswer>>;
      };
      if (typeof b.pilot_id !== 'string' || !b.answers || typeof b.answers !== 'object') {
        throw new HumanUiRefused('INVALID_SAVE', 'pilot_id and answers required');
      }
      const current = custody.verify();
      const candidate = applyHumanFCase(current.sheet, b.pilot_id, b.answers);
      const saved = custody.save(candidate, b.pilot_id);
      const persistedState = humanFUiState(saved.sheet, fullStates);
      process.stdout.write(
        JSON.stringify({
          event: 'F_CASE_SAVED_TO_DISK',
          at: new Date().toISOString(),
          pilot_id: b.pilot_id,
          completed_cases: persistedState.completed_cases,
          total_cases: persistedState.total_cases,
          working_sha256: saved.report.working_sha256,
          rolling_sha256: saved.report.rolling_sha256,
          event_seq: saved.report.event_seq,
        }) + '\n',
      );
      return reply(
        res,
        200,
        'application/json',
        JSON.stringify({ ok: true, state: persistedState, custody: saved.report }) + '\n',
      );
    }

    return reply(res, 404, 'application/json', '{"ok":false,"error":"not found"}\n');
  } catch (e) {
    const code = e instanceof HumanUiRefused || e instanceof DurabilityRefused ? e.code : 'SERVER_ERROR';
    const detail = e instanceof Error ? e.message : String(e);
    return reply(
      res,
      e instanceof DurabilityRefused ? 409 : 400,
      'application/json',
      JSON.stringify({ ok: false, error: code, detail }) + '\n',
    );
  }
});
server.listen(port, '127.0.0.1', () => {
  process.stdout.write([
    'JARVIS-JEV-LABEL-01 PILOT F human UI',
    'URL=http://127.0.0.1:' + port,
    'SOURCE=' + sourcePath,
    'WORKING=' + workingPath,
    'BACKUP_DIR=' + backupDir,
    'ROLLING=' + custody.rollingPath,
    'GENERATIONS=' + custody.genDir,
    'EVENT_LOG=' + custody.eventPath,
    'COMPLETED_AT_START=' + startReport.completed_cases_from_disk + ' of ' + startReport.total_cases,
    'BOUNDARY=F_ONLY · LABEL_A_KELLY · LOCAL_ONLY · P_SEALED',
    '',
  ].join('\n'));
});

for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, () => server.close(() => process.exit(0)));
}
