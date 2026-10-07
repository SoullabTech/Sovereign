/**
 * Local-only Kelly-facing PILOT-01 P labelling server.
 *
 * Binds 127.0.0.1 only. Reads the already-cut P sheet. Writes only a 0600
 * working copy outside the delegation home. Never reads the local index or F state.
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomBytes } from 'node:crypto';
import { chmodSync, existsSync, readFileSync as readFsFileSync, writeFileSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { assertOutsideHome } from './pilot';
import { applyHumanCase, HumanUiRefused, humanUiState, readWorkingSheet, writeWorkingSheet, type HumanAnswer } from './human-ui-model';
import type { QuestionId } from '../core';

const argv = process.argv.slice(2);
const all = (name: string): string[] => argv.flatMap((a, i) => (a === `--${name}` && argv[i + 1] ? [argv[i + 1] as string] : []));
const one = (name: string): string => {
  const v = all(name)[0];
  if (!v) throw new Error(`--${name} required`);
  return v;
};

const home = one('home');
const sourcePath = one('sheet');
const workingPath = all('working')[0] ?? join(dirname(sourcePath), 'kelly-P-sheet-working.json');
const port = Number(all('port')[0] ?? '3761');
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('invalid --port');
assertOutsideHome(home, workingPath);

const tokenPath = join(dirname(workingPath), '.human-ui-token');
assertOutsideHome(home, tokenPath);
let token: string;
if (existsSync(tokenPath)) {
  token = readFsFileSync(tokenPath, 'utf8').trim();
} else {
  token = randomBytes(24).toString('hex');
  writeFileSync(tokenPath, token + '\n', { mode: 0o600 });
}
chmodSync(tokenPath, 0o600);
const cookie = `pilot_token=${token}; Path=/; HttpOnly; SameSite=Strict`;
const asset = (name: string): string => readFileSync(join(__dirname, name), 'utf8');
const html = asset('human-ui.html');
const js = asset('human-ui-client.js');
const css = asset('human-ui.css');

let sheet = readWorkingSheet(sourcePath, workingPath);

function reply(res: ServerResponse, status: number, type: string, body: string, headers: Record<string, string> = {}): void {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers });
  res.end(body);
}

function authorized(req: IncomingMessage): boolean {
  const c = req.headers.cookie ?? '';
  return c.split(';').some((x) => x.trim() === `pilot_token=${token}`);
}

function sameOrigin(req: IncomingMessage): boolean {
  const origin = req.headers.origin;
  if (!origin) return true;
  return origin === `http://127.0.0.1:${port}` || origin === `http://localhost:${port}`;
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
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);
    if (req.method === 'GET' && url.pathname === '/') {
      return reply(res, 200, 'text/html; charset=utf-8', html, {
        'Set-Cookie': cookie,
        'Content-Security-Policy': "default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'none'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'",
      });
    }
    if (req.method === 'GET' && url.pathname === '/style.css') return reply(res, 200, 'text/css; charset=utf-8', css);
    if (req.method === 'GET' && url.pathname === '/app.js') return reply(res, 200, 'application/javascript; charset=utf-8', js);
    if (req.method === 'GET' && url.pathname === '/health') return reply(res, 200, 'application/json', '{"ok":true}\n');

    if (!sameOrigin(req)) return reply(res, 403, 'application/json', '{"ok":false,"error":"forbidden"}\n');

    if (req.method === 'GET' && url.pathname === '/api/state') {
      return reply(res, 200, 'application/json', JSON.stringify({ ok: true, state: humanUiState(sheet) }) + '\n');
    }

    if (req.method === 'POST' && url.pathname === '/api/save') {
      const b = await bodyJson(req) as {
        pilot_id?: string;
        answers?: Partial<Record<QuestionId, HumanAnswer>>;
      };
      if (typeof b.pilot_id !== 'string' || !b.answers || typeof b.answers !== 'object') {
        throw new HumanUiRefused('INVALID_SAVE', 'pilot_id and answers required');
      }
      sheet = applyHumanCase(sheet, b.pilot_id, b.answers);
      writeWorkingSheet(workingPath, sheet);
      return reply(res, 200, 'application/json', JSON.stringify({ ok: true, state: humanUiState(sheet) }) + '\n');
    }

    return reply(res, 404, 'application/json', '{"ok":false,"error":"not found"}\n');
  } catch (e) {
    const code = e instanceof HumanUiRefused ? e.code : 'SERVER_ERROR';
    const detail = e instanceof Error ? e.message : String(e);
    return reply(res, 400, 'application/json', JSON.stringify({ ok: false, error: code, detail }) + '\n');
  }
});

server.listen(port, '127.0.0.1', () => {
  process.stdout.write([
    'JARVIS-JEV-LABEL-01 PILOT human UI',
    `URL=http://127.0.0.1:${port}`,
    `SOURCE=${sourcePath}`,
    `WORKING=${workingPath}`,
    'BOUNDARY=P_ONLY · LABEL_A_KELLY · LOCAL_ONLY',
    '',
  ].join('\n'));
});

for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, () => server.close(() => process.exit(0)));
}
