/**
 * PRO-STUDIO-01 / SEC-01 — original-source negative control.
 *
 * Executes a transpiled, pinned ORIGINAL route inside a fake module environment.
 * All database returns and inputs are fictional, and no remote service is called.
 * This is NOT a live exploit test or a claim that middleware can be bypassed.
 */
'use strict';

const assert = require('node:assert/strict');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const ts = require('typescript');

const PIN = '663829d95ce586b01fe5fcb51e28a8ff00a86e3a';
const REPO = '/Users/soullab/pro-studio-review-663829d-20261012';
const original = execFileSync('git', ['-C', REPO, 'show', PIN + ':app/api/studio/settings/route.ts'], { encoding: 'utf8' });

const calls = [];
const fakeQuery = async (sql, params) => {
  calls.push({ sql, params });
  if (sql.includes('SELECT')) return { rows: [{ key: 'descript_api_token', value: 'FICTIONAL_FIXTURE_NOT_A_SECRET' }] };
  return { rows: [] };
};
const moduleStub = { exports: {} };
const fakeRequire = (id) => {
  if (id === 'next/server') return {
    NextResponse: { json: (body, opts) => ({ status: opts?.status ?? 200, json: async () => body }) },
  };
  if (id === '@/lib/db/postgres') return { query: fakeQuery };
  throw new Error('Unexpected dependency: ' + id);
};
const compiled = ts.transpileModule(original, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText;
vm.runInNewContext(compiled, {
  require: fakeRequire, module: moduleStub, exports: moduleStub.exports,
  console: { error: () => {} }, URL,
}, { filename: 'PINNED_ORIGINAL_STUDIO_SETTINGS_ROUTE', timeout: 5000 });

(async () => {
  const route = moduleStub.exports;
  const get = await route.GET({ url: 'https://fictional.local/api/studio/settings?key=descript_api_token' });
  assert.equal(get.status, 200);
  const readBody = await get.json();
  assert.equal(readBody.value, 'FICTIONAL_FIXTURE_NOT_A_SECRET');
  assert(calls[0].sql.includes('FROM studio_settings'));

  const post = await route.POST({ json: async () => ({ key: 'descript_api_token', value: 'FICTIONAL_REPLACEMENT' }) });
  assert.equal(post.status, 200);
  assert.equal((await post.json()).success, true);
  assert(calls[1].sql.includes('INSERT INTO studio_settings'));
  assert.equal(calls[1].params[0], 'descript_api_token');

  process.stdout.write('PASS: pinned original GET returns mocked named secret; POST accepts arbitrary global key; no handler-level practitioner check.\\n');
  process.stdout.write('SCOPE: fictional in-memory dependency only; no real session, secret, network, production or database touched.\\n');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
