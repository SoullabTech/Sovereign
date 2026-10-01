import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const dataSource = fs.readFileSync(new URL('../src/field-library-data.js', import.meta.url), 'utf8');
const rendererSource = fs.readFileSync(new URL('../src/renderer.js', import.meta.url), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(dataSource, sandbox);

test('access authority is a generated witness, not a second authority store', () => {
  const a = sandbox.window.KELLY_FIELD_LIBRARY.accessAuthority;
  assert.equal(a.kind, 'kellys_world_access_authority_v1');
  assert.equal(a.authority, 'members.tester');
  assert.equal(a.subscription_gates_ordinary_platform, false);
  assert.equal(a.early_field_separate, true);
  assert.equal(a.beta_testers, 7);
  assert.equal(a.password_capable, 7);
  assert.equal(a.email_code_capable, 6);
  assert.equal(a.early_field, 4);
  assert.equal(a.witnessed_running_commit, '56d0cd679');
  assert.equal(a.projection_law, 'WITNESS_IS_NOT_AUTHORITY');
  assert.match(a.record_path, /KELLYS-WORLD-ACCESS-AUTHORITY-01_2026-10-01\.md$/);
});

test('System names the authority boundary and refuses to invent a missing witness', () => {
  assert.match(rendererSource, /Member access boundary/);
  assert.match(rendererSource, /Witness is not authority/);
  assert.match(rendererSource, /does not infer one/);
  assert.match(rendererSource, /renderAccessAuthority\(\)/);
});
