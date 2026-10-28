#!/usr/bin/env node
/**
 * AUTH-RETURN-01: real PostgreSQL 16.13 + simulated Proton SMTP witness.
 *
 * Run from the admitted checkout: node scripts/witness/auth-return-01.mjs
 * Optional --cases=otp-attempts,registration runs the two red-first regressions.
 * Uses cached Docker images only, no build/pull, no host ports, no external
 * network, no host database or credentials. Source/dependencies are read-only.
 * The application handlers and database services run unchanged. A small HTTP
 * adapter supplies Next's request-local cookie/header context; this is handler
 * acceptance, not a Next build, browser witness, or Writer journey qualification.
 */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const PG_IMAGE = 'sha256:5d143123fdf80462d1778cd4f24b9f7ca13c87174bca19141fb194c5a1ebca59';
const NODE_IMAGE = 'sha256:de170b39439eb0e5a3444ad7d60b015614a381e10fecae2e30ec9e735122f38d';
const SCRIPT = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(SCRIPT), '../..');
const selected = process.argv.find(x => x.startsWith('--cases='))?.slice(8).split(',').filter(Boolean) ?? null;
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

async function outside() {
  const started = new Date().toISOString();
  const tag = `auth-return-01-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const pgName = `${tag}-pg`, nodeName = `${tag}-node`, socketVolume = `${tag}-socket`;
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'auth-return-01-'));
  fs.chmodSync(work, 0o700);
  const modules = fs.realpathSync(path.join(ROOT, 'node_modules'));
  const docker = (args, options = {}) => execFileSync('docker', args, { encoding: 'utf8', timeout: 30_000, ...options });
  const git = args => execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } }).trim();
  const source = { head: git(['rev-parse', 'HEAD']), branch: git(['branch', '--show-current']), witness_sha256: sha(fs.readFileSync(SCRIPT)) };
  const resources = { pgName, nodeName, socketVolume };
  const cleanup = [];
  let workerCode = 1, error = null, volumeCreated = false, pgCreated = false, nodeCreated = false;
  const label = `soullab.auth-return-witness=${tag}`;
  const ownedContainer = name => {
    try { return JSON.parse(docker(['inspect', name]))[0]?.Config?.Labels?.['soullab.auth-return-witness'] === tag; }
    catch { return false; }
  };
  try {
    for (const id of [PG_IMAGE, NODE_IMAGE]) {
      const image = JSON.parse(docker(['image', 'inspect', id]))[0];
      assert.equal(image.Id, id, 'Exact cached image required; no pull is permitted');
      assert.equal(image.Architecture, 'arm64');
    }
    // Fixture CA/key are newly generated, private and never reused or printed.
    execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1',
      '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1',
      '-addext', 'basicConstraints=critical,CA:TRUE',
      '-keyout', path.join(work, 'smtp-key.pem'), '-out', path.join(work, 'smtp-cert.pem')],
    { stdio: 'ignore', timeout: 30_000 });
    fs.chmodSync(path.join(work, 'smtp-key.pem'), 0o600);
    docker(['volume', 'create', '--label', label, socketVolume]); volumeCreated = true;
    docker(['run', '--detach', '--pull=never', '--name', pgName, '--label', label,
      '--network=none', '--read-only', '--tmpfs', '/tmp:rw,noexec,nosuid,size=64m',
      '--tmpfs', '/var/lib/postgresql/data:rw,nosuid,size=256m',
      '--mount', `type=volume,src=${socketVolume},dst=/var/run/postgresql`,
      '-e', 'POSTGRES_USER=auth_return_fixture', '-e', 'POSTGRES_PASSWORD=fictional-password',
      '-e', 'POSTGRES_DB=auth_return_fixture', PG_IMAGE,
      'postgres', '-c', 'listen_addresses=', '-c', 'unix_socket_directories=/var/run/postgresql']); pgCreated = true;
    let ready = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      try {
        const version = docker(['exec', pgName, 'psql', '-U', 'auth_return_fixture', '-d', 'auth_return_fixture', '-Atc', 'SHOW server_version_num'], { stdio: ['ignore', 'pipe', 'pipe'] }).trim();
        assert.equal(version, '160013', `PostgreSQL 16.13 required, observed ${version}`); ready = true; break;
      } catch (failure) {
        if (failure.code === 'ERR_ASSERTION') throw failure;
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    assert(ready, 'Fictional PostgreSQL did not become ready');
    const pgInspection = JSON.parse(docker(['inspect', pgName]))[0];
    assert.equal(pgInspection.HostConfig.NetworkMode, 'none');
    assert.equal(Object.keys(pgInspection.NetworkSettings.Ports ?? {}).length, 0);
    fs.writeFileSync(path.join(work, 'isolation.json'), JSON.stringify({
      network: 'none', published_ports: [], postgres_image: PG_IMAGE, node_image: NODE_IMAGE,
      database: 'auth_return_fixture', postgres_version_num: 160013,
      source_read_only: true, dependencies_read_only: true, host_environment_forwarded: false,
    }, null, 2));
    const args = ['run', '--pull=never', '--name', nodeName, '--label', label,
      '--network=none', '--read-only', '--cap-drop=ALL', '--security-opt=no-new-privileges',
      '--tmpfs', '/tmp:rw,nosuid,size=256m',
      '--mount', `type=bind,src=${ROOT},dst=/app,readonly`,
      '--mount', `type=bind,src=${modules},dst=/dependencies,readonly`,
      '--mount', `type=bind,src=${work},dst=/fixture`,
      '--mount', `type=volume,src=${socketVolume},dst=/var/run/postgresql`,
      '--workdir', '/app',
      '-e', 'NODE_ENV=test', '-e', 'NODE_PATH=/dependencies', '-e', 'DATABASE_URL=postgresql://auth_return_fixture:fictional-password@localhost/auth_return_fixture?host=/var/run/postgresql',
      '-e', 'AUTH_CODE_PEPPER=fictional-auth-return-pepper-at-least-thirty-two-characters',
      '-e', 'PASSWORD_SALT=fictional-auth-return-salt',
      '-e', 'EMAIL_PROVIDER=smtp', '-e', 'SMTP_HOST=127.0.0.1', '-e', 'SMTP_PORT=2525',
      '-e', 'SMTP_USER=noreply@soullab.life', '-e', 'SMTP_PASSWORD=fictional-smtp-password', '-e', 'SMTP_SECURE=true',
      '-e', 'NODE_EXTRA_CA_CERTS=/fixture/smtp-cert.pem', '-e', 'ACCESS_CONTROL_MODE=strict',
      '-e', 'AUTH_RETURN_FIXTURE=isolated-v1', NODE_IMAGE, 'node', '/app/scripts/witness/auth-return-01.mjs', '--inside',
      ...(selected ? [`--cases=${selected.join(',')}`] : [])];
    nodeCreated = true;
    workerCode = await new Promise((resolve, reject) => {
      const log = fs.openSync(path.join(work, 'worker.log'), 'wx', 0o600);
      const child = spawn('docker', args, { stdio: ['ignore', log, log] });
      const timer = setTimeout(() => { child.kill('SIGTERM'); reject(new Error('Witness exceeded 10-minute fixture limit')); }, 600_000);
      child.on('error', e => { clearTimeout(timer); fs.closeSync(log); reject(e); });
      child.on('exit', code => { clearTimeout(timer); fs.closeSync(log); resolve(code ?? 1); });
    });
    const nodeInspection = JSON.parse(docker(['inspect', nodeName]))[0];
    assert.equal(nodeInspection.HostConfig.NetworkMode, 'none');
    assert.equal(Object.keys(nodeInspection.NetworkSettings.Ports ?? {}).length, 0);
  } catch (failure) { error = { name: failure.name, message: failure.message }; }
  finally {
    for (const [created, name] of [[nodeCreated, nodeName], [pgCreated, pgName]]) {
      if (!created) continue;
      try {
        if (ownedContainer(name)) { docker(['rm', '--force', name]); cleanup.push({ resource: name, removed: true }); }
        else cleanup.push({ resource: name, removed: false, reason: 'not-found-or-owner-label-mismatch' });
      } catch (failure) { cleanup.push({ resource: name, removed: false, error: failure.message }); }
    }
    if (volumeCreated) {
      try {
        const volume = JSON.parse(docker(['volume', 'inspect', socketVolume]))[0];
        assert.equal(volume.Labels['soullab.auth-return-witness'], tag);
        docker(['volume', 'rm', socketVolume]); cleanup.push({ resource: socketVolume, removed: true });
      } catch (failure) { cleanup.push({ resource: socketVolume, removed: false, error: failure.message }); }
    }
    for (const file of ['smtp-key.pem', 'smtp-cert.pem']) fs.rmSync(path.join(work, file), { force: true });
  }
  const workerFile = path.join(work, 'acceptance.json');
  const acceptance = fs.existsSync(workerFile) ? JSON.parse(fs.readFileSync(workerFile, 'utf8')) : null;
  const receipt = { schema: 'soullab.auth-return-01.pg16-witness.v1', started_at: started,
    finished_at: new Date().toISOString(), source, postgres_image: PG_IMAGE, node_image: NODE_IMAGE,
    selected_cases: selected, worker_exit_code: workerCode, acceptance, cleanup, error,
    result: !error && workerCode === 0 && acceptance?.failed === 0 && acceptance?.passed > 0 && cleanup.every(x => x.removed) ? 'PASS' : 'FAIL',
    scope: 'actual production handler/services; real isolated PG16.13; local simulated TLS SMTP; framework request-context adapter',
    excluded: ['browser qualification', 'full Next build', 'Writer save-return-undo journey', 'real members', 'real mail', 'release'],
    evidence_directory: work };
  fs.writeFileSync(path.join(work, 'RECEIPT.json'), JSON.stringify(receipt, null, 2) + '\n', { mode: 0o600 });
  console.log(JSON.stringify(receipt, null, 2));
  process.exitCode = receipt.result === 'PASS' ? 0 : 1;
}

async function inside() {
  assert.equal(process.env.AUTH_RETURN_FIXTURE, 'isolated-v1');
  assert.equal(ROOT, '/app');
  const url = new URL(process.env.DATABASE_URL);
  assert.equal(url.hostname, 'localhost'); assert.equal(url.pathname, '/auth_return_fixture');
  assert.equal(url.searchParams.get('host'), '/var/run/postgresql');
  assert.equal(process.env.SMTP_HOST, '127.0.0.1');
  for (const key of ['RESEND_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'SMTP_PASSWORD_FILE', 'MAIA_CABIN_DATA_PATH']) assert.equal(process.env[key], undefined);
  const require = createRequire('/app/package.json');
  const Module = require('node:module');
  const ts = require('typescript');
  const loadedSource = {};
  const runtimeDependencies = {};
  for (const name of ['typescript', 'pg', 'pg-connection-string', 'nodemailer', 'next', 'bcrypt']) {
    const bytes = fs.readFileSync(`/dependencies/${name}/package.json`);
    runtimeDependencies[name] = { version: JSON.parse(bytes).version, package_json_sha256: sha(bytes) };
  }
  runtimeDependencies.bcrypt.native_binary_sha256 = sha(fs.readFileSync('/dependencies/bcrypt/prebuilds/linux-arm64/bcrypt.glibc.node'));
  const { AsyncLocalStorage } = require('node:async_hooks');
  const context = new AsyncLocalStorage();
  const oldResolve = Module._resolveFilename;
  Module._resolveFilename = function (name, ...args) { return oldResolve.call(this, name.startsWith('@/') ? '/app/' + name.slice(2) : name, ...args); };
  for (const ext of ['.ts', '.tsx']) Module._extensions[ext] = (mod, filename) => {
    const text = fs.readFileSync(filename, 'utf8');
    if (filename.startsWith('/app/')) loadedSource[filename.slice(5)] = sha(text);
    const out = ts.transpileModule(text, { fileName: filename, compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
      esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX,
    } }); mod._compile(out.outputText, filename);
  };
  // Only the framework's request storage is adapted. DB, proofs, SMTP, password,
  // transaction, cookie serialization, session issuance and authority stay real.
  // One labelled test injects a cookie-output exception at the framework edge.
  const oldLoad = Module._load;
  Module._load = function (name, ...args) {
    if (name === 'next/headers') return {
      cookies: async () => { const s = context.getStore(); assert(s, 'missing request cookie context'); return s.cookies; },
      headers: async () => { const s = context.getStore(); assert(s, 'missing request header context'); return s.headers; },
    };
    return oldLoad.call(this, name, ...args);
  };
  const db = require('/app/lib/db/postgres.ts');
  assert.equal((await db.query('SHOW server_version_num')).rows[0].server_version_num, '160013');
  await db.query(`CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), passkey TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL, password_hash TEXT, name TEXT NOT NULL, email TEXT,
    preferred_name TEXT, onboarded BOOLEAN NOT NULL DEFAULT FALSE,
    onboarding_step TEXT, tier TEXT DEFAULT 'free', roles TEXT[] DEFAULT ARRAY['member']::TEXT[]
  ); CREATE UNIQUE INDEX members_email_lower_fixture ON members(LOWER(email));
  CREATE UNIQUE INDEX members_username_lower_fixture ON members(LOWER(username));`);
  const migrations = [
    'database/migrations/20260119000001_auth_sessions.sql',
    'database/migrations/20260119000004_auth_rate_limits.sql',
    'database/migrations/20260825000001_email_delivery_ledger.sql',
    'database/migrations/20261028000001_auth_return_01.sql',
  ];
  const migrationHashes = {};
  for (const file of migrations) { const sql = fs.readFileSync('/app/' + file, 'utf8'); migrationHashes[file] = sha(sql); await db.query(sql); }
  const service = require('/app/lib/auth/emailCodeService.ts');
  const proofService = require('/app/lib/auth/registrationProof.ts');
  const sessions = require('/app/lib/auth/serverSessions.ts');
  const authority = require('/app/lib/auth/sessionCredentialAuthority.ts');
  const { NextRequest } = require('next/server');
  const issueRoute = require('/app/app/api/members/email-code/route.ts');
  const verifyRoute = require('/app/app/api/members/email-code/verify/route.ts');
  const registerRoute = require('/app/app/api/members/register-email/route.ts');
  const sessionRoute = require('/app/app/api/members/session/route.ts');
  const http = require('node:http');
  const tls = require('node:tls');
  require('node:dns').setDefaultResultOrder('ipv4first');
  const smtp = { next: 'accept', attempts: 0, messages: [], sockets: new Set() };
  const mailServer = tls.createServer({ key: fs.readFileSync('/fixture/smtp-key.pem'), cert: fs.readFileSync('/fixture/smtp-cert.pem') }, socket => {
    smtp.sockets.add(socket); socket.on('close', () => smtp.sockets.delete(socket));
    socket.setEncoding('utf8'); socket.write('220 localhost AUTH-RETURN-01 fictional SMTP\r\n');
    let buffer = '', inData = false, data = '', mode = 'accept', recipient = '';
    socket.on('error', () => {});
    socket.on('data', chunk => {
      buffer += chunk;
      while (buffer.includes('\r\n')) {
        const i = buffer.indexOf('\r\n'); const line = buffer.slice(0, i); buffer = buffer.slice(i + 2);
        if (inData) {
          if (line !== '.') { data += line + '\r\n'; continue; }
          inData = false;
          smtp.messages.push({ recipient, body: data, mode });
          if (mode === 'unknown') { socket.destroy(); return; }
          socket.write('250 2.0.0 fictional message accepted\r\n'); continue;
        }
        if (/^EHLO|^HELO/i.test(line)) socket.write('250-localhost\r\n250-AUTH PLAIN\r\n250 8BITMIME\r\n');
        else if (/^AUTH PLAIN /i.test(line)) {
          const supplied = Buffer.from(line.slice(11), 'base64').toString().split('\0');
          socket.write(supplied.at(-2) === 'noreply@soullab.life' && supplied.at(-1) === 'fictional-smtp-password' ? '235 2.7.0 authenticated\r\n' : '535 5.7.8 invalid fictional credential\r\n');
        } else if (/^MAIL FROM:/i.test(line)) { mode = smtp.next; smtp.next = 'accept'; smtp.attempts++; data = ''; recipient = ''; socket.write('250 2.1.0 sender accepted\r\n'); }
        else if (/^RCPT TO:/i.test(line)) { recipient = line.match(/<([^>]+)>/)?.[1] ?? ''; socket.write(mode === 'refuse' ? '550 5.1.1 recipient rejected\r\n' : '250 2.1.5 recipient accepted\r\n'); }
        else if (/^DATA$/i.test(line)) { inData = true; socket.write('354 end with dot\r\n'); }
        else if (/^QUIT$/i.test(line)) socket.end('221 bye\r\n');
        else socket.write('250 OK\r\n');
      }
    });
  });
  await new Promise((resolve, reject) => { mailServer.once('error', reject); mailServer.listen(2525, '127.0.0.1', resolve); });
  const routes = new Map([
    ['/api/members/email-code', issueRoute], ['/api/members/email-code/verify', verifyRoute],
    ['/api/members/register-email', registerRoute], ['/api/members/session', sessionRoute],
  ]);
  let origin = '';
  const app = http.createServer(async (incoming, outgoing) => {
    try {
      const chunks = []; for await (const chunk of incoming) chunks.push(chunk);
      const method = incoming.method || 'GET';
      const headers = new Headers(); for (const [key, value] of Object.entries(incoming.headers)) if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(',') : value);
      const request = new NextRequest(origin + incoming.url, { method, headers, ...(method === 'GET' || method === 'HEAD' ? {} : { body: Buffer.concat(chunks) }) });
      const route = routes.get(new URL(request.url).pathname);
      if (!route) { outgoing.writeHead(404); outgoing.end(); return; }
      if (typeof route[method] !== 'function') { outgoing.writeHead(405); outgoing.end(); return; }
      const response = await context.run({ cookies: request.cookies, headers: request.headers }, () => route[method](request));
      outgoing.statusCode = response.status;
      for (const [key, value] of response.headers) if (key !== 'set-cookie') outgoing.setHeader(key, value);
      const cookieHeaders = response.headers.getSetCookie(); if (cookieHeaders.length) outgoing.setHeader('set-cookie', cookieHeaders);
      outgoing.end(Buffer.from(await response.arrayBuffer()));
    } catch (error) { console.error('fixture-handler-error', error.name, error.message); outgoing.statusCode = 500; outgoing.end(JSON.stringify({ fixtureError: error.name })); }
  });
  await new Promise(resolve => app.listen(0, '127.0.0.1', resolve));
  // NextURL canonicalizes loopback IPs to localhost. Use the same canonical
  // hostname in Origin, URL and client requests; keep the listener IPv4-only.
  origin = `http://localhost:${app.address().port}`;
  let requestNumber = 1;
  const alice = 'writer-alice@example.invalid', bob = 'writer-bob@example.invalid';
  const password = 'fictional-password-for-witness';
  class Client {
    cookies = new Map();
    async request(endpoint, body, extra = {}, method = body === undefined ? 'GET' : 'POST') {
      const headers = { origin, 'content-type': 'application/json', 'x-forwarded-for': `192.0.2.${(requestNumber++ % 240) + 1}`, ...extra };
      if (this.cookies.size) headers.cookie = [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; ');
      const response = await fetch(origin + endpoint, { method, headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
      for (const raw of response.headers.getSetCookie()) { const pair = raw.split(';', 1)[0]; const i = pair.indexOf('='); this.cookies.set(pair.slice(0, i), pair.slice(i + 1)); }
      const text = await response.text(); let json = null; try { json = JSON.parse(text); } catch {}
      return { status: response.status, body: json, headers: response.headers, text };
    }
  }
  async function issue(client, email, key = crypto.randomUUID(), mode = 'accept') {
    smtp.next = mode; const response = await client.request('/api/members/email-code', { email }, { 'x-soullab-auth-request': key });
    const message = [...smtp.messages].reverse().find(m => m.recipient === email);
    const code = message?.body.match(/Your Soullab code:\s*(\d{6})/)?.[1];
    return { ...response, key, code };
  }
  async function claim(client, email, code) { return client.request('/api/members/email-code/verify', { email, code, next: '/writers-studio' }); }
  async function registration(client, email, username) { return client.request('/api/members/register-email', { email, username, password, name: username, next: '/writers-studio' }); }
  async function getProof(client, email) { const sent = await issue(client, email); assert.equal(sent.status, 200, sent.text); assert(sent.code); const claimed = await claim(client, email, sent.code); assert.equal(claimed.status, 200, claimed.text); assert.equal(claimed.body.registrationRequired, true); assert(client.cookies.get('maia_registration_proof')); return sent; }
  async function registerMember(email, username) { const client = new Client(); await getProof(client, email); const result = await registration(client, email, username); assert.equal(result.status, 200, result.text); assert.equal(result.body.authenticated, true); return { client, result }; }
  const results = [];
  async function reset() {
    await db.query(`DROP TRIGGER IF EXISTS fixture_session_fault ON auth_sessions;
      DROP FUNCTION IF EXISTS fixture_session_fault_fn();
      TRUNCATE auth_email_challenges, auth_registration_proofs, auth_sessions, auth_rate_limits, email_delivery_attempts, members CASCADE`);
    smtp.messages.length = 0; smtp.attempts = 0; smtp.next = 'accept';
  }
  async function test(id, label, fn) {
    if (selected && !selected.includes(id)) return;
    const start = Date.now();
    try { await reset(); await fn(); results.push({ id, label, result: 'PASS', elapsed_ms: Date.now() - start }); }
    catch (error) { results.push({ id, label, result: 'FAIL', elapsed_ms: Date.now() - start, failure: { name: error.name, message: error.message } }); }
    console.log(JSON.stringify(results.at(-1)));
  }
  try {
    await test('otp-attempts', 'wrong OTP attempts persist in real transactions and exhaust the challenge', async () => {
      const client = new Client(); const sent = await issue(client, alice); assert.equal(sent.status, 200, sent.text); assert(sent.code);
      const wrong = sent.code === '000000' ? '111111' : '000000';
      for (let i = 1; i <= 5; i++) {
        const result = await claim(client, alice, wrong); assert.equal(result.status, 400, result.text);
        const row = (await db.query('SELECT attempts,status FROM auth_email_challenges WHERE email=$1', [alice])).rows[0];
        assert.equal(row.attempts, i, `attempt ${i} must survive transaction completion`);
        assert.equal(row.status, i === 5 ? 'expired' : 'accepted');
      }
      assert.equal((await claim(client, alice, sent.code)).status, 400);
    });
    await test('registration', 'two fictional members register with real proof foreign keys and verified sessions', async () => {
      const a = await registerMember(alice, 'fictional_alice'); const b = await registerMember(bob, 'fictional_bob');
      assert.notEqual(a.result.body.member.id, b.result.body.member.id);
      assert.equal((await db.query('SELECT COUNT(*)::integer AS n FROM members')).rows[0].n, 2);
      assert.equal((await db.query('SELECT COUNT(*)::integer AS n FROM auth_registration_proofs WHERE consumed_at IS NOT NULL')).rows[0].n, 2);
      for (const record of [a, b]) {
        const token = record.client.cookies.get('maia_session'); assert.match(token, /^[a-f0-9]{64}$/);
        const session = await sessions.validateSession(token); assert.equal(session?.memberId, record.result.body.member.id);
        const readback = await record.client.request('/api/members/session'); assert.equal(readback.status, 200, readback.text); assert.equal(readback.body.member.id, record.result.body.member.id);
      }
    });
    // Additional acceptance cases are below; every one runs against the same
    // production modules and independently reset fictional PostgreSQL state.
    await test('accepted-replay', 'accepted issuance is durable and a replayed request key sends no second message', async () => {
      const client = new Client(); const sent = await issue(client, alice); assert.equal(sent.status, 200, sent.text);
      const before = smtp.attempts; const again = await issue(client, alice, sent.key);
      assert.equal(again.status, 200, again.text); assert.equal(again.body.reused, true); assert.equal(smtp.attempts, before);
      const row = (await db.query('SELECT * FROM auth_email_challenges WHERE email=$1', [alice])).rows[0];
      assert.equal(row.status, 'accepted'); assert.match(row.code_digest, /^[a-f0-9]{64}$/);
      assert.notEqual(row.code_digest, sent.code); assert.notEqual(row.request_key_digest, sent.key);
      assert(row.provider_message_id); assert.equal(row.provider, 'smtp');
      assert.equal(sent.body.code, undefined);
      assert.equal((await db.query("SELECT state FROM email_delivery_attempts")).rows[0].state, 'accepted');
    });
    await test('smtp-refusal', 'definite SMTP refusal preserves the previously accepted code', async () => {
      const client = new Client(); const old = await issue(client, alice); assert.equal(old.status, 200, old.text);
      const refused = await issue(client, alice, crypto.randomUUID(), 'refuse'); assert(refused.status >= 400);
      assert.notEqual(refused.body.reason, 'delivery_state_unknown');
      const states = (await db.query('SELECT status FROM auth_email_challenges ORDER BY created_at')).rows.map(r => r.status);
      assert.deepEqual(states, ['accepted', 'refused']);
      assert.equal((await claim(client, alice, old.code)).status, 200);
    });
    await test('smtp-unknown', 'a lost SMTP acceptance response remains ambiguous and is not automatically resent', async () => {
      const client = new Client(); const uncertain = await issue(client, alice, crypto.randomUUID(), 'unknown');
      assert(uncertain.status >= 400); assert.equal(uncertain.body.reason, 'delivery_state_unknown');
      assert.equal(uncertain.body.retryable, false);
      const before = smtp.attempts; const retry = await issue(client, alice, uncertain.key);
      assert.equal(retry.status, 409); assert.equal(retry.body.reason, 'delivery_state_unknown'); assert.equal(smtp.attempts, before);
      assert.equal((await db.query('SELECT status FROM auth_email_challenges WHERE email=$1', [alice])).rows[0].status, 'ambiguous');
      assert.equal((await db.query('SELECT state FROM email_delivery_attempts')).rows[0].state, 'indeterminate');
      const fresh = await issue(client, alice); assert.equal(fresh.status, 200, fresh.text); assert.equal((await claim(client, alice, fresh.code)).status, 200);
    });
    await test('accepted-replacement', 'a successful replacement supersedes the previous challenge only after acceptance', async () => {
      const client = new Client(); const first = await issue(client, alice); assert.equal(first.status, 200, first.text);
      const second = await issue(client, alice); assert.equal(second.status, 200, second.text);
      assert.deepEqual((await db.query('SELECT status FROM auth_email_challenges ORDER BY created_at')).rows.map(r => r.status), ['superseded', 'accepted']);
      assert.equal((await claim(client, alice, second.code)).status, 200);
      assert.equal((await claim(client, alice, second.code)).status, 400);
      assert.equal((await db.query('SELECT COUNT(*)::integer AS n FROM auth_registration_proofs')).rows[0].n, 1);
    });
    await test('otp-expiry', 'an expired OTP is refused and its expired state commits', async () => {
      const client = new Client(); const sent = await issue(client, alice); assert.equal(sent.status, 200, sent.text);
      await db.query("UPDATE auth_email_challenges SET expires_at=NOW()-INTERVAL '1 second' WHERE email=$1", [alice]);
      const result = await claim(client, alice, sent.code); assert.equal(result.status, 400); assert.equal(result.body.reason, 'AUTH_CODE_EXPIRED');
      assert.equal((await db.query('SELECT status FROM auth_email_challenges WHERE email=$1', [alice])).rows[0].status, 'expired');
      assert.equal((await db.query('SELECT COUNT(*)::integer AS n FROM auth_registration_proofs')).rows[0].n, 0);
    });
    await test('expired-request-replay', 'an expired accepted request key is refused without mail and a fresh key succeeds', async () => {
      const client = new Client(); const sent = await issue(client, alice); assert.equal(sent.status, 200, sent.text);
      await db.query("UPDATE auth_email_challenges SET expires_at=NOW()-INTERVAL '1 second' WHERE email=$1", [alice]);
      const before = smtp.attempts; const replay = await issue(client, alice, sent.key);
      assert.equal(replay.status, 409, replay.text); assert.equal(replay.body.reason, 'request_key_consumed');
      assert.equal(smtp.attempts, before, 'An expired request-key replay must not contact SMTP');
      const old = (await db.query('SELECT status FROM auth_email_challenges WHERE request_key_digest=$1', [service.authRequestKeyDigest(sent.key)])).rows[0];
      assert.equal(old.status, 'expired', 'The expired state must be durably committed');
      const fresh = await issue(client, alice); assert.notEqual(fresh.key, sent.key); assert.equal(fresh.status, 200, fresh.text);
      assert.equal(smtp.attempts, before + 1); assert.equal((await claim(client, alice, fresh.code)).status, 200);
    });
    await test('otp-concurrent-replay', 'concurrent claims produce exactly one proof', async () => {
      const client = new Client(); const sent = await issue(client, alice); assert.equal(sent.status, 200, sent.text);
      const pair = await Promise.all([claim(new Client(), alice, sent.code), claim(new Client(), alice, sent.code)]);
      assert.deepEqual(pair.map(r => r.status).sort(), [200, 400]);
      assert.equal((await db.query('SELECT COUNT(*)::integer AS n FROM auth_registration_proofs')).rows[0].n, 1);
    });
    await test('acceptance-concurrency', 'concurrent accepted deliveries serialize to one current challenge', async () => {
      const first = await db.transaction(c => service.beginEmailChallenge(c, { email: alice, requestKey: crypto.randomUUID() }));
      const second = await db.transaction(c => service.beginEmailChallenge(c, { email: alice, requestKey: crypto.randomUUID() }));
      assert.equal(first.created, true); assert.equal(second.created, true);
      const outcomes = await Promise.allSettled([first, second].map(ch => db.transaction(c => service.settleEmailChallengeAccepted(c, { challengeId: ch.challenge.id, provider: 'smtp', providerMessageId: 'fictional-' + ch.challenge.id }))));
      assert.equal(outcomes.filter(o => o.status === 'fulfilled').length, 2);
      const states = (await db.query('SELECT status FROM auth_email_challenges ORDER BY status')).rows.map(r => r.status);
      assert.deepEqual(states, ['accepted', 'superseded']);
    });
    await test('proof-email-binding', 'Alice proof cannot create Bob and remains available to Alice', async () => {
      const a = new Client(); await getProof(a, alice);
      const denied = await registration(a, bob, 'fictional_bob'); assert.equal(denied.status, 403); assert.equal(denied.body.reason, 'REGISTRATION_PROOF_EMAIL_MISMATCH');
      assert.equal((await db.query('SELECT COUNT(*)::integer AS n FROM members')).rows[0].n, 0);
      assert.equal((await db.query('SELECT consumed_at FROM auth_registration_proofs')).rows[0].consumed_at, null);
      assert.equal((await registration(a, alice, 'fictional_alice')).status, 200);
    });
    await test('proof-expiry', 'expired registration proof cannot create a member or session', async () => {
      const a = new Client(); await getProof(a, alice);
      await db.query("UPDATE auth_registration_proofs SET expires_at=NOW()-INTERVAL '1 second'");
      const result = await registration(a, alice, 'fictional_alice'); assert.equal(result.status, 403); assert.equal(result.body.reason, 'REGISTRATION_PROOF_EXPIRED');
      assert.equal((await db.query('SELECT COUNT(*)::integer AS n FROM members')).rows[0].n, 0);
      assert.equal((await db.query('SELECT COUNT(*)::integer AS n FROM auth_sessions')).rows[0].n, 0);
    });
    await test('proof-revocation', 'revoked registration proof is refused', async () => {
      const a = new Client(); await getProof(a, alice); await db.query('UPDATE auth_registration_proofs SET revoked_at=NOW()');
      const result = await registration(a, alice, 'fictional_alice'); assert.equal(result.status, 403); assert.equal(result.body.reason, 'REGISTRATION_PROOF_REVOKED');
      assert.equal((await db.query('SELECT COUNT(*)::integer AS n FROM members')).rows[0].n, 0);
    });
    await test('registration-replay', 'consumed registration proof cannot create a second member/session', async () => {
      const client = new Client(); await getProof(client, alice); const proof = client.cookies.get('maia_registration_proof');
      assert.equal((await registration(client, alice, 'fictional_alice')).status, 200);
      client.cookies.set('maia_registration_proof', proof);
      const replay = await registration(client, alice, 'fictional_alice'); assert.equal(replay.status, 409); assert.equal(replay.body.reason, 'REGISTRATION_PROOF_CONSUMED');
      assert.equal((await db.query('SELECT COUNT(*)::integer AS n FROM members')).rows[0].n, 1);
      assert.equal((await db.query('SELECT COUNT(*)::integer AS n FROM auth_sessions')).rows[0].n, 1);
    });
    await test('registration-race', 'two simultaneous submissions consume the proof exactly once', async () => {
      const a = new Client(); await getProof(a, alice); const b = new Client(); b.cookies = new Map(a.cookies);
      const pair = await Promise.all([registration(a, alice, 'fictional_alice'), registration(b, alice, 'fictional_alice')]);
      assert.deepEqual(pair.map(x => x.status).sort(), [200, 409]);
      assert.equal((await db.query('SELECT COUNT(*)::integer AS n FROM members')).rows[0].n, 1);
      assert.equal((await db.query('SELECT COUNT(*)::integer AS n FROM auth_sessions')).rows[0].n, 1);
    });
    await test('duplicate-username', 'username conflict is truthful and leaves the second proof unused', async () => {
      await registerMember(alice, 'fictional_alice'); const b = new Client(); await getProof(b, bob);
      const result = await registration(b, bob, 'fictional_alice'); assert.equal(result.status, 409);
      assert.equal((await db.query('SELECT consumed_at FROM auth_registration_proofs WHERE email=$1', [bob])).rows[0].consumed_at, null);
      assert.equal((await registration(b, bob, 'fictional_bob')).status, 200);
    });
    await test('registration-session-failure', 'session INSERT failure rolls back member and proof consumption', async () => {
      const a = new Client(); await getProof(a, alice);
      await db.query(`CREATE FUNCTION fixture_session_fault_fn() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fictional session insert unavailable'; END $$;
        CREATE TRIGGER fixture_session_fault BEFORE INSERT ON auth_sessions FOR EACH ROW EXECUTE FUNCTION fixture_session_fault_fn()`);
      const failed = await registration(a, alice, 'fictional_alice'); assert.equal(failed.status, 500); assert.notEqual(failed.body.success, true);
      assert.equal((await db.query('SELECT COUNT(*)::integer AS n FROM members')).rows[0].n, 0);
      assert.equal((await db.query('SELECT consumed_at FROM auth_registration_proofs')).rows[0].consumed_at, null);
      assert.equal(a.cookies.get('maia_session'), undefined);
      await db.query('DROP TRIGGER fixture_session_fault ON auth_sessions; DROP FUNCTION fixture_session_fault_fn()');
      assert.equal((await registration(a, alice, 'fictional_alice')).status, 200);
    });
    await test('registration-readback-failure', 'unverifiable registration session rolls back the whole registration', async () => {
      const a = new Client(); await getProof(a, alice);
      await db.query(`CREATE FUNCTION fixture_session_fault_fn() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.revoked:=TRUE; RETURN NEW; END $$;
        CREATE TRIGGER fixture_session_fault BEFORE INSERT ON auth_sessions FOR EACH ROW EXECUTE FUNCTION fixture_session_fault_fn()`);
      const result = await registration(a, alice, 'fictional_alice'); assert.equal(result.status, 500); assert.notEqual(result.body.authenticated, true);
      assert.equal((await db.query('SELECT COUNT(*)::integer AS n FROM members')).rows[0].n, 0);
      assert.equal((await db.query('SELECT COUNT(*)::integer AS n FROM auth_sessions')).rows[0].n, 0);
      assert.equal((await db.query('SELECT consumed_at FROM auth_registration_proofs')).rows[0].consumed_at, null);
    });
    await test('registration-cookie-output-failure', 'post-commit cookie failure truthfully reports created account and revokes unreturned session', async () => {
      const a = new Client(); await getProof(a, alice);
      const { ResponseCookies } = require('next/dist/compiled/@edge-runtime/cookies');
      const originalSet = ResponseCookies.prototype.set;
      let injected = 0;
      ResponseCookies.prototype.set = function (name, ...args) {
        const key = typeof name === 'string' ? name : name?.name;
        if (key === 'maia_session') { injected++; throw new Error('fictional response-cookie channel failure'); }
        return originalSet.call(this, name, ...args);
      };
      let result;
      try { result = await registration(a, alice, 'fictional_alice'); }
      finally { ResponseCookies.prototype.set = originalSet; }
      assert.equal(injected, 1, 'The actual response-cookie boundary must be exercised');
      assert.equal(result.status, 503, result.text); assert.equal(result.body.registrationCreated, true); assert.equal(result.body.authenticated, false);
      assert.equal(a.cookies.get('maia_session'), undefined);
      const member = (await db.query('SELECT id FROM members WHERE email=$1', [alice])).rows[0]; assert(member);
      assert((await db.query('SELECT consumed_at FROM auth_registration_proofs WHERE email=$1', [alice])).rows[0].consumed_at);
      assert.equal((await db.query('SELECT COUNT(*)::integer AS n FROM auth_sessions WHERE member_id=$1 AND revoked=FALSE', [member.id])).rows[0].n, 0);
      const fresh = new Client(); const sent = await issue(fresh, alice); assert.equal(sent.status, 200, sent.text);
      const returned = await claim(fresh, alice, sent.code); assert.equal(returned.status, 200, returned.text); assert.equal(returned.body.authenticated, true); assert.equal(returned.body.member.id, member.id);
    });
    await test('signin-session-failure', 'existing-member session failure never reports authentication success', async () => {
      await registerMember(alice, 'fictional_alice'); const client = new Client(); const sent = await issue(client, alice); assert.equal(sent.status, 200, sent.text);
      await db.query(`CREATE FUNCTION fixture_session_fault_fn() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fictional session insert unavailable'; END $$;
        CREATE TRIGGER fixture_session_fault BEFORE INSERT ON auth_sessions FOR EACH ROW EXECUTE FUNCTION fixture_session_fault_fn()`);
      const failed = await claim(client, alice, sent.code); assert.equal(failed.status, 503); assert.notEqual(failed.body.authenticated, true); assert.equal(client.cookies.get('maia_session'), undefined);
      assert.equal((await db.query('SELECT COUNT(*)::integer AS n FROM auth_sessions')).rows[0].n, 1);
    });
    await test('signin-readback-failure', 'existing-member failed readback leaves no usable newly issued session', async () => {
      await registerMember(alice, 'fictional_alice'); const client = new Client(); const sent = await issue(client, alice); assert.equal(sent.status, 200, sent.text);
      await db.query(`CREATE FUNCTION fixture_session_fault_fn() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.revoked:=TRUE; RETURN NEW; END $$;
        CREATE TRIGGER fixture_session_fault BEFORE INSERT ON auth_sessions FOR EACH ROW EXECUTE FUNCTION fixture_session_fault_fn()`);
      const failed = await claim(client, alice, sent.code); assert.equal(failed.status, 503); assert.notEqual(failed.body.authenticated, true); assert.equal(client.cookies.get('maia_session'), undefined);
      assert.equal((await db.query('SELECT COUNT(*)::integer AS n FROM auth_sessions WHERE revoked=FALSE')).rows[0].n, 1);
    });
    await test('fresh-session-return', 'both onboarded members receive the Writer return destination after normal fresh-session OTP', async () => {
      for (const [email, username] of [[alice, 'fictional_alice'], [bob, 'fictional_bob']]) {
        const initial = await registerMember(email, username); const oldToken = initial.client.cookies.get('maia_session');
        const onboardingReturn = new URL(initial.result.body.redirect, origin);
        assert.equal(onboardingReturn.pathname, '/faq'); assert.equal(onboardingReturn.searchParams.get('next'), '/writers-studio');
        // Fixture setup represents a previously onboarded member. This grants
        // no Writer invitation/ownership and does not claim Writer-route access.
        await db.query("UPDATE members SET onboarded=TRUE,onboarding_step='complete' WHERE id=$1", [initial.result.body.member.id]);
        const fresh = new Client(); assert.equal((await fresh.request('/api/members/session')).status, 401);
        const sent = await issue(fresh, email); assert.equal(sent.status, 200, sent.text);
        const returned = await claim(fresh, email, sent.code); assert.equal(returned.status, 200, returned.text); assert.equal(returned.body.authenticated, true);
        assert.equal(returned.body.redirect, '/writers-studio'); assert.equal(returned.body.member.onboarded, true);
        assert.equal(returned.body.member.id, initial.result.body.member.id); assert.notEqual(fresh.cookies.get('maia_session'), oldToken);
        const readback = await fresh.request('/api/members/session'); assert.equal(readback.status, 200, readback.text); assert.equal(readback.body.member.id, initial.result.body.member.id);
      }
    });
    await test('cross-account-session', 'conflicting session credentials cannot combine Alice and Bob authorities', async () => {
      const a = await registerMember(alice, 'fictional_alice'); const b = await registerMember(bob, 'fictional_bob');
      const aToken = a.client.cookies.get('maia_session'), bToken = b.client.cookies.get('maia_session');
      const result = await authority.resolveSessionCredentialAuthority([
        { source: 'cookie', presented: true, value: aToken }, { source: 'header', presented: true, value: bToken },
      ]); assert.equal(result.ok, false); assert.equal(result.reason, 'credential_conflict');
      const missing = await authority.resolveSessionCredentialAuthority([{ source: 'cookie', presented: true, value: 'not-a-session' }]); assert.equal(missing.ok, false);
      const same = await authority.resolveSessionCredentialAuthority([{ source: 'cookie', presented: true, value: aToken }, { source: 'header', presented: true, value: aToken }]); assert.equal(same.ok, true); assert.equal(same.memberId, a.result.body.member.id);
      a.client.cookies.set('maia_roles', '["admin"]');
      const readback = await a.client.request('/api/members/session'); assert.equal(readback.status, 200); assert.equal(readback.body.member.id, a.result.body.member.id); assert.deepEqual(readback.body.member.roles, ['member']);
      const mixed = await a.client.request('/api/members/session', undefined, { 'x-session-token': bToken }); assert.equal(mixed.status, 401);
      a.client.cookies.set('maia_member_id', b.result.body.member.id);
      const forgedMember = await a.client.request('/api/members/session'); assert.equal(forgedMember.status, 401);
    });
    await test('session-revocation-expiry', 'revoked and expired sessions fail server readback', async () => {
      const a = await registerMember(alice, 'fictional_alice'); const token = a.client.cookies.get('maia_session');
      await db.query('UPDATE auth_sessions SET revoked=TRUE WHERE session_token=$1', [token]);
      assert.equal(await sessions.validateSession(token), null); assert.equal((await a.client.request('/api/members/session')).status, 401);
      await db.query("UPDATE auth_sessions SET revoked=FALSE,expires_at=NOW()-INTERVAL '1 second' WHERE session_token=$1", [token]);
      assert.equal(await sessions.validateSession(token), null); assert.equal((await a.client.request('/api/members/session')).status, 401);
    });
    await test('origin-denial', 'cross-origin mutations cannot issue codes, claims or registrations', async () => {
      const client = new Client();
      for (const endpoint of ['/api/members/email-code', '/api/members/email-code/verify', '/api/members/register-email']) {
        const denied = await client.request(endpoint, { email: alice, code: '000000', username: 'fictional_alice', password }, { origin: 'https://foreign.example.invalid' });
        assert.equal(denied.status, 403, denied.text);
      }
      assert.equal(smtp.attempts, 0); assert.equal((await db.query('SELECT COUNT(*)::integer AS n FROM auth_email_challenges')).rows[0].n, 0);
    });
    await test('strict-proxy', 'strict route admission, unsupported methods and forged identity headers stay closed', async () => {
      const matrix = require('/app/config/accessMatrix.ts'); assert.equal(matrix.getAccessMode(), 'strict');
      for (const endpoint of ['/api/members/email-code', '/api/members/email-code/verify', '/api/members/session']) assert.equal(matrix.matchRule(endpoint)?.exact, endpoint);
      for (const endpoint of ['/api/members/email-code/extra', '/api/members/email-code/verify/extra', '/api/members/session/extra']) assert.equal(matrix.checkAccess(endpoint, 'free', ['member'], true).allowed, false);
      const { proxy } = require('/app/proxy.ts');
      for (const endpoint of ['/api/members/email-code', '/api/members/email-code/verify']) {
        const allowed = await proxy(new NextRequest(origin + endpoint, { method: 'POST', headers: { origin, 'x-member-id': 'forged', 'x-access-member-id': 'forged', 'x-access-roles': 'admin' } }));
        assert.equal(allowed.status, 200); assert.equal(allowed.headers.get('x-middleware-request-x-member-id'), null);
        assert.notEqual(allowed.headers.get('x-middleware-request-x-access-member-id'), 'forged');
        const denied = await proxy(new NextRequest(origin + endpoint, { method: 'GET', headers: { origin } })); assert.equal(denied.status, 405);
      }
      const unknown = await proxy(new NextRequest(origin + '/api/members/email-code/extra', { method: 'POST', headers: { origin } })); assert.equal(unknown.status, 404);
    });
    await test('capacity-and-purpose', 'durable sender capacity is bounded and unrelated mail stays refused', async () => {
      const capacity = require('/app/lib/email/senderCapacity.ts'); const { sendEmail, SENDERS } = require('/app/lib/email/sendEmail.ts');
      assert.equal(typeof capacity.reserveManagedAuthSend, 'function');
      const created = await db.transaction(c => service.beginEmailChallenge(c, { email: alice, requestKey: crypto.randomUUID() })); assert.equal(created.created, true);
      const opts = { purpose: 'auth:email-code', from: SENDERS.noreply, to: alice, correlationId: created.challenge.id, idempotencyKey: `AUTH_CODE:${created.challenge.id}` };
      const pair = await Promise.all([capacity.reserveManagedAuthSend(opts), capacity.reserveManagedAuthSend(opts)]);
      assert.equal(pair.filter(x => x.admitted).length, 1);
      const before = smtp.attempts;
      const refused = await sendEmail({ ...opts, purpose: 'invite:beta', subject: 'fictional excluded purpose', text: 'fictional' }); assert.equal(refused.success, false); assert.equal(smtp.attempts, before);
      const badSender = await sendEmail({ ...opts, from: 'team@soullab.life', subject: 'fictional sender refusal', text: 'fictional' }); assert.equal(badSender.success, false); assert.equal(smtp.attempts, before);
      const rows = [];
      for (let i = 0; i < 29; i++) rows.push(await db.transaction(c => service.beginEmailChallenge(c, { email: i % 2 ? alice : bob, requestKey: crypto.randomUUID() })));
      for (const item of rows) {
        const result = await capacity.reserveManagedAuthSend({ ...opts, to: item.challenge.email, correlationId: item.challenge.id, idempotencyKey: `AUTH_CODE:${item.challenge.id}` }); assert.equal(result.admitted, true);
      }
      const over = await db.transaction(c => service.beginEmailChallenge(c, { email: bob, requestKey: crypto.randomUUID() }));
      const blocked = await capacity.reserveManagedAuthSend({ ...opts, to: bob, correlationId: over.challenge.id, idempotencyKey: `AUTH_CODE:${over.challenge.id}` }); assert.equal(blocked.admitted, false); assert.equal(blocked.kind, 'rate_limited');
      assert.equal((await db.query('SELECT COUNT(*)::integer AS n FROM auth_email_challenges WHERE smtp_reserved_at IS NOT NULL')).rows[0].n, 30);
    });
    await test('resend-disabled', 'Resend remains unregistered even with a fictional key', async () => {
      const providers = require('/app/lib/email/providers/index.ts');
      const prior = process.env.EMAIL_PROVIDER; process.env.EMAIL_PROVIDER = 'resend'; process.env.RESEND_API_KEY = 'fictional-must-not-be-used';
      try { assert.throws(() => providers.getEmailProvider()); }
      finally { process.env.EMAIL_PROVIDER = prior; delete process.env.RESEND_API_KEY; }
    });
  } finally {
    const acceptance = { schema: 'soullab.auth-return-01.handler-acceptance.v1', postgres_version_num: 160013,
      fictional_addresses: [alice, bob], migrations: migrationHashes,
      production_source_sha256: Object.fromEntries(Object.entries(loadedSource).sort(([a], [b]) => a.localeCompare(b))),
      runtime_dependencies: runtimeDependencies,
      passed: results.filter(r => r.result === 'PASS').length, failed: results.filter(r => r.result === 'FAIL').length,
      tests: results, framework_adapter: 'AsyncLocalStorage cookies/headers + HTTP handler dispatch; no DB/session/proof mocks',
      fault_injection: ['temporary PostgreSQL BEFORE INSERT triggers', 'one labelled response-cookie serialization exception'],
      smtp: 'local TLS SMTP protocol server; normal acceptance/refusal/lost-response control',
    };
    fs.writeFileSync('/fixture/acceptance.json', JSON.stringify(acceptance, null, 2) + '\n', { mode: 0o600 });
    for (const socket of smtp.sockets) socket.destroy();
    await new Promise(resolve => mailServer.close(resolve));
    app.closeAllConnections(); await new Promise(resolve => app.close(resolve));
    await db.closePool();
    process.exitCode = acceptance.failed === 0 && acceptance.passed > 0 ? 0 : 1;
  }
}

try { if (process.argv.includes('--inside')) await inside(); else await outside(); }
catch (error) { console.error(JSON.stringify({ fatal: error.name, message: error.message })); process.exitCode = 1; }
