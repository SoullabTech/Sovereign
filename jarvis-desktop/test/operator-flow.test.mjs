import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const OF = require(path.join(ROOT, 'src', 'operator-flow.js'));

const intent = 'Review the current voice continuity repair and tell me what still needs evidence.';

test('local posture builds the existing bounded C1 task shape', () => {
  const out = OF.buildTask({ intent, posture: OF.LOCAL });
  assert.equal(out.ok, true);
  assert.equal(out.task.bounded_for_local, true);
  assert.equal(out.task.input_chars, intent.length);
  assert.equal(out.task.prompt, intent);
  assert.equal(out.task.operator_posture, 'local');
  assert.equal('external_ok' in out.task, false);
});

test('local posture refuses oversize instead of escalating to frontier', () => {
  const out = OF.buildTask({ intent: 'x'.repeat(OF.LOCAL_MAX_CHARS + 1), posture: OF.LOCAL });
  assert.equal(out.ok, false);
  assert.match(out.errors.join(' '), /Narrow this request rather than silently escalating/i);
});

test('frontier posture routes text without granting external execution implicitly', () => {
  const held = OF.buildTask({ intent, posture: OF.FRONTIER, externalOk: false });
  assert.equal(held.ok, true);
  assert.equal(held.task.description, intent);
  assert.equal(held.task.external_ok, false);
  assert.equal(held.task.operator_posture, 'frontier');

  const approved = OF.buildTask({ intent, posture: OF.FRONTIER, externalOk: true });
  assert.equal(approved.task.external_ok, true);
});

test('empty intent is refused before routing', () => {
  const out = OF.buildTask({ intent: '   ', posture: OF.LOCAL });
  assert.equal(out.ok, false);
  assert.match(out.errors.join(' '), /what you want to happen/i);
});

test('founder-facing plan names privacy and execution truthfully', () => {
  const local = OF.plan({ posture: OF.LOCAL });
  assert.match(local.privacy, /No external model call/i);
  const frontier = OF.plan({ posture: OF.FRONTIER, externalOk: false });
  assert.match(frontier.execution, /remains held/i);
  assert.match(frontier.privacy, /No repository, continuity, member data/i);
});

test('Work UI makes intent primary and preserves old lane controls as Advanced', () => {
  const renderer = fs.readFileSync(path.join(ROOT, 'src', 'renderer.js'), 'utf8');
  const html = fs.readFileSync(path.join(ROOT, 'src', 'index.html'), 'utf8');
  assert.match(renderer, /Run through JARVIS/);
  assert.match(renderer, /Keep this local/);
  assert.match(renderer, /Frontier reasoning/);
  assert.match(renderer, /Advanced tools and lane controls/);
  assert.match(renderer, /C0 — deterministic capability/);
  assert.match(renderer, /OF\.buildTask/);
  assert.ok(html.indexOf('operator-flow.js') < html.indexOf('renderer.js'));
});
